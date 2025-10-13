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
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
        # Build context from messages and events
        context = f"""
You are Flo, a calm and competent AI assistant helping a creative professional plan their day.

Today's Gmail messages ({len(request.messages)} unread):
{format_messages(request.messages)}

Today's Calendar events ({len(request.events)} scheduled):
{format_events(request.events)}

Generate a concise daily stand-up with:
1. "The One Thing" - most important focus for today
2. 3-5 key decisions/approvals needed (with confidence scores)
3. What you'll handle autonomously
4. Brief digest of what's already taken care of

Be warm, competent, and protective of their creative flow.
Respond in JSON format.
"""
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{"role": "user", "content": context}]
        )
        
        return {
            "standup": message.content[0].text,
            "usage": {
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens
            }
        }
    
    except Exception as e:
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
    return "\n".join([
        f"- {e['start']}: {e['summary']}"
        for e in events[:10]
    ])
