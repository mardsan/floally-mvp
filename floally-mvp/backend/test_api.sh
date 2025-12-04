#!/bin/bash
# Backend API Tests for Activity Events
# Run this to verify the backend is working correctly

API_URL="https://floally-mvp-production.up.railway.app"
TEST_EMAIL="test@okaimy.com"

echo "🧪 Backend API Test - Activity Events System"
echo "============================================================"
echo "Testing against: $API_URL"
echo ""

# Test 1: Health check
echo "Test 1: API Health Check"
echo "------------------------------------------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "✅ API is reachable (HTTP $HTTP_CODE)"
else
    echo "❌ API not reachable (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Create activity event
echo "Test 2: POST /api/activity/events (Create Event)"
echo "------------------------------------------------------------"
RESPONSE=$(curl -s -X POST "$API_URL/api/activity/events" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_email\": \"$TEST_EMAIL\",
        \"event_type\": \"api_test\",
        \"entity_type\": \"test\",
        \"entity_id\": \"test_$(date +%s)\",
        \"metadata\": {\"source\": \"bash_test\", \"date\": \"$(date -I)\"},
        \"action\": \"created\"
    }" 2>/dev/null)

if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ Event created successfully"
    echo "Response: $RESPONSE" | head -c 200
    echo "..."
elif echo "$RESPONSE" | grep -q "error"; then
    echo "❌ API returned error: $RESPONSE"
else
    echo "⚠️  Unexpected response: $RESPONSE"
fi
echo ""
echo ""

# Test 3: Retrieve events
echo "Test 3: GET /api/activity/events (Retrieve Events)"
echo "------------------------------------------------------------"
RESPONSE=$(curl -s "$API_URL/api/activity/events?user_email=$TEST_EMAIL&limit=5" 2>/dev/null)

if echo "$RESPONSE" | grep -q '\['; then
    EVENT_COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)
    echo "✅ Retrieved events successfully"
    echo "📊 Found $EVENT_COUNT events"
    
    if [ "$EVENT_COUNT" -gt 0 ]; then
        echo ""
        echo "Sample events:"
        echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -n 30
    fi
elif echo "$RESPONSE" | grep -q "error"; then
    echo "❌ API returned error: $RESPONSE"
else
    echo "⚠️  Unexpected response: $RESPONSE"
fi
echo ""
echo ""

# Test 4: Check projects endpoint (verify backend overall health)
echo "Test 4: GET /api/projects (Backend Health)"
echo "------------------------------------------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/projects?user_email=$TEST_EMAIL" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Projects endpoint working (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "⚠️  Projects endpoint not found (HTTP $HTTP_CODE)"
else
    echo "❌ Projects endpoint error (HTTP $HTTP_CODE)"
fi
echo ""
echo ""

# Summary
echo "============================================================"
echo "📋 Test Summary"
echo "============================================================"
echo ""
echo "If you see mostly ✅, the backend is working correctly!"
echo ""
echo "Next steps:"
echo "1. Follow USER_TESTING_GUIDE.md for frontend testing"
echo "2. Report any ❌ errors you see above"
echo "3. Check Railway dashboard logs if needed"
echo ""
echo "Happy testing! 🎉"
