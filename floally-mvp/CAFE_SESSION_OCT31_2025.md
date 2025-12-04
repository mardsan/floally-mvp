# Cafe Session Guide - October 31, 2025

**Created:** October 31, 2025  
**Purpose:** Testing and validation of Oct 31 features  
**Location:** Remote (Cafe)  
**Estimated Time:** 65 minutes

---

## 🎯 Hey Aimi Core Vision (Updated Understanding)

**Hey Aimi is an AI-powered project management partner** that:
- Manages multiple communication channels (Gmail, Slack, Calendar, etc.)
- Provides intelligent project organization connecting all communications to your goals
- Protects your focus by handling noise so you can do meaningful work
- Partners with you strategically through Aimi, not just managing your inbox

**Key Distinction:**
- ❌ NOT: Just a smart email client or unified inbox
- ✅ IS: A comprehensive AI partner for project management across all channels

---

## 📋 Today's Testing Tasks (In Order)

### Task 1: Test AI Project Creation Flow ⭐
**Time:** 30 minutes  
**Priority:** HIGH - This is a core feature (projects are central to Hey Aimi)

**Steps:**
1. Go to https://www.okaimy.com/projects
2. Click "New Project" button
3. Enter a brief description, for example:
   - "Build a mobile app for task tracking"
   - "Website redesign for client portfolio"
   - "Launch Q4 marketing campaign"
4. Click "✨ Let Aimi Plan It"
5. **VERIFY AI generates:**
   - ✅ Enhanced description (2-3 detailed sentences)
   - ✅ Realistic timeline estimate (e.g., "2-3 weeks")
   - ✅ 3-5 SMART goals with **ACTUAL calendar dates** (NOT "Week 1" - should be like "2025-11-15")
   - ✅ Success metrics
   - ✅ Priority recommendation (Critical/High/Medium/Low)
6. Edit suggestions if needed
7. Click "Save Project"
8. **VERIFY:**
   - ✅ Project appears in list
   - ✅ Goals are stored and displayed
   - ✅ No console errors

**What to watch for:**
- Goals should have real dates (Nov 15, Dec 1, etc.), NOT relative timeframes
- AI should use Claude 3 Haiku (cost-effective)
- If AI fails, there should be a fallback template option
- Manual "Skip AI" option should also work

**Expected Backend Endpoint:**
```
POST /api/ai/generate-project-plan
```

---

### Task 2: Test Status Persistence Feature 🔄
**Time:** 20 minutes  
**Priority:** HIGH - Validates project task tracking across sessions

**Steps:**
1. Go to https://www.okaimy.com/dashboard
2. If no standup loaded, click "Refresh" to generate
3. Look at "The One Thing" section
4. **Test Status Dropdown:**
   - Change status to "🟡 In Progress"
   - Note the current task name
   - **Hard refresh page** (Cmd+Shift+R or Ctrl+Shift+R)
   - ✅ VERIFY: Status still shows "🟡 In Progress"
   - ✅ VERIFY: Same task is displayed

5. **Test "Start Working" Button:**
   - Reset status to "⚪ Preparing" if needed
   - Click "Start Working" button
   - ✅ VERIFY: Status auto-changes to "🟡 In Progress"
   - ✅ VERIFY: "Details from Aimi" section auto-expands

6. **Test Task Swapping:**
   - Look at "Other Priorities" list
   - Click on a different task to swap it with "The One Thing"
   - ✅ VERIFY: New task becomes "The One Thing"
   - ✅ VERIFY: Old task appears in "Other Priorities"
   - ✅ VERIFY: Status resets to "⚪ Preparing"
   - ✅ VERIFY: Details section collapses

7. **Check Database:**
   - Open browser DevTools → Network tab
   - Watch for API calls to:
     - `GET /api/standup/status`
     - `POST /api/standup/status`
   - ✅ VERIFY: Status changes trigger save requests

**What to watch for:**
- Status should persist even after closing browser and reopening
- No data loss when swapping tasks
- Console should show "✅ Using cached standup" on refresh

**Backend Endpoints:**
```
GET /api/standup/today?user_email=...
GET /api/standup/status?user_email=...&task_title=...
POST /api/standup/status
PUT /api/standup/status/{id}
```

---

### Task 3: Verify Production Deployment Status 🚀
**Time:** 15 minutes  
**Priority:** MEDIUM - Health check of all systems

**Steps:**
1. **Check Backend (Railway):**
   - Visit: https://floally-mvp-production.up.railway.app/api/health
   - ✅ VERIFY: Returns `{"status": "healthy"}`
   - Or visit: https://floally-mvp-production.up.railway.app/docs
   - ✅ VERIFY: Swagger docs load

2. **Check Frontend (Vercel):**
   - Visit: https://www.okaimy.com
   - ✅ VERIFY: Splash page loads with Hey Aimi branding
   - ✅ VERIFY: Logo shows correctly
   - ✅ VERIFY: "Connect Google Account" button present

