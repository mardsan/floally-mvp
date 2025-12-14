"""
Aimi Decision Transparency Service
Makes all AI decisions visible, reviewable, and correctable.

Core Principle: "Luminous Calm" = Trust through transparency, not opacity.

Every action Aimi takes or suggests should be:
1. Visible to the user
2. Explained with reasoning
3. Correctable if wrong
4. Learned from for future improvements
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy import Column, String, JSON, DateTime, Float, Integer, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Session
import enum
import logging

from app.database import Base

logger = logging.getLogger(__name__)


class DecisionType(enum.Enum):
    """Types of decisions Aimi can make"""
    IMPORTANCE_SCORING = "importance_scoring"
    CATEGORY_ASSIGNMENT = "category_assignment"
    SUGGESTED_ACTION = "suggested_action"
    AUTO_ARCHIVE = "auto_archive"
    AUTO_STAR = "auto_star"
    PRIORITY_RANKING = "priority_ranking"
    DRAFT_RESPONSE = "draft_response"
    MEETING_SCHEDULING = "meeting_scheduling"


class DecisionStatus(enum.Enum):
    """Status of a decision"""
    SUGGESTED = "suggested"      # 🟡 Aimi suggests, user decides
    HANDLED = "handled"           # ✅ Aimi handled automatically (high confidence)
    YOUR_CALL = "your_call"       # 🔵 Aimi unsure, needs user input
    USER_APPROVED = "user_approved"  # User reviewed and approved
    USER_CORRECTED = "user_corrected"  # User corrected Aimi's decision
    USER_REJECTED = "user_rejected"   # User rejected Aimi's suggestion


class AimiDecision(Base):
    """
    Records every decision Aimi makes for transparency and learning.
    
    This enables:
    - Audit trail (what did Aimi do and why?)
    - User review (let me check before acting)
    - Corrections (no, that's wrong, here's the right answer)
    - Learning (next time, do it this way)
    """
    __tablename__ = "aimi_decisions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Who & What
    user_email = Column(String, nullable=False, index=True)
    message_id = Column(String, nullable=True, index=True)  # Gmail message ID (if applicable)
    decision_type = Column(SQLEnum(DecisionType), nullable=False)
    
    # Decision Details
    decision_data = Column(JSON)  # What Aimi decided
    reasoning = Column(String)    # Why Aimi decided this (shown to user)
    confidence = Column(Float)    # How confident (0.0-1.0)
    
    # Status & Review
    status = Column(SQLEnum(DecisionStatus), default=DecisionStatus.SUGGESTED)
    reviewed_at = Column(DateTime, nullable=True)
    
    # User Feedback
    user_correction = Column(JSON, nullable=True)  # What user changed it to
    correction_reasoning = Column(String, nullable=True)  # Why user corrected
    
    # Context for Learning
    context_snapshot = Column(JSON)  # Context at time of decision
    ai_model_used = Column(String)   # Which AI made the decision
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DecisionTransparencyService:
    """Service for recording, reviewing, and learning from Aimi's decisions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def record_decision(
        self,
        user_email: str,
        decision_type: DecisionType,
        decision_data: Dict,
        reasoning: str,
        confidence: float,
        message_id: Optional[str] = None,
        context_snapshot: Optional[Dict] = None,
        ai_model: Optional[str] = None
    ) -> int:
        """
        Record a decision Aimi made.
        
        Args:
            user_email: User this decision affects
            decision_type: Type of decision (importance, action, etc.)
            decision_data: The actual decision (e.g., {"importance_score": 85})
            reasoning: Human-readable explanation
            confidence: How confident Aimi is (0.0-1.0)
            message_id: Gmail message ID if applicable
            context_snapshot: Relevant context at decision time
            ai_model: Which AI model made the decision
            
        Returns:
            Decision ID for future reference
        """
        # Determine status based on confidence
        if confidence >= 0.9:
            status = DecisionStatus.HANDLED  # High confidence = auto-handle
        elif confidence >= 0.6:
            status = DecisionStatus.SUGGESTED  # Medium = suggest to user
        else:
            status = DecisionStatus.YOUR_CALL  # Low = ask user
        
        decision = AimiDecision(
            user_email=user_email,
            message_id=message_id,
            decision_type=decision_type,
            decision_data=decision_data,
            reasoning=reasoning,
            confidence=confidence,
            status=status,
            context_snapshot=context_snapshot or {},
            ai_model_used=ai_model or "unknown"
        )
        
        self.db.add(decision)
        self.db.commit()
        
        logger.info(f"Recorded {decision_type.value} decision (confidence: {confidence:.2f}, status: {status.value})")
        
        return decision.id
    
    def get_pending_reviews(
        self,
        user_email: str,
        limit: int = 50
    ) -> List[Dict]:
        """
        Get decisions that need user review.
        
        Returns decisions that are:
        - SUGGESTED (Aimi thinks this is right, but wants confirmation)
        - YOUR_CALL (Aimi unsure, needs user input)
        - HANDLED but recent (last 24 hours) for audit
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        
        decisions = self.db.query(AimiDecision).filter(
            AimiDecision.user_email == user_email,
            AimiDecision.created_at >= cutoff_time,
            AimiDecision.status.in_([
                DecisionStatus.SUGGESTED,
                DecisionStatus.YOUR_CALL,
                DecisionStatus.HANDLED
            ])
        ).order_by(
            AimiDecision.created_at.desc()
        ).limit(limit).all()
        
        return [self._format_decision_for_ui(d) for d in decisions]
    
    def user_review_decision(
        self,
        decision_id: int,
        user_email: str,
        approved: bool,
        correction: Optional[Dict] = None,
        correction_reasoning: Optional[str] = None
    ) -> bool:
        """
        User reviews and potentially corrects a decision.
        
        Args:
            decision_id: ID of decision to review
            user_email: User reviewing (security check)
            approved: True if user approves, False if correcting
            correction: If not approved, what should it be?
            correction_reasoning: Why user corrected it
            
        Returns:
            Success boolean
        """
        decision = self.db.query(AimiDecision).filter(
            AimiDecision.id == decision_id,
            AimiDecision.user_email == user_email
        ).first()
        
        if not decision:
            logger.error(f"Decision {decision_id} not found for user {user_email}")
            return False
        
        if approved:
            decision.status = DecisionStatus.USER_APPROVED
            logger.info(f"User approved decision {decision_id}")
        else:
            decision.status = DecisionStatus.USER_CORRECTED
            decision.user_correction = correction
            decision.correction_reasoning = correction_reasoning
            logger.info(f"User corrected decision {decision_id}: {correction_reasoning}")
            
            # Learn from correction
            self._learn_from_correction(decision)
        
        decision.reviewed_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    def get_decision_history(
        self,
        user_email: str,
        message_id: Optional[str] = None,
        decision_type: Optional[DecisionType] = None,
        days: int = 30
    ) -> List[Dict]:
        """
        Get history of decisions for transparency/audit.
        
        Useful for:
        - "Show me what Aimi did with my emails today"
        - "What decisions did Aimi make about this specific email?"
        - "How often does Aimi get importance scoring right?"
        """
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(AimiDecision).filter(
            AimiDecision.user_email == user_email,
            AimiDecision.created_at >= cutoff_time
        )
        
        if message_id:
            query = query.filter(AimiDecision.message_id == message_id)
        
        if decision_type:
            query = query.filter(AimiDecision.decision_type == decision_type)
        
        decisions = query.order_by(AimiDecision.created_at.desc()).all()
        
        return [self._format_decision_for_ui(d) for d in decisions]
    
    def get_accuracy_metrics(
        self,
        user_email: str,
        decision_type: Optional[DecisionType] = None,
        days: int = 30
    ) -> Dict:
        """
        Calculate how accurate Aimi's decisions are.
        
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
        """
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(AimiDecision).filter(
            AimiDecision.user_email == user_email,
            AimiDecision.created_at >= cutoff_time,
            AimiDecision.reviewed_at.isnot(None)  # Only reviewed decisions
        )
        
        if decision_type:
            query = query.filter(AimiDecision.decision_type == decision_type)
        
        decisions = query.all()
        
        if not decisions:
            return {"total_decisions": 0, "message": "No reviewed decisions yet"}
        
        total = len(decisions)
        approved = sum(1 for d in decisions if d.status == DecisionStatus.USER_APPROVED)
        corrected = sum(1 for d in decisions if d.status == DecisionStatus.USER_CORRECTED)
        
        # Confidence calibration
        high_conf = [d for d in decisions if d.confidence >= 0.9]
        med_conf = [d for d in decisions if 0.6 <= d.confidence < 0.9]
        low_conf = [d for d in decisions if d.confidence < 0.6]
        
        return {
            "total_decisions": total,
            "user_approved": approved,
            "user_corrected": corrected,
            "approval_rate": approved / total if total > 0 else 0,
            "avg_confidence": sum(d.confidence for d in decisions) / total,
            "confidence_calibration": {
                "high (>0.9)": {
                    "count": len(high_conf),
                    "approved": sum(1 for d in high_conf if d.status == DecisionStatus.USER_APPROVED),
                    "rate": sum(1 for d in high_conf if d.status == DecisionStatus.USER_APPROVED) / len(high_conf) if high_conf else 0
                },
                "medium (0.6-0.9)": {
                    "count": len(med_conf),
                    "approved": sum(1 for d in med_conf if d.status == DecisionStatus.USER_APPROVED),
                    "rate": sum(1 for d in med_conf if d.status == DecisionStatus.USER_APPROVED) / len(med_conf) if med_conf else 0
                },
                "low (<0.6)": {
                    "count": len(low_conf),
                    "approved": sum(1 for d in low_conf if d.status == DecisionStatus.USER_APPROVED),
                    "rate": sum(1 for d in low_conf if d.status == DecisionStatus.USER_APPROVED) / len(low_conf) if low_conf else 0
                }
            }
        }
    
    def _format_decision_for_ui(self, decision: AimiDecision) -> Dict:
        """Format decision for frontend display"""
        
        # Determine icon based on status
        status_icons = {
            DecisionStatus.HANDLED: "✅",
            DecisionStatus.SUGGESTED: "🟡",
            DecisionStatus.YOUR_CALL: "🔵",
            DecisionStatus.USER_APPROVED: "👍",
            DecisionStatus.USER_CORRECTED: "✏️",
            DecisionStatus.USER_REJECTED: "❌"
        }
        
        return {
            "id": decision.id,
            "message_id": decision.message_id,
            "type": decision.decision_type.value,
            "decision": decision.decision_data,
            "reasoning": decision.reasoning,
            "confidence": decision.confidence,
            "status": decision.status.value,
            "status_icon": status_icons.get(decision.status, "❓"),
            "reviewed": decision.reviewed_at is not None,
            "user_correction": decision.user_correction,
            "correction_reasoning": decision.correction_reasoning,
            "ai_model": decision.ai_model_used,
            "created_at": decision.created_at.isoformat(),
            "reviewed_at": decision.reviewed_at.isoformat() if decision.reviewed_at else None
        }
    
    def _learn_from_correction(self, decision: AimiDecision):
        """
        Learn from user corrections to improve future decisions.
        
        This is where we update:
        - User preferences (if correction reveals preference)
        - Model confidence thresholds
        - Feature weights in importance scoring
        """
        logger.info(f"Learning from correction on decision {decision.id}")
        
        # TODO: Implement learning mechanisms:
        # 1. If user consistently corrects importance scores down for a sender
        #    → Lower that sender's base importance in SenderStats
        # 2. If user consistently corrects category assignments
        #    → Update category preferences
        # 3. If user corrects suggested actions
        #    → Learn preferred action patterns
        
        # For now, just log for analysis
        logger.info(f"Decision type: {decision.decision_type.value}")
        logger.info(f"Original: {decision.decision_data}")
        logger.info(f"Corrected to: {decision.user_correction}")
        logger.info(f"User reasoning: {decision.correction_reasoning}")


def format_decision_summary_for_ui(decisions: List[Dict]) -> Dict:
    """
    Format decision list for UI dashboard.
    
    Groups decisions by status for easy review:
    - "Needs Your Review" (SUGGESTED, YOUR_CALL)
    - "Recently Handled" (HANDLED)
    - "You Approved" (USER_APPROVED)
    - "You Corrected" (USER_CORRECTED)
    """
    needs_review = []
    handled = []
    approved = []
    corrected = []
    
    for d in decisions:
        status = d['status']
        if status in ['suggested', 'your_call']:
            needs_review.append(d)
        elif status == 'handled':
            handled.append(d)
        elif status == 'user_approved':
            approved.append(d)
        elif status == 'user_corrected':
            corrected.append(d)
    
    return {
        "needs_review": needs_review,
        "recently_handled": handled,
        "you_approved": approved,
        "you_corrected": corrected,
        "summary": {
            "total": len(decisions),
            "needs_attention": len(needs_review),
            "handled_automatically": len(handled),
            "approval_rate": len(approved) / (len(approved) + len(corrected)) if (len(approved) + len(corrected)) > 0 else None
        }
    }
