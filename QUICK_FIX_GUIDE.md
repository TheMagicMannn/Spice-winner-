# Quick Fix Guide for Admin Dashboard

## Problem
Admin Dashboard Activity Log and Overview showing no data due to RLS policy issues.

## Solution (3 Steps)

### Step 1: Run the SQL Fix Script

**Use the Simple Version (Recommended):**
1. Open Supabase SQL Editor
2. Copy entire contents of `FIX_ACTIVITY_LOG_RLS_SIMPLE.sql`
3. Paste and click **RUN**

✅ This version automatically handles existing policies

---

### Step 2: Populate Test Data

Run this in Supabase SQL Editor:
```sql
SELECT populate_test_activity_data();
```

**Expected output:** `Successfully inserted 150-600 test activity records`

**If you get "No users found":** You need to create at least one user profile first by signing up through your app.

---

### Step 3: Generate Reports

Run this in Supabase SQL Editor:
```sql
SELECT generate_daily_report(CURRENT_DATE - i) 
FROM generate_series(0, 6) i;
```

**Expected output:** 7 rows showing "Daily report generated for [date]"

---

## Verification

Check the data was inserted:
```sql
-- Should return a count > 0
SELECT COUNT(*) FROM user_activity_log;

-- Should return 7 rows
SELECT * FROM daily_activity_reports ORDER BY report_date DESC;
```

---

## View in Admin Dashboard

1. Refresh your Admin Dashboard page
2. Go to **Activity Log** tab
3. Check **"Load all activities"** checkbox
4. Click **"Load All"** button
5. You should see 150-600+ activity records

6. Go to **Overview** tab
7. Charts should display with data

---

## Still Having Issues?

### Issue: "No users found"
**Fix:** Sign up at least one user through your app first, then run Step 2 again.

### Issue: Still no data showing
**Fix:** 
1. Verify you're logged in as an admin user
2. Check console for errors (F12 → Console tab)
3. Verify your user has `is_admin = true`:
```sql
SELECT id, email, is_admin FROM profiles WHERE email = 'your@email.com';
```

---

## Files Reference

- `FIX_ACTIVITY_LOG_RLS_SIMPLE.sql` - **Use this one** (handles existing policies)
- `FIX_ACTIVITY_LOG_RLS.sql` - Full version
- `ADMIN_DASHBOARD_SETUP.md` - Detailed documentation

---

## What Gets Fixed

✅ RLS policies allow data insertion  
✅ RLS policies allow admin data viewing  
✅ Test activity data populated  
✅ Daily reports generated  
✅ Helper functions created  
✅ Admin dashboard shows stats  

---

## Quick Test

After running all steps, this should return data:
```sql
SELECT 
  (SELECT COUNT(*) FROM user_activity_log) as activities,
  (SELECT COUNT(*) FROM daily_activity_reports) as reports;
```

Expected result: Both counts should be > 0
