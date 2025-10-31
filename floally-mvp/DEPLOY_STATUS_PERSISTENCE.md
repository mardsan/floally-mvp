# 🚀 Deploy Status Persistence - Quick Guide

## ✅ Pre-Deployment Checklist

- [x] Backend model created (StandupStatus)
- [x] Backend endpoints implemented (GET/POST/PUT)
- [x] Frontend integration complete
- [x] Migration script created
- [ ] Code committed to git
- [ ] Migration run on Railway
- [ ] Tested on production

## 🔥 Deploy Now (5 minutes)

### 1. Commit Changes (30 seconds)

```bash
cd /workspaces/codespaces-react

# Add all changes
git add floally-mvp/backend/app/models/user.py
git add floally-mvp/backend/app/models/__init__.py
git add floally-mvp/backend/app/routers/standup.py
git add floally-mvp/backend/migrate_add_standup_status.py
git add floally-mvp/frontend/src/components/MainDashboard.jsx

# Commit
git commit -m "✨ Add status persistence for The One Thing

- Database: New standup_status table
- Backend: GET/POST/PUT endpoints for status
- Frontend: Auto-save and auto-load status
- Feature: Status persists across page refreshes"

# Push to deploy
git push origin main
```

### 2. Wait for Railway Deploy (~2 minutes)

Railway will automatically:
- Detect the push
- Build new Docker image
- Deploy to production
- Restart the service

Monitor at: https://railway.app

### 3. Run Database Migration (1 minute)

Once Railway deployment is complete:

**Option A: Railway CLI** (if you have it installed)
```bash
railway run python migrate_add_standup_status.py
```

**Option B: Railway Dashboard**
1. Go to Railway project
2. Click on the backend service
3. Open "Console" tab
4. Run: `python migrate_add_standup_status.py`

Expected output:
```
🔨 Adding standup_status table...
✅ Migration successful!
```

### 4. Test on Production (1 minute)

1. Open: https://www.okaimy.com
2. Log in
3. Generate standup (if not already showing)
4. Change status: **⚪ Preparing** → **🟡 In Progress**
5. **Refresh the page** (Cmd+R or Ctrl+R)
6. ✅ Status should still be **🟡 In Progress**

### 5. Verify Database (Optional)

Check that records are being created:

```bash
# Via Railway console
railway run python -c "
from app.database import SessionLocal
from app.models import StandupStatus
db = SessionLocal()
count = db.query(StandupStatus).count()
print(f'✅ {count} status records in database')
db.close()
"
```

## 🎯 Verification Checklist

After deployment:

- [ ] Backend deployed (check Railway logs)
- [ ] Migration completed successfully
- [ ] Status changes save (check browser console)
- [ ] Status persists after refresh
- [ ] No errors in browser console
- [ ] No 500 errors in Railway logs

## 🔧 Troubleshooting

### Issue: Migration fails with "table already exists"

**Solution**: Table was already created. This is fine! The migration uses `checkfirst=True` which safely skips if the table exists.

### Issue: Status not saving (frontend error)

**Check**:
1. Browser console for errors
2. Network tab - is POST request succeeding?
3. Railway logs - is backend receiving requests?

**Common fix**: Clear browser cache and hard refresh (Cmd+Shift+R)

### Issue: Status saves but doesn't load on refresh

**Check**:
1. GET request in Network tab - is it returning data?
2. Check `has_status` field in response
3. Verify user_email is correct

**Debug**:
```javascript
// In browser console
localStorage.getItem('okaimy_user')  // Should show user email
```

### Issue: Database not accessible

**Check**:
1. Railway DATABASE_URL is set
2. Database service is running
3. Migration was run successfully

**Fix**: Re-run migration script

## 📞 Quick Support

If deployment fails:

1. **Check Railway Logs**: Railway dashboard → Logs tab
2. **Check Frontend Console**: Browser DevTools → Console
3. **Check Network Requests**: Browser DevTools → Network tab

Common errors and fixes in STATUS_PERSISTENCE_COMPLETE.md

## 🎉 Success!

Once status persistence is working:
- Users can track their progress
- Status survives refreshes
- Foundation for future analytics
- Ready for next feature!

**Estimated Total Time**: 5 minutes  
**Complexity**: Low  
**Risk**: Very low (additive feature, doesn't break existing functionality)

---

**Need help?** Check STATUS_PERSISTENCE_COMPLETE.md for full documentation.
