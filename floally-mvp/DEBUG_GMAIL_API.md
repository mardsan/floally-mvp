# Gmail API Debugging - October 30, 2025

## Changes Made

### 1. Enhanced Error Logging
**File**: `backend/app/routers/standup.py`

Added detailed error logging at multiple points:
- ✅ Start of standup analysis (line 224)
- ✅ Gmail service acquisition (lines 229-236)
- ✅ Gmail API call (lines 244-257)
- ✅ Final exception handler (lines 384-402)

**What we're logging now**:
- Error type (HTTPException, HttpError, etc.)
- Full error message
- Complete traceback
- Step-by-step progress (with emoji indicators)

### 2. Deployment
- **Commit**: b366eb0
- **Status**: Deployed to Railway
- **Deployed at**: ~2 minutes ago

## Testing Instructions

### Test on www.okaimy.com

1. **Login** to www.okaimy.com with your Google account
2. **Navigate** to the dashboard (should auto-load standup)
3. **Open browser console** (F12 → Console tab)
4. **Look for**: `🔄 Refreshing standup with AI analysis...`
5. **Expand the object** to see the `reasoning` field
6. **Copy the full reasoning text** - it should now show:
   - Error type (e.g., "HTTPException", "HttpError")
   - Full error message (not truncated)

### What to Look For

**Expected error patterns**:

1. **Missing Credentials**:
   ```
   HTTPException: Google account not connected. Please sign in with Google.
   ```
   **Fix**: Re-authenticate via Railway backend

2. **Invalid Token**:
   ```
   HTTPException: Invalid credentials. Please reconnect your Google account.
   ```
   **Fix**: Re-authenticate to get fresh tokens

3. **Expired Token (no refresh token)**:
   ```
   HttpError 401: Token has been expired or revoked
   ```
   **Fix**: Re-authenticate with `prompt=consent`

4. **Missing Scope**:
   ```
   HttpError 403: Insufficient Permission
   Request had insufficient authentication scopes
   ```
   **Fix**: Re-authenticate to grant gmail.readonly scope

5. **Rate Limit**:
   ```
   HttpError 429: Too Many Requests
   ```
   **Fix**: Wait and retry

## OAuth Re-authentication

If you need to re-authenticate:

### Option A: Railway Backend (Recommended)
```bash
# Visit this URL in your browser:
https://floally-mvp-production.up.railway.app/api/auth/login

# This will:
# 1. Redirect to Google OAuth consent screen
# 2. Request all required scopes (including gmail.readonly)
# 3. Store credentials in PostgreSQL database
# 4. Redirect back to frontend
```

### Option B: Check Current Scopes

The OAuth flow in `backend/app/routers/auth.py` requests these scopes:
- `openid`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/gmail.readonly` ← **Required for standup**
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/calendar.readonly`
- `https://www.googleapis.com/auth/calendar.events`

## Next Steps

**After testing**, please provide:
1. The full `reasoning` text from the console
2. Your email address (the one you logged in with)
3. Whether you've authenticated via Railway backend or Vercel OAuth

Then we can:
- Identify the exact error
- Determine if it's a scope, token, or configuration issue
- Apply the appropriate fix

## Common Fixes

### Fix 1: Re-authenticate via Railway
```
Visit: https://floally-mvp-production.up.railway.app/api/auth/login
```
This ensures credentials are stored in PostgreSQL database that the standup endpoint uses.

### Fix 2: Verify Google Cloud Console
1. Go to Google Cloud Console
2. Navigate to OAuth consent screen
3. Verify `gmail.readonly` is in the list of scopes
4. Check that your email is added as a test user

### Fix 3: Manual Database Check
If needed, we can:
1. Connect to Railway's PostgreSQL database
2. Query `connected_accounts` table
3. Verify scopes and token expiration
4. Manually refresh tokens if needed

---

**Status**: Waiting for test results from live site
**Next action**: Test on www.okaimy.com and report the error details
