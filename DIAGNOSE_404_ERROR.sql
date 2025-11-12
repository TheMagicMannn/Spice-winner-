-- =====================================================
-- 🔍 DIAGNOSE 404 ERROR
-- =====================================================
-- This script helps identify why messages are getting 404
-- Run this to see what's blocking the insert
-- =====================================================

-- Step 1: Check current RLS policies on messages
SELECT 
    '=== RLS Policies on Messages Table ===' AS info;

SELECT 
    policyname,
    cmd AS operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END AS using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END AS with_check_clause
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd, policyname;

-- Step 2: Check if RLS is enabled
SELECT 
    '=== RLS Status ===' AS info;

SELECT 
    relname AS table_name,
    CASE 
        WHEN relrowsecurity THEN 'RLS Enabled ✓'
        ELSE 'RLS Disabled ✗'
    END AS rls_status
FROM pg_class
WHERE relname = 'messages';

-- Step 3: Test a sample match (use actual user ID)
SELECT 
    '=== Sample Match Check ===' AS info;

-- Show first match for debugging
SELECT 
    id AS match_id,
    user1_id,
    user2_id,
    status,
    matched_at
FROM matches
WHERE status = 'matched'
LIMIT 3;

-- Step 4: Check messages table structure
SELECT 
    '=== Messages Table Columns ===' AS info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Step 5: Temporarily disable RLS to test (DIAGNOSTIC ONLY!)
-- UNCOMMENT THESE TO TEST IF RLS IS THE ISSUE:
-- ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
-- SELECT 'RLS DISABLED FOR TESTING - Re-enable after testing!' AS warning;

-- To re-enable:
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================
-- 
-- If you see:
-- 
-- 1. "0 rows" in RLS Policies section
--    → Policies are missing! Run ULTRA_SIMPLE_CLEANUP.sql again
--
-- 2. "RLS Disabled"
--    → RLS is off, something else is wrong
--
-- 3. "0 matches" in Sample Match Check
--    → No matches exist - need to create a match first
--
-- 4. Missing match_id column
--    → Table structure is wrong
--
-- 5. Uncomment the DISABLE RLS lines to test if messages work
--    → If they work with RLS off, the policy is too strict
--    → If they still don't work, it's not an RLS issue
--
-- =====================================================
