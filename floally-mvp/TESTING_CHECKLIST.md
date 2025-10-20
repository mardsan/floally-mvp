# 🧪 OkAimy Test Checklist

**Date:** October 20, 2025  
**Version:** 1.3.0  
**Features:** ProfileHub + Complete Rebrand

---

## ✅ Quick Test Flow

### Step 1: Open the App
```
URL: http://localhost:3000
```

**What to check:**
- [ ] Splash page appears
- [ ] Large Aimy avatar visible (256px)
- [ ] "OkAimy" logo and branding (NOT "OpAime")
- [ ] "Connect Google Account" button works

---

### Step 2: Login & Onboarding

**Login:**
- [ ] Click "Connect Google Account"
- [ ] Google OAuth screen appears
- [ ] After authorization, returns to app
- [ ] Authenticated successfully

**Onboarding (if first time):**
- [ ] 6-step onboarding flow appears
- [ ] Aimy's avatar shows (okaimy-pfp-01.png)
- [ ] Can complete all steps
- [ ] Lands on dashboard after completion

---

### Step 3: Dashboard

**Header:**
- [ ] Email address displays
- [ ] Three buttons visible:
  - [ ] 👤 Profile
  - [ ] 🏠 Hub ← **NEW!**
  - [ ] ⚙️ Settings
- [ ] "Good morning" greeting shows

**Content:**
- [ ] Emails load from Gmail
- [ ] Calendar events display
- [ ] "Aimy" references (NOT "Aime")
- [ ] Email actions work (Focus, Archive, Respond)

---

### Step 4: ProfileHub - THE MAIN TEST! 🎯

**Opening ProfileHub:**
- [ ] Click "🏠 Hub" button in header
- [ ] Full-screen ProfileHub opens
- [ ] "✕ Close" button visible top-right
- [ ] 4 tabs visible: Overview, Insights, Integrations, Settings

---

### Tab 1: Overview 👤

- [ ] User email displays
- [ ] Role shows (if set in onboarding)
- [ ] "Aimy's Understanding" card appears
- [ ] 4 stat cards display:
  - [ ] Total Actions
  - [ ] Recent Actions (7d)
  - [ ] Priorities Set
  - [ ] Integrations
- [ ] Onboarding status shown
- [ ] No errors in console

**Expected on first use:**
- Total Actions: 0 or small number
- Aimy's Understanding: Should be personalized based on onboarding

---

### Tab 2: Insights 📊

**If you have NO actions yet:**
- [ ] Message: "Start using OkAimy to build your behavioral insights!"

**If you have actions (take some email actions first!):**
- [ ] Learning status banner shows (Building/Active/Confident)
- [ ] Confidence score displays (0-100%)
- [ ] Total actions & days active count
- [ ] Action breakdown shows:
  - [ ] Focus bar
  - [ ] Archive bar
  - [ ] Respond bar
  - [ ] Unsubscribe bar
  - [ ] Not Interested bar
- [ ] Response patterns show Focus/Archive rates
- [ ] Top senders list appears (if data available)
- [ ] Daily activity chart shows last 7 days
- [ ] Hovering over chart bars shows tooltips

**Test this:**
1. Go back to dashboard
2. Take 5-10 actions on emails (Focus, Archive, etc.)
3. Return to ProfileHub → Insights tab
4. Watch numbers update!

---

### Tab 3: Integrations 🔗

