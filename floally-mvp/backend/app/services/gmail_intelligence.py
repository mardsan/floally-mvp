"""
Gmail Intelligence Extractor
Maximizes value from Gmail's built-in AI signals without additional API calls.

Gmail already processes emails with AI (Gemini-powered):
- Category labels (primary/social/promotions/spam)
- Priority inbox signals
- Important flags
- Spam detection
- Thread intelligence

This service extracts all available signals to reduce unnecessary LLM calls.
"""

from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class GmailIntelligenceExtractor:
    """Extract maximum intelligence from Gmail API responses"""
    
    # Gmail's category mappings
    CATEGORY_LABELS = {
        "CATEGORY_PERSONAL": "personal",
        "CATEGORY_SOCIAL": "social",
        "CATEGORY_PROMOTIONS": "promotional",
        "CATEGORY_UPDATES": "updates",
        "CATEGORY_FORUMS": "forums",
    }
    
    # Spam/trash indicators
    NOISE_LABELS = {"SPAM", "TRASH"}
    
    # Priority indicators
    PRIORITY_LABELS = {"IMPORTANT", "STARRED"}
    
    def __init__(self):
        """Initialize the Gmail intelligence extractor"""
        pass
    
    def analyze_message(self, message_data: Dict) -> Dict:
        """
        Extract all Gmail intelligence from a message.
        
        Args:
            message_data: Raw Gmail API message response
            
        Returns:
            Dict with extracted signals:
            {
                "gmail_importance": bool,
                "gmail_category": str,
                "gmail_priority": bool,
                "is_starred": bool,
                "is_spam": bool,
                "is_trash": bool,
                "thread_size": int,
                "sender_reputation": str,
                "confidence": float
            }
        """
        label_ids = message_data.get("labelIds", [])
        
        signals = {
            "gmail_importance": self._check_importance_label(label_ids),
            "gmail_category": self._extract_category(label_ids),
            "gmail_priority": self._check_priority_signals(label_ids),
            "is_starred": "STARRED" in label_ids,
            "is_spam": "SPAM" in label_ids,
            "is_trash": "TRASH" in label_ids,
            "thread_size": self._estimate_thread_size(message_data),
            "sender_reputation": self._infer_sender_reputation(label_ids),
            "confidence": self._calculate_confidence(label_ids),
        }
        
        logger.debug(f"Extracted Gmail signals: {signals}")
        return signals
    
    def should_skip_llm_analysis(self, signals: Dict) -> bool:
        """
        Determine if Gmail signals are strong enough to skip LLM call.
        
        Skip LLM for:
        - Obvious spam (Gmail flagged as SPAM)
        - Clear promotional with no priority signals
        - Trash items
        
        Args:
            signals: Output from analyze_message()
            
        Returns:
            bool: True if we can skip expensive LLM analysis
        """
        # Always skip obvious spam/trash
        if signals["is_spam"] or signals["is_trash"]:
            logger.info("Skipping LLM: Gmail flagged as spam/trash")
            return True
        
        # Skip clear promotional with no importance signals
        if (signals["gmail_category"] == "promotional" and 
            not signals["gmail_priority"] and 
            not signals["is_starred"]):
            logger.info("Skipping LLM: Clear promotional, no priority signals")
            return True
        
        # Always analyze important/starred messages with LLM
        if signals["gmail_importance"] or signals["is_starred"]:
            logger.info("Using LLM: Gmail marked as important/starred")
            return False
        
        # Default: use LLM for uncertain cases
        return False
    
    def get_baseline_importance_score(self, signals: Dict) -> float:
        """
        Calculate baseline importance score from Gmail signals alone.
        Scale: 0.0 - 1.0
        
        This provides a fast score without LLM calls.
        Use for initial filtering or when LLM is skipped.
        
        Args:
            signals: Output from analyze_message()
            
        Returns:
            float: Importance score (0.0 = noise, 1.0 = critical)
        """
        score = 0.5  # Neutral baseline
        
        # Strong negative signals
        if signals["is_spam"]:
            return 0.0
        if signals["is_trash"]:
            return 0.0
        
        # Category-based adjustment
        category_scores = {
            "personal": 0.7,
            "social": 0.4,
            "promotional": 0.2,
            "updates": 0.3,
            "forums": 0.3,
        }
        if signals["gmail_category"] in category_scores:
            score = category_scores[signals["gmail_category"]]
        
        # Priority signals boost
        # Gmail's IMPORTANT label uses ML trained on billions of emails - trust it!
        if signals["gmail_importance"]:
            score = max(score, 0.8)  # IMPORTANT = minimum 80% importance
            logger.info(f"Gmail IMPORTANT label detected - boosting to minimum 0.8")
        if signals["is_starred"]:
            score = max(score, 0.85)  # User-starred = minimum 85% importance
            logger.info(f"User-starred message - boosting to minimum 0.85")
        if signals["gmail_priority"]:
            score += 0.1  # Additional priority inbox boost
        
        # Thread size indicates engagement
        if signals["thread_size"] > 5:
            score += 0.1  # Active conversation
        
        # Sender reputation
        if signals["sender_reputation"] == "trusted":
            score += 0.15
        elif signals["sender_reputation"] == "suspicious":
            score -= 0.2
        
        # Cap at 0.0 - 1.0
        return max(0.0, min(1.0, score))
    
    def _check_importance_label(self, label_ids: List[str]) -> bool:
        """Check if Gmail marked message as IMPORTANT"""
        return "IMPORTANT" in label_ids
    
    def _extract_category(self, label_ids: List[str]) -> Optional[str]:
        """Extract Gmail category from label IDs"""
        for label_id in label_ids:
            if label_id in self.CATEGORY_LABELS:
                return self.CATEGORY_LABELS[label_id]
        return None
    
    def _check_priority_signals(self, label_ids: List[str]) -> bool:
        """Check if any priority indicators present"""
        return bool(set(label_ids) & self.PRIORITY_LABELS)
    
    def _estimate_thread_size(self, message_data: Dict) -> int:
        """
        Estimate conversation thread size.
        Gmail doesn't return full thread in message response,
        but we can infer from threadId presence.
        """
        # If threadId exists and differs from message ID, it's a thread
        thread_id = message_data.get("threadId")
        message_id = message_data.get("id")
        
        if thread_id and thread_id != message_id:
            # Thread exists, but we'd need separate API call for size
            # For now, return estimated value
            return 2  # Conservative estimate
        return 1  # Single message
    
    def _infer_sender_reputation(self, label_ids: List[str]) -> str:
        """
        Infer sender reputation from Gmail's treatment of message.
        
        Returns:
            "trusted" | "neutral" | "suspicious"
        """
        # Spam/trash indicates suspicious sender
        if "SPAM" in label_ids or "TRASH" in label_ids:
            return "suspicious"
        
        # Important/Priority indicates trusted sender
        if "IMPORTANT" in label_ids:
            return "trusted"
        
        # Personal category suggests real person (trusted)
        if "CATEGORY_PERSONAL" in label_ids:
            return "trusted"
        
        # Promotional/social are neutral
        return "neutral"
    
    def _calculate_confidence(self, label_ids: List[str]) -> float:
        """
        Calculate confidence in Gmail's signals.
        
        Returns:
            float: Confidence level (0.0 = uncertain, 1.0 = very confident)
        """
        confidence = 0.5  # Base confidence
        
        # Strong signals increase confidence
        if "SPAM" in label_ids:
            confidence = 0.95  # Gmail is very good at spam detection
        if "IMPORTANT" in label_ids:
            confidence = 0.85  # Important flag is reliable
        if "STARRED" in label_ids:
            confidence = 1.0  # User action, 100% confident
        
        # Category assignment adds confidence
        has_category = any(label in self.CATEGORY_LABELS for label in label_ids)
        if has_category:
            confidence = max(confidence, 0.7)
        
        return confidence


