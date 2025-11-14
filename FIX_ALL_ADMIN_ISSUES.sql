-- =====================================================
-- COMPLETE FIX FOR ALL ADMIN DASHBOARD ISSUES
-- =====================================================
-- This fixes:
-- 1. Login trigger (no last_sign_in_ip error)
-- 2. RLS policies for profiles table
-- 3. Email column in profiles
-- 4. Admin can see all users
-- 
-- RUN THIS COMPLETE FILE IN SUPABASE SQL EDITOR
-- =====================================================

-- =====================================================
-- PART 1: FIX LOGIN TRIGGER
-- =====================================================

-- Drop broken trigger
DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;
DROP FUNCTION IF EXISTS track_user_login();

-- Create corrected login tracking function
CREATE OR REPLACE FUNCTION track_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
        -- Update profile with last sign in time
        UPDATE profiles
        SET last_sign_in_at = NEW.last_sign_in_at
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER trigger_track_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION track_user_login();

-- =====================================================
-- PART 2: ADD MISSING COLUMNS TO PROFILES
-- =====================================================

-- Add email column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Add last_sign_in_at column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Sync existing emails from auth.users
UPDATE profiles p
SET 
    email = au.email,
    last_sign_in_at = au.last_sign_in_at
FROM auth.users au
WHERE p.id = au.id;

-- =====================================================
-- PART 3: FIX PROFILES RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles viewable for matching" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 3. Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.is_admin = true
    )
);

-- 5. Admins can update ALL profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.is_admin = true
    )
);

-- 6. Allow viewing profiles for matching (authenticated users only)
CREATE POLICY "Authenticated users can view profiles for matching"
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PART 4: MAKE YOU AN ADMIN (REPLACE WITH YOUR EMAIL)
-- =====================================================

-- Make yourself admin - REPLACE 'your_email@example.com' with YOUR actual email
UPDATE profiles 
SET is_admin = true 
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'kwitter1982@gmail.com'  -- CHANGE THIS TO YOUR EMAIL
);

-- Alternative: Make current logged-in user admin
-- UPDATE profiles SET is_admin = true WHERE id = auth.uid();

-- =====================================================
-- PART 5: VERIFICATION QUERIES
-- =====================================================

-- Check if you're admin now
SELECT 
    id,
    display_name,
    email,
    is_admin,
    CASE 
        WHEN is_admin = true THEN '✅ YOU ARE AN ADMIN'
        ELSE '❌ YOU ARE NOT AN ADMIN'
    END as admin_status
FROM profiles 
WHERE email = 'kwitter1982@gmail.com';  -- CHANGE THIS

-- Check if all users are visible
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as users_with_email,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_count,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count
FROM profiles;

-- Check RLS policies on profiles
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has conditions'
        ELSE 'No conditions'
    END as has_conditions
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test: Can you see other users? (Should return multiple rows)
SELECT 
    id,
    display_name,
    email,
    is_admin,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- PART 6: CREATE EMAIL SYNC TRIGGER
-- =====================================================

-- Function to keep email in sync
CREATE OR REPLACE FUNCTION sync_user_email_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        email = NEW.email,
        last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_sync_email ON auth.users;

-- Create trigger
CREATE TRIGGER trigger_sync_email
    AFTER INSERT OR UPDATE OF email, last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email_to_profile();

-- =====================================================
-- DONE! VERIFICATION CHECKLIST
-- =====================================================

/*
✅ Run this checklist after executing this file:

1. CHECK LOGIN WORKS:
   - Go to your app and try to login
   - Should work without errors

2. CHECK YOU'RE ADMIN:
   - Run: SELECT is_admin FROM profiles WHERE id = auth.uid();
   - Should return: true

3. CHECK YOU CAN SEE USERS:
   - Run: SELECT COUNT(*) FROM profiles;
   - Should return: number of users (> 0)

4. CHECK ADMIN DASHBOARD:
   - Go to: https://spice-winner.vercel.app/#/admin/dashboard
   - Click Users tab
   - Should see list of all users

5. CHECK REALTIME WORKS:
   - Open admin dashboard in 2 browser windows
   - Edit a user in one window
   - Should update in other window automatically

IF ANY STEP FAILS:
- Check browser console (F12) for errors
- Run the diagnostic queries above
- Check Supabase logs for errors
*/

-- =====================================================
-- EMERGENCY COMMANDS (if something is still broken)
-- =====================================================

-- If you can't see users, temporarily disable RLS:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Then check if you can see users:
-- SELECT COUNT(*) FROM profiles;

-- If yes, then re-enable and check policies:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- If you still can't login, remove trigger completely:
-- DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;
-- DROP FUNCTION IF EXISTS track_user_login();

-- =====================================================
-- ALL DONE!
-- =====================================================

SELECT '🎉 Setup complete! Try logging in and accessing the admin dashboard.' as message;
