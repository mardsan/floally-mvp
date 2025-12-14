"""
Autonomous Actions Module
Performs automated email management based on user preferences and learned patterns.
Enhanced with contextual intelligence.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import httpx

from ..database import get_db
from ..models.user import SenderStats, ConnectedAccount, User
from ..services.contextual_scoring import ContextualScorer

router = APIRouter()

class AutonomousActionsRequest(BaseModel):
    user_email: str
    messages: List[Dict[str, Any]]
    user_preferences: Optional[Dict[str, Any]] = None

class ActionResult(BaseModel):
    email_id: str
    subject: str
    action_taken: str  # "archived", "unsubscribed", "snoozed", "none"
    reason: str
    confidence: float

class AutonomousActionsResponse(BaseModel):
    actions_taken: List[ActionResult]
    total_processed: int
    total_actioned: int
    summary: str

@router.post("/process-inbox", response_model=AutonomousActionsResponse)
async def process_inbox_autonomously(request: AutonomousActionsRequest, db: Session = Depends(get_db)):
    """
    Intelligently process inbox messages based on user behavior patterns.
    
    Actions taken:
    1. Auto-archive promotional emails if user preference enabled
    2. Auto-archive from senders user consistently archives (>80% archive rate)
    3. Flag unsubscribe candidates (newsletters user never opens)
    
    Returns detailed log of all actions taken for transparency.
    """
    try:
        actions_taken = []
        user_prefs = request.user_preferences or {}
        
        # Get user's behavioral patterns from database

        sender_stats_query = db.query(SenderStats).filter(
            SenderStats.user_email == request.user_email
        ).all()
        sender_stats = {stat.sender_email: stat for stat in sender_stats_query}
        
        # Get email management preferences
        auto_archive_promo = user_prefs.get('email_management', {}).get('auto_archive_promotional', False)
        
        for message in request.messages:
            action_result = await _evaluate_message_for_action(
                message=message,
                sender_stats=sender_stats,
                auto_archive_promo=auto_archive_promo,
                user_email=request.user_email,
                db=db
            )
            
            if action_result.action_taken != "none":
                actions_taken.append(action_result)
        
        # Generate human-readable summary
        archive_count = sum(1 for a in actions_taken if a.action_taken == "archived")
        summary = _generate_summary(actions_taken, len(request.messages))
        
        return AutonomousActionsResponse(
            actions_taken=actions_taken,
            total_processed=len(request.messages),
            total_actioned=len(actions_taken),
            summary=summary
        )
        
    except Exception as e:
        import traceback
        print(f"Error in autonomous actions: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


async def _evaluate_message_for_action(
    message: Dict[str, Any],
    sender_stats: Dict[str, Any],
    auto_archive_promo: bool,
    user_email: str,
    db: Session
) -> ActionResult:
    """
    Evaluate a single message and determine if autonomous action should be taken.
    Now uses contextual scoring for more intelligent decisions.
    """
    email_id = message.get('id')
    subject = message.get('subject', 'No subject')
    from_addr = message.get('from', '')
    
    # Extract sender email
    if '<' in from_addr and '>' in from_addr:
        sender_email = from_addr.split('<')[1].split('>')[0]
    else:
        sender_email = from_addr
    
    # Get user for contextual scoring
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        return ActionResult(
            email_id=email_id or 'unknown',
            subject=subject,
            action_taken="none",
            reason="User not found",
            confidence=0.0
        )
    
    # Use contextual scorer to understand importance
    scorer = ContextualScorer(db)
    gmail_signals = {
        'is_starred': message.get('isStarred', False),
        'is_important': message.get('isImportant', False),
        'category': 'promotional' if message.get('isPromotional') else 'primary',
        'has_unsubscribe_link': message.get('hasUnsubscribeLink', False)
    }
    
    score_result = scorer.calculate_contextual_importance(
        user_id=str(user.id),
        sender_email=sender_email,
        sender_name=from_addr,
        subject=subject,
        snippet=message.get('snippet', ''),
        gmail_signals=gmail_signals
    )
    
    # Extract relationship and score
    relationship = score_result['sender_relationship']
    importance_score = score_result['importance_score']
    suggested_action = score_result['suggested_action']
    confidence = score_result['confidence']
    
    # Enhanced Rule 1: Auto-archive promotional ONLY if low importance and enabled
    if auto_archive_promo and message.get('isPromotional', False):
        # Double-check: Is this actually noise? Don't archive if it might be important
        if relationship in ['vip', 'important'] or importance_score > 40:
            return ActionResult(
                email_id=email_id or 'unknown',
                subject=subject,
                action_taken="none",
                reason="Promotional but sender is important - keeping in inbox",
                confidence=confidence
            )
        
        # Safe to archive - low importance promotional
        return await _archive_message(email_id, subject, user_email, db, 
                                      "Low-importance promotional email", confidence)
    
    # Enhanced Rule 2: Auto-archive based on consistent learned pattern
    if relationship == 'noise' and confidence > 0.7:
        # User has shown consistent pattern of ignoring this sender
        if suggested_action in ['auto_archive', 'archive_if_not_urgent']:
            return await _archive_message(email_id, subject, user_email, db,
                                          f"Consistent archive pattern ({int(confidence*100)}% confidence)", confidence)
    
    # Enhanced Rule 3: Flag unsubscribe candidates (consistent noise with unsubscribe link)
    if (message.get('hasUnsubscribeLink') and 
        relationship == 'noise' and 
        importance_score < 20):
        return ActionResult(
            email_id=email_id or 'unknown',
            subject=subject,
            action_taken="none",
            reason=f"Unsubscribe candidate - low importance newsletter you consistently ignore",
            confidence=confidence
        )
    
    # No action taken - message needs user review
    return ActionResult(
        email_id=email_id or 'unknown',
        subject=subject,
        action_taken="none",
        reason="Message requires your review",
        confidence=confidence
    )


async def _archive_message(
    email_id: str, 
    subject: str, 
    user_email: str, 
    db: Session,
    reason: str,
    confidence: float
) -> ActionResult:
    """Helper function to archive a message via Gmail API"""
    try:
        account = db.query(ConnectedAccount).filter(
            ConnectedAccount.email == user_email,
            ConnectedAccount.provider == 'google'
        ).first()
        
        if not account or not account.access_token or account.access_token == '':
            return ActionResult(
                email_id=email_id or 'unknown',
                subject=subject,
                action_taken="none",
                reason="No Gmail access token available",
                confidence=0.0
            )
        
        # Make API call to Gmail to remove INBOX label
        headers = {"Authorization": f"Bearer {account.access_token}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{email_id}/modify",
                headers=headers,
                json={"removeLabelIds": ["INBOX"]}
            )
            
            if response.status_code == 200:
                return ActionResult(
                    email_id=email_id or 'unknown',
                    subject=subject,
                    action_taken="archived",
                    reason=reason,
                    confidence=confidence
                )
            else:
                return ActionResult(
                    email_id=email_id or 'unknown',
                    subject=subject,
                    action_taken="none",
                    reason=f"Gmail API error: {response.status_code}",
                    confidence=0.0
                )
    except Exception as e:
        print(f"Failed to archive email {email_id}: {e}")
        return ActionResult(
            email_id=email_id or 'unknown',
            subject=subject,
            action_taken="none",
            reason=f"Failed to archive: {str(e)}",
            confidence=0.0
        )


def _generate_summary(actions: List[ActionResult], total_messages: int) -> str:
    """Generate human-readable summary of autonomous actions."""
    if not actions:
        return "No autonomous actions taken. All messages require your review."
    
    archived_count = sum(1 for a in actions if a.action_taken == "archived")
    
    summary_parts = []
    
    if archived_count > 0:
        summary_parts.append(f"Archived {archived_count} messages you typically don't need")
    
    unsubscribe_candidates = [a for a in actions if "unsubscribe candidate" in a.reason.lower()]
    if unsubscribe_candidates:
        summary_parts.append(f"Identified {len(unsubscribe_candidates)} newsletters you might want to unsubscribe from")
    
    if summary_parts:
        return f"✅ HANDLED: {', '.join(summary_parts)}. Showing you the {total_messages - archived_count} messages that need your attention."
    
    return "Showing all messages that need your review."


@router.get("/actions-log")
async def get_actions_log(user_email: str, days: int = 7):
    """
    Get log of all autonomous actions taken in the past N days.
    Transparency feature - users can see everything Aimi has done.
    """
    # This would query a database table of actions
    # For now, return empty as we're just starting to track
    return {
        "user_email": user_email,
        "period_days": days,
        "actions": [],
        "total_actions": 0,
        "message": "Autonomous actions logging will appear here once actions are taken"
    }
