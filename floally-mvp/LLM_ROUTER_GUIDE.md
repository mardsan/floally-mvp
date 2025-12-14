# LLM Router Usage Guide

## Quick Start

```python
from app.services.llm_router import get_llm_router

router = get_llm_router()

# Fast task (uses GPT-4o-mini - cheapest)
response = await router.complete(
    prompt="Categorize this email as spam/not spam",
    task_type="fast"
)

# Reasoning task (uses Claude Sonnet - best quality)
response = await router.complete(
    prompt="Analyze this email's importance based on sender relationship...",
    task_type="reasoning"
)

# Strategic task (uses Claude Sonnet or GPT-4o)
response = await router.complete(
    prompt="Create a comprehensive project plan...",
    task_type="strategic"
)

# Simple generation (uses GPT-4o-mini - fast & cheap)
response = await router.complete(
    prompt="Draft a quick response to this email",
    task_type="simple_generation"
)
```

## Response Format

```python
{
    "text": "The AI response text",
    "provider": "anthropic" | "openai",
    "model": "claude-3-5-sonnet-20241022" | "gpt-4o-mini" | etc,
    "tokens_used": 1234,
    "input_tokens": 500,
    "output_tokens": 734,
    "cost_estimate": 0.0045  # in USD
}
```

## Task Type Guide

| Task Type | Primary Model | Use Case | Cost per 1M tokens |
|-----------|--------------|----------|-------------------|
| `fast` | GPT-4o-mini | High-volume classification, spam detection | $0.15 |
| `reasoning` | Claude Sonnet 3.5 | Context understanding, importance scoring | $3.00 |
| `strategic` | Claude Sonnet 3.5 | Project planning, complex decisions | $3.00 |
| `simple_generation` | GPT-4o-mini | Response drafting, text generation | $0.15 |

## Automatic Fallback

If the primary provider fails, the router automatically tries the fallback:

```python
# Primary: Anthropic Sonnet
# Fallback: OpenAI GPT-4o

try:
    response = await router.complete(prompt="...", task_type="reasoning")
    # Will use Sonnet if available, GPT-4o if Anthropic fails
except Exception as e:
    # Only fails if BOTH providers fail
    print(f"All LLM providers failed: {e}")
```

## Prefer Specific Provider

```python
# Force use of OpenAI even if Anthropic is available
response = await router.complete(
    prompt="...",
    task_type="reasoning",
    prefer_provider="openai"
)

# Force use of Anthropic
response = await router.complete(
    prompt="...",
    task_type="fast",
    prefer_provider="anthropic"  # Use Haiku instead of GPT-4o-mini
)
```

## Override Config

```python
response = await router.complete(
    prompt="...",
    task_type="reasoning",
    max_tokens=8000,  # Override default
    temperature=0.7   # Override default
)
```

## Usage Statistics

```python
stats = router.get_usage_stats()
print(stats)
# {
#     "anthropic_calls": 1234,
#     "openai_calls": 5678,
#     "fallback_count": 12,
#     "timestamp": "2025-12-14T...",
#     "anthropic_available": True,
#     "openai_available": True
# }
```

## Migration Examples

### Before (Direct Anthropic)
```python
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
message = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=1000,
    messages=[{"role": "user", "content": prompt}]
)
text = message.content[0].text
```

### After (LLM Router)
```python
router = get_llm_router()
response = await router.complete(prompt=prompt, task_type="fast")
text = response["text"]
# Now uses GPT-4o-mini (40% cheaper) with automatic fallback
```

### Before (Direct OpenAI)
```python
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}]
)
text = response.choices[0].message.content
```

### After (LLM Router)
```python
router = get_llm_router()
response = await router.complete(prompt=prompt, task_type="reasoning")
text = response["text"]
# Now uses Sonnet (better quality) with GPT-4o as fallback
```

## Cost Optimization Strategy

### Current Approach (All Anthropic)
- Fast tasks: Haiku ($0.25/1M tokens)
- Reasoning: Sonnet ($3.00/1M tokens)
- Total: ~$77/month

### Optimized Approach (Hybrid)
- Fast tasks: GPT-4o-mini ($0.15/1M tokens) - **40% savings**
- Reasoning: Sonnet ($3.00/1M tokens) - Keep best quality
- Total: ~$60/month - **22% savings**

### Example Savings
```
High-volume spam detection (10K emails/month):
- Before: 10K * $0.25 = $2.50
- After:  10K * $0.15 = $1.50
- Savings: $1.00/month per 10K emails
```

## Environment Variables

Required in Railway/production:
```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
```

The router gracefully handles missing keys:
- If only Anthropic key → Uses only Anthropic models
- If only OpenAI key → Uses only OpenAI models
- If both keys → Uses best model for each task + fallback redundancy

## Monitoring & Alerts

Track these metrics:
1. **Cost per user**: Should stay under $0.50/month
2. **Fallback rate**: Should be <5% (indicates API reliability)
3. **Token usage**: Watch for spikes (could indicate abuse/bugs)
4. **Quality scores**: User satisfaction with AI responses

Add to your monitoring dashboard:
```python
# In your monitoring endpoint
router = get_llm_router()
stats = router.get_usage_stats()

# Alert if fallback rate > 5%
if stats["fallback_count"] / (stats["anthropic_calls"] + stats["openai_calls"]) > 0.05:
    send_alert("High LLM fallback rate - check API health")

# Alert if cost estimate exceeds budget
total_cost = calculate_monthly_cost(stats)
if total_cost > 100:  # $100/month budget
    send_alert(f"LLM costs exceeding budget: ${total_cost}")
```

## Best Practices

1. **Use the right task type**
   - Don't use `reasoning` for simple classification
   - Don't use `fast` for context-aware decisions

2. **Let the router choose**
   - Don't force `prefer_provider` unless you have a reason
   - The router knows the best model for each task

3. **Handle errors gracefully**
   - Both providers could fail (rare but possible)
   - Always have a fallback response

4. **Monitor costs**
   - Log token usage
   - Track cost per endpoint
   - Optimize high-volume endpoints first

5. **Test quality**
   - Compare responses from different models
   - Ensure cheaper models meet quality bar
   - User feedback is the ultimate metric

## Future Enhancements

- [ ] Add response caching (dedupe identical prompts)
- [ ] Add rate limiting per user
- [ ] Add A/B testing framework
- [ ] Add custom model fine-tuning
- [ ] Add support for more providers (Cohere, Mistral, etc.)
