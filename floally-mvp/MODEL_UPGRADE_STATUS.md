# Model Upgrade Status - December 14, 2025

## ✅ Successfully Upgraded to Sonnet 3.5

| Endpoint | File | Line | Reason |
|----------|------|------|--------|
| **Standup Generation** | ai.py | 120 | ✅ Context-aware priority understanding |
| **Email Importance Analysis** | ai.py | 205 | ✅ Nuanced importance detection |
| **Save My Day Triage** | ai.py | 698 | ✅ Critical emotional moment |
| **Project Planning** | ai.py | 452 | ✅ Strategic thinking needed |
| **Goal Date Generation** | ai.py | 582 | ✅ Part of project planning |
| **Deep Contextual Scoring** | contextual_scoring.py | 112 | ✅ Complex reasoning |

## 🔵 Keeping Haiku (Appropriate for Task)

| Endpoint | File | Line | Task Type | Should Upgrade? |
|----------|------|------|-----------|-----------------|
| **Response Drafting** | ai.py | 265 | Simple drafting | ❌ No - Haiku fine |
| **Attachment Analysis** | attachment_service.py | 201 | Text extraction | ❌ No - Haiku fine |
| **AI Message Analysis (bulk)** | messages.py | 105 | Fast classification | ⚠️ **Maybe** |
| **Message Smart Reply** | messages.py | 688 | Simple response | ❌ No - Haiku fine |
| **Feedback Suggestions** | messages.py | 1007 | Quick suggestions | ❌ No - Haiku fine |
| **Standup (alt endpoint)** | standup.py | 455 | Duplicate of ai.py | ⚠️ **Maybe upgrade** |

## ⚠️ Needs Review

### 1. `messages.py` line 105 - AI Message Analysis
**Current**: Haiku
**Should Consider**: Sonnet

**Why Upgrade?**
- This is called for analyzing message importance
- Currently uses Haiku but contextual_scoring.py uses Sonnet
- Inconsistency: one endpoint smart, another dumb

**Why Keep Haiku?**
- High volume endpoint (could be called for every inbox refresh)
- Cost consideration
- Fast scoring in contextual_scoring.py already handles this

**Recommendation**: Keep Haiku BUT ensure it calls contextual_scoring service instead

### 2. `standup.py` line 455 - Standup Generation (Duplicate)
**Current**: Haiku
**Already Upgraded**: ai.py uses Sonnet

**Issue**: Two standup endpoints exist
- `/standup` (standup.py) - uses Haiku
- `/ai/standup` (ai.py) - uses Sonnet ✅

**Recommendation**: Check which frontend uses, deprecate one or upgrade both

## Cost Impact Analysis

### Before Upgrades
- All endpoints: Haiku
- Estimated cost: ~$15/month (1000 users)

### After Upgrades (Current State)
- 6 endpoints upgraded to Sonnet
- 5 endpoints remain Haiku
- Estimated cost: ~$60/month (1000 users)
- **4x increase for significantly better intelligence**

### Breakdown by Endpoint
| Endpoint | Calls/Month | Old Cost | New Cost | Delta |
|----------|-------------|----------|----------|-------|
| Standup | 1,000 | $5 | $30 | +$25 |
| Email Analysis | 10,000 | $10 | $30 | +$20 |
| Save My Day | 100 | $0.50 | $3 | +$2.50 |
| Project Planning | 200 | $1 | $6 | +$5 |
| Goal Dates | 200 | $1 | $6 | +$5 |
| Response Drafts | 500 | $2.50 | $2.50 | $0 |
| **Total** | - | **~$20** | **~$77** | **+$57** |

## Testing Recommendations

### Critical Tests (Before Deploying)
1. **Standup Quality**: Generate 5 standups, compare Haiku vs Sonnet
   - Does Sonnet show better priority understanding?
   - Does it use sender relationships correctly?
   
2. **Save My Day**: Test with overwhelming inbox
   - Does Sonnet provide better triage?
   - Are priorities more intelligent?

3. **Latency**: Measure response times
   - Sonnet is ~2-3x slower than Haiku
   - Acceptable for these endpoints? (not real-time)

4. **Cost Monitoring**: Track token usage
   - Set alerts if usage spikes
   - Monitor per-user cost

### A/B Testing (Optional)
- 50% users get Haiku, 50% get Sonnet
- Measure: User satisfaction, engagement, retention
- If Sonnet shows clear value → keep
- If no difference → consider downgrading

## OpenAI Integration (Future)

### When to Add OpenAI
1. **Cost Optimization**: GPT-4o-mini is cheaper than Haiku
2. **Redundancy**: Fallback if Anthropic has issues
3. **Feature Parity**: Some users prefer GPT models
4. **Hybrid Approach**: Use cheapest model for each task

### Estimated Hybrid Cost
- Fast tasks: GPT-4o-mini (~40% cheaper than Haiku)
- Reasoning: Keep Sonnet
- Strategic: o1-preview (rare use)
- **Potential savings**: ~$15/month

## Action Items

### Immediate (Today)
- [x] Upgrade 6 critical endpoints to Sonnet
- [x] Document model selection strategy
- [ ] Test standup quality with Sonnet
- [ ] Verify latency acceptable
- [ ] Push changes to production

### Short Term (This Week)
- [ ] Add token usage tracking
- [ ] Monitor cost per user
- [ ] Check if `standup.py` is used (deprecate if not)
- [ ] Ensure `messages.py` uses contextual_scoring

### Medium Term (Next 2 Weeks)
- [ ] Add OpenAI API key to environment
- [ ] Build LLM router service
- [ ] Add model selection to admin UI
- [ ] Implement caching for common responses

## Deployment Notes

**Environment Variables Needed:**
- ✅ `ANTHROPIC_API_KEY` - Already configured
- ⏳ `OPENAI_API_KEY` - Add when ready for hybrid

**No Schema Changes** - Pure code deployment

**Rollback Plan**: 
```python
# If Sonnet causes issues, quick rollback:
# Find: model="claude-3-5-sonnet-20241022"
# Replace: model="claude-3-haiku-20240307"
```

## Conclusion

**Current Status**: ✅ **Successfully upgraded 6 critical endpoints**

**Key Benefits**:
- Context-aware standup generation (understands relationships)
- Smarter email importance scoring (VIP vs noise)
- Better "Save My Day" triage (emotional intelligence)
- Strategic project planning (not just keyword matching)

**Trade-offs**:
- Cost: +$57/month (~4x increase)
- Latency: +0.5-1.5s per request
- Complexity: More models to manage

**Next Steps**: Test quality improvements, monitor costs, consider OpenAI for cost optimization
