from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
from datetime import datetime

router = APIRouter()

# Simple file-based storage for MVP (replace with database later)
PROFILE_DIR = "user_profiles"

class UserProfile(BaseModel):
    user_id: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    timezone: str = "America/Los_Angeles"
    language: str = "en"
    priorities: List[str] = []
    decision_style: Optional[str] = None
    communication_style: Optional[str] = None
    unsubscribe_preference: Optional[str] = None
    work_hours: Optional[Dict[str, str]] = None
    onboarding_completed: bool = False
    goals: List[Dict[str, Any]] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Goal(BaseModel):
    goal_type: str  # inbox_zero, response_time, unsubscribe_count
    goal_text: str
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    deadline: Optional[str] = None
    status: str = "active"  # active, completed, archived

class Settings(BaseModel):
    ai_preferences: Dict[str, Any] = {
        "model": "claude-3-haiku",
        "tone": "warm_friendly",
        "verbosity": "concise",
        "auto_suggestions": True,
        "confidence_threshold": 0.8
    }
    notification_preferences: Dict[str, Any] = {
        "email_digest": {"enabled": True, "frequency": "daily", "time": "08:00"},
        "slack_notifications": {"enabled": False, "events": []},
        "browser_notifications": {"enabled": True, "events": ["important_email"]}
    }
    privacy_settings: Dict[str, Any] = {
        "behavioral_learning": True,
        "data_retention_days": 365,
        "share_anonymous_usage": False,
        "allow_ai_training": False
    }
    email_management: Dict[str, Any] = {
        "unsubscribe_preference": "ask_before",
        "auto_archive_promotional": False,
        "newsletter_digest": {"enabled": False, "frequency": "weekly"}
    }

class OnboardingAnswers(BaseModel):
    role: str
    priorities: List[str]
    decision_style: str
    communication_style: str
    unsubscribe_preference: str
    work_hours: Dict[str, str] = {}
    display_name: Optional[str] = None
    company: Optional[str] = None

def get_profile_path(user_email: str) -> str:
    """Get the file path for a user's profile"""
    os.makedirs(PROFILE_DIR, exist_ok=True)
    safe_email = user_email.replace('@', '_at_').replace('.', '_')
    return os.path.join(PROFILE_DIR, f"{safe_email}.json")

