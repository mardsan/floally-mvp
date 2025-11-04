"""
Daily Activity Event Log
Comprehensive tracking of all user interactions for Aimy's learning system
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from app.database import get_db
from app.models import User

# Note: We'll need to create ActivityEvent model in models/activity.py
# For now, using dict-based logging to PostgreSQL JSONB

router = APIRouter(prefix="/api/activity", tags=["activity"])


class ActivityEvent(BaseModel):
    """Single activity event"""
    user_email: str
    event_type: str  # email_read, project_created, task_completed, standup_generated, etc.
    entity_type: str  # email, project, task, standup, contact, etc.
    entity_id: Optional[str] = None
    action: str  # created, updated, deleted, viewed, completed, etc.
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None


class ActivityLogRequest(BaseModel):
    """Request to log activity events"""
    events: List[ActivityEvent]


@router.post("/log")
async def log_activity(request: ActivityLogRequest, db: Session = Depends(get_db)):
    """
    Log user activity events for AI learning
    
    Example events:
    - email_read: User read an email
    - email_responded: User replied to an email  
    - project_created: User created a new project
    - project_updated: User updated a project
    - task_completed: User marked a task as complete
    - standup_generated: Daily standup was generated
    - standup_task_started: User started working on "The One Thing"
    - contact_trusted: User marked a contact as trusted
    - ai_suggestion_accepted: User accepted AI suggestion
    - ai_suggestion_rejected: User rejected AI suggestion
    """
    try:
        logged_events = []
        
        for event in request.events:
            # Get or create user
            user = db.query(User).filter(User.email == event.user_email).first()
            if not user:
                user = User(email=event.user_email)
                db.add(user)
                db.flush()
            
            # Store event in BehaviorAction table (repurposing for now)
            # TODO: Create dedicated ActivityEvent table
            from app.models import BehaviorAction
            
            activity = BehaviorAction(
                user_id=user.id,
                email_id=event.entity_id or f"{event.entity_type}_{datetime.utcnow().timestamp()}",
                sender_email=event.event_type,  # Repurposing field
                sender_domain=event.entity_type,  # Repurposing field
                action_type=event.action,
                email_category="activity_log",
                has_unsubscribe=False,
                confidence_score=1.0,
                action_metadata=event.metadata or {}
            )
            db.add(activity)
            logged_events.append({
                "event_type": event.event_type,
                "entity_type": event.entity_type,
                "action": event.action,
                "timestamp": event.timestamp or datetime.utcnow()
            })
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Logged {len(logged_events)} activity events",
            "events": logged_events
        }
    
    except Exception as e:
        db.rollback()
        print(f"Error logging activity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/daily-summary")
async def get_daily_summary(user_email: str, date: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get daily activity summary for a user
    
    Args:
        user_email: User's email
        date: Date in YYYY-MM-DD format (default: today)
    
    Returns:
        Summary of all activities for the day
    """
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {"summary": {}, "events": [], "total_events": 0}
        
        # Parse date
        if date:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        else:
            target_date = datetime.utcnow().date()
        
        # Get activities for the day
        from app.models import BehaviorAction
        
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        activities = db.query(BehaviorAction).filter(
            and_(
                BehaviorAction.user_id == user.id,
                BehaviorAction.created_at >= start_of_day,
                BehaviorAction.created_at <= end_of_day,
                BehaviorAction.email_category == "activity_log"
            )
        ).order_by(BehaviorAction.created_at).all()
        
        # Group by event type
        summary = {}
        for activity in activities:
            event_type = activity.sender_email  # Repurposed field
            if event_type not in summary:
                summary[event_type] = {
                    "count": 0,
                    "actions": {}
                }
            summary[event_type]["count"] += 1
            
            action = activity.action_type
            if action not in summary[event_type]["actions"]:
                summary[event_type]["actions"][action] = 0
            summary[event_type]["actions"][action] += 1
        
        return {
            "date": target_date.isoformat(),
            "summary": summary,
            "total_events": len(activities),
            "events": [
                {
                    "event_type": a.sender_email,
                    "entity_type": a.sender_domain,
                    "action": a.action_type,
                    "metadata": a.action_metadata,
                    "timestamp": a.created_at.isoformat()
                }
                for a in activities
            ]
        }
    
    except Exception as e:
        print(f"Error getting daily summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weekly-patterns")
