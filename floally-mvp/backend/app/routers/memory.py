"""
Aimi Memory Management API
View, edit, and control what Aimi has learned.

Endpoints:
- GET /api/memory - Get all memories
- GET /api/memory/timeline - Chronological learning moments
- GET /api/memory/influential - Most impactful memories
- PUT /api/memory/{id} - Update memory (adjust weights)
- DELETE /api/memory/{id} - Delete memory (reset learning)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.memory_management import AimiMemoryService

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/memory", tags=["memory"])


class UpdateMemoryRequest(BaseModel):
    """Request to update a memory"""
    importance_score: Optional[float] = None
    typical_action: Optional[str] = None


@router.get("/")
def get_all_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all of Aimi's learned memories for this user.
    
    Returns categorized memories:
    - Sender patterns (who's important, why)
    - Correction patterns (what you taught Aimi)
    - Behavior patterns (consistent actions)
    - Category preferences (how you handle types)
    
    Each memory shows:
    - What was learned
    - Why it was learned
    - Confidence level
    - Whether it's editable/deletable
    
    Example response:
    {
        "sender_memories": [
            {
                "memory_id": "sender_123",
                "sender_email": "ceo@company.com",
                "importance_score": 0.95,
                "confidence": 0.9,
                "reasoning": "You frequently interact with this sender",
                "editable": true,
                "deletable": true
            }
        ],
        "correction_memories": [...],
        "behavior_memories": [...],
        "summary": {
            "total_memories": 47,
            "most_influential": [...],
            "recently_learned": [...]
        }
    }
    """
    try:
        service = AimiMemoryService(db)
        memories = service.get_all_memories(current_user.email)
        
        # Calculate total
        total = (
            len(memories.get('sender_memories', [])) +
            len(memories.get('correction_memories', [])) +
            len(memories.get('behavior_memories', []))
        )
        
        memories['summary']['total_memories'] = total
        
        # Get most influential
        memories['summary']['most_influential'] = service.get_most_influential_memories(
            current_user.email,
            limit=5
        )
        
        # Get recent timeline
        memories['summary']['recently_learned'] = service.get_memory_timeline(
            current_user.email,
            days=7
        )[:5]  # Last 5 learning moments
        
        return memories
        
    except Exception as e:
        logger.error(f"Error fetching memories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline")
