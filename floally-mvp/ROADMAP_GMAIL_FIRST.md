# Development Roadmap: Gmail-First Architecture

**Date:** October 20, 2025  
**Strategy:** Perfect Gmail → Scale to Multi-Channel

---

## 🎯 Core Strategy

> "Build the unified inbox architecture using Gmail as the reference implementation. Perfect the experience with one channel, then scale to many."

### Why Gmail First?
1. **Most complex** - Email has the richest feature set (labels, categories, threads, attachments)
2. **Well-understood** - Gmail API is mature and documented
3. **Universal** - Everyone has email, immediate value
4. **Design template** - Patterns we build for Gmail will work for Slack, Teams, etc.

---

## 🏗️ Architecture Principles

### Design for Scale from Day 1

**Channel-Agnostic Data Structure:**
```javascript
{
  id: "msg_123",
  channel: "gmail",              // future: "slack", "teams", etc.
  channelType: "email",          // future: "chat", "sms", etc.
  from: {
    id: "user_456",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://...",
    channel: "gmail"
  },
  subject: "Q4 Budget Review",   // or title/topic
  content: "Full message text...",
  snippet: "First 150 chars...",
  timestamp: "2025-10-20T10:30:00Z",
  
  // Universal metadata
  priority: "important",         // critical|important|standard|low
  importanceScore: 85,           // 0-100
  category: "work",              // work|personal|finance|etc.
  tags: ["budget", "q4", "finance"],
  
  // Status
  unread: true,
  starred: false,
  requiresAction: true,
  actionType: "respond",         // respond|review|schedule|etc.
  
  // Gmail-specific (expandable per channel)
  gmail: {
    threadId: "thread_789",
    labelIds: ["INBOX", "IMPORTANT"],
    isPrimary: true,
    isPromotional: false,
    hasAttachments: true
  },
  
  // Future: Slack-specific
  slack: {
    channelId: "C123",
    channelName: "#marketing",
    threadTs: "1234567890.123456",
    mentions: ["@you"]
  },
  
  // AI analysis
  aimy: {
    summary: "John needs feedback on Q4 budget by EOD",
    suggestedActions: ["Review document", "Schedule call"],
    sentiment: "neutral",
    urgency: "high",
    confidence: 0.92
  }
}
```

---

## 📋 Phase 1: Perfect Gmail Experience

### Current State (v1.3.0)
✅ Gmail authentication  
✅ Fetch messages (50 per category)  
✅ Gmail categories (Primary, Social, Promotions, Updates, Forums)  
✅ Email actions (Focus, Archive, Respond, Unsubscribe)  
✅ AI analysis (10 emails)  
✅ Importance scoring  
✅ ProfileHub with insights  

### Immediate Improvements (This Week)

#### 1. Enhanced Message Card Design
**Goal:** Create the universal message card that will work for all channels

**Features:**
- [ ] Channel badge [Gmail] at top-left
- [ ] Importance indicator (color bar: red/orange/yellow/gray)
- [ ] Better sender display (avatar + name + channel)
- [ ] Aimi's summary (collapsible)
- [ ] Quick action buttons (Reply, Archive, Snooze, More)
- [ ] Thread indicator (if part of conversation)
- [ ] Attachment indicator
- [ ] Time display (smart: "2m ago", "Today 3pm", "Oct 15")

**Why:** This card design will be reused for Slack messages, Teams notifications, etc.

#### 2. Importance Scoring Refinement
**Goal:** Perfect the AI prioritization algorithm

**Features:**
- [ ] Implement 0-100 importance score
- [ ] Visual priority levels:
  - 🔴 Critical (90-100): Immediate attention needed
  - 🟠 Important (70-89): Action needed today
  - 🟡 Standard (40-69): Review when convenient
  - ⚪ Low (0-39): FYI or can be skipped
- [ ] Sort by score (not just categories)
- [ ] Priority badge on each message
- [ ] Filter by priority level

**Why:** This scoring system will apply to all channels.

#### 3. Thread Consolidation
**Goal:** Group related messages together

**Features:**
- [ ] Detect email threads
- [ ] Show thread count badge
- [ ] Expand/collapse thread view
- [ ] Show latest message preview
- [ ] Mark entire thread as read/archived

**Why:** Threads exist in email, Slack, Teams - need consistent UX.

#### 4. Better Search & Filters
**Goal:** Find what you need fast

**Features:**
- [ ] Search across all messages
- [ ] Filter by: sender, date range, has:attachment, is:unread
- [ ] Saved searches
- [ ] Smart filters ("from:client", "urgent")

**Why:** Will scale to multi-channel search.

#### 5. Bulk Actions
**Goal:** Handle many messages efficiently

