# AI Intelligence Enhancements — December 14, 2025

## Overview
Transformed Aimi from surface-level keyword matcher to contextually-aware AI teammate that understands sender relationships, user priorities, and behavioral patterns.

## Problem Solved
**Previous State:**
- Spam/notifications getting high priority while real people were ignored
- No understanding of sender relationships (VIP vs. noise)
- Single-tier LLM approach (Haiku for everything)
- Missing semantic understanding of message importance
- Autonomous actions based on simple rules without context

**Target State:**
- Aimi understands sender relationships (VIP, important, occasional, noise)
- Multi-layer contextual reasoning before making decisions
- Appropriate LLM selection for each task (Haiku for fast, Sonnet for reasoning)
- Autonomous actions respect learned patterns and relationships

## Implementation Details

### 1. Contextual Scoring Service (`/backend/app/services/contextual_scoring.py`)
**New intelligent scoring system with 4 layers of context:**

#### Layer 1: Message Metadata (Always Available)
- From Gmail API directly: sender, subject, category, labels
- Fast signals: starred, important, unsubscribe links

#### Layer 2: User Profile Context
- Role, priorities, communication style
- Company, work hours, preferences
- Loaded once per session

#### Layer 3: Behavioral History (The Learning Engine)
- `SenderStats` table: aggregated patterns per sender
- `BehaviorAction` tracking: every user action (archive, star, open)
- `TrustedSender` table: explicit trust designations
- Classifies relationships:
  - **VIP**: User frequently engages (response_rate > 0.5)
  - **Important**: User marks as important (importance_rate > 0.6)
  - **Occasional**: Sometimes engages
  - **Noise**: Consistently archives (archive_rate > 0.7)
  - **Unknown**: Not enough data

#### Layer 4: LLM Contextual Reasoning (Optional, For Complex Cases)
- Uses Claude 3.5 Sonnet for deep analysis
- Only for messages with low confidence or unknown senders
- Cost-controlled: max 20 messages per batch
- Prompt includes full user context + behavioral patterns

### 2. Enhanced Messages API (`/backend/app/routers/messages.py`)
**Changes:**
- Replaced simple `calculate_sender_importance()` with `ContextualScorer`
- Every message now includes:
  - `importanceReasoning`: Human-readable explanation
  - `senderRelationship`: vip/important/occasional/noise/unknown
  - `confidence`: How sure we are (0-1)
  - `suggestedAction`: reply_now/review_today/read_later/auto_archive

**Scoring Algorithm:**
```python
Base score: 50
+ VIP sender: +40
+ Important sender: +30
+ Historical importance: ±30
+ Trusted contact: +15
+ Gmail starred: +20
+ Gmail important: +15
+ Primary category: +10
- Promotional category: -25
- Unsubscribe link: -20
- Blocked sender: -50
= Final score (0-100)
```

### 3. Context-Aware Standup Generation (`/backend/app/routers/ai.py`)
**Enhancements:**
- New `format_messages_with_context()` function
- Includes sender relationship emoji (⭐ VIP, 📌 Important, 📢 Noise)
- Shows importance reasoning for key messages
- Updated prompt with explicit instructions:
  - Prioritize based on sender relationships
  - Consider VIP contacts over newsletters
  - Use behavioral patterns to identify what matters

**Prompt Improvements:**
```
CRITICAL CONTEXT AWARENESS:
- Each message includes senderRelationship (vip, important, occasional, noise, unknown)
- Each message includes importanceReasoning explaining why score was assigned
- Use this context to understand what truly matters to THIS user
- VIP contacts should be prioritized over random senders
- Messages from people they respond to frequently are more important than newsletters
- Don't just look at keywords - understand the RELATIONSHIP
```

### 4. Intelligent Autonomous Actions (`/backend/app/routers/autonomous_actions.py`)
**Replaced Simple Rules With Contextual Intelligence:**

**Old Approach:**
- Rule 1: Archive all promotional if enabled
- Rule 2: Archive if sender has >80% archive rate
- Rule 3: Flag unsubscribe candidates

**New Approach:**
- Rule 1: Archive promotional ONLY if low importance + not VIP
  - Safety check: Even if promotional, keep if sender is VIP/important
  - Prevents accidentally archiving important updates from contacts
  
- Rule 2: Archive based on learned pattern + confidence
  - Requires relationship='noise' AND confidence>0.7
  - Checks suggested_action from contextual scorer
  - More conservative: won't archive unless confident
  
- Rule 3: Flag unsubscribe candidates (unchanged)
  - Low importance + has unsubscribe + consistent noise pattern

**Key Improvement:**
```python
# OLD: Blindly archive all promotional
if auto_archive_promo and is_promotional:
    archive()

# NEW: Check if sender is actually important first
if auto_archive_promo and is_promotional:
    if relationship in ['vip', 'important'] or importance_score > 40:
        keep_in_inbox()  # It's promotional but from someone important!
    else:
        archive()  # Safe to archive
```

## API Response Examples