async def get_weekly_patterns(user_email: str, db: Session = Depends(get_db)):
    """
    Get weekly activity patterns for AI learning
    
    Returns patterns like:
    - Most active days
    - Common task completion times
    - Email response patterns
    - Project work patterns
    """
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {"patterns": {}, "message": "No activity data yet"}
        
        from app.models import BehaviorAction
        
        # Get last 7 days of activity
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        activities = db.query(BehaviorAction).filter(
            and_(
                BehaviorAction.user_id == user.id,
                BehaviorAction.created_at >= week_ago,
                BehaviorAction.email_category == "activity_log"
            )
        ).all()
        
        if not activities:
            return {"patterns": {}, "message": "Not enough data yet"}
        
        # Analyze patterns
        daily_counts = {}
        hourly_distribution = {}
        event_type_counts = {}
        
        for activity in activities:
            # Daily counts
            day = activity.created_at.strftime("%A")
            daily_counts[day] = daily_counts.get(day, 0) + 1
            
            # Hourly distribution
            hour = activity.created_at.hour
            hourly_distribution[hour] = hourly_distribution.get(hour, 0) + 1
            
            # Event type counts
            event_type = activity.sender_email
            event_type_counts[event_type] = event_type_counts.get(event_type, 0) + 1
        
        # Find most active day and hour
        most_active_day = max(daily_counts.items(), key=lambda x: x[1])[0] if daily_counts else None
        most_active_hour = max(hourly_distribution.items(), key=lambda x: x[1])[0] if hourly_distribution else None
        
        return {
            "patterns": {
                "daily_counts": daily_counts,
                "hourly_distribution": hourly_distribution,
                "event_type_counts": event_type_counts,
                "most_active_day": most_active_day,
                "most_active_hour": f"{most_active_hour}:00" if most_active_hour is not None else None,
                "total_events": len(activities),
                "avg_daily_events": len(activities) / 7
            },
            "insights": {
                "message": f"You're most active on {most_active_day}s around {most_active_hour}:00" if most_active_day and most_active_hour else "Keep using OkAimy to learn your patterns!"
            }
        }
    
    except Exception as e:
        print(f"Error getting weekly patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/learning-status")
async def get_learning_status(user_email: str, db: Session = Depends(get_db)):
    """
    Get AI learning status - how much data Aimy has learned from
    
    Returns:
    - Total events logged
    - Days of data
    - Confidence level (learning, active, confident)
    - Key insights discovered
    """
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {
                "status": "new",
                "total_events": 0,
                "days_active": 0,
                "confidence": "learning",
                "message": "Start using OkAimy to help Aimy learn your patterns!"
            }
        
        from app.models import BehaviorAction
        
        # Get all activity events
        activities = db.query(BehaviorAction).filter(
            and_(
                BehaviorAction.user_id == user.id,
                BehaviorAction.email_category == "activity_log"
            )
        ).all()
        
        if not activities:
            return {
                "status": "new",
                "total_events": 0,
                "days_active": 0,
                "confidence": "learning",
                "message": "Start using OkAimy to help Aimy learn your patterns!"
            }
        
        # Calculate days active
        dates = set(a.created_at.date() for a in activities)
        days_active = len(dates)
        total_events = len(activities)
        
        # Determine confidence level
        if total_events >= 100 and days_active >= 7:
            confidence = "confident"
            status = "active"
            message = "Aimy has a strong understanding of your work patterns!"
        elif total_events >= 30 and days_active >= 3:
            confidence = "active"
            status = "learning"
            message = "Aimy is actively learning your preferences!"
        else:
            confidence = "learning"
            status = "new"
            message = "Keep using OkAimy - Aimy is learning about you!"
        
        return {
            "status": status,
            "total_events": total_events,
            "days_active": days_active,
            "confidence": confidence,
            "message": message,
            "progress": {
                "events_target": 100,
                "events_current": total_events,
                "days_target": 7,
                "days_current": days_active
            }
        }
    
    except Exception as e:
        print(f"Error getting learning status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
