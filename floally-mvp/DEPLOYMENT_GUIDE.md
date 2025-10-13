# FloAlly MVP - Deployment Guide

This guide will help you deploy FloAlly to production using Railway (backend) and Vercel (frontend).

---

## 🚂 Part 1: Deploy Backend to Railway

### Prerequisites
- Railway account (sign up at https://railway.app)
- GitHub repository (optional but recommended)

### Option A: Deploy via Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Navigate to backend directory:**
   ```bash
   cd /workspaces/codespaces-react/floally-mvp/backend
   ```

4. **Initialize Railway project:**
   ```bash
   railway init
   ```

5. **Add environment variables:**
   ```bash
   railway variables set GOOGLE_CLIENT_ID="693194335583-tunqqbbktqn6eboml4gat86vl6c7vj5h.apps.googleusercontent.com"
   railway variables set GOOGLE_CLIENT_SECRET="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"
   railway variables set ANTHROPIC_API_KEY="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"
   ```

6. **Deploy:**
   ```bash
   railway up
   ```

7. **Get your backend URL:**
   ```bash
   railway domain
   ```
   This will give you a URL like: `https://your-app.railway.app`

### Option B: Deploy via Railway Dashboard (Easier)

1. Go to https://railway.app and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select the repository
4. Select the `floally-mvp/backend` directory as the root
5. Add environment variables in the dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_REDIRECT_URI` (add after you get the Railway URL)
   - `FRONTEND_URL` (add after you deploy frontend)
6. Railway will automatically deploy!
7. Copy your Railway app URL (e.g., `https://floally-backend-production.up.railway.app`)

---

## ▲ Part 2: Deploy Frontend to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Backend URL from Railway

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd /workspaces/codespaces-react/floally-mvp/frontend
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: Yes
   - Link to existing project: No
   - Project name: floally-mvp
   - Directory: ./
   - Override settings: No

5. **Set environment variable:**
   ```bash
   vercel env add VITE_API_URL production
   ```
   Enter your Railway backend URL when prompted.

6. **Redeploy with environment variable:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard (Easier)

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Vite
   - Root Directory: `floally-mvp/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: Your Railway backend URL (e.g., `https://floally-backend-production.up.railway.app`)
6. Click "Deploy"
7. Wait for deployment to complete
8. Copy your Vercel URL (e.g., `https://floally-mvp.vercel.app`)

---

## 🔄 Part 3: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Add your production URLs to "Authorized redirect URIs":
   - `https://your-railway-app.railway.app/api/auth/callback`
5. Click "Save"

---

## 🔄 Part 4: Update Backend Environment Variables

Update the backend environment variables in Railway with your production URLs:

```bash
railway variables set GOOGLE_REDIRECT_URI="https://your-railway-app.railway.app/api/auth/callback"
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"
```

Or update them in the Railway dashboard.

---

## ✅ Part 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Click "Connect Google Account"
3. Complete OAuth flow
4. Verify Gmail and Calendar integration works

---

## 🎯 Quick Deploy (Fastest Method)

If you want the absolute fastest deployment:

### 1. Push to GitHub
```bash
cd /workspaces/codespaces-react/floally-mvp
git init
git add .
git commit -m "Initial commit"
gh repo create floally-mvp --public --source=. --remote=origin --push
```

### 2. Deploy Backend (Railway)
- Go to https://railway.app
- Click "New Project" → "Deploy from GitHub repo"
- Select `floally-mvp/backend`
- Add environment variables
- Copy the Railway URL

### 3. Deploy Frontend (Vercel)
- Go to https://vercel.com
- Click "Add New" → "Project"
- Select `floally-mvp/frontend`
- Add `VITE_API_URL` environment variable with Railway URL
- Deploy

### 4. Update Google OAuth
- Add Railway callback URL to Google Cloud Console

---

## 📝 Environment Variables Summary

### Backend (Railway)
```
GOOGLE_CLIENT_ID=693194335583-tunqqbbktqn6eboml4gat86vl6c7vj5h.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
ANTHROPIC_API_KEY=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
GOOGLE_REDIRECT_URI=https://[YOUR-RAILWAY-URL]/api/auth/callback
FRONTEND_URL=https://[YOUR-VERCEL-URL]
```

### Frontend (Vercel)
```
VITE_API_URL=https://[YOUR-RAILWAY-URL]
```

---

## 🐛 Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` is set correctly in Railway
- Check that CORS is configured to allow your Vercel domain

### OAuth Errors
- Verify Google OAuth redirect URI matches your Railway URL
- Make sure you added your Railway callback URL to Google Cloud Console

### Build Failures
- Check build logs in Railway/Vercel dashboards
- Verify all environment variables are set

---

## 💡 Next Steps

After deployment:
1. Test all features thoroughly
2. Set up custom domains (optional)
3. Enable analytics/monitoring
4. Set up CI/CD pipelines
5. Implement proper session management (move away from file-based credentials)

---

**Ready to deploy? Let's start with the easiest method - GitHub + Railway + Vercel!**
