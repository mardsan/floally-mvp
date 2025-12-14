# LLM Strategy & Model Selection Guide

## Current Status (December 14, 2025)

### API Keys Available
- ✅ **Anthropic Claude** - Configured
- ❌ **OpenAI GPT** - Not configured (but available if needed)

### Current Model Usage
| Endpoint | Current Model | Should Use | Reason |
|----------|--------------|------------|---------|
| **Contextual Scoring (deep analysis)** | ✅ Sonnet 3.5 | Sonnet 3.5 | Complex reasoning |
| Standup Generation | ❌ Haiku | **Sonnet 3.5** | Needs context understanding |
| Email Analysis | ❌ Haiku | **Sonnet 3.5** | Needs to understand importance |
| Response Drafting | ❌ Haiku | Haiku | Simple task |
| Project Planning | ❌ Haiku | **Sonnet 3.5** | Strategic thinking |
| Save My Day | ❌ Haiku | **Sonnet 3.5** | Critical user moment |
| Attachment Analysis | ❌ Haiku | Haiku | Simple extraction |
| Spam Detection | ❌ Haiku | Haiku | Fast classification |

## Claude Model Tiers

### Haiku (Fast & Cheap)
- **Cost**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- **Best For**: Simple classification, quick extraction, high-volume tasks
- **Use Cases**:
  - Spam detection
  - Category assignment
  - Attachment text extraction
  - Simple response drafting

### Sonnet 3.5 (Balanced - RECOMMENDED)
- **Cost**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Best For**: Reasoning, context understanding, nuanced decisions
- **Use Cases**:
  - ✅ Standup generation (understands priorities)
  - ✅ Email importance analysis (understands relationships)
  - ✅ Project planning (strategic thinking)
  - ✅ "Save My Day" triage (critical decisions)
  - ✅ Contextual scoring (deep analysis)

### Opus (Powerful & Expensive)
- **Cost**: ~$15 per 1M input tokens, ~$75 per 1M output tokens
- **Best For**: Rare, high-value moments requiring deep reasoning
- **Use Cases**:
  - Complex multi-day planning
  - Critical business decisions
  - Advanced strategy generation
  - **Recommendation**: Only use for premium features or explicit user requests

## OpenAI GPT Models

### GPT-4o-mini (Similar to Haiku)
- **Cost**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Cheaper than Haiku!**
- **Best For**: High-volume classification tasks

### GPT-4o (Similar to Sonnet)
- **Cost**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- **Slightly cheaper than Sonnet**
- **Best For**: General reasoning tasks

### o1-preview (Reasoning Model)
- **Cost**: ~$15 per 1M input tokens, ~$60 per 1M output tokens
- **Best For**: Complex problem-solving requiring step-by-step reasoning

## Recommended Architecture

### Tier 1: Fast Classification (Haiku or GPT-4o-mini)
```python
# Use for: spam, categories, simple extraction
model = "claude-3-haiku-20240307"  # or "gpt-4o-mini"
cost_per_1k_msgs = ~$0.01
```

### Tier 2: Contextual Reasoning (Sonnet 3.5 or GPT-4o)
```python
# Use for: standups, importance scoring, project planning
model = "claude-3-5-sonnet-20241022"  # or "gpt-4o"
cost_per_standup = ~$0.03
```

### Tier 3: Strategic Planning (Opus or o1)
```python
# Use for: rare high-value moments
model = "claude-3-opus-20240229"  # or "o1-preview"
cost_per_analysis = ~$0.50
```

## Priority Upgrades

### HIGH PRIORITY (Do Now)
1. **Standup Generation** → Upgrade to Sonnet 3.5
   - Most visible feature
   - Needs context awareness
   - Users see this daily
   - Cost impact: ~$0.03 per standup vs $0.005 (acceptable)

2. **Email Importance Analysis** → Upgrade to Sonnet 3.5
   - Core intelligence feature
   - Haiku misses nuances
   - Already partially using Sonnet in contextual_scoring.py

