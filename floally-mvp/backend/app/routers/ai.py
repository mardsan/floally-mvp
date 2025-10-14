from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import anthropic
import os

router = APIRouter()

class StandupRequest(BaseModel):
    messages: list
    events: list

@router.post("/standup")
async def generate_standup(request: StandupRequest):
    """Generate daily stand-up using Claude"""
    try:
        # Check for API key
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
        
        client = anthropic.Anthropic(api_key=api_key)
        
        # Get model from environment or use default
        model_name = os.getenv("MODEL_NAME", "claude-3-opus-20240229")
        
        # Build context from messages and events
        context = f"""
You are Op, a calm and competent AI assistant helping a creative professional plan their day.

Today's Gmail messages ({len(request.messages)} total):
{format_messages(request.messages)}

Today's Calendar events ({len(request.events)} scheduled):
{format_events(request.events)}

Generate a concise daily stand-up with:
1. "The One Thing" - most important focus for today
2. 3-5 key decisions/approvals needed (with confidence scores)
3. What you'll handle autonomously
4. Brief digest of what's already taken care of

Be warm, competent, and protective of their creative flow.
Keep the response concise and actionable.
"""
        
        message = client.messages.create(
            model=model_name,
            max_tokens=2000,
            messages=[{"role": "user", "content": context}]
        )
        
        # Extract text from response
        standup_text = message.content[0].text if message.content else "No response generated"
        
        return {
            "standup": standup_text,
            "usage": {
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"AI Standup Error: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

def format_messages(messages):
    """Format messages for Claude"""
    if not messages:
        return "No new messages"
    return "\n".join([
        f"- From {m['from']}: {m['subject']}"
        for m in messages[:10]
    ])

def format_events(events):
    """Format events for Claude"""
    if not events:
        return "No events today"
    formatted = []
    for e in events[:10]:
        start = e.get('start', 'Time unknown')
        summary = e.get('summary', 'No title')
        formatted.append(f"- {start}: {summary}")
    return "\n".join(formatted)
