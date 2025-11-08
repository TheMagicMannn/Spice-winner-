# 🔧 Step-by-Step Fix for Signup Error

## ❌ Current Error
```
ERROR: relation "user_settings" does not exist (SQLSTATE 42P01)
500: Database error saving new user
```

## ✅ Quick Fix (5 minutes)

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Select your project (the one for this Spice dating app)

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** button (top right)

### Step 3: Copy and Run SQL
1. Open the file `/app/FIX_USER_SETTINGS_ONLY.sql` (I created this for you)
2. Copy the ENTIRE contents of that file
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

### Step 4: Verify Success
You should see a success message like:
```
Success. No rows returned
```

This is normal! The SQL creates tables and triggers, which don't return rows.

### Step 5: Verify Table Creation
1. In the left sidebar, click **"Table Editor"**
2. You should now see a table called **`user_settings`**
3. Click on it to see the columns

### Step 6: Test Signup
1. Go to your app's signup page
2. Try creating a new account
3. It should now work without errors! ✅

---

## 🔍 What This Fix Does

### Creates the Missing Table
The `user_settings` table stores user preferences like:
- Notification settings (messages, likes, matches)
- Privacy settings (hide account, incognito mode)
- Display preferences (distance units, measurements)

### Adds Auto-Initialization
When a user signs up, a database trigger automatically:
1. Creates a `user_settings` row for that user
2. Sets all preferences to default values
3. Links it to their user ID

### Enables Security
Row Level Security (RLS) ensures:
- Users can only see their own settings
- Users can only modify their own settings
- No one can access other users' privacy preferences

---

## 📋 Alternative: Run Complete Schema

If you want ALL the settings features (not just the minimum), run the full schema:

1. Instead of `FIX_USER_SETTINGS_ONLY.sql`, use `SETTINGS_SCHEMA.sql`
2. This also creates:
   - `blocked_users` table (for blocking functionality)
   - `private_photo_access` table (for sharing private photos)
   - `account_deletion_requests` table (for account deletion with grace period)

---

## 🚨 Troubleshooting

### "Permission denied for table auth.users"
- You need to run this with the service role key
- In SQL Editor, make sure you're using the **service_role** connection (not anon)

### "Function uuid_generate_v4() does not exist"
- The script includes: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- If it still fails, run that line separately first

### Still getting signup errors?
Check the Supabase logs:
1. Go to **Database** → **Logs** in Supabase dashboard
2. Look for any new errors
3. The trigger should show up in logs when users sign up

### Need to verify existing users?
Run this query in SQL Editor:
```sql
-- Check if user_settings exist for current users
SELECT 
  u.id, 
  u.email,
  CASE 
    WHEN us.id IS NULL THEN 'Missing settings ❌'
    ELSE 'Has settings ✅'
  END as status
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.id;
```

If some users are missing settings, create them manually:
```sql
-- Create settings for existing users without them
INSERT INTO user_settings (id)
SELECT u.id 
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.id
WHERE us.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

---

## ✨ After the Fix

Your signup flow will work like this:

1. User submits signup form
2. Supabase creates auth.users record
3. **Trigger automatically creates user_settings record** ← This was missing!
4. User is logged in successfully
5. User can now use the app

No more 500 errors! 🎉
