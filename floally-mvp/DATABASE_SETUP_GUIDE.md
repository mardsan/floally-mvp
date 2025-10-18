# 🚀 Database Setup Guide - OpAime User System

**Date:** October 18, 2025  
**Status:** Ready for Implementation

---

## ✅ What's Been Built

### **1. Database Schema** ✅
- **6 tables created:**
  - `users` - Core user accounts
  - `user_profiles` - Onboarding data and preferences
  - `connected_accounts` - OAuth connections (Google, etc.)
  - `behavior_actions` - Learning data from user actions
  - `user_settings` - AI and notification preferences
  - `sender_stats` - Aggregated statistics per sender

### **2. Backend Code** ✅
- `app/database.py` - Database configuration
- `app/models/user.py` - SQLAlchemy models
- `app/routers/user_profile_db.py` - User profile API (database version)
- `app/routers/behavior_db.py` - Behavior tracking API (database version)
- `init_db.py` - Script to create tables
- `migrate_to_db.py` - Script to migrate existing data

### **3. Dependencies** ✅
- Updated `requirements.txt` with:
  - SQLAlchemy 2.0.23
  - psycopg2-binary 2.9.9
  - alembic 1.12.1

---

## 🔧 Setup Instructions

### **Step 1: Add PostgreSQL to Railway** (5 minutes)

1. **Go to Railway Dashboard:**
   - https://railway.app/dashboard
   
2. **Open your backend project**

3. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-provisions the database
   - Wait 1-2 minutes for deployment

4. **Get DATABASE_URL:**
   - Railway automatically adds `DATABASE_URL` to your environment variables
   - Click "Variables" tab to verify it's there
   - Format: `postgresql://user:pass@host:port/dbname`

---

### **Step 2: Install Dependencies** (2 minutes)

```bash
cd /workspaces/codespaces-react/floally-mvp/backend
pip install -r requirements.txt
```

---

### **Step 3: Create Database Tables** (1 minute)

```bash
# Set DATABASE_URL locally for testing
export DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Run init script
python init_db.py
```

**Expected output:**
```
📊 Connecting to database...
🔗 Database URL: postgresql://...
🔨 Creating database tables...
✅ Database tables created successfully!

Created tables:
  - users
  - user_profiles
  - connected_accounts
  - behavior_actions
  - user_settings
  - sender_stats
```

---

### **Step 4: Migrate Existing Data** (2 minutes)

```bash
# This will move data from user_profiles/ and behavior_data/ to PostgreSQL
python migrate_to_db.py
```

**Expected output:**
```
🚀 OpAime Database Migration
============================================================

📋 Found X user profile(s) to migrate
✅ Migrated user: email@example.com (ID: uuid)
✅ Successfully migrated X user profile(s)

📊 Found X behavior log(s) and X sender stats file(s)
✅ Migrated X behavior action(s) for email@example.com
✅ Successfully migrated behavior data

============================================================
✅ Migration completed successfully!
============================================================
```

---

### **Step 5: Update Backend to Use Database** (3 minutes)

We need to update `main.py` to use the new database routers:

```python
# backend/app/main.py

# Import database routers
from app.routers import user_profile_db, behavior_db

# Replace old routers
app.include_router(user_profile_db.router, prefix="/api/user", tags=["user-profile"])
app.include_router(behavior_db.router, prefix="/api/behavior", tags=["behavior"])
```

---

### **Step 6: Test Locally** (5 minutes)

```bash
# Start backend
cd /workspaces/codespaces-react/floally-mvp/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Test endpoints:**
```bash
# Get user profile
curl "http://localhost:8000/api/user/profile?user_email=test@example.com"

# Log behavior action
curl -X POST http://localhost:8000/api/behavior/log-action \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "email_id": "test123",
    "sender_email": "sender@example.com",
    "sender_domain": "example.com",
    "action_type": "mark_important_feedback",
    "email_category": "primary",
    "confidence_score": 1.0
  }'
