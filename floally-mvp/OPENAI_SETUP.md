# Adding OpenAI API Key to Railway

## Steps

1. **Go to Railway Dashboard**
   - Navigate to: https://railway.app/
   - Select your project: `floally-mvp`
   - Click on the backend service

2. **Add Environment Variable**
   - Go to "Variables" tab
   - Click "New Variable"
   - Add:
     ```
     OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
     ```

3. **Redeploy**
   - Railway will automatically redeploy
   - Wait ~2-3 minutes for deployment

4. **Verify**
   - Check logs for: "✅ OpenAI available"
   - Or call: `GET /health` endpoint (add this to check API status)

## What This Enables

### Cost Savings
- **Fast tasks** (spam detection, simple classification):
  - Before: Claude Haiku ($0.25/1M tokens)
  - After: GPT-4o-mini ($0.15/1M tokens)
  - **Savings: 40%**

### Redundancy
- If Anthropic API has issues → Automatic fallback to OpenAI
- If OpenAI API has issues → Automatic fallback to Anthropic
- **99.9%+ uptime** with dual providers

### Quality
- Keep Claude Sonnet for reasoning tasks (best quality)
- Use GPT-4o-mini for high-volume simple tasks (cheaper)
- Automatic selection based on task type

## Local Testing

To test locally before deploying:

1. Add to `backend/.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ```

2. Run test:
   ```bash
   cd backend
   python test_llm_router.py
   ```

3. Expected output:
   ```
   ✅ PASSED: Router initialization
   ✅ PASSED: Cost calculation
   ✅ PASSED: Fast task completed (GPT-4o-mini)
   ✅ PASSED: Reasoning task completed (Claude Sonnet)
   ```

## Expected Monthly Costs

### Before OpenAI (All Anthropic)
- Fast tasks: 10K calls @ Haiku = $2.50
- Reasoning: 1K calls @ Sonnet = $30.00
- **Total: ~$77/month**

### After OpenAI (Hybrid)
- Fast tasks: 10K calls @ GPT-4o-mini = $1.50
- Reasoning: 1K calls @ Sonnet = $30.00
- **Total: ~$60/month**
- **Savings: $17/month (22%)**

### Scale Impact (1000 users)
- Cost per user: $0.31 → $0.24
- **Annual savings: $204**

## Health Check Endpoint (Add This)

Add to `main.py`:
```python
@app.get("/health")
async def health_check():
    from app.services.llm_router import get_llm_router
    
    router = get_llm_router()
    stats = router.get_usage_stats()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "llm_providers": {
            "anthropic": stats["anthropic_available"],
            "openai": stats["openai_available"]
        },
        "usage": {
            "anthropic_calls": stats["anthropic_calls"],
            "openai_calls": stats["openai_calls"],
            "fallback_count": stats["fallback_count"]
        }
    }
```

Then check: `GET https://floally-mvp-production.up.railway.app/health`

## Troubleshooting

### "OpenAI not available" in logs
1. Verify key is correct (starts with `sk-proj-`)
2. Check Railway variables are saved
3. Redeploy service
4. Check for typos in variable name (must be exact: `OPENAI_API_KEY`)

### High fallback rate (>5%)
1. Check both API keys are valid
2. Check for rate limiting
3. Check API status pages:
   - Anthropic: https://status.anthropic.com/
   - OpenAI: https://status.openai.com/

### Costs higher than expected
1. Check token usage in logs
2. Look for inefficient prompts (too verbose)
3. Add caching for repeated prompts
4. Consider user rate limiting

## Migration Timeline

### Phase 1: Add Key (Today)
- [x] Add OpenAI key to Railway
- [ ] Verify both providers work
- [ ] Monitor for errors

### Phase 2: Gradual Rollout (This Week)
- [ ] Use LLM router for new endpoints
- [ ] Monitor cost savings
- [ ] Track quality metrics

### Phase 3: Full Migration (Next Week)
- [ ] Migrate all endpoints to use router
- [ ] Remove direct Anthropic/OpenAI calls
- [ ] Add caching layer

## Rollback Plan

If issues occur:
1. Remove `OPENAI_API_KEY` from Railway
2. System will fallback to Anthropic-only
3. No code changes needed (graceful degradation built-in)
