# Aimi Decision Transparency System
## Building Trust Through Visibility & Learning

**Status:** ✅ Implemented  
**Date:** December 14, 2025  
**Philosophy:** "Luminous Calm" - Trust through transparency, not opacity

---

## The Trust Problem

**User Concern:** "Her summary feels confident and trustworthy (which feels good) - but as a user, I am uncertain if something has been missed, misunderstood or incorrectly handled."

**Core Issue:** Users can't trust an AI teammate they can't see working. Without visibility into Aimi's decisions, users have no way to:
- Verify Aimi got it right
- Correct Aimi when wrong
- Understand why Aimi made a decision
- Build confidence over time

---

## Solution: Complete Transparency + Learning Loop

### 1. Record Every Decision

**What Gets Recorded:**
- ✅ Importance scoring (`importance_score: 0-100`)
- ✅ Category assignments (`primary/promotional/spam`)
- ✅ Suggested actions (`read_now/read_later/archive`)
- 🔄 Auto-archive decisions (future)
- 🔄 Draft responses (future)
- 🔄 Meeting scheduling (future)

**For Each Decision:**
```json
{
  "decision": {"importance_score": 85},
  "reasoning": "Sender is from your priority project 'Q1 Launch'",
  "confidence": 0.82,
  "status": "suggested",
  "context_snapshot": {
    "source": "llm_contextual",
    "subject": "Quick question about redesign deadline"
  },
  "ai_model": "claude-sonnet-4"
}
```

### 2. Three-Tier Status System

**✅ HANDLED (Confidence ≥ 90%)**
- Aimi handled automatically
- High confidence decision
- User can still review/correct
- Example: Obvious spam, clear priority emails

**🟡 SUGGESTED (Confidence 60-90%)**
- Aimi suggests, user decides
- Medium confidence decision
- User should review before action
- Example: Borderline importance, unclear sender

**🔵 YOUR CALL (Confidence < 60%)**
- Aimi unsure, needs user input
- Low confidence decision
- User must decide
- Example: Ambiguous context, new sender

### 3. Review & Correction Interface

**User Can:**
1. **Approve** - "Yes, Aimi got it right"
   - Builds confidence in Aimi's accuracy
   - Improves approval rate metrics
   
2. **Correct** - "No, here's what it should be"
   - Adjust importance score (0-100 slider)
   - Explain why correction is needed
   - Aimi learns from this feedback
   
3. **View History** - "Show me what Aimi did today"
   - See all decisions by date
   - Filter by message or decision type
   - Audit trail for transparency

### 4. Learning System

**How Aimi Learns From Corrections:**

```python
# User consistently corrects sender importance down
if correction_pattern_detected(sender_email):
    update_sender_stats(sender_email, lower_importance=True)

# User consistently changes category assignments
if category_corrections_detected(category):
    update_category_preferences(user, category_rules)

# User consistently rejects suggested actions
if action_corrections_detected(action_type):
    learn_preferred_action_patterns(user, action_preferences)
```

**Learning Outcomes:**
- Better sender importance scores over time
- More accurate category assignments
- Personalized action suggestions
- Higher confidence in future decisions

---

## Implementation Details

### Backend Architecture

**New Service:** `app/services/decision_transparency.py`
- `DecisionTransparencyService` - Main service class
- `AimiDecision` model - Database table for decisions
- `DecisionType` enum - Types of decisions (importance, category, action, etc.)
- `DecisionStatus` enum - Status values (handled, suggested, your_call, etc.)

**New API Endpoints:** `app/routers/decisions.py`
```
GET  /api/decisions/pending          # Get decisions needing review
POST /api/decisions/review           # Approve or correct a decision
GET  /api/decisions/history          # View decision history
GET  /api/decisions/accuracy         # Get accuracy metrics
GET  /api/decisions/message/{id}     # Get all decisions for a message
```

**Integration Points:**
- `messages.py` - Records decisions when scoring importance
- `init_db.py` - Creates `aimi_decisions` table
- `main.py` - Registers decision router

### Database Schema

**Table:** `aimi_decisions`
```sql
CREATE TABLE aimi_decisions (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR NOT NULL,
    message_id VARCHAR,
    decision_type VARCHAR NOT NULL,  -- 'importance_scoring', 'category_assignment', etc.
    decision_data JSONB,              -- {"importance_score": 85}
    reasoning TEXT,                   -- Human-readable explanation
    confidence FLOAT,                 -- 0.0-1.0
    status VARCHAR,                   -- 'suggested', 'handled', 'your_call', etc.
    reviewed_at TIMESTAMP,
    user_correction JSONB,            -- What user changed it to
    correction_reasoning TEXT,        -- Why user corrected
    context_snapshot JSONB,           -- Context at decision time
    ai_model_used VARCHAR,            -- 'claude-sonnet-4', 'gemini-2.5-flash', etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_aimi_decisions_user_email ON aimi_decisions(user_email);
CREATE INDEX idx_aimi_decisions_message_id ON aimi_decisions(message_id);
CREATE INDEX idx_aimi_decisions_created_at ON aimi_decisions(created_at);
```

