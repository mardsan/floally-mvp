"""
Quick integration test for AI enhancements
Tests the contextual scoring system with sample data
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_contextual_scorer_import():
    """Test that contextual scorer can be imported"""
    try:
        from app.services.contextual_scoring import ContextualScorer
        print("✅ ContextualScorer imported successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to import ContextualScorer: {e}")
        return False

def test_relationship_classification():
    """Test sender relationship classification logic"""
    try:
        from app.services.contextual_scoring import ContextualScorer
        
        # Create mock instance (without DB for unit testing)
        scorer = ContextualScorer(db=None)
        
        # Test VIP classification
        vip_result = scorer._classify_relationship(
            response_rate=0.7,  # High response rate
            archive_rate=0.1,   # Low archive rate
            importance_rate=0.6,
            total_emails=10
        )
        assert vip_result == "vip", f"Expected 'vip', got '{vip_result}'"
        print("✅ VIP classification works")
        
        # Test Noise classification
        noise_result = scorer._classify_relationship(
            response_rate=0.0,
            archive_rate=0.85,  # High archive rate
            importance_rate=0.0,
            total_emails=10
        )
        assert noise_result == "noise", f"Expected 'noise', got '{noise_result}'"
        print("✅ Noise classification works")
        
        # Test Unknown classification
        unknown_result = scorer._classify_relationship(
            response_rate=0.0,
            archive_rate=0.0,
            importance_rate=0.0,
            total_emails=1  # Not enough data
        )
        assert unknown_result == "unknown", f"Expected 'unknown', got '{unknown_result}'"
        print("✅ Unknown classification works")
        
        return True
    except Exception as e:
        print(f"❌ Relationship classification test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_composite_scoring():
    """Test composite importance scoring"""
    try:
        from app.services.contextual_scoring import ContextualScorer
        
        scorer = ContextualScorer(db=None)
        
        # Test VIP sender with primary email
        vip_score = scorer._calculate_composite_score(
            sender_history={'relationship_type': 'vip', 'importance_score': 0.8},
            user_context={'role': 'Designer', 'priorities': ['Launch']},
            trust_context={'trust_level': 'trusted'},
            gmail_signals={'is_starred': True, 'is_important': True, 'category': 'primary', 'has_unsubscribe_link': False},
            subject='Quick question about the launch',
            snippet='Hey, can we sync on...'
        )
        
        assert vip_score > 75, f"VIP score should be high (>75), got {vip_score}"
        print(f"✅ VIP scoring works: {vip_score}/100")
        
        # Test noise sender with promotional
        noise_score = scorer._calculate_composite_score(
            sender_history={'relationship_type': 'noise', 'importance_score': 0.2},
            user_context={'role': 'Designer', 'priorities': ['Launch']},
            trust_context={'trust_level': 'neutral'},
            gmail_signals={'is_starred': False, 'is_important': False, 'category': 'promotional', 'has_unsubscribe_link': True},
            subject='Special offer just for you!',
            snippet='Limited time discount...'
        )
        
        assert noise_score < 30, f"Noise score should be low (<30), got {noise_score}"
        print(f"✅ Noise scoring works: {noise_score}/100")
        
        return True
    except Exception as e:
        print(f"❌ Composite scoring test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_confidence_calculation():
    """Test confidence scoring"""
    try:
        from app.services.contextual_scoring import ContextualScorer
        
        scorer = ContextualScorer(db=None)
        
        # New sender (low confidence)
        low_conf = scorer._calculate_confidence({'total_emails': 0})
        assert low_conf == 0.3, f"Expected 0.3 for new sender, got {low_conf}"
        print(f"✅ Low confidence (new sender): {low_conf}")
        
        # Established sender (high confidence)
        high_conf = scorer._calculate_confidence({'total_emails': 20})
        assert high_conf == 0.9, f"Expected 0.9 for established sender, got {high_conf}"
        print(f"✅ High confidence (20+ emails): {high_conf}")
        
        return True
    except Exception as e:
        print(f"❌ Confidence calculation test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("Testing AI Enhancements - Contextual Scoring System")
    print("="*60 + "\n")
    
    tests = [
        ("Import Test", test_contextual_scorer_import),
        ("Relationship Classification", test_relationship_classification),
        ("Composite Scoring", test_composite_scoring),
        ("Confidence Calculation", test_confidence_calculation)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        print("-" * 60)
        if test_func():
            passed += 1
        else:
            failed += 1
    
    print("\n" + "="*60)
    print(f"Results: {passed} passed, {failed} failed")
    print("="*60 + "\n")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
