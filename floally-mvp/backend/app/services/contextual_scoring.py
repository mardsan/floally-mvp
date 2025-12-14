"""
Contextual AI Scoring Service
Multi-layer intelligence system for understanding message importance
Based on sender relationship, user context, and behavioral patterns
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import anthropic
import os
import json

from app.models.user import User, UserProfile, SenderStats, BehaviorAction
from app.models.trusted_sender import TrustedSender, TrustLevel


class ContextualScorer:
    """
    Multi-tier scoring system that understands sender relationships
    and user priorities rather than just keyword matching
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    def calculate_contextual_importance(
        self,
        user_id: str,
        sender_email: str,
        sender_name: Optional[str],
        subject: str,
        snippet: str,
        gmail_signals: Dict
    ) -> Dict:
        """
        Layer 1-3: Fast scoring without LLM
        Returns importance score with reasoning
        """
        # Layer 1: Get sender behavioral history
        sender_history = self._get_sender_context(user_id, sender_email)
        
        # Layer 2: Get user profile and priorities
        user_context = self._get_user_context(user_id)
        
        # Layer 3: Get trust level
        trust_context = self._get_trust_context(user_id, sender_email)
        
        # Calculate composite score (0-100)
        score = self._calculate_composite_score(
            sender_history=sender_history,
            user_context=user_context,
            trust_context=trust_context,
            gmail_signals=gmail_signals,
            subject=subject,
            snippet=snippet
        )
        
        # Generate explanation
        reasoning = self._explain_score(
            score=score,
            sender_history=sender_history,
            trust_context=trust_context,
            user_context=user_context,
            gmail_signals=gmail_signals
        )
        
        return {
            "importance_score": score,
            "reasoning": reasoning,
            "sender_relationship": sender_history.get("relationship_type", "unknown"),
            "confidence": self._calculate_confidence(sender_history),
            "suggested_action": self._suggest_action(score, sender_history, trust_context)
        }
    
    async def deep_contextual_analysis(
        self,
        user_id: str,
        messages: List[Dict],
        use_llm: bool = True
    ) -> List[Dict]:
        """
        Layer 4: LLM-powered contextual reasoning for complex cases
        Use sparingly for messages where fast scoring has low confidence
        """
        if not use_llm or not messages:
            return []
        
        # Get comprehensive user context
        user_context = self._get_user_context(user_id)
        sender_patterns = self._get_behavioral_patterns(user_id)
        
        # Filter to messages needing deep analysis (unknown senders, conflicting signals)
        messages_needing_analysis = [
            msg for msg in messages
            if msg.get("confidence", 1.0) < 0.6 or msg.get("sender_relationship") == "unknown"
        ][:20]  # Limit to 20 for cost control
        
        if not messages_needing_analysis:
            return []
        
        # Build context-rich prompt
        prompt = self._build_contextual_prompt(
            user_context=user_context,
            sender_patterns=sender_patterns,
            messages=messages_needing_analysis
        )
        
        # Use Claude Sonnet for contextual reasoning
        response = self.anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",  # Latest Sonnet 4 (upgraded from 3.5)
            max_tokens=4000,
            temperature=0.3,  # Lower temperature for consistency
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Parse and return enhanced scores
        enhanced_scores = self._parse_llm_response(response.content[0].text)
        return enhanced_scores
    
    def _get_sender_context(self, user_id: str, sender_email: str) -> Dict:
        """Layer 1: Load sender behavioral data"""
        stats = self.db.query(SenderStats).filter(
            SenderStats.user_id == user_id,
            SenderStats.sender_email == sender_email
        ).first()
        
        if not stats:
            return {
                "is_new": True,
                "total_emails": 0,
                "importance_score": 0.5,
                "relationship_type": "unknown",
                "response_pattern": "no_data"
            }
        
        # Calculate patterns
        total_interactions = (
            stats.marked_important + stats.marked_interesting + 
            stats.marked_unimportant + stats.responded + 
            stats.archived + stats.trashed
        )
        
        if total_interactions == 0:
            response_rate = 0
            archive_rate = 0
            importance_rate = 0
        else:
            response_rate = stats.responded / total_interactions
            archive_rate = stats.archived / total_interactions
            importance_rate = stats.marked_important / total_interactions
        
        # Classify relationship
        relationship_type = self._classify_relationship(
            response_rate, archive_rate, importance_rate, stats.total_emails
        )
        
        return {
            "is_new": False,
            "total_emails": stats.total_emails,
            "importance_score": stats.importance_score,
            "relationship_type": relationship_type,
            "response_pattern": "frequent" if response_rate > 0.5 else "occasional" if response_rate > 0.1 else "rare",
            "response_rate": response_rate,
            "archive_rate": archive_rate,
            "importance_rate": importance_rate,
            "last_interaction": stats.last_interaction
        }
    
    def _get_user_context(self, user_id: str) -> Dict:
        """Layer 2: Load user profile and priorities"""
        profile = self.db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).first()
        
        if not profile:
            return {
                "role": "Professional",
                "priorities": [],
                "communication_style": "professional",
                "has_context": False
            }
        
        return {
            "role": profile.role or "Professional",
            "priorities": profile.priorities or [],
            "communication_style": profile.communication_style or "professional",
            "company": profile.company,
            "work_hours": profile.work_hours,
            "has_context": True
        }
    
    def _get_trust_context(self, user_id: str, sender_email: str) -> Dict:
        """Layer 3: Get explicit trust designation"""
        trusted = self.db.query(TrustedSender).filter(
            TrustedSender.user_id == user_id,
            TrustedSender.sender_email == sender_email
        ).first()
        
        if not trusted:
            return {
                "trust_level": "neutral",
                "is_explicit": False,
                "attachment_history": 0
            }
        
        return {
            "trust_level": trusted.trust_level.value,
            "is_explicit": True,
            "attachment_history": trusted.attachment_count,
            "last_used": trusted.last_used
        }
    
    def _get_behavioral_patterns(self, user_id: str) -> Dict:
        """Get learned patterns from behavior history"""
        # Get recent behavior actions (last 90 days)
        recent_cutoff = datetime.utcnow() - timedelta(days=90)
        
        actions = self.db.query(BehaviorAction).filter(
            BehaviorAction.user_id == user_id,
            BehaviorAction.action_timestamp >= recent_cutoff
        ).order_by(desc(BehaviorAction.action_timestamp)).limit(500).all()
        
        # Aggregate patterns
        patterns = {
            "senders_always_archived": set(),
            "senders_always_opened": set(),
            "keywords_that_matter": set(),
            "fast_response_times": []
        }
        
        sender_actions = {}
        for action in actions:
            email = action.sender_email
            if email not in sender_actions:
                sender_actions[email] = {"archive": 0, "open": 0, "respond": 0, "total": 0}
            
            sender_actions[email]["total"] += 1
            if action.action_type == "archived":
                sender_actions[email]["archive"] += 1
            elif action.action_type == "opened":
                sender_actions[email]["open"] += 1
            elif action.action_type == "responded":
                sender_actions[email]["respond"] += 1
        
        # Identify consistent patterns
        for email, stats in sender_actions.items():
            if stats["total"] >= 5:  # Need at least 5 interactions
                archive_rate = stats["archive"] / stats["total"]
                open_rate = stats["open"] / stats["total"]
                
                if archive_rate > 0.8:
                    patterns["senders_always_archived"].add(email)
                if open_rate > 0.8 or stats["respond"] > 2:
                    patterns["senders_always_opened"].add(email)
        
        return {
            "consistent_archives": list(patterns["senders_always_archived"]),
            "consistent_opens": list(patterns["senders_always_opened"]),
            "total_actions_tracked": len(actions)
        }
    
    def _classify_relationship(
        self,
        response_rate: float,
        archive_rate: float,
        importance_rate: float,
        total_emails: int
    ) -> str:
        """Classify sender relationship based on behavioral patterns"""
        if response_rate > 0.5 and total_emails >= 3:
            return "vip"  # User frequently engages
        elif importance_rate > 0.6 and total_emails >= 3:
            return "important"  # User marks as important
        elif archive_rate > 0.7 and total_emails >= 5:
            return "noise"  # User consistently archives
        elif total_emails < 3:
            return "unknown"  # Not enough data
        elif response_rate > 0.2:
            return "occasional"  # Sometimes engages
        else:
            return "informational"  # Reads but doesn't respond
    
    def _calculate_composite_score(
        self,
        sender_history: Dict,
        user_context: Dict,
        trust_context: Dict,
        gmail_signals: Dict,
        subject: str,
        snippet: str
    ) -> float:
        """
        Calculate importance score from multiple signals
        Returns 0-100 score
        """
        score = 50.0  # Start neutral
        
        # Sender relationship weight (highest impact)
        relationship = sender_history.get("relationship_type", "unknown")
        if relationship == "vip":
            score += 40
        elif relationship == "important":
            score += 30
        elif relationship == "occasional":
            score += 10
        elif relationship == "noise":
            score -= 35
        elif relationship == "informational":
            score += 5
        
        # Historical importance score
        if sender_history.get("importance_score"):
            historical_boost = (sender_history["importance_score"] - 0.5) * 30
            score += historical_boost
        
        # Trust level
        trust_level = trust_context.get("trust_level", "neutral")
        if trust_level == "trusted":
            score += 15
        elif trust_level == "blocked":
            score -= 50
        
        # Gmail signals
        if gmail_signals.get("is_starred"):
            score += 20
        if gmail_signals.get("is_important"):
            score += 15
        if gmail_signals.get("category") == "promotional":
            score -= 25
        elif gmail_signals.get("category") == "primary":
            score += 10
        
        # Subject/content signals
        urgent_keywords = ["urgent", "asap", "deadline", "today", "approval needed", "review needed"]
        if any(keyword in subject.lower() for keyword in urgent_keywords):
            score += 15
        
        if gmail_signals.get("has_unsubscribe_link"):
            score -= 20
        
        # Clamp to 0-100
        return max(0.0, min(100.0, score))
    
    def _calculate_confidence(self, sender_history: Dict) -> float:
        """Calculate confidence in the score (0-1)"""
        total_emails = sender_history.get("total_emails", 0)
        
        if total_emails == 0:
            return 0.3  # Low confidence for unknown senders
        elif total_emails < 3:
            return 0.5
        elif total_emails < 10:
            return 0.7
        else:
            return 0.9  # High confidence with lots of data
    
    def _suggest_action(
        self,
        score: float,
        sender_history: Dict,
        trust_context: Dict
    ) -> str:
        """Suggest what to do with this message"""
        relationship = sender_history.get("relationship_type", "unknown")
        
        if score >= 75:
            return "reply_now"
        elif score >= 60:
            return "review_today"
        elif score >= 40:
            return "read_later"
        elif score >= 25:
            return "archive_if_not_urgent"
        elif relationship == "noise" and sender_history.get("archive_rate", 0) > 0.8:
            return "auto_archive"
        else:
            return "user_decides"
    
    def _explain_score(
        self,
        score: float,
        sender_history: Dict,
        trust_context: Dict,
        user_context: Dict,
        gmail_signals: Dict
    ) -> str:
        """Generate human-readable explanation"""
        reasons = []
        
        relationship = sender_history.get("relationship_type", "unknown")
        if relationship == "vip":
            reasons.append("You frequently engage with this sender")
        elif relationship == "important":
            reasons.append("You've marked this sender as important before")
        elif relationship == "noise":
            reasons.append(f"You archive {int(sender_history.get('archive_rate', 0) * 100)}% of emails from this sender")
        elif relationship == "unknown":
            reasons.append("New sender - no history available")
        
        if trust_context.get("trust_level") == "trusted":
            reasons.append("Explicitly trusted contact")
        elif trust_context.get("trust_level") == "blocked":
            reasons.append("Blocked sender")
        
        if gmail_signals.get("is_starred"):
            reasons.append("Starred by Gmail")
        
        if gmail_signals.get("category") == "promotional":
            reasons.append("Promotional content")
        
        if not reasons:
            reasons.append("Standard email with no strong signals")
        
        return " • ".join(reasons)
    
    def _build_contextual_prompt(
        self,
        user_context: Dict,
        sender_patterns: Dict,
        messages: List[Dict]
    ) -> str:
        """Build rich context prompt for LLM reasoning"""
        return f"""You are Aimi, {user_context.get('role', 'a professional')}'s AI operational teammate.

USER CONTEXT:
- Role: {user_context.get('role')}
- Current Priorities: {', '.join(user_context.get('priorities', ['General work']))}
- Communication Style: {user_context.get('communication_style')}
- Company: {user_context.get('company', 'Not specified')}

LEARNED PATTERNS (from {sender_patterns.get('total_actions_tracked', 0)} recent actions):
- Senders user always archives: {len(sender_patterns.get('consistent_archives', []))} identified
- Senders user always opens: {len(sender_patterns.get('consistent_opens', []))} identified

MESSAGES NEEDING ANALYSIS:
{json.dumps([{
    'index': i,
    'from': msg.get('from'),
    'subject': msg.get('subject'),
    'snippet': msg.get('snippet')[:150],
    'sender_relationship': msg.get('sender_relationship'),
    'initial_score': msg.get('importance_score'),
    'confidence': msg.get('confidence')
} for i, msg in enumerate(messages)], indent=2)}

QUESTION: Which of these messages truly matter to this user given their role, priorities, and behavior patterns?

For each message, provide:
1. adjusted_score (0-100): Your contextual importance score
2. reasoning: WHY this matters (or doesn't) to THIS specific user
3. relationship_insight: What this sender means to the user
4. suggested_action: reply_now | review_today | read_later | archive

Return ONLY valid JSON array format:
[{{"index": 0, "adjusted_score": 85, "reasoning": "...", "relationship_insight": "...", "suggested_action": "reply_now"}}, ...]"""
    
    def _parse_llm_response(self, response_text: str) -> List[Dict]:
        """Parse LLM JSON response"""
        try:
            # Extract JSON from markdown code blocks if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            return json.loads(response_text.strip())
        except Exception as e:
            print(f"Failed to parse LLM response: {e}")
            return []
