"""
User profile management with database backend
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserProfile, UserSettings
from app.models.user import ConnectedAccount
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
            "avatar_url": user.avatar_url,
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

@router.get("/connected-accounts")
async def get_connected_accounts(user_email: str, db: Session = Depends(get_db)):
    """Get all connected accounts for a user"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {"accounts": []}
        
        accounts = db.query(ConnectedAccount).filter(
            ConnectedAccount.user_id == user.id
        ).all()
        
        return {
            "accounts": [
                {
                    "id": str(acc.id),
                    "provider": acc.provider,
                    "email": acc.email,
                    "is_primary": acc.is_primary,
                    "created_at": acc.created_at.isoformat(),
                    "updated_at": acc.updated_at.isoformat(),
                    "scopes": acc.scopes or []
                }
                for acc in accounts
            ]
        }
    except Exception as e:
        print(f"❌ Error loading connected accounts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/connected-accounts/{account_id}")
async def disconnect_account(account_id: str, db: Session = Depends(get_db)):
    """Disconnect a connected account"""
    try:
        import uuid
        account = db.query(ConnectedAccount).filter(
            ConnectedAccount.id == uuid.UUID(account_id)
        ).first()
        
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        db.delete(account)
        db.commit()
        
        return {"success": True, "message": "Account disconnected successfully"}
    except Exception as e:
        db.rollback()
        print(f"❌ Error disconnecting account: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings")
async def get_user_settings(user_email: str, db: Session = Depends(get_db)):
    """Get user settings"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {
                "ai_preferences": {},
                "notification_preferences": {},
                "privacy_settings": {}
            }
        
        settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        if not settings:
            # Return defaults
            return {
                "ai_preferences": {
                    "model": "claude-3-haiku",
                    "tone": "warm_friendly",
                    "verbosity": "concise"
                },
                "notification_preferences": {
                    "email_digest": {"enabled": True, "frequency": "daily"}
                },
                "privacy_settings": {
                    "behavioral_learning": True
                }
            }
        
        return {
            "ai_preferences": settings.ai_preferences or {},
            "notification_preferences": settings.notification_preferences or {},
            "privacy_settings": settings.privacy_settings or {}
        }
    except Exception as e:
        print(f"❌ Error loading settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/profile")
async def delete_user_profile(user_email: str, db: Session = Depends(get_db)):
    """Delete user profile and all associated data"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"🗑️ Deleting user account: {user_email}")
        
        # SQLAlchemy will cascade delete all related records:
        # - UserProfile
        # - ConnectedAccount
        # - BehaviorAction
        # - UserSettings
        # - SenderStats
        db.delete(user)
        db.commit()
        
        print(f"✅ User account deleted: {user_email}")
        return {"success": True, "message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delete-feedback")
async def save_delete_feedback(feedback: Dict, db: Session = Depends(get_db)):
    """Save user feedback when deleting account"""
    try:
        # Log feedback for analysis
        import json
        print(f"📋 Delete feedback from {feedback.get('user_email')}:")
        print(f"   Reason: {feedback.get('reason')}")
        print(f"   Details: {feedback.get('details')}")
        print(f"   Would recommend: {feedback.get('would_recommend')}")
        
        # TODO: Store in a feedback table for analysis
        # For now, just log it
        
        return {"success": True, "message": "Feedback received"}
    except Exception as e:
        print(f"❌ Error saving feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))
