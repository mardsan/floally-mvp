# Three-Tier Email Feedback System

## Overview
Enhanced the "Help Alli Learn" feature with a three-tier categorization system to better train Alli on user preferences.

## User Feedback Categories

### 1. ⭐ Important
- **Purpose**: Emails that need action or immediate attention
- **Weight in scoring**: 2.0x (highest)
- **Use cases**: Urgent requests, critical updates, time-sensitive communications

### 2. 📖 Interesting
- **Purpose**: Content worth reading and absorbing, but not urgent
- **Weight in scoring**: 1.0x (medium)
- **Use cases**: Industry newsletters, thought leadership, educational content, non-urgent updates
- **NEW**: This middle tier helps Alli differentiate between actionable and informational content

### 3. ❌ Uninteresting
- **Purpose**: Not relevant or useful to the user
- **Weight in scoring**: 0.0x (no positive weight)
- **Use cases**: Spam, irrelevant promotions, noise

## Importance Score Calculation

The sender importance score is calculated as:

```
score = (important_count × 2.0 + interesting_count × 1.0 + responded_count × 1.5) / total_actions
normalized_score = min(1.0, score / 2.0)
```

Where:
- `important_count`: Times user marked emails from this sender as important
- `interesting_count`: Times user marked emails as interesting
- `responded_count`: Times user responded to emails from this sender
- `total_actions`: Total feedback actions (important + interesting + unimportant + archive + trash + respond)

## Implementation Details

### Frontend Changes
**File**: `frontend/src/components/EmailFeedback.jsx`
- Added "Interesting" button with blue styling (between Important and Uninteresting)
- Updated action type mapping to include `mark_interesting_feedback`
- Changed UI from horizontal to vertical layout for better readability
- Enhanced button descriptions to clarify use cases

### Backend Changes
**File**: `backend/app/routers/behavior.py`
- Added `marked_interesting` counter to sender statistics
- Updated `BehaviorAction` model to include metadata field
- Enhanced importance score calculation to include interesting feedback
- Added support for `mark_interesting_feedback` action type
- Updated comments to reflect new three-tier system

## Benefits

1. **Better Content Differentiation**: Users can now distinguish between actionable and informational emails
2. **Improved Learning**: Alli can learn what content is valuable to read vs. what requires action
3. **Reduced Noise**: "Unimportant" remains focused on truly irrelevant content
4. **Nuanced Scoring**: Senders of interesting content get positive (but not urgent) scoring

## User Experience

When a user clicks "💡 Help Alli learn":
1. Three clearly labeled options appear
2. Each option explains its purpose
3. Feedback is logged immediately
4. Confirmation message appears: "✅ Thanks! Alli is learning your preferences."

## Future Enhancements

- Use interesting feedback to populate a "Reading List" or "Later" inbox
- Create digest emails of interesting content for weekend reading
- Use interesting vs. important ratio to suggest optimal email check times
- Train Alli to auto-categorize based on content similarity
