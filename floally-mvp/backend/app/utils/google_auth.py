"""
Utility functions for Google API authentication
"""
from fastapi import HTTPException
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from datetime import datetime
import os

from app.models.user import ConnectedAccount
from app.database import SessionLocal


def get_user_credentials(user_email: str, db: Session = None) -> Credentials:
    """
    Get Google OAuth credentials for a user from the database
    
    Args:
        user_email: User's email address
        db: Database session (optional, will create if not provided)
        
    Returns:
        Google Credentials object
        
    Raises:
        HTTPException: If credentials not found or invalid
    """
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    
    try:
        # Find the user's Google account
        account = db.query(ConnectedAccount).filter(
            ConnectedAccount.email == user_email,
            ConnectedAccount.provider == 'google'
        ).first()
        
        if not account:
            raise HTTPException(
                status_code=401,
                detail="Google account not connected. Please sign in with Google."
            )
        
        if not account.access_token:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials. Please reconnect your Google account."
            )
        
        # Create credentials object
        credentials = Credentials(
            token=account.access_token,
            refresh_token=account.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv('GOOGLE_CLIENT_ID'),
            client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
            scopes=account.scopes or []
        )
        
        # Check if token is expired and refresh if needed
        if account.token_expires_at and account.token_expires_at < datetime.utcnow():
            if credentials.refresh_token:
                credentials.refresh(Request())
                # Update tokens in database
                account.access_token = credentials.token
                account.token_expires_at = credentials.expiry
                db.commit()
        
        return credentials
        
    finally:
        if close_db:
            db.close()


def get_gmail_service(user_email: str, db: Session = None):
    """
    Get authenticated Gmail service for a user
    
    Args:
        user_email: User's email address
        db: Database session (optional)
        
    Returns:
        Gmail service object
    """
    credentials = get_user_credentials(user_email, db)
    return build('gmail', 'v1', credentials=credentials)


def get_calendar_service(user_email: str, db: Session = None):
    """
    Get authenticated Calendar service for a user
    
    Args:
        user_email: User's email address
        db: Database session (optional)
        
    Returns:
        Calendar service object
    """
    credentials = get_user_credentials(user_email, db)
    return build('calendar', 'v3', credentials=credentials)
