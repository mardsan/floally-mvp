from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import json
import os
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

router = APIRouter()

# Try to import database dependencies, but don't fail if unavailable
try:
    from app.database import get_db
    from app.models.user import BehaviorAction as DBBehaviorAction, SenderStats as DBSenderStats
    DB_AVAILABLE = True
except Exception as e:
    print(f"Database not available: {e}")
    DB_AVAILABLE = False
    def get_db():
        """Dummy function when database is not available"""
        return None

class BehaviorAction(BaseModel):
    user_email: str
    email_id: str
    sender_email: str
    sender_domain: str
    action_type: str  # important, interesting, unimportant, archive, trash, respond, unsubscribe
    email_category: str  # primary, promotional, social, updates, forums, newsletter
    has_unsubscribe: bool = False
    confidence_score: float = 0.0  # From AI analysis (0-1)
    metadata: Optional[Dict[str, Any]] = None  # Optional metadata for additional context

class SenderStats(BaseModel):
    sender_email: str
    sender_domain: str
    total_emails: int = 0
    marked_important: int = 0
    marked_interesting: int = 0
    marked_unimportant: int = 0
    archived: int = 0
    responded: int = 0
    importance_score: float = 0.0  # Calculated: important / (important + interesting + unimportant + archived)

# File-based storage for MVP (migrate to DB in Phase 2)
BEHAVIOR_DIR = Path("behavior_data")
BEHAVIOR_DIR.mkdir(exist_ok=True)

def get_user_behavior_file(user_email: str) -> Path:
    """Get path to user's behavior log file"""
    # Sanitize email for filename
    safe_email = user_email.replace('@', '_at_').replace('.', '_')
    return BEHAVIOR_DIR / f"{safe_email}_behavior.json"

def get_user_sender_stats_file(user_email: str) -> Path:
    """Get path to user's sender stats file"""
    safe_email = user_email.replace('@', '_at_').replace('.', '_')
    return BEHAVIOR_DIR / f"{safe_email}_sender_stats.json"

def load_behavior_log(user_email: str) -> list:
    """Load user's behavior log"""
    file_path = get_user_behavior_file(user_email)
    if file_path.exists():
        with open(file_path, 'r') as f:
            return json.load(f)
    return []

def save_behavior_log(user_email: str, log: list):
    """Save user's behavior log"""
    file_path = get_user_behavior_file(user_email)
    with open(file_path, 'w') as f:
        json.dump(log, f, indent=2)

def load_sender_stats(user_email: str) -> dict:
    """Load sender statistics"""
    file_path = get_user_sender_stats_file(user_email)
    if file_path.exists():
        with open(file_path, 'r') as f:
            return json.load(f)
    return {}

def save_sender_stats(user_email: str, stats: dict):
    """Save sender statistics"""
    file_path = get_user_sender_stats_file(user_email)
    with open(file_path, 'w') as f:
        json.dump(stats, f, indent=2)