```

---

### **Step 7: Deploy to Railway** (Auto - 3 minutes)

Railway will automatically deploy when you push to GitHub:

```bash
cd /workspaces/codespaces-react/floally-mvp
git add -A
git commit -m "Add PostgreSQL user system with database backend"
git push origin main
```

**Railway will:**
1. Detect the new dependencies
2. Install SQLAlchemy, psycopg2, etc.
3. Connect to PostgreSQL database
4. Start the updated backend

**After deployment:**
- SSH into Railway or use Railway CLI to run:
  ```bash
  railway run python init_db.py
  railway run python migrate_to_db.py
  ```

---

## 🎯 What This Achieves

### **Before (File-Based):**
- ❌ "[User]" placeholder in greetings
- ❌ Email as identifier (no real user ID)
- ❌ Data in JSON files
- ❌ No multi-account support
- ❌ Hard to scale

### **After (Database):**
- ✅ "Good morning, Martin 🌞" (real names!)
- ✅ UUID-based user system
- ✅ PostgreSQL database
- ✅ Foundation for multi-account support
- ✅ Ready to scale

---

## 📋 Environment Variables Checklist

Make sure Railway has these set:

- [x] `DATABASE_URL` - Auto-set by Railway PostgreSQL
- [x] `FRONTEND_URL` - `https://floally-mvp.vercel.app`
- [x] `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- [x] `GOOGLE_CLIENT_SECRET` - Your Google OAuth secret
- [x] `GOOGLE_REDIRECT_URI` - Railway callback URL
- [x] `ANTHROPIC_API_KEY` - Your Claude API key
- [x] `ALLOWED_ORIGINS` - `https://floally-mvp.vercel.app`

---

## 🐛 Troubleshooting

### **"DATABASE_URL not set"**
- Make sure PostgreSQL is added to Railway project
- Check Variables tab - should see `DATABASE_URL`
- Restart deployment if needed

### **"relation does not exist"**
- Tables not created yet
- Run: `railway run python init_db.py`

### **"No module named 'psycopg2'"**
- Dependencies not installed
- Run: `pip install -r requirements.txt`
- Or wait for Railway to auto-install on deploy

### **Migration script fails:**
- Check if `user_profiles/` and `behavior_data/` directories exist
- If no existing data, that's fine! Migration will skip
- New users will be created in database going forward

---

## 🔄 Rollback Plan

If something goes wrong, you can easily rollback:

1. **Keep old routers:**
   - Old file-based routers still exist
   - Just change imports in `main.py` back to originals

2. **Data is safe:**
   - Original JSON files are not deleted
   - Database is separate - doesn't affect files

3. **Easy switch:**
   ```python
   # To rollback, use old imports:
   from app.routers import user_profile, behavior
   
   # Instead of:
   from app.routers import user_profile_db, behavior_db
   ```

---

## 🎉 Next Steps After Setup

1. ✅ Database running on Railway
2. ✅ Tables created (`init_db.py`)
3. ✅ Data migrated (`migrate_to_db.py`)
4. ✅ Backend deployed with database
5. ✅ Test with frontend
6. ✅ **User names will show up!**
7. 🚀 Build multi-account support (Phase 2)

---

## 📊 Database Schema Reference

```sql
-- Quick reference for the database structure

-- Users
users (id, email, display_name, avatar_url, created_at, updated_at)

-- Profiles  
user_profiles (user_id, role, priorities, decision_style, ...)

-- Connected Accounts
connected_accounts (id, user_id, provider, email, access_token, ...)

-- Behavior
behavior_actions (id, user_id, email_id, action_type, ...)
sender_stats (id, user_id, sender_email, importance_score, ...)

-- Settings
user_settings (user_id, ai_preferences, notification_preferences, ...)
```

---

**Ready to deploy!** Follow the steps above to get the user system running. 🚀

**Last Updated:** October 18, 2025  
**Status:** Code Complete - Ready for Deployment
