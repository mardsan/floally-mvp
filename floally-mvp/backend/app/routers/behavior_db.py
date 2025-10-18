"""
Behavior tracking with database backend
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import User, BehaviorAction, SenderStats

router = APIRouter()

class BehaviorActionRequest(BaseModel):
    user_email: str
    email_id: str
    sender_email: str
    sender_domain: str
    action_type: str
    email_category: str
    has_unsubscribe: bool = False
    confidence_score: float = 0.0
    metadata: Optional[Dict[str, Any]] = None

@router.post("/log-action")
async def log_action(action: BehaviorActionRequest, db: Session = Depends(get_db)):
    """Log a user action on an email for behavioral learning"""
    try:
        # Get or create user
        user = db.query(User).filter(User.email == action.user_email).first()
        if not user:
            user = User(email=action.user_email)
            db.add(user)
            db.flush()
        
        # Create behavior action
        behavior = BehaviorAction(
            user_id=user.id,
            email_id=action.email_id,
            sender_email=action.sender_email,
            sender_domain=action.sender_domain,
            action_type=action.action_type,
            email_category=action.email_category,
            has_unsubscribe=action.has_unsubscribe,
            confidence_score=action.confidence_score,
            metadata=action.metadata
        )
        db.add(behavior)
        
        # Update sender stats
        sender_stats = update_sender_stats_db(db, user.id, action)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Action logged successfully",
            "sender_stats": {
                "sender_email": sender_stats.sender_email,
                "sender_domain": sender_stats.sender_domain,
                "total_emails": sender_stats.total_emails,
                "marked_important": sender_stats.marked_important,
                "marked_interesting": sender_stats.marked_interesting,
                "marked_unimportant": sender_stats.marked_unimportant,
                "importance_score": sender_stats.importance_score
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def update_sender_stats_db(db: Session, user_id, action: BehaviorActionRequest):
    """Update sender statistics in database"""
    # Get or create sender stats
    stats = db.query(SenderStats).filter(
        SenderStats.user_id == user_id,
        SenderStats.sender_email == action.sender_email
    ).first()
    
    if not stats:
        stats = SenderStats(
            user_id=user_id,
            sender_email=action.sender_email,
            sender_domain=action.sender_domain
        )
        db.add(stats)
    
    # Update counters
    stats.total_emails += 1
    stats.last_interaction = datetime.utcnow()
    
    if action.action_type in ["important", "mark_important_feedback"]:
        stats.marked_important += 1
    elif action.action_type in ["interesting", "mark_interesting_feedback"]:
        stats.marked_interesting += 1
    elif action.action_type in ["unimportant", "mark_unimportant_feedback"]:
        stats.marked_unimportant += 1
    elif action.action_type == "archive":
        stats.archived += 1
    elif action.action_type == "trash":
        stats.trashed += 1
    elif action.action_type == "respond":
        stats.responded += 1
    elif action.action_type == "unsubscribe":
        stats.unsubscribed += 1
    
    # Calculate importance score
    important = stats.marked_important
    interesting = stats.marked_interesting
    unimportant = stats.marked_unimportant
    archived = stats.archived
    trashed = stats.trashed
    responded = stats.responded
    
    total_actions = important + interesting + unimportant + archived + trashed + responded
    
    if total_actions > 0:
        importance_score = (important * 2.0 + interesting * 1.0 + responded * 1.5) / total_actions
        stats.importance_score = min(1.0, importance_score / 2.0)
    else:
        stats.importance_score = 0.5
    
    return stats

@router.get("/sender-stats")
async def get_sender_stats(user_email: str, sender_email: Optional[str] = None, db: Session = Depends(get_db)):
    """Get sender statistics for a user"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {"sender_stats": []}
        
        query = db.query(SenderStats).filter(SenderStats.user_id == user.id)
        
        if sender_email:
            query = query.filter(SenderStats.sender_email == sender_email)
        else:
            query = query.order_by(desc(SenderStats.importance_score))
        
        stats = query.all()
        
        return {
            "sender_stats": [
                {
                    "sender_email": s.sender_email,
                    "sender_domain": s.sender_domain,
                    "total_emails": s.total_emails,
                    "marked_important": s.marked_important,
                    "marked_interesting": s.marked_interesting,
                    "marked_unimportant": s.marked_unimportant,
                    "archived": s.archived,
                    "responded": s.responded,
                    "trashed": s.trashed,
                    "unsubscribed": s.unsubscribed,
                    "importance_score": s.importance_score,
                    "last_interaction": s.last_interaction.isoformat()
                }
                for s in stats
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/behavior-log")
async def get_behavior_log(user_email: str, limit: int = 100, db: Session = Depends(get_db)):
    """Get recent behavior actions for a user"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {"actions": []}
        
        actions = db.query(BehaviorAction).filter(
            BehaviorAction.user_id == user.id
        ).order_by(desc(BehaviorAction.created_at)).limit(limit).all()
        
        return {
            "actions": [
                {
                    "email_id": a.email_id,
                    "sender_email": a.sender_email,
                    "sender_domain": a.sender_domain,
                    "action_type": a.action_type,
                    "email_category": a.email_category,
                    "confidence_score": a.confidence_score,
                    "timestamp": a.created_at.isoformat()
                }
                for a in actions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_insights(user_email: str, db: Session = Depends(get_db)):
    """Get behavioral insights for a user"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {
                "message": "Not enough data yet. Keep using Aime to build insights!",
                "total_actions": 0,
                "top_senders": []
            }
        
        # Get action count
        total_actions = db.query(func.count(BehaviorAction.id)).filter(
            BehaviorAction.user_id == user.id
        ).scalar()
        
        if total_actions < 5:
            return {
                "message": "Not enough data yet. Keep using Aime to build insights!",
                "total_actions": total_actions,
                "top_senders": []
            }
        
        # Get top senders by importance
        top_senders = db.query(SenderStats).filter(
            SenderStats.user_id == user.id
        ).order_by(desc(SenderStats.importance_score)).limit(10).all()
        
        return {
            "message": f"Aime has learned from {total_actions} actions!",
            "total_actions": total_actions,
            "top_senders": [
                {
                    "sender": s.sender_email,
                    "importance_score": s.importance_score,
                    "total_emails": s.total_emails
                }
                for s in top_senders
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
