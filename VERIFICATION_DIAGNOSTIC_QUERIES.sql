-- =====================================================
-- VERIFICATION SYSTEM - DIAGNOSTIC QUERIES
-- =====================================================
-- Run these queries to diagnose why verification requests
-- are not showing up in the admin panel
-- =====================================================

-- 1. CHECK IF VERIFICATION REQUESTS TABLE EXISTS
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'verification_requests'
) as table_exists;

-- 2. COUNT ALL VERIFICATION REQUESTS
SELECT 
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_requests,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_requests
FROM verification_requests;

-- 3. VIEW ALL PENDING VERIFICATION REQUESTS
SELECT 
    vr.id,
    vr.user_id,
    vr.method,
    vr.status,
    vr.email,
    vr.created_at,
    p.display_name,
    p.display_name2,
    p.account_type,
    p.is_admin as user_is_admin
FROM verification_requests vr
LEFT JOIN profiles p ON vr.user_id = p.id
WHERE vr.status = 'pending'
ORDER BY vr.created_at DESC;

-- 4. CHECK ADMIN USERS
SELECT 
    id,
    email,
    display_name,
    is_admin,
    created_at
FROM profiles
WHERE is_admin = true;

-- 5. CHECK IF is_admin FUNCTION EXISTS
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    provolatile as volatility
FROM pg_proc 
WHERE proname = 'is_admin';

-- 6. VIEW CURRENT RLS POLICIES ON verification_requests
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'verification_requests'
ORDER BY policyname;

-- 7. VIEW CURRENT RLS POLICIES ON profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 8. CHECK STORAGE BUCKET FOR VERIFICATION UPLOADS
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'verification-uploads';

-- 9. CHECK IF RPC FUNCTIONS EXIST
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc 
WHERE proname IN ('get_pending_verifications', 'get_all_verifications');

-- 10. TEST JOIN QUERY (This is what the frontend uses)
-- Note: This will respect RLS policies based on your current user
SELECT 
    vr.*,
    p.display_name,
    p.display_name2,
    p.account_type,
    p.photos
FROM verification_requests vr
JOIN profiles p ON vr.user_id = p.id
WHERE vr.status = 'pending'
ORDER BY vr.created_at ASC
LIMIT 5;

-- =====================================================
-- DIAGNOSTIC RESULTS INTERPRETATION
-- =====================================================
-- 
-- Query 1: Should return 'true' if table exists
-- Query 2: Should show count of requests (if pending_requests > 0, data exists)
-- Query 3: Should show actual pending requests with user details
-- Query 4: Should list all admin users (verify your user is in this list)
-- Query 5: Should show the is_admin function (check is_security_definer = true)
-- Query 6 & 7: Should show RLS policies (look for admin-related policies)
-- Query 8: Should show the storage bucket configuration
-- Query 9: Should show RPC functions if they were created
-- Query 10: This mimics the frontend query - if this returns data, 
--           but frontend doesn't, it's a Supabase client issue
--           If this returns no data, it's an RLS issue
--
-- =====================================================

-- =====================================================
-- QUICK FIX - TEMPORARILY DISABLE RLS FOR TESTING
-- =====================================================
-- CAUTION: Only use this for testing! Re-enable RLS after diagnosing
-- 
-- ALTER TABLE verification_requests DISABLE ROW LEVEL SECURITY;
-- 
-- After testing, re-enable:
-- ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
-- 
-- If disabling RLS makes requests visible, the issue is definitely RLS-related
-- =====================================================
