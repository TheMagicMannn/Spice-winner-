# Admin Dashboard Setup Guide

## Issue: Activity Logs & Overview Stats Not Showing Data

### Root Cause
The admin dashboard's Activity Log and Overview pages are not displaying data because:

1. **Row Level Security (RLS) policies** on `user_activity_log` table are blocking INSERT operations
2. **No activity data exists** in the database because inserts have been prevented
3. **Daily reports table is empty** because there's no activity data to aggregate

### Solution

Follow these steps to fix the issue:

---

## Step 1: Run the RLS Fix SQL Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the contents of `/app/FIX_ACTIVITY_LOG_RLS.sql`
4. Paste and **Run** the SQL script

This script will:
- Fix RLS policies on `user_activity_log` table
- Fix RLS policies on `daily_activity_reports` table
- Fix RLS policies on `admin_actions_log` table
- Create helper functions for logging activities
- Create functions to populate test data
- Create functions to generate daily reports

---

## Step 2: Populate Test Activity Data

After running the RLS fix script, populate the database with test activity data:

```sql
-- Run this in Supabase SQL Editor
SELECT populate_test_activity_data();
```

This will:
- Generate 150-600 test activity records
- Spread activities across the past 30 days
- Include various activity types: logins, signups, messages, likes, matches, etc.
- Use existing user profiles from your database

**Note:** If you get an error saying "No users found", you need to create some user profiles first.

---

## Step 3: Generate Daily Reports

Generate daily activity reports for the Overview charts:

```sql
-- Generate reports for the past 7 days
SELECT generate_daily_report(CURRENT_DATE - i) 
FROM generate_series(0, 6) i;
```

This will create entries in the `daily_activity_reports` table with aggregated statistics.

---

## Step 4: Verify Data

Check that data was inserted successfully:

```sql
-- Check activity log count
SELECT COUNT(*) as activity_count FROM user_activity_log;

-- Check recent activities
SELECT * FROM user_activity_log 
ORDER BY created_at DESC 
LIMIT 10;

-- Check daily reports
SELECT * FROM daily_activity_reports 
ORDER BY report_date DESC;
```

---

## Step 5: Refresh Admin Dashboard

1. Go to your Admin Dashboard
2. Navigate to **Activity Log** tab
3. Check the **"Load all activities"** checkbox
4. Click **"Load All"** button
5. You should now see activity data

6. Navigate to **Overview** tab
7. Charts should now display with real data

---

## What the Fix Does

### RLS Policy Changes

**Before:** Overly restrictive policies blocked all INSERT operations
**After:** Policies now allow:
- ✅ Users to insert their own activities
- ✅ Service role to insert any activity (for triggers)
- ✅ Admins to view all activities
- ✅ Users to view their own activities

### Helper Functions Created

1. **`log_user_activity()`** - Function to log activities that bypasses RLS
2. **`populate_test_activity_data()`** - Generates realistic test data
3. **`generate_daily_report()`** - Creates daily aggregated statistics

---

## Activity Types Available

The system tracks these activity types:
- `user_login` - User login events
- `user_signup` - New user registrations
- `profile_updated` - Profile edits
- `profile_viewed` - Profile views
- `profile_liked` - Likes/swipes
- `match_created` - Successful matches
- `message_sent` - Messages sent
- `photo_uploaded` - Photo uploads
- `payment_completed` - Payment transactions

---

## Real Production Usage

Once the RLS policies are fixed, your application will automatically start logging real user activities as they happen:

- User logins
- Profile updates
- Messages sent
- Matches made
- Etc.

The test data is only needed to populate the dashboard immediately for demonstration purposes.

---

## Troubleshooting

### Still no data after running scripts?

1. **Check admin permissions:**
   ```sql
   SELECT id, email, is_admin FROM profiles WHERE is_admin = true;
   ```
   Make sure your user account has `is_admin = true`

2. **Verify RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_activity_log';
   ```

3. **Check for errors in browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for any error messages
   - Check Network tab for failed API requests

4. **Verify Supabase connection:**
   - Make sure your Supabase URL and keys are correct in `.env` files

### Data shows but charts don't update?

- Click the refresh button in Activity Log
- Navigate away and back to Overview tab
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

---

## Support

If you continue to experience issues:

1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify all SQL scripts ran without errors
4. Ensure your user account is marked as admin (`is_admin = true` in profiles table)

---

## Summary

✅ **RLS policies fixed** - Data can now be inserted and read  
✅ **Test data populated** - Activity log has sample data  
✅ **Daily reports generated** - Overview charts have data  
✅ **Admin dashboard functional** - All stats and logs working  

The admin dashboard should now display real-time statistics and activity logs!
