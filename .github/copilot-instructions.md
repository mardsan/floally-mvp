# Hey Aimi — Copilot Instructions

## Project Overview
**Hey Aimi** is an AI-powered operational teammate that connects Gmail + Google Calendar with Claude AI to generate daily briefings and autonomous task handling. The product philosophy prioritizes **"Luminous Calm"** — trust, learning, and perceived partnership over feature complexity.

**Strategic Shift (December 2025):** Moving from "impressive AI inbox tool" to "trusted AI teammate that truly understands you." Every build decision must answer: _"Does this make Aimi feel more like a teammate who knows me and protects my day?"_

## Architecture

### Stack
- **Frontend:** React 18 + Vite + Tailwind CSS → Deployed to Vercel (heyaimi.com)
- **Backend:** FastAPI + Python 3.9+ → Deployed to Railway (floally-mvp-production.up.railway.app)
- **Database:** PostgreSQL (SQLAlchemy ORM)
- **AI:** Anthropic Claude (via `anthropic` Python SDK)
- **APIs:** Google OAuth2, Gmail API, Google Calendar API

### Repository Structure
```
floally-mvp/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app with lifespan for DB init
│   │   ├── database.py          # SQLAlchemy engine & session config
│   │   ├── init_db.py           # Creates all tables on startup
│   │   ├── routers/             # API endpoints (auth, gmail, calendar, ai, etc.)
│   │   ├── models/              # SQLAlchemy models (user.py, activity_event.py, trusted_sender.py)
│   │   └── services/            # Business logic
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Secrets (GOOGLE_CLIENT_ID, ANTHROPIC_API_KEY, DATABASE_URL)
│   └── venv/                    # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # MINIMAL entry point (9 lines) - DO NOT COMPLICATE
│   │   ├── components/
│   │   │   ├── CalmDashboard.jsx      # Main UI with internal routing
│   │   │   ├── AimiMemory.jsx         # AI memory transparency page
│   │   │   ├── ProjectsPage.jsx       # AI project wizard
│   │   │   └── ProfileHub.jsx         # User profile management
│   │   └── services/api.js      # Axios API client
│   ├── package.json
│   ├── vite.config.js
│   └── .env.local               # VITE_API_URL for backend connection
└── api/                         # Vercel serverless functions (projects.js, waitlist.js)
```

## Critical Development Rules

### React Version Stability
- **Use React 18.x ONLY** — React 19 has initialization bugs that broke production
- Never suggest upgrading to React 19 without explicit testing
- If lucide-react causes errors, remove it and use emojis/react-icons instead

### App.jsx Must Stay Minimal
Current [App.jsx](floally-mvp/frontend/src/App.jsx) is 9 lines. **DO NOT COMPLICATE IT** without discussing rationale. Previous complex versions caused cascading errors. Routing/auth logic lives in [CalmDashboard.jsx](floally-mvp/frontend/src/components/CalmDashboard.jsx).

### API Configuration Pattern
All API calls must handle dual environments:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://floally-mvp-production.up.railway.app' 
    : 'http://localhost:8000');
```
See [api.js](floally-mvp/frontend/src/services/api.js) for the canonical pattern.

### Database Models
All models inherit from `Base` (SQLAlchemy). Key models for AI contextual understanding:

**User & Profile:**
- `User`, `UserProfile`, `ConnectedAccount` — [user.py](floally-mvp/backend/app/models/user.py)
- Stores: role, priorities, communication_style, vip_senders

**Learning Engine (Context Layer 3):**
- `BehaviorAction` — Tracks every user action (archive, star, open, ignore)
- `SenderStats` — Aggregated sender importance scores (calculated from BehaviorAction)
- Used by: Importance scoring, auto-archive suggestions, priority ranking

**Relationship & Trust:**
- `TrustedSender` — [trusted_sender.py](floally-mvp/backend/app/models/trusted_sender.py)
- 3-tier system: TRUSTED, NEUTRAL, BLOCKED
- Auto-learned from user patterns + explicit user designation

**Feature Data:**
- `Project`, `StandupStatus` — Project tracking
- `ActivityEvent` — [activity_event.py](floally-mvp/backend/app/models/activity_event.py)

**Critical for AI Context:** When generating standups or analyzing emails, ALWAYS query:
1. `UserProfile` → Get priorities, role, style
2. `SenderStats` → Get importance scores for email senders
3. `BehaviorAction` → Understand past user behavior patterns
4. `TrustedSender` → Respect explicit trust levels

Database initialization happens in [init_db.py](floally-mvp/backend/app/init_db.py) via FastAPI lifespan in [main.py](floally-mvp/backend/app/main.py).

## Development Workflows

### Running Locally
Use [run-dev.sh](floally-mvp/run-dev.sh) to start both servers:
```bash
cd floally-mvp
./run-dev.sh
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

