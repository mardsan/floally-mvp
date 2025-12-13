"""
Autonomous Actions Module
Performs automated email management based on user preferences and learned patterns.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import httpx

from ..database import get_db
from ..models.user import SenderStats, ConnectedAccount

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
    """
    email_id = message.get('id')
    subject = message.get('subject', 'No subject')
    from_addr = message.get('from', '')
    
    # Extract sender email
    if '<' in from_addr and '>' in from_addr:
        sender_email = from_addr.split('<')[1].split('>')[0]
    else:
        sender_email = from_addr
    
    # Rule 1: Auto-archive promotional if user enabled it
    if auto_archive_promo and message.get('isPromotional', False):
        try:
            # Archive via Gmail API - remove INBOX label
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
            
            # Make API call to Gmail
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
                        subject=subject or 'unknown',
                        action_taken="archived",
                        reason="Promotional email (auto-archive enabled)",
                        confidence=0.95
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
            print(f"Failed to archive promotional email {email_id}: {e}")
            return ActionResult(
                email_id=email_id or 'unknown',
                subject=subject or 'unknown',
                action_taken="none",
                reason=f"Failed to archive: {str(e)}",
                confidence=0.0
            )
    
    # Rule 2: Auto-archive from senders user consistently archives
    if sender_email in sender_stats:
        stats = sender_stats[sender_email]
        total_interactions = stats.opened + stats.archived + stats.starred
        
        if total_interactions >= 5:  # Need at least 5 interactions to be confident
            archive_rate = stats.archived / total_interactions
            
            if archive_rate >= 0.8:  # User archives this sender 80%+ of the time
                try:
                    account = db.query(ConnectedAccount).filter(
                        ConnectedAccount.email == user_email,
                        ConnectedAccount.provider == 'google'
                    ).first()
                    
                    if account and account.access_token and account.access_token != '':
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
                                    reason=f"You typically archive emails from this sender ({int(archive_rate * 100)}% archive rate)",
                                    confidence=archive_rate
                                )
                except Exception as e:
                    print(f"Failed to archive based on behavior {email_id}: {e}")
    
    # Rule 3: Identify unsubscribe candidates (but don't act automatically)
    if sender_email in sender_stats:
        stats = sender_stats[sender_email]
        if stats.opened == 0 and stats.archived >= 3:
            return ActionResult(
                email_id=email_id or 'unknown',
                subject=subject or 'unknown',
                action_taken="none",
                reason=f"Unsubscribe candidate (never opened, archived {stats.archived} times)",
                confidence=0.7
            )
    
    # No action taken
    return ActionResult(
        email_id=email_id or 'unknown',
        action_taken="none",
        reason="No autonomous action rules matched",
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
