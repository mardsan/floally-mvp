"""
Database models for OpAime user system
"""
from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base


class User(Base):
    """Main user table"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(255))
    avatar_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    connected_accounts = relationship("ConnectedAccount", back_populates="user", cascade="all, delete-orphan")
    behavior_actions = relationship("BehaviorAction", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserProfile(Base):
    """User profile with onboarding data and preferences"""
    __tablename__ = "user_profiles"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    role = Column(String(100))
    company = Column(String(255))
    priorities = Column(JSONB)  # Array of priority strings
    decision_style = Column(String(50))
    communication_style = Column(String(50))
    unsubscribe_preference = Column(String(50))
    work_hours = Column(JSONB)  # {start: "09:00", end: "18:00"}
    timezone = Column(String(50), default='America/Los_Angeles')
    language = Column(String(10), default='en')
    onboarding_completed = Column(Boolean, default=False, nullable=False)
    goals = Column(JSONB)  # Array of goal objects
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="profile")


class ConnectedAccount(Base):
    """Connected OAuth accounts (Google, Microsoft, etc.)"""
    __tablename__ = "connected_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # 'google', 'microsoft'
    provider_account_id = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    access_token = Column(Text)
    refresh_token = Column(Text)
    token_expires_at = Column(DateTime)
    scopes = Column(JSONB)  # Array of granted scopes
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="connected_accounts")


class BehaviorAction(Base):
    """User behavior tracking for AI learning"""
    __tablename__ = "behavior_actions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    email_id = Column(String(255), nullable=False, index=True)
    sender_email = Column(String(255), nullable=False, index=True)
    sender_domain = Column(String(255), nullable=False, index=True)
    action_type = Column(String(50), nullable=False)  # mark_important_feedback, archive, etc.
    email_category = Column(String(50))  # primary, promotional, social, updates
    has_unsubscribe = Column(Boolean, default=False)
    confidence_score = Column(Float, default=0.0)
    action_metadata = Column(JSONB)  # Additional context (renamed from 'metadata' to avoid SQLAlchemy conflict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationship
    user = relationship("User", back_populates="behavior_actions")


class UserSettings(Base):
    """User settings and preferences"""
    __tablename__ = "user_settings"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    ai_preferences = Column(JSONB, default={
        "model": "claude-3-haiku",
        "tone": "warm_friendly",
        "verbosity": "concise",
        "auto_suggestions": True,
        "confidence_threshold": 0.8
    })
    notification_preferences = Column(JSONB, default={
        "email_digest": {"enabled": True, "frequency": "daily", "time": "08:00"},
        "slack_notifications": {"enabled": False, "events": []},
        "browser_notifications": {"enabled": True, "events": ["important_email"]}
    })
    privacy_settings = Column(JSONB, default={
        "behavioral_learning": True,
        "data_retention_days": 365,
        "share_anonymous_usage": False,
        "allow_ai_training": False
    })
    email_management = Column(JSONB, default={
        "unsubscribe_preference": "ask_before",
        "auto_archive_promotional": False,
        "newsletter_digest": {"enabled": False, "frequency": "weekly"}
    })
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="settings")


class SenderStats(Base):
    """Aggregated statistics per sender for each user"""
    __tablename__ = "sender_stats"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    sender_email = Column(String(255), nullable=False, index=True)
    sender_domain = Column(String(255), nullable=False, index=True)
    total_emails = Column(Integer, default=0)
    marked_important = Column(Integer, default=0)
    marked_interesting = Column(Integer, default=0)
    marked_unimportant = Column(Integer, default=0)
    archived = Column(Integer, default=0)
    responded = Column(Integer, default=0)
    trashed = Column(Integer, default=0)
    unsubscribed = Column(Integer, default=0)
    importance_score = Column(Float, default=0.5)  # 0-1 score
    last_interaction = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Composite unique constraint
    __table_args__ = (
        {'comment': 'Sender statistics per user for behavioral learning'}
    ,)
