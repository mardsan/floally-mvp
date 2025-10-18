# 🔧 Complete Environment Variables Setup

**Date:** October 18, 2025  
**Status:** ⚠️ CRITICAL - OAuth redirect failing

---

## 🚨 Current Issue

**OAuth redirects to old d548 deployment** because:
1. Railway backend has wrong `FRONTEND_URL` environment variable
2. Google OAuth credentials may still point to old URL
3. Vercel needs environment variables set

---

## ✅ REQUIRED ENVIRONMENT VARIABLES

### **1. Railway Backend** (https://railway.app)

Go to: **Railway Dashboard → Your Project → Variables**

Add/Update these variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `FRONTEND_URL` | `https://floally-mvp.vercel.app` | Where OAuth redirects after login |
| `GOOGLE_CLIENT_ID` | `[your-google-client-id]` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `[your-google-client-secret]` | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://floally-mvp-production.up.railway.app/api/auth/callback` | OAuth callback URL |
| `ANTHROPIC_API_KEY` | `[your-anthropic-api-key]` | For Claude AI |
| `ALLOWED_ORIGINS` | `https://floally-mvp.vercel.app` | CORS allowed origins |

**After changing variables:** Railway will auto-redeploy (takes 2-3 minutes)

---

### **2. Vercel Frontend** (https://vercel.com)

Go to: **Vercel Dashboard → floally-mvp → Settings → Environment Variables**

Add/Update:

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `VITE_API_URL` | `https://floally-mvp-production.up.railway.app` | ✅ Production ✅ Preview ✅ Development |

**After changing variables:** Must redeploy manually

---

### **3. Google Cloud Console** (https://console.cloud.google.com)

Go to: **APIs & Services → Credentials → OAuth 2.0 Client IDs → [Your Client ID]**

Update **Authorized redirect URIs:**

Remove:
- ❌ `https://floally-mvp-d548.vercel.app/?auth=success`
- ❌ Any old URLs

Add:
- ✅ `https://floally-mvp.vercel.app/?auth=success`
- ✅ `https://floally-mvp-production.up.railway.app/api/auth/callback`
- ✅ `http://localhost:5173/?auth=success` (for local dev)
- ✅ `http://localhost:8000/api/auth/callback` (for local dev)

Update **Authorized JavaScript origins:**
- ✅ `https://floally-mvp.vercel.app`
- ✅ `https://floally-mvp-production.up.railway.app`
- ✅ `http://localhost:5173` (for local dev)
- ✅ `http://localhost:8000` (for local dev)

---

## 📋 Step-by-Step Fix

### **Step 1: Update Railway Backend (5 minutes)**

1. Go to: https://railway.app/dashboard
2. Click your project
3. Click "Variables" tab
4. Update/Add:
   ```
   FRONTEND_URL=https://floally-mvp.vercel.app
   ALLOWED_ORIGINS=https://floally-mvp.vercel.app
   ```
5. Wait for Railway to redeploy (watch the "Deployments" tab)

### **Step 2: Update Google OAuth (3 minutes)**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs":
   - Delete: `https://floally-mvp-d548.vercel.app/?auth=success`
   - Add: `https://floally-mvp.vercel.app/?auth=success`
4. Click "Save"

### **Step 3: Verify Vercel Variables (Already Done ✅)**

1. Go to: https://vercel.com/[your-username]/floally-mvp/settings/environment-variables
2. Confirm `VITE_API_URL` is set to: `https://floally-mvp-production.up.railway.app`
3. If not set, add it and redeploy

### **Step 4: Redeploy Both Services**

**Railway:**
- Should auto-redeploy after changing variables
- Or manually: Go to Deployments → Click "Deploy" on latest

**Vercel:**
- Go to: https://vercel.com/[your-username]/floally-mvp/deployments
- Click "..." on latest deployment
- Click "Redeploy"

### **Step 5: Test the Fix**

1. Clear browser cache and cookies for both sites
2. Go to: https://floally-mvp.vercel.app
3. Try to log in with Google
4. Should redirect properly to: `https://floally-mvp.vercel.app/?auth=success`
5. Check browser console - should show: `API URL: https://floally-mvp-production.up.railway.app`

---

## 🔍 How to Find Your Current Environment Variables

### **Railway:**
```bash
# If you have Railway CLI installed:
railway variables
```

### **Vercel:**
```bash
# If you have Vercel CLI installed:
cd floally-mvp/frontend
vercel env ls
```

### **Google Cloud:**
- Go to: https://console.cloud.google.com/apis/credentials
- Click your OAuth client
- Your Client ID and Secret are visible there
- Check "Authorized redirect URIs" to see current configuration

---

## 🐛 Troubleshooting

### **Still redirecting to d548:**
1. ✅ Check Railway `FRONTEND_URL` variable
2. ✅ Check Google Cloud redirect URIs
3. ✅ Clear browser cache completely
4. ✅ Try incognito/private browsing mode

### **"redirect_uri_mismatch" error:**
- The redirect URI in Google Cloud doesn't match what Railway is sending
- Update Google Cloud redirect URIs (see Step 2 above)

### **"Failed to submit feedback" errors:**
- Check `VITE_API_URL` in Vercel
- Check browser Network tab - should call Railway URL
- Verify Railway backend is running: `curl https://floally-mvp-production.up.railway.app/api/health`

### **"[User]" still showing:**
- This is normal until you complete onboarding
- Complete onboarding to set your name
- If you've completed onboarding but still seeing [User], check that Railway `FRONTEND_URL` is correct

---

## 📊 Environment Variables Checklist

- [ ] **Railway:** `FRONTEND_URL` → `https://floally-mvp.vercel.app`
- [ ] **Railway:** `ALLOWED_ORIGINS` → `https://floally-mvp.vercel.app`
- [ ] **Railway:** `GOOGLE_REDIRECT_URI` → `https://floally-mvp-production.up.railway.app/api/auth/callback`
- [ ] **Railway:** `GOOGLE_CLIENT_ID` → (your client ID)
- [ ] **Railway:** `GOOGLE_CLIENT_SECRET` → (your client secret)
- [ ] **Railway:** `ANTHROPIC_API_KEY` → (your Anthropic key)
- [ ] **Vercel:** `VITE_API_URL` → `https://floally-mvp-production.up.railway.app`
- [ ] **Google Cloud:** Redirect URIs updated (remove d548, add floally-mvp)
- [ ] **Railway:** Redeployed after variable changes
- [ ] **Vercel:** Redeployed after variable changes
- [ ] **Browser:** Cache cleared
- [ ] **Test:** OAuth login works
- [ ] **Test:** API calls succeed
- [ ] **Test:** "Help Aime learn" works

---

## 🎯 Expected Result After All Fixes

1. ✅ Log in with Google → Redirects to `floally-mvp.vercel.app`
2. ✅ Tab title shows "OpAime - Your AI Daily Stand-Up Partner"
3. ✅ Generate Stand-Up works
4. ✅ Analyze Emails works
5. ✅ Help Aime Learn works
6. ✅ Complete onboarding → Your name appears in greeting

---

## 📝 Quick Reference

**Railway Backend URL:** `https://floally-mvp-production.up.railway.app`  
**Vercel Frontend URL:** `https://floally-mvp.vercel.app`  
**OAuth Callback:** `https://floally-mvp-production.up.railway.app/api/auth/callback`  
**Frontend Redirect:** `https://floally-mvp.vercel.app/?auth=success`

---

**Last Updated:** October 18, 2025  
**Priority:** 🔴 HIGH - OAuth broken, needs immediate fix
