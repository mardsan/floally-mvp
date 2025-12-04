# Hey Aimi Subscription & Monetization Plan

**Date:** October 21, 2025  
**Status:** Implementation Ready  
**Version:** 1.0

---

## 💰 Pricing & Tiers (FINALIZED)

### **Free Trial**
- **Duration:** 7 days
- **Price:** $0
- **Limits:**
  - 1 active project
  - Claude 3 Haiku (fast, basic reasoning)
  - 50 email analyses per day
  - 7-day message history
  - Basic standup dashboard
- **Goal:** Hook users with emotional connection to Aimi, demonstrate clear value

### **Professional**
- **Price:** $49/month
- **Target:** Individual professionals, entrepreneurs, knowledge workers
- **Limits:**
  - 3-5 active projects (recommend 3 as sweet spot)
  - Claude 3.5 Sonnet (advanced reasoning)
  - Unlimited email analysis
  - 500K AI tokens/month (~15K emails analyzed)
  - 30-day history + behavioral insights
  - Priority email support
- **Value Prop:** "Your AI executive assistant for less than a lunch meeting"

### **Executive**
- **Price:** $129/month
- **Target:** Senior leaders, founders, executives managing complex workloads
- **Limits:**
  - Unlimited projects
  - Model selection (Claude Opus, GPT-4, custom)
  - Unlimited AI tokens
  - Full history + advanced analytics
  - Team collaboration features (future)
  - White-glove onboarding call
  - Priority chat support
  - API access (future)
- **Value Prop:** "The AI partner built for high-stakes decision makers"

### **Token Add-Ons**
- **$10 for 100K tokens** (~3K email analyses)
- Auto-recharge option available
- Rollover to next month (up to 1 month)

---

## 🎨 Brand Voice & Positioning

### **Core Tagline:**
> "Stay in flow. Never drop the ball."

**Why This Works:**
- **"Stay in flow"** = Joy, engagement, meaningful work
- **"Never drop the ball"** = Security, reliability, peace of mind
- **Together:** Liberation to do what you love + confidence nothing's falling through

### **Supporting Messages:**

**Homepage Hero:**
"Meet Aimi, your AI partner who keeps you focused on what matters while making sure nothing slips through the cracks."

**How It Works:**
"Aimi learns your goals, monitors your communications, and surfaces only what needs your attention—so you can stay in flow with the work you love."

**For Professionals:**
"Stop drowning in email. Start doing your best work. Aimi's got your back."

**For Executives:**
"Lead with clarity. Aimi handles the noise, you handle what matters."

### **Aimi's Personality:**

**Voice Attributes:**
- Supportive, not bossy
- Intelligent, not robotic
- Personal, not invasive
- Confident, not arrogant
- Warm, not overly casual

**Example Communications:**

*On Trial Start:*
"Hey! I'm Aimi, your new AI partner. Let's get to know each other. Tell me about your current projects and I'll help you stay focused on what matters most. Ready to start?"

*Day 3 of Trial:*
"Quick check-in: I've analyzed 127 emails this week and helped you focus on 8 truly important ones. You've completed your main focus task 2 days in a row—that's awesome! 🎉 Feeling the difference yet?"

*Day 6 of Trial (conversion moment):*
"We make a great team! This week you stayed focused on your goals while I handled 215 distractions. Your trial ends tomorrow—want to keep our partnership going?"

*On Upgrade:*
"Welcome to Professional! 🎉 Now we can really dig deep. I'm unlocking advanced reasoning, more project capacity, and unlimited analysis. Let's do great things together."

*On Token Limit Approaching:*
"Heads up: You've used 450K of your 500K monthly tokens (90%). Want me to be more selective for the rest of the month, or ready to add a token pack? Either way, your important stuff is covered—I promise."

*On Project Completion:*
"🎊 You did it! 'Launch Feature X' is complete. I saw you stay focused through 3 weeks of emails, meetings, and deadlines. That's what I call getting it done. What's next?"

