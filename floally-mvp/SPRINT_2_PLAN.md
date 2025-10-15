# Sprint 2: Intelligent Email Actions & Behavioral Learning Engine 🧠

**Status:** 🚀 In Progress  
**Version:** 1.3.0  
**Started:** January 2025

## Vision

Transform Ally from **reactive assistant** to **proactive agent** that:
1. Learns from your email actions (mark important, delete, respond, unsubscribe)
2. Predicts your likely responses to new emails
3. Queues up suggested actions for bulk approval
4. Gets smarter over time based on your patterns

## User Story

> "After Ally analyzes my important emails, I want **action buttons** to quickly:
> - Mark as Important/Focus or Unimportant/Not Interested
> - Respond (with AI-drafted reply)
> - Delete/Archive
> - Unsubscribe from newsletters
> 
> Over time, Ally should **learn my patterns** and start suggesting:
> - 'You usually mark emails from this sender as Important'
> - 'You haven't opened newsletters from this domain in 30 days - unsubscribe?'
> - 'Based on similar emails, you might want to archive this'
> 
> Eventually, I want **bulk approval mode** where Ally queues up actions and I just approve/reject in batches."

## Sprint 2 Features

### Phase 1: Email Action Buttons (Immediate)
**Goal:** Quick actions on Important Emails section

**UI Components:**
- Action button toolbar for each email
- Quick actions: Important, Respond, Archive, Unsubscribe
- Visual feedback (loading states, success/error)
- Confirmation modals for destructive actions

**Backend Actions:**
- `POST /api/gmail/mark-important` - Add IMPORTANT label
- `POST /api/gmail/mark-unimportant` - Remove from Important Emails view
- `POST /api/gmail/archive` - Archive email (remove INBOX label)
- `POST /api/gmail/unsubscribe` - Process unsubscribe link
- `POST /api/behavior/log-action` - Track user action for learning

### Phase 2: Behavioral Learning Engine
**Goal:** Track patterns and build user preference model

**Data Model:**
```python
BehaviorEvent:
  - event_id: str
  - user_email: str
  - timestamp: datetime
  - action_type: str  # important, archive, respond, unsubscribe, ignore
  - email_id: str
  - sender_email: str
  - sender_domain: str
  - email_category: str  # primary, newsletter, promo, social
  - has_unsubscribe: bool
  - confidence_score: float (0-1, from AI analysis)
```

**Learning Features:**
- Sender importance scoring (based on action history)
- Domain engagement tracking (newsletters you actually read)
- Category preferences (e.g., always archives promotional)
- Response patterns (when you respond vs ignore)

**Storage:** PostgreSQL/SQLite for behavioral events (time-series data)

### Phase 3: Predictive Suggestions
**Goal:** Ally predicts your likely action

**AI-Enhanced Analysis:**
```python
# For each email, Ally calculates:
{
  "predicted_action": "archive",  # or important, respond, unsubscribe
  "confidence": 0.85,
  "reason": "You usually archive newsletters from this sender",
  "suggestion": "Archive this email?",
  "auto_action": false  # true when confidence > 90%
}
```

**UI Display:**
- Badge showing predicted action
- Confidence indicator (⭐⭐⭐⭐ = high confidence)
- "Why?" tooltip explaining reasoning
- One-click to accept suggestion

### Phase 4: Bulk Approval Mode
**Goal:** Queue up actions for batch processing

**UI Flow:**
1. Ally analyzes all emails
2. Groups emails by suggested action:
   - "Archive (12 emails)" 
   - "Mark Important (3 emails)"
   - "Unsubscribe (5 newsletters)"
3. User reviews each group
4. One-click "Approve All" or selective approval
5. Actions execute in background

**Backend Queue:**
- Action queue with pending/approved/rejected states
- Batch execution API
- Rollback support for mistakes

## Implementation Phases

### ✅ Phase 1A: Email Action Buttons UI (THIS SESSION)
**Files to Create/Modify:**
- `frontend/src/components/EmailActions.jsx` - Action button component
- `frontend/src/App.jsx` - Integrate actions into Important Emails section
- `frontend/src/services/api.js` - Add action API calls

**UI Design:**
```jsx
<EmailActions 
  email={email}
  onMarkImportant={() => {...}}
  onArchive={() => {...}}
  onRespond={() => {...}}
  onUnsubscribe={() => {...}}
/>
```

**Action Buttons:**
- ⭐ **Focus** (mark important, star, highlight)
- 🗑️ **Archive** (remove from inbox, keep searchable)
- 📧 **Respond** (open AI draft response)
- 🚫 **Unsubscribe** (for newsletters)
- ❌ **Not Interested** (archive + negative signal)

