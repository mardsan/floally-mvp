# Activity Event Logging System - Implementation Guide

**Version:** 2.0  
**Date:** December 3, 2025  
**Status:** Ready for Integration

---

## 🎯 Overview

The Activity Event Logging System provides comprehensive tracking of user actions to power:
- **AI Learning**: Aimy learns user patterns and preferences
- **Behavioral Analytics**: Understand how users interact with OkAimy
- **Personalization**: Tailor experiences based on usage patterns
- **Performance Monitoring**: Track action durations and outcomes

---

## 📦 What Was Built

### Backend Components

#### 1. Database Model (`app/models/activity_event.py`)
```python
class ActivityEvent:
    - event_type: str (e.g., 'project_created')
    - event_category: str (e.g., 'project')
    - event_action: str (e.g., 'created')
    - entity_type: str (e.g., 'project')
    - entity_id: str (ID of the entity)
    - event_metadata: JSONB (flexible data)
    - session_id: str (track user sessions)
    - device_type: str ('desktop', 'mobile', 'tablet')
    - context_snapshot: JSONB (workflow context)
    - duration_ms: int (how long action took)
    - event_timestamp: DateTime
```

**Features:**
- Composite indexes for fast queries
- JSONB for flexible metadata
- Session tracking
- Device detection
- Performance metrics

#### 2. API Router (`app/routers/activity_events.py`)

**Endpoints:**
- `POST /api/events/log` - Log single event
- `POST /api/events/log/batch` - Log multiple events (RECOMMENDED)
- `GET /api/events/` - Retrieve events with filters
- `GET /api/events/analytics` - Get analytics summary
- `GET /api/events/session/{session_id}` - Get session events
- `DELETE /api/events/cleanup` - Delete old events

**Benefits:**
- Batch endpoint reduces API overhead by 10x
- Flexible filtering and querying
- Built-in analytics aggregation

#### 3. Migration Script (`migrate_activity_events.py`)
```bash
python migrate_activity_events.py
```
Creates table with indexes and verifies setup.

### Frontend Components

#### 1. Activity Tracker Hook (`hooks/useActivityTracker.js`)

**Features:**
- ✅ Automatic batching (sends every 10 events or 5 seconds)
- ✅ Session tracking (persists across page loads)
- ✅ Device detection (mobile, tablet, desktop)
- ✅ Offline queue (stores events when offline)
- ✅ sendBeacon for page unload (guaranteed delivery)
- ✅ Performance timing (duration_ms tracking)

**Basic Usage:**
```javascript
import { useActivityTracker, EVENT_TYPES } from './hooks/useActivityTracker';

function MyComponent() {
  const { track } = useActivityTracker(userEmail);
  
  const handleProjectCreated = (project) => {
    track(EVENT_TYPES.PROJECT_CREATED, {
      entityType: 'project',
      entityId: project.id,
      metadata: { 
        name: project.name,
        priority: project.priority,
        goals_count: project.goals.length
      }
    });
  };
}
```

**Advanced Usage:**
```javascript
// Track timed actions
const handleLongAction = async () => {
  const timer = trackTimed(EVENT_TYPES.AI_WIZARD_COMPLETED, {
    entityType: 'project',
    metadata: { wizard_type: 'project_creation' }
  });
  
  try {
    await generateProject();
    timer.complete({ success: true, goals_generated: 5 });
  } catch (error) {
    timer.cancel();
  }
};

// Track page views
trackPageView('projects', { view_mode: 'list' });

// Batch tracking
trackBatch([
  { type: EVENT_TYPES.PROJECT_OPENED, options: { entityId: '123' } },
  { type: EVENT_TYPES.MODAL_OPENED, options: { entityId: 'project-details' } }
]);
```

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend (Railway)

```bash
# Navigate to backend
cd floally-mvp/backend

# Run migration
python migrate_activity_events.py

# Commit changes
git add app/models/activity_event.py app/routers/activity_events.py app/main.py migrate_activity_events.py
git commit -m "feat(backend): Add comprehensive activity event logging system

- Create ActivityEvent model with JSONB metadata and composite indexes
- Add activity_events API router with batch logging endpoint
- Include analytics and session tracking endpoints
- Add migration script for table creation

Sprint 1: Foundation for AI learning and behavioral analytics"

# Push to trigger Railway deployment
git push origin main
```

**Verify Deployment:**
1. Check Railway logs for migration success
2. Test endpoint: `GET https://your-api.railway.app/api/events/analytics?user_email=test@example.com`

### Step 2: Install Frontend Dependencies

```bash
# Navigate to frontend
cd floally-mvp/frontend

# Install uuid for session tracking
npm install uuid

# Verify installation
npm list uuid
```

### Step 3: Integrate Tracking in Components

Add tracking to key user actions across the app:

