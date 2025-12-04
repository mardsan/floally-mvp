# Testing Checklist - Activity Logging & Sub-tasks
**Date:** December 4, 2025  
**Sprint 1 Implementation Testing**

---

## 🧪 BACKEND TESTING

### 1. Database Migration (Railway)
**What:** Verify activity_events table created successfully

**Steps:**
```bash
# Option A: Connect to Railway DB and check
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'activity_events';

# Option B: Check Railway logs for migration errors
# Go to Railway dashboard → Backend service → Logs
# Look for any migration errors
```

**Expected Result:**
- ✅ Table `activity_events` exists
- ✅ No migration errors in logs

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 2. Activity Events API Endpoint
**What:** Test POST /api/activity/events endpoint

**Steps:**
```bash
# Test creating an activity event
curl -X POST https://floally-mvp-production.up.railway.app/api/activity/events \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "YOUR_EMAIL@example.com",
    "event_type": "test_event",
    "entity_type": "test",
    "entity_id": "test_123",
    "metadata": {"test": true},
    "action": "created"
  }'
```

**Expected Result:**
- ✅ 200 OK response
- ✅ Returns created event with ID and timestamp

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 3. Activity Events Retrieval
**What:** Test GET /api/activity/events endpoint

**Steps:**
```bash
# Get recent events for your user
curl "https://floally-mvp-production.up.railway.app/api/activity/events?user_email=YOUR_EMAIL@example.com&limit=10"
```

**Expected Result:**
- ✅ 200 OK response
- ✅ Returns array of events
- ✅ Events have: id, event_type, entity_type, metadata, timestamp

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 4. Sub-tasks Database Persistence
**What:** Run test script to verify JSONB storage

**Steps:**
```bash
# SSH into Railway backend (or run locally with prod DB credentials)
cd floally-mvp/backend
python test_subtasks_persistence.py
```

**Expected Result:**
- ✅ All 8 tests pass
- ✅ "✅ ALL TESTS PASSED" message
- ✅ Sub-tasks save, retrieve, and update correctly

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

## 🖥️ FRONTEND TESTING

### 5. Activity Logging in ProjectsPage
**What:** Verify events logged when interacting with projects

**Steps:**
1. Open www.okaimy.com and login
2. Go to Projects page
3. **Create a new project:**
   - Click "New Project" button
   - Fill in name and description
   - Add 1-2 goals
   - Save project
4. **Edit a project:**
   - Click on a project card
   - Change priority or status
   - Save changes
5. **Complete a sub-task:**
   - Open a project with sub-tasks
   - Click checkbox on a sub-task
   - Watch it mark as complete

**Check Activity Logs:**
```bash
# Query backend for your events
curl "https://floally-mvp-production.up.railway.app/api/activity/events?user_email=YOUR_EMAIL@example.com&limit=20"
```

**Expected Events:**
- ✅ `project_created` event (with name, priority, goals_count)
- ✅ `project_updated` event (with changed fields)
- ✅ `project_subtask_completed` event (with task, goal, project)

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 6. Activity Logging in MainDashboard
**What:** Verify standup and status change tracking

**Steps:**
1. Go to Dashboard (main page after login)
2. **Generate Standup:**
   - If no standup today, it auto-generates
   - Or click "Regenerate" if available
3. **Change "One Thing" Status:**
   - Find the "One Thing" card
   - Click status dropdown
   - Change from "Preparing" → "In Progress" → "Completed"

**Check Activity Logs:**
```bash
curl "https://floally-mvp-production.up.railway.app/api/activity/events?user_email=YOUR_EMAIL@example.com&limit=20"
```

**Expected Events:**
- ✅ `standup_generated` event (with one_thing title, secondary_count)
- ✅ `status_changed` event each time you change status (with status, one_thing)

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 7. Activity Logging in EnhancedMessages
**What:** Verify email interaction tracking

