# 🔧 Updated Fix for "Policy Already Exists" Error

## Problem
When running `SETTINGS_SCHEMA.sql`, you get:
```
Error: policy "user_settings_select_own" for table "user_settings" already exists
```

## Why This Happens
Some parts of the schema were already created in your database (likely the policies), but other parts are missing (like the trigger). This causes a partial setup that breaks signup.

## ✅ Solution: Use the Clean Fix Script

I've created a new script that handles this properly: **`FIX_USER_SETTINGS_CLEAN.sql`**

### What This Script Does:
1. ✅ **Drops all existing policies** (if they exist)
2. ✅ **Drops all existing triggers** (if they exist)
3. ✅ **Creates/updates all tables** (using IF NOT EXISTS)
4. ✅ **Recreates all policies** (freshly)
5. ✅ **Recreates all triggers** (freshly)
6. ✅ **Backfills settings** for existing users
7. ✅ **Verifies the setup** with a summary

## 🚀 Steps to Fix

### Step 1: Go to Supabase SQL Editor
1. Open https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the sidebar
4. Click **"New Query"**

### Step 2: Run the Clean Fix Script
1. Open `/app/FIX_USER_SETTINGS_CLEAN.sql`
2. Copy the ENTIRE file contents
3. Paste into the Supabase SQL Editor
4. Click **"Run"** (or Ctrl+Enter / Cmd+Enter)

### Step 3: Check the Results
You should see output like:
```
NOTICE: Tables created: 4
NOTICE: RLS Policies created: 15
NOTICE: Triggers created: 2
NOTICE: ✅ Setup complete!
```

### Step 4: Test Signup
1. Go to your app
2. Try creating a new account
3. It should work now! ✅

---

## 🔍 What Gets Fixed

### Tables Created/Updated:
- ✅ `user_settings` - User preferences
- ✅ `blocked_users` - Block list
- ✅ `private_photo_access` - Private photo permissions
- ✅ `account_deletion_requests` - Account deletion tracking

### Triggers Created:
- ✅ `on_auth_user_created_settings` - Auto-creates settings on signup
- ✅ `update_user_settings_updated_at` - Auto-updates timestamp

### Functions Created:
- ✅ `initialize_user_settings()` - Creates default settings for new users
- ✅ `update_updated_at()` - Updates timestamp on changes
- ✅ `get_blocked_user_ids()` - Gets list of blocked users
- ✅ `is_user_blocked()` - Checks if a user is blocked
- ✅ `has_private_photo_access()` - Checks photo access permissions

### RLS Policies Created:
- ✅ All users can only access their own data
- ✅ Privacy is enforced at the database level
- ✅ No user can see another user's settings

---

## 🚨 Troubleshooting

### Script runs but signup still fails?

**Check if the trigger exists:**
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_settings';
```

Should return 1 row. If empty, the trigger didn't create properly.

**Manually verify the user_settings table:**
```sql
SELECT * FROM user_settings;
```

Should show settings for any existing users.

### Still getting errors?

**Check Supabase logs:**
1. Go to **Logs** → **Database** in Supabase dashboard
2. Try signing up again
3. Look for the specific error message

**Common issues:**
- **"Permission denied"** → Make sure you're using the SQL Editor (which uses service_role)
- **"Relation does not exist"** → The table creation might have failed
- **"Trigger not firing"** → Check if the trigger was created on the correct schema

### Verify everything is working:
```sql
-- This query checks your setup
SELECT 
  'Tables' as type, 
  COUNT(*)::text as count 
FROM information_schema.tables 
WHERE table_name IN ('user_settings', 'blocked_users', 'private_photo_access', 'account_deletion_requests')

UNION ALL

SELECT 
  'Policies' as type, 
  COUNT(*)::text as count 
FROM pg_policies 
WHERE tablename IN ('user_settings', 'blocked_users', 'private_photo_access', 'account_deletion_requests')

UNION ALL

SELECT 
  'Triggers' as type, 
  COUNT(*)::text as count 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created_settings', 'update_user_settings_updated_at');
```

Expected results:
- Tables: 4
- Policies: 15
- Triggers: 2

---

## 📝 What If I Want to Start Fresh?

If you want to completely remove everything and start over:

```sql
-- ⚠️ DANGER: This will delete all settings data!
-- Only run if you want to start completely fresh

-- Drop tables (this will cascade to delete all data)
DROP TABLE IF EXISTS account_deletion_requests CASCADE;
DROP TABLE IF EXISTS private_photo_access CASCADE;
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS has_private_photo_access(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS is_user_blocked(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_blocked_user_ids(UUID) CASCADE;
DROP FUNCTION IF EXISTS initialize_user_settings() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
```

Then run `FIX_USER_SETTINGS_CLEAN.sql` to recreate everything.

---

## ✨ Success!

After running the clean fix script, your signup flow will work correctly:

1. ✅ User submits signup form
2. ✅ Supabase creates `auth.users` record
3. ✅ Trigger fires and creates `user_settings` record automatically
4. ✅ User is logged in successfully
5. ✅ No more 500 errors!

The signup should now work perfectly! 🎉
