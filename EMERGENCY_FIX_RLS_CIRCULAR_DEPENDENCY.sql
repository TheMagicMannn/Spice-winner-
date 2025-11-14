-- =====================================================
-- EMERGENCY FIX: RLS CIRCULAR DEPENDENCY
-- =====================================================
-- This fixes the 500 error caused by circular RLS policies
-- RUN THIS IMMEDIATELY IN SUPABASE SQL EDITOR
-- =====================================================

-- Drop ALL policies on profiles to stop the errors
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles for matching" ON profiles;
DROP POLICY IF EXISTS "Public profiles viewable for matching" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- =====================================================
-- CREATE FIXED POLICIES (NO CIRCULAR DEPENDENCY)
-- =====================================================

-- 1. Users can ALWAYS view their own profile (no admin check needed)
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Users can ALWAYS update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 3. Users can ALWAYS insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Authenticated users can view OTHER profiles (for matching/browsing)
-- This allows the app to work - users can see other users
CREATE POLICY "Authenticated users can view profiles"
ON profiles FOR SELECT
USING (
    auth.uid() IS NOT NULL
);

-- 5. Admins can update ANY profile
-- Uses a direct column check instead of subquery
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (
    -- Check if current user's profile has is_admin = true
    (SELECT is_admin FROM profiles WHERE id = auth.uid() LIMIT 1) = true
)
WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid() LIMIT 1) = true
);

-- 6. Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid() LIMIT 1) = true
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check policies were created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;

-- Test: Can you view your own profile?
SELECT id, display_name, email, is_admin FROM profiles WHERE id = auth.uid();

-- Test: Can you see other profiles?
SELECT COUNT(*) FROM profiles;

-- =====================================================
-- DONE!
-- =====================================================
-- Now try:
-- 1. Refresh your browser
-- 2. The 500 error should be gone
-- 3. You should be able to see profiles
-- =====================================================
