# FloAlly Setup Checklist

## ✅ Completed (by setup script)

- [x] Project structure created
- [x] Backend dependencies installed
- [x] Frontend dependencies installed
- [x] Tailwind CSS configured
- [x] API routes scaffolded
- [x] Documentation created

## 🔧 You Need To Do

### 1. Google Cloud Console Setup

- [ ] Go to https://console.cloud.google.com
- [ ] Create new project (or select existing)
- [ ] Enable APIs:
  - [ ] Gmail API
  - [ ] Google Calendar API
- [ ] Create OAuth 2.0 credentials:
  - [ ] Application type: Web application
  - [ ] Authorized redirect URIs: `http://localhost:8000/api/auth/callback`
  - [ ] Note down Client ID and Client Secret

### 2. Anthropic API Key

- [ ] Go to https://console.anthropic.com
- [ ] Create API key
- [ ] Note down the key

### 3. Configure Environment Variables

- [ ] Edit `backend/.env`:
  
  ```
  GOOGLE_CLIENT_ID=your_actual_client_id
  GOOGLE_CLIENT_SECRET=your_actual_client_secret
  GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
  ANTHROPIC_API_KEY=your_actual_anthropic_key
  FRONTEND_URL=http://localhost:5173
  ```

### 4. Test the App

- [ ] Start backend: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Open http://localhost:5173
- [ ] Click "Connect Google Account"
- [ ] Authorize access
- [ ] Verify you see your emails and calendar events

### 5. Next Development Steps

- [ ] Test all API endpoints
- [ ] Implement AI stand-up generation
- [ ] Add decision cards UI
- [ ] Implement action execution

## 🆘 Troubleshooting

**OAuth redirect error:**
- Check that redirect URI in Google Console matches exactly: `http://localhost:8000/api/auth/callback`
- Ensure both servers are running

**CORS errors:**
- Verify FRONTEND_URL in backend/.env matches your frontend URL
- Check browser console for specific CORS messages

**API errors:**
- Check backend logs in terminal
- Visit http://localhost:8000/docs to test endpoints directly

**Module not found:**
- Backend: Activate venv first: `source venv/bin/activate`
- Frontend: Run `npm install` in frontend directory
