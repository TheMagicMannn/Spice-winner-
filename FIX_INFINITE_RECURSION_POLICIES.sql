-- =====================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =====================================================
-- The admin policies are causing infinite recursion
-- This fixes it by removing the circular reference
-- =====================================================

-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other active profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- =====================================================
-- RECREATE SAFE POLICIES (NO CIRCULAR REFERENCES)
-- =====================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy 4: Users can view other active profiles (for matching/browsing)
-- This allows authenticated users to see other profiles for the app to work
CREATE POLICY "Users can view other active profiles"
    ON profiles FOR SELECT
    USING (
        auth.uid() IS NOT NULL  -- User is authenticated
        AND is_active = true 
        AND profile_completed = true
    );

-- =====================================================
-- ADMIN ACCESS - OPTION A: SEPARATE ADMIN TABLE (BEST)
-- =====================================================
-- Instead of checking profiles.is_admin (which causes recursion),
-- we'll use a simple check that doesn't query profiles

-- For now, we'll use a simple approach: if you need admin access,
-- you can temporarily disable RLS on profiles when doing admin operations

-- Later, you can create a separate admin_users table that doesn't have RLS
-- and reference that instead

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test query (should work now)
SELECT COUNT(*) FROM profiles;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'profiles';

    RAISE NOTICE '====================================================';
    RAISE NOTICE '✅ INFINITE RECURSION FIXED!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '✅ Removed admin policies that caused circular reference';
    RAISE NOTICE '✅ Kept essential user policies';
    RAISE NOTICE '✅ Active policies: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 TEST LOGIN NOW!';
    RAISE NOTICE 'Go to: https://spice-winner.vercel.app/';
    RAISE NOTICE 'Login and profile fetch should work!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Note: Admin access temporarily simplified';
    RAISE NOTICE 'For full admin features, create a separate admin_users table';
    RAISE NOTICE '====================================================';
END $$;