Or manually:
```bash
# Terminal 1 - Backend
cd floally-mvp/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend  
cd floally-mvp/frontend
npm run dev
```

### Environment Variables
**Backend** [.env](floally-mvp/backend/.env):
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth credentials
- `GOOGLE_REDIRECT_URI` — OAuth callback URL
- `ANTHROPIC_API_KEY` — Claude API key
- `DATABASE_URL` — PostgreSQL connection string (Railway provides this)

**Frontend** [.env.local](floally-mvp/frontend/.env.local):
- `VITE_API_URL` — Backend URL (Railway or localhost)

### Deployment
- **Frontend:** Vercel auto-deploys from main branch. Build config in [vercel.json](vercel.json)
- **Backend:** Railway auto-deploys from main branch. Uses [Procfile](floally-mvp/backend/Procfile)
- **Database:** PostgreSQL on Railway, initialized on first startup via [init_db.py](floally-mvp/backend/app/init_db.py)

## Design System — "Luminous Calm"

Design philosophy documented in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Key principles:

### Colors
- **Aimi Green:** `#65E6CF` — Primary brand color, glow effects
- **Deep Slate:** `#183A3A` — Text and structure
- **Soft Ivory:** `#F6F8F7` — Main backgrounds
- Tailwind custom classes: `aimi-green`, `deep-slate`, `soft-ivory`

### Typography
- **Font Stack:** Inter or Sofia Sans (soft, readable, not geometric)
- **Hierarchy:** Hero 3.5rem → H1 2.5rem → Body 1rem
- **Principle:** Short sentences, generous spacing, one thought per moment

### Visual Language
- **Rounded corners:** 12-20px (16px standard)
- **Shadows:** Very light, no harsh edges
- **Animations:** Subtle "breathing" effects, pulse on active states
- **Layout:** One primary focus per screen, progressive disclosure

## Product Strategy

Documented in [PRODUCT_STRATEGY.md](floally-mvp/PRODUCT_STRATEGY.md). Core principle:
> "Does this make Aimi feel more like a teammate who knows me and protects my day?"

### Top Priorities (Build These First)
1. **Behavior Learning Engine** ✅ — Track user actions (archive, star, ignore) to personalize recommendations
2. **Explicit Agency Framing** ✅ — Visual labels: ✅ HANDLED (green), 🟡 SUGGESTED (yellow), 🔵 YOUR CALL (blue)
3. **Contextual AI Brain** 🚧 — Multi-layered reasoning system (see AI Architecture section)
4. **Save My Day Button** — Single-click stress relief with AI-generated simplified plan

### Critical Problem to Solve
**Current Issue:** Aimi is too literal and surface-level. Spam/notifications get high priority while real people get ignored. Root causes:
- No deep contextual understanding of sender relationships
- Insufficient use of user profile + Aimi's memory
- Single-tier LLM approach (same model for all tasks)
- Missing semantic understanding of message importance

**Target State:** Aimi understands that:
- An email from your CEO's assistant is more important than LinkedIn notifications
- A "quick question" from a client is urgent even without deadline keywords
- Repeated patterns reveal relationships (weekly 1:1s, project threads, VIP contacts)

### What NOT to Build
- Complex dashboards with excessive metrics
- Silent autonomous actions without visibility
- Generic productivity features — focus on learning & trust

## Common Pitfalls

