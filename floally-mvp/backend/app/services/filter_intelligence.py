"""
User Filter Intelligence Service
Analyzes Gmail filters to understand explicit user priorities.

If a user has set up filters to:
- Auto-archive certain senders → Low priority
- Auto-star certain senders → High priority  
- Auto-mark as important → High priority
- Auto-delete by keyword → Noise

This provides explicit user intent that should override AI analysis.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, JSON, DateTime
from app.database import Base

logger = logging.getLogger(__name__)


# Cache model for filter intelligence
class FilterIntelligenceCache(Base):
    """Cache user's filter intelligence to avoid repeated API calls"""
    __tablename__ = "filter_intelligence_cache"
    
    user_email = Column(String, primary_key=True)
    filter_data = Column(JSON)  # Cached filter analysis
    last_updated = Column(DateTime, default=datetime.utcnow)


class UserFilterIntelligence:
    """Extract intelligence from user's Gmail filters"""
    
    CACHE_DURATION_HOURS = 24  # Refresh once per day
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_filter_intelligence(
        self, 
        gmail_service, 
        user_email: str,
        force_refresh: bool = False
    ) -> Dict:
        """
        Get user's filter intelligence (cached).
        
        Args:
            gmail_service: Authenticated Gmail API service
            user_email: User's email address
            force_refresh: Skip cache and fetch fresh data
            
        Returns:
            Dict with filter intelligence:
            {
                "auto_archive_senders": ["newsletter@site.com"],
                "auto_star_senders": ["boss@company.com"],
                "auto_important_senders": ["client@important.com"],
                "auto_delete_keywords": ["unsubscribe"],
                "low_priority_domains": ["@marketing.com"],
                "high_priority_domains": ["@company.com"]
            }
        """
        # Check cache first
        if not force_refresh:
            cached = self._get_cached_intelligence(user_email)
            if cached:
                logger.info(f"Using cached filter intelligence for {user_email}")
                return cached
        
        # Fetch fresh data from Gmail API
        try:
            logger.info(f"Fetching Gmail filters for {user_email}")
            filters = gmail_service.users().settings().filters().list(userId='me').execute()
            intelligence = self._analyze_filters(filters)
            
            # Cache for 24 hours
            self._cache_intelligence(user_email, intelligence)
            
            return intelligence
            
        except Exception as e:
            logger.error(f"Error fetching filters: {str(e)}")
            # Return empty intelligence on error
            return self._empty_intelligence()
    
    def check_sender_priority(
        self, 
        intelligence: Dict, 
        sender_email: str,
        sender_domain: str
    ) -> Dict:
        """
        Check if sender matches any explicit user filter rules.
        
        Returns:
            {
                "explicit_priority": "high" | "low" | None,
                "reasoning": str,
                "skip_llm": bool  # True if filter rule is explicit enough
            }
        """
        # Check for explicit auto-archive (LOW priority)
        if sender_email in intelligence.get("auto_archive_senders", []):
            return {
                "explicit_priority": "low",
                "reasoning": f"User has filter to auto-archive emails from {sender_email}",
                "skip_llm": True,
                "importance_score": 0.1
            }
        
        # Check domain-level auto-archive
        if sender_domain in intelligence.get("low_priority_domains", []):
            return {
                "explicit_priority": "low",
                "reasoning": f"User has filter to auto-archive emails from {sender_domain}",
                "skip_llm": True,
                "importance_score": 0.15
            }
        
        # Check for explicit auto-star (HIGH priority)
        if sender_email in intelligence.get("auto_star_senders", []):
            return {
                "explicit_priority": "high",
                "reasoning": f"User has filter to auto-star emails from {sender_email}",
                "skip_llm": True,
                "importance_score": 0.95
            }
        
        # Check for explicit auto-important (HIGH priority)
        if sender_email in intelligence.get("auto_important_senders", []):
            return {
                "explicit_priority": "high",
                "reasoning": f"User has filter to mark emails from {sender_email} as important",
                "skip_llm": True,
                "importance_score": 0.90
            }
        
        # Check domain-level high priority
        if sender_domain in intelligence.get("high_priority_domains", []):
            return {
                "explicit_priority": "high",
                "reasoning": f"User has filter for high priority domain {sender_domain}",
                "skip_llm": False,  # Still use LLM for nuance
                "importance_boost": 0.2
            }
        
        # No explicit filter match
        return {
            "explicit_priority": None,
            "reasoning": None,
            "skip_llm": False
        }
    
    def _analyze_filters(self, filters_response: Dict) -> Dict:
        """
        Analyze Gmail filter rules to extract priority intelligence.
        
        Gmail filter actions we care about:
        - removeLabelIds: ["INBOX"] = auto-archive (low priority)
        - addLabelIds: ["STARRED"] = auto-star (high priority)
        - addLabelIds: ["IMPORTANT"] = auto-important (high priority)
        - forward = delegate/important
        """
        intelligence = self._empty_intelligence()
        
        filter_list = filters_response.get('filter', [])
        logger.info(f"Analyzing {len(filter_list)} Gmail filters")
        
        for filter_rule in filter_list:
            criteria = filter_rule.get('criteria', {})
            action = filter_rule.get('action', {})
            
            # Extract sender from criteria
            sender = criteria.get('from', '')
            subject_keywords = criteria.get('subject', '')
            
            # Action: Auto-archive (remove from inbox)
            if 'INBOX' in action.get('removeLabelIds', []):
                if sender:
                    if '@' in sender:
                        intelligence['auto_archive_senders'].append(sender.lower())
                        # Extract domain
                        domain = sender.split('@')[1] if '@' in sender else None
                        if domain and domain not in intelligence['low_priority_domains']:
                            intelligence['low_priority_domains'].append(domain)
                    logger.info(f"Found auto-archive filter: {sender}")
            
            # Action: Auto-star
            if 'STARRED' in action.get('addLabelIds', []):
                if sender:
                    intelligence['auto_star_senders'].append(sender.lower())
                    logger.info(f"Found auto-star filter: {sender}")
            
            # Action: Auto-mark important
            if 'IMPORTANT' in action.get('addLabelIds', []):
                if sender:
                    intelligence['auto_important_senders'].append(sender.lower())
                    # Extract domain for high priority
                    domain = sender.split('@')[1] if '@' in sender else None
                    if domain and domain not in intelligence['high_priority_domains']:
                        intelligence['high_priority_domains'].append(domain)
                    logger.info(f"Found auto-important filter: {sender}")
            
            # Action: Delete (extreme low priority)
            if 'TRASH' in action.get('addLabelIds', []):
                if subject_keywords:
                    intelligence['auto_delete_keywords'].append(subject_keywords.lower())
                    logger.info(f"Found auto-delete filter: {subject_keywords}")
        
        return intelligence
    
    def _empty_intelligence(self) -> Dict:
        """Return empty intelligence structure"""
        return {
            "auto_archive_senders": [],
            "auto_star_senders": [],
            "auto_important_senders": [],
            "auto_delete_keywords": [],
            "low_priority_domains": [],
            "high_priority_domains": []
        }
    
    def _get_cached_intelligence(self, user_email: str) -> Optional[Dict]:
        """Get cached filter intelligence if fresh enough"""
        try:
            cache = self.db.query(FilterIntelligenceCache).filter(
                FilterIntelligenceCache.user_email == user_email
            ).first()
            
            if not cache:
                return None
            
            # Check if cache is still fresh
            age = datetime.utcnow() - cache.last_updated
            if age < timedelta(hours=self.CACHE_DURATION_HOURS):
                return cache.filter_data
            
            # Cache expired
            logger.info(f"Filter cache expired for {user_email} (age: {age})")
            return None
            
        except Exception as e:
            logger.error(f"Error reading filter cache: {str(e)}")
            return None
    
    def _cache_intelligence(self, user_email: str, intelligence: Dict):
        """Save filter intelligence to cache"""
        try:
            cache = self.db.query(FilterIntelligenceCache).filter(
                FilterIntelligenceCache.user_email == user_email
            ).first()
            
            if cache:
                cache.filter_data = intelligence
                cache.last_updated = datetime.utcnow()
            else:
                cache = FilterIntelligenceCache(
                    user_email=user_email,
                    filter_data=intelligence,
                    last_updated=datetime.utcnow()
                )
                self.db.add(cache)
            
            self.db.commit()
            logger.info(f"Cached filter intelligence for {user_email}")
            
        except Exception as e:
            logger.error(f"Error caching filter intelligence: {str(e)}")
            self.db.rollback()


