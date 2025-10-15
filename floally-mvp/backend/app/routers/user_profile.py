from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os

router = APIRouter()

# Simple file-based storage for MVP (replace with database later)
PROFILE_DIR = "user_profiles"

class UserProfile(BaseModel):
    user_id: str
    role: Optional[str] = None
    priorities: List[str] = []
    decision_style: Optional[str] = None
    communication_style: Optional[str] = None
    unsubscribe_preference: Optional[str] = None
    work_hours: Optional[Dict[str, str]] = None
    onboarding_completed: bool = False

class OnboardingAnswers(BaseModel):
    role: str
    priorities: List[str]
    decision_style: str
    communication_style: str
    unsubscribe_preference: str
    work_hours: Dict[str, str]

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
