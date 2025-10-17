# User Profile & Settings Hub - Design Document 🎯

**Feature:** Comprehensive User Profile System  
**Version:** 1.4.0  
**Status:** 🚀 In Development

## Vision

Create a **central hub** where users can:
1. **View their profile** - Role, preferences, goals, working style
2. **See Aime's understanding** - How Aime perceives them (from onboarding + behavior)
3. **Track behavioral insights** - What patterns Aime has learned
4. **Manage integrations** - Gmail, Microsoft, Slack, Discord, etc.
5. **Configure settings** - Notifications, AI preferences, privacy controls
6. **View activity log** - Recent actions, email stats, usage metrics

## User Profile Structure

### 1. Profile Overview
**What:** User identity and professional context

```javascript
{
  // Basic Info
  "user_id": "user@example.com",
  "display_name": "Alex Chen",
  "avatar_url": "https://...",
  "timezone": "America/Los_Angeles",
  "language": "en",
  
  // Professional Context (from onboarding)
  "role": "Creative Director",
  "company": "Acme Design Co.",
  "priorities": ["Client work", "Team collaboration", "Creative focus"],
  "decision_style": "options_with_context",
  "communication_style": "warm_friendly",
  "work_hours": {
    "start": "09:00",
    "end": "18:00",
    "timezone": "America/Los_Angeles"
  },
  
  // Goals & Preferences
  "goals": [
    "Reduce email time by 50%",
    "Never miss client emails",
    "Unsubscribe from 20+ newsletters"
  ],
  "email_goals": {
    "inbox_zero_frequency": "daily",
    "max_daily_email_time": 60,  // minutes
    "response_time_goal": 24  // hours
  }
}
```

### 2. Behavioral Insights
**What:** What Aime has learned from user actions

```javascript
{
  "learning_status": {
    "total_actions": 156,
    "days_active": 12,
    "confidence_level": "medium",  // low, medium, high (based on data volume)
    "last_updated": "2025-01-15T10:30:00Z"
  },
  
  "email_patterns": {
    "most_important_senders": [
      {
        "sender": "alice@client.com",
        "importance_score": 0.95,
        "total_emails": 23,
        "response_rate": 0.87
      }
    ],
    "newsletter_engagement": {
      "total_newsletters": 45,
      "read_rate": 0.12,
      "suggested_unsubscribes": 8
    },
    "response_patterns": {
      "average_response_time": "2.3 hours",
      "fastest_responses_to": ["alice@client.com", "boss@company.com"],
      "slowest_responses_to": ["newsletter@marketing.com"]
    }
  },
  
  "action_breakdown": {
    "marked_important": 45,
    "marked_unimportant": 23,
    "archived": 67,
    "responded": 34,
    "unsubscribed": 12,
    "trashed": 8
  }
}
```

### 3. Integrations Management
**What:** Connected services and their status

```javascript
{
  "integrations": [
    {
      "service": "gmail",
      "status": "connected",
      "connected_at": "2025-01-10T08:00:00Z",
      "email": "user@gmail.com",
      "scopes": ["gmail.readonly", "gmail.modify", "gmail.labels"],
      "health": "healthy",
      "last_sync": "2025-01-15T10:25:00Z",
      "actions": ["disconnect", "reauthorize", "manage_scopes"]
    },
    {
      "service": "google_calendar",
      "status": "connected",
      "connected_at": "2025-01-10T08:00:00Z",
      "email": "user@gmail.com",
      "scopes": ["calendar.readonly"],
      "health": "healthy",
      "last_sync": "2025-01-15T10:25:00Z"
    },
    {
      "service": "microsoft_outlook",
      "status": "not_connected",
      "available": true,
      "description": "Connect your Outlook email and calendar"
    },
    {
      "service": "slack",
      "status": "not_connected",
      "available": true,
      "description": "Get Aime notifications in Slack"
    },
    {
      "service": "discord",
      "status": "not_connected",
      "available": false,
      "coming_soon": true
    }
  ]
}
```

### 4. Settings & Preferences
**What:** User-configurable options

```javascript
{
  "ai_preferences": {
    "model": "claude-3-haiku",  // or gpt-4, gemini-pro
    "tone": "warm_friendly",
    "verbosity": "concise",  // concise, balanced, detailed
    "auto_suggestions": true,
    "confidence_threshold": 0.8  // For auto-actions
  },
  
  "notification_preferences": {
    "email_digest": {
      "enabled": true,
      "frequency": "daily",
      "time": "08:00"
    },
    "slack_notifications": {
      "enabled": false,
      "events": ["high_priority_email", "missed_deadline"]
    },
    "browser_notifications": {
      "enabled": true,
      "events": ["important_email"]
    }
  },
  
  "privacy_settings": {
    "behavioral_learning": true,
    "data_retention_days": 365,
    "share_anonymous_usage": false,
    "allow_ai_training": false
  },
  
  "email_management": {
    "unsubscribe_preference": "ask_before",
    "auto_archive_promotional": false,
    "newsletter_digest": {
      "enabled": false,
      "frequency": "weekly"
    }
  }
}
```

