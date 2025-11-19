# URGENT: Fix Activity Logging Error

## Error Explanation
**Error Code 42804:** Datatype mismatch or function not found

**Root Cause:** The `log_user_activity` RPC function doesn't exist in your Supabase database yet. The frontend code is trying to call this function, but it's not there.

---

## Quick Fix (3 Steps)

### Step 1: Run the SQL Script

Open Supabase SQL Editor and run **`FIX_ACTIVITY_LOG_RLS_FINAL.sql`**

This will create the `log_user_activity` function that the frontend needs.

---

### Step 2: Verify Function Exists

Run this query to confirm:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'log_user_activity';
```

**Expected result:** 1 row showing `log_user_activity | FUNCTION`

---

### Step 3: Test Activity Logging

1. Login to your app
2. Check browser console - should see no errors
3. Go to Admin Dashboard → Activity Log
4. Check "Load all activities"
5. Click "Load All"
6. You should now see the login activity

---

## What This Does

The SQL script creates a special function that allows activity logging to bypass Row Level Security (RLS) policies. Without this function, the frontend can't log activities.

**Function signature:**
```sql
log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB,
  p_ip_address TEXT,
  p_user_agent TEXT
)
```

---

## If You Already Ran Other SQL Scripts

If you ran different SQL scripts before, you might have policy issues. Run this complete script:

**Use:** `/app/FIX_ACTIVITY_LOG_RLS_FINAL.sql`

This is the most recent version that:
- ✅ Fixes all RLS policies
- ✅ Creates the log_user_activity function
- ✅ Handles all constraint violations
- ✅ Creates helper functions for data population

---

## Verification After Fix

**Check function exists:**
```sql
\df log_user_activity
-- or
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname = 'log_user_activity';
```

**Test the function directly:**
```sql
SELECT log_user_activity(
  'YOUR_USER_ID'::uuid,
  'login',
  '{"test": true}'::jsonb,
  NULL,
  NULL
);
```

**Check if activity was logged:**
```sql
SELECT * FROM user_activity_log 
WHERE activity_type = 'login' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## After Running SQL Script

**You should be able to:**
1. ✅ Login without errors
2. ✅ See activities in admin dashboard
3. ✅ See login/signup logged automatically
4. ✅ Browse console without 400 errors

**Next actions:**
1. Clear test data: Run `CLEAR_TEST_DATA.sql`
2. Perform user actions (login, update profile, etc.)
3. Check Activity Log in admin dashboard
4. Generate daily reports

---

## Common Issues

### Issue: "Function still not found"
**Solution:** Make sure you're running the SQL in the correct project/database

### Issue: "Permission denied" 
**Solution:** Run as database owner or with sufficient privileges

### Issue: "Table user_activity_log doesn't exist"
**Solution:** Your schema file should have created this table. Check if it exists:
```sql
SELECT * FROM user_activity_log LIMIT 1;
```

---

## Files Reference

**SQL Scripts (run in order):**
1. ✅ `FIX_ACTIVITY_LOG_RLS_FINAL.sql` - **RUN THIS FIRST**
2. ⏭️ `CLEAR_TEST_DATA.sql` - Run after Step 1 works
3. 📖 `REAL_ACTIVITY_LOGGING_GUIDE.md` - Full documentation

---

## Summary

**Problem:** Frontend trying to call `log_user_activity` function that doesn't exist  
**Solution:** Run `FIX_ACTIVITY_LOG_RLS_FINAL.sql` in Supabase  
**Time:** 1 minute  
**Result:** Activity logging will work immediately  

Run the SQL script now and the error will disappear!
