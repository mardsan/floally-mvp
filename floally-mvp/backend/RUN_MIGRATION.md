# 🚀 Run Migration on Railway - Simple Guide

## Option 1: Railway Web Console (Recommended - 2 minutes)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Open your `floally-mvp` project
   - Click on your **PostgreSQL database** service (not the backend app)

2. **Open Data Tab**
   - Click the "Data" tab
   - This opens the database query console

3. **Run the SQL Migration**
   - Copy the entire contents of `backend/create_standup_status_table.sql`
   - Paste it into the query console
   - Click "Run" or press Cmd+Enter / Ctrl+Enter

4. **Verify Success**
   - You should see: "standup_status table created successfully!"
   - The message will show the column count (should be 14-15 columns)

5. **Done!** ✅
   - Table is now created
   - Go to www.okaimy.com and test status persistence

---

## Option 2: Railway CLI (If you have it configured)

```bash
# Login to Railway (opens browser)
railway login

# Link to your project (if not already linked)
railway link

# Run migration
railway run python backend/migrate_add_standup_status.py
```

---

## Option 3: Direct Database Connection

If you have the DATABASE_URL:

```bash
# Get DATABASE_URL from Railway dashboard
# Settings > Variables > DATABASE_URL

# Connect with psql
psql $DATABASE_URL

# Run the SQL file
\i backend/create_standup_status_table.sql

# Or paste the SQL directly
```

---

## Verification

After running the migration, verify it worked:

### Via Railway Data Tab
```sql
-- Check table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'standup_status'
ORDER BY ordinal_position;

-- Should show all columns
```

### Via Production App
1. Go to www.okaimy.com
2. Log in
3. Change status to "🟡 In Progress"  
4. Refresh the page (Cmd+R / Ctrl+R)
5. ✅ Status should still be "🟡 In Progress"

---

## Troubleshooting

### Error: "relation already exists"
- **Solution**: Table already created! This is fine, it means the migration already ran.
- Just verify the table exists and test the app.

### Error: "permission denied"
- **Solution**: Make sure you're running the query on the **PostgreSQL database** service, not the application service.

### Error: "relation users does not exist"
- **Solution**: The users table hasn't been created yet. Run your main database setup first, then run this migration.

---

## What This Migration Does

Creates the `standup_status` table with:
- ✅ UUID primary key
- ✅ Foreign key to users table
- ✅ Status tracking fields (status, started_at, completed_at)
- ✅ Task details (title, description, project, urgency)
- ✅ AI context (reasoning, secondary_priorities, daily_plan)
- ✅ Timestamps (date, created_at, updated_at)
- ✅ Index on (user_id, date) for fast queries

**Estimated time**: 2 minutes  
**Risk**: Very low (uses IF NOT EXISTS, won't break existing data)

---

**Recommended**: Use Option 1 (Railway Web Console) - it's the fastest and most reliable!