## UI Design: Profile Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header: User Profile                          [⚙️ Edit] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  Alex Chen                            │
│  │   Avatar     │  Creative Director @ Acme Design       │
│  │   Image      │  user@example.com                      │
│  └──────────────┘  San Francisco, CA                     │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  Navigation Tabs:                                        │
│  [Overview] [Behavioral Insights] [Integrations] [Settings]│
├─────────────────────────────────────────────────────────┤
│                                                           │
│  (Tab Content Here)                                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Tab 1: Overview
```
Your Profile
├─ Role & Priorities
│  └─ Creative Director
│  └─ Top Priorities: Client work, Team collaboration, Creative focus
│
├─ How You Work
│  └─ Decision Style: I like to see options with detailed context
│  └─ Communication: Warm & friendly
│  └─ Work Hours: 9am - 6pm PST
│
├─ Goals
│  └─ ✅ Reduce email time by 50%
│  └─ 🔄 Never miss client emails (89% accuracy)
│  └─ 🔄 Unsubscribe from 20+ newsletters (12/20 done)
│
└─ Aime's Understanding (Natural Language Summary)
   "You're a creative director who values client work and team 
    collaboration. You prefer warm, friendly interactions and like 
    to see options with context when making decisions. You work 
    9am-6pm PST and prioritize quick responses to clients."
```

### Tab 2: Behavioral Insights
```
What Aime Has Learned About You

Learning Status
├─ 156 actions tracked
├─ 12 days active
└─ Confidence: Medium (need ~50 more actions for high confidence)

Email Patterns
├─ Most Important Senders
│  └─ 🌟 alice@client.com (Importance: 95%, Response Rate: 87%)
│  └─ ⭐ boss@company.com (Importance: 89%, Response Rate: 95%)
│  └─ ⭐ sarah@team.com (Importance: 76%, Response Rate: 65%)
│
├─ Response Patterns
│  └─ Average Response Time: 2.3 hours
│  └─ Fastest Responses: Client emails (avg 45 min)
│  └─ Slowest Responses: Newsletters (avg 3 days or never)
│
├─ Newsletter Engagement
│  └─ 45 newsletter senders detected
│  └─ Read Rate: 12% (you only open 5-6 of them)
│  └─ 💡 Suggested Unsubscribes: 8 newsletters (not opened in 30+ days)
│
└─ Action Breakdown (Last 30 Days)
   └─ Chart: Important (45) | Archived (67) | Responded (34) | Unsubscribed (12)
```

### Tab 3: Integrations
```
Connected Services

✅ Gmail
   └─ Connected: user@gmail.com
   └─ Status: Healthy | Last sync: 2 minutes ago
   └─ Actions: [Disconnect] [Manage Permissions]

✅ Google Calendar
   └─ Connected: user@gmail.com
   └─ Status: Healthy | Last sync: 2 minutes ago
   └─ Actions: [Disconnect]

➕ Available Integrations

   📧 Microsoft Outlook
   └─ Connect your Outlook email and calendar
   └─ [Connect Outlook]

   💬 Slack
   └─ Get Aime notifications and summaries in Slack
   └─ [Connect Slack]

   🎮 Discord (Coming Soon)
   └─ Notify me when available

   📅 Other Calendars
   └─ iCloud, Outlook, CalDAV
   └─ [Explore Options]
```

### Tab 4: Settings
```
Settings & Preferences

AI Preferences
├─ AI Model: Claude 3 Haiku [Change]
├─ Response Tone: Warm & Friendly ✓
├─ Verbosity: Concise ✓
├─ Auto-Suggestions: Enabled ✓
└─ Confidence Threshold: 80% (for auto-actions)

Notifications
├─ Email Digest: Daily at 8:00 AM ✓
├─ Slack Notifications: Disabled
└─ Browser Notifications: Enabled for important emails ✓

Privacy & Data
├─ Behavioral Learning: Enabled ✓
├─ Data Retention: 365 days
├─ Share Anonymous Usage: Disabled
└─ [Export My Data] [Delete All Data]

Email Management
├─ Unsubscribe Preference: Ask before unsubscribing ✓
├─ Auto-Archive Promotional: Disabled
└─ Newsletter Digest: Weekly (Coming Soon)
```

## Implementation Plan

### Phase 1: Enhanced Profile Backend (THIS SESSION)

**New Endpoints:**
```python
GET  /api/profile/overview?user_email={email}
GET  /api/profile/insights?user_email={email}
GET  /api/profile/integrations?user_email={email}
GET  /api/profile/settings?user_email={email}
PUT  /api/profile/settings?user_email={email}
PUT  /api/profile/update?user_email={email}
POST /api/profile/goals?user_email={email}
```

**Files to Create:**
- `backend/app/routers/profile.py` - Profile management
- `backend/app/models/profile.py` - Pydantic models

