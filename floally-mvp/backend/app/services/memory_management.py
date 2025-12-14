"""
Aimi Memory Management Service
Shows, edits, and controls what Aimi has learned about user preferences.

Philosophy: "Your memory, your control"
- See patterns Aimi learned
- Edit importance weights
- Delete incorrect memories
- Shape Aimi's decision-making
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
import logging

from app.models.user import BehaviorAction, SenderStats
from app.services.decision_transparency import AimiDecision, DecisionStatus

logger = logging.getLogger(__name__)


class MemoryType:
    """Types of memories Aimi stores"""
    SENDER_PATTERN = "sender_pattern"      # Learned sender importance
    CORRECTION_PATTERN = "correction_pattern"  # User corrections that became patterns
    BEHAVIOR_PATTERN = "behavior_pattern"  # Consistent user behaviors
    CATEGORY_PREFERENCE = "category_preference"  # Category handling preferences


class AimiMemoryService:
    """Manage Aimi's learned memories for a user"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_memories(self, user_email: str) -> Dict:
        """
        Get all significant memories that shape Aimi's decisions.
        
        Returns categorized memories:
        - Sender patterns (importance learned from behavior)
        - Correction patterns (explicit user corrections)
        - Behavior patterns (consistent actions)
        - Category preferences (how user handles different types)
        """
        return {
            "sender_memories": self._get_sender_memories(user_email),
            "correction_memories": self._get_correction_memories(user_email),
            "behavior_memories": self._get_behavior_memories(user_email),
            "category_memories": self._get_category_memories(user_email),
            "summary": {
                "total_memories": 0,  # Will calculate
                "most_influential": [],
                "recently_learned": []
            }
        }
    
    def _get_sender_memories(self, user_email: str) -> List[Dict]:
        """
        Get learned sender importance patterns.
        
        These are the most influential memories - they affect every email
        from a sender. Shows:
        - Who Aimi thinks is important (and why)
        - Based on user behavior (opens, stars, archives)
        - Adjustable importance scores
        """
        # Get sender stats with interaction counts
        sender_stats = self.db.query(SenderStats).filter(
            SenderStats.user_email == user_email
        ).order_by(
            desc(SenderStats.importance_score)
        ).limit(50).all()
        
        memories = []
        for stat in sender_stats:
            # Calculate confidence based on interaction count
            confidence = min(stat.interaction_count / 20.0, 1.0)  # 20 interactions = 100% confidence
            
            # Determine why this importance was learned
            reasoning = self._explain_sender_importance(stat)
            
            memories.append({
                "memory_id": f"sender_{stat.id}",
                "memory_type": MemoryType.SENDER_PATTERN,
                "sender_email": stat.sender_email,
                "sender_domain": stat.sender_domain,
                "importance_score": stat.importance_score,
                "confidence": confidence,
                "interaction_count": stat.interaction_count,
                "last_seen": stat.last_seen.isoformat() if stat.last_seen else None,
                "reasoning": reasoning,
                "learned_from": "behavioral_patterns",
                "editable": True,
                "deletable": True
            })
        
        return memories
    
    def _explain_sender_importance(self, stat: SenderStats) -> str:
        """Explain why a sender has this importance score"""
        score = stat.importance_score
        count = stat.interaction_count
        
        if score >= 0.8:
            return f"You frequently interact with this sender ({count} times). Often open, reply, or star their emails."
        elif score >= 0.5:
            return f"Moderate interaction ({count} times). Mix of opened and archived emails."
        elif score >= 0.2:
            return f"Low interaction ({count} times). Usually archived without opening."
        else:
            return f"Very low interaction ({count} times). Consistently ignored or spam."
    
    def _get_correction_memories(self, user_email: str) -> List[Dict]:
        """
        Get patterns from user corrections.
        
        When user corrects Aimi multiple times for similar cases,
        it becomes a learned pattern. These are explicit teachings.
        """
        # Get corrected decisions
        corrections = self.db.query(AimiDecision).filter(
            AimiDecision.user_email == user_email,
            AimiDecision.status == DecisionStatus.USER_CORRECTED
        ).order_by(
            desc(AimiDecision.reviewed_at)
        ).limit(50).all()
        
        # Group corrections by pattern
        correction_patterns = {}
        for correction in corrections:
            reasoning = correction.correction_reasoning or "User adjusted score"
            
            # Simple pattern detection (can be enhanced)
            if "automated" in reasoning.lower() or "report" in reasoning.lower():
                pattern_key = "automated_reports"
            elif "spam" in reasoning.lower() or "promotional" in reasoning.lower():
                pattern_key = "promotional_content"
            elif "important" in reasoning.lower():
                pattern_key = "importance_override"
            else:
                pattern_key = "other_corrections"
            
            if pattern_key not in correction_patterns:
                correction_patterns[pattern_key] = []
            
            correction_patterns[pattern_key].append(correction)
        
        memories = []
        for pattern_key, corrections_list in correction_patterns.items():
            if len(corrections_list) >= 2:  # Only patterns with 2+ corrections
                # This is a learned pattern!
                original_avg = sum(c.decision_data.get('importance_score', 50) for c in corrections_list) / len(corrections_list)
                corrected_avg = sum(c.user_correction.get('importance_score', 50) for c in corrections_list) / len(corrections_list)
                
                memories.append({
                    "memory_id": f"correction_{pattern_key}",
                    "memory_type": MemoryType.CORRECTION_PATTERN,
                    "pattern_name": pattern_key.replace('_', ' ').title(),
                    "correction_count": len(corrections_list),
                    "average_adjustment": corrected_avg - original_avg,
                    "original_score_avg": original_avg,
                    "corrected_score_avg": corrected_avg,
                    "learned_from": "explicit_corrections",
                    "last_correction": corrections_list[0].reviewed_at.isoformat(),
                    "reasoning": f"You've corrected similar emails {len(corrections_list)} times",
                    "editable": True,
                    "deletable": True
                })
        
        return memories
    
    def _get_behavior_memories(self, user_email: str) -> List[Dict]:
        """
        Get learned behavior patterns.
        
        Consistent actions (always archive, always star, etc.)
        become learned patterns that inform future decisions.
        """
        # Get behavior actions grouped by sender
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        behaviors = self.db.query(
            BehaviorAction.sender_email,
            BehaviorAction.action_type,
            func.count(BehaviorAction.id).label('count')
        ).filter(
            BehaviorAction.user_email == user_email,
            BehaviorAction.timestamp >= thirty_days_ago
        ).group_by(
            BehaviorAction.sender_email,
            BehaviorAction.action_type
        ).having(
            func.count(BehaviorAction.id) >= 3  # At least 3 consistent actions
        ).order_by(
            desc('count')
        ).limit(30).all()
        
        memories = []
        for sender_email, action_type, count in behaviors:
            memories.append({
                "memory_id": f"behavior_{sender_email}_{action_type}",
                "memory_type": MemoryType.BEHAVIOR_PATTERN,
                "sender_email": sender_email,
                "action_type": action_type,
                "action_count": count,
                "reasoning": f"You consistently {action_type} emails from this sender ({count} times in 30 days)",
                "learned_from": "behavioral_tracking",
                "editable": False,  # Behaviors reflect actual actions
                "deletable": True   # Can delete to reset learning
            })
        
        return memories
    
    def _get_category_memories(self, user_email: str) -> List[Dict]:
        """
        Get category handling preferences.
        
        How user typically handles different email categories
        (promotional, social, etc.)
        """
        # Get actions by category (simplified - would need category tracking)
        # For now, return placeholder structure
        return [
            {
                "memory_id": "category_promotional",
                "memory_type": MemoryType.CATEGORY_PREFERENCE,
                "category": "promotional",
                "typical_action": "archive",
                "confidence": 0.75,
                "reasoning": "You usually archive promotional emails without opening",
                "learned_from": "behavioral_patterns",
                "editable": True,
                "deletable": True
            }
        ]
    
    def update_memory(
        self,
        user_email: str,
        memory_id: str,
        updates: Dict
    ) -> bool:
        """
        Update a specific memory (adjust weights, importance, etc.)
        
        Examples:
        - Adjust sender importance: {"importance_score": 0.9}
        - Change typical action: {"typical_action": "read"}
        """
        try:
            memory_type, identifier = memory_id.split('_', 1)
            
            if memory_type == "sender":
                # Update sender stats
                sender_stat = self.db.query(SenderStats).filter(
                    SenderStats.id == int(identifier),
                    SenderStats.user_email == user_email
                ).first()
                
                if sender_stat and 'importance_score' in updates:
                    sender_stat.importance_score = updates['importance_score']
                    self.db.commit()
                    logger.info(f"Updated sender importance for {sender_stat.sender_email}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error updating memory: {e}")
            return False
    
    def delete_memory(
        self,
        user_email: str,
        memory_id: str
    ) -> bool:
        """
        Delete a specific memory (reset learning for this pattern)
        
        Examples:
        - Delete sender importance: resets to default
        - Delete behavior pattern: stops influencing decisions
        """
        try:
            memory_type, identifier = memory_id.split('_', 1)
            
            if memory_type == "sender":
                # Delete sender stats (will rebuild from behavior)
                sender_stat = self.db.query(SenderStats).filter(
                    SenderStats.id == int(identifier),
                    SenderStats.user_email == user_email
                ).first()
                
                if sender_stat:
                    self.db.delete(sender_stat)
                    self.db.commit()
                    logger.info(f"Deleted sender memory for {sender_stat.sender_email}")
                    return True
            
            elif memory_type == "behavior":
                # Delete behavior actions for this pattern
                sender_email, action_type = identifier.rsplit('_', 1)
                self.db.query(BehaviorAction).filter(
                    BehaviorAction.user_email == user_email,
                    BehaviorAction.sender_email == sender_email,
                    BehaviorAction.action_type == action_type
                ).delete()
                self.db.commit()
                logger.info(f"Deleted behavior memory for {sender_email}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting memory: {e}")
            return False
    
    def get_memory_timeline(
        self,
        user_email: str,
        days: int = 30
    ) -> List[Dict]:
        """
        Get chronological timeline of key learning moments.
        
        Shows when Aimi learned important things:
        - First correction for a pattern
        - Sender importance changed significantly
        - New behavior pattern detected
        """
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        timeline = []
        
        # Get significant corrections
        corrections = self.db.query(AimiDecision).filter(
            AimiDecision.user_email == user_email,
            AimiDecision.status == DecisionStatus.USER_CORRECTED,
            AimiDecision.reviewed_at >= cutoff
        ).order_by(
            desc(AimiDecision.reviewed_at)
        ).all()
        
        for correction in corrections:
            original = correction.decision_data.get('importance_score', 50)
            corrected = correction.user_correction.get('importance_score', 50)
            delta = abs(corrected - original)
            
            if delta >= 30:  # Significant correction
                timeline.append({
                    "timestamp": correction.reviewed_at.isoformat(),
                    "event_type": "significant_correction",
                    "description": f"You corrected importance from {original} to {corrected}",
                    "reasoning": correction.correction_reasoning,
                    "impact": "high" if delta >= 50 else "medium"
                })
        
        return sorted(timeline, key=lambda x: x['timestamp'], reverse=True)
    
    def get_most_influential_memories(
        self,
        user_email: str,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get memories that have the biggest impact on decisions.
        
        Ranked by:
        - How often they're applied
        - Importance weight
        - Recency of use
        """
        # Get high-importance senders with frequent interactions
        influential_senders = self.db.query(SenderStats).filter(
            SenderStats.user_email == user_email,
            SenderStats.importance_score >= 0.7,
            SenderStats.interaction_count >= 5
        ).order_by(
            desc(SenderStats.importance_score * SenderStats.interaction_count)
        ).limit(limit).all()
        
        memories = []
        for stat in influential_senders:
            impact_score = stat.importance_score * stat.interaction_count
            memories.append({
                "memory_type": MemoryType.SENDER_PATTERN,
                "sender_email": stat.sender_email,
                "importance_score": stat.importance_score,
                "interaction_count": stat.interaction_count,
                "impact_score": impact_score,
                "reasoning": f"High importance ({stat.importance_score:.0%}) sender you interact with frequently ({stat.interaction_count} times)"
            })
        
        return memories