def update_sender_stats(user_email: str, action: BehaviorAction):
    """Update sender statistics based on action"""
    stats = load_sender_stats(user_email)
    
    sender_key = action.sender_email
    
    if sender_key not in stats:
        stats[sender_key] = {
            "sender_email": action.sender_email,
            "sender_domain": action.sender_domain,
            "total_emails": 0,
            "marked_important": 0,
            "marked_interesting": 0,
            "marked_unimportant": 0,
            "archived": 0,
            "responded": 0,
            "trashed": 0,
            "unsubscribed": 0,
            "importance_score": 0.0
        }
    
    # Increment counters
    stats[sender_key]["total_emails"] += 1
    
    if action.action_type in ["important", "mark_important_feedback"]:
        stats[sender_key]["marked_important"] += 1
    elif action.action_type in ["interesting", "mark_interesting_feedback"]:
        stats[sender_key]["marked_interesting"] += 1
    elif action.action_type in ["unimportant", "mark_unimportant_feedback"]:
        stats[sender_key]["marked_unimportant"] += 1
    elif action.action_type == "archive":
        stats[sender_key]["archived"] += 1
    elif action.action_type == "trash":
        stats[sender_key]["trashed"] += 1
    elif action.action_type == "respond":
        stats[sender_key]["responded"] += 1
    elif action.action_type == "unsubscribe":
        stats[sender_key]["unsubscribed"] += 1
    
    # Calculate importance score
    # Formula: (important * 2 + interesting * 1 + respond * 1.5) / (important + interesting + unimportant + archive + trash + respond)
    # This gives: important=highest value, interesting=medium value, unimportant/trash=negative signal
    important = stats[sender_key]["marked_important"]
    interesting = stats[sender_key]["marked_interesting"]
    unimportant = stats[sender_key]["marked_unimportant"]
    archived = stats[sender_key]["archived"]
    trashed = stats[sender_key]["trashed"]
    responded = stats[sender_key]["responded"]
    
    total_actions = important + interesting + unimportant + archived + trashed + responded
    
    if total_actions > 0:
        importance_score = (important * 2.0 + interesting * 1.0 + responded * 1.5) / total_actions
        # Normalize to 0-1 range (max possible is 2.0 from important only)
        stats[sender_key]["importance_score"] = min(1.0, importance_score / 2.0)
    else:
        stats[sender_key]["importance_score"] = 0.5  # Neutral
    
    save_sender_stats(user_email, stats)
    return stats[sender_key]