def get_memory_timeline(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get chronological timeline of Aimi's learning moments.
    
    Shows key events that shaped Aimi's understanding:
    - First time you corrected a pattern
    - Significant importance adjustments
    - New behavior patterns detected
    
    Query params:
    - days: How far back to look (default 30)
    
    Example response:
    {
        "timeline": [
            {
                "timestamp": "2025-12-14T10:30:00Z",
                "event_type": "significant_correction",
                "description": "You corrected importance from 85 to 20",
                "reasoning": "Automated reports sender",
                "impact": "high"
            }
        ],
        "period": "last_30_days",
        "total_events": 12
    }
    """
    try:
        service = AimiMemoryService(db)
        timeline = service.get_memory_timeline(current_user.email, days=days)
        
        return {
            "timeline": timeline,
            "period": f"last_{days}_days",
            "total_events": len(timeline)
        }
        
    except Exception as e:
        logger.error(f"Error fetching timeline: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/influential")
def get_influential_memories(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get memories that have the biggest impact on Aimi's decisions.
    
    Ranked by:
    - How often applied
    - Importance weight
    - Recency
    
    These are the memories that shape most of Aimi's thinking.
    Editing these has the biggest effect.
    
    Query params:
    - limit: How many to return (default 10)
    
    Example response:
    {
        "influential_memories": [
            {
                "sender_email": "manager@company.com",
                "importance_score": 0.95,
                "interaction_count": 47,
                "impact_score": 44.65,
                "reasoning": "High importance sender you interact with frequently"
            }
        ],
        "total": 10
    }
    """
    try:
        service = AimiMemoryService(db)
        memories = service.get_most_influential_memories(current_user.email, limit=limit)
        
        return {
            "influential_memories": memories,
            "total": len(memories)
        }
        
    except Exception as e:
        logger.error(f"Error fetching influential memories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{memory_id}")
def update_memory(
    memory_id: str,
    request: UpdateMemoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific memory (adjust importance, change preferences).
    
    Path params:
    - memory_id: ID of memory to update (e.g., "sender_123")
    
    Body:
    - importance_score: New importance (0.0-1.0)
    - typical_action: New typical action
    
    Examples:
    
    1. Increase sender importance:
    PUT /api/memory/sender_123
    {
        "importance_score": 0.95
    }
    
    2. Change category handling:
    PUT /api/memory/category_promotional
    {
        "typical_action": "read"
    }
    
    Response:
    {
        "success": true,
        "message": "Memory updated successfully",
        "memory_id": "sender_123"
    }
    """
    try:
        service = AimiMemoryService(db)
        
        updates = {}
        if request.importance_score is not None:
            if not 0.0 <= request.importance_score <= 1.0:
                raise HTTPException(status_code=400, detail="importance_score must be between 0.0 and 1.0")
            updates['importance_score'] = request.importance_score
        
        if request.typical_action is not None:
            updates['typical_action'] = request.typical_action
        
        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")
        
        success = service.update_memory(
            user_email=current_user.email,
            memory_id=memory_id,
            updates=updates
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Memory not found or cannot be updated")
        
        return {
            "success": True,
            "message": "Memory updated successfully",
            "memory_id": memory_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{memory_id}")
def delete_memory(
    memory_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific memory (reset Aimi's learning for this pattern).
    
    Path params:
    - memory_id: ID of memory to delete (e.g., "sender_123")
    
    Use cases:
    - Aimi learned wrong pattern → delete to reset
    - No longer relevant → remove from memory
    - Want Aimi to re-learn from scratch → delete and rebuild
    
    Example:
    DELETE /api/memory/sender_123
    
    Response:
    {
        "success": true,
        "message": "Memory deleted successfully",
        "memory_id": "sender_123",
        "note": "Aimi will rebuild this memory from your future actions"
    }
    """
    try:
        service = AimiMemoryService(db)
        
        success = service.delete_memory(
            user_email=current_user.email,
            memory_id=memory_id
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Memory not found or cannot be deleted")
        
        return {
            "success": True,
            "message": "Memory deleted successfully",
            "memory_id": memory_id,
            "note": "Aimi will rebuild this memory from your future actions"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sender/{sender_email}")
def get_sender_memory(
    sender_email: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed memory for a specific sender.
    
    Shows everything Aimi knows about this sender:
    - Current importance score
    - Interaction history
    - Behavior patterns
    - Recent decisions
    
    Path params:
    - sender_email: Email address of sender
    
    Example:
    GET /api/memory/sender/ceo@company.com
    
    Response:
    {
        "sender_email": "ceo@company.com",
        "importance_score": 0.95,
        "interaction_count": 47,
        "last_seen": "2025-12-14T10:30:00Z",
        "typical_actions": ["open", "star", "reply"],
        "reasoning": "High-priority sender based on your behavior"
    }
    """
    try:
        from app.models.user import SenderStats
        
        sender_stat = db.query(SenderStats).filter(
            SenderStats.user_email == current_user.email,
            SenderStats.sender_email == sender_email
        ).first()
        
        if not sender_stat:
            raise HTTPException(status_code=404, detail="No memory found for this sender")
        
        return {
            "sender_email": sender_stat.sender_email,
            "sender_domain": sender_stat.sender_domain,
            "importance_score": sender_stat.importance_score,
            "interaction_count": sender_stat.interaction_count,
            "last_seen": sender_stat.last_seen.isoformat() if sender_stat.last_seen else None,
            "reasoning": "Learned from your interaction patterns",
            "editable": True,
            "deletable": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sender memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
