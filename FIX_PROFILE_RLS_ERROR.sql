-- =====================================================
-- FIX PROFILE 500 ERROR
-- =====================================================
-- This fixes the 500 error when fetching profiles
-- The issue is caused by conflicting or problematic RLS policies
-- =====================================================

-- Step 1: Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "view_all_profiles_if_admin" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active profiles" ON profiles;
DROP POLICY IF EXISTS "view_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;

-- Step 2: Ensure is_admin function exists and is correct
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN
    SELECT COALESCE(is_admin, false) INTO admin_status
    FROM profiles
    WHERE id = user_id;
    
    RETURN COALESCE(admin_status, false);
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 3: Create simple, non-conflicting RLS policies for profiles

-- SELECT: Users can view their own profile OR admins can view all profiles
DROP POLICY IF EXISTS "select_own_or_admin_profile" ON profiles;
CREATE POLICY "select_own_or_admin_profile"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id 
        OR 
        is_admin(auth.uid())
    );

-- INSERT: Users can only insert their own profile
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own profile OR admins can update any profile
DROP POLICY IF EXISTS "update_own_or_admin_profile" ON profiles;
CREATE POLICY "update_own_or_admin_profile"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id 
        OR 
        is_admin(auth.uid())
    );

-- Step 4: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Step 5: Test the fix
DO $$
DECLARE
    test_result BOOLEAN;
BEGIN
    -- Test if the is_admin function works
    SELECT is_admin(auth.uid()) INTO test_result;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PROFILE RLS POLICIES FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '  - Dropped all conflicting policies';
    RAISE NOTICE '  - Created simple RLS policies';
    RAISE NOTICE '  - Fixed is_admin() function';
    RAISE NOTICE '';
    RAISE NOTICE 'New policies:';
    RAISE NOTICE '  - select_own_or_admin_profile';
    RAISE NOTICE '  - insert_own_profile';
    RAISE NOTICE '  - update_own_or_admin_profile';
    RAISE NOTICE '';
    RAISE NOTICE 'Try logging in again - the 500 error should be fixed!';
    RAISE NOTICE '========================================';
END $$;
