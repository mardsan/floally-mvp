"""
Smart Messages API - AI-powered message curation and management
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import anthropic
import os
import base64
import traceback

from app.database import get_db
from app.models.user import User, BehaviorAction, SenderStats
from app.utils.google_auth import get_gmail_service

router = APIRouter()

# Initialize Anthropic client with validation
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
if not anthropic_api_key:
    print("⚠️ WARNING: ANTHROPIC_API_KEY not set - draft generation will fail")
    anthropic_client = None
else:
    anthropic_client = anthropic.Anthropic(api_key=anthropic_api_key)


class DraftResponseRequest(BaseModel):
    user_email: str
    message_id: str
    signature_style: str = "ai_assisted"  # "as_aimy", "ai_assisted", "no_attribution"
    custom_context: Optional[str] = None


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
    
    prompt = f"""You are Aimy, the user's AI teammate helping them prioritize their inbox. Analyze these messages and score their importance/relevance.

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
            model="claude-3-haiku-20240307",
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


@router.post("/messages/draft-response")
async def draft_email_response(
    request: DraftResponseRequest,
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered email response draft
    
    Uses user profile (communication style, tone, priorities) to craft personalized responses.
    Learns from approved drafts to improve future suggestions.
    
    Signature styles:
    - as_aimy: Clearly from Aimy on behalf of user (max transparency + promotion)
    - ai_assisted: From user with subtle OkAimy attribution (default, balanced)
    - no_attribution: Just from user, no mention of AI
    """
    try:
        print(f"🔍 Draft request - User: {request.user_email}, Message: {request.message_id}, Style: {request.signature_style}")
        
        # Check if Anthropic is configured
        if not anthropic_client:
            raise HTTPException(
                status_code=500, 
                detail="AI service not configured. Please contact support."
            )
        
        # Get user with relationships eagerly loaded
        user = db.query(User).options(
            joinedload(User.profile),
            joinedload(User.settings),
            joinedload(User.projects)
        ).filter(User.email == request.user_email).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"✅ User found: {user.email}")
        
        # Get full message
        try:
            service = get_gmail_service(request.user_email, db)
            message = service.users().messages().get(
                userId='me',
                id=request.message_id,
                format='full'
            ).execute()
            print(f"✅ Gmail message retrieved successfully")
        except Exception as e:
            print(f"❌ Failed to get Gmail message: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to retrieve email: {str(e)}")
        
        headers = {h['name']: h['value'] for h in message['payload']['headers']}
        
        # Check for attachments
        from app.services.attachment_service import (
            extract_attachments_from_message,
            is_attachment_safe,
            check_sender_trust
        )
        
        attachments = extract_attachments_from_message(message)
        attachment_context = ""
        has_unprocessed_attachments = False
        sender_from = headers.get('From', '')
        sender_email = ''
        if '<' in sender_from:
            sender_email = sender_from.split('<')[1].split('>')[0]
        elif '@' in sender_from:
            sender_email = sender_from.strip()
        
        if attachments:
            print(f"📎 Found {len(attachments)} attachment(s)")
            is_trusted, auto_approved = check_sender_trust(db, user.email, sender_email)
            
            if is_trusted and auto_approved:
                print(f"✅ Sender trusted with auto-approval for attachments")
                # Will process attachments
                # For now, just note them in context
                attachment_names = [att['filename'] for att in attachments]
                attachment_context = f"\n\nATTACHMENTS: {', '.join(attachment_names)} (attachment processing in progress)"
            elif is_trusted:
                print(f"⚠️ Sender trusted but requires manual approval for attachments")
                has_unprocessed_attachments = True
                attachment_names = [att['filename'] for att in attachments]
                attachment_context = f"\n\nNOTE: Email includes attachments ({', '.join(attachment_names)}) - user can approve processing separately"
            else:
                print(f"⚠️ Sender not trusted for attachment processing")
                has_unprocessed_attachments = True
                attachment_names = [att['filename'] for att in attachments]
                attachment_context = f"\n\nNOTE: Email includes attachments ({', '.join(attachment_names)}) - sender not yet trusted for processing"
        
        # Extract body
        body = ""
        try:
            if 'parts' in message['payload']:
                for part in message['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        if 'data' in part['body']:
                            body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                            print(f"✅ Extracted body from parts (length: {len(body)})")
                            break
            elif 'body' in message['payload'] and 'data' in message['payload']['body']:
                body = base64.urlsafe_b64decode(message['payload']['body']['data']).decode('utf-8')
                print(f"✅ Extracted body from payload (length: {len(body)})")
            
            # Fallback to snippet if no body found
            if not body and 'snippet' in message:
                body = message['snippet']
                print(f"⚠️ Using snippet as body (length: {len(body)})")
        except Exception as e:
            print(f"⚠️ Error extracting body: {e}, using snippet")
            body = message.get('snippet', 'No content available')
        
        print(f"📧 Message body: {body[:200]}..." if len(body) > 200 else f"📧 Message body: {body}")
        
        print(f"👤 Building user context...")
        # Build user context for AI - with safe attribute access
        try:
            active_projects = []
            if hasattr(user, 'projects') and user.projects:
                active_projects = [p.name for p in user.projects if hasattr(p, 'status') and p.status in ['active', 'planning']][:3]
        except Exception as e:
            print(f"Warning: Could not load active projects: {e}")
            active_projects = []
        
        user_context = {
            'name': user.display_name or user.email.split('@')[0],
            'email': user.email,
            'role': getattr(user.profile, 'role', 'Professional') if user.profile else 'Professional',
            'communication_style': getattr(user.profile, 'communication_style', 'professional') if user.profile else 'professional',
            'tone_preference': user.settings.ai_preferences.get('tone', 'warm_friendly') if (user.settings and hasattr(user.settings, 'ai_preferences') and user.settings.ai_preferences) else 'warm_friendly',
            'priorities': getattr(user.profile, 'priorities', []) if (user.profile and hasattr(user.profile, 'priorities') and user.profile.priorities) else [],
            'active_projects': active_projects
        }
        print(f"✅ User context built: {user_context['name']}, {user_context['role']}")
        
        # Craft AI prompt based on user preferences
        tone_map = {
            'warm_friendly': 'warm, friendly, and approachable',
            'professional': 'professional and formal',
            'casual': 'casual and conversational',
            'concise': 'brief and to-the-point'
        }
        
        tone_description = tone_map.get(user_context['tone_preference'], 'professional and friendly')
        
        # Check for previous approved drafts from this sender to learn style
        sender_from = headers.get('From', '')
        sender_email = ''
        if '<' in sender_from:
            sender_email = sender_from.split('<')[1].split('>')[0]
        elif '@' in sender_from:
            sender_email = sender_from.strip()
        
        # Get past approved responses for style reference (if any)
        past_approvals = db.query(BehaviorAction).filter(
            BehaviorAction.user_id == user.id,
            BehaviorAction.action_type == 'draft_approved',
            BehaviorAction.sender_email == sender_email
        ).order_by(desc(BehaviorAction.created_at)).limit(2).all()
        
        style_learning = ""
        if past_approvals:
            style_learning = f"\n\nUser has previously approved {len(past_approvals)} response(s) to this sender. Maintain similar tone and style."
        
        prompt = f"""You are Aimy, {user_context['name']}'s AI teammate on their operations team, helping draft an email response.

USER PROFILE:
- Name: {user_context['name']}
- Role: {user_context['role']}
- Communication Style: {user_context['communication_style']}
- Tone Preference: {tone_description}
- Current Priorities: {', '.join(user_context['priorities'][:3]) if user_context['priorities'] else 'Not specified'}
- Active Projects: {', '.join(user_context['active_projects']) if user_context['active_projects'] else 'None'}
{style_learning}

ORIGINAL EMAIL:
From: {headers.get('From', 'Unknown')}
Subject: {headers.get('Subject', 'No Subject')}
Date: {headers.get('Date', '')}

Content:
{body[:1500] if body else message.get('snippet', 'No content')}
{attachment_context}

{f"ADDITIONAL CONTEXT: {request.custom_context}" if request.custom_context else ""}

INSTRUCTIONS:
1. Draft a response that matches {user_context['name']}'s communication style and tone ({tone_description})
2. Address all key points from the original email
3. Keep it concise but thorough (2-4 paragraphs maximum)
4. Use first-person perspective (as {user_context['name']})
5. Include a clear call-to-action or next steps if appropriate
6. Be helpful and constructive
7. Match the formality level of the original email

IMPORTANT: 
- Write ONLY the email body content
- Do NOT include "Subject:" or "To:" lines
- Do NOT include greetings like "Dear Aimy" - start with addressing the recipient
- End with just the closing (no signature block, that will be added separately)

Draft the response now:"""

        # Generate response
        try:
            print(f"🤖 Calling Anthropic API...")
            response = anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=2000,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            print(f"✅ Anthropic API responded successfully")
        except Exception as e:
            print(f"❌ Anthropic API error: {e}")
            raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
        
        draft_body = response.content[0].text if response.content else ""
        
        # Add signature based on style preference
        user_name = user.display_name or user.email.split('@')[0]
        
        if request.signature_style == "as_aimy":
            signature = f"""

Best regards,
Aimy (on behalf of {user_name})

---
Sent via OkAimy - Your AI Teammate for Productivity
www.okaimy.com"""
            
        elif request.signature_style == "ai_assisted":
            signature = f"""

Best,
{user_name}

---
Composed with Aimy - my AI teammate at OkAimy"""
            
        else:  # no_attribution
            signature = f"""

Best,
{user_name}"""
        
        full_draft = draft_body.strip() + signature
        
        return {
            "success": True,
            "draft": full_draft,
            "draft_body": draft_body.strip(),
            "signature": signature.strip(),
            "subject": f"Re: {headers.get('Subject', 'No Subject')}",
            "to": headers.get('From', ''),
            "original_message": {
                "id": message['id'],
                "threadId": message['threadId'],
                "from": headers.get('From', ''),
                "subject": headers.get('Subject', '')
            },
            "signature_style": request.signature_style,
            "user_context": {
                "tone": user_context['tone_preference'],
                "style": user_context['communication_style']
            },
            "attachments": {
                "has_attachments": len(attachments) > 0,
                "count": len(attachments),
                "unprocessed": has_unprocessed_attachments,
                "sender_email": sender_email if has_unprocessed_attachments else None,
                "files": [att['filename'] for att in attachments] if has_unprocessed_attachments else []
            }
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        error_type = type(e).__name__
        error_msg = str(e) if str(e) else repr(e)
        
        print(f"❌ Error drafting response - Type: {error_type}, Message: {error_msg}")
        print(f"❌ Full traceback:\n{error_details}")
        
        # Return more detailed error
        detail_msg = f"{error_type}: {error_msg}" if error_msg else f"{error_type} (no error message)"
        raise HTTPException(status_code=500, detail=f"Draft generation failed: {detail_msg}")


@router.post("/messages/approve-draft")
async def approve_draft_response(
    message_id: str,
    user_email: str,
    sender_email: str,
    draft_approved: bool,
    db: Session = Depends(get_db)
):
    """
    Record that user approved/rejected a draft response
    Used for behavioral learning to improve future suggestions
    """
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Extract sender domain
        sender_domain = sender_email.split('@')[1] if '@' in sender_email else ''
        
        # Record behavior
        action_type = 'draft_approved' if draft_approved else 'draft_rejected'
        
        behavior = BehaviorAction(
            user_id=user.id,
            email_id=message_id,
            sender_email=sender_email,
            sender_domain=sender_domain,
            action_type=action_type,
            confidence_score=1.0,
            action_metadata={'draft_learning': True}
        )
        db.add(behavior)
        
        # Update sender stats
        stats = db.query(SenderStats).filter(
            SenderStats.user_id == user.id,
            SenderStats.sender_email == sender_email
        ).first()
        
        if stats and draft_approved:
            stats.responded += 1
            stats.last_interaction = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Draft feedback recorded",
            "action": action_type
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error recording draft approval: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/messages/send-reply")
async def send_email_reply(
    message_id: str,
    user_email: str,
    reply_body: str,
    reply_to: str,
    subject: str,
    db: Session = Depends(get_db)
):
    """Send email reply via Gmail API"""
    try:
        service = get_gmail_service(user_email, db)
        
        # Create email message
        from email.mime.text import MIMEText
        
        message = MIMEText(reply_body)
        message['to'] = reply_to
        message['subject'] = subject
        
        # Encode message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        # Send via Gmail API
        sent_message = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        return {
            "success": True,
            "message_id": sent_message['id'],
            "thread_id": sent_message.get('threadId')
        }
        
    except Exception as e:
        print(f"❌ Error sending reply: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/messages/health")
async def health_check():
    """Simple health check to verify AI service is configured"""
    return {
        "status": "ok",
        "anthropic_configured": anthropic_client is not None,
        "anthropic_key_set": bool(os.getenv("ANTHROPIC_API_KEY"))
    }

