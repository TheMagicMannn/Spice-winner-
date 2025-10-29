# Verification System - Debugging Guide

## Issue: Pending verification requests not showing in admin panel

### Root Cause
The issue is caused by **Row Level Security (RLS) policies** in Supabase that are preventing the admin from viewing verification requests, even when the user is marked as admin.

## Solution Steps

### Step 1: Run the RLS Fix SQL Script

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `/app/FIX_VERIFICATION_RLS_POLICIES.sql`
4. Copy all content and paste into SQL Editor
5. Click **Run** to execute

This script will:
- ✅ Update all RLS policies to properly allow admin access
- ✅ Create helper functions that bypass RLS for admins
- ✅ Add a policy to profiles table for admin access
- ✅ Create RPC functions: `get_pending_verifications()` and `get_all_verifications()`

### Step 2: Verify Admin Status

Make sure your user is actually marked as admin in the database:

```sql
-- Check admin status
SELECT id, email, is_admin 
FROM profiles 
WHERE id = 'YOUR_USER_ID';

-- If not admin, make them admin
UPDATE profiles 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID';
```

To find your user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

### Step 3: Verify Verification Requests Exist

Check that verification requests actually exist in the database:

```sql
-- Check all verification requests
SELECT 
    vr.id,
    vr.user_id,
    vr.status,
    vr.method,
    vr.created_at,
    p.display_name
FROM verification_requests vr
LEFT JOIN profiles p ON vr.user_id = p.id
ORDER BY vr.created_at DESC;

-- Count pending requests
SELECT COUNT(*) as pending_count
FROM verification_requests
WHERE status = 'pending';
```

### Step 4: Test the RPC Functions

Test if the new RPC functions work correctly:

```sql
-- Test get_pending_verifications (must be run as admin user)
SELECT * FROM get_pending_verifications();

-- Test get_all_verifications (must be run as admin user)
SELECT * FROM get_all_verifications();
```

### Step 5: Clear Browser Cache and Refresh

After running the SQL script:
1. Open the browser console (F12)
2. Clear cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R on Mac)
3. Navigate to the admin verification panel
4. Check the console for any error messages

## How the Fix Works

### Before the Fix
- RLS policies were blocking admin access to verification_requests
- The join with profiles table was also blocked by RLS
- Result: Query returns 0 rows even though data exists

### After the Fix
- **Primary Solution**: Created `SECURITY DEFINER` functions that bypass RLS
  - `get_pending_verifications()` - Returns all pending verifications with profile data
  - `get_all_verifications()` - Returns all verifications with profile data
  
- **Fallback Solution**: Updated RLS policies to explicitly allow admin access
  - Modified the "Users can view their own verification requests" policy to include admins
  - Added policy to profiles table to allow admins to view all profiles

- **Frontend Implementation**: Updated `verificationService.ts` to:
  1. First try using RPC functions (bypasses RLS)
  2. Fall back to direct query if RPC fails
  3. Added comprehensive logging to debug issues

## Troubleshooting

### If requests still don't show up:

#### 1. Check Console Logs
Open browser console (F12) and look for:
```
Fetching pending verifications...
Successfully fetched via RPC: [...]
```

If you see errors, they will help identify the issue.

#### 2. Test Direct Database Query
Run this in Supabase SQL Editor as the admin user:

```sql
-- This should return results if data exists
SELECT * FROM verification_requests WHERE status = 'pending';
```

If this returns data but the app doesn't show it, it's an RLS issue.

#### 3. Check RLS Policies
View current RLS policies in Supabase:

```sql
-- View policies on verification_requests
SELECT * FROM pg_policies WHERE tablename = 'verification_requests';

-- View policies on profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### 4. Test is_admin Function
Make sure the `is_admin()` function works:

```sql
-- Replace with your user ID
SELECT is_admin('YOUR_USER_ID'::uuid);
-- Should return 'true' if user is admin
```

#### 5. Check Foreign Key Name
The query uses `profiles!verification_requests_user_id_fkey`. Verify this foreign key exists:

```sql
SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'verification_requests'::regclass 
AND contype = 'f';
```

If the foreign key has a different name, update the query in `verificationService.ts`.

### If RPC Functions Don't Work

The frontend has a fallback to direct queries. If RPC functions fail, check:

1. Functions were created successfully
2. Functions have `SECURITY DEFINER` attribute
3. Admin user has proper permissions

To recreate functions:
```sql
DROP FUNCTION IF EXISTS get_pending_verifications();
DROP FUNCTION IF EXISTS get_all_verifications();
-- Then re-run the FIX_VERIFICATION_RLS_POLICIES.sql script
```

## Common Errors and Solutions

### Error: "relation 'verification_requests' does not exist"
**Solution**: Run `VERIFICATION_SYSTEM_SETUP.sql` first to create tables

### Error: "permission denied for table verification_requests"
**Solution**: Run the RLS fix script to update policies

### Error: "function get_pending_verifications() does not exist"
**Solution**: Run `FIX_VERIFICATION_RLS_POLICIES.sql` to create functions

### Error: "infinite recursion detected in policy"
**Solution**: The fix script creates `SECURITY DEFINER` functions to prevent this

### Console shows: "RPC not available"
**Solution**: This is normal if RPC functions aren't created. The fallback direct query should work.

## Testing the Fix

1. **As Admin User**:
   - Go to `/admin/verification` (or `/#/admin/verification` if using hash router)
   - Should see pending verification requests
   - Should be able to click on a request to see details
   - Should be able to approve/reject requests

2. **Console Logs**:
   - Open F12 console
   - Should see: "Fetching pending verifications..."
   - Should see: "Successfully fetched via RPC: [array of requests]"
   - OR: "Pending verifications query result: { data: [...], error: null }"

3. **Verification Count**:
   - Stats at top should show correct counts
   - "Pending" count should match database count

## Prevention

To avoid this issue in the future:
1. Always test RLS policies with different user roles
2. Use `SECURITY DEFINER` functions for admin operations
3. Test admin features with actual admin accounts, not as database owner
4. Add comprehensive logging to identify RLS issues early

## Additional Resources

- Supabase RLS Documentation: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Supabase Functions: https://supabase.com/docs/guides/database/functions

## Support

If issues persist after following this guide:
1. Check Supabase logs for any database errors
2. Verify all SQL scripts ran without errors
3. Test with a fresh admin user account
4. Check if Supabase project has any custom RLS settings
