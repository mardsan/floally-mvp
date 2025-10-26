"""
Smart Messages API - AI-powered message curation and management
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import anthropic
import os

from app.database import get_db
from app.models.user import User, BehaviorAction, SenderStats
from app.utils.google_auth import get_gmail_service

router = APIRouter()

# Initialize Anthropic client
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def calculate_sender_importance(user_id: str, sender_email: str, sender_domain: str, db: Session) -> float:
    """Calculate importance score for a sender based on user behavior"""
    stats = db.query(SenderStats).filter(
        SenderStats.user_id == user_id,
        SenderStats.sender_email == sender_email
    ).first()
    
    if not stats or stats.total_emails == 0:
        return 0.5  # Neutral score for unknown senders
    
    # Calculate weighted importance
    important_weight = stats.marked_important * 1.0
    interesting_weight = stats.marked_interesting * 0.6
    responded_weight = stats.responded * 0.8
    negative_weight = (stats.marked_unimportant + stats.trashed + stats.archived) * -0.5
    
    total_interactions = stats.marked_important + stats.marked_interesting + stats.marked_unimportant + stats.responded + stats.archived + stats.trashed
    
    if total_interactions == 0:
        return 0.5
    
    score = (important_weight + interesting_weight + responded_weight + negative_weight) / total_interactions
    
    # Normalize to 0-1 range
    normalized_score = max(0.0, min(1.0, (score + 1) / 2))
    
    return normalized_score


async def ai_analyze_messages(messages: List[Dict], user_context: Dict) -> List[Dict]:
    """Use Claude to analyze and score message importance/relevance"""
    
    if not messages:
        return []
    
    # Prepare context for AI
    message_summaries = []
    for idx, msg in enumerate(messages[:50]):  # Analyze up to 50 messages
        message_summaries.append({
            'index': idx,
            'from': msg.get('from', 'Unknown'),
            'subject': msg.get('subject', 'No Subject'),
            'snippet': msg.get('snippet', '')[:200],  # Limit snippet length
            'category': 'primary' if msg.get('isPrimary') else 'promotional' if msg.get('isPromotional') else 'social' if msg.get('isSocial') else 'other',
            'is_starred': msg.get('isStarred', False),
            'is_important': msg.get('isImportant', False),
            'has_unsubscribe': msg.get('hasUnsubscribeLink', False)
        })
    
    prompt = f"""You are Aimy, an AI assistant helping a user prioritize their inbox. Analyze these messages and score their importance/relevance.

User Context:
- Role: {user_context.get('role', 'Professional')}
- Priorities: {', '.join(user_context.get('priorities', ['Focus', 'Efficiency']))}
- Active Projects: {', '.join(user_context.get('projects', ['General Work']))}

Messages to analyze:
{message_summaries}

For each message, provide:
1. importance_score (0-100): How important/relevant is this message?
2. reason (brief): Why this score?
3. suggested_action: one of [read_now, read_later, archive, unsubscribe]

Respond in JSON format:
{{
  "analyses": [
    {{"index": 0, "importance_score": 85, "reason": "Direct request from colleague", "suggested_action": "read_now"}},
    ...
  ]
}}

