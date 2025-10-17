from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import json
import os
from pathlib import Path
from datetime import datetime

router = APIRouter()

# Import from other routers
PROFILE_DIR = "user_profiles"
BEHAVIOR_DIR = Path("behavior_data")

def get_profile_path(user_email: str) -> str:
    """Get the file path for a user's profile"""
    os.makedirs(PROFILE_DIR, exist_ok=True)
    safe_email = user_email.replace('@', '_at_').replace('.', '_')
    return os.path.join(PROFILE_DIR, f"{safe_email}.json")

def get_user_behavior_file(user_email: str) -> Path:
    """Get path to user's behavior log file"""
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

def load_sender_stats(user_email: str) -> dict:
    """Load sender statistics"""
    file_path = get_user_sender_stats_file(user_email)
    if file_path.exists():
        with open(file_path, 'r') as f:
            return json.load(f)
    return {}

@router.get("/overview")
async def get_profile_overview(user_email: str):
    """
    Get comprehensive profile overview combining:
    - User profile data
    - Behavioral insights
    - Learning status
    - Goals progress
    """
    try:
        profile_path = get_profile_path(user_email)
        
        # Load profile
        if os.path.exists(profile_path):
            with open(profile_path, 'r') as f:
                profile = json.load(f)
        else:
            profile = {
                "user_id": user_email,
                "onboarding_completed": False
            }
        
        # Load behavioral data
        behavior_log = load_behavior_log(user_email)
        sender_stats = load_sender_stats(user_email)
        
        # Calculate learning status
        total_actions = len(behavior_log)
        
        if total_actions < 50:
            confidence_level = "low"
            confidence_message = f"Need {50 - total_actions} more actions for better predictions"
        elif total_actions < 150:
            confidence_level = "medium"
            confidence_message = f"{150 - total_actions} more actions until high confidence"
        else:
            confidence_level = "high"
            confidence_message = "Aime has strong understanding of your patterns"
        
        # Calculate days active
        if behavior_log:
            first_action = datetime.fromisoformat(behavior_log[0]["timestamp"])
            days_active = (datetime.now() - first_action).days + 1
        else:
            days_active = 0
        
        # Get top senders by importance
        sorted_senders = sorted(
            sender_stats.values(),
            key=lambda x: x["importance_score"],
            reverse=True
        )
        top_senders = sorted_senders[:10]
        
        # Action breakdown
        action_counts = {}
        for entry in behavior_log:
            action_type = entry["action_type"]
            action_counts[action_type] = action_counts.get(action_type, 0) + 1
        
        # Newsletter analysis
        newsletter_senders = {k: v for k, v in sender_stats.items() if v.get("unsubscribed", 0) > 0 or k.endswith("newsletter") or "mail" in k.lower()}
        total_newsletters = len([s for s in sender_stats.values() if s.get("total_emails", 0) > 2 and s.get("importance_score", 0.5) < 0.2])
        
        # Generate goals progress (if goals exist)
        goals_progress = []
        if "goals" in profile:
            for goal in profile["goals"]:
                progress = {
                    "goal": goal,
                    "progress_percent": 0
                }
                
                # Calculate progress based on goal type
                if goal["goal_type"] == "unsubscribe_count":
                    unsubscribed_count = action_counts.get("unsubscribe", 0)
                    target = goal.get("target_value", 20)
                    progress["progress_percent"] = min(100, int((unsubscribed_count / target) * 100))
                    progress["current"] = unsubscribed_count
                    progress["target"] = target
                
                goals_progress.append(progress)
        
        return {
            "profile": profile,
            "learning_status": {
                "total_actions": total_actions,
                "days_active": days_active,
                "confidence_level": confidence_level,
                "confidence_message": confidence_message,
                "last_action": behavior_log[-1]["timestamp"] if behavior_log else None
            },
            "behavioral_insights": {
                "top_important_senders": top_senders,
                "action_breakdown": action_counts,
                "total_senders": len(sender_stats),
                "newsletter_stats": {
                    "total_newsletters": total_newsletters,
                    "unsubscribed": action_counts.get("unsubscribe", 0)
                }
            },
            "goals_progress": goals_progress,
            "quick_stats": {
                "emails_marked_important": action_counts.get("important", 0),
                "emails_archived": action_counts.get("archive", 0),
                "responses_drafted": action_counts.get("respond", 0),
                "newsletters_unsubscribed": action_counts.get("unsubscribe", 0)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile overview: {str(e)}")

@router.get("/behavioral-insights")
async def get_detailed_behavioral_insights(user_email: str):
    """
    Get detailed behavioral insights with patterns and recommendations
    """
    try:
        behavior_log = load_behavior_log(user_email)
        sender_stats = load_sender_stats(user_email)
        
        if not behavior_log:
            return {
                "message": "Not enough data yet. Keep using Aime to build insights!",
                "recommendations": []
            }
        
        # Analyze patterns
        insights = []
        recommendations = []
        
        # 1. Response time patterns
        respond_actions = [a for a in behavior_log if a["action_type"] == "respond"]
        if len(respond_actions) >= 5:
            insights.append({
                "category": "Response Patterns",
                "insight": f"You've drafted {len(respond_actions)} responses through Aime",
                "metric_value": len(respond_actions),
                "icon": "📧"
            })
        
        # 2. Important sender patterns
        high_importance_senders = [s for s in sender_stats.values() if s["importance_score"] > 0.7]
        if high_importance_senders:
            top_3 = sorted(high_importance_senders, key=lambda x: x["importance_score"], reverse=True)[:3]
            insights.append({
                "category": "VIP Senders",
                "insight": f"You consistently prioritize emails from {len(high_importance_senders)} senders",
                "details": [{"sender": s["sender_email"], "score": s["importance_score"]} for s in top_3],
                "icon": "⭐"
            })
            recommendations.append({
                "type": "auto_important",
                "message": f"Auto-mark emails from {top_3[0]['sender_email']} as important?",
                "confidence": top_3[0]["importance_score"]
            })
        
        # 3. Newsletter cleanup opportunities
        low_engagement_senders = [
            s for s in sender_stats.values() 
            if s["total_emails"] > 3 
            and s["importance_score"] < 0.2 
            and s["archived"] > 2
        ]
        if low_engagement_senders:
            insights.append({
                "category": "Newsletter Cleanup",
                "insight": f"{len(low_engagement_senders)} senders with low engagement (candidates for unsubscribe)",
                "metric_value": len(low_engagement_senders),
                "icon": "🗑️"
            })
            for sender in low_engagement_senders[:3]:
                recommendations.append({
                    "type": "unsubscribe",
                    "message": f"Unsubscribe from {sender['sender_email']}? You've archived {sender['archived']} of their emails",
                    "sender": sender["sender_email"],
                    "confidence": 1 - sender["importance_score"]
                })
        
        # 4. Archive patterns
        archive_count = sum(1 for a in behavior_log if a["action_type"] == "archive")
        if archive_count > 20:
            insights.append({
                "category": "Inbox Management",
                "insight": f"You're actively managing your inbox - {archive_count} emails archived",
                "metric_value": archive_count,
                "icon": "📥"
            })
        
        # 5. Calculate email processing time saved
        total_actions = len(behavior_log)
        estimated_time_saved = total_actions * 1.5  # Assume 1.5 min saved per action
        insights.append({
            "category": "Time Saved",
            "insight": f"Estimated {int(estimated_time_saved)} minutes saved using Aime's quick actions",
            "metric_value": int(estimated_time_saved),
            "unit": "minutes",
            "icon": "⏱️"
        })
        
        return {
            "insights": insights,
            "recommendations": recommendations,
            "total_insights": len(insights),
            "total_recommendations": len(recommendations)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")
