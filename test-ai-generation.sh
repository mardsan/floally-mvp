#!/bin/bash

echo "🧪 Testing AI Project Generation API"
echo "======================================"
echo ""

# Test 1: Mobile Fitness App
echo "📱 Test 1: Mobile Fitness App"
echo "--------------------------------------"
curl -X POST https://okaimy.com/api/projects/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "projectName": "Mobile Fitness App Launch",
    "projectDescription": "We are building a new iOS and Android fitness tracking app targeting millennials and Gen Z. The app will integrate with wearables, provide AI-powered workout recommendations, and include social features for community challenges. Our goal is to launch in Q1 2026 with a beta program starting in December 2025."
  }' | python3 -m json.tool

echo ""
echo ""

# Test 2: Website Redesign
echo "🎨 Test 2: E-commerce Website Redesign"
echo "--------------------------------------"
curl -X POST https://okaimy.com/api/projects/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_456",
    "projectName": "E-commerce Website Redesign",
    "projectDescription": "Our online store needs a complete redesign to improve conversion rates and mobile experience. Current site has high bounce rates and poor checkout flow. We want to modernize the design, implement better product discovery, and optimize for mobile shoppers. Target completion by end of Q4."
  }' | python3 -m json.tool

echo ""
echo ""

# Test 3: Short description (should fail gracefully)
echo "⚠️ Test 3: Too Short Description (should error)"
echo "--------------------------------------"
curl -X POST https://okaimy.com/api/projects/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_789",
    "projectName": "Quick Test",
    "projectDescription": "Short"
  }' | python3 -m json.tool

echo ""
echo ""
echo "✅ Testing Complete!"
