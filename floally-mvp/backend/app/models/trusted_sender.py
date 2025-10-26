"""
Trusted Sender Model
Tracks senders whose attachments can be processed by Aimy
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class TrustedSender(Base):
    """Sender whose attachments are trusted for AI processing"""
    __tablename__ = "trusted_senders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_email = Column(String, nullable=False, index=True)
    sender_name = Column(String)
    
    # Trust settings
    allow_attachments = Column(Boolean, default=True)
    auto_approved = Column(Boolean, default=False)  # Auto-approve without asking
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime)
    attachment_count = Column(Integer, default=0)  # How many attachments processed
    
    # Relationship
    user = relationship("User", back_populates="trusted_senders")
    
    class Config:
        from_attributes = True
