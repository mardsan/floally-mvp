from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import os
import json
from datetime import datetime, timedelta

router = APIRouter()

class StandupRequest(BaseModel):
    messages: list
    events: list
    userContext: dict = None  # New: user profile context
    enable_autonomous_actions: bool = False  # New: whether to process inbox autonomously first

class EmailAnalysisRequest(BaseModel):
    messages: list

class EmailResponseRequest(BaseModel):
    email: dict
    user_context: str = ""

class SaveMyDayRequest(BaseModel):
    messages: list
    events: list
    userContext: dict

@router.post("/standup")
async def generate_standup(request: StandupRequest):
    """Generate daily stand-up using Claude (Aimi)"""
    try:
        # Check for API key
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
        
        client = anthropic.Anthropic(api_key=api_key)
        
        # Optional: Process autonomous actions FIRST if enabled
        autonomous_actions_summary = None
        if request.enable_autonomous_actions and request.userContext:
            try:
                # This would call the autonomous_actions processor
                # For now, we'll skip this to avoid complexity
                # Future: integrate autonomous_actions.process_inbox_autonomously()
                pass
            except Exception as e:
                print(f"Autonomous actions failed: {e}")
        
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
You are Aimi, the user's calm and competent AI teammate, helping them plan their day as a member of their operations team.
{user_context_text}

Today's Gmail messages ({len(request.messages)} total):
{format_messages(request.messages)}

Today's Calendar events ({len(request.events)} scheduled):
{format_events(request.events)}

Generate a concise daily stand-up with clear AGENCY LABELS to build trust:

