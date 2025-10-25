from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ConnectedAccount
import os
import json
import uuid
from datetime import datetime

router = APIRouter()

# OAuth2 scopes we need
SCOPES = [
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
        flow = get_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Get user info from Google
        from googleapiclient.discovery import build
        oauth2_service = build('oauth2', 'v2', credentials=credentials)
        user_info = oauth2_service.userinfo().get().execute()
        
        email = user_info.get('email')
        display_name = user_info.get('name', email.split('@')[0])
        picture_url = user_info.get('picture')
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user
            user = User(
                id=uuid.uuid4(),
                email=email,
                display_name=display_name,
                picture_url=picture_url,
                auth_provider='google',
                is_active=True
            )
            db.add(user)
            db.flush()  # Get the user ID
            
        else:
            # Update existing user info
            user.display_name = display_name
            user.picture_url = picture_url
            user.last_login = datetime.utcnow()
        
        # Store/update connected account credentials
        connected_account = db.query(ConnectedAccount).filter(
            ConnectedAccount.user_id == user.id,
            ConnectedAccount.provider == 'google'
        ).first()
        
        creds_data = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        if not connected_account:
            connected_account = ConnectedAccount(
                id=uuid.uuid4(),
                user_id=user.id,
                provider='google',
                provider_account_id=email,
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_expiry=credentials.expiry,
                credentials_data=creds_data
            )
            db.add(connected_account)
        else:
            connected_account.access_token = credentials.token
            connected_account.refresh_token = credentials.refresh_token
            connected_account.token_expiry = credentials.expiry
            connected_account.credentials_data = creds_data
        
        db.commit()
        
        # Also save to file for backward compatibility (can be removed later)
        with open('user_credentials.json', 'w') as f:
            json.dump({**creds_data, 'email': email}, f)
        
        # Redirect to frontend root with auth success param
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/?auth=success")
    
    except Exception as e:
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
                    "picture_url": user.picture_url,
                    "user_id": str(user.id)
                }
        
        return {"authenticated": False}
    except FileNotFoundError:
        return {"authenticated": False}
