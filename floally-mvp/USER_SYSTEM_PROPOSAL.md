# 🎯 User Profile & Authentication System - Strategic Plan

**Date:** October 18, 2025  
**Priority:** 🟡 MEDIUM-HIGH (Foundation for Growth)

---

## 🔍 Current State Analysis

### **What We Have Now (MVP):**

1. **Authentication:**
   - ✅ Google OAuth (email + calendar access)
   - ❌ No user accounts/database
   - ❌ No persistent sessions
   - ❌ Mock authentication (returns `user@example.com`)

2. **User Data Storage:**
   - ✅ File-based JSON storage (`user_profiles/`, `behavior_data/`)
   - ✅ Onboarding flow captures preferences
   - ❌ No database (all data in files)
   - ❌ No user ID system (uses email as identifier)

3. **Current Pain Points:**
   - "[User]" placeholder in greetings (no persistent display name)
   - Multiple Google accounts not supported
   - No way to save API keys per user
   - Preferences tied to email, not account
   - No proper session management

---

## 🎯 Why a User Profile System Makes Sense

### **Immediate Benefits:**

1. **Proper User Identity**
   - Real name displayed: "Good morning, Martin 🌞"
   - Profile picture (from Google or custom)
   - Persistent preferences across sessions

2. **Multi-Account Support**
   - Connect multiple Google accounts
   - Switch between work/personal emails
   - Unified view across all accounts

3. **Better Data Management**
   - User ID instead of email as identifier
   - Cleaner database structure
   - Easier to scale

4. **Enhanced Learning**
   - Aime learns per-user, not per-email
   - Behavioral data persists properly
   - Progress tracking over time

5. **Feature Enablement**
   - Subscription/billing (future)
   - Team accounts (future)
   - Integrations per user (Slack, Notion, etc.)

### **Long-Term Strategic Value:**

- **Scalability:** Proper database foundation
- **Monetization:** User accounts = subscription model
- **Product Growth:** Multi-user features, team plans
- **Data Intelligence:** Better ML/AI with user cohorts
- **Compliance:** GDPR, data export, account deletion

---

## 🏗️ Proposed Architecture

### **Tech Stack Recommendation:**

```
Frontend (Vercel):
- React + Vite ✅ (keep as-is)
- NextAuth.js (authentication)
- React Query (data fetching)

Backend (Railway):
- FastAPI ✅ (keep as-is)
- PostgreSQL (database - Railway add-on)
- SQLAlchemy (ORM)
- Alembic (migrations)

Authentication:
- NextAuth.js or Auth0
- Google OAuth ✅ (existing)
- Email/password (optional)
- Magic links (passwordless)
```

### **Database Schema (Simplified):**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles (onboarding data)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    role VARCHAR(100),
    priorities JSONB,
    decision_style VARCHAR(50),
    communication_style VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
    onboarding_completed BOOLEAN DEFAULT FALSE
);

-- Connected accounts (multiple Google accounts)
CREATE TABLE connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50), -- 'google', 'microsoft', etc.
    provider_account_id VARCHAR(255),
    email VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Behavior logs (learning data)
