from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import os
import json
from datetime import datetime

router = APIRouter()

class StandupRequest(BaseModel):
    messages: list
    events: list
    userContext: dict = None  # New: user profile context

class EmailAnalysisRequest(BaseModel):
    messages: list

class EmailResponseRequest(BaseModel):
    email: dict
    user_context: str = ""

@router.post("/standup")
async def generate_standup(request: StandupRequest):
    """Generate daily stand-up using Claude (Aimy)"""
    try:
        # Check for API key
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
        
        client = anthropic.Anthropic(api_key=api_key)
        
        # Build user context if available
        user_context_text = ""
        if request.userContext:
            role = request.userContext.get('role', '')
            priorities = request.userContext.get('priorities', [])
            comm_style = request.userContext.get('communicationStyle', '')
            
            user_context_text = f"""
User Profile:
- Role: {role}
- Top Priorities: {', '.join(priorities) if priorities else 'Not specified'}
- Communication Preference: {format_comm_style(comm_style)}
"""
        
        # Build context from messages and events
        context = f"""
You are Aimy, the user's calm and competent AI teammate, helping them plan their day as a member of their operations team.
{user_context_text}

Today's Gmail messages ({len(request.messages)} total):
{format_messages(request.messages)}

Today's Calendar events ({len(request.events)} scheduled):
{format_events(request.events)}

Generate a concise daily stand-up with:
1. "The One Thing" - most important focus for today (prioritize based on user's top priorities if known)
2. 3-5 key decisions/approvals needed (with confidence scores)
3. What you'll handle autonomously
4. Brief digest of what's already taken care of

Be warm, competent, and protective of their creative flow. You're their teammate, not just an assistant.
{f"Match your tone to their preference: {format_comm_style(request.userContext.get('communicationStyle', ''))}." if request.userContext and request.userContext.get('communicationStyle') else ""}
Keep the response concise and actionable.
"""
        
        message = client.messages.create(
            model="claude-3-haiku-20240307",
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

@router.post("/analyze-emails")
async def analyze_emails(request: EmailAnalysisRequest):
    """Analyze emails to identify important ones requiring action/response"""
    try:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
        
        client = anthropic.Anthropic(api_key=api_key)
        
        # Build context for email analysis
        emails_list = "\n\n".join([
            f"Email {i+1} (ID: {m.get('id', 'unknown')}):\n"
            f"From: {m.get('from', 'Unknown')}\n"
            f"Subject: {m.get('subject', 'No subject')}\n"
            f"Snippet: {m.get('snippet', 'No preview')}\n"
            f"Unread: {m.get('unread', False)}\n"
            f"Already Starred: {m.get('isStarred', False)}\n"
            f"Gmail Important: {m.get('isImportant', False)}\n"
            f"Category: {'Primary (from contact)' if m.get('isPrimary', False) else 'Promotional' if m.get('isPromotional', False) else 'Social' if m.get('isSocial', False) else 'Other'}"
            for i, m in enumerate(request.messages)
        ])
        
        context = f"""
You are Aimy, the user's intelligent email teammate. Analyze these emails and identify which ones are IMPORTANT and require action or response.

**PRIORITIZATION RULES:**
1. ALWAYS mark emails as important if they have "Already Starred: True" or "Gmail Important: True" - these are user-designated priorities
2. ALWAYS prioritize "Primary (from contact)" emails over promotional/social - these are from real people
3. Emails from individuals (not companies/brands) are typically more important
4. Promotional emails, newsletters, automated notifications are usually NOT important unless specifically work-related

Emails to analyze:
{emails_list}

For each email, determine:
1. Is it important? (Starred/Gmail Important emails = YES, Real people = likely YES, Promotions = usually NO)
2. Does it require a response or action?
3. Priority level (High, Medium, Low)
4. Reason for importance
5. Suggested action (Reply, Review, Schedule meeting, etc.)

Return your analysis as a JSON array with this structure:
[
  {{
    "emailId": "the email ID from above",
    "emailIndex": 0,
    "important": true/false,
    "priority": "High/Medium/Low",
    "requiresAction": true/false,
    "actionType": "Reply/Review/Schedule/Archive",
    "reason": "Brief explanation",
    "urgency": "Today/This Week/When Possible"
  }}
]

IMPORTANT: Include the emailId field with the exact ID shown in parentheses for each email.
"""
        
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=3000,
            messages=[{"role": "user", "content": context}]
        )
        
        analysis_text = message.content[0].text if message.content else "[]"
        
        # Extract JSON from response (handle code blocks)
        import json
        import re
        json_match = re.search(r'\[.*\]', analysis_text, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
        else:
            analysis = []
        
        return {
            "analysis": analysis,
            "totalAnalyzed": len(request.messages),
            "importantCount": sum(1 for a in analysis if a.get('important', False))
        }
    
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Email Analysis Error: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-response")
async def generate_email_response(request: EmailResponseRequest):
    """Generate a draft response for an important email"""
    try:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
        
        client = anthropic.Anthropic(api_key=api_key)
        
        email = request.email
        context = f"""
You are Aimy, helping draft a professional email response.

Original Email:
From: {email.get('from', 'Unknown')}
Subject: {email.get('subject', 'No subject')}
Content: {email.get('snippet', 'No content available')}

{f"Additional Context: {request.user_context}" if request.user_context else ""}

Draft a professional, concise response that:
1. Acknowledges the email
2. Addresses the main points
3. Is warm but professional
4. Ends with a clear call-to-action if needed

Keep it brief and actionable. Write from a first-person perspective.
"""
        
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=[{"role": "user", "content": context}]
        )
        
        response_text = message.content[0].text if message.content else ""
        
        return {
            "draftResponse": response_text,
            "subject": f"Re: {email.get('subject', 'No subject')}",
            "originalEmail": email
        }
    
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Response Generation Error: {error_detail}")
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