3. **"Save My Day"** → Upgrade to Sonnet 3.5
   - Critical emotional anchor
   - User is stressed - needs best AI
   - Low volume (button only clicked when needed)

### MEDIUM PRIORITY
4. **Project Planning** → Upgrade to Sonnet 3.5
   - Strategic thinking needed
   - Users expect quality here

### LOW PRIORITY (Keep Haiku)
5. Response Drafting - Haiku is fine (simple task)
6. Attachment Analysis - Haiku is fine (extraction only)
7. Spam Detection - Haiku is fine (fast classification)

## Cost Analysis

### Current Monthly Cost (All Haiku)
- 1000 standups/month: ~$5
- 10,000 email analyses/month: ~$10
- Total: **~$15/month**

### Recommended Monthly Cost (Tiered Approach)
- 1000 standups (Sonnet): ~$30
- 10,000 email analyses (80% fast + 20% deep): ~$25
- Project planning (Sonnet): ~$5
- Total: **~$60/month**

**4x cost increase for significantly better intelligence**

### If We Add OpenAI (Hybrid)
- Fast tasks (GPT-4o-mini): 40% cheaper than Haiku
- Could reduce total cost to **~$45/month**
- Benefit: Fallback if Anthropic has issues

## Implementation Plan

### Phase 1: Upgrade Critical Paths (1-2 hours)
```python
# 1. Standup generation (ai.py line 120)
model="claude-3-5-sonnet-20241022"

# 2. Email analysis (messages.py line 105)  
model="claude-3-5-sonnet-20241022"

# 3. Save My Day (ai.py line 651)
model="claude-3-5-sonnet-20241022"
```

### Phase 2: Add OpenAI Support (2-3 hours)
```python
# Create LLM router service
class LLMRouter:
    def get_model(task_type: str, priority: str):
        if task_type == "fast":
            return "gpt-4o-mini"  # Cheaper than Haiku
        elif task_type == "reasoning":
            return "claude-3-5-sonnet-20241022"
        elif task_type == "strategic":
            return "o1-preview"
```

### Phase 3: Add Model Selection UI (Optional)
- Let users choose: Fast (cheaper) vs Smart (better)
- Premium tier gets Opus/o1 access

## Model Selection Decision Tree

```
START
├─ Is this high-volume? (>100 calls/day)
│  ├─ YES → Use Haiku or GPT-4o-mini
│  └─ NO → Continue
├─ Does it need context understanding?
│  ├─ YES → Use Sonnet 3.5 or GPT-4o
│  └─ NO → Use Haiku
├─ Is this a rare critical moment?
│  ├─ YES → Consider Opus or o1
│  └─ NO → Use Sonnet 3.5
```

## Monitoring & Optimization

### Track These Metrics:
1. **Token Usage** per endpoint
2. **Cost** per user per month
3. **Quality** (user feedback on AI responses)
4. **Latency** (Sonnet is slower than Haiku)

### Optimization Strategies:
1. **Caching**: Store common responses
2. **Batching**: Analyze multiple emails at once
3. **Lazy Loading**: Only use Sonnet when confidence is low
4. **User Tiers**: Free users get Haiku, premium get Sonnet

## Recommendation

**Immediate Action:** Upgrade 3 endpoints to Sonnet 3.5
1. Standup generation
2. Email analysis (when called directly)
3. Save My Day

**Estimated Impact:**
- Cost: +$45/month (~$60 total)
- Quality: Significantly better context understanding
- User Experience: "Aimi actually gets me now"

**OpenAI Integration:** Add later if:
- Anthropic has reliability issues
- Need cost optimization (GPT-4o-mini cheaper)
- Want redundancy/fallback

## Current Blocker

**The contextual scoring we built won't fully shine** because:
- Standup still uses Haiku → won't understand sender relationships
- Email analysis uses Haiku → misses nuances
- Only the optional "deep analysis" path uses Sonnet

**Fix:** Upgrade the 3 endpoints above to leverage the contextual intelligence.
