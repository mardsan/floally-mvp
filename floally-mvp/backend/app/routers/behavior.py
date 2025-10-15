from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import json
import os
from pathlib import Path

router = APIRouter()

class BehaviorAction(BaseModel):
    user_email: str
    email_id: str
    sender_email: str
    sender_domain: str
    action_type: str  # important, unimportant, archive, trash, respond, unsubscribe
    email_category: str  # primary, promotional, social, updates, forums, newsletter
    has_unsubscribe: bool = False
    confidence_score: float = 0.0  # From AI analysis (0-1)

class SenderStats(BaseModel):
    sender_email: str
    sender_domain: str
    total_emails: int = 0
    marked_important: int = 0
    marked_unimportant: int = 0
    archived: int = 0
    responded: int = 0
    importance_score: float = 0.0  # Calculated: important / (important + unimportant + archived)

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
            "marked_unimportant": 0,
            "archived": 0,
            "responded": 0,
            "trashed": 0,
            "unsubscribed": 0,
            "importance_score": 0.0
        }
    
    # Increment counters
    stats[sender_key]["total_emails"] += 1
    
    if action.action_type == "important":
        stats[sender_key]["marked_important"] += 1
    elif action.action_type == "unimportant":
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
    # Formula: (important * 2 + respond * 1.5) / (important + unimportant + archive + trash + respond)
    important = stats[sender_key]["marked_important"]
    unimportant = stats[sender_key]["marked_unimportant"]
    archived = stats[sender_key]["archived"]
    trashed = stats[sender_key]["trashed"]
    responded = stats[sender_key]["responded"]
    
    total_actions = important + unimportant + archived + trashed + responded
    
    if total_actions > 0:
        importance_score = (important * 2.0 + responded * 1.5) / total_actions
        # Normalize to 0-1 range
        stats[sender_key]["importance_score"] = min(1.0, importance_score / 2.0)
    else:
        stats[sender_key]["importance_score"] = 0.5  # Neutral
    
    save_sender_stats(user_email, stats)
    return stats[sender_key]

@router.post("/log-action")
async def log_action(action: BehaviorAction):
    """Log a user action on an email for behavioral learning"""
    try:
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
            "message": "Action logged successfully",
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
                "message": "Not enough data yet. Keep using Ally to build insights!",
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
