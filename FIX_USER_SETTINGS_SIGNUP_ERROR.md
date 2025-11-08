# Fix: User Settings Signup Error

## Problem
When users try to sign up, they get a 500 error: "relation 'user_settings' does not exist"

## Root Cause
The signup process has a database trigger (`on_auth_user_created_settings`) that automatically creates a `user_settings` record when a new user signs up. However, the `user_settings` table and related infrastructure haven't been created in your Supabase database yet.

## Solution
You need to run the `SETTINGS_SCHEMA.sql` file in your Supabase database to create:
- The `user_settings` table
- The `blocked_users` table
- The `private_photo_access` table
- The `account_deletion_requests` table
- All necessary triggers and RLS policies

## Steps to Fix

### Option 1: Use Supabase SQL Editor (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the SETTINGS_SCHEMA.sql**
   - Copy the entire contents of `/app/SETTINGS_SCHEMA.sql` 
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Verify the tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should see:
     - `user_settings`
     - `blocked_users`
     - `private_photo_access`
     - `account_deletion_requests`

### Option 2: Use Quick Fix SQL (Alternative)

If you want a minimal fix, I've created `FIX_USER_SETTINGS_ONLY.sql` that contains just the essential parts needed for signup to work.

## What Gets Created

### Tables:
1. **user_settings** - Stores user notification and privacy preferences
2. **blocked_users** - Manages blocked user relationships
3. **private_photo_access** - Controls who can see private photos
4. **account_deletion_requests** - Handles account deletion with grace period

### Functions & Triggers:
- `initialize_user_settings()` - Auto-creates settings for new users
- `on_auth_user_created_settings` - Trigger that calls the function on signup

### RLS Policies:
- All tables have Row Level Security enabled
- Users can only see/modify their own data

## Testing After Fix

1. Try signing up with a new account
2. The signup should succeed without errors
3. Check the `user_settings` table - you should see a new row with default values

## Notes
- The SQL uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- All triggers use `DROP TRIGGER IF EXISTS` before creation
- RLS policies protect user data automatically
