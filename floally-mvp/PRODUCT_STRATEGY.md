# Hey Aimi - Product Strategy: Trusted AI Teammate
**Date:** December 13, 2025  
**Strategic Shift:** From "impressive AI inbox tool" to "trusted AI operational teammate"

---

## 🎯 Core Philosophy

**Every build decision must answer:**
> "Does this make Aimi feel more like a teammate who knows me and protects my day?"

**Optimize for:** Trust, calm, learning, perceived partnership  
**Not for:** Feature count, complexity, breadth

**Autonomy principles:**
- Predictable
- Reversible
- Earned through user behavior

---

## 🔴 TOP PRIORITY (Build These First)

### 1. Behavior Learning Engine (CRITICAL)
**Goal:** Aimi must visibly learn from user actions within days

**Implementation:**
- ✅ Database tables ready: `behavior_actions`, `sender_stats`
- Track all user interactions:
  - Email actions: archive, star, ignore
  - Aimi proposal responses: approve, edit, skip
  - Stand-up interactions: open, dismiss items
- Build scoring models:
  - Sender importance score (based on user actions)
  - Action confidence score (prediction accuracy)
  - Time-decay model (recent actions weighted higher)
- Feed learned preferences into:
  - Email importance ranking
  - Stand-up priority ordering
  - Suggested actions

**Acceptance Test:**
> After 3–5 days, Aimi's stand-up ordering noticeably changes based on user behavior

**Time Estimate:** 8-10 hours

---

### 2. Explicit Agency Framing (TRUST BUILDER)
**Goal:** Users always know what Aimi did vs suggests

**Implementation:**
- Add visual labels everywhere:
  - ✅ "Handled by Aimi" (green)
  - 🟡 "Suggested by Aimi" (yellow)
  - 🔵 "Needs your decision" (blue)
- Update Daily Stand-Up format with categories
- Create audit log view:
  - "Today Aimi archived 14 emails"
  - "Aimi drafted 3 replies"
  - "You approved 2 of 3 suggestions"
- Zero silent actions without visibility

**Acceptance Test:**
> User can always answer: "What did Aimi do for me today?"

**Time Estimate:** 4-6 hours

---

### 3. Save My Day – v0 (EMOTIONAL ANCHOR)
**Goal:** Single-button emotional rescue moment

**Implementation:**
- Prominent "Save My Day" button on dashboard
- On click:
  - Re-analyze current workload
  - Identify non-urgent items
  - Suggest deferring/rescheduling meetings
  - Generate simplified plan (max 3 priorities)
- Present as **proposals, not actions**
- Track user responses for learning
- Show before/after comparison

**Acceptance Test:**
> A stressed user clicks one button and feels immediate relief

**Time Estimate:** 6-8 hours

---

## 🟠 SECONDARY PRIORITY (After Top 3)

### 4. Daily Stand-Up Refinement
**Goal:** Make stand-up feel deeply personal and trustworthy

**Changes:**
- Cap to top 3–5 items (remove noise)
- Add "Why this matters" to each priority
- Improve "The One Thing" using behavior data
- Reduce verbosity (shorter, calmer)
- Adaptive tone based on workload

**Acceptance Test:**
> Stand-up feels written for me, not generated

**Time Estimate:** 4-6 hours

---

### 5. Autonomy Ladder (CONTROLLED AUTONOMY)
**Goal:** Introduce autonomy in predictable, reversible steps

**Levels:**
- **Level 0:** Suggest only (current state)
- **Level 1:** Auto-handle newsletters (requires user opt-in)
- **Level 2:** Auto-draft replies (show before sending)
- **Level 3:** Auto-archive low-priority senders (learned threshold)

**Gates:**
- Confidence score threshold
- User approval history
- Never auto-send messages (not yet)

**Safety:**
- Add "Undo" for all automated actions
- Show audit trail
- Allow easy reversal

**Acceptance Test:**
> Users feel Aimi is helpful, not risky