---

## 🏗️ Technical Implementation

### **Phase 1: Database Schema (Week 1)**

#### User Subscription Table
```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    tier VARCHAR(20) NOT NULL, -- 'free_trial', 'professional', 'executive'
    status VARCHAR(20) NOT NULL, -- 'active', 'trialing', 'past_due', 'canceled', 'paused'
    
    -- Trial tracking
    trial_started_at TIMESTAMP,
    trial_ends_at TIMESTAMP,
    trial_converted BOOLEAN DEFAULT FALSE,
    
    -- Billing
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
    next_billing_date DATE,
    
    -- Token usage
    tokens_used_this_month INTEGER DEFAULT 0,
    tokens_limit INTEGER, -- NULL for unlimited (executive)
    tokens_reset_date DATE,
    auto_recharge BOOLEAN DEFAULT FALSE,
    
    -- Limits based on tier
    max_active_projects INTEGER DEFAULT 1,
    ai_model VARCHAR(50) DEFAULT 'claude-3-haiku',
    features JSONB, -- Flexible feature flags
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    canceled_at TIMESTAMP,
    
    UNIQUE(user_id)
);
```

#### Project Schema (Enhanced)
```sql
CREATE TABLE user_projects (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    
    -- Basic info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'archived'
    is_primary BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 99,
    
    -- From onboarding
    goal TEXT NOT NULL,
    why_important TEXT,
    success_criteria TEXT,
    deadline DATE,
    
    -- Detailed planning (added later)
    milestones JSONB DEFAULT '[]',
    stakeholders JSONB DEFAULT '[]',
    related_keywords TEXT[],
    time_commitment_hours INTEGER,
    
    -- AI insights
    ai_health_score INTEGER, -- 0-100
    ai_risk_factors TEXT[],
    ai_recommendations TEXT[],
    last_ai_analysis TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    archived_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT one_primary_per_user EXCLUDE (user_id WITH =) WHERE (is_primary = true)
);
```

#### Token Usage Tracking
```sql
CREATE TABLE token_usage_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    operation_type VARCHAR(50), -- 'email_analysis', 'standup_generation', 'project_insight'
    tokens_used INTEGER,
    ai_model VARCHAR(50),
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB -- Store context like message_id, project_id, etc.
);

-- Index for monthly aggregation
CREATE INDEX idx_token_usage_monthly ON token_usage_log(user_id, timestamp);
```

---

### **Phase 2: Stripe Integration (Week 1-2)**

#### Backend API Endpoints