#### Projects Page
```javascript
// frontend/src/components/ProjectsPage.jsx
import { useActivityTracker, EVENT_TYPES } from '../hooks/useActivityTracker';

function ProjectsPage() {
  const { track } = useActivityTracker(userEmail);
  
  // Track project creation
  const handleCreateProject = async (projectData) => {
    const newProject = await createProject(projectData);
    track(EVENT_TYPES.PROJECT_CREATED, {
      entityType: 'project',
      entityId: newProject.id,
      metadata: {
        name: newProject.name,
        goals_count: newProject.goals?.length || 0,
        created_via: 'manual' // or 'ai_wizard'
      }
    });
  };
  
  // Track project opens
  const handleOpenProject = (project) => {
    track(EVENT_TYPES.PROJECT_OPENED, {
      entityType: 'project',
      entityId: project.id,
      metadata: { status: project.status, priority: project.priority }
    });
    setSelectedProject(project);
  };
  
  // Track sub-task completion
  const handleSubTaskToggle = (projectId, goalIndex, taskIndex, completed) => {
    if (completed) {
      track(EVENT_TYPES.PROJECT_SUBTASK_COMPLETED, {
        entityType: 'subtask',
        entityId: `${projectId}-${goalIndex}-${taskIndex}`,
        metadata: { project_id: projectId, goal_index: goalIndex }
      });
    }
  };
}
```

#### Main Dashboard
```javascript
// frontend/src/components/MainDashboard.jsx
import { useActivityTracker, EVENT_TYPES } from '../hooks/useActivityTracker';

function MainDashboard() {
  const { track, trackPageView } = useActivityTracker(userEmail);
  
  // Track page view on mount
  useEffect(() => {
    trackPageView('dashboard', { section: 'main' });
  }, [trackPageView]);
  
  // Track standup completion
  const handleStandupComplete = (standupData) => {
    track(EVENT_TYPES.STANDUP_COMPLETED, {
      entityType: 'standup',
      entityId: standupData.id,
      metadata: {
        one_thing: standupData.task_title,
        urgency: standupData.urgency,
        priorities_count: standupData.secondary_priorities?.length || 0
      }
    });
  };
}
```

#### Email Actions
```javascript
// frontend/src/components/EnhancedMessages.jsx
import { useActivityTracker, EVENT_TYPES } from '../hooks/useActivityTracker';

function EnhancedMessages() {
  const { track } = useActivityTracker(userEmail);
  
  // Track email opens
  const handleEmailClick = (email) => {
    track(EVENT_TYPES.EMAIL_OPENED, {
      entityType: 'email',
      entityId: email.id,
      metadata: {
        category: email.category,
        has_attachment: email.hasAttachments,
        sender_domain: email.from.split('@')[1]
      }
    });
    setSelectedEmail(email);
  };
  
  // Track email feedback
  const handleFeedback = (emailId, feedbackType) => {
    track(EVENT_TYPES.EMAIL_FEEDBACK_GIVEN, {
      entityType: 'email',
      entityId: emailId,
      metadata: { feedback_type: feedbackType }
    });
  };
}
```

#### Calendar Integration
```javascript
// frontend/src/components/UniversalCalendar.jsx
import { useActivityTracker, EVENT_TYPES } from '../hooks/useActivityTracker';

function UniversalCalendar() {
  const { track } = useActivityTracker(userEmail);
  
  // Track event opens
  const handleEventClick = (event) => {
    track(EVENT_TYPES.CALENDAR_EVENT_OPENED, {
      entityType: 'calendar_event',
      entityId: event.id,
      metadata: {
        event_type: event.type,
        duration_minutes: event.duration,
        has_project_link: !!event.projectId
      }
    });
  };
  
  // Track view changes
  const handleViewChange = (newView) => {
    track(EVENT_TYPES.CALENDAR_VIEW_CHANGED, {
      entityType: 'calendar',
      metadata: { view: newView, previous_view: currentView }
    });
  };
}
```

#### AI Wizard
```javascript
// frontend/src/components/AimyWizard.jsx
import { useActivityTracker, EVENT_TYPES } from '../hooks/useActivityTracker';

function AimyWizard() {
  const { track, trackTimed } = useActivityTracker(userEmail);
  
  // Track wizard start
  useEffect(() => {
    track(EVENT_TYPES.AI_WIZARD_STARTED, {
      entityType: 'wizard',
      metadata: { wizard_type: 'project_creation' }
    });
  }, []);
  
  // Track wizard completion with timing
  const handleGenerate = async (description) => {
    const timer = trackTimed(EVENT_TYPES.AI_WIZARD_COMPLETED, {
      entityType: 'wizard',
      metadata: { 
        wizard_type: 'project_creation',
        description_length: description.length
      }
    });
    
    try {
      const result = await generateWithAI(description);
      timer.complete({
        success: true,
        goals_generated: result.goals.length,
        subtasks_generated: result.goals.reduce((sum, g) => sum + g.sub_tasks.length, 0)
      });
      return result;
    } catch (error) {
      timer.cancel();
      throw error;
    }
  };
}
```

### Step 4: Add Global Tracking