def format_comm_style(style):
    """Format communication style preference"""
    styles = {
        'concise_direct': 'concise and direct',
        'warm_friendly': 'warm and friendly',
        'formal_professional': 'formal and professional',
        'casual_conversational': 'casual and conversational'
    }
    return styles.get(style, 'natural and professional')


# ========== PROJECT PLANNING ENDPOINTS ==========

class ProjectPlanRequest(BaseModel):
    """Request for AI project plan generation"""
    description: str

class Goal(BaseModel):
    """Project goal/task"""
    goal: str
    deadline: Optional[str] = None
    status: str = "not_started"

class ProjectPlanResponse(BaseModel):
    """AI-generated project plan"""
    enhanced_description: str
    timeline: str
    goals: List[Goal]
    success_metrics: str
    recommended_priority: str

@router.post("/generate-project-plan", response_model=ProjectPlanResponse)
async def generate_project_plan(request: ProjectPlanRequest):
    """
    Use Claude to generate a comprehensive project plan based on a brief description.
    
    This endpoint:
    1. Takes a minimal project description
    2. Enhances it with AI insights
    3. Suggests timeline and milestones
    4. Generates specific, actionable goals
    5. Defines success metrics
    6. Recommends priority level
    """
    try:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
            
        client = anthropic.Anthropic(api_key=api_key)
        
        prompt = f"""You are Aimy, an AI strategic partner helping someone plan their project.

TODAY'S DATE: {datetime.now().strftime('%Y-%m-%d')}

Project Description (provided by user):
"{request.description}"

Based on this description, help plan the project by providing:

1. **Enhanced Description**: Expand and refine the description (2-3 sentences)
2. **Timeline**: Suggest a realistic timeframe (e.g., "2-3 weeks", "1-2 months")
3. **Goals**: Generate 3-5 specific, actionable goals/tasks with ACTUAL deadline dates
4. **Success Metrics**: How will we know this project succeeded?
5. **Priority**: Recommend priority level (low/medium/high/critical)

Provide your response in this EXACT JSON format:
{{
    "enhanced_description": "Clear, comprehensive 2-3 sentence description",
    "timeline": "Suggested timeframe",
    "goals": [
        {{
            "goal": "Specific, actionable task",
            "deadline": "YYYY-MM-DD (actual date, not relative like 'Week 1')",
            "status": "not_started"
        }}
    ],
    "success_metrics": "How to measure success",
    "recommended_priority": "low|medium|high|critical"
}}

IMPORTANT for deadlines:
- Use ACTUAL dates in YYYY-MM-DD format (e.g., "2025-11-01", "2025-11-15")
- Calculate dates from today: {datetime.now().strftime('%Y-%m-%d')}
- Space goals realistically (1-2 weeks apart for most tasks)
- Consider realistic timelines for creative/professional work

Guidelines:
- Be specific and actionable
- Make goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Be encouraging and supportive in tone
- Prioritize based on urgency keywords and project scope"""

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        # Parse Claude's response
        response_text = response.content[0].text
        
        # Extract JSON from response (Claude might wrap it in markdown)
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0]
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0]
        
        plan_data = json.loads(response_text.strip())
        
        return ProjectPlanResponse(**plan_data)
        
    except Exception as e:
        print(f"Error generating project plan: {e}")
        # Return a helpful fallback
        return ProjectPlanResponse(
            enhanced_description=request.description,
            timeline="2-4 weeks",
            goals=[
                Goal(goal="Define project scope and requirements", deadline="Week 1", status="not_started"),
                Goal(goal="Create initial plan and timeline", deadline="Week 1", status="not_started"),
                Goal(goal="Execute main project work", deadline="Week 2-3", status="not_started"),
                Goal(goal="Review, refine, and finalize", deadline="Week 4", status="not_started")
            ],
            success_metrics="Project completed on time with all requirements met",
            recommended_priority="medium"
        )


