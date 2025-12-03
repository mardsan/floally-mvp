"""
Activity Event Log model for tracking user actions and building AI context
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base


class ActivityEvent(Base):
    """
    Comprehensive event logging for user activities.
    Powers AI learning, analytics, and personalization.
    """
    __tablename__ = "activity_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Event classification
    event_type = Column(String(100), nullable=False, index=True)  # e.g., 'email_opened', 'project_created'
    event_category = Column(String(50), nullable=False, index=True)  # e.g., 'email', 'project', 'calendar', 'standup'
    event_action = Column(String(50), nullable=False)  # e.g., 'open', 'create', 'update', 'delete', 'complete'
    
    # Context and metadata
    entity_type = Column(String(50))  # 'email', 'project', 'task', 'event', etc.
    entity_id = Column(String(255), index=True)  # ID of the entity being acted upon
    event_metadata = Column(JSONB)  # Flexible JSON for event-specific data
    
    # User context at time of event
    session_id = Column(String(100), index=True)  # Track user sessions
    device_type = Column(String(50))  # 'desktop', 'mobile', 'tablet'
    user_agent = Column(Text)  # Full user agent string
    
    # AI-relevant context
    context_snapshot = Column(JSONB)  # State of user's workflow at event time
    ai_suggestion_id = Column(String(100))  # Link to AI suggestion if event was AI-driven
    outcome = Column(String(50))  # 'success', 'failure', 'cancelled', etc.
    
    # Performance tracking
    duration_ms = Column(Integer)  # How long the action took (if applicable)
    
    # Timestamps
    event_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", backref="activity_events")
    
    # Composite indexes for common queries
    __table_args__ = (
        Index('idx_user_category_timestamp', 'user_id', 'event_category', 'event_timestamp'),
        Index('idx_user_type_timestamp', 'user_id', 'event_type', 'event_timestamp'),
        Index('idx_session_timestamp', 'session_id', 'event_timestamp'),
        {'comment': 'Activity event log for AI learning and analytics'}
    )
    
    def __repr__(self):
        return f"<ActivityEvent(user={self.user_id}, type={self.event_type}, timestamp={self.event_timestamp})>"


class EventTemplate:
    """
    Standard event types for consistency across the application.
    Use these constants when logging events.
    """
    
    # Email events
    EMAIL_OPENED = "email_opened"
    EMAIL_STARRED = "email_starred"
    EMAIL_ARCHIVED = "email_archived"
    EMAIL_DELETED = "email_deleted"
    EMAIL_REPLIED = "email_replied"
    EMAIL_CATEGORY_CHANGED = "email_category_changed"
    EMAIL_FEEDBACK_GIVEN = "email_feedback_given"
    
    # Project events
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    PROJECT_DELETED = "project_deleted"
    PROJECT_STATUS_CHANGED = "project_status_changed"
    PROJECT_OPENED = "project_opened"
    PROJECT_GOAL_ADDED = "project_goal_added"
    PROJECT_GOAL_COMPLETED = "project_goal_completed"
    PROJECT_SUBTASK_COMPLETED = "project_subtask_completed"
    
    # Calendar events
    CALENDAR_EVENT_CREATED = "calendar_event_created"
    CALENDAR_EVENT_UPDATED = "calendar_event_updated"
    CALENDAR_EVENT_DELETED = "calendar_event_deleted"
    CALENDAR_EVENT_OPENED = "calendar_event_opened"
    CALENDAR_VIEW_CHANGED = "calendar_view_changed"
    
    # Standup events
    STANDUP_COMPLETED = "standup_completed"
    STANDUP_SKIPPED = "standup_skipped"
    STANDUP_ONE_THING_UPDATED = "standup_one_thing_updated"
    STANDUP_ONE_THING_COMPLETED = "standup_one_thing_completed"
    
    # AI interaction events
    AI_SUGGESTION_SHOWN = "ai_suggestion_shown"
    AI_SUGGESTION_ACCEPTED = "ai_suggestion_accepted"
    AI_SUGGESTION_REJECTED = "ai_suggestion_rejected"
    AI_WIZARD_STARTED = "ai_wizard_started"
    AI_WIZARD_COMPLETED = "ai_wizard_completed"
    AI_CHAT_MESSAGE_SENT = "ai_chat_message_sent"
    
    # Navigation events
    PAGE_VIEW = "page_view"
    MODAL_OPENED = "modal_opened"
    MODAL_CLOSED = "modal_closed"
    TAB_CHANGED = "tab_changed"
    
    # Settings events
    SETTINGS_UPDATED = "settings_updated"
    PROFILE_UPDATED = "profile_updated"
    ACCOUNT_CONNECTED = "account_connected"
    ACCOUNT_DISCONNECTED = "account_disconnected"
    
    # Search and filter events
    SEARCH_PERFORMED = "search_performed"
    FILTER_APPLIED = "filter_applied"
    SORT_CHANGED = "sort_changed"
    
    @classmethod
    def get_category(cls, event_type: str) -> str:
        """Extract category from event type"""
        if event_type.startswith('email_'):
            return 'email'
        elif event_type.startswith('project_'):
            return 'project'
        elif event_type.startswith('calendar_'):
            return 'calendar'
        elif event_type.startswith('standup_'):
            return 'standup'
        elif event_type.startswith('ai_'):
            return 'ai'
        elif event_type.startswith('settings_') or event_type.startswith('profile_') or event_type.startswith('account_'):
            return 'settings'
        elif event_type in ['page_view', 'modal_opened', 'modal_closed', 'tab_changed']:
            return 'navigation'
        elif event_type in ['search_performed', 'filter_applied', 'sort_changed']:
            return 'interaction'
        else:
            return 'other'
    
    @classmethod
    def get_action(cls, event_type: str) -> str:
        """Extract action from event type"""
        if '_' in event_type:
            return event_type.split('_')[-1]
        return 'unknown'