CREATE TABLE behavior_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    email_id VARCHAR(255),
    sender_email VARCHAR(255),
    sender_domain VARCHAR(255),
    action_type VARCHAR(50),
    email_category VARCHAR(50),
    confidence_score FLOAT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User settings
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    ai_preferences JSONB,
    notification_preferences JSONB,
    privacy_settings JSONB,
    email_management JSONB
);
```

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1-2) - RECOMMENDED START**

**Goal:** Basic user accounts + database

**Tasks:**
1. ✅ Set up PostgreSQL on Railway
2. ✅ Create database schema (SQLAlchemy models)
3. ✅ Migrate existing file-based data to DB
4. ✅ Update backend to use database
5. ✅ Add user registration flow
6. ✅ Implement proper session management

**Deliverables:**
- Users can sign up with email
- Google OAuth creates user account
- Display name saved and shown
- Onboarding data in database

**Impact:**
- ✅ "Good morning, Martin 🌞" (real name)
- ✅ Persistent user data
- ✅ Foundation for all future features

---

### **Phase 2: Multi-Account Support (Week 3)**

**Goal:** Connect multiple Google accounts

**Tasks:**
1. ✅ Add "Connected Accounts" table
2. ✅ OAuth flow for additional accounts
3. ✅ Account switcher UI
4. ✅ Unified inbox across accounts

**Deliverables:**
- Connect work + personal Gmail
- Switch between accounts
- Combined view option

**Impact:**
- ✅ Manage multiple identities
- ✅ Unified productivity view
- ✅ Better for freelancers/multi-role users

---

### **Phase 3: Enhanced Profile (Week 4)**

**Goal:** Rich user profiles + customization

**Tasks:**
1. ✅ Profile picture upload
2. ✅ Extended preferences
3. ✅ API key management (per-user Anthropic key)
4. ✅ Export/import data (GDPR)

**Deliverables:**
- Upload custom profile picture
- Store personal AI API keys
- Data export feature

**Impact:**
- ✅ Personalized experience
- ✅ BYOK (Bring Your Own Key) option
- ✅ GDPR compliance

---

### **Phase 4: Advanced Features (Month 2+)**

**Goal:** Premium features + monetization

**Tasks:**
1. ✅ Subscription tiers (Stripe)
2. ✅ Team accounts
3. ✅ Advanced integrations (Slack, Notion)
4. ✅ Usage analytics per user

**Deliverables:**
- Free tier (limited) vs Premium
- Team/workspace accounts
- Integration marketplace

**Impact:**
- 💰 Revenue from subscriptions
- 👥 Team/enterprise customers
- 📈 Product-market fit validation

---

## 💡 Quick Win: Minimal User System (This Week)

If you want to start small, here's a **minimal viable user system**:

### **Option A: PostgreSQL + Minimal Schema (2-3 days)**

1. Add PostgreSQL to Railway
2. Create just 2 tables: `users` + `user_profiles`
3. Migrate file-based profiles to DB
4. Update backend to query DB instead of files
5. Keep Google OAuth as-is

**Result:** 
- Real names show up
- Persistent user data
- Foundation for growth

### **Option B: Keep Files, Add User ID (1 day)**

1. Generate UUID for each user on first login
2. Store in `user_session.json`
3. Use UUID as folder name instead of email
4. Update profile storage to include display_name

**Result:**
- Quick fix for name display
- Better file organization
- Easy migration to DB later

---

## 🎯 My Recommendation

### **Start with Phase 1 (PostgreSQL + User Accounts)**

**Why:**
1. **Foundation for Everything:** Database is essential for scale
2. **Solves Current Issues:** "[User]" problem goes away
3. **Enables Future Features:** Can't do subscriptions/teams without it
4. **Industry Standard:** Moving from files to DB is inevitable
5. **Railway Makes It Easy:** PostgreSQL add-on is one-click

**Timeline:**
- **Day 1-2:** Set up PostgreSQL, create schema
- **Day 3-4:** Migrate data, update backend
- **Day 5-6:** Add user registration, test
- **Day 7:** Deploy and verify

**Effort:** ~1 week of focused development  
**Impact:** 🔥 HIGH - Unlocks all future growth

---

## 🛠️ Technical Implementation Guide

### **Step 1: Add PostgreSQL to Railway**

```bash
# In Railway dashboard:
1. Go to your project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway auto-provisions database
4. Copy DATABASE_URL from variables
```

### **Step 2: Update Backend Dependencies**

```bash
# backend/requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23  # NEW
psycopg2-binary==2.9.9  # NEW (PostgreSQL driver)
alembic==1.12.1  # NEW (migrations)
python-dotenv==1.0.0
# ... rest of existing dependencies
```

### **Step 3: Create Database Models**

```python
# backend/app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    display_name = Column(String(255))
    avatar_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True)
    role = Column(String(100))
    priorities = Column(JSON)
    decision_style = Column(String(50))
    communication_style = Column(String(50))
    onboarding_completed = Column(Boolean, default=False)
    # ... rest of fields
```

### **Step 4: Migration Script**

```python
# scripts/migrate_files_to_db.py
import json
from pathlib import Path
from app.models import User, UserProfile
from app.database import SessionLocal

def migrate_user_profiles():
    """Migrate file-based profiles to database"""
    profiles_dir = Path("user_profiles")
    
    for profile_file in profiles_dir.glob("*.json"):
        with open(profile_file) as f:
            data = json.load(f)
        
        # Create user
        user = User(
            email=data.get("user_id"),
            display_name=data.get("display_name")
        )
        
        # Create profile
        profile = UserProfile(
            user_id=user.id,
            role=data.get("role"),
            priorities=data.get("priorities"),
            # ... rest of fields
        )
        
        session.add(user)
        session.add(profile)
    
    session.commit()
```

---

## 📊 Decision Matrix

| Option | Effort | Impact | Timeline | Future-Proof |
|--------|--------|--------|----------|--------------|
| **Keep Files** | Low | Low | N/A | ❌ No |
| **File + UUID** | Low | Medium | 1 day | ⚠️ Partial |
| **PostgreSQL** | Medium | High | 1 week | ✅ Yes |
| **Full Auth System** | High | Very High | 2-3 weeks | ✅ Yes |

**My Recommendation:** ⭐ **PostgreSQL** (best balance of effort/impact)

---

## 🎯 Next Steps

### **If You Want to Proceed:**

1. **Decision:** Confirm you want to add PostgreSQL + user system
2. **I'll Create:**
   - Database schema
   - SQLAlchemy models
   - Migration scripts
   - Updated API endpoints
   - User registration flow
3. **We'll Deploy:**
   - Add PostgreSQL to Railway
   - Run migrations
   - Test thoroughly
   - Deploy to production

### **Timeline Estimate:**
- **Setup (Day 1-2):** Database + models + migrations
- **Backend (Day 3-4):** Update APIs to use DB
- **Frontend (Day 5-6):** User registration UI
- **Testing (Day 7):** End-to-end testing
- **Total:** ~1 week focused development

---

## 💬 Questions to Consider

1. **Do you want email/password auth** or Google-only?
2. **Multi-account support** in Phase 1 or later?
3. **User can bring their own Anthropic API key** (advanced feature)?
4. **Team/workspace accounts** needed soon?
5. **Subscription/billing** timeline (affects schema design)?

---

**Ready to build this?** Let me know and I can start with the database schema and migration plan! 🚀

---

**Last Updated:** October 18, 2025  
**Status:** Proposal - Awaiting Decision  
**Recommendation:** ⭐ Implement Phase 1 (PostgreSQL + User Accounts)
