from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json
import os
from pathlib import Path

router = APIRouter()

class WaitlistSignup(BaseModel):
    email: EmailStr
    name: str
    struggle: str
    timestamp: str

# Store waitlist in a JSON file (will migrate to database later)
WAITLIST_FILE = Path(__file__).parent.parent.parent / "waitlist_signups.json"

def load_waitlist():
    """Load existing waitlist signups"""
    if not WAITLIST_FILE.exists():
        return []
    try:
        with open(WAITLIST_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_waitlist(waitlist):
    """Save waitlist to file"""
    with open(WAITLIST_FILE, 'w') as f:
        json.dump(waitlist, f, indent=2)

@router.post("/waitlist/signup")
async def signup_for_waitlist(signup: WaitlistSignup):
    """
    Add a user to the early access waitlist.
    
    This endpoint:
    1. Validates email and data
    2. Checks for duplicates
    3. Stores signup with timestamp
    4. Returns success confirmation
    """
    try:
        # Load existing waitlist
        waitlist = load_waitlist()
        
        # Check if email already exists
        existing = next((s for s in waitlist if s['email'] == signup.email), None)
        if existing:
            # Update existing entry instead of creating duplicate
            existing['name'] = signup.name
            existing['struggle'] = signup.struggle
            existing['timestamp'] = signup.timestamp
            existing['updated_at'] = datetime.now().isoformat()
        else:
            # Add new signup
            waitlist.append({
                'email': signup.email,
                'name': signup.name,
                'struggle': signup.struggle,
                'timestamp': signup.timestamp,
                'position': len(waitlist) + 1,
                'status': 'pending',  # pending, invited, active
                'source': 'landing_page'
            })
        
        # Save updated waitlist
        save_waitlist(waitlist)
        
        return {
            'success': True,
            'message': f'Welcome to the waitlist, {signup.name}!',
            'position': len(waitlist),
            'total_signups': len(waitlist)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process signup: {str(e)}")

@router.get("/waitlist/stats")
async def get_waitlist_stats():
    """
    Get waitlist statistics (for admin/tracking).
    
    Returns:
    - Total signups
    - Signups by struggle type
    - Recent signups
    """
    try:
        waitlist = load_waitlist()
        
        # Count by struggle type
        struggle_counts = {}
        for signup in waitlist:
            struggle = signup.get('struggle', 'unknown')
            struggle_counts[struggle] = struggle_counts.get(struggle, 0) + 1
        
        # Get recent signups (last 10)
        recent = sorted(waitlist, key=lambda x: x.get('timestamp', ''), reverse=True)[:10]
        
        return {
            'total_signups': len(waitlist),
            'struggle_breakdown': struggle_counts,
            'recent_signups': [
                {
                    'name': s.get('name'),
                    'timestamp': s.get('timestamp'),
                    'struggle': s.get('struggle')
                }
                for s in recent
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.get("/waitlist/export")
async def export_waitlist():
    """
    Export full waitlist (for email marketing tools like EmailOctopus/ConvertKit).
    
    Returns all signups with full details.
    Note: In production, this should be admin-only with authentication.
    """
    try:
        waitlist = load_waitlist()
        return {
            'total': len(waitlist),
            'signups': waitlist
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export waitlist: {str(e)}")