**Time Estimate:** 6-8 hours

---

## 🟡 SUPPORTING TASKS (Only If Time Allows)

### 6. Onboarding That Accelerates Trust
- Ask only 4–6 critical questions:
  - Maker vs manager schedule
  - Top 3 priorities
  - VIP senders (3-5 emails)
  - Preferred tone (formal/casual/balanced)
- Make skippable
- Show immediate value

**Time Estimate:** 3-4 hours

---

### 7. Subtle Feedback Loops
- Add micro-feedback:
  - ✓ "Good suggestion"
  - ✗ "Not useful"
- Use to reinforce models
- Keep UI minimal (no clutter)

**Time Estimate:** 2-3 hours

---

## 🔵 EXPLICITLY DEFER (Do Not Build)

**Deprioritized features:**
- ❌ Team collaboration
- ❌ Native mobile apps
- ❌ Advanced calendar analytics
- ❌ Deep newsletter automation
- ❌ Multiple AI providers
- ❌ Complex notification systems

**Why:** These dilute focus on core trust-building

---

## 🧠 Standing Rule for Development

**Before building anything, ask:**
> "Does this directly increase trust, calm, learning, or clarity?"

If no → Deprioritize it

---

## ✅ Success Criteria for This Phase

**You're done when:**

1. ✅ Users say "Aimi gets me"
2. ✅ Stand-ups feel personal within a week
3. ✅ Users trust Aimi's suggestions
4. ✅ Users describe Aimi as a teammate, not a tool
5. ✅ You feel confident charging $20–29/month

---

## 📋 Immediate Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. **Behavior Learning Engine** - Track and score all actions
2. **Explicit Agency Labels** - Visual clarity on who did what
3. **Save My Day Button** - Emotional rescue anchor

**Outcome:** Users see Aimi learning and trust increases

### Phase 2: Depth (Week 2)
4. **Stand-Up Refinement** - Personal, brief, relevant
5. **Autonomy Ladder** - Introduce Level 1 autonomy safely

**Outcome:** Stand-ups feel custom, Aimi starts acting

### Phase 3: Polish (Week 3)
6. **Onboarding Optimization** - Fast time-to-value
7. **Feedback Loops** - Reinforce learning

**Outcome:** New users trust Aimi quickly

---

## 🎯 Why This Matters

**Current State:**
- Impressive demo
- Feature-complete MVP
- Shows what AI can do

**Needed State:**
- Trusted teammate
- Earns autonomy through learning
- Users feel understood

**The Gap:**
- Aimi doesn't remember user preferences
- No visible learning
- Unclear what Aimi did vs suggested
- No emotional anchor for bad days

**This Strategy Closes The Gap:**
- Behavior tracking → Aimi remembers
- Agency labels → Trust through transparency
- Save My Day → Emotional connection
- Learning feedback loop → Gets better over time

---

## 💰 Business Impact

**Why this enables $20-29/month pricing:**

1. **Behavior Learning** → Increasing value over time
2. **Agency Clarity** → Users trust = willingness to pay
3. **Save My Day** → Emotional value, not just productivity
4. **Teammate Feeling** → Subscription retention (lower churn)

**Competitors offer:** AI tools  
**Hey Aimi offers:** AI teammate who knows you

**That difference is worth premium pricing.**

---

## 📊 Metrics That Matter Now

**Engagement:**
- Daily active usage
- Actions taken per session
- Return rate within 7 days

**Trust:**
- % of Aimi suggestions accepted
- Save My Day usage frequency
- User-reported "Aimi gets me" (survey)

**Learning:**
- Behavior tracking coverage
- Sender score accuracy
- Priority ranking improvement over time

**Value:**
- Self-reported time saved
- Willingness to pay (pricing survey)
- NPS score

---

## 🚀 Ready to Build

This document is the north star. Every PR should reference:
- Which top priority it addresses
- How it increases trust/calm/learning/clarity

**Let's make Aimi a teammate people trust with their day.**
