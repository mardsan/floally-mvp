from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from collections import defaultdict
import json
import os
from typing import Dict, List, Any

router = APIRouter()

def load_user_behavior(email: str) -> Dict:
    """Load user behavior data from JSON file"""
    behavior_file = f"behavior_data/{email.replace('@', '_at_').replace('.', '_')}_behavior.json"
    if os.path.exists(behavior_file):
        with open(behavior_file, 'r') as f:
            return json.load(f)
    return {"actions": []}

def calculate_insights(behavior_data: Dict, email: str) -> Dict[str, Any]:
    """Calculate behavioral insights from tracking data"""
    actions = behavior_data.get("actions", [])
    
    if not actions:
        return {
            "total_actions": 0,
            "days_active": 0,
            "action_breakdown": {},
            "top_senders": [],
            "response_patterns": {},
            "confidence_score": 0
        }
    
    # Action breakdown
    action_counts = defaultdict(int)
    sender_actions = defaultdict(lambda: defaultdict(int))
    domain_actions = defaultdict(int)
    daily_actions = defaultdict(int)
    
    for action in actions:
        action_type = action.get("action")
        sender = action.get("sender", "Unknown")
        timestamp = action.get("timestamp", "")
        
        action_counts[action_type] += 1
        sender_actions[sender][action_type] += 1
        
        # Extract domain
        if "@" in sender:
            domain = sender.split("@")[1]
            domain_actions[domain] += 1
        
        # Daily activity
        if timestamp:
            try:
                date = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).date()
                daily_actions[str(date)] += 1
            except:
                pass
    
    # Top senders (by total actions)
    top_senders = sorted(
        [{"sender": sender, "actions": sum(acts.values()), "breakdown": dict(acts)} 
         for sender, acts in sender_actions.items()],
        key=lambda x: x["actions"],
        reverse=True
    )[:10]
    
    # Calculate days active
    unique_dates = set(daily_actions.keys())
    days_active = len(unique_dates)
    
    # Response patterns (focus vs archive ratio)
    focus_count = action_counts.get("focus", 0)
    archive_count = action_counts.get("archive", 0)
    total_decisions = focus_count + archive_count
    
    response_patterns = {
        "focus_rate": round(focus_count / total_decisions * 100, 1) if total_decisions > 0 else 0,
        "archive_rate": round(archive_count / total_decisions * 100, 1) if total_decisions > 0 else 0,
        "total_decisions": total_decisions
    }
    
    # Confidence score (based on number of actions)
    confidence_score = min(100, (len(actions) / 50) * 100)  # 50 actions = 100% confidence
    
    return {
        "total_actions": len(actions),
        "days_active": days_active,
        "action_breakdown": dict(action_counts),
        "top_senders": top_senders,
        "top_domains": sorted(
            [{"domain": d, "count": c} for d, c in domain_actions.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5],
        "response_patterns": response_patterns,
        "daily_activity": dict(sorted(daily_actions.items())[-30:]),  # Last 30 days
        "confidence_score": round(confidence_score, 1),
        "learning_status": "building" if confidence_score < 50 else "active" if confidence_score < 80 else "confident"
    }

@router.get("/behavioral")
async def get_behavioral_insights(user_email: str):
    """Get behavioral insights and patterns for the current user"""
    try:
        email = user_email
        
        # Load behavior data
        behavior_data = load_user_behavior(email)
        
        # Calculate insights
        insights = calculate_insights(behavior_data, email)
        
        # Load user profile for additional context
        profile_file = f"user_profiles/{email.replace('@', '_at_').replace('.', '_')}.json"
        profile_context = {}
        if os.path.exists(profile_file):
            with open(profile_file, 'r') as f:
                profile = json.load(f)
                profile_context = {
                    "role": profile.get("role", ""),
                    "priorities": profile.get("priorities", []),
                    "decision_style": profile.get("decision_style", ""),
                    "communication_style": profile.get("communication_style", "")
                }
        
        return {
            "insights": insights,
            "profile_context": profile_context,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

@router.get("/overview")
async def get_profile_overview(user_email: str):
    """Get quick overview stats for profile dashboard"""
    try:
        email = user_email
        
        # Load profile
        profile_file = f"user_profiles/{email.replace('@', '_at_').replace('.', '_')}.json"
        if not os.path.exists(profile_file):
            raise HTTPException(status_code=404, detail="Profile not found")
        
        with open(profile_file, 'r') as f:
            profile = json.load(f)
        
        # Load behavior data
        behavior_data = load_user_behavior(email)
        actions = behavior_data.get("actions", [])
        
        # Recent activity (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_actions = []
        for a in actions:
            try:
                action_time = datetime.fromisoformat(a.get("timestamp", "").replace('Z', '+00:00'))
                if action_time > seven_days_ago:
                    recent_actions.append(a)
            except:
                pass
        
        return {
            "user_info": {
                "email": email,
                "role": profile.get("role", ""),
                "onboarding_completed": profile.get("onboarding_completed", False)
            },
            "quick_stats": {
                "total_actions": len(actions),
                "recent_actions_7d": len(recent_actions),
                "priorities_set": len(profile.get("priorities", [])),
                "integrations_connected": 1  # Gmail for now
            },
            "aimy_understanding": profile.get("aimy_insights", ""),
            "last_active": actions[-1].get("timestamp") if actions else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load overview: {str(e)}")
