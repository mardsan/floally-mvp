"""
Smart Reply Service
Leverages Gmail's built-in AI-generated quick reply suggestions.

Gmail uses ML to generate contextually appropriate quick replies like:
- "Thanks!"
- "Sounds good!"
- "Let me check and get back to you"

These are FREE and can be used to:
1. Show users instant reply options
2. Seed AI draft generation (cheaper than full Claude generation)
3. Reduce AI token usage for simple responses
"""

from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class SmartReplyService:
    """Extract and use Gmail's Smart Reply suggestions"""
    
    def __init__(self):
        pass
    
    def get_smart_replies(
        self, 
        gmail_service, 
        message_id: str
    ) -> List[str]:
        """
        Get Gmail's AI-generated quick reply suggestions for a message.
        
        FREE - Part of Gmail API!
        
        Args:
            gmail_service: Authenticated Gmail API service
            message_id: Gmail message ID
            
        Returns:
            List of suggested reply texts (usually 3 suggestions)
            Example: ["Thanks!", "Sounds good!", "Let me check and get back to you"]
        """
        try:
            logger.info(f"Fetching Smart Reply suggestions for message {message_id}")
            
            response = gmail_service.users().messages().smartReply(
                userId='me',
                messageId=message_id
            ).execute()
            
            replies = response.get('smartReplyResponses', [])
            suggestions = [r.get('suggestion', '') for r in replies if r.get('suggestion')]
            
            if suggestions:
                logger.info(f"Found {len(suggestions)} Smart Reply suggestions")
                return suggestions
            else:
                logger.info("No Smart Reply suggestions available for this message")
                return []
                
        except Exception as e:
            # Smart Reply not available for all messages (depends on content type)
            logger.debug(f"Smart Reply not available: {str(e)}")
            return []
    
    def format_for_ui(self, suggestions: List[str]) -> List[Dict]:
        """
        Format Smart Reply suggestions for frontend display.
        
        Returns:
            List of suggestion objects with metadata
        """
        return [
            {
                "text": suggestion,
                "type": "smart_reply",
                "source": "gmail_ai",
                "length": len(suggestion),
                "tone": self._detect_tone(suggestion)
            }
            for suggestion in suggestions
        ]
    
    def use_as_draft_seed(
        self, 
        suggestion: str, 
        user_context: Optional[Dict] = None
    ) -> str:
        """
        Use a Smart Reply suggestion as seed for AI draft generation.
        
        This is cheaper than generating from scratch because we're expanding
        a short suggestion rather than creating full response.
        
        Args:
            suggestion: Gmail's Smart Reply suggestion
            user_context: User's communication style preferences
            
        Returns:
            Prompt for LLM to expand the suggestion
        """
        base_prompt = f"""The user wants to send a reply based on this quick response: "{suggestion}"

Expand this into a complete, professional email response that:
1. Maintains the core sentiment of the quick reply
2. Adds appropriate context and detail
3. Uses a {user_context.get('tone', 'professional')} tone
4. Keeps it concise (2-3 sentences)

Expanded response:"""
        
        logger.info(f"Using Smart Reply as seed: '{suggestion}'")
        return base_prompt
    
    def _detect_tone(self, suggestion: str) -> str:
        """
        Detect the tone of a Smart Reply suggestion.
        
        Returns: "positive", "neutral", "inquisitive", "confirmatory"
        """
        suggestion_lower = suggestion.lower()
        
        if any(word in suggestion_lower for word in ['thanks', 'great', 'awesome', 'perfect', 'appreciate']):
            return "positive"
        elif '?' in suggestion:
            return "inquisitive"
        elif any(word in suggestion_lower for word in ['yes', 'sure', 'sounds good', 'will do', 'got it']):
            return "confirmatory"
        else:
            return "neutral"
    
    def should_use_smart_reply_directly(
        self, 
        suggestions: List[str],
        message_context: Dict
    ) -> Optional[str]:
        """
        Determine if a Smart Reply suggestion is good enough to use directly
        without AI expansion.
        
        Use directly if:
        - Message is simple acknowledgment request
        - Smart Reply matches user's typical style
        - No complex context needed
        
        Returns:
            Suggested reply text if appropriate, None otherwise
        """
        if not suggestions:
            return None
        
        # Check if message is simple enough for direct Smart Reply
        message_length = len(message_context.get('snippet', ''))
        
        # Short messages (< 100 chars) often just need simple replies
        if message_length < 100:
            # If message is a question, look for confirmatory reply
            if '?' in message_context.get('snippet', ''):
                for suggestion in suggestions:
                    if self._detect_tone(suggestion) in ['confirmatory', 'positive']:
                        logger.info(f"Recommending direct Smart Reply: '{suggestion}'")
                        return suggestion
        
        return None


def format_smart_replies_for_context(suggestions: List[str]) -> str:
    """
    Format Smart Reply suggestions for LLM context.
    
    Helps Claude understand what Gmail's AI suggested, providing
    baseline understanding of appropriate response tone.
    """
    if not suggestions:
        return ""
    
    context = "Gmail Smart Reply Suggestions (AI-generated):\n"
    for i, suggestion in enumerate(suggestions, 1):
        context += f"  {i}. \"{suggestion}\"\n"
    
    context += "\nThese reflect Gmail's ML understanding of appropriate response tone."
    return context