### Frontend
- **Don't use React 19** — Causes initialization errors
- **Keep App.jsx minimal** — Complex routing breaks things**Product philosophy & priorities (READ THIS FIRST)**
- [WORK_LOG_DEC13_2025.md](floally-mvp/WORK_LOG_DEC13_2025.md) — Strategic pivot details
- [VISION_UNIFIED_INBOX.md](floally-mvp/VISION_UNIFIED_INBOX.md) — Long-term vision for multi-channel integration
- **Import react-icons, not lucide-react** — lucide-react had initialization issues
- **All hooks before conditional returns** — Rules of Hooks violations cause crashes

### Backend
- **Always pass `user_email` to Gmail/Calendar APIs** — Required for multi-user OAuth
- **Use SQLAlchemy models, not raw SQL** — Except for migrations/admin tasks
- **CORS config uses `allow_origins=["*"]`** — Cannot use `allow_credentials=True` with wildcard
- **LLM selection matters for cost & latency:**
  - Use Haiku/GPT-4o-mini for high-volume, simple tasks (spam detection, categorization)
  - Use Sonnet/GPT-4 for contextual reasoning (importance scoring with user context)
  - Reserve Opus/o1 for rare, high-value moments ("Save My Day" planning)
  - Track token usage in responses for transparency and cost monitoring
- **Always load user context layers** — Don't analyze emails in isolation. Query UserProfile, SenderStats, TrustedSender before making recommendations

### Vercel Serverless Functions
- Located in [/api](api/) directory (NOT floally-mvp/frontend/api)
- Use Redis for data persistence (Vercel KV)
- Example: [projects.js](api/projects.js) handles CRUD + AI generation

## Key Documentation References

- [README.md](floally-mvp/README.md) — Setup guide
- [PROGRESS_DEC13.md](floally-mvp/PROGRESS_DEC13.md) — Latest feature completions
- [SESSION_HANDOFF_DEC13_2025.md](floally-mvp/SESSION_HANDOFF_DEC13_2025.md) — Detailed crisis history & fixes
- [PRODUCT_STRATEGY.md](floally-mvp/PRODUCT_STRATEGY.md) — Product philosophy & priorities
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Visual design guidelines

## AI Architecture — Contextual Understanding Brain

### Current State (Single-Tier)
All tasks use **Claude 3 Haiku** (`claude-3-haiku-20240307`):
- Daily standup generation → [ai.py](floally-mvp/backend/app/routers/ai.py)
- Email analysis → [messages.py](floally-mvp/backend/app/routers/messages.py)
- Response drafting → [ai.py](floally-mvp/backend/app/routers/ai.py)

**Problem:** Same model for simple categorization and complex reasoning. No deep contextual layers.

### Target State (Multi-Tier + Context Layers)

#### LLM Tiering Strategy
Use right model for each task complexity:

**Tier 1: Fast Classification** (GPT-4o-mini or Haiku)
- Spam detection
- Category assignment (work/personal/promotional)
- Basic importance scoring (0-100)
- Unsubscribe link detection
- ~$0.01 per 1000 emails

**Tier 2: Contextual Reasoning** (Claude 3.5 Sonnet or GPT-4)
- Sender relationship analysis
- Cross-message pattern detection
- Priority conflicts resolution
- "The One Thing" determination
- ~$0.15 per 10 analyses

**Tier 3: Strategic Planning** (Claude 3 Opus or o1)
- "Save My Day" planning
- Multi-day workload optimization
- Communication style drafting
- Complex decision trees
- Used sparingly for high-value moments

#### Context Layer Architecture

**Layer 1: Message Metadata** (Fast, always available)
```python
# From Gmail API directly
{
  "from": "sender@example.com",
  "subject": "...",
  "category": "primary|promotional|social",
  "is_starred": bool,
  "is_important": bool,  # Gmail's built-in signal
  "labels": ["INBOX", "UNREAD"],
}
```

**Layer 2: User Profile Context** (Loaded per session)
```python
# From user_profile table + behavioral data
{
  "role": "Product Designer",
  "priorities": ["Launch Q1 redesign", "Hire design lead", "Client feedback"],
  "communication_style": "warm_professional",
  "vip_senders": ["ceo@company.com", "top-client@brand.com"],
  "trusted_senders": [...],  # Auto-learned from TrustedSender model
  "sender_stats": {...}      # From BehaviorAction model
}
```

