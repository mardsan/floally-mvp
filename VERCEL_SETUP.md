# Vercel Deployment Setup for Hey Aimi

## Current Status
✅ **Automatic fallback configured** - The app will automatically use Railway backend in production
✅ **Build issues fixed** - Tailwind config and loading state resolved
✅ **Domains configured** - heyaimi.com, heyaimi.ai connected to Vercel

## Quick Fix Applied (Commit 825d2d7)
The frontend now automatically uses `https://floally-mvp-production.up.railway.app` in production mode when `VITE_API_URL` is not set. This fixes the "Network Error" on Google OAuth login.

## Optional: Set Environment Variable in Vercel Dashboard

For better control and easier updates, you can set the environment variable in Vercel:

### Steps:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://floally-mvp-production.up.railway.app`
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. Trigger a new deployment (push a commit or click "Redeploy")

## Root Directory Configuration

Ensure Vercel is building from the correct directory:

1. Go to **Settings** → **General**
2. **Root Directory**: `floally-mvp/frontend`
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build` (should be auto-detected)
5. **Output Directory**: `dist` (should be auto-detected)

## Domain Configuration

Your domains are configured with Vercel nameservers:
- **Primary**: heyaimi.ai, heyaimi.com
- **Legacy**: okaimy.com, okaimi.ai

### DNS Records (Managed by Vercel):
All DNS records are automatically managed by Vercel when using Vercel nameservers:
- ns1.vercel-dns.com
- ns2.vercel-dns.com

## Testing After Deployment

Once deployed (commit 825d2d7), test the following:

1. **Visit**: https://heyaimi.ai
2. **Check Console**: Should see "🔧 API Configuration" log showing Railway URL
3. **Click "Connect Google Account"**: Should redirect to Google OAuth (no Network Error)
4. **Complete OAuth**: Should redirect back and load dashboard

## Troubleshooting

### Still seeing Network Error?
1. Check browser console for the API Configuration log
2. Verify it shows Railway URL: `https://floally-mvp-production.up.railway.app`
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Try Incognito/Private mode to clear cache

### Backend not responding?
1. Check Railway dashboard: https://railway.app
2. Verify backend service is running
3. Check backend logs for errors
4. Test backend directly: `curl https://floally-mvp-production.up.railway.app/api/auth/login`

### OAuth redirect not working?
1. Check Railway environment variables have correct OAuth credentials
2. Verify redirect URIs in Google Cloud Console include your Vercel domains
3. Required redirect URIs:
   - `https://heyaimi.ai`
   - `https://heyaimi.com`
   - `https://floally-mvp-production.up.railway.app/api/auth/callback`

## Next Deployment
Current commit: **825d2d7**

The app will now:
✅ Use Railway backend automatically in production
✅ Show "Hey Aimi" branding throughout
✅ Load past "Loading Hey Aimi..." screen correctly
✅ Connect to Google OAuth without Network Error

Wait 2-3 minutes for Vercel to build and deploy, then test!
