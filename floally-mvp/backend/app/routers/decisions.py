"""
Aimi Decision Review API
Endpoints for users to see, review, and correct Aimi's decisions.

This builds trust by:
1. Showing what Aimi is doing (transparency)
2. Letting users review before actions happen (control)
3. Learning from corrections (improvement)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.decision_transparency import (
    DecisionTransparencyService,
    DecisionType,
    format_decision_summary_for_ui
)

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/decisions", tags=["decisions"])


class ReviewDecisionRequest(BaseModel):
    """Request to review a decision"""
    decision_id: int
    approved: bool
    correction: Optional[dict] = None
    correction_reasoning: Optional[str] = None


@router.get("/pending")
def get_pending_decisions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get decisions that need user review.
    
    Returns:
    - Decisions Aimi SUGGESTED (🟡 wants confirmation)
    - Decisions Aimi is UNSURE about (🔵 needs your input)
    - Recent decisions Aimi HANDLED (✅ for audit/transparency)
    
    Example response:
    {
        "needs_review": [
            {
                "id": 123,
                "message_id": "18c2f...",
                "type": "importance_scoring",
                "decision": {"importance_score": 85},
                "reasoning": "Sender is from your priority project 'Q1 Launch'",
                "confidence": 0.82,
                "status": "suggested",
                "status_icon": "🟡"
            }
        ],
        "recently_handled": [...],
        "summary": {
            "needs_attention": 3,
            "handled_automatically": 15
        }
    }
    """
    try:
        service = DecisionTransparencyService(db)
        decisions = service.get_pending_reviews(current_user.email, limit=limit)
        
        # Format for UI
        formatted = format_decision_summary_for_ui(decisions)
        
        return formatted
        
    except Exception as e:
        logger.error(f"Error fetching pending decisions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/review")
def review_decision(
    request: ReviewDecisionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    User reviews and potentially corrects a decision.
    
    Examples:
    
    1. Approve decision:
    POST /api/decisions/review
    {
        "decision_id": 123,
        "approved": true
    }
    
    2. Correct decision:
    POST /api/decisions/review
    {
        "decision_id": 123,
        "approved": false,
        "correction": {"importance_score": 50},
        "correction_reasoning": "This sender sends automated reports, not important"
    }
    """
    try:
        service = DecisionTransparencyService(db)
        
        success = service.user_review_decision(
            decision_id=request.decision_id,
            user_email=current_user.email,
            approved=request.approved,
            correction=request.correction,
            correction_reasoning=request.correction_reasoning
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Decision not found")
        
        action = "approved" if request.approved else "corrected"
        logger.info(f"User {current_user.email} {action} decision {request.decision_id}")
        
        return {
            "success": True,
            "message": f"Decision {action} successfully",
            "action": action
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reviewing decision: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def get_decision_history(
    message_id: Optional[str] = None,
    decision_type: Optional[str] = None,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get history of Aimi's decisions for transparency/audit.
    
    Query params:
    - message_id: Filter to specific Gmail message
    - decision_type: Filter to specific type (importance_scoring, suggested_action, etc.)
    - days: How many days back (default 30)
    
    Use cases:
    - "Show me what Aimi did with my emails today" → days=1
    - "What did Aimi decide about this email?" → message_id=xxx
    - "How often does Aimi get importance right?" → decision_type=importance_scoring
    """
    try:
        service = DecisionTransparencyService(db)
        
        # Convert string decision_type to enum if provided
        dt_enum = None
        if decision_type:
            try:
                dt_enum = DecisionType[decision_type.upper()]
            except KeyError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid decision_type. Valid types: {[dt.value for dt in DecisionType]}"
                )
        
        history = service.get_decision_history(
            user_email=current_user.email,
            message_id=message_id,
            decision_type=dt_enum,
            days=days
        )
        
        return {
            "decisions": history,
            "count": len(history),
            "filters": {
                "message_id": message_id,
                "decision_type": decision_type,
                "days": days
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching decision history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/accuracy")
def get_accuracy_metrics(
    decision_type: Optional[str] = None,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get metrics on how accurate Aimi's decisions are.
    
    Returns:
    {
        "total_decisions": 100,
        "user_approved": 85,
        "user_corrected": 15,
        "approval_rate": 0.85,
        "avg_confidence": 0.78,
        "confidence_calibration": {
            "high (>0.9)": {"count": 30, "approved": 28, "rate": 0.93},
            "medium (0.6-0.9)": {"count": 50, "approved": 42, "rate": 0.84},
            "low (<0.6)": {"count": 20, "approved": 15, "rate": 0.75}
        }
    }
    
    This helps users understand:
    - "How often does Aimi get it right?"
    - "Should I trust high-confidence decisions?"
    - "Is Aimi improving over time?"
    """
    try:
        service = DecisionTransparencyService(db)
        
        dt_enum = None
        if decision_type:
            try:
                dt_enum = DecisionType[decision_type.upper()]
            except KeyError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid decision_type. Valid types: {[dt.value for dt in DecisionType]}"
                )
        
        metrics = service.get_accuracy_metrics(
            user_email=current_user.email,
            decision_type=dt_enum,
            days=days
        )
        
        return metrics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating accuracy metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/message/{message_id}")
def get_message_decisions(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all decisions Aimi made about a specific email.
    
    Useful for "decision drill-down" - when user clicks an email,
    show all the AI decisions that went into handling it:
    - Importance score assigned
    - Category assigned
    - Suggested action
    - Any auto-actions taken
    
    Returns decisions in chronological order.
    """
    try:
        service = DecisionTransparencyService(db)
        
        decisions = service.get_decision_history(
            user_email=current_user.email,
            message_id=message_id,
            days=90  # Look back further for specific messages
        )
        
        if not decisions:
            return {
                "message_id": message_id,
                "decisions": [],
                "message": "No decisions found for this message"
            }
        
        return {
            "message_id": message_id,
            "decisions": decisions,
            "count": len(decisions)
        }
        
    except Exception as e:
        logger.error(f"Error fetching message decisions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
