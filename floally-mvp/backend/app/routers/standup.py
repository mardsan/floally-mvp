from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import anthropic
import os

from app.routers.auth import get_current_user
from app.database import get_db

router = APIRouter()

class StandupAnalysis(BaseModel):
    """The AI-generated standup analysis"""
    the_one_thing: Dict[str, Any]  # Main focus item
    secondary_priorities: List[Dict[str, Any]]  # Other important items
    aimy_handling: List[Dict[str, Any]]  # What Aimy is managing
    daily_plan: List[Dict[str, Any]]  # Suggested timeline
    reasoning: str  # Why Aimy chose this focus

class StandupAnalyzeRequest(BaseModel):
    """Request body for standup analysis"""
    user_email: str

class EmailContext(BaseModel):
    """Email data for analysis"""
    id: str
    subject: str
    sender: str
    snippet: str
    timestamp: str
    labels: List[str]
    thread_id: str

def analyze_email_urgency(email: Dict[str, Any]) -> int:
    """
    Calculate urgency score (0-100) based on email characteristics.
    
    Factors:
    - Keywords (urgent, asap, deadline, etc.)
    - Recency
    - Sender importance (based on frequency)
    - Thread length
    """
    score = 0
    
    # Keyword analysis
    urgent_keywords = ['urgent', 'asap', 'deadline', 'today', 'immediately', 'critical']
    subject = email.get('subject', '').lower()
    snippet = email.get('snippet', '').lower()
    
    for keyword in urgent_keywords:
        if keyword in subject:
            score += 20
        if keyword in snippet:
            score += 10
    
    # Recency (more recent = more urgent)
    try:
        timestamp = datetime.fromisoformat(email.get('timestamp', '').replace('Z', '+00:00'))
        hours_ago = (datetime.now().astimezone() - timestamp).total_seconds() / 3600
        if hours_ago < 24:
            score += 20
        elif hours_ago < 72:
            score += 10
    except:
        pass
    
    # Response expected
    if any(word in subject + snippet for word in ['?', 'please respond', 'let me know', 'thoughts']):
        score += 15
    
    return min(score, 100)

def categorize_email(email: Dict[str, Any]) -> str:
    """
    Categorize email into project/context buckets.
    
    Returns: project_name or "general"
    """
    # Simple keyword-based categorization (will be enhanced with user-defined projects)
    subject = email.get('subject', '').lower()
    
    if any(word in subject for word in ['proposal', 'pitch', 'presentation']):
        return 'proposals'
    elif any(word in subject for word in ['meeting', 'schedule', 'calendar']):
        return 'meetings'
    elif any(word in subject for word in ['review', 'feedback', 'approval']):
        return 'approvals'
    elif any(word in subject for word in ['invoice', 'payment', 'billing']):
        return 'finance'
    else:
        return 'general'

