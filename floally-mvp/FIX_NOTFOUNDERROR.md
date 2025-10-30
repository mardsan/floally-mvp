# Gmail API Authentication Fix - NotFoundError

## 🎯 Problem Identified

**Error**: `NotFoundError` - Google account not connected in PostgreSQL database

**Root Cause**: 
- You authenticated via **Vercel OAuth flow** → credentials stored in **Redis**
- Standup endpoint uses **Railway backend** → queries **PostgreSQL database**
- Your credentials exist in Redis but NOT in PostgreSQL

## ✅ Solution: Re-authenticate via Railway Backend

### Step 1: Authenticate via Railway

Click this link to authenticate with Railway backend:

👉 **https://floally-mvp-production.up.railway.app/api/auth/login**

This will:
1. Redirect to Google OAuth consent screen
2. Request all required scopes (including `gmail.readonly`)
3. Store credentials in **PostgreSQL database**
4. Redirect back to frontend at www.okaimy.com

### Step 2: Verify Authentication

After authenticating, the browser should redirect to:
```
https://www.okaimy.com/?user_data={...}
```

You should see your email and user info in the URL.

### Step 3: Test Standup

1. Navigate to the dashboard
2. The standup should auto-load
3. Check the console logs - you should see:
   ```
   🔍 Starting standup analysis for user: your-email@gmail.com
   📧 Getting Gmail service...
   ✅ Gmail service obtained successfully
   📨 Fetching emails with query: in:inbox after:2025/10/27
   ✅ Email list fetched: X messages
   ```

## 🔍 Why This Happened

Your app has **two OAuth flows**:

### Flow 1: Vercel OAuth (Frontend)
- **Files**: `/frontend/api/gmail/auth.js`, `/frontend/api/gmail/callback.js`
- **Storage**: Redis
- **Used by**: Calendar integration, Gmail inbox view
- **Endpoints**: `/api/gmail/*`, `/api/calendar/*`

### Flow 2: Railway OAuth (Backend)
- **Files**: `/backend/app/routers/auth.py`
- **Storage**: PostgreSQL
- **Used by**: Standup analysis, AI features, user profile
- **Endpoints**: `/api/standup/*`, `/api/user/*`, `/api/messages/*`

**The issue**: You used Flow 1 (Vercel), but standup needs Flow 2 (Railway).

## 🛠️ Long-term Fix Options

### Option A: Unify OAuth Flows (Recommended)
Make all endpoints use PostgreSQL instead of Redis:
1. Update Vercel serverless functions to query PostgreSQL
2. Deprecate Redis OAuth storage
3. Use Railway backend as single source of truth

### Option B: Sync Credentials
Keep both systems but sync them:
1. When user authenticates via Vercel, also store in PostgreSQL
2. Add webhook/sync mechanism
3. Keep both Redis and PostgreSQL in sync

### Option C: Make Standup Use Redis
Update standup endpoint to query Redis instead of PostgreSQL:
1. Modify `get_user_credentials()` to check Redis first
2. Fallback to PostgreSQL if not found
3. Add Redis connection to Railway backend

## 📝 Immediate Action

**For now, just re-authenticate via Railway**:

1. Visit: https://floally-mvp-production.up.railway.app/api/auth/login
2. Grant permissions when prompted
3. Test standup on www.okaimy.com

This will store your credentials in PostgreSQL and the standup will work!

---

**Status**: Ready to fix - just need to re-authenticate
**Next**: After authentication, test standup to confirm it works
