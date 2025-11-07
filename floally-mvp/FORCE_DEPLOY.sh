#!/bin/bash

# Force Deploy Script for Vercel
# This script forces a fresh deployment with cache busting

echo "🚀 Force Deploy to Vercel - Trusted Contacts Feature"
echo "=================================================="
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Step 1: Update version in package.json to trigger rebuild
echo "📦 Step 1: Bumping version..."
cd frontend
npm version patch --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "   New version: $NEW_VERSION"
cd ..

# Step 2: Add deployment marker comment
echo "🔖 Step 2: Adding deployment marker..."
cat > frontend/src/deployment-marker.js << EOF
// DEPLOYMENT MARKER - DO NOT REMOVE
// Deployed: $TIMESTAMP
// Version: $NEW_VERSION
// Feature: Trusted Contacts Management UI
export const DEPLOYMENT_INFO = {
  timestamp: '$TIMESTAMP',
  version: '$NEW_VERSION',
  feature: 'Trusted Contacts Tab in Profile Hub'
};
EOF

# Step 3: Import marker in main.jsx to ensure it's in the bundle
echo "📝 Step 3: Updating main.jsx..."
cat > frontend/src/main.jsx << 'EOF'
// Build: FORCE_DEPLOY_$(date +%Y%m%d_%H%M%S) - Trusted Contacts deployment
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DEPLOYMENT_INFO } from './deployment-marker.js'

console.log('🚀 OkAimy Deployment Info:', DEPLOYMENT_INFO);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
EOF

# Fix the date command in the file
sed -i "s/\$(date +%Y%m%d_%H%M%S)/$TIMESTAMP/g" frontend/src/main.jsx

# Step 4: Commit changes
echo "💾 Step 4: Committing changes..."
git add frontend/package.json frontend/src/main.jsx frontend/src/deployment-marker.js
git commit -m "🚀 FORCE DEPLOY $TIMESTAMP - Trusted Contacts feature v$NEW_VERSION

- Bump version to $NEW_VERSION
- Add deployment marker for cache busting
- Ensure Trusted Contacts tab is included in build
- Expected: Profile Hub should show 5 tabs including 🤝 Trusted Contacts"

# Step 5: Push to GitHub (triggers Vercel auto-deploy)
echo "⬆️  Step 5: Pushing to GitHub..."
git push origin main

echo ""
echo "✅ DEPLOYMENT TRIGGERED!"
echo "=================================================="
echo ""
echo "📊 Deployment Details:"
echo "   Version: $NEW_VERSION"
echo "   Timestamp: $TIMESTAMP"
echo "   Commit: $(git rev-parse --short HEAD)"
echo ""
echo "⏱️  Next Steps:"
echo "   1. Wait 2-3 minutes for Vercel to build"
echo "   2. Visit: https://www.okaimy.com"
echo "   3. HARD REFRESH: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "   4. Login and go to Profile Hub (user icon in top right)"
echo "   5. You should see 5 tabs: Overview, Insights, 🤝 Trusted Contacts, Integrations, Settings"
echo ""
echo "🔍 Monitoring:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Check browser console for: 'OkAimy Deployment Info'"
echo "   - Expected version: $NEW_VERSION"
echo ""
echo "If it still shows old version:"
echo "   1. Open DevTools (F12)"
echo "   2. Go to Network tab"
echo "   3. Enable 'Disable cache' checkbox"
echo "   4. Refresh page"
echo "   5. Or try in Incognito/Private browsing mode"
echo ""
