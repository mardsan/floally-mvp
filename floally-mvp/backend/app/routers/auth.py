from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import json

router = APIRouter()

# OAuth2 scopes we need
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
]

async def get_current_user():
    """Get current user from stored credentials"""
    try:
        with open('user_credentials.json', 'r') as f:
            creds_data = json.load(f)
        # Return user email - in production this would validate JWT token
        return "user@example.com"  # For MVP, return a placeholder
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
async def callback(code: str, state: str):
    """Handle OAuth callback"""
    try:
        flow = get_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Store credentials (in production, use proper session management)
        creds_data = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        # For MVP, store in a file (replace with DB later)
        with open('user_credentials.json', 'w') as f:
            json.dump(creds_data, f)
        
        # Redirect to frontend root with auth success param
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}/?auth=success")
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status")
async def auth_status():
    """Check if user is authenticated"""
    try:
        with open('user_credentials.json', 'r') as f:
            creds_data = json.load(f)
        return {"authenticated": True, "email": "user@example.com"}
    except FileNotFoundError:
        return {"authenticated": False}
