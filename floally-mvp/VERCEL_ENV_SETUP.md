# VERCEL ENVIRONMENT VARIABLE CONFIGURATION

**CRITICAL:** The Vercel frontend needs to connect to the Railway backend.

## Required Environment Variables in Vercel Dashboard

Go to: https://vercel.com/[your-project]/settings/environment-variables

Add the following environment variable:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_URL` | `https://floally-mvp-production.up.railway.app` | Production, Preview, Development |

## How to Set in Vercel:

1. Go to your Vercel project dashboard
2. Click "Settings"
3. Click "Environment Variables" in the left sidebar
4. Click "Add New"
5. Enter:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://floally-mvp-production.up.railway.app`
   - **Environments:** Check all three (Production, Preview, Development)
6. Click "Save"
7. **IMPORTANT:** Redeploy your application for the changes to take effect
   - Go to "Deployments"
   - Click the "..." menu on the latest deployment
   - Click "Redeploy"

## Why This Is Needed

- The frontend (Vercel) makes API calls to the backend
- Without this variable, it defaults to `http://localhost:8000`
- This works locally but fails in production
- The Railway backend URL must be configured in Vercel's environment

## Verification

After redeployment, check the browser console:
- Should see: `API URL: https://floally-mvp-production.up.railway.app`
- API calls should succeed (check Network tab)

## Current Status

✅ `.env` file created with Railway URL (for local development)
✅ `.env.production` file created (for build-time)
⏳ **ACTION REQUIRED:** Set environment variable in Vercel dashboard
⏳ **ACTION REQUIRED:** Redeploy application

## Files Created

- `frontend/.env` - For local development
- `frontend/.env.production` - For production builds
- Both contain: `VITE_API_URL=https://floally-mvp-production.up.railway.app`

## Alternative: Quick Fix via Vercel CLI

If you have Vercel CLI installed:

```bash
cd floally-mvp/frontend
vercel env add VITE_API_URL production
# When prompted, enter: https://floally-mvp-production.up.railway.app

vercel env add VITE_API_URL preview
# When prompted, enter: https://floally-mvp-production.up.railway.app

vercel env add VITE_API_URL development
# When prompted, enter: https://floally-mvp-production.up.railway.app

# Then redeploy
vercel --prod
```

## Troubleshooting

If issues persist after setting environment variables:

1. **Check browser console** for the API URL being used
2. **Check Network tab** for failed API requests
3. **Verify Railway backend** is running: `curl https://floally-mvp-production.up.railway.app/api/auth/status`
4. **Clear browser cache** and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. **Check Vercel build logs** for environment variable confirmation

## Current Issues Explained

### "[User]" in Greeting
- The AI doesn't know the user's actual name
- User needs to complete onboarding to set `display_name`
- After onboarding, greeting will show: "Good morning, [Your Name] 🌞"

### "Analyze Emails" Hanging
- Frontend trying to reach localhost:8000 instead of Railway
- **Fix:** Set `VITE_API_URL` in Vercel and redeploy

### "Help Aime Learn" Failing
- Same issue - trying to reach localhost instead of Railway
- **Fix:** Set `VITE_API_URL` in Vercel and redeploy

## Next Steps After Environment Variable Setup

1. ✅ Set `VITE_API_URL` in Vercel dashboard
2. ✅ Redeploy the application
3. ✅ Complete onboarding flow in the app (enter your name!)
4. ✅ Test all features:
   - Generate Stand-Up
   - Analyze Emails
   - Help Aime Learn (feedback buttons)
   - Profile settings

---

**Last Updated:** October 18, 2025  
**Status:** Environment files created, Vercel configuration needed