1. "The One Thing" - most important focus for today (prioritize based on user's top priorities if known)
2. 3-5 key items WITH HONEST AGENCY LABELS:
   - 🟡 SUGGESTED: "I recommend..." (Aimi's suggestions based on analysis)
   - 🔵 YOUR CALL: "You'll want to decide..." (Needs user decision)
   - 👀 WATCHING: "I'm monitoring..." (Aimi is tracking this)
3. What you're monitoring: "I'm watching... and will alert you if..."
4. Calendar overview: Brief summary of today's meetings

CRITICAL INSTRUCTIONS:
- DO NOT use ✅ HANDLED label - you haven't taken any autonomous actions yet
- DO NOT claim you've "archived", "sent", "replied to", or "handled" anything
- DO NOT say "I've already done X" - you're an analysis tool right now, not an autonomous agent
- BE HONEST: You're providing recommendations and monitoring, not executing actions
- Focus on: What you've NOTICED, what you RECOMMEND, what they should DECIDE

Use these exact prefixes:
- 🟡 SUGGESTED: Your intelligent recommendations based on message analysis
- 🔵 YOUR CALL: Important items that need their personal attention
- 👀 WATCHING: Items you're actively monitoring for changes

Be warm, competent, and protective of their creative flow. You're their teammate providing insights, not making claims about actions you haven't taken.
{f"Match your tone to their preference: {format_comm_style(request.userContext.get('communicationStyle', ''))}." if request.userContext and request.userContext.get('communicationStyle') else ""}
Keep the response concise and actionable. ALWAYS use the agency label prefixes.
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
You are Aimi, the user's intelligent email teammate. Analyze these emails and identify which ones are IMPORTANT and require action or response.

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
You are Aimi, helping draft a professional email response.

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

class SubTask(BaseModel):
    """Sub-task within a goal"""
    task: str
    estimated_hours: Optional[float] = None
    status: str = "not_started"

class Goal(BaseModel):
    """Project goal/task"""
    goal: str
    deadline: Optional[str] = None
    status: str = "not_started"
    sub_tasks: Optional[List[SubTask]] = []

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
        
        prompt = f"""You are Aimi, an AI strategic partner helping someone plan their project.

TODAY'S DATE: {datetime.now().strftime('%Y-%m-%d')}

Project Description (provided by user):
"{request.description}"

Based on this description, help plan the project by providing:

1. **Enhanced Description**: Expand and refine the description (2-3 sentences)
2. **Timeline**: Suggest a realistic timeframe (e.g., "2-3 weeks", "1-2 months")
3. **Goals**: Generate 3-5 specific, actionable goals/tasks with ACTUAL deadline dates
4. **Sub-tasks**: For EACH goal, break it down into 3-5 specific, actionable sub-tasks
5. **Success Metrics**: How will we know this project succeeded?
6. **Priority**: Recommend priority level (low/medium/high/critical)

Provide your response in this EXACT JSON format:
{{
    "enhanced_description": "Clear, comprehensive 2-3 sentence description",
    "timeline": "Suggested timeframe",
    "goals": [
        {{
            "goal": "Specific, actionable goal",
            "deadline": "YYYY-MM-DD (actual date, not relative like 'Week 1')",
            "status": "not_started",
            "sub_tasks": [
                {{
                    "task": "Specific action item that contributes to the goal",
                    "estimated_hours": 2.0,
                    "status": "not_started"
                }}
            ]
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

IMPORTANT for sub-tasks:
- Each goal should have 3-5 practical sub-tasks
- Sub-tasks should be concrete actions (e.g., "Create wireframes", "Write API endpoints", "Research competitors")
- Estimate hours realistically (0.5-8 hours per sub-task)
- Make sub-tasks simple enough that a user can check them off in one sitting
- Think Trello-style simplicity, NOT JIRA complexity
- Focus on WHAT to do, not bureaucratic process

Guidelines:
- Be specific and actionable
- Make goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Be encouraging and supportive in tone
- Prioritize based on urgency keywords and project scope
- Help creative professionals stay organized without overwhelming them"""

        response = client.messages.create(
            model="claude-3-haiku-20240307",
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
        # Return a helpful fallback with sub-tasks
        today = datetime.now()
        return ProjectPlanResponse(
            enhanced_description=request.description,
            timeline="2-4 weeks",
            goals=[
                Goal(
                    goal="Define project scope and requirements", 
                    deadline=(today + timedelta(days=7)).strftime('%Y-%m-%d'), 
                    status="not_started",
                    sub_tasks=[
                        SubTask(task="Identify key stakeholders", estimated_hours=1.0, status="not_started"),
                        SubTask(task="List project requirements", estimated_hours=2.0, status="not_started"),
                        SubTask(task="Define success criteria", estimated_hours=1.0, status="not_started")
                    ]
                ),
                Goal(
                    goal="Create initial plan and timeline", 
                    deadline=(today + timedelta(days=10)).strftime('%Y-%m-%d'), 
                    status="not_started",
                    sub_tasks=[
                        SubTask(task="Break down into milestones", estimated_hours=2.0, status="not_started"),
                        SubTask(task="Estimate time for each phase", estimated_hours=1.5, status="not_started"),
                        SubTask(task="Identify potential risks", estimated_hours=1.0, status="not_started")
                    ]
                ),
                Goal(
                    goal="Execute main project work", 
                    deadline=(today + timedelta(days=21)).strftime('%Y-%m-%d'), 
                    status="not_started",
                    sub_tasks=[
                        SubTask(task="Complete core deliverables", estimated_hours=20.0, status="not_started"),
                        SubTask(task="Regular progress check-ins", estimated_hours=3.0, status="not_started"),
                        SubTask(task="Address blockers as they arise", estimated_hours=5.0, status="not_started")
                    ]
                ),
                Goal(
                    goal="Review, refine, and finalize", 
                    deadline=(today + timedelta(days=28)).strftime('%Y-%m-%d'), 
                    status="not_started",
                    sub_tasks=[
                        SubTask(task="Conduct final review", estimated_hours=3.0, status="not_started"),
                        SubTask(task="Implement feedback and polish", estimated_hours=4.0, status="not_started"),
                        SubTask(task="Prepare final deliverable", estimated_hours=2.0, status="not_started")
                    ]
                )
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
        
        prompt = f"""You are Aimi, helping schedule realistic deadlines for project goals.

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
            model="claude-3-haiku-20240307",
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


@router.post("/save-my-day")
async def save_my_day(request: SaveMyDayRequest):
    """Emergency triage - simplify overwhelming day to top 3 priorities
    
    This is the emotional anchor that makes users feel 'Aimi's got my back'.
    Uses behavior data + calendar + messages to intelligently defer low-priority items.
    """
    try:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            # Fallback to simple triage without AI
            unread_count = sum(1 for m in request.messages if m.get('unread', False))
            return {
                "top_priorities": [
                    {
                        "title": "Review your urgent messages",
                        "reason": f"You have {unread_count} unread messages"
                    },
                    {
                        "title": "Check your calendar",
                        "reason": f"{len(request.events)} events scheduled today"
                    },
                    {
                        "title": "Take a deep breath",
                        "reason": "One thing at a time. You've got this."
                    }
                ],
                "can_wait": [m.get('subject', 'Email') for m in request.messages[3:6]],
                "reassurance": "I'm here to help. Let's tackle these one by one. Everything else can wait."
            }
        
        client = anthropic.Anthropic(api_key=api_key)
        
        # Build triage context
        context = f"""
You are Aimi, the user's trusted AI teammate. They just hit "Save My Day" - they're feeling overwhelmed.

Your job: Be their calm, competent ally and simplify their day to what ACTUALLY matters.

Today's situation:
- {len(request.messages)} messages in inbox
- {len(request.events)} calendar events
- User: {request.userContext.get('displayName', 'User')}

Messages overview:
{format_messages(request.messages[:10])}

Calendar events:
{format_events(request.events)}

TASK: Triage everything into:

1. **TOP 3 PRIORITIES** - What absolutely must be done today:
   - Be specific (reference actual emails/meetings)
   - Explain WHY each matters
   - Focus on impact, not urgency

2. **CAN WAIT** - What can be deferred:
   - 3-5 items that feel urgent but aren't
   - Brief reason why they can wait

3. **REASSURANCE** - Calm, confident message:
   - "I've got your back"
   - Specific action you'll take (monitor X, alert if Y)
   - Confident, warm tone

Return JSON:
{{
  "top_priorities": [
    {{"title": "Specific action", "reason": "Why it matters"}},
    ...3 items total
  ],
  "can_wait": ["Item 1", "Item 2", ...],
  "reassurance": "Warm message with specific commitments"
}}

Remember: You're their teammate saving their day. Be specific, warm, and protective of their focus.
"""
        
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1500,
            messages=[{"role": "user", "content": context}]
        )
        
        response_text = message.content[0].text
        
        # Clean JSON from response
        if "```json" in response_text:
            response_text = response_text.split('```json')[1].split('```')[0]
        elif "```" in response_text:
            response_text = response_text.split('```')[1].split('```')[0]
        
        triage_data = json.loads(response_text.strip())
        
        return triage_data
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error in save-my-day: {e}")
        # Fallback
        return {
            "top_priorities": [
                {
                    "title": "Handle your most important messages",
                    "reason": "Clear your urgent inbox items first"
                },
                {
                    "title": "Prepare for today's meetings",
                    "reason": "Stay on top of your calendar commitments"
                },
                {
                    "title": "Take a mindful break",
                    "reason": "You'll think clearer with a moment of calm"
                }
            ],
            "can_wait": [m.get('subject', 'Email') for m in request.messages[3:6]],
            "reassurance": "I'm monitoring everything. Focus on these three things, and I'll alert you if anything urgent comes up. You've got this. 💙"
        }
    except Exception as e:
        print(f"Error in save-my-day: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

