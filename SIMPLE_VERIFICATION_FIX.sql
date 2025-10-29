-- =====================================================
-- QUICK FIX FOR VERIFICATION RLS (SIMPLIFIED VERSION)
-- =====================================================
-- This is a simpler version that focuses on fixing the
-- immediate issue without complex functions
-- =====================================================

-- Step 1: Ensure is_admin function exists and works correctly
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN
    SELECT COALESCE(is_admin, false) INTO admin_status
    FROM profiles
    WHERE id = user_id;
    
    RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Drop and recreate the problematic policies
DROP POLICY IF EXISTS "Users can view their own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON verification_requests;

-- Step 3: Create simple, working policies

-- Users and admins can view verification requests
CREATE POLICY "view_verification_requests"
    ON verification_requests FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Admins can update verification requests
CREATE POLICY "admins_update_verification_requests"
    ON verification_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Step 4: Ensure profiles table allows admins to see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "view_all_profiles_if_admin" ON profiles;

CREATE POLICY "view_all_profiles_if_admin"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

-- Step 5: Drop the RPC functions (we'll rely on direct queries with fixed policies)
DROP FUNCTION IF EXISTS get_pending_verifications();
DROP FUNCTION IF EXISTS get_all_verifications();

-- Step 6: Verification
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SIMPLIFIED RLS FIX APPLIED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '  - Fixed is_admin() function';
    RAISE NOTICE '  - Recreated RLS policies with inline checks';
    RAISE NOTICE '  - Removed RPC functions (using direct queries)';
    RAISE NOTICE '';
    RAISE NOTICE 'The frontend will now use direct queries';
    RAISE NOTICE 'with proper RLS policies in place.';
    RAISE NOTICE '========================================';
END $$;