### Before (Simple Scoring):
```json
{
  "id": "msg123",
  "from": "ceo@company.com",
  "subject": "Quick question",
  "senderImportanceScore": 0.5,  // Unknown sender = neutral
  "isPromotional": false
}
```

### After (Contextual Scoring):
```json
{
  "id": "msg123",
  "from": "ceo@company.com",
  "subject": "Quick question",
  "senderImportanceScore": 0.85,  // High score from context
  "importanceReasoning": "You frequently engage with this sender",
  "senderRelationship": "vip",
  "confidence": 0.9,
  "suggestedAction": "reply_now"
}
```

## Performance & Cost Considerations

### LLM Usage:
- **Haiku**: Still used for standup generation (~$0.01 per standup)
- **Sonnet**: New for deep contextual analysis (optional, cost-controlled)
  - Only used for low-confidence messages
  - Max 20 messages per batch
  - ~$0.15 per 10 analyses

### Database Queries:
- Layer 1-3 scoring: 3 SQL queries per message (fast, cached)
- Layer 4 LLM analysis: Only when needed (confidence < 0.6)

## Testing Recommendations

### Unit Tests Needed:
1. Test `ContextualScorer.calculate_contextual_importance()` with various sender types
2. Test relationship classification (vip, important, noise)
3. Test autonomous actions don't archive VIP promotional emails
4. Test confidence scoring accuracy

### Integration Tests:
1. Test full message flow: Gmail → Contextual Scoring → Frontend
2. Test standup generation with rich context
3. Test autonomous actions end-to-end
4. Verify behavioral learning updates SenderStats correctly

### Manual Testing:
1. Send test emails from "VIP" contact → Should score high even if promotional
2. Send promotional from unknown → Should score low and archive
3. Generate standup → Should show relationship context
4. Enable auto-archive → Verify it respects VIP senders

## Migration Notes

### Backward Compatibility:
- Old `calculate_sender_importance()` function kept for compatibility
- Now calls `ContextualScorer` internally and converts score
- No breaking changes to existing API consumers

### Database Changes:
- **No schema changes needed!** ✅
- Uses existing tables:
  - `SenderStats` (already exists)
  - `BehaviorAction` (already exists)
  - `TrustedSender` (already exists)
  - `UserProfile` (already exists)

### Frontend Changes:
- Frontend can now display:
  - `importanceReasoning` to explain scores
  - `senderRelationship` badges (VIP, Important, Noise)
  - `confidence` indicators
  - `suggestedAction` buttons

## Success Metrics

### Quantitative:
- Measure: What % of inbox is correctly prioritized?
- Target: 80%+ of VIP messages in top 10 results
- Measure: Auto-archive accuracy (false positives)
- Target: <5% false positive rate (archiving important emails)

### Qualitative:
- User feedback: "Does Aimi understand what matters to me?"
- Standup quality: "Does it mention the right people/tasks?"
- Trust building: "Do I feel confident Aimi won't miss important things?"

## Next Steps

### Immediate (Already Done ✅):
1. ✅ Build ContextualScorer service
2. ✅ Integrate into messages API
3. ✅ Enhance standup generation
4. ✅ Refine autonomous actions

### Short Term (1-2 weeks):
1. Add frontend UI for relationship badges
2. Build "Why this score?" explanation tooltips
3. Create audit log for autonomous actions
4. Add confidence indicators in UI

### Medium Term (2-4 weeks):
1. Train on user behavior over time (ML model?)
2. Add "Teach Aimi" feedback loops
3. Implement multi-day pattern detection
4. Add cross-account sender matching (same person, different emails)

## File Changes Summary

### New Files:
- `/backend/app/services/contextual_scoring.py` (470 lines)

### Modified Files:
- `/backend/app/routers/messages.py`:
  - Added ContextualScorer import
  - Enhanced smart messages endpoint with contextual scoring
  - Added new fields to message responses
  
- `/backend/app/routers/ai.py`:
  - Added `format_messages_with_context()` helper
  - Enhanced standup prompt with relationship awareness
  - No breaking changes to API contract
  
- `/backend/app/routers/autonomous_actions.py`:
  - Added User and ContextualScorer imports
  - Replaced simple rules with contextual intelligence
  - Added `_archive_message()` helper function
  - More conservative decision-making

### No Schema Changes:
- All existing tables used as-is
- No migrations needed

## Technical Debt Notes

- **Type Warnings**: 50+ Pylance warnings in `contextual_scoring.py` (all `Dict` types)
  - Non-blocking, can add `Dict[str, Any]` types later
- **LLM Cost Monitoring**: Should track token usage per user
- **Cache Layer**: Could cache scorer results for same sender (future optimization)

## Conclusion

This enhancement transforms Aimi from a literal keyword-matcher to a context-aware AI teammate. The key insight: **relationships matter more than keywords**. An email from a VIP contact with "FYI" is more important than a promotional email with "URGENT DEADLINE".

By layering context (metadata → profile → behavior → LLM reasoning), Aimi can now make intelligent decisions that feel like a human assistant who actually knows the user.
