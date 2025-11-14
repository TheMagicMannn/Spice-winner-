-- =====================================================
-- DIAGNOSTIC QUERIES FOR ADMIN DASHBOARD
-- =====================================================
-- Run these queries to diagnose why users aren't showing
-- =====================================================

-- =====================================================
-- 1. CHECK YOUR ADMIN STATUS
-- =====================================================
SELECT 
    id,
    display_name,
    email,
    is_admin,
    created_at,
    CASE 
        WHEN is_admin = true THEN '✅ YOU ARE AN ADMIN'
        ELSE '❌ YOU ARE NOT AN ADMIN'
    END as status
FROM profiles 
WHERE id = auth.uid();

-- If NOT admin, run this:
-- UPDATE profiles SET is_admin = true WHERE id = auth.uid();

-- =====================================================
-- 2. CHECK IF PROFILES TABLE HAS DATA
-- =====================================================
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_count,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
    COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as profiles_with_names
FROM profiles;

-- =====================================================
-- 3. CHECK RLS POLICIES ON PROFILES
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has WHERE clause'
        ELSE 'No WHERE clause'
    END as has_condition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- 4. TEST IF YOU CAN SEE OTHER USERS
-- =====================================================
-- This should return multiple users if policies work correctly
SELECT 
    id,
    display_name,
    email,
    is_admin,
    is_verified,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- 5. CHECK AUTH.USERS TABLE ACCESS
-- =====================================================
-- Note: Direct access to auth.users may be restricted
-- Check if data exists
SELECT COUNT(*) as total_auth_users
FROM auth.users;

-- =====================================================
-- 6. CHECK USER_MEMBERSHIPS TABLE
-- =====================================================
SELECT 
    COUNT(*) as total_memberships,
    COUNT(CASE WHEN membership_level = 'free' THEN 1 END) as free_count,
    COUNT(CASE WHEN membership_level = 'premium' THEN 1 END) as premium_count,
    COUNT(CASE WHEN membership_level = 'vip' THEN 1 END) as vip_count,
    COUNT(CASE WHEN membership_level = 'platinum' THEN 1 END) as platinum_count
FROM user_memberships;

-- =====================================================
-- 7. TEST ADMIN SERVICE QUERY (mimics what the app does)
-- =====================================================
-- This is similar to what adminService.getAllUsers() does
SELECT 
    p.id,
    p.display_name,
    p.account_type,
    p.is_verified,
    p.is_admin,
    p.created_at,
    um.membership_level
FROM profiles p
LEFT JOIN user_memberships um ON um.user_id = p.id
ORDER BY p.created_at DESC
LIMIT 10;

-- =====================================================
-- 8. CHECK IF RLS IS ACTUALLY ENABLED
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_memberships', 'user_activity_log', 'admin_actions_log')
ORDER BY tablename;

-- =====================================================
-- 9. CHECK CURRENT USER AND SESSION
-- =====================================================
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() as session_info;

-- =====================================================
-- 10. EMERGENCY FIX - GRANT ADMIN ACCESS
-- =====================================================
-- If nothing else works, run this to make yourself super admin:

-- UPDATE profiles 
-- SET is_admin = true 
-- WHERE id = auth.uid();

-- Then refresh the page and try again

-- =====================================================
-- INTERPRETATION OF RESULTS
-- =====================================================

/*
QUERY 1 - Your Admin Status:
- If "YOU ARE NOT AN ADMIN": Run the UPDATE to make yourself admin
- If "YOU ARE AN ADMIN": Problem is elsewhere

QUERY 2 - Profile Count:
- If total_profiles = 0: Database is empty, need to create test users
- If total_profiles > 0: Users exist, RLS policy issue

QUERY 3 - RLS Policies:
- Should show 5-6 policies for profiles table
- Check for "Admins can view all profiles" policy

QUERY 4 - Test User View:
- If returns 0 rows and you're admin: RLS policies broken
- If returns multiple rows: Policies work, frontend issue
- If returns only YOUR profile: Admin policy not working

QUERY 5 - Auth Users:
- If error "permission denied": Normal, use profiles table instead
- If returns count: Good, users exist in auth

QUERY 6 - Memberships:
- Shows distribution of membership levels
- All users should have at least a 'free' membership

QUERY 7 - Full Query Test:
- This mimics the exact query the admin dashboard uses
- If returns 0 rows: RLS or data issue
- If returns rows: Frontend/API issue

QUERY 8 - RLS Status:
- All should show rls_enabled = true
- If false: RLS not enabled, run ALTER TABLE ENABLE RLS

QUERY 9 - Session Info:
- Shows your current user ID
- Make sure this matches your profile ID

QUERY 10 - Emergency Fix:
- Last resort: Make yourself admin directly
*/

-- =====================================================
-- NEXT STEPS BASED ON RESULTS
-- =====================================================

/*
IF QUERY 4 RETURNS 0 ROWS (and you're admin):
→ Run FIX_PROFILES_RLS_POLICIES.sql

IF QUERY 4 RETURNS MULTIPLE ROWS:
→ Check browser console for JavaScript errors
→ Check Network tab for API errors
→ Problem is in frontend code

IF QUERY 1 SHOWS NOT ADMIN:
→ Run: UPDATE profiles SET is_admin = true WHERE id = auth.uid();

IF QUERY 2 SHOWS 0 PROFILES:
→ Database is empty, need to create test data or signup new users

IF ALL QUERIES WORK BUT DASHBOARD STILL EMPTY:
→ Check browser console (F12)
→ Look for CORS or API errors
→ Check if adminService is being called correctly
*/