@router.get("/standup/generate")
async def generate_standup(user_email: str, db: Session = Depends(get_db)):
    """
    Generate intelligent standup recommendations (GET version for simple calls).
    Uses user's active projects to provide personalized recommendations.
    """
    try:
        from app.models.user import Project
        
        # Fetch user's active projects
        projects = db.query(Project).join(
            Project.user
        ).filter(
            Project.user.has(email=user_email),
            Project.status.in_(['active', 'planning'])
        ).order_by(
            Project.is_primary.desc(),
            Project.priority.desc()
        ).limit(5).all()
        
        if projects:
            # Generate standup based on projects
            primary_project = next((p for p in projects if p.is_primary), projects[0] if projects else None)
            
            if primary_project:
                # Find the most urgent goal with a deadline
                urgent_goal = None
                if primary_project.goals:
                    for goal_obj in primary_project.goals:
                        if goal_obj.get('deadline') and goal_obj.get('status') != 'completed':
                            urgent_goal = goal_obj
                            break
                
                return {
                    'the_one_thing': {
                        'title': f"Advance {primary_project.name}",
                        'description': primary_project.description or f"Your primary project is {primary_project.name}. Focus on making meaningful progress today.",
                        'urgency': 85 if primary_project.priority == 'critical' else 70,
                        'project': primary_project.name,
                        'action': urgent_goal.get('goal') if urgent_goal else 'Review project goals and identify next steps'
                    },
                    'secondary_priorities': [
                        {
                            'title': p.name,
                            'urgency': 70 if p.priority == 'high' else 50,
                            'action': f"Review and plan next steps"
                        }
                        for p in projects[1:3]  # Next 2 projects
                    ],
                    'aimy_handling': [
                        {'task': 'Monitoring project deadlines', 'status': 'monitoring', 'emails': []},
                        {'task': 'Tracking goal progress', 'status': 'monitoring', 'emails': []}
                    ],
                    'daily_plan': [
                        {'time': 'Morning', 'task': f'Deep work on {primary_project.name}', 'duration': '3 hours'},
                        {'time': 'Midday', 'task': 'Review emails and respond to urgent items', 'duration': '30 min'},
                        {'time': 'Afternoon', 'task': 'Progress check and planning for tomorrow', 'duration': '1 hour'}
                    ],
                    'reasoning': f'Your primary project "{primary_project.name}" is marked as {primary_project.priority} priority. Focusing your morning energy on this will create the most impact.'
                }
        
        # No projects - provide general guidance
        return {
            'the_one_thing': {
                'title': 'Set up your first project',
                'description': 'Start by creating a project to help Aimy understand your priorities and provide personalized recommendations.',
                'urgency': 60,
                'project': 'onboarding',
                'action': 'Click "New Project" to get started'
            },
            'secondary_priorities': [
                {'title': 'Explore your dashboard', 'urgency': 30, 'action': 'Familiarize yourself with OkAimy features'},
                {'title': 'Connect your calendar', 'urgency': 40, 'action': 'Sync calendar for better planning'}
            ],
            'aimy_handling': [
                {'task': 'Ready to help you organize', 'status': 'monitoring', 'emails': []}
            ],
            'daily_plan': [
                {'time': 'Now', 'task': 'Create your first project', 'duration': '10 min'},
                {'time': 'Today', 'task': 'Set your goals and priorities', 'duration': '20 min'},
                {'time': 'This week', 'task': 'Build your workflow with Aimy', 'duration': 'Ongoing'}
            ],
            'reasoning': 'Let\'s start by setting up your first project! This helps me understand what matters most to you and provide personalized daily guidance.'
        }
        
    except Exception as e:
        print(f"Error generating standup: {e}")
        # Fallback response
        return {
            'the_one_thing': {
                'title': 'Focus on your creative work',
                'description': 'Your inbox is clear! Time to focus on your most important project.',
                'urgency': 80,
                'project': 'personal',
                'action': 'Block 2-3 hours for deep work'
            },
            'secondary_priorities': [
                {'title': 'Review pending emails', 'urgency': 40, 'action': 'Quick scan for urgent items'},
                {'title': 'Plan tomorrow', 'urgency': 30, 'action': 'Set intentions for next day'}
            ],
            'aimy_handling': [
                {'task': 'Monitoring inbox for urgent items', 'status': 'monitoring', 'emails': []}
            ],
            'daily_plan': [
                {'time': 'Morning', 'task': 'Deep creative work', 'duration': '3 hours'},
                {'time': 'Midday', 'task': 'Respond to important emails', 'duration': '30 min'},
                {'time': 'Afternoon', 'task': 'Meetings and collaboration', 'duration': '2 hours'},
                {'time': 'Evening', 'task': 'Plan tomorrow', 'duration': '15 min'}
            ],
            'reasoning': 'Starting with a simple daily structure. As I learn your patterns, I\'ll provide more personalized recommendations.'
        }