### Frontend Component

**New Component:** `frontend/src/components/AimiDecisionReview.jsx`

**Features:**
- Dashboard view of all pending decisions
- Approve/Correct buttons for each decision
- Correction form (slider + reasoning textarea)
- Summary stats (approval rate, handled count, needs attention)
- Recently handled section (audit trail)
- Empty state (all caught up!)

**Design System:**
- Aimi Green (`#65E6CF`) for approve buttons
- Yellow for suggested decisions (🟡)
- Blue for "your call" decisions (🔵)
- Green for handled decisions (✅)
- 16px rounded corners, soft shadows
- Generous spacing for "Luminous Calm"

---

## User Experience Flow

### 1. User Opens Inbox
```
User logs in
  ↓
Aimi analyzes 50 emails
  ↓
Records 50 importance_scoring decisions
  ↓
Status determined by confidence:
  - 30 emails: ✅ HANDLED (>90% confidence)
  - 15 emails: 🟡 SUGGESTED (60-90% confidence)
  - 5 emails: 🔵 YOUR CALL (<60% confidence)
```

### 2. User Reviews Decisions
```
User clicks "Review Aimi's Decisions"
  ↓
Sees dashboard:
  - 20 Need Your Review (suggested + your_call)
  - 30 Recently Handled (for audit)
  - 85% Approval Rate
```

### 3. User Approves/Corrects
```
User sees: "Importance: 85 - Sender is from Q1 Launch project"
  ↓
Option A: User clicks "Approve" → Status = USER_APPROVED
Option B: User clicks "Correct" → Opens correction form
  ↓
If corrected:
  - Adjust score slider to 50
  - Enter reason: "This sender sends automated reports"
  - Submit
  ↓
Aimi learns:
  - Lower importance for this sender
  - Recognize automated reports pattern
  - Update confidence for similar cases
```

### 4. Aimi Improves Over Time
```
After 100 corrections:
  ↓
Aimi's approval rate increases: 85% → 92%
  ↓
User trusts Aimi more
  ↓
Reviews become less frequent (trust built!)
  ↓
Aimi handles more automatically
```

---

## Metrics & Transparency

### Accuracy Metrics API

**Endpoint:** `GET /api/decisions/accuracy?days=30`

**Returns:**
```json
{
  "total_decisions": 100,
  "user_approved": 85,
  "user_corrected": 15,
  "approval_rate": 0.85,
  "avg_confidence": 0.78,
  "confidence_calibration": {
    "high (>0.9)": {
      "count": 30,
      "approved": 28,
      "rate": 0.93
    },
    "medium (0.6-0.9)": {
      "count": 50,
      "approved": 42,
      "rate": 0.84
    },
    "low (<0.6)": {
      "count": 20,
      "approved": 15,
      "rate": 0.75
    }
  }
}
```

**Use Cases:**
- "How often does Aimi get it right?" → approval_rate
- "Should I trust high-confidence decisions?" → confidence_calibration
- "Is Aimi improving over time?" → Track approval_rate weekly

### Decision History API

**Endpoint:** `GET /api/decisions/history?days=7&decision_type=importance_scoring`

**Returns:**
```json
{
  "decisions": [
    {
      "id": 123,
      "message_id": "18c2f...",
      "type": "importance_scoring",
      "decision": {"importance_score": 85},
      "reasoning": "Sender from Q1 Launch project",
      "confidence": 0.82,
      "status": "user_approved",
      "created_at": "2025-12-14T10:30:00Z",
      "reviewed_at": "2025-12-14T10:35:00Z"
    }
  ],
  "count": 47
}
```

**Use Cases:**
- "What did Aimi do with my emails today?"
- "Show me all decisions about this email"
- "How often does Aimi mis-categorize emails?"

---

## Benefits

### For Users

1. **Visibility** - See what Aimi is doing, no black box
2. **Control** - Correct Aimi when wrong, not stuck with mistakes
3. **Understanding** - Learn why Aimi made each decision
4. **Confidence** - Trust builds over time as approval rate increases
5. **Feedback Loop** - Corrections improve future decisions

### For Product

1. **Trust Building** - Transparency = perceived partnership
2. **Learning Data** - User corrections improve AI accuracy
3. **Error Detection** - Catch mistakes before they cause problems
4. **User Engagement** - Review interface keeps users involved
5. **Competitive Advantage** - Most AI tools are opaque, we're transparent

### For AI Improvement

1. **Quality Signal** - User corrections = high-quality training data
2. **Pattern Recognition** - Learn user preferences from corrections
3. **Confidence Calibration** - Adjust confidence thresholds based on accuracy
4. **Personalization** - Each user's corrections tailor Aimi to them
5. **Error Analysis** - Understand what Aimi gets wrong and why

