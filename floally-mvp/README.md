# 🌊 FloAlly MVP

Your AI-powered strategic and operational partner for creative work.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Google Cloud Console project with Gmail & Calendar APIs enabled
- Anthropic API key

### Setup

The project has been set up in the `floally-mvp` directory with:
- ✅ Backend (FastAPI + Python)
- ✅ Frontend (React + Vite + Tailwind)
- ✅ All dependencies installed

### Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Gmail API and Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:8000/api/auth/callback`
6. Copy Client ID and Client Secret

### Configure Environment Variables

Edit `backend/.env` and add your credentials:

```bash
cd backend
nano .env  # Add your Google and Anthropic credentials
```

Required variables:
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `ANTHROPIC_API_KEY` - From Anthropic Console

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd floally-mvp/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd floally-mvp/frontend
npm run dev
```

### Access the App

1. Open http://localhost:5173
2. Click "Connect Google Account"
3. Authorize access to Gmail and Calendar
4. View your messages and events on the dashboard

## Project Structure

```
floally-mvp/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── routers/
│   │   │   ├── auth.py       # Google OAuth
│   │   │   ├── gmail.py      # Gmail integration
│   │   │   ├── calendar.py   # Calendar integration
│   │   │   └── ai.py         # Claude AI integration
│   ├── requirements.txt
│   ├── venv/                 # Python virtual environment
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── services/
│   │   │   └── api.js        # API client
│   │   └── index.css         # Tailwind styles
│   ├── package.json
│   └── .env
└── docs/
    └── FLOALLY_CONTEXT.md    # Technical documentation
```

## Development Phases

- [x] **Phase 1**: OAuth + Data Display
- [ ] **Phase 2**: AI Stand-Up Generation
- [ ] **Phase 3**: Action Execution (Send emails, reschedule)
- [ ] **Phase 4**: Learning & Personalization

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Backend**: FastAPI, Python 3.9+
- **APIs**: Gmail API, Calendar API, Anthropic Claude
- **Auth**: Google OAuth 2.0

## API Documentation

Once the backend is running, visit:
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

## Next Steps

1. Configure Google OAuth credentials in `backend/.env`
2. Add Anthropic API key in `backend/.env`
3. Test authentication flow
4. Verify Gmail and Calendar data display
5. Implement AI stand-up generation (Phase 2)

## Support

For detailed technical context, see `docs/FLOALLY_CONTEXT.md`

## License

Private project - All rights reserved