def format_gmail_signals_for_context(signals: Dict) -> str:
    """
    Format Gmail signals as context string for LLM prompts.
    
    Args:
        signals: Output from GmailIntelligenceExtractor.analyze_message()
        
    Returns:
        Formatted string for LLM context
    """
    parts = ["Gmail Intelligence:"]
    
    if signals["is_spam"]:
        parts.append("⚠️ Flagged as SPAM by Gmail")
    elif signals["is_trash"]:
        parts.append("🗑️ In trash")
    
    if signals["gmail_importance"]:
        parts.append("⭐ Marked IMPORTANT by Gmail")
    if signals["is_starred"]:
        parts.append("⭐ Starred by user")
    
    category = signals["gmail_category"]
    if category:
        category_emoji = {
            "personal": "👤",
            "social": "👥", 
            "promotional": "📢",
            "updates": "📬",
            "forums": "💬"
        }
        emoji = category_emoji.get(category, "📧")
        parts.append(f"{emoji} Category: {category.title()}")
    
    reputation = signals["sender_reputation"]
    if reputation == "trusted":
        parts.append("✅ Trusted sender (Gmail assessment)")
    elif reputation == "suspicious":
        parts.append("⚠️ Suspicious sender (Gmail assessment)")
    
    if signals["thread_size"] > 1:
        parts.append(f"💬 Part of conversation thread ({signals['thread_size']} messages)")
    
    confidence = signals["confidence"]
    parts.append(f"Confidence: {confidence:.0%}")
    
    return "\n".join(parts)


# Example usage
if __name__ == "__main__":
    # Test with sample Gmail API response
    sample_message = {
        "id": "12345",
        "threadId": "12345",
        "labelIds": ["INBOX", "IMPORTANT", "CATEGORY_PERSONAL", "UNREAD"],
    }
    
    extractor = GmailIntelligenceExtractor()
    signals = extractor.analyze_message(sample_message)
    
    print("Extracted Signals:")
    print(signals)
    print("\nShould skip LLM?", extractor.should_skip_llm_analysis(signals))
    print("Baseline score:", extractor.get_baseline_importance_score(signals))
    print("\nFormatted for LLM:")
    print(format_gmail_signals_for_context(signals))
