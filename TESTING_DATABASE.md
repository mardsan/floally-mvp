# Testing Database Integration 🧪

## Quick Test Checklist

### 1. Verify Backend is Running
```bash
curl https://floally-mvp-production.up.railway.app/api/health
# Expected: {"status":"healthy"}
```

### 2. Check Database Tables Created
**On Railway Dashboard**:
- Go to your Railway project
- Click on the backend service
- View "Deployments" → Latest deployment → "View Logs"
- Look for: `✅ Database tables initialized successfully`

### 3. Test Authentication Flow

#### Option A: Via Frontend (Recommended)
1. Go to https://www.okaimy.com
2. Click "Sign in with Google"
3. Authorize the app
4. Complete the onboarding wizard
5. **Note what you entered** (role, preferences, etc.)
6. Click your profile icon → "Sign out"
7. Sign in again with Google
8. **Expected Result**: Should go directly to dashboard (NO onboarding wizard!)
9. Check profile shows your actual name (not "[User]")

#### Option B: Via API
```bash
# 1. Get login URL
curl -s https://floally-mvp-production.up.railway.app/api/auth/login | jq .

# 2. Open the authorization_url in your browser
# Complete Google OAuth

# 3. After redirect, check auth status
curl -s https://floally-mvp-production.up.railway.app/api/auth/status | jq .

# Expected output:
{
  "authenticated": true,
  "email": "your.email@gmail.com",
  "display_name": "Your Name",
  "picture_url": "https://...",
  "user_id": "uuid-here"
}
```

### 4. Test Profile Persistence

#### Create Profile
```bash
curl -X POST https://floally-mvp-production.up.railway.app/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "your.email@gmail.com",
    "answers": {
      "role": "Founder/CEO",
      "priorities": ["revenue", "product"],
      "decision_style": "data-driven",
      "communication_style": "direct",
      "unsubscribe_preference": "auto_with_confirmation",
      "display_name": "Test User",
      "company": "Test Company"
    }
  }'
```

#### Get Profile
```bash
curl -s "https://floally-mvp-production.up.railway.app/api/user/profile?user_email=your.email@gmail.com" | jq .

# Expected: Should return the profile data you just created
```

### 5. Check Database Directly (Railway Dashboard)

**View Data in Railway**:
1. Go to Railway project → PostgreSQL service
2. Click "Data" tab
3. Look for tables:
   - `users` - Should have your user record
   - `user_profiles` - Should have your onboarding answers
   - `connected_accounts` - Should have your Google OAuth credentials

## Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution**: Make sure you completed the OAuth flow and have the cookies set

### Issue: Onboarding still repeats
**Possible causes**:
1. Profile not saved to database
2. Frontend not checking `/api/user/profile` endpoint
3. Email mismatch between auth and profile

**Debug**:
```bash
# Check if profile exists
curl "https://floally-mvp-production.up.railway.app/api/user/profile?user_email=YOUR_EMAIL" | jq .
```

### Issue: Database tables not created
**Check Railway logs**:
```
Look for:
✅ Database tables initialized successfully

Or error:
❌ Error initializing database: [error message]
```

### Issue: 502 Bad Gateway
**Possible causes**:
1. App crashed during startup
2. Database connection failed
3. Port configuration issue

**Check**:
- Railway logs for errors
- DATABASE_URL environment variable is set
- PORT=3000 environment variable is set

## Success Criteria ✅

Your database integration is working if:
- ✅ You can sign in with Google
- ✅ Onboarding data saves successfully
- ✅ After logout and login, onboarding doesn't repeat
- ✅ Your real name shows in the UI (not "[User]")
- ✅ `/api/auth/status` returns your actual email and name
- ✅ Profile data persists in PostgreSQL database

## Next Steps After Testing

If tests pass:
1. Remove file-based storage (user_credentials.json)
2. Implement JWT-based sessions
3. Add session expiry handling
4. Connect Redis for session storage

If tests fail:
1. Check Railway deployment logs
2. Verify DATABASE_URL is set correctly
3. Test auth endpoints manually
4. Check browser console for frontend errors
