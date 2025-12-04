# Combined Testing Plan - Sprint 1
**Date:** December 4, 2025  
**Testing Activity Logging & Sub-tasks Features**

---

## 📋 TWO-TRACK TESTING APPROACH

### Track 1: You (User Testing)
**Document:** `USER_TESTING_GUIDE.md`  
**Time:** 30-45 minutes  
**Focus:** Real user experience

**Follow these steps:**
1. Open `USER_TESTING_GUIDE.md`
2. Go through each test scenario
3. Fill in the checkboxes and notes
4. Rate your experience (1-10)
5. Report top 3 findings (good and bad)

### Track 2: Me (Backend Testing)
**Document:** `TESTING_SPRINT1.md` (technical)  
**Time:** 15-20 minutes  
**Focus:** API and database

**What I'll verify:**
1. Activity events API endpoints working
2. Database tables created correctly
3. Events logging and retrieving properly
4. Sub-tasks persistence verified
5. Performance and batching working

---

## 🔧 BACKEND STATUS (As of Now)

### ✅ What's Ready:
- Activity events router created
- Database models defined
- Frontend hooks implemented
- Sub-tasks test script ready
- API test script created (`test_api.sh`)

### ⚠️ Just Fixed:
- **Route prefix corrected:** `/api/events` → `/api/activity/events`
- This was causing 404 errors
- Railway is now auto-deploying the fix (takes ~2-3 minutes)

### 🕐 Pending:
- Database migration needs to run on Railway (creates `activity_events` table)
- Will run automatically on next deployment or can trigger manually

---

## 🎯 TESTING WORKFLOW

### Step 1: Wait for Deployment (2-3 min)
Railway is deploying the route fix now. Check status:
- Go to: https://railway.app/dashboard
- Find: floally-mvp backend service
- Wait for: Green "Active" status

### Step 2: Run Backend API Test (2 min)
```bash
cd /workspaces/codespaces-react/floally-mvp/backend
bash test_api.sh
```

**Expected after deployment:**
- ✅ Test 1: API Health (200 OK)
- ✅ Test 2: POST /api/activity/events (creates event)
- ✅ Test 3: GET /api/activity/events (retrieves events)
- ✅ Test 4: Projects endpoint (200 OK)

**If you see ❌ errors:**
- Wait 1 more minute for deployment
- Run script again
- Check Railway logs for errors

### Step 3: User Testing (30-45 min)
**You start here!**

Open `USER_TESTING_GUIDE.md` and follow it step-by-step:

1. **Projects & Sub-tasks** (10 min)
   - Create project manually
   - Use AI Wizard
   - Toggle sub-tasks
   - Test persistence

2. **Dashboard & Standup** (10 min)
   - View daily standup
   - Change "One Thing" status
   - Regenerate if available

3. **Email/Messages** (10 min)
   - Open emails
   - Switch categories
   - Check tracking

4. **Performance** (5 min)
   - Rapid interactions
   - Check DevTools console
   - Verify batching

5. **Visual/UX** (5 min)
   - Overall polish
   - Ratings and feedback

### Step 4: Combine Findings (5 min)
After both tracks complete:

**You share:**
- Completed USER_TESTING_GUIDE.md with notes
- Screenshots of any issues
- Top 3 findings

**I share:**
- Backend test results
- API performance data
- Database verification

**Together we:**
- Identify critical bugs
- Prioritize fixes
- Plan next sprint

---

## 📊 SUCCESS CRITERIA

### Minimum Viable (Must Pass):
- [ ] Backend API responds (all 4 endpoints work)
- [ ] Sub-tasks save and persist
- [ ] Activity events log from frontend
- [ ] No critical bugs that block usage

### Target (Should Pass):
- [ ] All backend tests pass
- [ ] User rates experience 7+/10
- [ ] No major UX issues
- [ ] Events batch correctly (no lag)
- [ ] 15/18 technical tests pass

### Stretch (Nice to Have):
- [ ] User rates experience 9+/10
- [ ] Zero bugs found
- [ ] Mobile works perfectly
- [ ] 18/18 technical tests pass

---

## 🐛 KNOWN ISSUES (Pre-Testing)

1. **Activity Events API was 404**
   - **Status:** FIXED (just pushed)
   - **Action:** Wait for Railway deployment

2. **Migration not run yet**
   - **Status:** Will auto-run on deployment
   - **Action:** Verify `activity_events` table exists

3. **Projects endpoint returning 500**
   - **Status:** Investigating
   - **Action:** Check Railway logs

---

## 📝 REPORTING TEMPLATE

### Backend Results (I'll fill this):
```
Test 1 - API Health: ✅ / ❌
Test 2 - POST events: ✅ / ❌  
Test 3 - GET events: ✅ / ❌
Test 4 - Projects: ✅ / ❌

Database:
- activity_events table: Exists / Missing
- Sample event count: _____

Issues found: _____________________________
```

### Frontend Results (You'll fill this):
```
Overall Experience: ___/10

Projects & Sub-tasks: ✅ / ⚠️ / ❌
Dashboard & Standup: ✅ / ⚠️ / ❌
Email/Messages: ✅ / ⚠️ / ❌
Performance: ✅ / ⚠️ / ❌
Visual/UX: ✅ / ⚠️ / ❌

Top 3 Wins:
1. _____________________________________
2. _____________________________________
3. _____________________________________

Top 3 Issues:
1. _____________________________________
2. _____________________________________
3. _____________________________________
```

---

## 🚀 NEXT STEPS (After Testing)

### If Tests Pass (15/18+):
1. ✅ Mark Sprint 1 as complete
2. 📊 Document findings
3. 🎯 Start Sprint 2 planning
   - Aimy's Memory System
   - Gmail Intelligence
   - Analytics Dashboard

### If Critical Issues Found:
1. 🔥 Fix blockers immediately
2. 🧪 Re-test affected areas
3. ✅ Verify fixes deployed
4. ➡️ Then proceed to Sprint 2

### Regardless of Results:
1. 📝 Update SPRINT_1_DEC4_PROGRESS.md with outcomes
2. 🎓 Document lessons learned
3. 💡 Capture improvement ideas
4. 🔄 Iterate on testing process

---

## 🤝 COLLABORATION

**During Testing:**
- DM me immediately if you hit blockers
- Share screenshots of interesting findings
- Ask questions anytime

**After Testing:**
- Schedule 15min debrief call
- Review findings together
- Prioritize next actions

---

## 📚 REFERENCE DOCUMENTS

1. **USER_TESTING_GUIDE.md** - Your main guide (user-friendly)
2. **TESTING_SPRINT1.md** - Technical checklist (18 tests)
3. **SPRINT_1_DEC4_PROGRESS.md** - What we built today
4. **NEXT_STEPS.md** - Full product roadmap

5. **test_api.sh** - Backend API test script
6. **test_subtasks_persistence.py** - Database test script

---

## ⏱️ TIMING

**Start:** After Railway deployment completes (~5 min from now)  
**Duration:** 45-60 minutes total  
**End:** Debrief and planning

**Current Status:** ⏳ Waiting for deployment...

---

## ✅ PRE-FLIGHT CHECKLIST

Before starting testing:

- [ ] Railway deployment completed (check dashboard)
- [ ] `test_api.sh` script returns mostly ✅
- [ ] www.okaimy.com is accessible
- [ ] You have USER_TESTING_GUIDE.md open
- [ ] DevTools installed (Chrome/Edge)
- [ ] Coffee/tea ready ☕

**Ready?** Let's test! 🚀

---

**Questions?** Just ask!  
**Issues?** Report immediately!  
**Feedback?** Always welcome!
