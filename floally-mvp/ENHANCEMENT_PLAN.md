# Smart Messages Enhancement Plan

## Current Issues
1. ❌ CORS error when saving trusted senders (500 error - table doesn't exist)
2. ❌ No attachment indicator in message list
3. ❌ Can't see message body in popup
4. ❌ No AI summary button for message content
5. ❌ No way to add custom context before attachment review
6. ❌ Attachment processing triggers automatically instead of on-demand

## Solution Architecture

### Phase 1: Fix Critical Issues (IMMEDIATE)
- [x] Add error handling to trusted_senders endpoint for missing table
- [ ] Create trusted_senders table in Railway database
- [ ] Test "Remember my choice" functionality

### Phase 2: Message List Enhancements
- [ ] Add attachment indicator (📎 icon + count) to message cards
- [ ] Show attachment icon next to sender name
- [ ] Filter messages by "has attachments"

### Phase 3: Message Detail Popup Enhancements  
- [ ] **Display Message Body**
  - Show HTML email content (sanitized)
  - Show plain text fallback if no HTML
  - Scrollable message view
  - Preserve formatting

- [ ] **AI Message Summary** (Manual Trigger)
  - "Summarize with Aimi" button
  - Shows loading state
  - Displays AI-generated summary
  - Summary appears above message body
  - Can re-generate summary

- [ ] **Attachment Preview Section**
  - List all attachments with icons
  - File name, type, size
  - "Review with Aimi" button per attachment
  - Custom context input field
  - AI generates attachment summary

### Phase 4: Attachment Review Workflow
**New Flow:**
1. User opens message → sees attachments listed
2. User clicks "Review with Aimi" on specific attachment
3. Modal appears with:
   - Attachment name/preview
   - Text input: "Add context for Aimi..." (optional)
   - Example: "This is fiction, not real events"
   - "Generate Summary" button
4. Aimi processes attachment with custom context
5. Summary appears in modal
6. User can copy summary or add to draft context

### Phase 5: Enhanced Draft Generation
- [ ] Include message body in draft context (optional toggle)
- [ ] Include AI message summary in draft context
- [ ] Include attachment summaries in draft context
- [ ] Show what context is being used
- [ ] Allow editing context before generating

## Technical Implementation

### File Changes Required

#### Backend
1. **app/routers/trusted_senders.py**
   - Add try/except with db.rollback()
   - Return graceful error if table missing

2. **app/routers/messages.py**  
   - New endpoint: `POST /api/messages/summarize-message`
   - New endpoint: `POST /api/messages/summarize-attachment`
   - Accept custom context parameter
   - Return AI-generated summaries

3. **app/services/attachment_service.py**
   - Update `summarize_attachment_with_ai()` to accept custom context
   - Enhanced prompt with user context

#### Frontend
1. **components/EnhancedMessages.jsx**
   - Add attachment indicator to message cards
   - Show 📎 icon with count if hasAttachments
   - Extract attachment count from message metadata

2. **components/MessageDetailPopup.jsx**
   - Add message body display section
   - Add "Summarize with Aimi" button
   - Add AI summary display area
   - Add attachment list with review buttons
   - Add custom context input field
   - New modal for attachment review

3. **components/AttachmentReviewModal.jsx** (NEW)
   - Shows attachment details
   - Custom context textarea
   - "Generate Summary" button
   - Displays AI summary
   - Copy to clipboard button

## User Experience Flow

### View Message with Attachments
```
1. Message List shows: 📎 2 next to sender name
2. Click message → Popup shows:
   ┌─────────────────────────────────────┐
   │ From: friend@email.com              │
   │ Subject: Check this out!            │
   ├─────────────────────────────────────┤
   │ [Summarize with Aimi] 🤖           │
   │                                     │
   │ Message Body:                       │
   │ Hey! I wrote this short story...    │
   │ Let me know what you think!         │
   │                                     │
   │ Attachments:                        │
   │ 📄 short_story.pdf (245 KB)        │
   │    [Review with Aimi]               │
   │                                     │
   │ [Let Aimi (teammate) respond]       │
   └─────────────────────────────────────┘
```

### Review Attachment with Custom Context
```
1. Click "Review with Aimi" on short_story.pdf
2. Modal appears:
   ┌─────────────────────────────────────┐
   │ Review Attachment with Aimi         │
   ├─────────────────────────────────────┤
   │ File: short_story.pdf               │
   │ Size: 245 KB                        │
   │                                     │
   │ Add context for Aimi (optional):    │
   │ ┌─────────────────────────────────┐ │
   │ │ This is a work of fiction. My   │ │
   │ │ friend wants my feedback on the │ │
   │ │ plot and characters.            │ │
   │ └─────────────────────────────────┘ │
   │                                     │
   │ [Generate Summary] [Cancel]         │
   │                                     │
   │ Summary:                            │
   │ This short story follows a          │
   │ detective solving a mystery in...   │
   │                                     │
   │ [Copy Summary] [Use in Draft]       │
   └─────────────────────────────────────┘
```

## Next Steps
1. Fix trusted_senders endpoint error handling
2. Implement message body display
3. Add AI message summary feature  
4. Build attachment review modal
5. Integrate custom context into attachment processing
6. Test complete workflow