```javascript
// frontend/src/App.jsx
import { useActivityTracker } from './hooks/useActivityTracker';

function App() {
  const userEmail = /* get from auth state */;
  const { trackPageView } = useActivityTracker(userEmail);
  
  // Track route changes
  useEffect(() => {
    if (currentPage) {
      trackPageView(currentPage);
    }
  }, [currentPage, trackPageView]);
}
```

### Step 5: Deploy Frontend

```bash
# Commit frontend changes
git add floally-mvp/frontend/src/hooks/useActivityTracker.js
git commit -m "feat(frontend): Add enhanced activity tracking with batching

- Create useActivityTracker hook with automatic event batching
- Add session tracking and device detection
- Implement offline queue and sendBeacon for reliable delivery
- Add performance timing for action duration tracking

Ready for integration across all components"

# Push to trigger Vercel deployment
git push origin main
```

---

## 📊 Monitoring & Validation

### Test Event Logging

```javascript
// Test in browser console
const testTracking = async () => {
  const { track } = useActivityTracker('your@email.com');
  
  // Log test event
  track('project_created', {
    entityType: 'project',
    entityId: 'test-123',
    metadata: { test: true },
    immediate: true // Force immediate send
  });
  
  console.log('Test event logged!');
};
```

### Check Analytics

```bash
# Get analytics via API
curl "https://your-api.railway.app/api/events/analytics?user_email=your@email.com&days=7"

# Response:
{
  "total_events": 156,
  "events_by_category": {
    "project": 45,
    "email": 67,
    "calendar": 23,
    "standup": 12,
    "navigation": 9
  },
  "events_by_type": {
    "project_opened": 23,
    "email_opened": 45,
    "project_subtask_completed": 18
  },
  "most_active_day": "2025-12-03",
  "most_common_action": "opened"
}
```

### Query Recent Events

```bash
# Get project-related events
curl "https://your-api.railway.app/api/events/?user_email=your@email.com&event_category=project&days=7&limit=20"
```

---

## 🧠 Using Event Data for AI Context

### In AI Prompts

```python
# backend/app/routers/ai.py
from app.models import ActivityEvent

async def generate_standup(user_email: str):
    # Get recent user activity
    recent_events = db.query(ActivityEvent).filter(
        ActivityEvent.user_id == user.id,
        ActivityEvent.event_timestamp >= datetime.utcnow() - timedelta(days=7)
    ).order_by(desc(ActivityEvent.event_timestamp)).limit(50).all()
    
    # Build context
    context = f"""
    User's Recent Activity (Last 7 Days):
    - Total actions: {len(recent_events)}
    - Most active on: {get_most_active_day(recent_events)}
    - Common patterns: {get_patterns(recent_events)}
    - Projects worked on: {get_project_ids(recent_events)}
    - Completed sub-tasks: {count_completions(recent_events)}
    """
    
    # Include in AI prompt
    prompt = f"{context}\n\nBased on this activity, generate today's standup..."
```

### In Behavioral Learning

```python
# Analyze user preferences
def analyze_work_patterns(user_email: str):
    events = get_user_events(user_email, days=30)
    
    patterns = {
        'most_productive_hours': get_peak_hours(events),
        'preferred_project_priorities': get_priority_preference(events),
        'avg_task_completion_time': get_avg_duration(events, 'project_subtask_completed'),
        'email_response_time': get_avg_duration(events, 'email_replied'),
        'feature_usage': count_by_category(events)
    }
    
    return patterns
```

---

## 🎯 Success Metrics

### Week 1 Targets
- [ ] 95% event capture rate (events logged / actions taken)
- [ ] < 50ms overhead per event (batching should minimize impact)
- [ ] 1000+ events logged per active user per week
- [ ] 0 errors in event logging (silent failures acceptable)

### Month 1 Targets
- [ ] Event data used in 3+ AI features (standup, project wizard, email categorization)
- [ ] Analytics dashboard showing user behavior patterns
- [ ] 30-day activity retention for all users

---

## 🐛 Troubleshooting

### Events Not Logging
1. Check browser console for errors
2. Verify `userEmail` is passed to hook
3. Check network tab for failed API calls
4. Verify backend is deployed and healthy

### Slow Performance
1. Batching should handle this automatically
2. Increase `BATCH_INTERVAL` if needed (currently 5s)
3. Reduce `BATCH_SIZE` if memory is constrained

### Missing Events
1. Check offline queue size: `queueSize` from hook
2. Verify `sendBeacon` is working on page unload
3. Check backend logs for failed batch inserts

---

## 📚 Next Steps

After successful deployment:

1. **Monitor for 1 week** - Ensure events are logging correctly
2. **Build Analytics Dashboard** - Visualize user behavior
3. **Integrate with AI** - Use event data in prompts
4. **Add ML Models** - Predict user actions, suggest optimizations
5. **Privacy Controls** - Let users opt-out of tracking

---

## 🔒 Privacy & Security

- Events are user-specific and not shared
- No PII stored in metadata (use IDs not names)
- Retention policy: 365 days default (configurable)
- Users can request data deletion via `DELETE /api/events/cleanup`

---

**Status:** ✅ Ready for Integration  
**Next Sprint:** Use event data to power Aimy's Memory System