**Steps:**
1. Go to Messages/Inbox section
2. **Open an email:**
   - Click on any email in the list
   - Email detail modal should open
3. **Change category filter:**
   - Click "Primary" tab
   - Then click "Social" tab
   - Then click "Promotions" tab

**Check Activity Logs:**
```bash
curl "https://floally-mvp-production.up.railway.app/api/activity/events?user_email=YOUR_EMAIL@example.com&limit=20"
```

**Expected Events:**
- ✅ `email_opened` event (with subject, category, importance_score)
- ✅ `filter_changed` events (with category, previous category)

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 8. Event Batching Behavior
**What:** Verify events are batched, not sent individually

**Steps:**
1. Open browser DevTools (F12) → Network tab
2. Filter by "activity" or "events"
3. Perform 10 rapid actions:
   - Open email → close → open another → close
   - Toggle 5 sub-tasks quickly
   - Change filters multiple times

**Expected Behavior:**
- ✅ Events NOT sent after each action (no individual API calls)
- ✅ Batch sent after ~5 events OR ~30 seconds
- ✅ Single POST to /api/activity/events with array of events
- ✅ UI remains responsive (no lag)

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

## 📊 DATA INTEGRITY TESTING

### 9. Sub-tasks Save with Projects
**What:** Verify sub-tasks persist when project saved

**Steps:**
1. Create a new project with AI Wizard:
   - Click "AI Wizard"
   - Describe a project
   - Wait for AI to generate goals + sub-tasks
   - Save the project
2. Close the modal
3. Reopen the same project

**Expected Result:**
- ✅ All sub-tasks still present
- ✅ Sub-task statuses preserved
- ✅ Estimated hours displayed correctly
- ✅ Expansion arrows work

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 10. Sub-task Status Persistence
**What:** Verify completed sub-tasks stay completed

**Steps:**
1. Open a project with sub-tasks
2. Mark 2-3 sub-tasks as completed (checkboxes)
3. Save the project
4. Refresh the page (F5)
5. Reopen the same project

**Expected Result:**
- ✅ Previously completed sub-tasks still show as completed
- ✅ Checkboxes are checked
- ✅ Completion percentage is correct
- ✅ "X/Y tasks completed" accurate

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

## 🔍 EDGE CASES & ERROR HANDLING

### 11. Activity Logging Without Internet
**What:** Verify graceful handling when offline

**Steps:**
1. Open www.okaimy.com (while online)
2. Open DevTools → Network tab
3. Switch to "Offline" mode
4. Try to complete a sub-task or change status
5. Wait 30 seconds
6. Go back online

**Expected Behavior:**
- ✅ UI still works (checkbox toggles, status changes)
- ✅ No error toasts or crashes
- ✅ Events queued in memory (check console)
- ✅ When back online, events eventually send

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 12. Large Activity Log Query
**What:** Verify pagination works for many events

**Steps:**
```bash
# Request large number of events
curl "https://floally-mvp-production.up.railway.app/api/activity/events?user_email=YOUR_EMAIL@example.com&limit=100"
```

**Expected Result:**
- ✅ Response returns up to 100 events
- ✅ Response time < 2 seconds
- ✅ Events ordered by timestamp (newest first)

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 13. Special Characters in Sub-tasks
**What:** Verify JSONB handles Unicode, quotes, etc.

**Steps:**
1. Create/edit a project
2. Add a goal with special characters:
   - "Test "quotes" and 'apostrophes'"
   - "Unicode: 你好 🎉 café"
   - "Backslashes: C:\\Users\\test"
3. Add sub-tasks with emoji and symbols
4. Save and reload project

**Expected Result:**
- ✅ All special characters preserved
- ✅ No JSON parsing errors
- ✅ Display correctly in UI

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

## 🎨 UI/UX VALIDATION

### 14. Sub-task Expand/Collapse
**What:** Verify UI interactions work smoothly