- [ ] Gmail card shows:
  - [ ] Green background (connected)
  - [ ] 📧 Gmail icon
  - [ ] Scopes listed
  - [ ] "Required" button (can't disconnect)
- [ ] Google Calendar card shows:
  - [ ] Green background (connected)
  - [ ] 📅 Calendar icon
  - [ ] "Disconnect" button
- [ ] Slack card shows:
  - [ ] Gray background (not connected)
  - [ ] "Coming Soon" badge
  - [ ] "Coming Soon" button (disabled)
- [ ] Notion card shows:
  - [ ] Gray background
  - [ ] "Coming Soon" badge

---

### Tab 4: Settings ⚙️

- [ ] Settings page loads
- [ ] Profile information displays:
  - [ ] Role
  - [ ] Top Priorities (with emoji icons)
  - [ ] Decision Style
  - [ ] Communication Style
  - [ ] Newsletter Management
- [ ] Account Management section shows:
  - [ ] 🔔 Notification Preferences
  - [ ] 🔒 Privacy & Data
  - [ ] ⚠️ Delete Account (red text)
- [ ] Data & Privacy info at bottom

---

### Step 5: Close ProfileHub

- [ ] Click "✕ Close" button
- [ ] Returns to dashboard
- [ ] Dashboard still works
- [ ] Can reopen ProfileHub anytime

---

### Step 6: Settings Modal (Original)

- [ ] Click "⚙️ Settings" in header
- [ ] Settings modal opens (different from ProfileHub Settings tab)
- [ ] Shows Aimy's Understanding
- [ ] Shows full profile
- [ ] "✏️ Edit" button works
- [ ] Can close modal

---

### Step 7: Take Email Actions & Re-test Insights

**Action sequence:**
1. Close ProfileHub/Settings
2. On dashboard, find 10 emails
3. Take actions:
   - Focus on 3 emails
   - Archive 4 emails
   - Respond to 1 email
   - Unsubscribe from 2
4. Open ProfileHub again
5. Go to Insights tab
6. **Verify:**
   - [ ] Total actions = 10
   - [ ] Action breakdown shows correct counts
   - [ ] Response patterns calculate correctly
   - [ ] Daily activity chart shows today's bar

---

## 🐛 Common Issues & Fixes

### Issue: "No data available"
**Fix:** Take some email actions first, then refresh ProfileHub

### Issue: "Failed to load profile data"
**Fix:** Check console for errors, verify backend is running on port 8000

### Issue: Backend not responding
**Fix:** 
```bash
cd /workspaces/codespaces-react/floally-mvp/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Issue: Frontend not updating
**Fix:** Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: CORS errors
**Fix:** Backend should allow all origins by default, check `/api/health` endpoint

---

## 📊 Expected Results Summary

### Fresh User (First Login):
- **Overview:** 0 actions, basic profile info
- **Insights:** "Start using OkAimy..." message
- **Integrations:** Gmail + Calendar connected
- **Settings:** Complete profile from onboarding

### Active User (10+ actions):
- **Overview:** Stats populated, personalized understanding
- **Insights:** Charts filled, confidence score visible
- **Integrations:** Same as fresh user
- **Settings:** Full profile with preferences

---

## ✅ Success Criteria

**ProfileHub works if:**
- ✅ All 4 tabs load without errors
- ✅ Data displays correctly in each tab
- ✅ Can switch between tabs smoothly
- ✅ Close button returns to dashboard
- ✅ Actions taken update insights immediately
- ✅ All "Aimy" branding (not "Aime")
- ✅ Visual design is clean and professional

---

## 🎯 Browser DevTools Checklist

**Open Console (F12):**
- [ ] No red errors
- [ ] API calls successful (200 status codes)
- [ ] Data loading messages appear
- [ ] No CORS errors
- [ ] No 404s for images

**Network Tab:**
- [ ] `/api/insights/overview` returns 200
- [ ] `/api/insights/behavioral` returns 200
- [ ] `/api/user/profile` returns 200
- [ ] `/api/user/integrations` returns 200
- [ ] okaimy-pfp-01.png loads successfully
- [ ] okaimy-logo-01.png loads successfully

---

## 🚀 Production Test (After Vercel Deploy)

Visit: https://floally-mvp.vercel.app

Run the same checklist above, but also verify:
- [ ] HTTPS secure
- [ ] Fast loading
- [ ] OAuth redirects work
- [ ] Backend API calls work (Railway)
- [ ] Images load from CDN
- [ ] Mobile responsive

---

## 📝 Notes Section

**Test Date:** _______________  
**Tester:** _______________  
**Browser:** _______________  
**Issues Found:**

```
1. ____________________________________
2. ____________________________________
3. ____________________________________
```

**Overall Status:** ⬜ Pass | ⬜ Fail | ⬜ Needs Fixes

---

**Happy Testing! 🎉**

If everything works, ProfileHub is ready for users! 🚀
