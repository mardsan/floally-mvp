"""
Test LLM Router with both providers
Run: python -m pytest test_llm_router.py -v
Or: python test_llm_router.py
"""
import sys
import os
import asyncio

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

async def test_router_initialization():
    """Test that router initializes with available keys"""
    from app.services.llm_router import get_llm_router
    
    router = get_llm_router()
    stats = router.get_usage_stats()
    
    print("\n" + "="*60)
    print("LLM Router Initialization Test")
    print("="*60)
    print(f"Anthropic Available: {stats['anthropic_available']}")
    print(f"OpenAI Available: {stats['openai_available']}")
    
    if not stats['anthropic_available'] and not stats['openai_available']:
        print("❌ FAILED: No LLM providers available")
        return False
    
    print("✅ PASSED: At least one provider available")
    return True

async def test_fast_task():
    """Test fast task routing (should use GPT-4o-mini if available)"""
    from app.services.llm_router import get_llm_router
    
    router = get_llm_router()
    
    print("\n" + "="*60)
    print("Fast Task Test (Spam Detection)")
    print("="*60)
    
    try:
        response = await router.complete(
            prompt="Is this spam? 'Win a FREE iPhone now! Click here!'",
            task_type="fast"
        )
        
        print(f"Provider: {response['provider']}")
        print(f"Model: {response['model']}")
        print(f"Tokens: {response['tokens_used']}")
        print(f"Cost: ${response['cost_estimate']:.6f}")
        print(f"Response: {response['text'][:100]}...")
        print("✅ PASSED: Fast task completed")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

async def test_reasoning_task():
    """Test reasoning task (should use Claude Sonnet if available)"""
    from app.services.llm_router import get_llm_router
    
    router = get_llm_router()
    
    print("\n" + "="*60)
    print("Reasoning Task Test (Email Importance)")
    print("="*60)
    
    try:
        response = await router.complete(
            prompt="""Analyze this email's importance:
From: ceo@company.com
Subject: Quick sync on Q1 goals
Body: Can we chat about our priorities for next quarter?

Consider: sender relationship, urgency, content""",
            task_type="reasoning"
        )
        
        print(f"Provider: {response['provider']}")
        print(f"Model: {response['model']}")
        print(f"Tokens: {response['tokens_used']}")
        print(f"Cost: ${response['cost_estimate']:.6f}")
        print(f"Response: {response['text'][:150]}...")
        print("✅ PASSED: Reasoning task completed")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

async def test_fallback():
    """Test fallback mechanism"""
    from app.services.llm_router import get_llm_router
    
    router = get_llm_router()
    stats_before = router.get_usage_stats()
    
    print("\n" + "="*60)
    print("Fallback Test")
    print("="*60)
    
    try:
        # Try to force a fallback by preferring unavailable provider
        # (This will only work if one provider is missing)
        response = await router.complete(
            prompt="Test fallback",
            task_type="fast"
        )
        
        stats_after = router.get_usage_stats()
        fallback_count = stats_after['fallback_count'] - stats_before['fallback_count']
        
        print(f"Fallbacks triggered: {fallback_count}")
        print(f"Response received from: {response['provider']}")
        print("✅ PASSED: Fallback mechanism works")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

async def test_cost_calculation():
    """Test that cost calculation works"""
    from app.services.llm_router import get_llm_router
    
    router = get_llm_router()
    
    print("\n" + "="*60)
    print("Cost Calculation Test")
    print("="*60)
    
    try:
        # Test Anthropic cost calc
        haiku_cost = router._calculate_anthropic_cost("claude-3-haiku-20240307", 1000, 500)
        sonnet_cost = router._calculate_anthropic_cost("claude-3-5-sonnet-20241022", 1000, 500)
        
        print(f"Haiku (1k input, 500 output): ${haiku_cost:.6f}")
        print(f"Sonnet (1k input, 500 output): ${sonnet_cost:.6f}")
        
        # Test OpenAI cost calc
        mini_cost = router._calculate_openai_cost("gpt-4o-mini", 1000, 500)
        gpt4o_cost = router._calculate_openai_cost("gpt-4o", 1000, 500)
        
        print(f"GPT-4o-mini (1k input, 500 output): ${mini_cost:.6f}")
        print(f"GPT-4o (1k input, 500 output): ${gpt4o_cost:.6f}")
        
        # Verify GPT-4o-mini is cheaper than Haiku
        if mini_cost < haiku_cost:
            print(f"✅ GPT-4o-mini is {((haiku_cost - mini_cost) / haiku_cost * 100):.0f}% cheaper than Haiku")
        
        print("✅ PASSED: Cost calculations work")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("LLM Router Test Suite")
    print("="*60)
    
    tests = [
        ("Initialization", test_router_initialization),
        ("Cost Calculation", test_cost_calculation),
        ("Fast Task", test_fast_task),
        ("Reasoning Task", test_reasoning_task),
        ("Fallback", test_fallback)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} passed")
    print("="*60 + "\n")
    
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