@router.post("/standup/analyze")
async def analyze_standup(request: StandupAnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyze user's current situation and generate intelligent standup recommendations.
    
    This endpoint:
    1. Fetches recent emails (last 3 days)
    2. Analyzes urgency, importance, and context
    3. Uses Claude to determine "The One Thing"
    4. Identifies secondary priorities
    5. Suggests what Aimy should handle
    6. Creates a daily plan
    
    Returns: StandupAnalysis object
    """
    try:
        print(f"🔍 Starting standup analysis for user: {request.user_email}")
        
        # Import gmail service from utils
        from app.utils.google_auth import get_gmail_service
        
        # Get user's Gmail service (not async, don't await)
        print(f"📧 Getting Gmail service...")
        try:
            service = get_gmail_service(request.user_email, db)
            print(f"✅ Gmail service obtained successfully")
        except Exception as gmail_auth_error:
            print(f"❌ Failed to get Gmail service:")
            print(f"   Type: {type(gmail_auth_error).__name__}")
            print(f"   Message: {str(gmail_auth_error)}")
            raise  # Re-raise to be caught by outer exception handler
        
        # Fetch recent emails (last 3 days, inbox only)
        three_days_ago = (datetime.now() - timedelta(days=3)).strftime('%Y/%m/%d')
        query = f'in:inbox after:{three_days_ago}'
        
        print(f"📨 Fetching emails with query: {query}")
        try:
            results = service.users().messages().list(
                userId='me',
                q=query,
                maxResults=50
            ).execute()
            print(f"✅ Email list fetched: {len(results.get('messages', []))} messages")
        except Exception as gmail_api_error:
            print(f"❌ Gmail API call failed:")
            print(f"   Type: {type(gmail_api_error).__name__}")
            print(f"   Message: {str(gmail_api_error)}")
            import traceback
            print(f"   Traceback:\n{traceback.format_exc()}")
            raise  # Re-raise to be caught by outer exception handler
        
        messages = results.get('messages', [])
        
        if not messages:
            # No recent emails - return empty standup
            return {
                'the_one_thing': {
                    'title': 'Check in with Aimy',
                    'description': 'Your inbox is clear! Time to focus on your creative work.',
                    'urgency': 0,
                    'project': 'personal',
                    'action': 'Enjoy the clarity'
                },
                'secondary_priorities': [],
                'aimy_handling': [],
                'daily_plan': [
                    {'time': 'Morning', 'task': 'Creative work time', 'duration': '3 hours'},
                    {'time': 'Afternoon', 'task': 'Review any new emails', 'duration': '30 min'}
                ],
                'reasoning': 'You have a clear inbox! This is the perfect time to focus on deep creative work.'
            }
        
        # Fetch full details for each email
        emails = []
        for msg in messages[:20]:  # Limit to 20 most recent
            try:
                full_msg = service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='full'
                ).execute()
                
                # Extract relevant fields
                headers = {h['name']: h['value'] for h in full_msg['payload']['headers']}
                
                emails.append({
                    'id': full_msg['id'],
                    'thread_id': full_msg['threadId'],
                    'subject': headers.get('Subject', ''),
                    'sender': headers.get('From', ''),
                    'timestamp': headers.get('Date', ''),
                    'snippet': full_msg.get('snippet', ''),
                    'labels': full_msg.get('labelIds', []),
                    'urgency': 0,  # Will be calculated
                    'category': 'general'
                })
            except:
                continue
        
        # Calculate urgency and categorize
        for email in emails:
            email['urgency'] = analyze_email_urgency(email)
            email['category'] = categorize_email(email)
        
        # Sort by urgency
        emails.sort(key=lambda x: x['urgency'], reverse=True)
        
        # Use Claude to analyze and determine "The One Thing"
        client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        
        # Create context for Claude
        email_context = "\n\n".join([
            f"Email {i+1}:\n"
            f"From: {e['sender']}\n"
            f"Subject: {e['subject']}\n"
            f"Preview: {e['snippet']}\n"
            f"Urgency Score: {e['urgency']}/100\n"
            f"Category: {e['category']}"
            for i, e in enumerate(emails[:10])
        ])
        
        prompt = f"""You are Aimy, an AI partner helping a creative professional stay focused.

Analyze these recent emails and determine "The One Thing" they should focus on today:

{email_context}

Provide your analysis in this EXACT JSON format:
{{
    "the_one_thing": {{
        "title": "Brief, actionable title",
        "description": "2-3 sentence explanation of why this matters",
        "urgency": 0-100,
        "project": "category name",
        "action": "Specific next step",
        "related_emails": ["Email 1", "Email 2"]
    }},
    "secondary_priorities": [
        {{
            "title": "Title",
            "urgency": 0-100,
            "action": "Next step"
        }}
    ],
    "aimy_handling": [
        {{
            "task": "What Aimy will handle",
            "status": "monitoring/drafting/scheduling",
            "emails": ["Email X"]
        }}
    ],
    "daily_plan": [
        {{
            "time": "Morning/Afternoon/Evening",
            "task": "What to do",
            "duration": "estimated time"
        }}
    ],
    "reasoning": "Brief explanation of why you chose this focus"
}}

Guidelines:
- Choose ONE clear focus that has the most impact
- Consider urgency, importance, and creative flow
- Suggest 2-3 secondary priorities (things that also matter but not urgent)
- Identify what Aimy can handle (follow-ups, scheduling, monitoring)
- Create a realistic daily plan
- Be supportive and encouraging in tone"""

        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        # Parse Claude's response
        import json
        analysis_text = response.content[0].text
        
        # Extract JSON from response (Claude might wrap it in markdown)
        if '```json' in analysis_text:
            analysis_text = analysis_text.split('```json')[1].split('```')[0]
        elif '```' in analysis_text:
            analysis_text = analysis_text.split('```')[1].split('```')[0]
        
        analysis = json.loads(analysis_text.strip())
        
        return analysis
        
    except Exception as e:
        # If analysis fails, return a helpful default with detailed error logging
        import traceback
        error_type = type(e).__name__
        error_msg = str(e)
        error_trace = traceback.format_exc()
        
        print(f"❌ Standup analysis error:")
        print(f"   Type: {error_type}")
        print(f"   Message: {error_msg}")
        print(f"   Traceback:\n{error_trace}")
        
        return {
            'the_one_thing': {
                'title': 'Review your inbox with Aimy',
                'description': 'Let\'s go through your emails together and identify what matters most.',
                'urgency': 50,
                'project': 'general',
                'action': 'Open your inbox and let Aimy help prioritize'
            },
            'secondary_priorities': [],
            'aimy_handling': [],
            'daily_plan': [
                {'time': 'Morning', 'task': 'Review inbox with Aimy', 'duration': '15 min'},
                {'time': 'Morning', 'task': 'Focus on priority work', 'duration': '2-3 hours'},
                {'time': 'Afternoon', 'task': 'Handle follow-ups', 'duration': '30 min'}
            ],
            'reasoning': f'I had trouble analyzing your emails ({error_type}: {error_msg}), but let\'s review them together to find your focus.'
        }

@router.get("/standup/status")
async def get_standup_status(user_email: str = Depends(get_current_user)):
    """
    Get current status of user's standup items.
    
    Returns:
    - Current focus status
    - Completed items today
    - Items needing attention
    """
    # TODO: Implement status tracking (will store in database later)
    return {
        'current_focus': 'Finalize brand proposal',
        'status': 'in_progress',
        'started_at': datetime.now().isoformat(),
        'completed_today': [],
        'needs_attention': []
    }
