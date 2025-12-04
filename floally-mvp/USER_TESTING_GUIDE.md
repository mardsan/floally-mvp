# User Testing Guide - Sprint 1 Features
**Your Mission:** Test the new Activity Logging and Sub-tasks features  
**Time:** 30-45 minutes  
**What You'll Test:** Real features on www.okaimy.com

---

## 🎯 BEFORE YOU START

### What You Need:
- ✅ Access to www.okaimy.com (logged in)
- ✅ Your email address handy (for checking logs)
- ✅ Browser with DevTools (Chrome/Edge recommended)
- ✅ This guide open on the side

### What We're Testing:
1. **Activity Logging** - Does the app track what you do?
2. **Sub-tasks** - Do tasks within projects save correctly?
3. **Performance** - Does everything feel smooth?

### Important Notes:
- **Do real actions** - click, type, toggle things naturally
- **Don't rush** - take your time with each step
- **Note anything weird** - even small glitches matter
- **Have fun** - this is your app, make it work for you!

---

## 📋 TEST SESSION STRUCTURE

**Follow this order:**
1. Backend Check (I'll do this part) - 5 min
2. Projects & Sub-tasks - 10 min
3. Dashboard & Standup - 10 min
4. Email/Messages - 10 min
5. Performance Check - 5 min

Let's go! 🚀

---

## 🧪 TEST 1: PROJECTS & SUB-TASKS
**Goal:** Test project creation and sub-task completion tracking

### Step 1: Create a New Project
1. Go to www.okaimy.com and login
2. Click on **"Projects"** in the navigation
3. Click **"New Project"** button
4. Fill in these details:
   - **Name:** "Test Project - Dec 4"
   - **Description:** "Testing activity logging and sub-tasks"
   - **Priority:** High
   - **Status:** Active
5. Click **"Add Goal"** and enter:
   - **Goal:** "Complete user testing"
   - **Deadline:** Pick any date next week
6. Click **"Save Project"**

**✅ What to Check:**
- [ ] Project appears in your project list
- [ ] Project card shows the name and priority
- [ ] No errors or weird behavior

**📝 Notes:** (Write anything unusual you see)
```
_______________________________________________________
```

---

### Step 2: Use AI Wizard (Test AI-Generated Sub-tasks)
1. Click **"New Project"** again
2. This time, click **"AI Wizard"** (the magic wand)
3. Type this description:
   ```
   Launch a new feature for OkAimy that helps users
   track their daily habits and build better routines
   ```
4. Click **"Generate Project Plan"**
5. Wait for Aimy to generate goals and sub-tasks
6. Review what was generated

**✅ What to Check:**
- [ ] Aimy generates 3-5 goals
- [ ] Each goal has sub-tasks underneath
- [ ] Sub-tasks have estimated hours
- [ ] Everything looks organized and makes sense

**📝 Notes:**
```
How many goals generated? ____
How many sub-tasks per goal? ____
Does it make sense? Yes / No
Any issues? _______________________________________
```

7. Click **"Save Project"** to keep it

---

### Step 3: Work with Sub-tasks
1. Find your newly created AI project
2. Click on it to open the details
3. You should see goals with **arrow icons (▶)** next to them
4. Click an arrow to **expand** the sub-tasks
5. You'll see checkboxes next to each sub-task

**Now mark some tasks complete:**
6. Click **3 different checkboxes** (mark tasks as done)
7. Watch the percentage update
8. Click **"Save Changes"**

**✅ What to Check:**
- [ ] Checkboxes actually check when clicked
- [ ] Completion percentage updates (e.g., "2/5 tasks completed")
- [ ] Arrow changes between ▶ and ▼ when expanding/collapsing
- [ ] Saving works without errors

**📝 Notes:**
```
Did checkboxes work smoothly? Yes / No
Did percentage update instantly? Yes / No
Any lag or delays? _________________________________
```

---

### Step 4: Test Persistence (Important!)
1. Close the project modal
2. **Refresh the entire page** (F5 or Cmd+R)
3. Wait for page to reload
4. Find your project again and open it
5. Expand the sub-tasks

**✅ What to Check:**
- [ ] Previously checked tasks are still checked ✓
- [ ] Completion percentage matches what you had
- [ ] Nothing was lost or reset
- [ ] Sub-tasks look exactly as you left them

**📝 Notes:**
```
Did everything persist? Yes / No
Any tasks unchecked themselves? Yes / No
Issues? ____________________________________________
```

---

## 🎯 TEST 2: DASHBOARD & STANDUP
**Goal:** Test status tracking and daily standup features

### Step 1: View Your Dashboard
1. Click **"Dashboard"** in the navigation
2. Look for the **"Daily Stand-Up"** section
3. Find **"The One Thing"** card (your main focus today)

**✅ What to Check:**
- [ ] Dashboard loads without errors
- [ ] You see "The One Thing" recommendation
- [ ] Projects preview shows (if you have projects)
- [ ] Everything looks organized

**📝 Notes:**
```
What's your "One Thing" today? _____________________
Does it make sense for you? Yes / No
```

---

### Step 2: Change Status of "One Thing"
1. Find the **status dropdown** on "The One Thing" card
2. Currently says something like "Preparing" or "Not Started"
3. **Change it to:** "In Progress"
4. Wait 2 seconds
5. **Change it again to:** "Completed"
6. Watch for any visual feedback

**✅ What to Check:**
- [ ] Dropdown responds when clicked
- [ ] Status changes smoothly
- [ ] No errors in the corner of screen
- [ ] Card updates to reflect new status

**📝 Notes:**
```
Did status changes feel instant? Yes / No
Any delays or loading spinners? ____________________
Visual feedback clear? Yes / No
```

---

### Step 3: Generate Fresh Standup (If Available)
1. Look for a **"Regenerate"** or **"Refresh Standup"** button
2. If you see it, click it
3. Wait for new standup to generate
4. Review the new "One Thing" Aimy suggests

**✅ What to Check:**
- [ ] Button works (if present)
- [ ] Loading indicator appears
- [ ] New standup loads within 3-5 seconds
- [ ] New recommendations make sense

**📝 Notes:**
```
Did it regenerate successfully? Yes / No / Not Available
Time taken: _____ seconds
New suggestion better? Yes / No / Same
```

---

## 📧 TEST 3: EMAIL/MESSAGES
**Goal:** Test email interaction tracking

### Step 1: Open Some Emails
1. Go to **"Messages"** or **"Inbox"** section
2. You should see a list of emails
3. **Click on 3 different emails** to open them
4. Read (or skim) each one
5. Close each email modal

**✅ What to Check:**
- [ ] Emails open smoothly when clicked
- [ ] Detail modal shows full email content
- [ ] Closing modal returns to list
- [ ] No lag or stuttering

**📝 Notes:**
```
Email opens feel smooth? Yes / No
Any loading delays? ________________________________
Modal animations work? Yes / No
```

---

### Step 2: Switch Between Categories
1. Look at the **category tabs** at top: All, Primary, Social, Promotions
2. Click **"Primary"** tab
3. Wait for emails to filter
4. Click **"Social"** tab
5. Click **"Promotions"** tab
6. Click back to **"All"**

**✅ What to Check:**
- [ ] Tabs respond immediately when clicked
- [ ] Emails filter to correct category
- [ ] Active tab is visually highlighted
- [ ] No errors during switching

**📝 Notes:**
```
Category switching smooth? Yes / No
Correct emails in each category? Yes / No
Any missing emails? ________________________________
```

---

## ⚡ TEST 4: PERFORMANCE & FEEL
**Goal:** Make sure app is fast and responsive

### Step 1: Rapid Interaction Test
Do these actions **as fast as you can** (go wild!):

1. Toggle 10 sub-task checkboxes rapidly (check/uncheck)
2. Switch between 5 different category tabs quickly
3. Open and close 5 project modals in succession
4. Change "One Thing" status 3 times quickly

**✅ What to Check:**
- [ ] App keeps up with your clicks
- [ ] No noticeable lag or freezing
- [ ] Animations don't stutter
- [ ] Everything feels "instant"

**📝 Notes:**
```
Overall responsiveness: Great / Good / OK / Slow
Any lag noticed? Where? ____________________________
Did anything freeze? _______________________________
Rate the speed: 1-10: _____
```

---

### Step 2: Open Browser DevTools (Quick Check)
1. Press **F12** (or Right-click → Inspect)
2. Click **"Console"** tab
3. Look for any **red error messages**
4. Scroll through the last ~20 messages

**✅ What to Check:**
- [ ] No red error messages (red is bad!)
- [ ] Mostly blue info messages (blue is fine)
- [ ] No "Failed to fetch" errors
- [ ] No "undefined" or "null" errors

**📝 Notes:**
```
Console errors? Yes / No
If yes, copy one here: _____________________________
_____________________________________________________
```

---

### Step 3: Network Activity Check
1. In DevTools, click **"Network"** tab
2. Do 5 sub-task toggles
3. Watch for activity in the Network panel
4. Look for requests to "activity" or "events"

**✅ What to Check:**
- [ ] Events are NOT sent after EVERY action
- [ ] Instead, one batch request after ~5-10 actions
- [ ] Request shows as "200 OK" (green)
- [ ] Response is fast (under 500ms)

**📝 Notes:**
```
Events batched together? Yes / No
Single request for multiple events? Yes / No
Any failed requests (red)? _________________________
```

---

## 🎨 TEST 5: VISUAL & UX POLISH

### Quick Visual Inspection
Go through each section and check:

**Projects Page:**
- [ ] Colors look good (no clashing)
- [ ] Text is readable
- [ ] Buttons are clear what they do
- [ ] Icons make sense

**Dashboard:**
- [ ] Layout is organized
- [ ] Cards are visually appealing
- [ ] "One Thing" stands out
- [ ] Not too crowded

**Messages:**
- [ ] Email list is scannable
- [ ] Categories are distinct
- [ ] Important emails stand out
- [ ] Easy to find what you need

**📝 General UX Notes:**
```
Best part of the new features? _____________________
_____________________________________________________

Most confusing part? _______________________________
_____________________________________________________

What would you change? _____________________________
_____________________________________________________

Favorite new thing? ________________________________
```

---

## 📱 BONUS: MOBILE TESTING (If You Have Time)

### On Your iPhone:
1. Open www.okaimy.com in Safari
2. Try completing 2-3 sub-tasks
3. Change "One Thing" status
4. Open a few emails

**✅ What to Check:**
- [ ] Touch targets easy to tap
- [ ] No accidental clicks
- [ ] Modals work on mobile
- [ ] Text is readable

**📝 Mobile Notes:**
```
Works well on mobile? Yes / No
Any issues? ________________________________________
Better on desktop or mobile? _______________________
```

---

## ✅ FINAL SUMMARY

### Overall Experience
Rate from 1-10 (10 = perfect):

- **Projects & Sub-tasks:** _____ / 10
- **Dashboard & Standup:** _____ / 10  
- **Email/Messages:** _____ / 10
- **Overall Speed:** _____ / 10
- **Visual Design:** _____ / 10

### Most Important Findings

**Top 3 Things That Work Great:**
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

**Top 3 Issues Found:**
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

**Would You Use These Features Daily?**
```
Yes / No / Maybe

Why or why not? ____________________________________
_____________________________________________________
_____________________________________________________
```

---

## 🐛 BUG REPORTING FORMAT

If you found any bugs, use this template:

**Bug #1:**
- **Where:** (e.g., Projects page, sub-task checkboxes)
- **What happened:** (what you saw)
- **Expected:** (what should happen)
- **Can reproduce?** Yes / No
- **Severity:** Critical / High / Medium / Low

**Bug #2:**
- **Where:** ________________________________________
- **What happened:** ________________________________
- **Expected:** _____________________________________
- **Can reproduce?** Yes / No
- **Severity:** Critical / High / Medium / Low

---

## 🎉 YOU'RE DONE!

**Great job testing!** 

Your feedback is incredibly valuable. Send me:
1. This completed guide with your notes
2. Any screenshots of issues
3. Your top 3 findings (good or bad)

**What's Next:**
I'll review your findings alongside my backend tests, and we'll:
- Fix any critical bugs immediately
- Prioritize improvements based on your feedback
- Plan the next sprint features

Thank you for being an awesome tester! 🙏

---

**Questions while testing?** Just message me!  
**Found something urgent?** Let me know ASAP!

**Test Date:** December 4, 2025  
**Tester:** _________________  
**Time Started:** _______  
**Time Finished:** _______  
**Total Time:** _______ minutes
