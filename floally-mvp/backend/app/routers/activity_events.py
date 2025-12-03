"""
Activity Events API Router
Endpoints for logging user activity and retrieving analytics
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import uuid

from app.database import get_db
from app.models import ActivityEvent, EventTemplate

router = APIRouter(prefix="/api/events", tags=["activity-events"])


# Pydantic models for request/response
class EventCreate(BaseModel):
    """Single event creation"""
    event_type: str = Field(..., description="Type of event (use EventTemplate constants)")
    entity_type: Optional[str] = Field(None, description="Type of entity being acted upon")
    entity_id: Optional[str] = Field(None, description="ID of the entity")
    event_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Event-specific data")
    session_id: Optional[str] = Field(None, description="User session ID")
    device_type: Optional[str] = Field(None, description="Device type: desktop, mobile, tablet")
    user_agent: Optional[str] = Field(None, description="Browser user agent")
    context_snapshot: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Workflow context")
    ai_suggestion_id: Optional[str] = Field(None, description="Related AI suggestion ID")
    outcome: Optional[str] = Field("success", description="Event outcome")
    duration_ms: Optional[int] = Field(None, description="Duration in milliseconds")
    event_timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow, description="When event occurred")


class EventBatchCreate(BaseModel):
    """Batch event creation for efficiency"""
    events: List[EventCreate] = Field(..., description="List of events to log")


class EventResponse(BaseModel):
    """Event response model"""
    id: str
    user_id: str
    event_type: str
    event_category: str
    event_action: str
    entity_type: Optional[str]
    entity_id: Optional[str]
    event_metadata: Dict[str, Any]
    event_timestamp: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class EventAnalytics(BaseModel):
    """Analytics summary"""
    total_events: int
    events_by_category: Dict[str, int]
    events_by_type: Dict[str, int]
    most_active_day: Optional[str]
    most_common_action: Optional[str]
    date_range: Dict[str, str]


# ============================================================================
# EVENT LOGGING ENDPOINTS
# ============================================================================

@router.post("/log", response_model=EventResponse)
async def log_single_event(
    event: EventCreate,
    user_email: str = Query(..., description="User email"),
    db: Session = Depends(get_db)
):
    """
    Log a single activity event
    
    Use this for real-time event logging when you need immediate confirmation.
    For better performance with multiple events, use /log/batch endpoint.
    """
    try:
        # Get user_id from email
        from app.models import User
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Extract category and action from event type
        event_category = EventTemplate.get_category(event.event_type)
        event_action = EventTemplate.get_action(event.event_type)
        
        # Create activity event
        db_event = ActivityEvent(
            user_id=user.id,
            event_type=event.event_type,
            event_category=event_category,
            event_action=event_action,
            entity_type=event.entity_type,
            entity_id=event.entity_id,
            event_metadata=event.event_metadata,
            session_id=event.session_id,
            device_type=event.device_type,
            user_agent=event.user_agent,
            context_snapshot=event.context_snapshot,
            ai_suggestion_id=event.ai_suggestion_id,
            outcome=event.outcome,
            duration_ms=event.duration_ms,
            event_timestamp=event.event_timestamp
        )
        
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        
        return EventResponse(
            id=str(db_event.id),
            user_id=str(db_event.user_id),
            event_type=db_event.event_type,
            event_category=db_event.event_category,
            event_action=db_event.event_action,
            entity_type=db_event.entity_type,
            entity_id=db_event.entity_id,
            event_metadata=db_event.event_metadata or {},
            event_timestamp=db_event.event_timestamp,
            created_at=db_event.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to log event: {str(e)}")


@router.post("/log/batch")
async def log_batch_events(
    batch: EventBatchCreate,
    user_email: str = Query(..., description="User email"),
    db: Session = Depends(get_db)
):
    """
    Log multiple activity events in a single request (RECOMMENDED)
    
    This is the preferred method for logging events as it reduces API overhead.
    Frontend should batch events and send every 5-10 seconds or when 10+ events accumulate.
    """
    try:
        # Get user_id from email
        from app.models import User
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        created_events = []
        
        for event in batch.events:
            event_category = EventTemplate.get_category(event.event_type)
            event_action = EventTemplate.get_action(event.event_type)
            
            db_event = ActivityEvent(
                user_id=user.id,
                event_type=event.event_type,
                event_category=event_category,
                event_action=event_action,
                entity_type=event.entity_type,
                entity_id=event.entity_id,
                event_metadata=event.event_metadata,
                session_id=event.session_id,
                device_type=event.device_type,
                user_agent=event.user_agent,
                context_snapshot=event.context_snapshot,
                ai_suggestion_id=event.ai_suggestion_id,
                outcome=event.outcome,
                duration_ms=event.duration_ms,
                event_timestamp=event.event_timestamp
            )
            
            db.add(db_event)
            created_events.append(db_event)
        
        db.commit()
        
        return {
            "success": True,
            "events_logged": len(created_events),
            "message": f"Successfully logged {len(created_events)} events"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to log batch events: {str(e)}")


# ============================================================================
# ANALYTICS & RETRIEVAL ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[EventResponse])
async def get_user_events(
    user_email: str = Query(..., description="User email"),
    event_category: Optional[str] = Query(None, description="Filter by category"),
    event_type: Optional[str] = Query(None, description="Filter by specific event type"),
    entity_id: Optional[str] = Query(None, description="Filter by entity ID"),
    days: int = Query(30, description="Number of days to retrieve", ge=1, le=365),
    limit: int = Query(100, description="Max events to return", ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Retrieve user's activity events with optional filters
    
    Use for displaying user activity history, building timelines, or debugging.
    """
    try:
        # Get user_id from email
        from app.models import User
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build query
        query = db.query(ActivityEvent).filter(ActivityEvent.user_id == user.id)
        
        # Apply filters
        if event_category:
            query = query.filter(ActivityEvent.event_category == event_category)
        if event_type:
            query = query.filter(ActivityEvent.event_type == event_type)
        if entity_id:
            query = query.filter(ActivityEvent.entity_id == entity_id)
        
        # Date range filter
        since_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(ActivityEvent.event_timestamp >= since_date)
        
        # Order by most recent first
        query = query.order_by(desc(ActivityEvent.event_timestamp))
        
        # Limit results
        events = query.limit(limit).all()
        
        return [
            EventResponse(
                id=str(e.id),
                user_id=str(e.user_id),
                event_type=e.event_type,
                event_category=e.event_category,
                event_action=e.event_action,
                entity_type=e.entity_type,
                entity_id=e.entity_id,
                event_metadata=e.event_metadata or {},
                event_timestamp=e.event_timestamp,
                created_at=e.created_at
            )
            for e in events
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve events: {str(e)}")


@router.get("/analytics", response_model=EventAnalytics)
async def get_event_analytics(
    user_email: str = Query(..., description="User email"),
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get analytics summary of user's activity
    
    Provides high-level insights into user behavior patterns.
    Used for AI context and user dashboards.
    """
    try:
        # Get user_id from email
        from app.models import User
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        since_date = datetime.utcnow() - timedelta(days=days)
        
        # Total events
        total_events = db.query(func.count(ActivityEvent.id)).filter(
            and_(
                ActivityEvent.user_id == user.id,
                ActivityEvent.event_timestamp >= since_date
            )
        ).scalar()
        
        # Events by category
        category_counts = db.query(
            ActivityEvent.event_category,
            func.count(ActivityEvent.id)
        ).filter(
            and_(
                ActivityEvent.user_id == user.id,
                ActivityEvent.event_timestamp >= since_date
            )
        ).group_by(ActivityEvent.event_category).all()
        
        events_by_category = {cat: count for cat, count in category_counts}
        
        # Events by type (top 10)
        type_counts = db.query(
            ActivityEvent.event_type,
            func.count(ActivityEvent.id)
        ).filter(
            and_(
                ActivityEvent.user_id == user.id,
                ActivityEvent.event_timestamp >= since_date
            )
        ).group_by(ActivityEvent.event_type).order_by(desc(func.count(ActivityEvent.id))).limit(10).all()
        
        events_by_type = {event_type: count for event_type, count in type_counts}
        
        # Most active day
        most_active = db.query(
            func.date(ActivityEvent.event_timestamp).label('day'),
            func.count(ActivityEvent.id).label('count')
        ).filter(
            and_(
                ActivityEvent.user_id == user.id,
                ActivityEvent.event_timestamp >= since_date
            )
        ).group_by('day').order_by(desc('count')).first()
        
        most_active_day = str(most_active[0]) if most_active else None
        
        # Most common action
        most_common = db.query(
            ActivityEvent.event_action,
            func.count(ActivityEvent.id)
        ).filter(
            and_(
                ActivityEvent.user_id == user.id,
                ActivityEvent.event_timestamp >= since_date
            )
        ).group_by(ActivityEvent.event_action).order_by(desc(func.count(ActivityEvent.id))).first()
        
        most_common_action = most_common[0] if most_common else None
        
        return EventAnalytics(
            total_events=total_events or 0,
            events_by_category=events_by_category,
            events_by_type=events_by_type,
            most_active_day=most_active_day,
            most_common_action=most_common_action,
            date_range={
                "start": since_date.isoformat(),
                "end": datetime.utcnow().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


@router.get("/session/{session_id}", response_model=List[EventResponse])
async def get_session_events(
    session_id: str,
    user_email: str = Query(..., description="User email"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all events from a specific session
    
    Useful for debugging user flows and understanding session context.
    """
    try:
        # Get user_id from email
        from app.models import User
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        events = db.query(ActivityEvent).filter(
            and_(
                ActivityEvent.user_id == user.id,
                ActivityEvent.session_id == session_id
            )
        ).order_by(ActivityEvent.event_timestamp).all()
        
        return [
            EventResponse(
                id=str(e.id),
                user_id=str(e.user_id),
                event_type=e.event_type,
                event_category=e.event_category,
                event_action=e.event_action,
                entity_type=e.entity_type,
                entity_id=e.entity_id,
                event_metadata=e.event_metadata or {},
                event_timestamp=e.event_timestamp,
                created_at=e.created_at
            )
            for e in events
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve session events: {str(e)}")


@router.delete("/cleanup")
async def cleanup_old_events(
    user_email: str = Query(..., description="User email"),
    days: int = Query(365, description="Delete events older than this many days"),
    db: Session = Depends(get_db)
):
    """
    Delete old activity events (data retention)
    
    Helps maintain database size and comply with data retention policies.
    Typically run as a scheduled job, but can be triggered manually.
    """
    try:
        # Get user_id from email
        from app.models import User
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        deleted_count = db.query(ActivityEvent).filter(
            and_(
                ActivityEvent.user_id == user.id,
                ActivityEvent.event_timestamp < cutoff_date
            )
        ).delete()
        
        db.commit()
        
        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Deleted {deleted_count} events older than {days} days"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cleanup events: {str(e)}")