**Features:**
- [ ] Select multiple messages (checkbox)
- [ ] Bulk archive
- [ ] Bulk mark as read
- [ ] Bulk apply label
- [ ] Select all in category

**Why:** Essential for managing high-volume unified inbox.

#### 6. Keyboard Shortcuts
**Goal:** Power user efficiency

**Features:**
- [ ] `j/k` - Navigate up/down
- [ ] `e` - Archive
- [ ] `r` - Reply
- [ ] `s` - Star
- [ ] `gi` - Go to inbox
- [ ] `?` - Show shortcuts

**Why:** Speed is critical for processing many messages.

---

## 📋 Phase 2: Gmail Feature Complete (Next 2 Weeks)

### Advanced Gmail Features

#### 1. Full Gmail Labels Support
- [ ] Show all Gmail labels (not just categories)
- [ ] Apply/remove labels
- [ ] Create custom labels
- [ ] Label-based automation

#### 2. Gmail Search Operators
- [ ] Support full Gmail search syntax
- [ ] `from:`, `to:`, `subject:`, `has:attachment`
- [ ] Date operators (`after:`, `before:`)
- [ ] Boolean operators (`AND`, `OR`, `NOT`)

#### 3. Compose & Reply
- [ ] Rich text editor
- [ ] Attachments
- [ ] CC/BCC
- [ ] Formatting (bold, italic, lists)
- [ ] Save drafts
- [ ] Templates

#### 4. Advanced Actions
- [ ] Snooze (reappear at specific time)
- [ ] Remind if no reply
- [ ] Move to folder
- [ ] Forward with note
- [ ] Create task from email

#### 5. Offline Support
- [ ] Cache recent messages locally
- [ ] Compose offline (send when online)
- [ ] Sync queue
- [ ] Conflict resolution

---

## 📋 Phase 3: Architecture Abstraction (Week 3-4)

### Make It Channel-Agnostic

#### 1. Message Abstraction Layer
```javascript
// Generic message interface
interface UnifiedMessage {
  id: string;
  channel: ChannelType;
  from: Sender;
  subject: string;
  content: string;
  // ... universal fields
}

// Channel adapters
class GmailAdapter implements ChannelAdapter {
  async fetchMessages(): Promise<UnifiedMessage[]> {
    // Convert Gmail API response to UnifiedMessage
  }
  
  async sendMessage(msg: UnifiedMessage): Promise<void> {
    // Convert UnifiedMessage to Gmail API format
  }
}

// Future adapters
class SlackAdapter implements ChannelAdapter { ... }
class TeamsAdapter implements ChannelAdapter { ... }
```

#### 2. Unified Actions
- [ ] Action interface that works for all channels
- [ ] Archive = Archive email / Mute Slack thread / Dismiss Teams notification
- [ ] Reply = Email reply / Slack message / Teams response
- [ ] Star = Gmail star / Slack bookmark / Teams pin

#### 3. Channel Registry
- [ ] Pluggable channel system
- [ ] Easy to add new channels
- [ ] Each channel provides:
  - Authentication flow
  - Message fetcher
  - Message sender
  - Action handlers
  - UI components (icons, badges)

---

## 📋 Phase 4: Add Second Channel (Week 5-6)

### Slack Integration (Proof of Concept)

#### Why Slack Next?
- Different from email (chat vs. messages)
- Real-time vs. batch
- Channels vs. inbox
- Tests our architecture flexibility

#### Slack Features to Support
- [ ] OAuth authentication
- [ ] List channels & DMs
- [ ] Fetch messages (threads)
- [ ] Send messages
- [ ] React with emoji
- [ ] Mark as read
- [ ] Channel notifications

#### Unified Inbox Updates
- [ ] Show Slack messages alongside Gmail
- [ ] Channel filter: "All", "Gmail", "Slack"
- [ ] Unified search (Gmail + Slack)
- [ ] Cross-channel priority scoring
- [ ] Combined unread count

---

## 📋 Phase 5: Multi-Channel Excellence (Week 7-8)

### Third Channel: Microsoft Outlook
- [ ] Add Outlook email support
- [ ] Validate architecture with 3 channels
- [ ] Refine channel abstraction if needed

### Unified Experience
- [ ] Smart grouping (group by person across channels)
- [ ] Cross-channel threads (email + Slack about same topic)
- [ ] Unified notifications
- [ ] Channel preferences per contact

---

## 🎨 UI/UX Evolution

### Current (Single Channel - Gmail)
```
┌─────────────────────────────────────────┐
│ 📧 Primary | 👥 Social | 🏷️ Promotions  │
├─────────────────────────────────────────┤
│ [Gmail message]                         │
│ [Gmail message]                         │
│ [Gmail message]                         │
└─────────────────────────────────────────┘
```