**Subscription Management:**
```python
# backend/app/routers/subscription.py

from fastapi import APIRouter, Depends, HTTPException
from stripe import Stripe
import os

router = APIRouter(prefix="/api/subscription", tags=["subscription"])
stripe_client = Stripe(api_key=os.getenv("STRIPE_SECRET_KEY"))

@router.post("/create-checkout")
async def create_checkout_session(
    user_email: str,
    tier: str,  # 'professional' or 'executive'
    success_url: str,
    cancel_url: str
):
    """Create Stripe checkout session for new subscription"""
    
    # Define price IDs (set in Stripe dashboard)
    price_ids = {
        'professional': os.getenv('STRIPE_PRICE_PROFESSIONAL'),
        'executive': os.getenv('STRIPE_PRICE_EXECUTIVE')
    }
    
    try:
        session = stripe_client.checkout.sessions.create(
            customer_email=user_email,
            payment_method_types=['card'],
            line_items=[{
                'price': price_ids[tier],
                'quantity': 1
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            subscription_data={
                'trial_period_days': 7,
                'metadata': {
                    'user_email': user_email,
                    'tier': tier
                }
            }
        )
        
        return {
            'checkout_url': session.url,
            'session_id': session.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks for subscription events"""
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe_client.webhooks.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail='Invalid signature')
    
    # Handle different event types
    if event['type'] == 'customer.subscription.created':
        await handle_subscription_created(event['data']['object'])
    
    elif event['type'] == 'customer.subscription.updated':
        await handle_subscription_updated(event['data']['object'])
    
    elif event['type'] == 'customer.subscription.deleted':
        await handle_subscription_canceled(event['data']['object'])
    
    elif event['type'] == 'invoice.payment_succeeded':
        await handle_payment_succeeded(event['data']['object'])
    
    elif event['type'] == 'invoice.payment_failed':
        await handle_payment_failed(event['data']['object'])
    
    return {'status': 'success'}


@router.get("/status")
async def get_subscription_status(user_email: str):
    """Get current subscription status for user"""
    
    subscription = await db.get_subscription(user_email)
    
    if not subscription:
        return {
            'tier': 'free_trial',
            'status': 'none',
            'can_start_trial': True
        }
    
    # Calculate days left in trial
    if subscription['status'] == 'trialing':
        days_left = (subscription['trial_ends_at'] - datetime.now()).days
    else:
        days_left = 0
    
    # Token usage
    token_usage_percent = None
    if subscription['tokens_limit']:
        token_usage_percent = (subscription['tokens_used_this_month'] / subscription['tokens_limit']) * 100
    
    return {
        'tier': subscription['tier'],
        'status': subscription['status'],
        'trial_ends_at': subscription['trial_ends_at'],
        'days_left_in_trial': days_left,
        'tokens_used': subscription['tokens_used_this_month'],
        'tokens_limit': subscription['tokens_limit'],
        'token_usage_percent': token_usage_percent,
        'max_active_projects': subscription['max_active_projects'],
        'ai_model': subscription['ai_model'],
        'next_billing_date': subscription['next_billing_date']
    }


@router.post("/purchase-tokens")
async def purchase_token_pack(
    user_email: str,
    pack_size: int = 100000  # Default 100K tokens
):
    """One-time purchase of additional tokens"""
    
    session = stripe_client.checkout.sessions.create(
        customer_email=user_email,
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'unit_amount': 1000,  # $10.00
                'product_data': {
                    'name': f'{pack_size//1000}K Token Pack',
                    'description': 'Additional AI analysis tokens'
                }
            },
            'quantity': 1
        }],
        mode='payment',
        success_url=f"{os.getenv('FRONTEND_URL')}/tokens/success",
        cancel_url=f"{os.getenv('FRONTEND_URL')}/tokens/cancel"
    )
    
    return {'checkout_url': session.url}
```

---

### **Phase 3: Enhanced Onboarding (Week 2)**

#### New Onboarding Step: Project Setup

