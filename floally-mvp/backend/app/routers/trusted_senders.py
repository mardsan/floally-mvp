"""
Trusted Senders API
Manage sender trust for attachment processing
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.user import User
from app.models.trusted_sender import TrustedSender, TrustLevel


router = APIRouter(prefix="/api/trusted-senders", tags=["trusted-senders"])


class TrustedSenderCreate(BaseModel):
    sender_email: str
    sender_name: Optional[str] = None
    trust_level: TrustLevel = TrustLevel.TRUSTED


class TrustedSenderUpdate(BaseModel):
    trust_level: Optional[TrustLevel] = None
    sender_name: Optional[str] = None


class TrustedSenderResponse(BaseModel):
    id: int
    sender_email: str
    sender_name: Optional[str]
    trust_level: TrustLevel
    created_at: datetime
    last_used: Optional[datetime]
    attachment_count: int

    class Config:
        from_attributes = True


@router.get("/{user_email}", response_model=List[TrustedSenderResponse])
async def get_trusted_senders(user_email: str, db: Session = Depends(get_db)):
    """Get all trusted senders for a user"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    trusted_senders = db.query(TrustedSender).filter(
        TrustedSender.user_id == user.id
    ).order_by(TrustedSender.last_used.desc()).all()
    
    return trusted_senders


@router.post("/{user_email}", response_model=TrustedSenderResponse)
async def add_trusted_sender(
    user_email: str,
    sender: TrustedSenderCreate,
    db: Session = Depends(get_db)
):
    """Add or update sender trust level"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if already exists
        existing = db.query(TrustedSender).filter(
            TrustedSender.user_id == user.id,
            TrustedSender.sender_email == sender.sender_email
        ).first()
        
        if existing:
            # Update existing trust level
            existing.trust_level = sender.trust_level
            if sender.sender_name:
                setattr(existing, 'sender_name', sender.sender_name)
            db.commit()
            db.refresh(existing)
            return existing
        
        # Create new
        trusted_sender = TrustedSender(
            user_id=user.id,
            sender_email=sender.sender_email,
            sender_name=sender.sender_name,
            trust_level=sender.trust_level
        )
        db.add(trusted_sender)
        db.commit()
        db.refresh(trusted_sender)
        
        return trusted_sender
    except Exception as e:
        # If trusted_senders table doesn't exist, rollback and return error
        db.rollback()
        print(f"❌ Error adding trusted sender: {e}")
        raise HTTPException(
            status_code=503, 
            detail="Trusted senders feature temporarily unavailable. Table not yet created."
        )


@router.patch("/{user_email}/{sender_email}", response_model=TrustedSenderResponse)
async def update_trusted_sender(
    user_email: str,
    sender_email: str,
    update: TrustedSenderUpdate,
    db: Session = Depends(get_db)
):
    """Update trust level for a sender"""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        trusted_sender = db.query(TrustedSender).filter(
            TrustedSender.user_id == user.id,
            TrustedSender.sender_email == sender_email
        ).first()
        
        if not trusted_sender:
            raise HTTPException(status_code=404, detail="Trusted sender not found")
        
        if update.trust_level is not None:
            trusted_sender.trust_level = update.trust_level
        if update.sender_name is not None:
            setattr(trusted_sender, 'sender_name', update.sender_name)
        
        db.commit()
        db.refresh(trusted_sender)
        
        return trusted_sender
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating trusted sender: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_email}/{sender_email}")
async def remove_trusted_sender(
    user_email: str,
    sender_email: str,
    db: Session = Depends(get_db)
):
    """Remove a sender from trusted list (reset to unknown)"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    trusted_sender = db.query(TrustedSender).filter(
        TrustedSender.user_id == user.id,
        TrustedSender.sender_email == sender_email
    ).first()
    
    if not trusted_sender:
        raise HTTPException(status_code=404, detail="Trusted sender not found")
    
    db.delete(trusted_sender)
    db.commit()
    
    return {"message": "Trusted sender removed", "sender_email": sender_email}


@router.get("/{user_email}/check/{sender_email}")
async def check_sender_trust(
    user_email: str,
    sender_email: str,
    db: Session = Depends(get_db)
):
    """Check sender trust level"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    trusted_sender = db.query(TrustedSender).filter(
        TrustedSender.user_id == user.id,
        TrustedSender.sender_email == sender_email
    ).first()
    
    if trusted_sender:
        return {
            "is_trusted": trusted_sender.trust_level == TrustLevel.TRUSTED,
            "is_blocked": trusted_sender.trust_level == TrustLevel.BLOCKED,
            "trust_level": trusted_sender.trust_level.value,
            "sender_name": trusted_sender.sender_name
        }
    
    return {
        "is_trusted": False,
        "is_blocked": False,
        "trust_level": "unknown"
    }
