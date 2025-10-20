# Standup: The Command Center Design Spec

**Date:** October 20, 2025  
**Purpose:** Design the daily partnership interface between User and Aimy

---

## 🎯 Vision: The Daily Partnership

> "Every morning, you and Aimy sync up. She tells you the ONE thing that matters today, you confirm or adjust. Then you see what she's handling for you. Complete transparency. Total trust."

---

## 🧠 Core Concept

### The Standup is a Two-Person Team

**Person 1: You (The User)**
- Your one critical focus today
- Your status/progress
- What you need from Aimy

**Person 2: Aimy (Your AI Partner)**
- What she's working on for you
- What she's planning to handle
- What she needs your approval for

---

## 🎨 UI Layout: Split View

```
┌─────────────────────────────────────────────────────────────┐
│  🌅 Daily Standup - Monday, October 20, 2025               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────┬───────────────────────────┐ │
│  │  👤 YOUR FOCUS TODAY      │  🤖 AIMY'S WORK TODAY     │ │
│  ├───────────────────────────┼───────────────────────────┤ │
│  │                           │                           │ │
│  │  🎯 The One Thing:        │  🔄 Aimy is handling:     │ │
│  │                           │                           │ │
│  │  [Selected/Confirmed]     │  • 12 low-priority emails │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━   │    (auto-archive/reply)   │ │
│  │  📋 Finalize Q4 Budget    │                           │ │
│  │                           │  • 3 social media DMs     │ │
│  │  Why Aimy picked this:    │    (filter spam)          │ │
│  │  • Due today (5pm)        │                           │ │
│  │  • Blocks team tomorrow   │  • 2 meeting invites      │ │
│  │  • High stakeholder value │    (add to calendar)      │ │
│  │                           │                           │ │
│  │  Status: ⚪ Not Started   │  ✅ Awaiting approval:    │ │
│  │  [Mark In Progress]       │                           │ │
│  │  [Mark Complete]          │  • Unsubscribe from 5     │ │
│  │  [Switch Focus]           │    promotional lists      │ │
│  │                           │    [Approve All] [Review] │ │
│  │  ──────────────────       │                           │ │
│  │                           │  📋 Aimy's plan:          │ │
│  │  📊 Your other priorities:│                           │ │
│  │                           │  • Monitor inbox (all day)│ │
│  │  2️⃣ Review design mockups│  • Surface urgent items   │ │
│  │     (if time permits)     │  • Summarize by EOD       │ │
│  │                           │  • Prepare tomorrow's     │ │
│  │  3️⃣ Schedule team 1:1s   │    standup (tonight)      │ │
│  │     (this week)           │                           │ │
│  │                           │  💬 Need from you:        │ │
│  │  [View All Tasks]         │                           │ │
│  │                           │  • Confirm priority order │ │
│  └───────────────────────────┴───────────────────────────┘ │
│                                                             │
│  ⏰ Last sync: 2 minutes ago          [Refresh Standup]    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Component Breakdown

### LEFT PANEL: 👤 YOUR FOCUS TODAY

#### 1. The One Thing (Primary Card)
```javascript
{
  component: "TheOneThing",
  
  // Display
  title: "Finalize Q4 Budget",
  source: "Gmail - Sarah Chen <sarah@company.com>",
  dueTime: "Today at 5:00 PM",
  status: "not_started" | "in_progress" | "completed",
  
  // Aimy's reasoning
  reasoning: {
    why: [
      "Due today (5pm deadline)",
      "Blocks team's work tomorrow",
      "High stakeholder value (CFO requested)",
      "You have 3 hours free this afternoon"
    ],
    confidence: 0.95,
    alternativesConsidered: 2
  },
  
  // User actions
  actions: [
    { label: "Confirm & Start", action: "confirm_start" },
    { label: "Mark In Progress", action: "mark_progress" },
    { label: "Mark Complete", action: "mark_complete" },
    { label: "Switch Focus", action: "show_alternatives" }
  ],
  
  // Quick context
  context: {
    timeEstimate: "2-3 hours",
    relatedMessages: 5,
    linkedTask: "task_123"
  }
}
```

**Visual Design:**
- **Large card** with subtle glow/border (importance)
- **Color-coded status**:
  - ⚪ Not Started (gray)
  - 🟡 In Progress (yellow glow)
  - 🟢 Completed (green checkmark)
- **Aimy's reasoning** in italics, gentle AI avatar icon
- **Action buttons** prominent and clear
- **Progress indicator** if user marks "in progress"

#### 2. Alternative Options (If User Clicks "Switch Focus")
```javascript
{
  component: "AlternativeOptions",
  
  options: [
    {
      rank: 2,
      title: "Review design mockups",
      reasoning: "Less urgent but team is waiting",
      importance: 75,
      canDefer: true
    },
    {
      rank: 3,
      title: "Schedule team 1:1s",
      reasoning: "Important but flexible timing",
      importance: 60,
      canDefer: true
    }
  ]
}
```

**Visual Design:**
- **Modal or expanding section**
- Shows 2-3 alternatives
- Each with mini reasoning
- User can select and confirm new focus

#### 3. Secondary Priorities (Below the Fold)
```javascript
{
  component: "SecondaryPriorities",
  
  items: [
    {
      rank: 2,
      title: "Review design mockups",
      note: "(if time permits)",
      status: "optional"
    },
    {
      rank: 3,
      title: "Schedule team 1:1s",
      note: "(this week)",
      status: "optional"
    }
  ],
  
  actions: [
    { label: "View All Tasks", link: "/tasks" }
  ]
}
```

**Visual Design:**
- **Smaller, muted cards**
- Numbered (2️⃣, 3️⃣)
- "Nice to do but not critical"
- Link to full task list

---

### RIGHT PANEL: 🤖 AIMY'S WORK TODAY

#### 1. Currently Handling (Active Work)
```javascript
{
  component: "AimyActiveWork",
  
  tasks: [
    {
      category: "Email Management",
      count: 12,
      description: "Low-priority emails",
      actions: ["auto-archive", "auto-reply"],
      status: "in_progress",
      details: [
        "3 newsletters → Archive",
        "5 promotional → Archive",
        "4 automated notifications → Mark read"
      ]
    },
    {
      category: "Social Filtering",
      count: 3,
      description: "Social media DMs",
      actions: ["filter spam", "flag important"],
      status: "in_progress"
    },
    {
      category: "Calendar Management",
      count: 2,
      description: "Meeting invites",
      actions: ["add to calendar", "check conflicts"],
      status: "completed"
    }
  ]
}
```

**Visual Design:**
- **Grouped by category**
- **Progress indicators** (🔄 in progress, ✅ done)
- **Expandable details** - click to see what emails/messages
- **Real-time updates** - "Just handled: Newsletter from Medium"

#### 2. Awaiting Your Approval (Needs Confirmation)
```javascript
{
  component: "AimyNeedsApproval",
  
  approvals: [
    {
      id: "approval_001",
      type: "bulk_unsubscribe",
      title: "Unsubscribe from 5 promotional lists",
      reasoning: "You haven't opened these in 3 months",
      impact: "Will reduce inbox noise by ~15 emails/week",
      items: [
        "Marketing Newsletter A",
        "Promotional Emails B",
        "Weekly Digest C",
        "Sale Alerts D",
        "Product Updates E"
      ],
      actions: [
        { label: "Approve All", action: "approve_all" },
        { label: "Review Each", action: "review_individual" },
        { label: "Reject", action: "reject" }
      ],
      urgency: "low"
    },
    {
      id: "approval_002",
      type: "auto_reply_template",
      title: "New auto-reply template for common question",
      reasoning: "You've answered this same question 8 times",
      preview: "Hi! Thanks for reaching out. Here's the document...",
      actions: [
        { label: "Approve & Use", action: "approve" },
        { label: "Edit Template", action: "edit" },
        { label: "Reject", action: "reject" }
      ],
      urgency: "medium"
    }
  ]
}
```

**Visual Design:**
- **Yellow/orange highlight** - needs attention
- **Clear approval buttons**
- **Reasoning always visible** - transparency
- **Expandable details** - see full impact
- **Urgency indicator**:
  - 🔴 High: Blocking Aimy's work
  - 🟡 Medium: Would be helpful today
  - 🟢 Low: Can wait

#### 3. Aimy's Daily Plan (Ongoing Work)
```javascript
{
  component: "AimyDailyPlan",
  
  plan: [
    {
      task: "Monitor inbox",
      frequency: "continuous",
      description: "Watching for urgent/important messages",
      status: "active"
    },
    {
      task: "Surface urgent items",
      frequency: "as_needed",
      description: "Alert you if something critical arrives",
      status: "active"
    },
    {
      task: "End-of-day summary",
      scheduledTime: "5:00 PM",
      description: "Summary of what I handled + tomorrow preview",
      status: "scheduled"
    },
    {
      task: "Prepare tomorrow's standup",
      scheduledTime: "11:00 PM",
      description: "Analyze overnight messages, plan tomorrow",
      status: "scheduled"
    }
  ]
}
```

**Visual Design:**
- **Timeline view** or simple list
- **Status badges** (🟢 Active, ⏰ Scheduled, ✅ Done)
- **Muted colors** - informational, not actionable
- **Builds trust** - "I'm working even when you're not looking"

#### 4. Needs From You (Requests)
```javascript
{
  component: "AimyNeedsFromYou",
  
  requests: [
    {
      type: "clarification",
      question: "Which client email is higher priority?",
      context: "Both marked urgent, need to know your preference",
      options: ["Client A", "Client B", "Both equal"],
      urgency: "medium"
    },
    {
      type: "permission",
      request: "Grant access to calendar for better scheduling",
      reasoning: "Would help avoid meeting conflicts",
      urgency: "low"
    }
  ]
}
```

**Visual Design:**
- **Question mark icon** or similar
- **Clear ask** with context
- **Easy to respond** (buttons/quick reply)
- **Optional but helpful** - never blocks user

---

## 🎯 Key User Flows

### Flow 1: Morning Standup
```
1. User opens OkAimy
2. Standup loads automatically (is default view)
3. User sees: "Your One Thing: Finalize Q4 Budget"
4. Reads Aimy's reasoning (2 seconds)
5. Clicks "Confirm & Start"
6. Status changes to 🟡 In Progress
7. Aimy updates her plan to support this focus
8. User goes to Inbox to tackle the task
```

### Flow 2: User Wants Different Focus
```
1. User clicks "Switch Focus"
2. Sees 2 alternatives with reasoning
3. Selects "Review design mockups" instead
4. Confirms switch
5. Aimy updates: "Got it! I'll keep 'Budget' warm for later"
6. The One Thing updates to new choice
7. Aimy adjusts her supporting work
```

### Flow 3: Checking Aimy's Progress
```
1. User is working on their One Thing
2. Glances at right panel
3. Sees: "Aimy just handled: 3 promotional emails"
4. Feels reassured - inbox under control
5. Continues focused work
6. Doesn't need to check email manually
```

### Flow 4: Approving Aimy's Work
```
1. Aimy requests: "Unsubscribe from 5 lists?"
2. User clicks "Review Each"
3. Sees list, confirms all are junk
4. Clicks "Approve All"
5. Aimy unsubscribes immediately
6. User sees confirmation: "Done! 5 lists unsubscribed"
7. Approval request disappears
```

### Flow 5: Completing The Day
```
1. User finishes the One Thing
2. Clicks "Mark Complete"
3. 🎉 Celebration animation
4. Aimy: "Great work! I'll summarize your day at 5pm"
5. User can see secondary priorities or close app
6. At 5pm: notification with day summary
```

---

## 📊 Data Requirements

### What Aimy Needs to Build Standup

```javascript
{
  // From all channels (Gmail, Slack, etc.)
  messages: {
    unread: 47,
    important: 12,
    urgent: 3,
    byChannel: {...},
    topSenders: [...]
  },
  
  // From calendar
  schedule: {
    today: [
      { time: "9am", event: "Team standup", duration: 30 },
      { time: "2pm", event: "Client call", duration: 60 }
    ],
    freeBlocks: [
      { start: "10am", end: "2pm", duration: 240 }
    ]
  },
  
  // From task list
  tasks: {
    overdue: 2,
    dueToday: 5,
    dueThisWeek: 12,
    highPriority: [...]
  },
  
  // From user behavior
  userContext: {
    workingHours: { start: "9am", end: "6pm" },
    focusPreferences: ["morning deep work", "afternoon meetings"],
    energyPatterns: { peak: "10am-12pm", low: "2pm-3pm" },
    averageTaskTime: { email: 5, docs: 30, calls: 45 }
  },
  
  // Aimy's AI analysis
  aiInsights: {
    priorityScore: { task_123: 95, task_456: 78, ... },
    urgencyReasons: [...],
    dependencies: { task_123: { blocks: [task_456] } },
    recommendations: {
      theOneThing: "task_123",
      reasoning: [...],
      confidence: 0.95
    }
  }
}
```

---

## 🎨 Visual Design System

### Colors
- **User focus (left)**: Cool blues/purples (calm, focused)
- **Aimy's work (right)**: Warm teal/greens (active, supportive)
- **Approvals**: Yellow/orange (attention needed)
- **Completions**: Green (celebration)
- **Status indicators**:
  - ⚪ Not Started: Gray
  - 🟡 In Progress: Yellow glow
  - 🟢 Complete: Green checkmark
  - 🔴 Blocked: Red warning

### Typography
- **One Thing title**: Large, bold, 24px
- **Reasoning**: Italic, slightly smaller, 14px
- **Aimy's tasks**: Regular, 16px
- **Details**: Muted gray, 12px

### Icons
- 👤 User
- 🤖 Aimy
- 🎯 The One Thing
- 🔄 In Progress
- ✅ Complete
- ⏰ Scheduled
- ❓ Needs clarification
- 🔔 Alert/urgent

### Spacing
- **Split view**: 50/50 on desktop, stacked on mobile
- **Cards**: Generous padding (24px)
- **Sections**: Clear separation (32px gap)
- **Breathing room**: Not cramped, calm interface

---

## 📱 Responsive Design

### Desktop (1920px+)
```
[ 50% User Focus | 50% Aimy's Work ]
Side-by-side, equal weight
```

### Tablet (768px - 1920px)
```
[ 60% User Focus | 40% Aimy's Work ]
User focus slightly larger
```

### Mobile (<768px)
```
┌─────────────────┐
│  👤 Your Focus  │
├─────────────────┤
│  [The One Thing]│
│  [Secondary]    │
└─────────────────┘
        ↓ Swipe/Scroll
┌─────────────────┐
│  🤖 Aimy's Work │
├─────────────────┤
│  [Active Tasks] │
│  [Approvals]    │
└─────────────────┘
```
Stacked vertically, swipe between sections

---

## 🧪 Testing Scenarios

### Test 1: Clear Priority
- **Given**: 1 urgent email, 10 low-priority
- **Expected**: Aimy picks urgent email as One Thing
- **Reasoning**: Due today, from boss, blocks team

### Test 2: Multiple Urgent
- **Given**: 3 urgent emails, all due today
- **Expected**: Aimy picks highest impact (stakeholder value)
- **Reasoning**: Shows alternatives, explains tie-breaking

### Test 3: Nothing Urgent
- **Given**: All messages low-priority
- **Expected**: Aimy suggests: "Catch up day! Clear backlog or take it easy"
- **Reasoning**: Not every day needs a crisis

### Test 4: User Override
- **Given**: Aimy picks Task A, user switches to Task B
- **Expected**: Aimy accepts, adjusts plan accordingly
- **Learning**: Next time, factors in user preference

### Test 5: Real-time Updates
- **Given**: Urgent email arrives during day
- **Expected**: Aimy alerts, offers to change One Thing
- **User**: Can accept or defer

### Test 6: Aimy Blocked
- **Given**: Aimy needs approval for 3 actions
- **Expected**: Clear list in Approvals section
- **User**: Can bulk approve, review individually, or reject

---

## 🚀 Implementation Plan

### Phase 1: Basic Split View (Week 1)
- [ ] Create Standup component structure
- [ ] Implement left panel (Your Focus)
- [ ] Implement right panel (Aimy's Work)
- [ ] Mock data for testing
- [ ] Responsive layout

### Phase 2: The One Thing Logic (Week 2)
- [ ] AI analysis endpoint: `/api/standup/analyze`
- [ ] Priority scoring algorithm
- [ ] Reasoning generation
- [ ] Alternative options logic
- [ ] User confirmation flow

### Phase 3: Aimy's Work Panel (Week 2-3)
- [ ] Active work tracking
- [ ] Approval system
- [ ] Daily plan scheduler
- [ ] Real-time updates
- [ ] Completion tracking

### Phase 4: Integration (Week 3)
- [ ] Connect to Gmail API
- [ ] Connect to calendar
- [ ] Connect to task system
- [ ] User behavior tracking
- [ ] Learning algorithm

### Phase 5: Polish (Week 4)
- [ ] Animations & transitions
- [ ] Celebration moments
- [ ] Notifications
- [ ] Performance optimization
- [ ] Mobile optimization

---

## 🎯 Success Metrics

**We'll know Standup works when:**
- ✅ Users check it FIRST every morning
- ✅ 90%+ agree with Aimy's One Thing pick
- ✅ Users feel "in control" even when Aimy handles 50+ items
- ✅ Approval rate >80% (means Aimy's learning well)
- ✅ Users report: "I trust Aimy completely"
- ✅ Time-to-focus: <30 seconds from open to working
- ✅ Users complete 2x more important tasks per week

---

## 💡 Future Enhancements

### Advanced Features (Post-MVP)
- **Voice interaction**: "Hey Aimy, what's my focus today?"
- **Team standup**: See team members' priorities
- **Weekly planning**: Not just daily, but weekly goals
- **Learning dashboard**: How Aimy's accuracy improves
- **Integration actions**: "Start timer for One Thing"
- **Smart breaks**: Aimy suggests when to take breaks
- **Energy optimization**: Schedule hard tasks at peak energy times

---

## 🎬 Next Steps

1. **Review this spec** - Does it match your vision?
2. **Refine the layout** - Any changes to split view?
3. **Build the component** - Start with static version
4. **Connect to backend** - AI analysis endpoint
5. **Test with real data** - Your actual Gmail
6. **Iterate based on feel** - Does it build trust?

---

**This is the heart of OkAimy.** Get Standup right, and everything else falls into place! 💪

Ready to start building? 🚀
