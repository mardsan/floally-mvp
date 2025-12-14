# Fix Anthropic API Key

## Problem
Your Anthropic API key is **invalid or expired** (getting 401 authentication errors).

## Solution - Get New API Key

### Step 1: Get New Key from Anthropic Console
1. Go to: **https://console.anthropic.com/settings/keys**
2. Log in with your Anthropic account
3. Click **"Create Key"** or **"Generate New Key"**
4. Copy the new key (starts with `sk-ant-api03-...`)

### Step 2: Update Local Environment
```bash
# Edit backend/.env file
cd /workspaces/codespaces-react/floally-mvp/backend
nano .env

# Replace line 8:
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_NEW_KEY_HERE
```

### Step 3: Update Railway Production
1. Go to Railway dashboard: **https://railway.app/**
2. Select your **floally-mvp-production** project
3. Go to **Variables** tab
4. Find `ANTHROPIC_API_KEY`
5. Click **Edit** and paste your new key
6. Save (Railway will auto-redeploy in ~2-3 minutes)

### Step 4: Verify Fix
```bash
# Test locally
cd /workspaces/codespaces-react/floally-mvp/backend
source venv/bin/activate
python3 << 'EOF'
import anthropic, os
from dotenv import load_dotenv
load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=10,
    messages=[{"role": "user", "content": "Say hi"}]
)
print(f"✅ Anthropic working! Response: {response.content[0].text}")
EOF
```

## Why This Happened
- API keys can expire or be revoked
- Account billing issues can invalidate keys
- Keys may have usage limits that were exceeded

## After Fix
Once you update the key:
- ✅ Claude Sonnet will handle reasoning tasks (best quality)
- ✅ Full three-provider redundancy restored
- ✅ All tests will pass
- ✅ Cost optimization at maximum efficiency
