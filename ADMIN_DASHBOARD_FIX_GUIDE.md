# Admin Dashboard Fix Guide

## Problem
The admin dashboard is not showing any data from Supabase. You're seeing 400 (Bad Request) and 406 (Not Acceptable) errors in the logs.

## Root Causes Identified

1. **Missing or Incorrect Tables**: Tables like `user_activity_log`, `daily_activity_reports`, and `user_reports` may not exist in your database
2. **Duplicate RLS Policies**: There are 24 duplicate/conflicting RLS policies on the `profiles` table
3. **Foreign Key Issues**: Foreign key relationships are preventing joins from working
4. **Blocked Admin Access**: RLS policies are blocking admins from viewing joined data

## Solution Steps

### Step 1: Run the SQL Fix Script

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file `/app/FIX_ADMIN_DASHBOARD_RLS_AND_TABLES.sql`
4. Copy all the SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute

This script will:
- ✅ Create missing tables (`user_activity_log`, `daily_activity_reports`, `user_reports`)
- ✅ Remove all duplicate/conflicting RLS policies
- ✅ Create clean, simplified RLS policies
- ✅ Add proper indexes for performance
- ✅ Create the `get_activity_summary` function
- ✅ Fix foreign key relationships
- ✅ Insert sample data for testing

### Step 2: Verify the Fix

After running the SQL script, run these verification queries in the SQL Editor:

```sql
-- 1. Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_activity_log', 'user_reports', 'daily_activity_reports', 'profiles')
ORDER BY table_name;

-- 2. Check profiles policies (should see 5 clean policies)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- 3. Verify you can query the tables
SELECT COUNT(*) FROM user_activity_log;
SELECT COUNT(*) FROM user_reports;
SELECT COUNT(*) FROM daily_activity_reports;
```

### Step 3: Update Your Code

I've already updated the following files to handle errors more gracefully:

1. **`/app/src/services/adminService.ts`**
   - Updated `getUserActivities()` to handle foreign key errors
   - Updated `getActivitySummary()` to return empty array instead of throwing
   - Updated `getDailyReport()` to use `maybeSingle()` instead of `single()`

2. **`/app/src/services/reportService.ts`**
   - Updated `getReports()` to handle foreign key errors
   - Added fallback to query without joins if foreign keys fail

### Step 4: Test the Admin Dashboard

1. Make sure you're logged in as an admin user
2. Go to `/admin/dashboard` in your app
3. Check each tab:
   - ✅ **Overview**: Should show today's statistics
   - ✅ **Users**: Should list all users
   - ✅ **Activity Log**: Should show recent activities
   - ✅ **Reports**: Should show user reports

### Step 5: Check Browser Console

Open the browser console (F12) and look for these logs:
- `[AdminService] Fetching users with filters:`
- `[AdminService] Query result:`
- `[AdminService] Returning users:`

If you still see errors, share the console logs and I'll help debug further.

## What Changed

### Before:
- 24 duplicate/conflicting RLS policies on profiles
- Missing tables for activity logging and reports
- Complex foreign key joins that were failing
- Errors would crash the UI

### After:
- 5 clean, simplified RLS policies per table
- All required tables created with proper structure
- Graceful error handling with fallbacks
- Empty data instead of crashes when queries fail
- Better logging for debugging

## RLS Policies Structure

### Profiles Table (5 policies):
1. `admins_all_access_profiles` - Admins can do everything
2. `users_view_own_profile` - Users can view their own profile
3. `users_update_own_profile` - Users can update their own profile
4. `users_insert_own_profile` - Users can create their profile
5. `users_view_active_profiles` - All authenticated users can view active profiles

### User Activity Log Table (3 policies):
1. `admins_view_all_activity_logs` - Admins can view all logs
2. `system_insert_activity_logs` - System can log activities
3. `users_view_own_activity` - Users can view their own activity

### User Reports Table (4 policies):
1. `admins_view_all_reports` - Admins can view all reports
2. `admins_update_reports` - Admins can update report status
3. `users_create_reports` - Users can submit reports
4. `users_view_own_reports` - Users can view their submitted reports

### Daily Activity Reports Table (2 policies):
1. `admins_view_daily_reports` - Admins can view reports
2. `system_manage_daily_reports` - System can create/update reports

## Troubleshooting

### If data still doesn't show:

1. **Check if you're actually an admin:**
   ```sql
   SELECT id, display_name, is_admin FROM profiles WHERE email = 'your-email@example.com';
   ```
   Make sure `is_admin` is `true`

2. **Check table permissions:**
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'user_activity_log';
   ```

3. **Try inserting test data:**
   ```sql
   INSERT INTO user_activity_log (user_id, activity_type, activity_data)
   VALUES (auth.uid(), 'test_activity', '{"test": true}');
   ```

4. **Check the browser Network tab:**
   - Filter by "user_activity_log" or "profiles"
   - Look at the request/response
   - Share any 400/403/406 errors you see

## Expected Behavior After Fix

✅ Overview tab shows statistics (may be 0 if no data yet)  
✅ Users tab lists all profiles with membership info  
✅ Activity Log tab shows recent user activities (may be empty initially)  
✅ Reports tab shows user reports (may be empty initially)  
✅ No 400/406 errors in console  
✅ Proper error messages if tables are truly empty  
✅ Real-time updates work (green pulse indicator)

## Need More Help?

If the issue persists after following these steps:
1. Share the browser console logs
2. Share any SQL errors from Supabase
3. Let me know which specific tab is failing
4. I'll help debug the specific issue

---

**Note**: This fix maintains all your existing data. It only removes duplicate policies and creates missing tables. No data will be lost.
