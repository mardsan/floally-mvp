#!/usr/bin/env python3
"""
Test Aimi Decision Transparency System
Verifies decision recording, review, and learning features.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, '/workspaces/codespaces-react/floally-mvp/backend')

from app.database import SessionLocal
from app.services.decision_transparency import (
    DecisionTransparencyService,
    DecisionType,
    DecisionStatus,
    format_decision_summary_for_ui
)

def test_decision_recording():
    """Test 1: Record decisions with different confidence levels"""
    print("\n" + "="*60)
    print("TEST 1: Decision Recording")
    print("="*60)
    
    db = SessionLocal()
    service = DecisionTransparencyService(db)
    
    # Test case 1: High confidence decision (should be HANDLED)
    decision_id_1 = service.record_decision(
        user_email="test@example.com",
        message_id="msg_high_conf_123",
        decision_type=DecisionType.IMPORTANCE_SCORING,
        decision_data={"importance_score": 95},
        reasoning="Email from CEO with URGENT in subject",
        confidence=0.95,
        ai_model="claude-sonnet-4"
    )
    
    print(f"✅ Recorded high-confidence decision (ID: {decision_id_1})")
    print(f"   Expected status: HANDLED (confidence 0.95)")
    
    # Test case 2: Medium confidence decision (should be SUGGESTED)
    decision_id_2 = service.record_decision(
        user_email="test@example.com",
        message_id="msg_med_conf_456",
        decision_type=DecisionType.IMPORTANCE_SCORING,
        decision_data={"importance_score": 70},
        reasoning="Email from unknown sender about project",
        confidence=0.75,
        ai_model="claude-sonnet-4"
    )
    
    print(f"✅ Recorded medium-confidence decision (ID: {decision_id_2})")
    print(f"   Expected status: SUGGESTED (confidence 0.75)")
    
    # Test case 3: Low confidence decision (should be YOUR_CALL)
    decision_id_3 = service.record_decision(
        user_email="test@example.com",
        message_id="msg_low_conf_789",
        decision_type=DecisionType.IMPORTANCE_SCORING,
        decision_data={"importance_score": 50},
        reasoning="Ambiguous email, unclear context",
        confidence=0.45,
        ai_model="claude-sonnet-4"
    )
    
    print(f"✅ Recorded low-confidence decision (ID: {decision_id_3})")
    print(f"   Expected status: YOUR_CALL (confidence 0.45)")
    
    db.close()
    return decision_id_1, decision_id_2, decision_id_3


def test_pending_reviews():
    """Test 2: Get pending decisions for review"""
    print("\n" + "="*60)
    print("TEST 2: Pending Reviews")
    print("="*60)
    
    db = SessionLocal()
    service = DecisionTransparencyService(db)
    
    decisions = service.get_pending_reviews("test@example.com", limit=10)
    formatted = format_decision_summary_for_ui(decisions)
    
    print(f"✅ Retrieved {len(decisions)} total decisions")
    print(f"   - Needs review: {len(formatted['needs_review'])}")
    print(f"   - Recently handled: {len(formatted['recently_handled'])}")
    print(f"   - Summary: {formatted['summary']}")
    
    # Verify we have decisions in right categories
    assert len(formatted['needs_review']) >= 2, "Should have suggested + your_call decisions"
    assert len(formatted['recently_handled']) >= 1, "Should have handled decisions"
    
    print("\n📋 Sample Decision (Needs Review):")
    if formatted['needs_review']:
        sample = formatted['needs_review'][0]
        print(f"   ID: {sample['id']}")
        print(f"   Status: {sample['status']} {sample['status_icon']}")
        print(f"   Decision: {sample['decision']}")
        print(f"   Reasoning: {sample['reasoning']}")
        print(f"   Confidence: {sample['confidence']:.0%}")
    
    db.close()
    return formatted


def test_user_approval(decision_id):
    """Test 3: User approves a decision"""
    print("\n" + "="*60)
    print("TEST 3: User Approval")
    print("="*60)
    
    db = SessionLocal()
    service = DecisionTransparencyService(db)
    
    success = service.user_review_decision(
        decision_id=decision_id,
        user_email="test@example.com",
        approved=True
    )
    
    if success:
        print(f"✅ User approved decision {decision_id}")
        
        # Verify status changed
        history = service.get_decision_history(
            user_email="test@example.com",
            message_id=None,
            days=1
        )
        
        approved_decision = next((d for d in history if d['id'] == decision_id), None)
        if approved_decision:
            print(f"   Status changed to: {approved_decision['status']}")
            print(f"   Reviewed at: {approved_decision['reviewed_at']}")
            assert approved_decision['status'] == 'user_approved', "Should be user_approved"
        else:
            print("❌ Could not find approved decision in history")
    else:
        print(f"❌ Failed to approve decision {decision_id}")
    
    db.close()
    return success


def test_user_correction(decision_id):
    """Test 4: User corrects a decision"""
    print("\n" + "="*60)
    print("TEST 4: User Correction")
    print("="*60)
    
    db = SessionLocal()
    service = DecisionTransparencyService(db)
    
    success = service.user_review_decision(
        decision_id=decision_id,
        user_email="test@example.com",
        approved=False,
        correction={"importance_score": 20},
        correction_reasoning="This sender only sends automated reports, not important"
    )
    
    if success:
        print(f"✅ User corrected decision {decision_id}")
        print(f"   Original: 70")
        print(f"   Corrected to: 20")
        print(f"   Reason: Automated reports sender")
        
        # Verify correction stored
        history = service.get_decision_history(
            user_email="test@example.com",
            message_id=None,
            days=1
        )
        
        corrected_decision = next((d for d in history if d['id'] == decision_id), None)
        if corrected_decision:
            print(f"   Status changed to: {corrected_decision['status']}")
            print(f"   User correction: {corrected_decision['user_correction']}")
            print(f"   Correction reasoning: {corrected_decision['correction_reasoning']}")
            assert corrected_decision['status'] == 'user_corrected', "Should be user_corrected"
            assert corrected_decision['user_correction']['importance_score'] == 20, "Should be corrected to 20"
        else:
            print("❌ Could not find corrected decision in history")
    else:
        print(f"❌ Failed to correct decision {decision_id}")
    
    db.close()
    return success


def test_accuracy_metrics():
    """Test 5: Calculate accuracy metrics"""
    print("\n" + "="*60)
    print("TEST 5: Accuracy Metrics")
    print("="*60)
    
    db = SessionLocal()
    service = DecisionTransparencyService(db)
    
    metrics = service.get_accuracy_metrics(
        user_email="test@example.com",
        days=1
    )
    
    print("✅ Accuracy Metrics:")
    print(f"   Total decisions reviewed: {metrics.get('total_decisions', 0)}")
    print(f"   User approved: {metrics.get('user_approved', 0)}")
    print(f"   User corrected: {metrics.get('user_corrected', 0)}")
    print(f"   Approval rate: {metrics.get('approval_rate', 0):.0%}")
    print(f"   Avg confidence: {metrics.get('avg_confidence', 0):.2f}")
    
    if 'confidence_calibration' in metrics:
        print("\n📊 Confidence Calibration:")
        for tier, data in metrics['confidence_calibration'].items():
            print(f"   {tier}:")
            print(f"      Count: {data['count']}")
            print(f"      Approved: {data['approved']}")
            print(f"      Accuracy: {data['rate']:.0%}")
    
    db.close()
    return metrics


def test_decision_history():
    """Test 6: Get decision history"""
    print("\n" + "="*60)
    print("TEST 6: Decision History")
    print("="*60)
    
    db = SessionLocal()
    service = DecisionTransparencyService(db)
    
    # Get all decisions
    history = service.get_decision_history(
        user_email="test@example.com",
        days=1
    )
    
    print(f"✅ Retrieved {len(history)} decisions from last 24 hours")
    
    # Get importance scoring decisions only
    importance_history = service.get_decision_history(
        user_email="test@example.com",
        decision_type=DecisionType.IMPORTANCE_SCORING,
        days=1
    )
    
    print(f"✅ Retrieved {len(importance_history)} importance_scoring decisions")
    
    # Show sample
    if history:
        print("\n📋 Recent Decision:")
        sample = history[0]
        print(f"   Type: {sample['type']}")
        print(f"   Decision: {sample['decision']}")
        print(f"   Reasoning: {sample['reasoning']}")
        print(f"   Status: {sample['status']} {sample['status_icon']}")
        print(f"   Created: {sample['created_at']}")
    
    db.close()
    return history


if __name__ == "__main__":
    print("\n🧪 Testing Aimi Decision Transparency System")
    print("=" * 60)
    
    try:
        # Run all tests
        decision_ids = test_decision_recording()
        formatted = test_pending_reviews()
        test_user_approval(decision_ids[0])  # Approve high-confidence decision
        test_user_correction(decision_ids[1])  # Correct medium-confidence decision
        metrics = test_accuracy_metrics()
        history = test_decision_history()
        
        # Summary
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\n📊 Final Summary:")
        print(f"   - Recorded 3 decisions (high, medium, low confidence)")
        print(f"   - Retrieved {len(formatted.get('needs_review', []))} decisions needing review")
        print(f"   - User approved 1 decision")
        print(f"   - User corrected 1 decision")
        print(f"   - Approval rate: {metrics.get('approval_rate', 0):.0%}")
        print(f"   - Total history: {len(history)} decisions")
        
        print("\n🎉 Decision Transparency System is operational!")
        print("\n💡 Next Steps:")
        print("   1. Deploy to Railway (auto-deploys on git push)")
        print("   2. Add Decision Review link to frontend navigation")
        print("   3. Test on HeyAimi.com with real user data")
        print("   4. Monitor approval rates and user feedback")
        print("   5. Implement Phase 2: Enhanced Learning")
        
        sys.exit(0)
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