**Files to Modify:**
- `backend/app/routers/user_profile.py` - Enhance with new fields
- `backend/app/routers/behavior.py` - Add insights generation
- `backend/app/main.py` - Register profile router

### Phase 2: Profile UI Components (THIS SESSION)

**New Components:**
```
frontend/src/pages/Profile.jsx          - Main profile page
frontend/src/components/profile/
  ├─ ProfileHeader.jsx                  - Avatar, name, role
  ├─ ProfileOverview.jsx                - Tab 1: Overview
  ├─ BehavioralInsights.jsx             - Tab 2: Insights with charts
  ├─ IntegrationsManager.jsx            - Tab 3: Connected services
  ├─ SettingsPanel.jsx                  - Tab 4: Preferences
  ├─ GoalCard.jsx                       - Individual goal tracker
  └─ InsightCard.jsx                    - Behavioral insight display
```

**Files to Modify:**
- `frontend/src/App.jsx` - Add routing to Profile page
- `frontend/src/services/api.js` - Add profile API calls
- `frontend/src/components/AllySettings.jsx` - Link to full Profile page

### Phase 3: Integration Framework (NEXT SESSION)

**OAuth Flow for New Integrations:**
```python
POST /api/integrations/connect/{service}
GET  /api/integrations/callback/{service}
POST /api/integrations/disconnect/{service}
GET  /api/integrations/status
```

**Supported Integrations:**
1. **Microsoft Outlook** (OAuth 2.0)
2. **Slack** (OAuth 2.0 + Webhooks)
3. **Discord** (OAuth 2.0 + Bot API)
4. **iCloud Calendar** (CalDAV)

### Phase 4: Goals & Tracking (FUTURE)

**Goal System:**
- Set goals (e.g., "Inbox Zero daily", "Response time < 2 hours")
- Track progress automatically
- Visual progress indicators
- Aime suggestions to achieve goals

## Database Schema (When Migrating from Files)

```sql
-- User Profiles
CREATE TABLE user_profiles (
  user_id VARCHAR(255) PRIMARY KEY,
  display_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(255),
  company VARCHAR(255),
  timezone VARCHAR(50),
  language VARCHAR(10),
  priorities JSONB,
  decision_style VARCHAR(50),
  communication_style VARCHAR(50),
  work_hours JSONB,
  goals JSONB,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Integrations
CREATE TABLE user_integrations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES user_profiles(user_id),
  service VARCHAR(50),
  status VARCHAR(20),
  connected_at TIMESTAMP,
  credentials_encrypted TEXT,
  scopes JSONB,
  metadata JSONB,
  last_sync TIMESTAMP
);

-- Goals
CREATE TABLE user_goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES user_profiles(user_id),
  goal_type VARCHAR(50),
  goal_text TEXT,
  target_value FLOAT,
  current_value FLOAT,
  unit VARCHAR(20),
  deadline DATE,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings
CREATE TABLE user_settings (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES user_profiles(user_id),
  ai_preferences JSONB,
  notification_preferences JSONB,
  privacy_settings JSONB,
  email_management JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Feature Highlights

### 1. Behavioral Insights Dashboard
- **Visual charts** showing email patterns
- **Sender importance rankings** with sparklines
- **Response time analytics** with trends
- **Newsletter engagement** with unsubscribe suggestions

### 2. Integration Health Monitoring
- **Status indicators** (healthy, warning, error)
- **Last sync times** for each service
- **Quick reauthorize** if tokens expire
- **Scope management** (add/remove permissions)

### 3. Goal Tracking
- **Progress bars** for each goal
- **Aime suggestions** to achieve goals
- **Milestone celebrations** when goals achieved
- **Adjustable targets** based on learning

### 4. Privacy Controls
- **Data export** (JSON download of all data)
- **Data deletion** (remove all behavioral data)
- **Learning toggle** (disable behavioral tracking)
- **Transparency** (see exactly what Aime knows)

## Success Metrics

**Engagement:**
- % of users who visit Profile page
- Average time spent in each tab
- Settings changed per user
- Goals created per user

**Integrations:**
- % of users with >1 integration
- Most popular integrations
- Integration health (uptime %)
- Reauthorization frequency

**Behavioral Insights:**
- Users viewing insights tab
- Actions taken based on insights
- Unsubscribes from suggested newsletters
- Goal completion rate

## Next Steps

**Immediate (This Session):**
1. ✅ Enhance `user_profile.py` with goals, preferences fields
2. ✅ Create `profile.py` router with insights endpoint
3. ✅ Build behavioral insights aggregation
4. ✅ Create Profile page with 4 tabs
5. ✅ Add navigation to Profile from header
6. ✅ Implement settings panel
7. ✅ Create integrations status view

**Next Session:**
8. OAuth framework for Microsoft/Slack
9. Integration health monitoring
10. Visual charts for behavioral data
11. Goal creation and tracking UI

---

**Let's Build It!** 🚀

Starting with backend enhancements, then UI components, finishing with full integration.
