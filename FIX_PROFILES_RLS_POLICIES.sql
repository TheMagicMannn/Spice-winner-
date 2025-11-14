-- =====================================================
-- FIX: PROFILES TABLE RLS POLICIES FOR ADMIN ACCESS
-- =====================================================
-- This fixes the issue where admins can't see users in the dashboard
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, check if RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP OLD/CONFLICTING POLICIES (if they exist)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- =====================================================
-- CREATE NEW POLICIES
-- =====================================================

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- 3. Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.is_admin = true
    )
);

-- 4. Admins can update ALL profiles
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.is_admin = true
    )
);

-- 5. Admins can insert profiles (for admin operations)
CREATE POLICY "Admins can insert profiles"
ON profiles
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.is_admin = true
    )
);

-- 6. Allow viewing of public profile data for matching
CREATE POLICY "Public profiles viewable for matching"
ON profiles
FOR SELECT
USING (
    -- Allow authenticated users to view profiles for matching purposes
    auth.uid() IS NOT NULL
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if you are admin
SELECT 
    id,
    display_name,
    email,
    is_admin,
    CASE 
        WHEN is_admin = true THEN '✅ You are an admin'
        ELSE '❌ You are NOT an admin - run the UPDATE below'
    END as admin_status
FROM profiles 
WHERE id = auth.uid();

-- If you're not admin, run this to make yourself admin:
-- UPDATE profiles SET is_admin = true WHERE id = auth.uid();

-- Test query: Can you see all users as admin?
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_count,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count
FROM profiles;

-- =====================================================
-- DONE!
-- =====================================================
-- After running this:
-- 1. Refresh your admin dashboard page
-- 2. Go to Users tab
-- 3. You should now see all users!
-- =====================================================