@router.post("/log-action")
async def log_action(action: BehaviorAction, db: Session = Depends(get_db) if DB_AVAILABLE else None):
    """Log a user action on an email for behavioral learning
    
    Supports both database (production) and file-based (dev) storage.
    Falls back to file storage if database is unavailable.
    """
    try:
        # Try database storage first if available
        if DB_AVAILABLE and db is not None:
            try:
                # Create database entry
                db_action = DBBehaviorAction(
                    user_email=action.user_email,
                    action_type=action.action_type,
                    entity_type="email",
                    entity_id=action.email_id,
                    metadata={
                        "sender_email": action.sender_email,
                        "sender_domain": action.sender_domain,
                        "email_category": action.email_category,
                        "has_unsubscribe": action.has_unsubscribe,
                        "confidence_score": action.confidence_score
                    }
                )
                db.add(db_action)
                
                # Update or create sender stats
                sender_stat = db.query(DBSenderStats).filter(
                    DBSenderStats.user_email == action.user_email,
                    DBSenderStats.sender_email == action.sender_email
                ).first()
                
                if not sender_stat:
                    sender_stat = DBSenderStats(
                        user_email=action.user_email,
                        sender_email=action.sender_email,
                        total_received=0,
                        archived_count=0,
                        starred_count=0,
                        opened_count=0,
                        importance_score=0.5
                    )
                    db.add(sender_stat)
                
                # Update counts
                sender_stat.total_received += 1
                if action.action_type in ["archive"]:
                    sender_stat.archived_count += 1
                elif action.action_type in ["important", "mark_important_feedback"]:
                    sender_stat.starred_count += 1
                elif action.action_type in ["open", "read"]:
                    sender_stat.opened_count += 1
                
                # Recalculate importance score
                # Formula: (starred * 2 + opened) / total_received
                if sender_stat.total_received > 0:
                    sender_stat.importance_score = min(1.0, 
                        (sender_stat.starred_count * 2.0 + sender_stat.opened_count) / 
                        (sender_stat.total_received * 2.0)
                    )
                
                db.commit()
                db.refresh(sender_stat)
                
                return {
                    "success": True,
                    "message": "Action logged successfully (database)",
                    "storage": "database",
                    "sender_stats": {
                        "sender_email": sender_stat.sender_email,
                        "importance_score": sender_stat.importance_score,
                        "total_received": sender_stat.total_received,
                        "starred_count": sender_stat.starred_count,
                        "archived_count": sender_stat.archived_count,
                        "opened_count": sender_stat.opened_count
                    }
                }
            except Exception as db_error:
                print(f"Database storage failed: {db_error}, falling back to file storage")
                db.rollback()
        
        # Fallback to file-based storage
        # Load existing behavior log
        log = load_behavior_log(action.user_email)
        
        # Add new action with timestamp
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "email_id": action.email_id,
            "sender_email": action.sender_email,
            "sender_domain": action.sender_domain,
            "action_type": action.action_type,
            "email_category": action.email_category,
            "has_unsubscribe": action.has_unsubscribe,
            "confidence_score": action.confidence_score
        }
        
        log.append(log_entry)
        
        # Keep only last 1000 actions (prevent file bloat)
        if len(log) > 1000:
            log = log[-1000:]
        
        save_behavior_log(action.user_email, log)
        
        # Update sender statistics
        sender_stats = update_sender_stats(action.user_email, action)
        
        return {
            "success": True,
            "message": "Action logged successfully (file storage)",
            "storage": "file",
            "sender_stats": sender_stats
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log action: {str(e)}")

@router.get("/sender-stats")
async def get_sender_stats(user_email: str, sender_email: str = None):
    """Get sender statistics for a user"""
    try:
        stats = load_sender_stats(user_email)
        
        if sender_email:
            # Return stats for specific sender
            return stats.get(sender_email, {
                "message": "No data for this sender",
                "importance_score": 0.5
            })
        
        # Return all sender stats, sorted by importance score
        sorted_stats = sorted(
            stats.values(),
            key=lambda x: x["importance_score"],
            reverse=True
        )
        
        return {
            "total_senders": len(sorted_stats),
            "top_senders": sorted_stats[:20],  # Top 20 most important
            "all_stats": sorted_stats
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sender stats: {str(e)}")

@router.get("/behavior-log")
async def get_behavior_log(user_email: str, limit: int = 100):
    """Get user's recent behavior log"""
    try:
        log = load_behavior_log(user_email)
        
        # Return most recent actions
        recent_log = log[-limit:] if len(log) > limit else log
        recent_log.reverse()  # Most recent first
        
        return {
            "total_actions": len(log),
            "recent_actions": recent_log
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get behavior log: {str(e)}")

@router.get("/insights")
async def get_behavioral_insights(user_email: str):
    """Generate insights from behavioral data"""
    try:
        stats = load_sender_stats(user_email)
        log = load_behavior_log(user_email)
        
        if not log:
            return {
                "message": "Not enough data yet. Keep using Aime to build insights!",
                "total_actions": 0
            }
        
        # Calculate insights
        total_actions = len(log)
        
        # Count actions by type
        action_counts = {}
        for entry in log:
            action_type = entry["action_type"]
            action_counts[action_type] = action_counts.get(action_type, 0) + 1
        
        # Find most important senders
        sorted_senders = sorted(
            stats.values(),
            key=lambda x: x["importance_score"],
            reverse=True
        )
        
        top_senders = sorted_senders[:5]
        
        # Generate natural language insights
        insights = []
        
        if action_counts.get("important", 0) > 0:
            insights.append(f"You've marked {action_counts['important']} emails as important")
        
        if action_counts.get("unimportant", 0) > 0:
            insights.append(f"You've marked {action_counts['unimportant']} emails as not interested")
        
        if action_counts.get("archive", 0) > 0:
            insights.append(f"You've archived {action_counts['archive']} emails")
        
        if top_senders:
            top_sender_names = [s["sender_email"].split('@')[0] for s in top_senders[:3]]
            insights.append(f"Your most important senders: {', '.join(top_sender_names)}")
        
        return {
            "total_actions": total_actions,
            "action_breakdown": action_counts,
            "top_important_senders": top_senders,
            "insights": insights
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")


@router.post("/predict-action")
async def predict_user_action(
    user_email: str,
    sender_email: str,
    sender_domain: str,
    email_category: str,
    has_unsubscribe: bool,
    db: Session = Depends(get_db) if DB_AVAILABLE else None
):
    """Predict what action user is likely to take on this email
    
    Returns confidence scores for different actions based on learned behavior.
    Uses database if available, falls back to file storage.
    """
    try:
        # Try database query first if available
        if DB_AVAILABLE and db is not None:
            try:
                # Get sender stats
                sender_stat = db.query(DBSenderStats).filter(
                    DBSenderStats.user_email == user_email,
                    DBSenderStats.sender_email == sender_email
                ).first()
                
                # Get recent actions for this sender
                recent_actions = db.query(DBBehaviorAction).filter(
                    DBBehaviorAction.user_email == user_email,
                    DBBehaviorAction.metadata['sender_email'].astext == sender_email,
                    DBBehaviorAction.timestamp >= datetime.now() - timedelta(days=30)
                ).order_by(desc(DBBehaviorAction.timestamp)).limit(20).all()
                
                if sender_stat and recent_actions:
                    # Calculate action frequencies
                    action_counts = {}
                    for action in recent_actions:
                        action_type = action.action_type
                        action_counts[action_type] = action_counts.get(action_type, 0) + 1
                    
                    total_actions = len(recent_actions)
                    
                    # Calculate confidence for each action
                    predictions = {
                        "archive": action_counts.get("archive", 0) / total_actions if total_actions > 0 else 0.0,
                        "important": action_counts.get("important", 0) / total_actions if total_actions > 0 else 0.0,
                        "read": action_counts.get("read", 0) / total_actions if total_actions > 0 else 0.0,
                        "ignore": action_counts.get("ignore", 0) / total_actions if total_actions > 0 else 0.0
                    }
                    
                    # Use importance score to boost important prediction
                    if sender_stat.importance_score > 0.7:
                        predictions["important"] += 0.2
                        predictions["read"] += 0.1
                    elif sender_stat.importance_score < 0.3:
                        predictions["archive"] += 0.2
                        predictions["ignore"] += 0.1
                    
                    # Normalize predictions to sum to 1.0
                    total_pred = sum(predictions.values())
                    if total_pred > 0:
                        predictions = {k: v/total_pred for k, v in predictions.items()}
                    
                    # Find most likely action
                    suggested_action = max(predictions.items(), key=lambda x: x[1])
                    
                    return {
                        "sender_email": sender_email,
                        "importance_score": sender_stat.importance_score,
                        "suggested_action": suggested_action[0],
                        "confidence": suggested_action[1],
                        "predictions": predictions,
                        "data_points": total_actions,
                        "storage": "database"
                    }
            except Exception as db_error:
                print(f"Database prediction failed: {db_error}, falling back to file storage")
        
        # Fallback to file-based storage
        stats = load_sender_stats(user_email)
        log = load_behavior_log(user_email)
        
        sender_data = stats.get(sender_email)
        
        if not sender_data or not log:
            # No data yet, return neutral prediction
            return {
                "sender_email": sender_email,
                "importance_score": 0.5,
                "suggested_action": "read",
                "confidence": 0.3,
                "predictions": {
                    "archive": 0.25,
                    "important": 0.25,
                    "read": 0.3,
                    "ignore": 0.2
                },
                "data_points": 0,
                "message": "Not enough data yet - building your profile!",
                "storage": "file"
            }
        
        # Calculate predictions from file data
        sender_actions = [
            entry for entry in log 
            if entry["sender_email"] == sender_email
        ]
        
        if len(sender_actions) < 3:
            # Not enough data for this sender specifically
            return {
                "sender_email": sender_email,
                "importance_score": sender_data.get("importance_score", 0.5),
                "suggested_action": "read",
                "confidence": 0.4,
                "predictions": {
                    "archive": 0.2,
                    "important": 0.3,
                    "read": 0.4,
                    "ignore": 0.1
                },
                "data_points": len(sender_actions),
                "message": "Learning your preferences for this sender",
                "storage": "file"
            }
        
        # Calculate action frequencies
        action_counts = {}
        for action in sender_actions[-20:]:  # Last 20 actions
            action_type = action["action_type"]
            action_counts[action_type] = action_counts.get(action_type, 0) + 1
        
        total_actions = sum(action_counts.values())
        
        predictions = {
            "archive": action_counts.get("archive", 0) / total_actions if total_actions > 0 else 0.0,
            "important": action_counts.get("important", 0) / total_actions if total_actions > 0 else 0.0,
            "read": action_counts.get("read", 0) / total_actions if total_actions > 0 else 0.0,
            "ignore": action_counts.get("ignore", 0) / total_actions if total_actions > 0 else 0.0
        }
        
        # Adjust based on importance score
        importance_score = sender_data.get("importance_score", 0.5)
        if importance_score > 0.7:
            predictions["important"] += 0.2
            predictions["read"] += 0.1
        elif importance_score < 0.3:
            predictions["archive"] += 0.2
            predictions["ignore"] += 0.1
        
        # Normalize
        total_pred = sum(predictions.values())
        if total_pred > 0:
            predictions = {k: v/total_pred for k, v in predictions.items()}
        
        suggested_action = max(predictions.items(), key=lambda x: x[1])
        
        return {
            "sender_email": sender_email,
            "importance_score": importance_score,
            "suggested_action": suggested_action[0],
            "confidence": suggested_action[1],
            "predictions": predictions,
            "data_points": total_actions,
            "storage": "file"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to predict action: {str(e)}")


@router.get("/auto-archive-candidates")
async def get_auto_archive_candidates(
    user_email: str,
    confidence_threshold: float = 0.7,
    db: Session = Depends(get_db) if DB_AVAILABLE else None
):
    """Get list of senders that user consistently archives
    
    Returns senders where archive action confidence > threshold.
    These are candidates for auto-archive rules (with user approval).
    """
    try:
        candidates = []
        
        # Try database first if available
        if DB_AVAILABLE and db is not None:
            try:
                # Get all sender stats with high archive rate
                sender_stats = db.query(DBSenderStats).filter(
                    DBSenderStats.user_email == user_email,
                    DBSenderStats.total_received >= 5  # At least 5 emails
                ).all()
                
                for stat in sender_stats:
                    archive_rate = stat.archived_count / stat.total_received if stat.total_received > 0 else 0
                    
                    if archive_rate >= confidence_threshold:
                        candidates.append({
                            "sender_email": stat.sender_email,
                            "archive_rate": round(archive_rate, 2),
                            "total_emails": stat.total_received,
                            "archived_count": stat.archived_count,
                            "importance_score": stat.importance_score,
                            "confidence": "high" if archive_rate >= 0.8 else "medium"
                        })
                
                return {
                    "candidates": sorted(candidates, key=lambda x: x["archive_rate"], reverse=True),
                    "total_candidates": len(candidates),
                    "threshold": confidence_threshold,
                    "storage": "database"
                }
            except Exception as db_error:
                print(f"Database query failed: {db_error}, falling back to file storage")
        
        # Fallback to file storage
        stats = load_sender_stats(user_email)
        
        for sender_email, sender_data in stats.items():
            total = sender_data.get("total_emails", 0)
            archived = sender_data.get("archived", 0)
            
            if total >= 5:  # At least 5 emails
                archive_rate = archived / total
                
                if archive_rate >= confidence_threshold:
                    candidates.append({
                        "sender_email": sender_email,
                        "archive_rate": round(archive_rate, 2),
                        "total_emails": total,
                        "archived_count": archived,
                        "importance_score": sender_data.get("importance_score", 0.0),
                        "confidence": "high" if archive_rate >= 0.8 else "medium"
                    })
        
        return {
            "candidates": sorted(candidates, key=lambda x: x["archive_rate"], reverse=True),
            "total_candidates": len(candidates),
            "threshold": confidence_threshold,
            "storage": "file"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get auto-archive candidates: {str(e)}")

