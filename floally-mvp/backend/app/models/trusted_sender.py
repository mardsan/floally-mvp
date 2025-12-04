"""
Trusted Sender Model
Tracks senders and their trust level for attachment processing
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base


class TrustLevel(str, enum.Enum):
    """Trust level for sender attachments"""
    TRUSTED = "trusted"      # Always allow Aimi to read attachments
    BLOCKED = "blocked"      # Never allow - potential threat
    ONE_TIME = "one_time"    # Ask each time (default for new senders)


class TrustedSender(Base):
    """Sender trust settings for attachment processing"""
    __tablename__ = "trusted_senders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sender_email = Column(String, nullable=False, index=True)
    sender_name = Column(String)
    
    # Trust settings
    trust_level = Column(Enum(TrustLevel), default=TrustLevel.ONE_TIME, nullable=False)
    auto_approved = Column(Boolean, default=False)  # Deprecated: use trust_level instead
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_used = Column(DateTime)
    attachment_count = Column(Integer, default=0)  # How many attachments processed
    
    # Relationship
    user = relationship("User", back_populates="trusted_senders")
    
    class Config:
        from_attributes = True