Consider:
- Primary category emails are usually more important than promotional
- Emails from known contacts are more relevant
- Newsletters with unsubscribe links are lower priority unless related to projects
- Starred/important flags indicate user interest
- Project-related keywords boost importance
"""

    try:
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        # Extract JSON from response
        import json
        content = response.content[0].text
        
        # Find JSON in response
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        if start_idx != -1 and end_idx > start_idx:
            json_str = content[start_idx:end_idx]
            analyses = json.loads(json_str)
            return analyses.get('analyses', [])
        
        return []
        
    except Exception as e:
        print(f"❌ AI analysis error: {e}")
        return []


@router.get("/messages/curated")
async def get_curated_messages(
    user_email: str,
    max_results: int = 20,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get AI-curated messages with smart prioritization
    
    This endpoint:
    1. Fetches recent messages from Gmail
    2. Analyzes sender behavior history
    3. Uses AI to score importance/relevance
    4. Returns prioritized list with actionable insights
    """
    try:
        # Get user and their context
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build user context for AI
        user_context = {
            'role': user.profile.role if user.profile else 'Professional',
            'priorities': user.profile.priorities if user.profile and user.profile.priorities else [],
            'projects': [p.name for p in user.projects if p.status in ['active', 'planning']][:5]
        }
        
        # Fetch messages from Gmail
        service = get_gmail_service(user_email, db)
        
        # Get messages from multiple categories if no specific category
        categories_to_fetch = [category] if category else ['primary', 'social', 'promotions', 'updates']
        all_messages = []
        
        for cat in categories_to_fetch:
            query_map = {
                'primary': 'category:primary',
                'social': 'category:social',
                'promotions': 'category:promotions',
                'updates': 'category:updates',
                'forums': 'category:forums',
                'important': 'is:important OR is:starred',
                'all': 'in:inbox'
            }
            
            query = query_map.get(cat, 'category:primary')
            
            results = service.users().messages().list(
                userId='me',
                maxResults=15 if not category else max_results,
                q=query
            ).execute()
            
            messages = results.get('messages', [])
            
            # Fetch full details
            for msg in messages:
                try:
                    message = service.users().messages().get(
                        userId='me',
                        id=msg['id'],
                        format='full'
                    ).execute()
                    
                    headers = {h['name']: h['value'] for h in message['payload']['headers']}
                    label_ids = message.get('labelIds', [])
                    
                    # Extract sender info
                    from_header = headers.get('From', 'Unknown')
                    sender_email = ''
                    sender_domain = ''
                    
                    if '<' in from_header and '>' in from_header:
                        sender_email = from_header.split('<')[1].split('>')[0]
                    elif '@' in from_header:
                        sender_email = from_header.split()[0] if ' ' in from_header else from_header
                    
                    if '@' in sender_email:
                        sender_domain = sender_email.split('@')[1]
                    
                    # Calculate sender importance from behavior
                    sender_importance = calculate_sender_importance(
                        str(user.id), 
                        sender_email, 
                        sender_domain, 
                        db
                    )
                    
                    # Categorize
                    is_primary = 'INBOX' in label_ids and not any(label.startswith('CATEGORY_') for label in label_ids if label != 'CATEGORY_PERSONAL')
                    is_promotional = 'CATEGORY_PROMOTIONS' in label_ids
                    is_social = 'CATEGORY_SOCIAL' in label_ids
                    is_updates = 'CATEGORY_UPDATES' in label_ids
                    is_forums = 'CATEGORY_FORUMS' in label_ids
                    is_important = 'IMPORTANT' in label_ids
                    is_starred = 'STARRED' in label_ids
                    has_unsubscribe = 'List-Unsubscribe' in headers
                    
                    all_messages.append({
                        'id': message['id'],
                        'threadId': message['threadId'],
                        'from': from_header,
                        'senderEmail': sender_email,
                        'senderDomain': sender_domain,
                        'subject': headers.get('Subject', 'No Subject'),
                        'date': headers.get('Date', ''),
                        'snippet': message.get('snippet', ''),
                        'unread': 'UNREAD' in label_ids,
                        'isPrimary': is_primary,
                        'isPromotional': is_promotional,
                        'isSocial': is_social,
                        'isUpdates': is_updates,
                        'isForums': is_forums,
                        'isImportant': is_important,
                        'isStarred': is_starred,
                        'hasUnsubscribeLink': has_unsubscribe,
                        'senderImportanceScore': sender_importance,
                        'category': cat,
                        'labels': label_ids
                    })
                except Exception as msg_error:
                    print(f"⚠️ Error fetching message {msg['id']}: {msg_error}")
                    continue
        
        # Remove duplicates (same threadId)
        seen_threads = set()
        unique_messages = []
        for msg in all_messages:
            if msg['threadId'] not in seen_threads:
                seen_threads.add(msg['threadId'])
                unique_messages.append(msg)
        
        # Get AI analysis
        ai_analyses = await ai_analyze_messages(unique_messages, user_context)
        
        # Merge AI analysis with messages
        for analysis in ai_analyses:
            idx = analysis.get('index')
            if idx < len(unique_messages):
                unique_messages[idx]['aiImportanceScore'] = analysis.get('importance_score', 50)
                unique_messages[idx]['aiReason'] = analysis.get('reason', '')
                unique_messages[idx]['suggestedAction'] = analysis.get('suggested_action', 'read_later')
        
        # Calculate composite score and sort
        for msg in unique_messages:
            ai_score = msg.get('aiImportanceScore', 50) / 100.0
            sender_score = msg.get('senderImportanceScore', 0.5)
            gmail_boost = 0.2 if msg.get('isImportant') or msg.get('isStarred') else 0
            primary_boost = 0.1 if msg.get('isPrimary') else 0
            
            # Weighted composite score
            msg['compositeScore'] = (
                ai_score * 0.5 +           # AI analysis: 50%
                sender_score * 0.3 +        # Sender history: 30%
                gmail_boost +                # Gmail markers: 20%
                primary_boost                # Category boost: 10%
            )
        
        # Sort by composite score
        unique_messages.sort(key=lambda x: x.get('compositeScore', 0), reverse=True)
        
        # Return top messages
        return {
            "messages": unique_messages[:max_results],
            "total": len(unique_messages),
            "categories_analyzed": categories_to_fetch,
            "ai_analysis_enabled": len(ai_analyses) > 0
        }
        
    except Exception as e:
        print(f"❌ Error in curated messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/messages/feedback")
