# 🚂 Railway PostgreSQL Setup Guide

**Quick setup guide for adding PostgreSQL database to Hey Aimi backend**

---

## Step 1: Add PostgreSQL to Railway (5 minutes)

### Via Railway Dashboard:

1. **Go to Railway Dashboard:**
   ```
   https://railway.app/dashboard
   ```

2. **Open your backend project** (floally-mvp-production)

3. **Click "New" → "Database" → "Add PostgreSQL"**
   - Railway automatically provisions a PostgreSQL database
   - Wait 1-2 minutes for deployment
   - `DATABASE_URL` is automatically added to your environment variables

4. **Verify DATABASE_URL:**
   - Click "Variables" tab in your backend service
   - You should see `DATABASE_URL` with value like:
     ```
     postgresql://postgres:password@hostname:5432/railway
     ```

---

## Step 2: Initialize Database Tables (2 minutes)

### Option A: Via Railway CLI (Recommended)

```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run initialization script
railway run python backend/init_db.py
```

### Option B: Via Railway Dashboard

1. Go to your backend service
2. Click "Settings" → "Deploy"  
3. Add a one-time deploy command:
   ```
   python backend/init_db.py
   ```
4. Or use the Railway shell (if available)

---

## Step 3: Migrate Existing Data (Optional - 2 minutes)

If you have existing user data in JSON files:

```bash
railway run python backend/migrate_to_db.py
```

This will:
- Migrate `user_profiles/*.json` → users + user_profiles tables
- Migrate `behavior_data/*.json` → behavior_actions + sender_stats tables
- Preserve all existing user preferences and learning data

---

## Step 4: Verify Database Connection (1 minute)

### Test the database health:

```bash
curl "https://floally-mvp-production.up.railway.app/api/health"
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Test user profile endpoint:

```bash
curl "https://floally-mvp-production.up.railway.app/api/user/profile?user_email=test@example.com"
```

---

## Step 5: Deploy Frontend Update (Auto - 2 minutes)

Your frontend changes are already committed. Just push to trigger deployment:

```bash
cd /workspaces/codespaces-react/floally-mvp
git push origin main
```

Vercel will auto-deploy the new authentication flow to heyaimi.com

---

## What Happens After Setup

### ✅ **User Authentication Flow:**

1. User visits heyaimi.com
2. Sees Google Sign In page
3. Clicks "Sign in with Google"
4. Redirects to Google OAuth consent screen
5. After authorization → Returns to heyaimi.com
6. Backend creates User record in PostgreSQL
7. Frontend receives user data and displays dashboard
8. **Real name shows:** "Welcome back, [Your Name]" ✨

### ✅ **Database-Backed Features:**

- **User Profiles:** Display names, avatars, preferences stored in PostgreSQL
- **Multi-Account Support:** Ready for users to connect multiple Gmail accounts
- **Behavioral Learning:** All "Help Aimi Learn" data persisted in database
- **Scalable:** No more JSON files, ready for thousands of users
- **Fast:** Indexed database queries vs file system reads

---

## Environment Variables Checklist

Verify these are set in Railway:

- ✅ `DATABASE_URL` - Auto-set by Railway PostgreSQL
- ✅ `FRONTEND_URL` - `https://heyaimi.com`
- ✅ `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- ✅ `GOOGLE_CLIENT_SECRET` - Your Google OAuth secret
- ✅ `GOOGLE_REDIRECT_URI` - `https://floally-mvp-production.up.railway.app/api/auth/callback`
- ✅ `ANTHROPIC_API_KEY` - Your Claude API key
- ✅ `ALLOWED_ORIGINS` - `https://heyaimi.com,https://heyaimi.ai`

---

## Troubleshooting

### "DATABASE_URL not found"
- PostgreSQL database not added to Railway yet
- Go to Railway Dashboard → New → Database → PostgreSQL

### "Cannot connect to database"
- Check DATABASE_URL format is correct
- Ensure it starts with `postgresql://` (not `postgres://`)
- Backend automatically converts `postgres://` to `postgresql://`

### "Table does not exist"
- Database tables not created yet
- Run: `railway run python backend/init_db.py`

### "Migration failed"
- Check if `user_profiles/` and `behavior_data/` directories exist
- Migration is optional - only needed if you have existing data
- New users will be created directly in database

### "OAuth redirect failing"
- Check `FRONTEND_URL` is `https://heyaimi.com` (no trailing slash)
- Verify `GOOGLE_REDIRECT_URI` in Railway matches Google Cloud Console
- Update Google OAuth redirect URIs to include Railway URL

---

## Database Schema Reference

**6 tables created:**

1. **users** - Core user accounts
   - id (UUID, primary key)
   - email (unique)
   - display_name
   - avatar_url
   - created_at, updated_at

2. **user_profiles** - Onboarding preferences
   - user_id (foreign key)
   - role, priorities, decision_style
   - work_hours, communication_style
   - onboarding_completed

3. **connected_accounts** - OAuth connections
   - id (UUID)
   - user_id (foreign key)
   - provider (google, microsoft, etc.)
   - access_token, refresh_token
   - token_expires_at, scopes

4. **behavior_actions** - Learning data
   - id (UUID)
   - user_id (foreign key)
   - email_id, sender_email
   - action_type, confidence_score
   - metadata (JSONB)

5. **user_settings** - Preferences
   - user_id (foreign key)
   - ai_preferences (JSONB)
   - notification_preferences (JSONB)
   - privacy_settings (JSONB)

6. **sender_stats** - Aggregated importance
   - id (UUID)
   - user_id (foreign key)
   - sender_email, sender_domain
   - importance_score
   - total_emails, action_counts (JSONB)

---

## Next Steps After Database Setup

1. ✅ **Test authentication** - Sign in with Google
2. ✅ **Complete onboarding** - Set your name and preferences
3. ✅ **Verify database** - Your name should appear in dashboard
4. ✅ **Connect Gmail** - Authorize Gmail access
5. ✅ **Test "Help Aimi Learn"** - Mark emails as important/not important
6. ✅ **Check Aimi's Memory** - See what Aimi has learned about you

---

## Success Criteria

You'll know it's working when:

- ✅ Google Sign In page appears at heyaimi.com
- ✅ OAuth flow completes successfully
- ✅ Dashboard shows: "Welcome back, [Your Real Name]"
- ✅ "Help Aimi Learn" buttons work without errors
- ✅ Aimi's Memory page shows your profile
- ✅ No more "[User]" placeholders

---

**Ready to deploy!** 🚀

Follow steps 1-5 above and your database will be live in ~10 minutes.
