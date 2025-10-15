# Email Management Features in OpAlly

## Overview
OpAlly now includes powerful email management features that allow you to manage your inbox directly from the application interface, making email triage faster and more efficient.

## Features

### 1. Delete/Trash Email
- **Button**: 🗑️ Delete
- **Location**: In the expanded email view, next to "Mark as Read"
- **Action**: Moves the email to Gmail's trash folder
- **Behavior**: 
  - Email is removed from the current view immediately (optimistic update)
  - Removed from email analysis if present
  - Shows confirmation: "🗑️ Email moved to trash"
  - Email can be recovered from Gmail's trash within 30 days

**Use Case**: Quickly remove junk emails, spam, or irrelevant messages without leaving OpAlly

### 2. Archive Email
- **Button**: 📦 Archive
- **Location**: In the expanded email view, next to the Delete button
- **Action**: Archives the email (removes from inbox but keeps in Gmail)
- **Behavior**:
  - Email is removed from the current view immediately (optimistic update)
  - Removed from email analysis if present
  - Shows confirmation: "📦 Email archived"
  - Email remains searchable in Gmail and can be accessed via "All Mail"

**Use Case**: Clean up your inbox by archiving emails you've already handled or that you want to keep but not see in your inbox

## Technical Implementation

### Frontend (App.jsx)

#### New Handler Functions
```javascript
const handleTrashEmail = async (emailId) => {
  // Calls gmail.trash(emailId) API
  // Removes email from current view optimistically
  // Updates email analysis state
  // Shows success/error feedback
}

const handleArchiveEmail = async (emailId) => {
  // Calls gmail.archive(emailId) API
  // Removes email from current view optimistically
  // Updates email analysis state
  // Shows success/error feedback
}
```

#### UI Buttons
Added to the expanded email view with:
- Delete: Red accent (bg-red-50, text-red-600, hover:bg-red-100)
- Archive: Gray accent (bg-slate-50, text-slate-600, hover:bg-slate-100)
- Both buttons use flex-wrap to ensure responsive layout

### Backend (gmail.py)

#### Existing Endpoints
- `POST /api/gmail/trash?email_id={emailId}` - Move email to trash
- `POST /api/gmail/archive?email_id={emailId}` - Archive email (remove from inbox)

Both endpoints:
1. Use Gmail API authenticated service
2. Modify email labels appropriately
3. Return success/error responses
4. Handle errors with appropriate HTTP status codes

### API Service (api.js)

Already includes methods:
```javascript
gmail: {
  trash: (emailId) => api.post(`/api/gmail/trash?email_id=${emailId}`),
  archive: (emailId) => api.post(`/api/gmail/archive?email_id=${emailId}`),
}
```

## User Experience Flow

1. **View Emails**: User browses emails in OpAlly dashboard
2. **Expand Email**: Click on an email to see full details
3. **Choose Action**: 
   - Click "🗑️ Delete" for junk/spam emails
   - Click "📦 Archive" for processed emails to keep
4. **Instant Feedback**: Email disappears from view immediately
5. **Confirmation**: Alert shows success message
6. **Error Handling**: If action fails, user sees error alert and can retry

## Benefits

### Time Efficiency
- No need to switch to Gmail to manage emails
- Bulk triage workflow: review → feedback → delete/archive → next
- Reduced context switching

### Clean Inbox
- Quickly remove promotional emails, newsletters, and spam
- Archive handled emails to maintain clean inbox
- Keep only actionable items visible

### Integration with Learning
- Delete/Archive actions can be tracked for behavioral learning
- Ally learns which types of emails you typically delete/archive
- Future enhancement: Auto-suggest delete/archive based on patterns

## Future Enhancements

### Potential Features
1. **Bulk Actions**: Select multiple emails and delete/archive at once
2. **Undo Action**: 5-second window to undo delete/archive
3. **Smart Suggestions**: Ally suggests emails to delete/archive based on patterns
4. **Auto-Archive**: Automatically archive emails older than X days
5. **Custom Rules**: Create rules like "Auto-archive newsletters after reading"
6. **Keyboard Shortcuts**: Press 'D' to delete, 'E' to archive
7. **Behavioral Learning**: Track delete/archive patterns to improve email prioritization

### Behavioral Tracking Enhancement
Consider logging delete/archive actions:
```javascript
// When user deletes email
await behavior.logAction({
  user_email: userEmail,
  email_id: emailId,
  sender_email: email.from,
  action_type: 'email_deleted',
  metadata: {
    was_promotional: email.isPromotional,
    was_newsletter: email.isNewsletter,
    domain: email.domain
  }
});
```

This would help Ally learn:
- Which senders you typically delete
- Which email categories you find irrelevant
- Patterns in emails you delete vs. engage with
- Improve future email prioritization

## Testing Checklist

- [x] Backend trash endpoint works
- [x] Backend archive endpoint works
- [x] Frontend calls correct API endpoints
- [x] Emails removed from view after action
- [x] Email analysis state updates correctly
- [x] Success/error alerts display properly
- [ ] Test with actual Gmail account
- [ ] Verify emails in Gmail trash folder
- [ ] Verify archived emails in Gmail "All Mail"
- [ ] Test error handling when backend fails
- [ ] Test with different email types (promotional, social, primary)

## Notes

- Deleted emails go to Gmail's trash and are permanently deleted after 30 days
- Archived emails remain in Gmail indefinitely (just removed from inbox)
- Actions are optimistic (UI updates immediately before API completes)
- Both actions preserve the email in Gmail's systems (not permanently deleted)
- Users can still recover emails from Gmail's trash or All Mail
