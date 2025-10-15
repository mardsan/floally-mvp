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
async def list_messages(max_results: int = 10):
    """Get recent Gmail messages with importance indicators"""
    try:
        service = get_gmail_service()
        results = service.users().messages().list(
            userId='me',
            maxResults=max_results,
            q='is:unread OR in:inbox'
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
