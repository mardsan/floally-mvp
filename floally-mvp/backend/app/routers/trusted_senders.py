"""
Trusted Senders API
Manage sender trust for attachment processing
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.trusted_sender import TrustedSender


router = APIRouter(prefix="/api/trusted-senders", tags=["trusted-senders"])


class TrustedSenderCreate(BaseModel):
    sender_email: str
    sender_name: Optional[str] = None
    auto_approved: bool = False


class TrustedSenderResponse(BaseModel):
    id: int
    sender_email: str
    sender_name: Optional[str]
    allow_attachments: bool
    auto_approved: bool
    created_at: datetime
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
    """Add a sender to trusted list"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already exists
    existing = db.query(TrustedSender).filter(
        TrustedSender.user_id == user.id,
        TrustedSender.sender_email == sender.sender_email
    ).first()
    
    if existing:
        # Update existing
        existing.allow_attachments = True
        existing.auto_approved = sender.auto_approved
        if sender.sender_name:
            existing.sender_name = sender.sender_name
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new
    trusted_sender = TrustedSender(
        user_id=user.id,
        sender_email=sender.sender_email,
        sender_name=sender.sender_name,
        auto_approved=sender.auto_approved
    )
    db.add(trusted_sender)
    db.commit()
    db.refresh(trusted_sender)
    
    return trusted_sender


@router.delete("/{user_email}/{sender_email}")
async def remove_trusted_sender(
    user_email: str,
    sender_email: str,
    db: Session = Depends(get_db)
):
    """Remove a sender from trusted list"""
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
    
    return {"message": "Trusted sender removed"}


@router.get("/{user_email}/check/{sender_email}")
async def check_sender_trust(
    user_email: str,
    sender_email: str,
    db: Session = Depends(get_db)
):
    """Check if a sender is trusted and get their settings"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    trusted_sender = db.query(TrustedSender).filter(
        TrustedSender.user_id == user.id,
        TrustedSender.sender_email == sender_email,
        TrustedSender.allow_attachments == True
    ).first()
    
    if trusted_sender:
        return {
            "is_trusted": True,
            "auto_approved": trusted_sender.auto_approved,
            "sender_name": trusted_sender.sender_name
        }
    
    return {
        "is_trusted": False,
        "auto_approved": False
    }