**Steps:**
1. Open project with 5+ sub-tasks per goal
2. Click expand arrow (▶)
3. Click collapse arrow (▼)
4. Expand multiple goals simultaneously

**Expected Behavior:**
- ✅ Arrow changes direction (▶ ↔ ▼)
- ✅ Sub-tasks slide in/out smoothly
- ✅ No page jumps or layout shifts
- ✅ Each goal collapses independently

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 15. Activity Logging Performance
**What:** Ensure logging doesn't slow down app

**Steps:**
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Perform 20 rapid actions:
   - Toggle sub-tasks
   - Change statuses
   - Open/close emails
4. Stop recording
5. Analyze flame chart

**Expected Result:**
- ✅ No blocking operations over 50ms
- ✅ 60fps maintained during interactions
- ✅ Event batching visible in timeline
- ✅ No memory leaks (heap doesn't grow continuously)

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

## 🔒 SECURITY & PRIVACY

### 16. Event User Scoping
**What:** Verify users can only see their own events

**Steps:**
```bash
# Try to access another user's events (should fail)
curl "https://floally-mvp-production.up.railway.app/api/activity/events?user_email=someone_else@example.com"
```

**Expected Result:**
- ✅ Either 403 Forbidden or empty array
- ✅ Cannot see events from other users
- ✅ Proper authentication required

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

### 17. Sensitive Data in Logs
**What:** Ensure no passwords/tokens logged

**Steps:**
1. Check activity event metadata for any test events
2. Look for sensitive fields

**Expected Result:**
- ✅ No passwords in metadata
- ✅ No access tokens in metadata
- ✅ Email subjects truncated (not full content)
- ✅ Only necessary context included

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

## 📱 MOBILE TESTING (If Time Permits)

### 18. Activity Logging on iPhone
**What:** Verify works on mobile Safari

**Steps:**
1. Open www.okaimy.com on iPhone
2. Complete sub-tasks
3. Change statuses
4. Open emails
5. Check backend logs

**Expected Result:**
- ✅ All events tracked correctly
- ✅ Touch interactions register
- ✅ No mobile-specific errors

**Status:** [ ] Pass  [ ] Fail  [ ] Not Tested

---

## ✅ SUMMARY CHECKLIST

**Backend (4 tests):**
- [ ] Database migration successful
- [ ] POST endpoint works
- [ ] GET endpoint works
- [ ] Sub-tasks persistence test passes

**Frontend (4 tests):**
- [ ] Projects activity logging works
- [ ] Dashboard activity logging works
- [ ] Messages activity logging works
- [ ] Event batching works correctly

**Data Integrity (2 tests):**
- [ ] Sub-tasks save with projects
- [ ] Sub-task status persists

**Edge Cases (3 tests):**
- [ ] Offline handling graceful
- [ ] Large queries work
- [ ] Special characters handled

**UI/UX (2 tests):**
- [ ] Expand/collapse smooth
- [ ] No performance degradation

**Security (2 tests):**
- [ ] User scoping enforced
- [ ] No sensitive data logged

**Mobile (1 test):**
- [ ] Works on iPhone

---

## 🐛 ISSUE REPORTING

If you find issues, note:
- **Test #:** (e.g., Test #5)
- **What Happened:** (actual behavior)
- **Expected:** (what should happen)
- **Browser/Device:** (Chrome/Safari/iPhone)
- **Error Messages:** (console logs, screenshots)

---

## 📊 SUCCESS CRITERIA

**Minimum to Pass:**
- All Backend tests (4/4)
- All Frontend tests (4/4)
- Data Integrity tests (2/2)
- At least 2/3 Edge Cases

**Target:**
- 15/18 tests passing (83%+)

**Stretch:**
- 18/18 tests passing (100%)

---

**Estimated Testing Time:** 45-60 minutes  
**Priority:** Backend tests first, then Frontend logging  
**Tools Needed:** Browser DevTools, curl/Postman, Railway dashboard access