async def record_message_feedback(
    email_id: str,
    user_email: str,
    feedback_type: str,  # critical, interesting, unimportant, junk
    sender_email: str,
    sender_domain: str,
    category: Optional[str] = None,
    has_unsubscribe: bool = False,
    db: Session = Depends(get_db)
):
    """
    Record user feedback on message importance to train Aimy
    
    Feedback types:
    - critical: Highly important, needs immediate attention
    - interesting: Worth reading but not urgent
    - unimportant: Can ignore/archive
    - junk: Spam/trash
    """
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Map feedback to action type
        action_map = {
            'critical': 'mark_important_feedback',
            'interesting': 'mark_interesting_feedback',
            'unimportant': 'mark_unimportant_feedback',
            'junk': 'mark_junk_feedback'
        }
        
        action_type = action_map.get(feedback_type, 'mark_unimportant_feedback')
        
        # Record behavior action
        behavior = BehaviorAction(
            user_id=user.id,
            email_id=email_id,
            sender_email=sender_email,
            sender_domain=sender_domain,
            action_type=action_type,
            email_category=category,
            has_unsubscribe=has_unsubscribe,
            confidence_score=1.0,  # User explicit feedback is 100% confident
            action_metadata={'feedback_type': feedback_type}
        )
        db.add(behavior)
        
        # Update or create sender stats
        stats = db.query(SenderStats).filter(
            SenderStats.user_id == user.id,
            SenderStats.sender_email == sender_email
        ).first()
        
        if not stats:
            stats = SenderStats(
                user_id=user.id,
                sender_email=sender_email,
                sender_domain=sender_domain,
                total_emails=1
            )
            db.add(stats)
        else:
            stats.total_emails += 1
        
        # Update stats based on feedback
        if feedback_type == 'critical':
            stats.marked_important += 1
        elif feedback_type == 'interesting':
            stats.marked_interesting += 1
        elif feedback_type == 'unimportant':
            stats.marked_unimportant += 1
        elif feedback_type == 'junk':
            stats.trashed += 1
        
        # Recalculate importance score
        stats.importance_score = calculate_sender_importance(
            str(user.id),
            sender_email,
            sender_domain,
            db
        )
        stats.last_interaction = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Feedback recorded: {feedback_type}",
            "sender_importance_score": stats.importance_score
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error recording feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/messages/{message_id}/full")
async def get_full_message(
    message_id: str,
    user_email: str,
    db: Session = Depends(get_db)
):
    """Get full message content for preview/reply"""
    try:
        service = get_gmail_service(user_email, db)
        
        message = service.users().messages().get(
            userId='me',
            id=message_id,
            format='full'
        ).execute()
        
        headers = {h['name']: h['value'] for h in message['payload']['headers']}
        
        # Extract body
        body = ""
        if 'parts' in message['payload']:
            for part in message['payload']['parts']:
                if part['mimeType'] == 'text/plain' or part['mimeType'] == 'text/html':
                    if 'data' in part['body']:
                        import base64
                        body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                        break
        elif 'body' in message['payload'] and 'data' in message['payload']['body']:
            import base64
            body = base64.urlsafe_b64decode(message['payload']['body']['data']).decode('utf-8')
        
        return {
            "id": message['id'],
            "threadId": message['threadId'],
            "from": headers.get('From', 'Unknown'),
            "to": headers.get('To', ''),
            "cc": headers.get('Cc', ''),
            "subject": headers.get('Subject', 'No Subject'),
            "date": headers.get('Date', ''),
            "body": body,
            "snippet": message.get('snippet', ''),
            "labels": message.get('labelIds', [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
