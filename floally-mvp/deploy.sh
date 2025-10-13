#!/bin/bash

# FloAlly MVP - Quick Deployment Script
# This script will help you push to GitHub and deploy to Railway + Vercel

echo "🚀 FloAlly MVP Deployment Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "floally-mvp" ]; then
    echo "❌ Error: Please run this script from /workspaces/codespaces-react"
    exit 1
fi

echo "📦 Step 1: Creating GitHub Repository..."
echo "----------------------------------------"
echo "Please run these commands manually (GitHub token needs permissions):"
echo ""
echo "# Create repository on GitHub.com (via web interface):"
echo "# 1. Go to https://github.com/new"
echo "# 2. Repository name: floally-mvp"
echo "# 3. Description: FloAlly MVP - AI-powered daily stand-up and operational partner"
echo "# 4. Make it Public"
echo "# 5. Click 'Create repository'"
echo ""
echo "# Then run these commands:"
echo "git remote add origin https://github.com/mardsan/floally-mvp.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""

read -p "Press Enter after you've created the GitHub repo and pushed the code..."

echo ""
echo "🚂 Step 2: Deploy Backend to Railway"
echo "----------------------------------------"
echo "1. Go to https://railway.app"
echo "2. Click 'Login' and sign in with GitHub"
echo "3. Click 'New Project'"
echo "4. Select 'Deploy from GitHub repo'"
echo "5. Select your 'floally-mvp' repository"
echo "6. Railway will detect it's a monorepo - select 'backend' as the root directory"
echo "7. Click 'Add Variables' and add these environment variables:"
echo ""
echo "   GOOGLE_CLIENT_ID=693194335583-tunqqbbktqn6eboml4gat86vl6c7vj5h.apps.googleusercontent.com"
echo "   GOOGLE_CLIENT_SECRET=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"
echo "   ANTHROPIC_API_KEY=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"
echo ""
echo "8. Click 'Deploy'"
echo "9. Wait for deployment to complete"
echo "10. Click 'Settings' → 'Networking' → 'Generate Domain'"
echo "11. Copy your Railway URL (e.g., https://floally-backend.railway.app)"
echo ""

read -p "Enter your Railway backend URL: " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Railway URL is required"
    exit 1
fi

echo ""
echo "📝 Your Railway URL: $RAILWAY_URL"
echo ""

echo "🔄 Step 3: Update Railway Environment Variables"
echo "----------------------------------------"
echo "Go back to Railway dashboard and add these two more variables:"
echo ""
echo "   GOOGLE_REDIRECT_URI=${RAILWAY_URL}/api/auth/callback"
echo "   FRONTEND_URL=[Your Vercel URL - will add after next step]"
echo ""

read -p "Press Enter after you've updated Railway variables..."

echo ""
echo "▲ Step 4: Deploy Frontend to Vercel"
echo "----------------------------------------"
echo "1. Go to https://vercel.com"
echo "2. Click 'Sign Up' or 'Login' (use GitHub)"
echo "3. Click 'Add New' → 'Project'"
echo "4. Import your 'floally-mvp' repository"
echo "5. Configure the project:"
echo "   - Framework Preset: Vite"
echo "   - Root Directory: floally-mvp/frontend (click 'Edit' and select it)"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "6. Click 'Environment Variables' and add:"
echo "   Name: VITE_API_URL"
echo "   Value: $RAILWAY_URL"
echo "7. Click 'Deploy'"
echo "8. Wait for deployment (usually 1-2 minutes)"
echo "9. Copy your Vercel URL (e.g., https://floally-mvp.vercel.app)"
echo ""

read -p "Enter your Vercel frontend URL: " VERCEL_URL

if [ -z "$VERCEL_URL" ]; then
    echo "❌ Vercel URL is required"
    exit 1
fi

echo ""
echo "📝 Your Vercel URL: $VERCEL_URL"
echo ""

echo "🔄 Step 5: Final Updates"
echo "----------------------------------------"
echo "1. Update Railway FRONTEND_URL variable:"
echo "   FRONTEND_URL=$VERCEL_URL"
echo ""
echo "2. Update Google OAuth (IMPORTANT!):"
echo "   a. Go to https://console.cloud.google.com"
echo "   b. Navigate to 'APIs & Services' → 'Credentials'"
echo "   c. Click on your OAuth 2.0 Client ID"
echo "   d. Add to 'Authorized redirect URIs':"
echo "      ${RAILWAY_URL}/api/auth/callback"
echo "   e. Click 'Save'"
echo ""

read -p "Press Enter after completing these updates..."

echo ""
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "🎉 Your FloAlly MVP is now live!"
echo ""
echo "📍 URLs:"
echo "   Frontend: $VERCEL_URL"
echo "   Backend:  $RAILWAY_URL"
echo "   API Docs: ${RAILWAY_URL}/docs"
echo ""
echo "🧪 Test your deployment:"
echo "   1. Visit $VERCEL_URL"
echo "   2. Click 'Connect Google Account'"
echo "   3. Complete OAuth flow"
echo "   4. Verify Gmail and Calendar integration"
echo ""
echo "📝 Save these URLs in your SESSION_LOG.md!"
echo ""