### Near Future (Multi-Channel)
```
┌─────────────────────────────────────────┐
│ 📨 All | 📧 Gmail | 💬 Slack | 📧 Outlook│
├─────────────────────────────────────────┤
│ 🔴 Critical (3)                         │
│ ├─ [Gmail] Client deadline - EOD        │
│ ├─ [Slack] @mention in #urgent          │
│ └─ [Outlook] Boss needs approval        │
│                                         │
│ 🟠 Important (8)                        │
│ ├─ [Gmail] Project update               │
│ ├─ [Slack] Design review ready          │
│ └─ ...                                  │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Gmail Testing Checklist
- [ ] Authentication flow
- [ ] Fetch all categories
- [ ] Display with correct formatting
- [ ] Actions work (archive, star, delete)
- [ ] AI analysis accuracy
- [ ] Priority scoring accuracy
- [ ] Search functionality
- [ ] Thread grouping
- [ ] Performance (handles 1000+ emails)
- [ ] Error handling
- [ ] Offline behavior

### Multi-Channel Testing (Future)
- [ ] Switch between channels seamlessly
- [ ] Unified search works
- [ ] Priority scoring consistent
- [ ] Actions work per channel
- [ ] No conflicts/race conditions
- [ ] Performance with multiple channels
- [ ] Memory usage reasonable

---

## 📊 Success Metrics

### Phase 1 (Gmail Perfect)
- ✅ Load 50 emails in <2 seconds
- ✅ AI analysis completes in <5 seconds
- ✅ Actions sync with Gmail immediately
- ✅ UI feels responsive and fast
- ✅ Users can process inbox 50% faster than Gmail
- ✅ Zero data loss
- ✅ 95%+ uptime

### Phase 4+ (Multi-Channel)
- ✅ Support 3+ channels
- ✅ Single interface for all
- ✅ Priority scoring >90% accurate
- ✅ Users save 2+ hours daily
- ✅ "Never miss important" confidence >95%

---

## 🛠️ Technical Debt to Address

### Before Scaling
- [ ] Proper error boundaries
- [ ] Loading states for all async operations
- [ ] Retry logic for failed requests
- [ ] Rate limiting handling
- [ ] Token refresh (OAuth)
- [ ] Data caching strategy
- [ ] State management (consider Redux/Zustand)
- [ ] Infinite scroll for large message lists
- [ ] Optimistic UI updates
- [ ] Undo functionality

---

## 📝 Current Sprint Plan

### This Week (Oct 20-26)
**Goal:** Perfect the Gmail message card and importance scoring

**Tasks:**
1. ✅ Fix email analysis timeout (done)
2. ✅ Fix email sorting (done)
3. ✅ Remove Profile/Hub redundancy (done)
4. ✅ Add Gmail category tabs (done)
5. ✅ Document vision (done)
6. ✅ Sender Trust Management System (3-tier: TRUSTED/BLOCKED/ONE_TIME)
7. ✅ Daily Stand-up API Integration (split-panel User/Aimi layout)
8. ✅ Enhanced "The One Thing" (expandable details, status tracking, task swapping)
9. 🔄 **Next: Test Daily Stand-up features thoroughly**
10. 🔄 **Next: Redesign message card for universal use**
11. 🔄 **Next: Implement importance color coding**
12. 🔄 **Next: Add quick action buttons**

### Next Week (Oct 27-Nov 2)
**Goal:** Complete Gmail feature set

**Tasks:**
1. Thread consolidation
2. Bulk actions
3. Keyboard shortcuts
4. Better search
5. Compose/reply improvements

---

## 🎯 Definition of "Gmail Perfect"

**We'll know Gmail is ready when:**
- ✅ Loads all 5 categories flawlessly
- ✅ AI prioritization feels smart & helpful
- ✅ Actions are fast and reliable
- ✅ UI is beautiful and intuitive
- ✅ Keyboard shortcuts work great
- ✅ Search finds what you need
- ✅ Handles high volume (100+ emails)
- ✅ You prefer using Hey Aimi over Gmail
- ✅ No bugs or glitches
- ✅ Ready to demo confidently

**Then we add Slack and validate the architecture scales!**

---

## 🚀 The Path Forward

```
Week 1-2:  Gmail Perfect ✨
            ↓
Week 3-4:  Architecture Abstraction 🏗️
            ↓
Week 5-6:  Add Slack (Validate Multi-Channel) 💬
            ↓
Week 7-8:  Add Outlook (Confirm Pattern) 📧
            ↓
Week 9+:   Add More Channels (WhatsApp, Teams...) 🚀
```

---

**Next Action:** Redesign the message card with channel badge, importance color, and quick actions - building the template for all future channels! 🎨

**Ready to start?** 💪
