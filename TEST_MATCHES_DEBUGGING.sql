-- =====================================================
-- MATCHES DEBUGGING AND TESTING SCRIPT
-- =====================================================
-- Use this script to debug and test the matches functionality
-- Run each section to verify data and permissions
-- =====================================================

-- =====================================================
-- 1. CHECK TABLE STRUCTURES
-- =====================================================

SELECT '=== TABLE STRUCTURES ===' as section;

-- Check swipe_actions table
SELECT 'swipe_actions columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'swipe_actions'
ORDER BY ordinal_position;

-- Check matches table
SELECT 'matches columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matches'
ORDER BY ordinal_position;

-- =====================================================
-- 2. CHECK RLS POLICIES
-- =====================================================

SELECT '=== RLS POLICIES ===' as section;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('swipe_actions', 'matches', 'profiles')
ORDER BY tablename;

-- List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('swipe_actions', 'matches', 'profiles')
ORDER BY tablename, policyname;

-- =====================================================
-- 3. CHECK EXISTING DATA
-- =====================================================

SELECT '=== EXISTING DATA ===' as section;

-- Count of swipe actions
SELECT 'Total swipe actions:' as info, COUNT(*) as count
FROM swipe_actions;

-- Count of likes
SELECT 'Total likes:' as info, COUNT(*) as count
FROM swipe_actions
WHERE action = 'like';

-- Count of matches
SELECT 'Total matches:' as info, COUNT(*) as count
FROM matches;

-- Count of matched status
SELECT 'Total matched status:' as info, COUNT(*) as count
FROM matches
WHERE status = 'matched';

-- =====================================================
-- 4. VIEW SAMPLE DATA
-- =====================================================

SELECT '=== SAMPLE SWIPE ACTIONS ===' as section;

-- Show recent swipe actions
SELECT 
    user_id,
    target_user_id,
    action,
    created_at
FROM swipe_actions
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 5. CHECK FOR MUTUAL LIKES
-- =====================================================

SELECT '=== MUTUAL LIKES ===' as section;

-- Find mutual likes
SELECT 
    sa1.user_id as user1_id,
    sa1.target_user_id as user2_id,
    sa1.created_at as user1_liked_at,
    sa2.created_at as user2_liked_at,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM matches m
            WHERE (m.user1_id = sa1.user_id AND m.user2_id = sa1.target_user_id)
               OR (m.user1_id = sa1.target_user_id AND m.user2_id = sa1.user_id)
        ) THEN 'Has Match Record'
        ELSE 'Missing Match Record'
    END as match_status
FROM swipe_actions sa1
INNER JOIN swipe_actions sa2 
    ON sa1.user_id = sa2.target_user_id 
    AND sa1.target_user_id = sa2.user_id
WHERE sa1.action = 'like'
  AND sa2.action = 'like'
LIMIT 10;

-- =====================================================
-- 6. CHECK MATCHES TABLE
-- =====================================================

SELECT '=== MATCHES DATA ===' as section;

-- Show all matches
SELECT 
    id,
    user1_id,
    user2_id,
    status,
    matched_at,
    created_at
FROM matches
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 7. CHECK PROFILES ACCESS
-- =====================================================

SELECT '=== PROFILES ACCESS ===' as section;

-- Count active profiles
SELECT 'Active profiles:' as info, COUNT(*) as count
FROM profiles
WHERE is_active = true;

-- Count completed profiles
SELECT 'Completed profiles:' as info, COUNT(*) as count
FROM profiles
WHERE profile_completed = true;

-- =====================================================
-- 8. TEST QUERIES (Same as Frontend)
-- =====================================================

SELECT '=== TEST FRONTEND QUERIES ===' as section;

-- Test query for "Who I Like"
-- Replace 'YOUR_USER_ID' with actual user ID
/*
SELECT p.*
FROM swipe_actions sa
JOIN profiles p ON p.id = sa.target_user_id
WHERE sa.user_id = 'YOUR_USER_ID'
AND sa.action = 'like'
ORDER BY sa.created_at DESC;
*/

-- Test query for "Who Likes Me"
-- Replace 'YOUR_USER_ID' with actual user ID
/*
SELECT p.*
FROM swipe_actions sa
JOIN profiles p ON p.id = sa.user_id
WHERE sa.target_user_id = 'YOUR_USER_ID'
AND sa.action = 'like'
ORDER BY sa.created_at DESC;
*/

-- Test query for "Mutual Matches"
-- Replace 'YOUR_USER_ID' with actual user ID
/*
SELECT p.*
FROM matches m
JOIN profiles p ON (
    CASE 
        WHEN m.user1_id = 'YOUR_USER_ID' THEN p.id = m.user2_id
        WHEN m.user2_id = 'YOUR_USER_ID' THEN p.id = m.user1_id
    END
)
WHERE m.status = 'matched'
AND (m.user1_id = 'YOUR_USER_ID' OR m.user2_id = 'YOUR_USER_ID')
ORDER BY m.matched_at DESC;
*/

-- =====================================================
-- 9. CREATE TEST DATA (Optional)
-- =====================================================

SELECT '=== CREATE TEST DATA ===' as section;
SELECT 'Uncomment the section below to create test data' as note;

/*
-- Create test swipe actions (uncomment to use)
-- Replace user IDs with actual user IDs from your auth.users table

-- User A likes User B
INSERT INTO swipe_actions (user_id, target_user_id, action)
VALUES ('USER_A_ID', 'USER_B_ID', 'like')
ON CONFLICT (user_id, target_user_id) DO NOTHING;

-- User B likes User A (creates mutual like)
INSERT INTO swipe_actions (user_id, target_user_id, action)
VALUES ('USER_B_ID', 'USER_A_ID', 'like')
ON CONFLICT (user_id, target_user_id) DO NOTHING;

-- User C likes User A (one-way like)
INSERT INTO swipe_actions (user_id, target_user_id, action)
VALUES ('USER_C_ID', 'USER_A_ID', 'like')
ON CONFLICT (user_id, target_user_id) DO NOTHING;

SELECT 'Test data created!' as result;
*/

-- =====================================================
-- 10. VERIFY FOREIGN KEYS
-- =====================================================

SELECT '=== FOREIGN KEY CONSTRAINTS ===' as section;

SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('swipe_actions', 'matches')
ORDER BY tc.table_name;

-- =====================================================
-- COMPLETION
-- =====================================================

SELECT '=== DEBUGGING COMPLETE ===' as section;
SELECT 'Review the output above to identify any issues' as note;
SELECT 'If no data shows up, you may need to create test swipe actions' as suggestion;