@router.get("/profile")
async def get_user_profile(user_email: str):
    """Get the user's profile and preferences"""
    try:
        profile_path = get_profile_path(user_email)
        
        if os.path.exists(profile_path):
            with open(profile_path, 'r') as f:
                profile_data = json.load(f)
            return profile_data
        else:
            # Return default profile
            return {
                "user_id": user_email,
                "onboarding_completed": False,
                "role": None,
                "priorities": [],
                "decision_style": None,
                "communication_style": None,
                "unsubscribe_preference": None,
                "work_hours": None
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile/onboarding")
async def complete_onboarding(user_email: str, answers: OnboardingAnswers):
    """Save user's onboarding answers"""
    try:
        profile = {
            "user_id": user_email,
            "display_name": answers.display_name,
            "role": answers.role,
            "priorities": answers.priorities,
            "decision_style": answers.decision_style,
            "communication_style": answers.communication_style,
            "unsubscribe_preference": answers.unsubscribe_preference,
            "work_hours": answers.work_hours,
            "onboarding_completed": True
        }
        
        profile_path = get_profile_path(user_email)
        with open(profile_path, 'w') as f:
            json.dump(profile, f, indent=2)
        
        return {
            "success": True,
            "message": "Onboarding completed! Ally now understands you better.",
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
async def update_user_profile(user_email: str, updates: Dict):
    """Update specific fields in the user's profile"""
    try:
        profile_path = get_profile_path(user_email)
        
        # Load existing profile
        if os.path.exists(profile_path):
            with open(profile_path, 'r') as f:
                profile = json.load(f)
        else:
            profile = {
                "user_id": user_email,
                "onboarding_completed": False
            }
        
        # Update fields
        for key, value in updates.items():
            profile[key] = value
        
        # Save
        with open(profile_path, 'w') as f:
            json.dump(profile, f, indent=2)
        
        return {
            "success": True,
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/insights")
async def get_ally_insights(user_email: str):
    """Get Ally's understanding of the user in natural language"""
    try:
        profile_path = get_profile_path(user_email)
        
        if not os.path.exists(profile_path):
            return {
                "insight": "I'm still getting to know you! Complete the onboarding to help me understand your preferences.",
                "has_profile": False
            }
        
        with open(profile_path, 'r') as f:
            profile = json.load(f)
        
        if not profile.get('onboarding_completed'):
            return {
                "insight": "I'm still getting to know you! Complete the onboarding to help me understand your preferences.",
                "has_profile": False
            }
        
        # Generate natural language insight
        role = profile.get('role', 'professional')
        priorities = profile.get('priorities', [])
        comm_style = profile.get('communication_style', 'balanced')
        decision_style = profile.get('decision_style', 'analytical')
        
        priorities_text = ", ".join(priorities[:2]) if len(priorities) >= 2 else priorities[0] if priorities else "your work"
        
        insight = f"You're a {role} who values {priorities_text}. "
        
        if comm_style == "concise_direct":
            insight += "You prefer direct, to-the-point communication. "
        elif comm_style == "warm_friendly":
            insight += "You like warm, friendly interactions. "
        elif comm_style == "formal_professional":
            insight += "You prefer formal, professional communication. "
        else:
            insight += "You appreciate casual, conversational exchanges. "
        
        if decision_style == "options_with_context":
            insight += "When making decisions, you like to see options with detailed context."
        elif decision_style == "just_recommend":
            insight += "You prefer clear recommendations over lengthy analysis."
        elif decision_style == "ask_questions":
            insight += "You like to explore decisions through questions and discussion."
        else:
            insight += "You like to review data before making decisions."
        
        return {
            "insight": insight,
            "has_profile": True,
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile/goals")
async def add_goal(user_email: str, goal: Goal):
    """Add a new goal for the user"""
    try:
        profile_path = get_profile_path(user_email)
        
        # Load existing profile
        if os.path.exists(profile_path):
            with open(profile_path, 'r') as f:
                profile = json.load(f)
        else:
            profile = {"user_id": user_email, "goals": []}
        
        # Initialize goals list if not exists
        if "goals" not in profile:
            profile["goals"] = []
        
        # Add new goal
        goal_data = goal.dict()
        goal_data["created_at"] = datetime.now().isoformat()
        profile["goals"].append(goal_data)
        
        # Save
        with open(profile_path, 'w') as f:
            json.dump(profile, f, indent=2)
        
        return {
            "success": True,
            "goal": goal_data,
            "total_goals": len(profile["goals"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/goals")
async def get_goals(user_email: str):
    """Get all goals for a user"""
    try:
        profile_path = get_profile_path(user_email)
        
        if os.path.exists(profile_path):
            with open(profile_path, 'r') as f:
                profile = json.load(f)
            return {
                "goals": profile.get("goals", []),
                "total": len(profile.get("goals", []))
            }
        else:
            return {"goals": [], "total": 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile/goals/{goal_index}")
async def update_goal(user_email: str, goal_index: int, updates: Dict):
    """Update a specific goal"""
    try:
        profile_path = get_profile_path(user_email)
        
        if not os.path.exists(profile_path):
            raise HTTPException(status_code=404, detail="Profile not found")
        
        with open(profile_path, 'r') as f:
            profile = json.load(f)
        
        if "goals" not in profile or goal_index >= len(profile["goals"]):
            raise HTTPException(status_code=404, detail="Goal not found")
        
        # Update goal
        for key, value in updates.items():
            profile["goals"][goal_index][key] = value
        
        # Save
        with open(profile_path, 'w') as f:
            json.dump(profile, f, indent=2)
        
        return {
            "success": True,
            "goal": profile["goals"][goal_index]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings")
async def get_settings(user_email: str):
    """Get user settings"""
    try:
        # Check for settings file
        settings_path = get_profile_path(user_email).replace('.json', '_settings.json')
        
        if os.path.exists(settings_path):
            with open(settings_path, 'r') as f:
                return json.load(f)
        else:
            # Return defaults
            default_settings = Settings()
            return default_settings.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings")
async def update_settings(user_email: str, settings: Settings):
    """Update user settings"""
    try:
        settings_path = get_profile_path(user_email).replace('.json', '_settings.json')
        
        # Save settings
        with open(settings_path, 'w') as f:
            json.dump(settings.dict(), f, indent=2)
        
        return {
            "success": True,
            "settings": settings.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/integrations")
async def get_integrations(user_email: str):
    """Get user's connected integrations"""
    try:
        # Check for integrations file
        integrations_path = get_profile_path(user_email).replace('.json', '_integrations.json')
        
        if os.path.exists(integrations_path):
            with open(integrations_path, 'r') as f:
                integrations = json.load(f)
        else:
            # Return default integrations status
            integrations = {
                "gmail": {
                    "service": "gmail",
                    "status": "connected",
                    "connected_at": datetime.now().isoformat(),
                    "email": user_email,
                    "scopes": ["gmail.readonly", "gmail.modify", "gmail.labels"],
                    "health": "healthy",
                    "last_sync": datetime.now().isoformat()
                },
                "google_calendar": {
                    "service": "google_calendar",
                    "status": "connected",
                    "connected_at": datetime.now().isoformat(),
                    "email": user_email,
                    "scopes": ["calendar.readonly"],
                    "health": "healthy",
                    "last_sync": datetime.now().isoformat()
                },
                "microsoft_outlook": {
                    "service": "microsoft_outlook",
                    "status": "not_connected",
                    "available": True,
                    "description": "Connect your Outlook email and calendar"
                },
                "slack": {
                    "service": "slack",
                    "status": "not_connected",
                    "available": True,
                    "description": "Get Ally notifications in Slack"
                },
                "discord": {
                    "service": "discord",
                    "status": "not_connected",
                    "available": False,
                    "coming_soon": True,
                    "description": "Get Ally updates in Discord (Coming Soon)"
                }
            }
            
            # Save default integrations
            with open(integrations_path, 'w') as f:
                json.dump(integrations, f, indent=2)
        
        return {
            "integrations": list(integrations.values()),
            "total_connected": sum(1 for i in integrations.values() if i.get("status") == "connected")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