---

## Next Steps

### Phase 1: Current Implementation ✅
- ✅ Record importance scoring decisions
- ✅ Decision review API endpoints
- ✅ Frontend review component
- ✅ Approval/correction flow
- ✅ Accuracy metrics

### Phase 2: Enhanced Learning 🔄
- Learn from correction patterns
- Auto-adjust sender importance scores
- Update category preferences
- Personalize confidence thresholds
- Show "Aimi is learning from your feedback" messages

### Phase 3: Proactive Transparency 🔄
- Daily digest: "Here's what Aimi did today"
- Weekly report: "Aimi handled 150 emails, 92% approval"
- Notifications: "Aimi needs your input on 3 decisions"
- Confidence trends: "Aimi is getting better at importance scoring"
- Comparison: "You vs Aimi" decision differences

### Phase 4: Advanced Features 🔄
- Bulk review: "Approve all high-confidence decisions"
- Undo actions: "Oops, Aimi archived something important"
- Decision templates: "Always do this for emails like these"
- Explain like I'm 5: "Why did Aimi score this 85?"
- Decision playback: "Show me Aimi's thought process"

---

## Design Philosophy

**From Product Strategy:**
> "Does this make Aimi feel more like a teammate who knows me and protects my day?"

**This System Delivers:**
- 👀 **Visibility** - I can see what Aimi is doing
- 🎯 **Agency** - I can correct Aimi's decisions
- 📚 **Learning** - Aimi improves from my feedback
- 🤝 **Partnership** - We're working together, not Aimi working alone
- 💚 **Trust** - Transparency builds confidence over time

**Not Just Features, But Philosophy:**
- No silent autonomous actions
- Every decision explainable
- User always in control
- AI suggests, user decides (unless high confidence + user trusts)
- Trust earned through accuracy, not demanded

---

## Testing Checklist

### Backend Tests
```bash
cd floally-mvp/backend
source venv/bin/activate

# Test decision recording
python3 test_decision_transparency.py

# Test review flow
curl -X POST localhost:8000/api/decisions/review \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"decision_id": 1, "approved": true}'

# Test accuracy metrics
curl localhost:8000/api/decisions/accuracy?days=30 \
  -H "Authorization: Bearer $TOKEN"
```

### Frontend Tests
```bash
cd floally-mvp/frontend
npm run dev

# Navigate to /decisions
# 1. Verify pending decisions load
# 2. Click "Approve" - decision should disappear
# 3. Click "Correct" - form should appear
# 4. Adjust slider and submit - decision should update
# 5. Check summary stats update
```

### Integration Tests
```bash
# Full flow
1. User logs in
2. Inbox loads (decisions recorded)
3. User opens decision review
4. User corrects a decision
5. Verify decision updates in database
6. Verify accuracy metrics reflect correction
7. Verify Aimi learns from correction (future)
```

---

## Documentation for Users

**In-App Help Text:**

**"What is this?"**
> Aimi makes hundreds of decisions about your emails - which are important, which to archive, what to prioritize. This page shows you what Aimi is doing so you can verify accuracy and make corrections. Your feedback helps Aimi learn and improve over time.

**"Why review decisions?"**
> - Catch mistakes before they cause problems
> - Teach Aimi your preferences
> - Build trust by seeing Aimi's work
> - Verify nothing was missed

**"What do the colors mean?"**
> - ✅ Green (HANDLED): Aimi handled automatically with high confidence
> - 🟡 Yellow (SUGGESTED): Aimi suggests this, but wants your confirmation
> - 🔵 Blue (YOUR CALL): Aimi is unsure, needs your decision

**"How does Aimi learn?"**
> When you correct a decision, Aimi remembers your preference and applies it to similar cases in the future. The more feedback you give, the better Aimi gets at understanding what matters to you.

---

## Success Metrics

**Short Term (1 month):**
- 80%+ of users review at least 10 decisions
- 70%+ approval rate on first pass
- 90%+ approval rate after 50 corrections

**Medium Term (3 months):**
- 85%+ approval rate average
- 50%+ reduction in reviews needed (trust built)
- 90%+ user confidence in Aimi's decisions

**Long Term (6 months):**
- 92%+ approval rate average
- 70%+ reduction in reviews needed (Aimi learned!)
- 95%+ user confidence
- "I trust Aimi" feedback from users

---

## Conclusion

This transparency system transforms Aimi from a mysterious AI black box into a trusted teammate. Users can see, review, and correct Aimi's work - building confidence through visibility and improving accuracy through feedback.

**The Trust Loop:**
```
Aimi makes decision
  ↓
User reviews
  ↓
User approves/corrects
  ↓
Aimi learns
  ↓
Aimi improves
  ↓
User trusts more
  ↓
Reviews less frequently
  ↓
Aimi handles more
  ↓
Trust solidified!
```

This is the foundation of a true AI teammate - one that works with you, not for you.
