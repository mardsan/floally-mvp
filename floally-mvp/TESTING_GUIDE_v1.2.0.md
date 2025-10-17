# Sprint 1 v1.2.0 - Testing Guide

## Deployment Status
- **Commit:** 03c9b68
- **Backend:** Auto-deploying to Railway (https://floally-mvp-production.up.railway.app)
- **Frontend:** Auto-deploying to Vercel (https://floally-mvp-d548.vercel.app)

## Quick Test Checklist

### 1. Backend Health Check
```bash
# Test user profile endpoint
curl "https://floally-mvp-production.up.railway.app/api/user/profile?user_email=test@example.com"

# Expected: Returns default profile with onboarding_completed: false
```

### 2. Frontend First Login Flow

1. **Open app:** https://floally-mvp-d548.vercel.app
2. **Login:** Click "Connect Google Account"
3. **Authorize:** Grant Gmail + Calendar permissions
4. **Expected:** Onboarding modal appears automatically
5. **Complete onboarding:** Answer all 5 questions
   - Role: e.g., "Product Manager"
   - Priorities: Pick 3 (e.g., Client work, Strategic planning, Learning)
   - Decision Style: e.g., "Options with context"
   - Communication: e.g., "Warm & friendly"
   - Newsletters: e.g., "Ask before unsubscribing"
6. **Expected:** Modal closes, Settings button appears in header

### 3. Settings Page

1. **Click Settings (⚙️) in header**
2. **Expected:** Settings modal opens
3. **Check "Alli's Understanding" section**
   - Should show natural language summary like:
     > "You're a Product Manager who values client work, strategic planning, and learning & growth. You like warm, friendly interactions. When making decisions, you like to see options with detailed context."
4. **Check "Your Profile" section**
   - Should display all onboarding answers
5. **Click "✏️ Edit"**
   - Expected: Onboarding reopens for editing

### 4. AI Stand-Up Personalization

1. **Click "🚀 Generate Stand-Up"**
2. **Review response tone:**
   - If you chose "Warm & friendly" → should be conversational
   - If you chose "Concise & direct" → should be brief
   - If you chose "Formal & professional" → should be business-like
3. **Check "The One Thing":**
   - Should prioritize based on your selected priorities
   - E.g., if "Client work" is top priority, should mention client-related tasks first

### 5. Enhanced Email Categorization

**Backend Test (Terminal):**
```bash
# Get emails
curl "https://floally-mvp-production.up.railway.app/api/gmail/messages?max_results=5" \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

**Expected in response:**
- `isPrimary`: true/false
- `isForums`: true/false
- `isNewsletter`: true/false
- `hasUnsubscribeLink`: true/false
- `domain`: "example.com"

**Frontend Test:**
- In browser DevTools console: Check email objects in `data.messages`
- Should see new fields in each message

### 6. Profile Persistence

1. **Refresh page**
2. **Expected:** No onboarding (already completed)
3. **Click Settings**
4. **Expected:** Profile data still present
5. **Check AI stand-up tone:** Should still match preference

## Common Issues & Fixes

### Issue: Onboarding doesn't appear on first login
**Check:** 
- Browser console for errors
- Network tab → check `/api/user/profile` response
- If `onboarding_completed: true` incorrectly, delete profile file on server

### Issue: Settings button not visible
**Check:**
- `profile.onboarding_completed === true` in React state
- Console logs for profile loading errors

### Issue: AI stand-up tone doesn't match preference
**Check:**
- Network tab → Stand-up request includes `userContext` field
- Backend logs → Claude prompt includes user profile context

### Issue: Profile not persisting
**Check:**
- Server has write permissions to `user_profiles/` directory
- File exists: `ls backend/app/user_profiles/` on server
- File format: Valid JSON

## Manual Backend Testing (Local)

```bash
# Start backend
cd floally-mvp/backend
source ../.venv/bin/activate  # or your venv path
uvicorn app.main:app --reload --port 8000

# Test profile endpoints
curl http://localhost:8000/api/user/profile?user_email=test@example.com

# Test onboarding
curl -X POST http://localhost:8000/api/user/profile/onboarding?user_email=test@example.com \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Designer",
    "priorities": ["Creative focus time", "Client work"],
    "decision_style": "just_recommend",
    "communication_style": "warm_friendly",
    "unsubscribe_preference": "ask_before_unsubscribe"
  }'

# Test insights
curl http://localhost:8000/api/user/profile/insights?user_email=test@example.com
```

## Success Criteria ✅

- [ ] New users see onboarding automatically
- [ ] All 5 onboarding steps validate correctly
- [ ] Profile saves successfully
- [ ] Settings button appears after onboarding
- [ ] Settings page displays profile accurately
- [ ] "Alli's Understanding" shows natural language summary
- [ ] Edit button reopens onboarding
- [ ] AI stand-up tone matches communication preference
- [ ] AI stand-up priorities align with user selection
- [ ] Enhanced email fields (isPrimary, isNewsletter, etc.) return correctly
- [ ] Profile persists across sessions
- [ ] No console errors in browser
- [ ] No server errors in Railway logs

## Performance Checks

- Onboarding load time: < 1 second
- Profile API response: < 500ms
- Insights generation: < 1 second
- AI stand-up with profile context: Same as before (~3-5 seconds)

## Next Steps After Testing

1. **If all tests pass:**
   - Document in SESSION_LOG.md
   - Announce v1.2.0 release
   - Begin Sprint 2 planning

2. **If issues found:**
   - Document bugs in GitHub Issues
   - Fix critical bugs before announcement
   - Non-critical bugs → Sprint 1.1 patch

---

**Version:** 1.2.0  
**Test Date:** January 2025  
**Tester:** @mardsan + team
