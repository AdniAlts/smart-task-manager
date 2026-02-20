#!/bin/bash
# Test Vercel Deployment Script

echo "🧪 Testing Vercel Deployment"
echo "============================"
echo ""

# Get Vercel URL
read -p "Enter your Vercel deployment URL (e.g., your-app.vercel.app): " VERCEL_URL
if [ -z "$VERCEL_URL" ]; then
    echo "❌ Error: Vercel URL is required"
    exit 1
fi

# Remove https:// if user included it
VERCEL_URL=$(echo "$VERCEL_URL" | sed 's|https://||' | sed 's|http://||')
BASE_URL="https://${VERCEL_URL}"

echo "Testing: $BASE_URL"
echo ""

# Test 1: API Root
echo "1️⃣ Testing API root endpoint..."
RESPONSE=$(curl -s "${BASE_URL}/api")
if echo "$RESPONSE" | grep -q "TaskMind API"; then
    echo "   ✅ API is running!"
else
    echo "   ❌ API test failed"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: Health check
echo "2️⃣ Testing health endpoint..."
RESPONSE=$(curl -s "${BASE_URL}/api/health")
if echo "$RESPONSE" | grep -q "healthy"; then
    echo "   ✅ Health check passed!"
else
    echo "   ❌ Health check failed"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 3: Database connection (via auth routes)
echo "3️⃣ Testing database connection..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}')

if echo "$RESPONSE" | grep -q "already registered\|successfully"; then
    echo "   ✅ Database is connected!"
elif echo "$RESPONSE" | grep -q "error"; then
    echo "   ⚠️  Database connection issue"
    echo "   Response: $RESPONSE"
else
    echo "   ℹ️  Response: $RESPONSE"
fi
echo ""

# Test 4: Cron endpoint (requires secret)
echo "4️⃣ Testing cron endpoint (will fail without CRON_SECRET - that's OK)..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/cron-notifications")
if echo "$RESPONSE" | grep -q "Unauthorized"; then
    echo "   ✅ Cron endpoint is secured (requires CRON_SECRET)"
else
    echo "   ℹ️  Response: $RESPONSE"
fi
echo ""

# Test 5: Telegram webhook endpoint
echo "5️⃣ Testing Telegram webhook endpoint..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/telegram-webhook" \
  -H "Content-Type: application/json" \
  -d '{"message":{"chat":{"id":123},"text":"test"}}')

if [ $? -eq 0 ]; then
    echo "   ✅ Telegram webhook endpoint is accessible"
else
    echo "   ❌ Telegram webhook test failed"
fi
echo ""

echo "============================"
echo "🎉 Testing complete!"
echo ""
echo "Next steps:"
echo "1. Check Vercel logs: vercel logs --follow"
echo "2. Setup Telegram webhook: ./setup-telegram-webhook.sh"
echo "3. Add CRON_SECRET to environment variables"
echo "4. Deploy frontend client"
echo ""
