from fastapi import APIRouter, HTTPException
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import json
import base64

router = APIRouter()

def get_gmail_service():
    """Get authenticated Gmail service"""
    try:
        with open('user_credentials.json', 'r') as f:
            creds_data = json.load(f)
        credentials = Credentials(**creds_data)
        return build('gmail', 'v1', credentials=credentials)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")

@router.get("/messages")
async def list_messages(max_results: int = 10, category: str = "primary"):
    """Get recent Gmail messages with importance indicators
    
    Args:
        max_results: Number of messages to fetch (default: 10)
        category: Filter by category - 'primary', 'all', 'starred', 'important' (default: 'primary')
    """
    try:
        service = get_gmail_service()
        
        # Build query based on category filter
        # Leverage Gmail's native categorization system
        query_map = {
            'primary': 'category:primary',  # Only real people/contacts - Gmail's AI filtering
            'social': 'category:social',  # Social networks
            'promotions': 'category:promotions',  # Deals, offers, marketing
            'updates': 'category:updates',  # Confirmations, receipts, bills
            'forums': 'category:forums',  # Mailing lists, group discussions
            'important': 'is:important OR is:starred',  # Gmail-marked important or user-starred
            'starred': 'is:starred',  # User-starred emails only
            'all': 'in:inbox'  # All inbox emails (includes promotions, etc.)
        }
        
        query = query_map.get(category.lower(), 'category:primary')
        
        results = service.users().messages().list(
            userId='me',
            maxResults=max_results,
            q=query  # Use Gmail's native query system
        ).execute()
        
        messages = results.get('messages', [])
        
        # Fetch full message details
        detailed_messages = []
        for msg in messages[:max_results]:
            message = service.users().messages().get(
                userId='me',
                id=msg['id'],
                format='full'
            ).execute()
            
            # Extract relevant fields
            headers = {h['name']: h['value'] for h in message['payload']['headers']}
            label_ids = message.get('labelIds', [])
            
            # Determine email categories using Gmail's native labels
            is_spam = 'SPAM' in label_ids
            is_important = 'IMPORTANT' in label_ids
            is_starred = 'STARRED' in label_ids
            is_promotional = 'CATEGORY_PROMOTIONS' in label_ids
            is_social = 'CATEGORY_SOCIAL' in label_ids
            is_updates = 'CATEGORY_UPDATES' in label_ids
            is_forums = 'CATEGORY_FORUMS' in label_ids
            
            # Primary is anything in INBOX without a CATEGORY_ label (or explicitly CATEGORY_PERSONAL)
            is_primary = ('INBOX' in label_ids and 
                         not any(label.startswith('CATEGORY_') for label in label_ids if label != 'CATEGORY_PERSONAL'))
            
            # Check for unsubscribe link in headers
            has_unsubscribe = 'List-Unsubscribe' in headers or 'List-Unsubscribe-Post' in headers
            
            # Extract domain from sender
            from_email = headers.get('From', 'Unknown')
            domain = None
            if '<' in from_email and '>' in from_email:
                email_part = from_email.split('<')[1].split('>')[0]
                if '@' in email_part:
                    domain = email_part.split('@')[1]
            elif '@' in from_email:
                domain = from_email.split('@')[1].split()[0]
            
            # Detect if it's a newsletter (has unsubscribe + promotional/updates category)
            is_newsletter = has_unsubscribe and (is_promotional or is_updates)
            
            detailed_messages.append({
                'id': message['id'],
                'threadId': message['threadId'],
                'from': headers.get('From', 'Unknown'),
                'subject': headers.get('Subject', 'No Subject'),
                'date': headers.get('Date', ''),
                'snippet': message.get('snippet', ''),
                'unread': 'UNREAD' in label_ids,
                'isSpam': is_spam,
                'isImportant': is_important,
                'isStarred': is_starred,
                'isPrimary': is_primary,
                'isPromotional': is_promotional,
                'isSocial': is_social,
                'isUpdates': is_updates,
                'isForums': is_forums,
                'isNewsletter': is_newsletter,
                'hasUnsubscribeLink': has_unsubscribe,
                'domain': domain,
                'labels': label_ids
            })
        
        return {
            "messages": detailed_messages,
            "total": len(detailed_messages)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile")
async def get_profile():
    """Get user's Gmail profile"""
    try:
        service = get_gmail_service()
        profile = service.users().getProfile(userId='me').execute()
        return {
            "email": profile.get('emailAddress'),
            "messagesTotal": profile.get('messagesTotal'),
            "threadsTotal": profile.get('threadsTotal')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mark-important")
async def mark_important(email_id: str):
    """Mark email as important (add IMPORTANT and STARRED labels)"""
    try:
        service = get_gmail_service()
        service.users().messages().modify(
            userId='me',
            id=email_id,
            body={
                'addLabelIds': ['IMPORTANT', 'STARRED']
            }
        ).execute()
        
        return {
            "success": True,
            "message": "Email marked as important",
            "email_id": email_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark important: {str(e)}")

@router.post("/mark-unimportant")
async def mark_unimportant(email_id: str):
    """Mark email as unimportant (remove IMPORTANT label, add custom NOT_INTERESTED label)"""
    try:
        service = get_gmail_service()
        
        # Remove IMPORTANT label if present
        service.users().messages().modify(
            userId='me',
            id=email_id,
            body={
                'removeLabelIds': ['IMPORTANT']
            }
        ).execute()
        
        return {
            "success": True,
            "message": "Email marked as unimportant",
            "email_id": email_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark unimportant: {str(e)}")

@router.post("/archive")
async def archive_email(email_id: str):
    """Archive email (remove INBOX label)"""
    try:
        service = get_gmail_service()
        service.users().messages().modify(
            userId='me',
            id=email_id,
            body={
                'removeLabelIds': ['INBOX']
            }
        ).execute()
        
        return {
            "success": True,
            "message": "Email archived",
            "email_id": email_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to archive: {str(e)}")

@router.post("/trash")
async def trash_email(email_id: str):
    """Move email to trash"""
    try:
        service = get_gmail_service()
        service.users().messages().trash(
            userId='me',
            id=email_id
        ).execute()
        
        return {
            "success": True,
            "message": "Email moved to trash",
            "email_id": email_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trash: {str(e)}")

@router.get("/unsubscribe-link")
async def get_unsubscribe_link(email_id: str):
    """Extract unsubscribe link from email headers"""
    try:
        service = get_gmail_service()
        message = service.users().messages().get(
            userId='me',
            id=email_id,
            format='full'
        ).execute()
        
        headers = {h['name']: h['value'] for h in message['payload']['headers']}
        
        # Check for List-Unsubscribe header
        unsubscribe_header = headers.get('List-Unsubscribe', '')
        
        if not unsubscribe_header:
            return {
                "success": False,
                "message": "No unsubscribe link found",
                "has_unsubscribe": False
            }
        
        # Extract URL from header (format: <mailto:...>, <http://...>)
        import re
        urls = re.findall(r'<(https?://[^>]+)>', unsubscribe_header)
        
        if urls:
            return {
                "success": True,
                "unsubscribe_url": urls[0],
                "has_unsubscribe": True,
                "message": "Unsubscribe link found"
            }
        else:
            return {
                "success": False,
                "message": "Unsubscribe link not in supported format",
                "has_unsubscribe": False
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get unsubscribe link: {str(e)}")