**Layer 3: Aimi's Evolving Memory** (Updated continuously)
```python
# From BehaviorAction tracking + sender_stats
{
  "learned_patterns": {
    "newsletters_you_archive": ["techcrunch@...", "linkedin@..."],
    "people_you_always_open": ["manager@company.com", "mentor@..."],
    "keywords_that_matter": ["deadline", "approval", "feedback"],
    "times_you_respond_fast": "9am-11am, 2pm-4pm"
  },
  "relationship_graph": {
    "manager@company.com": {"importance": 0.95, "avg_response_time": "15min"},
    "spam@promo.com": {"importance": 0.05, "consistent_archive": true}
  }
}
```

**Layer 4: Contextual Reasoning** (LLM-powered synthesis)
- Combine Layers 1-3 to answer: "Why does THIS message matter to THIS user NOW?"
- Consider: sender relationship, current priorities, past behavior, urgency signals
- Output: Rich explanation + confidence score + suggested action

### Implementation Pattern

#### Example: Email Importance Scoring (Multi-Tier)
```python
# Step 1: Fast filter (Tier 1 - Haiku/GPT-4o-mini)
basic_score = quick_importance_check(email_metadata)
if basic_score < 20:  # Obviously spam
    return {"priority": "low", "reason": "promotional content"}

# Step 2: Load user context (Layer 2-3)
user_context = get_user_profile_and_memory(user_email)

# Step 3: Contextual analysis (Tier 2 - Sonnet/GPT-4)
if email_from_unknown_sender or conflicting_signals:
    deep_analysis = contextual_reasoning_model.analyze({
        "email": email,
        "user_profile": user_context,
        "behavioral_history": sender_stats,
        "current_priorities": user_priorities
    })
    return deep_analysis

# Step 4: Apply learned patterns (Tier 1)
if sender in known_vip_list:
    return {"priority": "high", "reason": "VIP contact"}
```

### Prompt Pattern for Contextual Reasoning
```python
context = f"""
You are Aimi, {user_name}'s AI operational teammate.

USER PROFILE:
- Role: {role}
- Current Priorities: {priorities}
- Communication Style: {comm_style}

SENDER RELATIONSHIP:
- Email: {sender_email}
- Past interactions: {interaction_count} emails
- User's typical response time: {avg_response_time}
- User action history: {archive_rate}% archived, {star_rate}% starred

CURRENT MESSAGE:
From: {sender}
Subject: {subject}
Snippet: {snippet}
Category: {category}
Gmail Signals: {is_important}, {is_starred}

QUESTION: Given what you know about {user_name}, is this message important?
Consider:
1. Does sender match VIP contacts or current project priorities?
2. Is this a real person or automated notification?
3. What patterns has user shown with this sender?
4. What's the message asking for (action, FYI, spam)?

Return JSON:
{{
  "priority": "high|medium|low",
  "confidence": 0.0-1.0,
  "reasoning": "Why this matters (or doesn't) to {user_name}",
  "suggested_action": "reply|review|archive|snooze",
  "urgency": "today|this_week|when_possible"
}}
"""
```

### Claude Standup Generation
See [ai.py router](floally-mvp/backend/app/routers/ai.py) for current implementation.

**Enhancement Needed:** Inject user context + behavioral patterns into prompt:
- User's past "One Thing" selections → learn what they prioritize
- Sender importance scores from `sender_stats` table
- Recent activity patterns from `activity_events` table
- Return token usage for transparency

## Testing & Debugging

- **Frontend errors:** Check browser console + network tab
- **Backend errors:** Railway logs or local `backend/backend.log`
- **Database issues:** Run [init_db.py](floally-mvp/backend/app/init_db.py) manually to verify table creation
- **OAuth failures:** Verify `GOOGLE_REDIRECT_URI` matches Google Cloud Console exactly

When proposing changes, reference relevant session logs (e.g., [SESSION_HANDOFF_DEC13_2025.md](floally-mvp/SESSION_HANDOFF_DEC13_2025.md)) to avoid repeating past mistakes.