3. **Test Core Features:**
   - Login with Google OAuth
   - ✅ VERIFY: Authentication works
   - ✅ VERIFY: Dashboard loads
   - ✅ VERIFY: Daily Standup section visible
   - ✅ VERIFY: Projects button (📁 Projects) in header
   - ✅ VERIFY: Profile Hub button (🏠 Hub) in header

4. **Check Console for Errors:**
   - Open DevTools → Console tab
   - ✅ VERIFY: No red errors
   - Look for `API URL:` log message
   - ✅ VERIFY: Shows Railway URL (not localhost)

5. **Quick Feature Smoke Test:**
   - Click "Refresh" on standup → Should work
   - Click "📁 Projects" → Should navigate to /projects
   - Click "🏠 Hub" → ProfileHub should open
   - Click "⚙️ Settings" → Settings modal opens

**What to watch for:**
- Any 404 errors (missing endpoints)
- Any CORS errors (cross-origin issues)
- Any 500 errors (backend crashes)
- Slow loading times (>5 seconds)

**If Problems Found:**
- Note the error message
- Check Network tab for failed requests
- Screenshot the console errors
- We'll debug after testing

---

## 🔍 Testing Checklist Summary

```
Task 1: AI Project Creation (30 min)
  [ ] Navigate to /projects
  [ ] Create project with brief description
  [ ] Click "Let Aimi Plan It"
  [ ] Verify AI generates plan with real dates
  [ ] Save and confirm storage
  [ ] Check console for errors

Task 2: Status Persistence (20 min)
  [ ] Change status to In Progress
  [ ] Refresh page - status persists
  [ ] Test Start Working button
  [ ] Test task swapping
  [ ] Verify database saves

Task 3: Production Health Check (15 min)
  [ ] Backend health endpoint works
  [ ] Frontend loads correctly
  [ ] OAuth authentication works
  [ ] Core features accessible
  [ ] No console errors
```

---

## 📊 Success Criteria

**All tests pass when:**
- ✅ AI project creation generates plans with actual calendar dates
- ✅ Status persists across page refreshes without data loss
- ✅ All backend/frontend services are live and responsive
- ✅ No critical console errors or broken functionality
- ✅ User experience is smooth and intuitive

**If any test fails:**
- Document the exact error message
- Note which step failed
- Screenshot if visual issue
- We'll debug and fix when you're back

---

## 🎯 After Testing (Next Steps)

Once all 3 tests pass:

### Immediate Next Build:
**Trusted Contacts Management UI** (3-4 hours)
- Create TrustedContactsManager.jsx component
- Add ProfileHub tab for managing trusted/blocked senders
- Backend endpoints already ready

### Planning Tasks:
- UI Refresh with Tailwind templates
- Subscription monetization review
- Multi-source calendar integration

---

## 📝 Context Files to Reference

If you need to restore context in a new session:

1. **SESSION_NOTES_OCT31_2025.md** - Complete technical details from today
2. **TODO_OCT31_2025.md** - Full task list and priorities
3. **This file** - Testing guide for cafe session

---

## 💬 Quick Start Message for New Copilot Session

When you open VS Code on your cafe computer, paste this to Copilot:

```
I'm continuing from the October 31st session. Please read:
- SESSION_NOTES_OCT31_2025.md
- TODO_OCT31_2025.md
- CAFE_SESSION_OCT31_2025.md

We need to run the 3 testing tasks. Let's start with testing 
the AI Project Creation Flow at www.okaimy.com/projects.
```

---

## 🚀 Production URLs

- **Main App:** https://www.okaimy.com
- **Dashboard:** https://www.okaimy.com/dashboard
- **Projects:** https://www.okaimy.com/projects
- **Backend:** https://floally-mvp-production.up.railway.app
- **API Docs:** https://floally-mvp-production.up.railway.app/docs

---

## 🛠️ Technical Details

### Latest Commits (Oct 31, 2025):
```
29567c4 - 📝 Add comprehensive session notes for Oct 31, 2025
673e6df - 🪄 Integrate Aimi Wizard for AI-powered project planning
427fc62 - ✨ Implement Start Working button
11c82b9 - ✨ Simplify Other Priorities - remove urgency scale
```

### Tech Stack:
- **Frontend:** React + Vite on Vercel
- **Backend:** FastAPI on Railway
- **Database:** PostgreSQL on Railway
- **AI:** Claude 3 Haiku (Anthropic API)

### Key Features Completed Today:
1. ✅ Status Persistence & Standup Caching
2. ✅ Projects Management with AI Wizard
3. ✅ Start Working Button
4. ✅ Task Swapping Logic
5. ✅ Urgency Score Fixes

---

**Ready for testing! ☕ Enjoy your cafe session!**

*Last updated: October 31, 2025*
*Next action: Run 3 testing tasks in order*
