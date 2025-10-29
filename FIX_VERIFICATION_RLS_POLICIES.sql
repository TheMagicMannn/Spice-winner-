-- =====================================================
-- FIX VERIFICATION RLS POLICIES FOR ADMIN ACCESS
-- =====================================================
-- This script fixes the RLS policies to ensure admins
-- can properly view all verification requests
-- =====================================================

-- Step 1: Verify the is_admin function exists and is correct
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN
    SELECT is_admin INTO admin_status
    FROM profiles
    WHERE id = user_id;
    
    RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop all existing verification_requests policies
DROP POLICY IF EXISTS "Users can view their own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can create verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can update their pending requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON verification_requests;

-- Step 3: Create new comprehensive RLS policies

-- Policy 1: Users can view their own verification requests
CREATE POLICY "Users can view their own verification requests"
    ON verification_requests FOR SELECT
    USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Policy 2: Users can create verification requests (only if no pending request exists)
CREATE POLICY "Users can create verification requests"
    ON verification_requests FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- Policy 3: Users can update their own pending requests (before admin review)
CREATE POLICY "Users can update their pending requests"
    ON verification_requests FOR UPDATE
    USING (
        auth.uid() = user_id 
        AND status = 'pending'
    );

-- Policy 4: Admins can update any verification request
CREATE POLICY "Admins can update verification requests"
    ON verification_requests FOR UPDATE
    USING (is_admin(auth.uid()));

-- Step 4: Verify profiles table has RLS enabled but allows admin access
-- Check if profiles RLS might be blocking the join

-- First, let's check if the profiles table policies allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin(auth.uid()) OR auth.uid() = id);

-- Step 5: Grant explicit permissions
GRANT SELECT, INSERT, UPDATE ON verification_requests TO authenticated;
GRANT SELECT ON profiles TO authenticated;

-- Step 6: Create a helper view for admins that bypasses RLS
CREATE OR REPLACE VIEW admin_verification_requests AS
SELECT 
    vr.*,
    p.display_name,
    p.display_name2,
    p.account_type,
    p.photos,
    au.email as user_email
FROM verification_requests vr
JOIN profiles p ON vr.user_id = p.id
JOIN auth.users au ON vr.user_id = au.id;

-- Grant access to the view
GRANT SELECT ON admin_verification_requests TO authenticated;

-- Step 7: Create a function to get pending verifications (bypasses RLS)
CREATE OR REPLACE FUNCTION get_pending_verifications()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    method verification_method,
    status verification_status,
    email TEXT,
    selfie_photo_url TEXT,
    verification_date DATE,
    fetlife_profile_url TEXT,
    fetlife_screenshot_url TEXT,
    partner2_email TEXT,
    partner2_selfie_photo_url TEXT,
    partner2_fetlife_profile_url TEXT,
    partner2_fetlife_screenshot_url TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    display_name TEXT,
    display_name2 TEXT,
    account_type account_type,
    photos TEXT[]
) AS $$
BEGIN
    -- Only allow admins to call this function
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        vr.id,
        vr.user_id,
        vr.method,
        vr.status,
        vr.email,
        vr.selfie_photo_url,
        vr.verification_date,
        vr.fetlife_profile_url,
        vr.fetlife_screenshot_url,
        vr.partner2_email,
        vr.partner2_selfie_photo_url,
        vr.partner2_fetlife_profile_url,
        vr.partner2_fetlife_screenshot_url,
        vr.reviewed_by,
        vr.reviewed_at,
        vr.admin_notes,
        vr.rejection_reason,
        vr.created_at,
        vr.updated_at,
        p.display_name,
        p.display_name2,
        p.account_type,
        p.photos
    FROM verification_requests vr
    JOIN profiles p ON vr.user_id = p.id
    WHERE vr.status = 'pending'
    ORDER BY vr.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create a function to get all verifications (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_verifications()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    method verification_method,
    status verification_status,
    email TEXT,
    selfie_photo_url TEXT,
    verification_date DATE,
    fetlife_profile_url TEXT,
    fetlife_screenshot_url TEXT,
    partner2_email TEXT,
    partner2_selfie_photo_url TEXT,
    partner2_fetlife_profile_url TEXT,
    partner2_fetlife_screenshot_url TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    display_name TEXT,
    display_name2 TEXT,
    account_type account_type,
    photos TEXT[]
) AS $$
BEGIN
    -- Only allow admins to call this function
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        vr.id,
        vr.user_id,
        vr.method,
        vr.status,
        vr.email,
        vr.selfie_photo_url,
        vr.verification_date,
        vr.fetlife_profile_url,
        vr.fetlife_screenshot_url,
        vr.partner2_email,
        vr.partner2_selfie_photo_url,
        vr.partner2_fetlife_profile_url,
        vr.partner2_fetlie_screenshot_url,
        vr.reviewed_by,
        vr.reviewed_at,
        vr.admin_notes,
        vr.rejection_reason,
        vr.created_at,
        vr.updated_at,
        p.display_name,
        p.display_name2,
        p.account_type,
        p.photos
    FROM verification_requests vr
    JOIN profiles p ON vr.user_id = p.id
    ORDER BY vr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Verification message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICATION RLS POLICIES FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Applied fixes:';
    RAISE NOTICE '  - Updated RLS policies for admin access';
    RAISE NOTICE '  - Created helper view: admin_verification_requests';
    RAISE NOTICE '  - Created function: get_pending_verifications()';
    RAISE NOTICE '  - Created function: get_all_verifications()';
    RAISE NOTICE '';
    RAISE NOTICE 'Test the fix:';
    RAISE NOTICE '  1. Refresh the admin verification panel';
    RAISE NOTICE '  2. Pending requests should now be visible';
    RAISE NOTICE '========================================';
END $$;
