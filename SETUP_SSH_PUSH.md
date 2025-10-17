# 🔐 Enable Git Push from Codespace

## Step 1: Add SSH Key to GitHub

1. **Copy this SSH public key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK1Wb7Vo3NrEg9rsu71uB8TcppkA3RTQriKfJlmV+nzX codespace@floally-mvp
```

2. **Add it to GitHub:**
   - Go to: https://github.com/settings/ssh/new
   - Title: `Codespace - floally-mvp`
   - Key: Paste the key above
   - Click "Add SSH key"

## Step 2: Update Git Remote to Use SSH

Run these commands in the Codespace terminal:

```bash
cd /workspaces/codespaces-react
git remote set-url origin git@github.com:mardsan/floally-mvp.git
```

## Step 3: Configure SSH

```bash
cat >> ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

## Step 4: Test the Connection

```bash
ssh -T git@github.com
```

You should see: "Hi mardsan! You've successfully authenticated..."

## Step 5: Push Your Changes! 🚀

```bash
cd /workspaces/codespaces-react
git push origin main
```

---

## After Successful Push

**Railway (Backend)** will auto-deploy:
- https://floally-mvp-production.up.railway.app
- New AI endpoints: `/api/ai/analyze-emails`, `/api/ai/generate-response`
- Enhanced Gmail endpoint with label intelligence

**Vercel (Frontend)** will auto-deploy:
- https://floally-mvp-d548.vercel.app (or your main domain)
- Complete email intelligence UI (v1.1.0)
- Important Emails section with Alli's analysis

---

## About the Two Vercel Deployments

You mentioned seeing `floally-mvp` and `floally-mvp-d548`:

- **floally-mvp-d548** is likely your production deployment (the -d548 is a Vercel project ID)
- **floally-mvp** might be a different branch or old deployment

**To clean this up:**
1. Go to: https://vercel.com/dashboard
2. Check which project is connected to your GitHub repo
3. Delete any unused projects
4. Set the correct custom domain if needed

The main thing is to ensure ONE Vercel project is connected to `mardsan/floally-mvp` on GitHub, then all pushes to `main` will auto-deploy.

---

## Workflow Going Forward

Once SSH is set up, your workflow becomes:

1. **Make changes in Codespace** ✏️
2. **Commit:** `git add -A && git commit -m "Your message"`
3. **Push:** `git push origin main`
4. **Auto-deploy:** Railway + Vercel deploy automatically! 🚀

No more web editor needed! 🎉
