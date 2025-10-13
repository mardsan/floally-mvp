# 🚀 FloAlly MVP - Quick Deployment (5 Steps)

Your code is ready to deploy! Follow these steps:

---

## Step 1️⃣: Push to GitHub (2 minutes)

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `floally-mvp`
   - Description: `FloAlly MVP - AI-powered daily stand-up partner`
   - Make it **Public**
   - Click **"Create repository"**

2. **Push your code:**
   ```bash
   cd /workspaces/codespaces-react
   git remote add origin https://github.com/YOUR_USERNAME/floally-mvp.git
   git push -u origin main
   ```

---

## Step 2️⃣: Deploy Backend to Railway (5 minutes)

1. **Sign up/Login to Railway:**
   - Go to https://railway.app
   - Click **"Login with GitHub"**

2. **Create new project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your `floally-mvp` repository
   - Railway will ask for a root directory - select `floally-mvp/backend`

3. **Add environment variables:**
   Click **"Variables"** tab and add:
   ```
   GOOGLE_CLIENT_ID=693194335583-tunqqbbktqn6eboml4gat86vl6c7vj5h.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   ANTHROPIC_API_KEY=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
   ```

4. **Generate public URL:**
   - Go to **Settings** → **Networking**
   - Click **"Generate Domain"**
   - Copy your URL (e.g., `https://floally-backend-production.up.railway.app`)

5. **Add two more variables with your Railway URL:**
   ```
   GOOGLE_REDIRECT_URI=https://YOUR-RAILWAY-URL/api/auth/callback
   FRONTEND_URL=https://YOUR-VERCEL-URL (add this after next step)
   ```

---

## Step 3️⃣: Deploy Frontend to Vercel (5 minutes)

1. **Sign up/Login to Vercel:**
   - Go to https://vercel.com
   - Click **"Sign Up"** or **"Login with GitHub"**

2. **Import project:**
   - Click **"Add New..."** → **"Project"**
   - Select your `floally-mvp` repository
   - Click **"Import"**

3. **Configure project:**
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** Click "Edit" → select `floally-mvp/frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)

4. **Add environment variable:**
   - Click **"Environment Variables"**
   - Add:
     - Name: `VITE_API_URL`
     - Value: `https://YOUR-RAILWAY-URL` (from Step 2)
   - Click **"Add"**

5. **Deploy:**
   - Click **"Deploy"**
   - Wait 1-2 minutes
   - Copy your Vercel URL (e.g., `https://floally-mvp.vercel.app`)

---

## Step 4️⃣: Update Railway with Frontend URL (1 minute)

1. Go back to Railway dashboard
2. Go to your project → **Variables** tab
3. Add or update:
   ```
   FRONTEND_URL=https://YOUR-VERCEL-URL
   ```
4. Railway will automatically redeploy

---

## Step 5️⃣: Update Google OAuth (2 minutes)

1. **Go to Google Cloud Console:**
   - Visit https://console.cloud.google.com
   - Navigate to **"APIs & Services"** → **"Credentials"**

2. **Update OAuth Client:**
   - Click on your OAuth 2.0 Client ID
   - Under **"Authorized redirect URIs"**, click **"ADD URI"**
   - Add: `https://YOUR-RAILWAY-URL/api/auth/callback`
   - Click **"SAVE"**

---

## ✅ Testing Your Deployment

1. Visit your Vercel URL
2. Click **"Connect Google Account"**
3. Complete the OAuth flow
4. Verify that Gmail and Calendar data loads

---

## 📝 Your Deployment URLs

**Save these for reference:**

- **Frontend:** https://YOUR-VERCEL-URL
- **Backend:** https://YOUR-RAILWAY-URL
- **API Docs:** https://YOUR-RAILWAY-URL/docs

---

## 🐛 Troubleshooting

### Frontend shows "Network Error"
- Check that `VITE_API_URL` in Vercel matches your Railway URL
- Make sure Railway backend is deployed and running

### OAuth errors
- Verify the redirect URI in Google Cloud Console matches your Railway URL exactly
- Check that `GOOGLE_REDIRECT_URI` in Railway is correct

### Backend not responding
- Check Railway logs: Dashboard → Deployments → View Logs
- Verify all environment variables are set

---

## 🎉 You're Done!

Your FloAlly MVP is now live in production with:
- ✅ Stable backend on Railway
- ✅ Fast frontend on Vercel
- ✅ No more port forwarding issues!
- ✅ Automatic deployments on git push

---

**Need help? Check the full DEPLOYMENT_GUIDE.md for more details!**
