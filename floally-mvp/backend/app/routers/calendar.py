from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.utils.google_auth import get_calendar_service

router = APIRouter()

@router.get("/events")
async def list_events(user_email: str, days: int = 1, db: Session = Depends(get_db)):
    """Get upcoming calendar events"""
    try:
        service = get_calendar_service(user_email, db)
        
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
async def list_calendars(user_email: str, db: Session = Depends(get_db)):
    """Get user's calendars"""
    try:
        service = get_calendar_service(user_email, db)
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
