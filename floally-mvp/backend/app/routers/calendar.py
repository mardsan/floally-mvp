from fastapi import APIRouter, HTTPException
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import json
from datetime import datetime, timedelta

router = APIRouter()

def get_calendar_service():
    """Get authenticated Calendar service"""
    try:
        with open('user_credentials.json', 'r') as f:
            creds_data = json.load(f)
        credentials = Credentials(**creds_data)
        return build('calendar', 'v3', credentials=credentials)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")

@router.get("/events")
async def list_events(days: int = 1):
    """Get upcoming calendar events"""
    try:
        service = get_calendar_service()
        
        # Get events for the next N days
        now = datetime.utcnow()
        time_min = now.isoformat() + 'Z'
        time_max = (now + timedelta(days=days)).isoformat() + 'Z'
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        formatted_events = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            
            formatted_events.append({
                'id': event['id'],
                'summary': event.get('summary', 'No Title'),
                'start': start,
                'end': end,
                'attendees': [a['email'] for a in event.get('attendees', [])],
                'location': event.get('location', ''),
                'description': event.get('description', '')
            })
        
        return {
            "events": formatted_events,
            "total": len(formatted_events)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendars")
async def list_calendars():
    """Get user's calendars"""
    try:
        service = get_calendar_service()
        calendars = service.calendarList().list().execute()
        
        return {
            "calendars": [
                {
                    "id": cal['id'],
                    "summary": cal['summary'],
                    "primary": cal.get('primary', False)
                }
                for cal in calendars.get('items', [])
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
