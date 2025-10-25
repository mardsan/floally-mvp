from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ConnectedAccount
import os
import json
import uuid
import requests

router = APIRouter()

# OAuth2 scopes we need
SCOPES = [
    'openid',  # Required for getting user ID
    'https://www.googleapis.com/auth/userinfo.email',  # Required for email
    'https://www.googleapis.com/auth/userinfo.profile',  # Required for name and picture
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
]

async def get_current_user(db: Session = Depends(get_db)):
    """Get current user from stored credentials"""
    try:
        with open('user_credentials.json', 'r') as f:
            creds_data = json.load(f)
        email = creds_data.get('email')
        
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user:
                return user.email
        
        raise HTTPException(status_code=401, detail="Not authenticated")
    except FileNotFoundError:
        raise HTTPException(status_code=401, detail="Not authenticated")

def get_flow():
    """Create OAuth flow from credentials"""
    return Flow.from_client_config(
        {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")]
            }
        },
        scopes=SCOPES,
        redirect_uri=os.getenv("GOOGLE_REDIRECT_URI")
    )

@router.get("/login")
async def login():
    """Initiate Google OAuth flow"""
    flow = get_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    return {"authorization_url": authorization_url, "state": state}

@router.get("/callback")
async def callback(code: str, state: str, db: Session = Depends(get_db)):
    """Handle OAuth callback"""
    try:
        print(f"🔐 OAuth callback received - code: {code[:20]}..., state: {state}")
        
        flow = get_flow()
        print(f"📋 Fetching token...")
        flow.fetch_token(code=code)
        credentials = flow.credentials
        print(f"✅ Token received")
        
        # Get user info from Google using requests
        print(f"👤 Fetching user info from Google...")
        headers = {'Authorization': f'Bearer {credentials.token}'}
        response = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers=headers)
        response.raise_for_status()
        user_info = response.json()
        print(f"✅ User info received: {user_info.get('email')}")
        
        email = user_info.get('email')
        display_name = user_info.get('name', email.split('@')[0] if email else 'User')
        picture_url = user_info.get('picture')
        
        print(f"📧 OAuth successful for: {email}")
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user
            user = User(
                id=uuid.uuid4(),
                email=email,
                display_name=display_name,
                avatar_url=picture_url
            )
            db.add(user)
            db.flush()  # Get the user ID
            print(f"✅ Created new user: {email}")
            
        else:
            # Update existing user info
            user.display_name = display_name
            user.avatar_url = picture_url
            print(f"✅ Updated existing user: {email}")
        
        # Store/update connected account credentials
        connected_account = db.query(ConnectedAccount).filter(
            ConnectedAccount.user_id == user.id,
            ConnectedAccount.provider == 'google'
        ).first()
        
        if not connected_account:
            connected_account = ConnectedAccount(
                id=uuid.uuid4(),
                user_id=user.id,
                provider='google',
                provider_account_id=email,
                email=email,
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_expires_at=credentials.expiry,
                scopes=credentials.scopes
            )
            db.add(connected_account)
        else:
            connected_account.access_token = credentials.token
            connected_account.refresh_token = credentials.refresh_token
            connected_account.token_expires_at = credentials.expiry
            connected_account.scopes = credentials.scopes
        
        db.commit()
        print(f"✅ Connected account saved for {email}")
        
        # Redirect to frontend root with user info
        # URL encode the user data to pass it to frontend
        import urllib.parse
        user_data = urllib.parse.quote(json.dumps({
            "email": user.email,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url
        }))
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        redirect_url = f"{frontend_url}/?auth=success&user={user_data}"
        print(f"✅ Redirecting to: {redirect_url}")
        return RedirectResponse(url=redirect_url)
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ OAuth callback error: {str(e)}")
        print(f"📋 Error details:\n{error_details}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status")
async def auth_status(db: Session = Depends(get_db)):
    """Check if user is authenticated"""
    try:
        # Try to get email from file (temporary backward compatibility)
        with open('user_credentials.json', 'r') as f:
            creds_data = json.load(f)
        email = creds_data.get('email')
        
        if email:
            # Check if user exists in database
            user = db.query(User).filter(User.email == email).first()
            if user:
                return {
                    "authenticated": True,
                    "email": user.email,
                    "display_name": user.display_name,
                    "avatar_url": user.avatar_url,
                    "user_id": str(user.id)
                }
        
        return {"authenticated": False}
    except FileNotFoundError:
        return {"authenticated": False}
    except Exception as e:
        print(f"❌ Auth status error: {e}")
        return {"authenticated": False}
