# Deployment Guide - Hey Aimi MVP

## 🚀 Quick Start: What's Already Done

### ✅ Deployed & Live
- **Frontend:** Vercel → https://heyaimi.com
- **Backend:** Railway → floally-mvp-production.up.railway.app
- **Code:** GitHub → mardsan/floally-mvp (main branch)

### ✅ Features Implemented
- Google OAuth authentication
- Gmail API integration (messages, archive, star)
- Google Calendar integration (events, status)
- AI-powered daily standup (Claude/Anthropic)
- Mobile-responsive UI with react-icons
- Professional "Luminous Calm" design

### ⏳ Pending: 2 Simple Steps
1. Add PostgreSQL to Railway
2. Set ANTHROPIC_API_KEY environment variable

---

## 📋 Step-by-Step Deployment

### Step 1: Add PostgreSQL to Railway (5 minutes)

**In Railway Dashboard:**
1. Go to your project: `floally-mvp-production`
2. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway auto-provisions the database and sets `DATABASE_URL`
4. Wait for database to initialize (green checkmark)

**Initialize Database Schema:**
```bash
# In Railway CLI or via Railway shell:
railway run python backend/init_db.py
```

**Expected Output:**
```
✅ All tables created successfully!
Tables: users, user_profiles, connected_accounts, behavior_actions, user_settings, sender_stats
```

---

### Step 2: Set ANTHROPIC_API_KEY (2 minutes)

**In Railway Dashboard:**
1. Go to your backend service
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key (from console.anthropic.com)
5. Click **"Add"** - Railway will auto-redeploy

---

## ✅ Testing Checklist

### 1. Authentication Flow
- [ ] Visit https://heyaimi.com
- [ ] Click "Sign in with Google"
- [ ] Grant Gmail + Calendar permissions
- [ ] Verify redirect to dashboard
- [ ] Check your name appears in header

### 2. Gmail Integration
- [ ] "Quick Approvals" section loads messages
- [ ] Click "Archive" → message disappears
- [ ] Click "Star" → message gets starred

### 3. Calendar Integration
- [ ] "Today's Schedule" section loads events
- [ ] Current event has "Now" badge with pulse
- [ ] Events show time, location, attendees

### 4. AI Insights
- [ ] "Aimi's Daily Brief" generates standup
- [ ] Shows "The One Thing" priority
- [ ] Lists key decisions

### 5. Mobile Experience
- [ ] Hamburger menu works
- [ ] Touch targets are large (44px+)
- [ ] All sections scroll properly

---

## 🎉 Success!

Once both steps are complete and tests pass, your MVP is **fully production-ready** at https://heyaimi.com! 🚀

**Time to Deploy:** ~10 minutes
**Time to Test:** ~15 minutes
**Total:** 25 minutes to production! ✨
