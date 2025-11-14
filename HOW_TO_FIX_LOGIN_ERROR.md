# 🔧 Fix Login Error: "relation 'profiles' does not exist"

## Problem Summary

**Error Message:**
```
error update user's last_sign_in field: ERROR: relation "profiles" does not exist (SQLSTATE 42P01)
```

**What Happened:**
When you applied the admin dashboard SQL files, they referenced a `profiles` table with an `is_admin` column. However, either:
1. The profiles table was accidentally dropped, OR
2. The profiles table exists but is missing the `is_admin` column needed by admin dashboard policies

This breaks login because Supabase's authentication system tries to:
1. Authenticate the user ✅ (works)
2. Trigger the `handle_new_user()` function to create/update profile
3. Query the `profiles` table ❌ (fails - table missing or broken)

---

## ✅ Solution: Run the Fix SQL Script

I've created a comprehensive fix script that will:
- Recreate the `profiles` table if missing
- Add the `is_admin` column if table exists but column is missing
- Restore all triggers and functions
- Fix RLS policies
- Create profile entries for existing users

### Step-by-Step Instructions

#### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/cbefwjwqworwfctadogk

#### 2. Navigate to SQL Editor
- Click on **SQL Editor** in the left sidebar
- Click **New Query**

#### 3. Copy the Fix Script
Open the file: `/app/FIX_PROFILES_TABLE_RESTORE.sql`

**OR copy from below:**

```sql
-- The complete script is in /app/FIX_PROFILES_TABLE_RESTORE.sql
-- It's about 350 lines
```

#### 4. Run the Script
- Paste the entire script into the SQL Editor
- Click **Run** button (or press Ctrl/Cmd + Enter)

#### 5. Check the Results
You should see output with:
- ✅ Tables created/updated
- ✅ Indexes created
- ✅ Triggers created
- ✅ Policies created
- ✅ Verification queries showing your data

Look for the success message:
```
PROFILES TABLE RESTORED SUCCESSFULLY!
```

#### 6. Test Login
- Go back to your app: https://spice-winner.vercel.app/
- Try logging in with: kwitter1982@gmail.com
- Login should now work! ✅

---

## 🔍 What the Fix Does

### 1. **Recreates Profiles Table**
- Includes ALL required columns from original schema
- Adds `is_admin` column needed by admin dashboard
- Safe: Uses `CREATE TABLE IF NOT EXISTS`

### 2. **Restores Triggers**
- `on_auth_user_created`: Automatically creates profile when user signs up
- `update_profiles_updated_at`: Updates timestamp on profile changes

### 3. **Fixes RLS Policies**
- User can view/edit own profile
- Users can see other active profiles (for matching)
- Admins can view/edit all profiles

### 4. **Backfills Missing Profiles**
- Creates profile entries for any existing auth.users without profiles
- Ensures no user is left without a profile

---

## 📊 Verification

After running the script, you can verify everything is working:

### Check Profiles Table Exists
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';
```

Should return: `profiles`

### Check is_admin Column Exists
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'is_admin';
```

Should return: `is_admin`

### Check Triggers
```sql
SELECT trigger_name 
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'users';
```

Should include: `on_auth_user_created`

### Count Profiles
```sql
SELECT COUNT(*) FROM profiles;
```

Should show number of user profiles

---

## 🚨 If Still Not Working

### Check for Circular Dependencies
The admin dashboard RLS policies reference `profiles.is_admin`, which can create circular dependencies. If you still see errors:

1. **Temporarily Disable RLS on Admin Tables**
```sql
ALTER TABLE user_activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions_log DISABLE ROW LEVEL SECURITY;
```

2. **Test Login Again**

3. **Re-enable RLS After Confirming Login Works**
```sql
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;
```

### Check Supabase Logs
Go to: Dashboard → Logs → Postgres Logs

Look for any errors during login attempt.

---

## 🎯 Prevention: Don't Run These Scripts Again

These scripts DROP the profiles table and should NOT be run again:
- ❌ `SUPABASE_COMPLETE_SETUP.sql` (has DROP TABLE profiles CASCADE)
- ❌ Any script with `DROP TABLE IF EXISTS profiles`

The admin dashboard scripts are fine:
- ✅ `ADMIN_DASHBOARD_COMPLETE_FIXED.sql`
- ✅ `ADMIN_DASHBOARD_SCHEMA.sql`

---

## 📞 Need Help?

If the fix doesn't work:
1. Check Supabase Dashboard → Logs for detailed error messages
2. Run the verification queries above
3. Share the specific error message you're seeing

---

## Summary

**What to do RIGHT NOW:**
1. Go to Supabase SQL Editor
2. Run `/app/FIX_PROFILES_TABLE_RESTORE.sql`
3. Wait for success message
4. Try logging in again

**Expected outcome:**
✅ Login works without errors
✅ Profile table restored with all data
✅ Admin dashboard compatibility maintained
✅ All triggers and policies working
