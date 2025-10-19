#!/bin/bash

echo "==================================="
echo "OkAimy Vercel Deployment Script"
echo "==================================="
echo ""
echo "This script will:"
echo "1. Link your project to Vercel"
echo "2. Set environment variables"
echo "3. Deploy to production"
echo ""
echo "You'll need to:"
echo "- Authenticate with Vercel (it will open a browser)"
echo "- Answer a few questions about your project"
echo ""
echo "Press Enter to continue..."
read

cd /workspaces/codespaces-react/floally-mvp/frontend

echo ""
echo "Step 1: Linking to Vercel..."
echo "When prompted:"
echo "  - Set up and deploy? Y"
echo "  - Which scope? (select your account)"
echo "  - Link to existing project? N"
echo "  - Project name? floally-mvp (or press Enter)"
echo "  - Directory? ./ (press Enter)"
echo ""

vercel link

echo ""
echo "Step 2: Adding environment variable..."
vercel env add VITE_API_URL production <<EOF
https://floally-mvp-production.up.railway.app
EOF

vercel env add VITE_API_URL preview <<EOF
https://floally-mvp-production.up.railway.app
EOF

vercel env add VITE_API_URL development <<EOF
https://floally-mvp-production.up.railway.app
EOF

echo ""
echo "Step 3: Deploying to production..."
vercel --prod

echo ""
echo "==================================="
echo "Deployment Complete!"
echo "==================================="
echo ""
echo "Your site should be live at:"
echo "https://floally-mvp.vercel.app"
echo ""
echo "Next steps:"
echo "1. Visit your site and hard refresh (Ctrl+Shift+R)"
echo "2. Check browser console - should show Railway URL"
echo "3. Test features: Generate Stand-Up, Analyze Emails, Help Aimy Learn"
echo "4. Complete onboarding to set your name!"
echo ""