# New endpoint for generating dates for existing goals
class GoalDatesRequest(BaseModel):
    projectName: str
    projectDescription: str
    goals: List[str]

class GoalWithDate(BaseModel):
    goal: str
    deadline: str

class GoalDatesResponse(BaseModel):
    goals: List[GoalWithDate]

@router.post("/generate-goal-dates", response_model=GoalDatesResponse)
async def generate_goal_dates(request: GoalDatesRequest):
    """
    Use AI to suggest realistic deadlines for existing project goals
    """
    try:
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        goals_list = "\n".join([f"{i+1}. {goal}" for i, goal in enumerate(request.goals)])
        
        prompt = f"""You are Aimy, helping schedule realistic deadlines for project goals.

TODAY'S DATE: {current_date}

Project: {request.projectName}
Description: {request.projectDescription}

Goals to schedule:
{goals_list}

Based on the project context and realistic timelines, suggest a deadline for each goal.

Provide your response in this EXACT JSON format:
{{
    "goals": [
        {{
            "goal": "Goal text exactly as provided",
            "deadline": "YYYY-MM-DD"
        }}
    ]
}}

IMPORTANT:
- Use ACTUAL calendar dates in YYYY-MM-DD format (e.g., "2025-11-01", "2025-11-15")
- Start from today: {current_date}
- Space goals 1-2 weeks apart for most tasks
- Consider realistic timelines for the work involved
- Return goals in the same order as provided"""

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        response_text = response.content[0].text
        
        # Clean up response if it's wrapped in code blocks
        if "```json" in response_text:
            response_text = response_text.split('```json')[1].split('```')[0]
        elif "```" in response_text:
            response_text = response_text.split('```')[1].split('```')[0]
        
        dates_data = json.loads(response_text.strip())
        
        return GoalDatesResponse(goals=[
            GoalWithDate(goal=g["goal"], deadline=g["deadline"])
            for g in dates_data["goals"]
        ])
        
    except Exception as e:
        print(f"Error generating goal dates: {e}")
        # Return goals with dates spaced 1 week apart as fallback
        from datetime import timedelta
        goals_with_dates = []
        current = datetime.now()
        for i, goal in enumerate(request.goals):
            deadline = (current + timedelta(weeks=i+1)).strftime('%Y-%m-%d')
            goals_with_dates.append(GoalWithDate(goal=goal, deadline=deadline))
        return GoalDatesResponse(goals=goals_with_dates)