### ⏳ Phase 1B: Backend Action Endpoints (THIS SESSION)
**Files to Create/Modify:**
- `backend/app/routers/gmail.py` - Add action endpoints
- `backend/app/routers/behavior.py` - NEW: Behavioral tracking
- `backend/app/models/behavior.py` - NEW: Pydantic models

**Endpoints:**
```python
POST /api/gmail/mark-important?email_id={id}
POST /api/gmail/archive?email_id={id}
POST /api/gmail/unsubscribe?email_id={id}
POST /api/behavior/log-action
  Body: {
    email_id, sender_email, action_type, 
    email_category, confidence_score
  }
```

### ⏳ Phase 2: Behavioral Database (NEXT SESSION)
**Setup:**
- Choose DB: SQLite (local) or PostgreSQL (production)
- Create behavior_events table
- Migration script from file-based to DB

**Analytics Queries:**
- Sender importance score (% of emails marked important)
- Domain engagement (open rate, response rate)
- Category preferences (archive rate by category)

### ⏳ Phase 3: Pattern Recognition (FUTURE)
**ML/AI Features:**
- Build sender scoring algorithm
- Detect engagement patterns
- Generate predictions with confidence scores
- Add to email analysis response

### ⏳ Phase 4: Bulk Approval UI (FUTURE)
**Dashboard Section:**
- "Ally's Suggestions" widget
- Grouped action queues
- Approve/reject interface
- Action history log

## Technical Architecture

### Behavioral Learning Flow:
```
User Action → Log to behavior_events → Update sender/domain stats → 
Generate predictions → Display in UI → User feedback → Refine model
```

### Data Storage Strategy:
- **User Profiles:** File-based (current) → PostgreSQL
- **Behavioral Events:** PostgreSQL/SQLite (time-series)
- **Sender Stats:** Cached in Redis (fast lookups)
- **Predictions:** Computed on-demand, cached 5min

### Privacy & Control:
- All behavioral data user-scoped
- Export behavioral data API
- Delete all behavioral data option
- Disable learning toggle in Settings

## Success Metrics

**Phase 1 (Action Buttons):**
- Click-through rate on action buttons
- Actions per session
- Time saved vs manual Gmail actions

**Phase 2 (Learning):**
- Behavioral events logged per user
- Sender importance scores calculated
- Pattern detection accuracy

**Phase 3 (Predictions):**
- Prediction accuracy (did user take suggested action?)
- Confidence calibration (90% confidence = 90% accuracy)
- User satisfaction with suggestions

**Phase 4 (Bulk Mode):**
- % of users using bulk approval
- Actions approved in bulk
- Time saved per session

## Timeline

- **Week 1 (Current):** Phase 1A + 1B - Action buttons + backend
- **Week 2:** Phase 2 - Database + behavioral tracking
- **Week 3:** Phase 3 - Pattern recognition + predictions
- **Week 4:** Phase 4 - Bulk approval mode

## Dependencies

**Backend:**
- Gmail API: Labels, modify, trash endpoints
- Anthropic API: Enhanced analysis with predictions
- Database: PostgreSQL or SQLite

**Frontend:**
- Action button components
- Loading states & optimistic UI
- Confirmation modals
- Bulk selection interface

## Risks & Mitigations

**Risk 1:** Gmail API rate limits
**Mitigation:** Batch operations, exponential backoff, queue system

**Risk 2:** Wrong predictions frustrate users
**Mitigation:** Start with low-confidence suggestions, let user train, undo support

**Risk 3:** Database scaling with behavioral events
**Mitigation:** Partition by user, TTL old events, aggregate stats

**Risk 4:** Privacy concerns with behavioral tracking
**Mitigation:** Transparent data usage, easy export/delete, user control

---

## Let's Start: Phase 1A & 1B Implementation

**Immediate Tasks:**
1. ✅ Create EmailActions component with 5 action buttons
2. ✅ Add action buttons to Important Emails section in App.jsx
3. ✅ Build backend endpoints for mark-important, archive, unsubscribe
4. ✅ Create behavior logging router
5. ✅ Integrate Gmail API label/modify operations
6. ✅ Add success/error feedback in UI
7. ✅ Test action flow end-to-end

**Expected Outcome:**
User can click ⭐ Focus, 🗑️ Archive, 📧 Respond, 🚫 Unsubscribe on any important email, and Ally logs the action for future learning.

Let's build! 🚀
