# 📧 Enhanced Messages Module - User Guide

## Overview
The Smart Messages module is an AI-powered communication hub that learns your preferences and prioritizes the most important messages across all your inboxes.

---

## 🎯 Key Features

### 1. **AI-Powered Curation**
- **Aimy analyzes** each message for importance and relevance
- **Composite scoring** combines:
  - AI analysis (50%)
  - Your sender behavior history (30%)
  - Gmail importance flags (20%)
- **Smart suggestions**: read_now, read_later, archive, unsubscribe

### 2. **Gmail-Style Categories**
Click category tabs to filter messages:
- **📬 All Messages**: Everything in one view
- **👤 Primary**: Real people and important contacts
- **👥 Social**: Social networks (LinkedIn, Twitter, etc.)
- **🏷️ Promotions**: Deals, offers, marketing emails
- **📋 Updates**: Receipts, confirmations, bills

### 3. **Importance Indicators**
Every message shows an importance icon:
- 🔴 **Critical** (80-100%): Needs immediate attention
- 🟡 **Important** (60-79%): High priority
- 🔵 **Medium** (40-59%): Normal priority
- ⚪ **Low** (0-39%): Can wait or archive

### 4. **Train Aimy**
Click the 🎓 icon on any message to teach Aimy your preferences:
- **🔴 Critical**: Highly important, always prioritize this sender
- **🟡 Interesting**: Worth reading but not urgent
- **⚪ Unimportant**: Can ignore/archive
- **🗑️ Junk**: Spam/trash

Aimy learns from your feedback and improves over time!

---

## 🔧 How to Use

### **Toggle AI Analysis**
- **✨ AI Enabled** (green button): Uses AI to analyze and rank messages
- **⚡ Enable AI** (gray button): Falls back to simple chronological list

### **View Message Details**
Click any message to open the full preview popup with:
- Full email content
- AI reasoning for importance score
- Quick actions (Reply, Archive, Delete, etc.)
- Train Aimy section

### **Quick Actions in Popup**
- **📧 Open in Gmail**: View in your Gmail inbox
- **↩️ Reply**: Compose reply (opens reply box)
- **📥 Archive**: Remove from inbox but keep in archive
- **🚫 Unsubscribe**: One-click unsubscribe (for newsletters)
- **🗑️ Delete**: Move to trash

---

## 🤖 How AI Scoring Works

Aimy analyzes each message considering:

1. **User Context**
   - Your role and job title
   - Your stated priorities
   - Your active projects

2. **Message Signals**
   - Sender (known contact vs unknown)
   - Category (Primary vs Promotional)
   - Gmail flags (Important, Starred)
   - Unsubscribe links (likely newsletter)
   - Subject keywords
   - Message content

3. **Behavioral History**
   - How you've treated past messages from this sender
   - Your response patterns
   - Your feedback ratings

4. **Composite Score**
   ```
   Final Score = (AI Score × 0.5) + (Sender Score × 0.3) + (Gmail Flags × 0.2)
   ```

---

## 📊 Behavioral Learning

### **What Gets Tracked**
- Which senders you mark as important/critical
- Which senders you archive or delete
- Response rates per sender
- Time spent reading messages

### **Privacy**
- All behavior data is private to your account
- Used only to personalize your experience
- Never shared or used for ads
- Can be disabled in Settings

### **How It Improves**
The more you use the feedback system, the better Aimy becomes at:
- Predicting which messages you'll care about
- Filtering out noise automatically
- Prioritizing time-sensitive communications
- Learning your unique communication patterns

---

## 🎨 Visual Indicators

### **Message Cards**
- **Bold text**: Unread messages
- **Category badges**: Shows message category
- **⭐ Star**: Gmail-starred message
- **❗ Exclamation**: Gmail-marked important
- **💡 Blue box**: AI reasoning/insight

### **Suggested Actions**
- **Red badge**: Read now (urgent)
- **Yellow badge**: Read later (important)
- **Gray badge**: Archive (low priority)
- **Blue badge**: Unsubscribe (newsletter)

---

## 🚀 Pro Tips

1. **Use Feedback Regularly**: The first 20-30 feedback ratings teach Aimy your preferences quickly
2. **Check Primary First**: Most critical messages appear here
3. **Archive Promotions**: Use the Archive button to keep promotions out of your way
4. **Unsubscribe Newsletters**: One-click unsubscribe from unwanted newsletters
5. **Toggle AI Off**: If you prefer chronological order, disable AI temporarily
6. **Train on Edge Cases**: When AI gets it wrong, use feedback to correct it

---

## 🔄 Data Flow

1. **Fetch**: Pull messages from Gmail (all categories)
2. **Deduplicate**: Remove duplicate threads
3. **Score Senders**: Calculate importance from your behavior history
4. **AI Analysis**: Claude analyzes content and context
5. **Composite Scoring**: Combine all signals
6. **Sort & Display**: Show highest-priority messages first
7. **Learn**: Record your interactions to improve future predictions

---

## 🐛 Troubleshooting

### **AI analysis not working?**
- Check that the **✨ AI Enabled** button is active (green)
- Verify backend is running and API key is set
- Try refreshing the page

### **No messages showing?**
- Make sure you've connected your Google account
- Check if Gmail integration is active
- Try different category tabs

### **Wrong importance scores?**
- Use the 🎓 Train Aimy button to provide feedback
- Give it 10-20 ratings to calibrate
- Importance improves over time with usage

---

## 📈 Future Enhancements

Coming soon:
- [ ] Multi-account support (multiple Gmail accounts)
- [ ] Outlook integration
- [ ] Slack message integration
- [ ] Auto-response suggestions
- [ ] Smart threading (group related emails)
- [ ] Time-based importance (urgent deadlines)
- [ ] Meeting request detection
- [ ] Attachment preview
- [ ] Search and advanced filtering

---

## 💡 Example Use Cases

### **Morning Inbox Triage**
1. Open Messages module
2. Check **Primary** tab for critical emails
3. Quickly scan importance indicators (🔴/🟡)
4. Train Aimy on any misclassified messages
5. Archive or delete low-priority items
6. Open important ones in Gmail for full response

### **Newsletter Management**
1. Switch to **Promotions** tab
2. Scan for newsletters you don't read
3. Click message → **🚫 Unsubscribe**
4. Mark good newsletters as **🟡 Interesting**
5. Aimy learns which newsletters matter to you

### **Client Communication**
1. Train Aimy to mark client emails as **🔴 Critical**
2. Aimy automatically prioritizes all future emails from that client
3. Never miss an important client message
4. Quick access via **Primary** tab

---

## 🎯 Success Metrics

You'll know it's working when:
- ✅ Critical messages appear at the top
- ✅ Newsletters and promotions are deprioritized
- ✅ You spend less time sorting your inbox
- ✅ Important messages never get buried
- ✅ Aimy's suggestions match your intuition

---

**Built with ❤️ by OkAimy - Your AI-Powered Strategic Partner**
