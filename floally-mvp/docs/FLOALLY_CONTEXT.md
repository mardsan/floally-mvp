# FloAlly MVP - Technical Context

## Overview

FloAlly is an AI-powered daily stand-up and operational partner for creators, entrepreneurs,
and solo professionals. It acts as a unified dashboard that pulls together Gmail, Calendar,
and other tools to provide a single morning checkpoint.

## Architecture

### Backend (FastAPI + Python)

- **Framework**: FastAPI for async API endpoints
- **Authentication**: Google OAuth 2.0
- **Integrations**: Gmail API, Google Calendar API
- **AI Layer**: Anthropic Claude 4 Sonnet for decision reasoning
- **Storage**: File-based (MVP) → SQLite → PostgreSQL

### Frontend (React + Vite)

- **Framework**: React with Vite bundler
- **Styling**: Tailwind CSS (mobile-first)
- **State**: React hooks (useState, useEffect)
- **API Client**: Axios with environment-based URLs

## Key Features (MVP)

### Phase 1: Data Display ✅

- OAuth login with Google
- Display recent Gmail messages
- Show today's calendar events
- Basic user profile

### Phase 2: AI Intelligence (Next)

- Claude-powered daily stand-up generation
- "The One Thing" focus recommendation
- Decision cards with Go/Review/Cancel
- Confidence scoring

### Phase 3: Actions (After Phase 2)

- Send emails via Gmail API
- Reschedule calendar events
- Block focus time
- Draft replies

### Phase 4: Learning (Continuous)

- Track user decisions (approve/cancel)
- Adjust confidence scores
- Personalize prompts
- Pattern recognition

## API Endpoints

### Authentication

- `GET /api/auth/login` - Initiate OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback
- `GET /api/auth/status` - Check auth status

### Gmail

- `GET /api/gmail/messages` - List recent messages
- `GET /api/gmail/profile` - Get user profile

### Calendar

- `GET /api/calendar/events` - List upcoming events
- `GET /api/calendar/calendars` - List user calendars

### AI

- `POST /api/ai/standup` - Generate daily stand-up

## Environment Variables

### Backend (.env)

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
ANTHROPIC_API_KEY=your_anthropic_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
```

## Development Workflow

1. Start backend: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Access app: http://localhost:5173
4. Test auth flow: Click "Connect Google Account"

## Next Steps

1. Set up Google Cloud Console project
2. Enable Gmail & Calendar APIs
3. Create OAuth 2.0 credentials
4. Get Anthropic API key
5. Configure environment variables
6. Test authentication flow
7. Implement AI stand-up generation

## Brand Voice & UX

FloAlly speaks like a warm, competent studio manager:

- **Tone**: Confident but not bossy
- **Language**: Clear, concise, protective of user's time
- **Personality**: "I've got this handled" energy
- **Goal**: Keep user in creative flow

## Data Flow

```
User opens app
    ↓
React frontend checks auth status
    ↓
If not authenticated → OAuth flow
    ↓
If authenticated → Load data
    ↓
Frontend requests: /api/gmail/messages + /api/calendar/events
    ↓
Backend fetches from Google APIs
    ↓
Frontend displays data
    ↓
[Next phase] User clicks "Generate Stand-Up"
    ↓
Frontend sends data to /api/ai/standup
    ↓
Backend calls Claude API with context
    ↓
Claude returns structured response
    ↓
Frontend displays decision cards
```

## Security Considerations

- OAuth tokens stored securely (file → DB later)
- CORS configured for specific origins
- API keys in environment variables (never committed)
- HTTPS required in production
- Token refresh handled by Google client library

## Deployment Notes

- Backend: Railway, Render, or Google Cloud Run
- Frontend: Vercel, Netlify, or Cloudflare Pages
- OAuth redirect URIs must match deployment URLs
- Environment variables configured in platform settings
