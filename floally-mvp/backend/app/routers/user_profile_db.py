"""
User profile management with database backend
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProfile, UserSettings
import os

router = APIRouter()

class OnboardingAnswers(BaseModel):
    role: str
    priorities: List[str]
    decision_style: str
    communication_style: str
    unsubscribe_preference: str
    work_hours: Dict[str, str] = {}
    display_name: Optional[str] = None
    company: Optional[str] = None

@router.get("/profile")
async def get_user_profile(user_email: str, db: Session = Depends(get_db)):
    """Get the user's profile and preferences"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        
        if not user:
            # Return default profile for new users
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
        
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile:
            # User exists but no profile yet
            return {
                "user_id": user.email,
                "display_name": user.display_name,
                "onboarding_completed": False,
                "role": None,
                "priorities": [],
                "decision_style": None,
                "communication_style": None,
                "unsubscribe_preference": None,
                "work_hours": None
            }
        
        # Return complete profile
        return {
            "user_id": user.email,
            "display_name": user.display_name,
            "role": profile.role,
            "company": profile.company,
            "priorities": profile.priorities or [],
            "decision_style": profile.decision_style,
            "communication_style": profile.communication_style,
            "unsubscribe_preference": profile.unsubscribe_preference,
            "work_hours": profile.work_hours,
            "timezone": profile.timezone,
            "language": profile.language,
            "onboarding_completed": profile.onboarding_completed,
            "goals": profile.goals or []
        }
    except Exception as e:
        # Fallback to file-based storage if database fails
        return get_user_profile_fallback(user_email)

@router.post("/profile/onboarding")
async def complete_onboarding(user_email: str, answers: OnboardingAnswers, db: Session = Depends(get_db)):
    """Save user's onboarding answers"""
    try:
        print(f"📝 Onboarding request for: {user_email}")
        print(f"   Answers: {answers.dict()}")
        
        # Get or create user
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            print(f"   Creating new user...")
            user = User(email=user_email, display_name=answers.display_name)
            db.add(user)
            db.flush()
        elif answers.display_name:
            user.display_name = answers.display_name
        
        print(f"   User ID: {user.id}")
        
        # Get or create profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if not profile:
            print(f"   Creating new profile...")
            profile = UserProfile(user_id=user.id)
            db.add(profile)
        
        # Update profile
        profile.role = answers.role
        profile.company = answers.company
        profile.priorities = answers.priorities
        profile.decision_style = answers.decision_style
        profile.communication_style = answers.communication_style
        profile.unsubscribe_preference = answers.unsubscribe_preference
        profile.work_hours = answers.work_hours
        profile.onboarding_completed = True
        
        print(f"   Set onboarding_completed = True")
        
        # Ensure user has settings
        settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        if not settings:
            settings = UserSettings(user_id=user.id)
            db.add(settings)
        
        db.commit()
        print(f"✅ Onboarding saved successfully for {user_email}")
        
        return {
            "success": True,
            "message": "Onboarding completed! Aime now understands you better.",
            "profile": {
                "user_id": user.email,
                "display_name": user.display_name,
                "role": profile.role,
                "priorities": profile.priorities,
                "decision_style": profile.decision_style,
                "communication_style": profile.communication_style,
                "unsubscribe_preference": profile.unsubscribe_preference,
                "work_hours": profile.work_hours,
                "onboarding_completed": profile.onboarding_completed
            }
        }
    except Exception as e:
        db.rollback()
        print(f"❌ Error saving onboarding for {user_email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
async def update_user_profile(user_email: str, updates: Dict, db: Session = Depends(get_db)):
    """Update specific fields in the user's profile"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            user = User(email=user_email)
            db.add(user)
            db.flush()
        
        # Update user fields
        if 'display_name' in updates:
            user.display_name = updates['display_name']
        if 'avatar_url' in updates:
            user.avatar_url = updates['avatar_url']
        
        # Get or create profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if not profile:
            profile = UserProfile(user_id=user.id)
            db.add(profile)
        
        # Update profile fields
        profile_fields = ['role', 'company', 'priorities', 'decision_style', 'communication_style',
                         'unsubscribe_preference', 'work_hours', 'timezone', 'language', 'goals']
        for field in profile_fields:
            if field in updates:
                setattr(profile, field, updates[field])
        
        db.commit()
        
        return {
            "success": True,
            "profile": {
                "user_id": user.email,
                "display_name": user.display_name,
                "role": profile.role,
                "priorities": profile.priorities,
                "onboarding_completed": profile.onboarding_completed
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/insights")
async def get_ally_insights(user_email: str, db: Session = Depends(get_db)):
    """Get Aime's understanding of the user in natural language"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        
        if not user:
            return {
                "insight": "I'm still getting to know you! Complete the onboarding to help me understand your preferences.",
                "has_profile": False
            }
        
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        if not profile or not profile.onboarding_completed:
            return {
                "insight": "I'm still getting to know you! Complete the onboarding to help me understand your preferences.",
                "has_profile": False
            }
        
        # Generate insight text
        insights = []
        
        if profile.role:
            insights.append(f"You're a {profile.role}")
        
        if profile.priorities:
            priorities_text = ", ".join(profile.priorities)
            insights.append(f"Your top priorities are: {priorities_text}")
        
        if profile.decision_style:
            style_map = {
                "data_driven": "you prefer data-driven decisions",
                "intuitive": "you trust your intuition",
                "collaborative": "you value collaborative decision-making",
                "decisive": "you make quick, decisive choices"
            }
            insights.append(style_map.get(profile.decision_style, f"your decision style is {profile.decision_style}"))
        
        if profile.communication_style:
            comm_map = {
                "detailed": "you appreciate detailed information",
                "concise": "you prefer concise summaries",
                "visual": "you like visual presentations",
                "conversational": "you enjoy conversational style"
            }
            insights.append(comm_map.get(profile.communication_style, f"you prefer {profile.communication_style} communication"))
        
        insight_text = "I understand that " + ", and ".join(insights) + "."
        
        return {
            "insight": insight_text,
            "has_profile": True,
            "role": profile.role,
            "priorities": profile.priorities,
            "decision_style": profile.decision_style,
            "communication_style": profile.communication_style
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Fallback to file-based storage
def get_user_profile_fallback(user_email: str):
    """Fallback to file-based storage if database is not available"""
    import json
    from pathlib import Path
    
    profiles_dir = Path("user_profiles")
    safe_email = user_email.replace('@', '_at_').replace('.', '_')
    profile_path = profiles_dir / f"{safe_email}.json"
    
    if profile_path.exists():
        with open(profile_path) as f:
            return json.load(f)
    
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
