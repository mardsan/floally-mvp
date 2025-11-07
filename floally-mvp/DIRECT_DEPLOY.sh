#!/bin/bash

# Quick Deploy Script Using Vercel CLI
# This bypasses GitHub and deploys directly from local code

echo "🚀 Direct Vercel Deployment"
echo "============================"
echo ""

cd "$(dirname "$0")/frontend"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 Logging into Vercel..."
echo "   (This will open a browser window for authentication)"
vercel login

echo ""
echo "🏗️  Building and deploying to production..."
echo "   Source: floally-mvp/frontend"
echo "   Commit: $(git rev-parse --short HEAD)"
echo ""

# Deploy with force flag to bypass cache
vercel --prod --force

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🧪 Testing:"
echo "   1. Wait 30 seconds for CDN propagation"
echo "   2. Open incognito: https://www.okaimy.com"
echo "   3. Check console for version 0.0.4"
echo "   4. Profile Hub should show 5 tabs"
echo ""
