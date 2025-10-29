-- =====================================================
-- VERIFICATION SYSTEM - RLS INFINITE RECURSION FIX
-- =====================================================
-- This fixes the infinite recursion error in RLS policies
-- Run this if you already executed VERIFICATION_SYSTEM_SETUP.sql
-- =====================================================

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification history" ON verification_history;
DROP POLICY IF EXISTS "Admins can view verification files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete verification files" ON storage.objects;

-- Step 2: Create security definer function to check admin status (bypasses RLS)
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

-- Step 3: Recreate policies using the security definer function
-- This prevents infinite recursion

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
    ON verification_requests FOR SELECT
    USING (is_admin(auth.uid()));

-- Admins can update any verification request
CREATE POLICY "Admins can update verification requests"
    ON verification_requests FOR UPDATE
    USING (is_admin(auth.uid()));

-- Admins can view all verification history
CREATE POLICY "Admins can view all verification history"
    ON verification_history FOR SELECT
    USING (is_admin(auth.uid()));

-- Admins can view all verification files
CREATE POLICY "Admins can view verification files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-uploads'
        AND is_admin(auth.uid())
    );

-- Admins can delete verification files (for cleanup)
CREATE POLICY "Admins can delete verification files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'verification-uploads'
        AND is_admin(auth.uid())
    );

-- Step 4: Verify the fix
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS INFINITE RECURSION FIX APPLIED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'The is_admin() function now uses SECURITY DEFINER';
    RAISE NOTICE 'This bypasses RLS when checking admin status';
    RAISE NOTICE 'Infinite recursion should now be resolved';
    RAISE NOTICE '';
    RAISE NOTICE 'Test by submitting a verification request';
    RAISE NOTICE '========================================';
END $$;