```jsx
// components/OnboardingFlow.jsx - Add Step 4

const ProjectSetupStep = ({ onComplete, onSkip }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectData, setProjectData] = useState({
    name: '',
    goal: '',
    why_important: '',
    deadline: ''
  });
  const [aimyResponse, setAimyResponse] = useState('');

  const templates = [
    {
      id: 'work_project',
      icon: '💼',
      title: 'Work Project',
      description: 'Launch, deadline, or deliverable',
      example: {
        name: 'Launch Product Feature X',
        goal: 'Ship Feature X with 1000 beta users by Nov 15',
        why_important: 'Career milestone, promotion depends on successful launch'
      }
    },
    {
      id: 'get_organized',
      icon: '📋',
      title: 'Get Organized',
      description: 'Manage inbox, stay on top of things',
      example: {
        name: 'Master My Inbox',
        goal: 'Achieve inbox zero and maintain it',
        why_important: 'Reduce stress, never miss important messages'
      }
    },
    {
      id: 'personal_goal',
      icon: '🎯',
      title: 'Personal Goal',
      description: 'Learn, grow, or achieve something',
      example: {
        name: 'Learn Spanish',
        goal: 'Conversational Spanish for upcoming trip in 6 months',
        why_important: 'Connect with local culture, personal growth'
      }
    },
    {
      id: 'custom',
      icon: '✨',
      title: 'Something Else',
      description: 'Tell Aimi in your own words',
      example: null
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    if (template.example) {
      setProjectData(template.example);
    }
  };

  const generateAimyResponse = () => {
    if (!projectData.name || !projectData.goal) return;
    
    const responses = [
      `Perfect! I'll help you with "${projectData.name}". I'll watch your inbox for anything related to this goal and surface what needs your attention.`,
      `Got it! "${projectData.name}" sounds important. I'll keep an eye out for messages that could help or hinder this goal.`,
      `Love it! Let's make "${projectData.name}" happen. I'll filter your communications and help you stay focused on what moves this forward.`
    ];
    
    setAimyResponse(responses[Math.floor(Math.random() * responses.length)]);
  };

  useEffect(() => {
    generateAimyResponse();
  }, [projectData.name, projectData.goal]);

  const handleCreate = async () => {
    try {
      await api.projects.create({
        ...projectData,
        is_primary: true,
        status: 'active'
      });
      onComplete();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          What brings you to Hey Aimi?
        </h2>
        <p className="text-lg text-gray-600">
          Help Aimi understand what you want to accomplish. This context helps her 
          know what's important and what's just noise.
        </p>
      </div>

      {/* Template Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className={`p-6 border-2 rounded-xl hover:border-teal-500 text-left transition-all ${
              selectedTemplate?.id === template.id 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="text-4xl mb-3">{template.icon}</div>
            <h3 className="font-bold text-lg mb-1">{template.title}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </button>
        ))}
      </div>

      {/* Project Form */}
      {selectedTemplate && (
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-xl border-2 border-teal-200 space-y-6">
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              Give this project a name
            </label>
            <input
              type="text"
              placeholder="e.g., Launch Product Feature X"
              className="w-full p-4 border-2 border-teal-200 rounded-lg text-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              What do you want to accomplish?
            </label>
            <textarea
              placeholder="e.g., Ship Feature X with 1000 beta users by Nov 15"
              className="w-full p-4 border-2 border-teal-200 rounded-lg text-lg h-28 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
              value={projectData.goal}
              onChange={(e) => setProjectData({ ...projectData, goal: e.target.value })}
            />
            <p className="text-sm text-gray-600 mt-2">
              Don't worry about details yet—just the big picture.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              Why is this important to you?
            </label>
            <textarea
              placeholder="e.g., This is a career milestone, my promotion depends on it"
              className="w-full p-4 border-2 border-teal-200 rounded-lg h-24 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
              value={projectData.why_important}
              onChange={(e) => setProjectData({ ...projectData, why_important: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              When do you need this done? (optional)
            </label>
            <input
              type="date"
              className="w-full p-4 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
              value={projectData.deadline}
              onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Aimi's Response */}
      {aimyResponse && projectData.name && projectData.goal && (
        <div className="bg-white p-6 rounded-xl border-2 border-teal-300 shadow-lg">
          <div className="flex items-start gap-4">
            <img 
              src="/aimi-pfp-01.png" 
              alt="Aimi" 
              className="w-16 h-16 rounded-full ring-4 ring-teal-200"
            />
            <div className="flex-1">
              <p className="font-bold text-teal-800 mb-2">Aimi says:</p>
              <p className="text-gray-800 text-lg leading-relaxed">
                {aimyResponse}
              </p>
              <p className="text-gray-600 mt-3">
                We'll refine the details together as we go. Ready to get started?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Skip for now
        </button>
        <button
          onClick={handleCreate}
          disabled={!projectData.name || !projectData.goal}
          className="px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start with this project →
        </button>
      </div>
    </div>
  );
};
```

---

### **Phase 4: Subscription UI Components (Week 2-3)**

#### Subscription Banner
```jsx
// components/SubscriptionBanner.jsx - Full implementation
// (See earlier in conversation for complete code)
```

#### Pricing Page
```jsx
// pages/Pricing.jsx - Full implementation
// (See earlier in conversation for complete code)
```

#### Settings Integration
```jsx
// Add to AimySettings.jsx

<div className="mb-8 pb-8 border-b">
  <h3 className="text-xl font-bold mb-4">Subscription</h3>
  
  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-lg border-2 border-teal-200">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm text-gray-600">Current Plan</p>
        <p className="text-2xl font-bold text-teal-800 capitalize">
          {subscription.tier.replace('_', ' ')}
        </p>
      </div>
      {subscription.status === 'trialing' && (
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
          Trial: {daysLeft} days left
        </span>
      )}
    </div>
    
    <div className="space-y-2 mb-4 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Active Projects</span>
        <span className="font-medium">
          {activeProjects.length} / {subscription.max_active_projects}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">AI Model</span>
        <span className="font-medium capitalize">
          {subscription.ai_model.replace('claude-', '').replace('-', ' ')}
        </span>
      </div>
      {subscription.tokens_limit && (
        <div className="flex justify-between">
          <span className="text-gray-600">Tokens This Month</span>
          <span className="font-medium">
            {subscription.tokens_used.toLocaleString()} / {subscription.tokens_limit.toLocaleString()}
          </span>
        </div>
      )}
    </div>
    
    <div className="flex gap-3">
      {subscription.tier !== 'executive' && (
        <button 
          onClick={handleUpgrade}
          className="flex-1 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Upgrade Plan
        </button>
      )}
      <button 
        onClick={handleManageBilling}
        className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-all"
      >
        Manage Billing
      </button>
    </div>
  </div>
</div>
```

---

## 📊 Success Metrics to Track

### **Conversion Funnel:**
1. **Trial Starts** → Target: 100/month by end of Q4
2. **Onboarding Completion** → Target: 80% complete all steps
3. **First Project Created** → Target: 90% create at least one
4. **Day 3 Engagement** → Target: 70% return on day 3
5. **Trial to Paid Conversion** → Target: 25-30%

### **Retention:**
1. **30-Day Retention** → Target: 80%
2. **90-Day Retention** → Target: 70%
3. **Churn Rate** → Target: <5% monthly

### **Value Metrics:**
1. **Average Project Completion Time** → Track improvement
2. **Email Reduction** → % of emails users no longer need to see
3. **User-Reported "Flow Time"** → Hours per week in flow
4. **NPS Score** → Target: 50+

---

## 🚀 Launch Checklist

### **Week 1: Foundation**
- [ ] Set up Stripe account
- [ ] Create product/price IDs in Stripe
- [ ] Implement subscription database schema
- [ ] Build Stripe webhook handler
- [ ] Create subscription API endpoints
- [ ] Add project creation to onboarding

### **Week 2: UI & Integration**
- [ ] Build subscription banner component
- [ ] Create pricing page
- [ ] Add upgrade CTAs throughout app
- [ ] Implement project limit enforcement
- [ ] Build token tracking system
- [ ] Add billing management page

### **Week 3: Polish & Testing**
- [ ] Test full payment flow (trial → paid)
- [ ] Test token limit warnings
- [ ] Test project limit enforcement
- [ ] Write confirmation emails
- [ ] Set up analytics tracking
- [ ] Create admin dashboard for monitoring

### **Week 4: Launch Prep**
- [ ] Legal: Terms of Service, Privacy Policy
- [ ] Marketing: Landing page copy
- [ ] Support: Help docs, FAQ
- [ ] Set up customer support system
- [ ] Beta test with 10-20 users
- [ ] Launch! 🚀

---

## 💡 Next Immediate Action

**Start with database schema and Stripe setup this week.** This unblocks everything else and is invisible to users until we're ready to launch subscription features.

Ready to begin? 🎯
