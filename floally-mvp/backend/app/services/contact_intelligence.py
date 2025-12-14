"""
Contact Intelligence Service
Analyzes relationship strength using Google People API.

The People API provides:
- Interaction count (how often you email someone)
- Contact metadata (organization, title)
- Last updated time
- Contact groups

This helps determine if a sender is:
- Frequent contact (high importance boost)
- Known colleague (moderate boost)
- Rare/unknown contact (neutral)
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, JSON, DateTime, Integer
from app.database import Base

logger = logging.getLogger(__name__)


# Cache model for contact intelligence
class ContactIntelligenceCache(Base):
    """Cache contact metadata to avoid repeated API calls"""
    __tablename__ = "contact_intelligence_cache"
    
    sender_email = Column(String, primary_key=True)
    contact_data = Column(JSON)  # Cached contact metadata
    interaction_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)


class ContactIntelligenceService:
    """Analyze sender relationship strength using People API"""
    
    CACHE_DURATION_DAYS = 7  # Refresh weekly
    
    def __init__(self, db: Session):
        self.db = db
    
    def analyze_contact(
        self,
        people_service,
        sender_email: str,
        force_refresh: bool = False
    ) -> Dict:
        """
        Analyze relationship with sender using People API.
        
        Args:
            people_service: Authenticated Google People API service
            sender_email: Sender's email address
            force_refresh: Skip cache and fetch fresh data
            
        Returns:
            Dict with contact intelligence:
            {
                "in_contacts": bool,
                "interaction_count": int,
                "relationship_strength": "frequent"|"regular"|"occasional"|"rare"|"unknown",
                "organization": str,
                "title": str,
                "last_interaction": datetime,
                "is_vip": bool
            }
        """
        # Check cache first
        if not force_refresh:
            cached = self._get_cached_contact(sender_email)
            if cached:
                logger.info(f"Using cached contact intelligence for {sender_email}")
                return cached
        
        # Fetch fresh data from People API
        try:
            logger.info(f"Fetching contact data for {sender_email}")
            
            # Search for contact by email
            person = people_service.people().searchContacts(
                query=sender_email,
                readMask='names,emailAddresses,organizations,metadata'
            ).execute()
            
            results = person.get('results', [])
            
            if not results:
                # Not in contacts
                intelligence = self._unknown_contact()
                self._cache_contact(sender_email, intelligence)
                return intelligence
            
            # Parse contact data
            person_data = results[0].get('person', {})
            intelligence = self._parse_contact_data(person_data, sender_email)
            
            # Cache for 7 days
            self._cache_contact(sender_email, intelligence)
            
            return intelligence
            
        except Exception as e:
            logger.error(f"Error fetching contact data: {str(e)}")
            # Return unknown on error
            return self._unknown_contact()
    
    def get_importance_boost(self, intelligence: Dict) -> float:
        """
        Calculate importance boost based on relationship strength.
        
        Returns:
            Float between 0.0 - 0.3 (additive boost to importance score)
        """
        if not intelligence.get('in_contacts'):
            return 0.0  # Unknown sender, no boost
        
        strength = intelligence.get('relationship_strength', 'unknown')
        
        boost_map = {
            'frequent': 0.25,    # Very high boost for frequent contacts
            'regular': 0.15,     # Good boost for regular contacts
            'occasional': 0.08,  # Small boost for occasional contacts
            'rare': 0.02,        # Minimal boost for rare contacts
            'unknown': 0.0
        }
        
        boost = boost_map.get(strength, 0.0)
        
        # Additional VIP boost
        if intelligence.get('is_vip'):
            boost += 0.1
        
        # Organization boost (known colleague)
        if intelligence.get('organization'):
            boost += 0.05
        
        return min(0.3, boost)  # Cap at 0.3
    
    def _parse_contact_data(self, person_data: Dict, sender_email: str) -> Dict:
        """Parse People API response into intelligence dict"""
        
        metadata = person_data.get('metadata', {})
        interaction_count = 0
        
        # Try to get interaction count from metadata sources
        sources = metadata.get('sources', [])
        for source in sources:
            if source.get('type') == 'CONTACT':
                # Some sources include interaction metadata
                interaction_count = source.get('updateTime', 0)  # Approximation
        
        # Get organization info
        organizations = person_data.get('organizations', [])
        org_name = organizations[0].get('name', '') if organizations else ''
        org_title = organizations[0].get('title', '') if organizations else ''
        
        # Calculate relationship strength
        strength = self._calculate_relationship_strength(interaction_count)
        
        # Determine if VIP (simple heuristic)
        is_vip = strength in ['frequent', 'regular'] and org_name
        
        return {
            'in_contacts': True,
            'interaction_count': interaction_count,
            'relationship_strength': strength,
            'organization': org_name,
            'title': org_title,
            'last_interaction': datetime.utcnow(),  # Approximation
            'is_vip': is_vip,
            'sender_email': sender_email
        }
    
    def _calculate_relationship_strength(self, interaction_count: int) -> str:
        """
        Calculate relationship strength from interaction count.
        
        Note: Interaction count from People API may not be exact,
        so we use conservative thresholds.
        """
        if interaction_count > 100:
            return 'frequent'
        elif interaction_count > 20:
            return 'regular'
        elif interaction_count > 5:
            return 'occasional'
        elif interaction_count > 0:
            return 'rare'
        else:
            return 'unknown'
    
    def _unknown_contact(self) -> Dict:
        """Return intelligence for unknown contact"""
        return {
            'in_contacts': False,
            'interaction_count': 0,
            'relationship_strength': 'unknown',
            'organization': None,
            'title': None,
            'last_interaction': None,
            'is_vip': False
        }
    
    def _get_cached_contact(self, sender_email: str) -> Optional[Dict]:
        """Get cached contact intelligence if fresh enough"""
        try:
            cache = self.db.query(ContactIntelligenceCache).filter(
                ContactIntelligenceCache.sender_email == sender_email
            ).first()
            
            if not cache:
                return None
            
            # Check if cache is still fresh
            age = datetime.utcnow() - cache.last_updated
            if age < timedelta(days=self.CACHE_DURATION_DAYS):
                return cache.contact_data
            
            # Cache expired
            logger.info(f"Contact cache expired for {sender_email} (age: {age})")
            return None
            
        except Exception as e:
            logger.error(f"Error reading contact cache: {str(e)}")
            return None
    
    def _cache_contact(self, sender_email: str, intelligence: Dict):
        """Save contact intelligence to cache"""
        try:
            cache = self.db.query(ContactIntelligenceCache).filter(
                ContactIntelligenceCache.sender_email == sender_email
            ).first()
            
            if cache:
                cache.contact_data = intelligence
                cache.interaction_count = intelligence.get('interaction_count', 0)
                cache.last_updated = datetime.utcnow()
            else:
                cache = ContactIntelligenceCache(
                    sender_email=sender_email,
                    contact_data=intelligence,
                    interaction_count=intelligence.get('interaction_count', 0),
                    last_updated=datetime.utcnow()
                )
                self.db.add(cache)
            
            self.db.commit()
            logger.info(f"Cached contact intelligence for {sender_email}")
            
        except Exception as e:
            logger.error(f"Error caching contact intelligence: {str(e)}")
            self.db.rollback()


def format_contact_intelligence_for_context(intelligence: Dict) -> str:
    """
    Format contact intelligence for LLM context.
    
    Provides relationship context to help Claude understand sender importance.
    """
    if not intelligence or not intelligence.get('in_contacts'):
        return "📧 Unknown sender (not in contacts)"
    
    context_parts = []
    
    # Relationship strength
    strength = intelligence.get('relationship_strength', 'unknown')
    strength_labels = {
        'frequent': '👥 FREQUENT contact (high interaction)',
        'regular': '👤 Regular contact',
        'occasional': '💬 Occasional contact',
        'rare': '📧 Rare contact',
        'unknown': '❓ Unknown contact'
    }
    context_parts.append(strength_labels.get(strength, '📧 Contact'))
    
    # Organization/Title
    if intelligence.get('organization'):
        org = intelligence['organization']
        title = intelligence.get('title', 'colleague')
        context_parts.append(f"🏢 {title} at {org}")
    
    # VIP status
    if intelligence.get('is_vip'):
        context_parts.append("⭐ VIP contact (frequent + professional relationship)")
    
    # Interaction count
    count = intelligence.get('interaction_count', 0)
    if count > 0:
        context_parts.append(f"📊 {count} previous interactions")
    
    return "\n".join(context_parts)
