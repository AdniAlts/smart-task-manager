#!/bin/bash
# Vercel Deployment Helper Script
# Run this after deploying to Vercel to setup Telegram webhook

echo "🤖 Telegram Webhook Setup for Vercel"
echo "===================================="
echo ""

# Check if required tools are installed
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is not installed"
    exit 1
fi

# Get bot token
read -p "Enter your Telegram Bot Token: " BOT_TOKEN
if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Error: Bot token is required"
    exit 1
fi

# Get Vercel URL
read -p "Enter your Vercel deployment URL (e.g., your-app.vercel.app): " VERCEL_URL
if [ -z "$VERCEL_URL" ]; then
    echo "❌ Error: Vercel URL is required"
    exit 1
fi

# Remove https:// if user included it
VERCEL_URL=$(echo "$VERCEL_URL" | sed 's|https://||' | sed 's|http://||')

echo ""
echo "📡 Setting webhook..."
WEBHOOK_URL="https://${VERCEL_URL}/api/telegram-webhook"
echo "Webhook URL: $WEBHOOK_URL"

# Set webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}")

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook set successfully!"
else
    echo "❌ Failed to set webhook"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "🔍 Verifying webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")

echo "$WEBHOOK_INFO" | python3 -m json.tool 2>/dev/null || echo "$WEBHOOK_INFO"

echo ""
echo "✅ Done! Test your bot by:"
echo "   1. Open Telegram"
echo "   2. Send /start to your bot"
echo "   3. You should receive a welcome message"
echo ""