def format_filter_intelligence_for_context(intelligence: Dict, sender_email: str) -> str:
    """
    Format filter intelligence for LLM context.
    
    Returns human-readable summary of user's explicit preferences.
    """
    if not intelligence:
        return ""
    
    context_parts = []
    
    # Check if sender matches any rules
    if sender_email in intelligence.get("auto_archive_senders", []):
        context_parts.append(f"⚠️ User has EXPLICIT filter to auto-archive emails from {sender_email}")
        context_parts.append("   → This sender is explicitly marked as LOW PRIORITY")
    
    if sender_email in intelligence.get("auto_star_senders", []):
        context_parts.append(f"⭐ User has EXPLICIT filter to auto-star emails from {sender_email}")
        context_parts.append("   → This sender is explicitly marked as HIGH PRIORITY")
    
    if sender_email in intelligence.get("auto_important_senders", []):
        context_parts.append(f"🔥 User has EXPLICIT filter to mark emails from {sender_email} as IMPORTANT")
        context_parts.append("   → This sender is explicitly marked as HIGH PRIORITY")
    
    # Summary stats
    if intelligence.get("auto_archive_senders"):
        count = len(intelligence["auto_archive_senders"])
        context_parts.append(f"\nUser has {count} auto-archive filter(s) for explicit low-priority senders")
    
    if intelligence.get("auto_star_senders") or intelligence.get("auto_important_senders"):
        count = len(intelligence.get("auto_star_senders", [])) + len(intelligence.get("auto_important_senders", []))
        context_parts.append(f"User has {count} auto-star/important filter(s) for explicit high-priority senders")
    
    return "\n".join(context_parts) if context_parts else ""
