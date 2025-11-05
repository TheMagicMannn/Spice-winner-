-- =====================================================
-- TEST RLS POLICIES FOR ISO POSTS
-- =====================================================
-- Run these queries after applying the RLS fix to verify everything works

-- =====================================================
-- TEST 1: Check if RLS is enabled
-- =====================================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'iso_posts';
-- Expected: rls_enabled = true

-- =====================================================
-- TEST 2: List all policies on iso_posts
-- =====================================================
SELECT 
    policyname,
    cmd as command,
    roles,
    permissive,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'iso_posts'
ORDER BY cmd;
-- Expected: Should see policies for SELECT, INSERT, UPDATE, DELETE

-- =====================================================
-- TEST 3: Check current user authentication
-- =====================================================
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED ❌'
        ELSE 'AUTHENTICATED ✅'
    END as auth_status;
-- Expected: Should return your user UUID and AUTHENTICATED status

-- =====================================================
-- TEST 4: List your own ISO posts
-- =====================================================
SELECT 
    id,
    title,
    author_id,
    is_active,
    created_at,
    auth.uid() as current_user,
    (auth.uid() = author_id) as is_owner
FROM iso_posts
WHERE author_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
-- Expected: Should list all your posts with is_owner = true

-- =====================================================
-- TEST 5: Test if you can view active posts
-- =====================================================
SELECT COUNT(*) as active_posts_count
FROM iso_posts
WHERE is_active = true;
-- Expected: Should return a count of active posts (RLS allows viewing)

-- =====================================================
-- TEST 6: Test update permission (DRY RUN - doesn't commit)
-- =====================================================
BEGIN;
-- Try to update one of your posts (replace 'your-post-id' with actual ID)
UPDATE iso_posts 
SET is_active = false 
WHERE id = 'your-post-id' 
  AND author_id = auth.uid()
RETURNING id, is_active, author_id;
-- Expected: Should return the post with is_active = false
-- IMPORTANT: Run ROLLBACK; after this to undo the change
ROLLBACK;
-- This ensures we're just testing, not actually deleting

-- =====================================================
-- TEST 7: Use debug function (if you applied Option 1 fix)
-- =====================================================
-- Replace 'your-post-id' with an actual post ID you own
SELECT * FROM can_user_delete_iso_post('your-post-id');
-- Expected results:
-- can_delete: true
-- current_user_id: your-user-uuid
-- post_author_id: your-user-uuid (should match current_user_id)
-- post_exists: true
-- is_post_active: true
-- user_is_author: true

-- =====================================================
-- TEST 8: Check grants/permissions
-- =====================================================
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'iso_posts'
  AND grantee IN ('authenticated', 'anon', 'service_role');
-- Expected: authenticated should have SELECT, INSERT, UPDATE, DELETE

-- =====================================================
-- TEST 9: Test INSERT permission
-- =====================================================
-- This will create a test post - DELETE IT after verification
INSERT INTO iso_posts (author_id, title, content, location, tags, seeking_type, is_active)
VALUES (
    auth.uid(),
    'Test Post - DELETE ME',
    'This is a test post created to verify INSERT permissions. Please delete this post after testing.',
    'Test Location',
    ARRAY['test'],
    ARRAY['Male seeking Female'],
    true
)
RETURNING id, title, author_id;
-- Expected: Should return the newly created post
-- IMPORTANT: Copy the returned ID and delete this test post after verification

-- =====================================================
-- TEST 10: Test DELETE permission (use test post from TEST 9)
-- =====================================================
-- Replace 'test-post-id' with the ID from TEST 9
DELETE FROM iso_posts 
WHERE id = 'test-post-id' 
  AND author_id = auth.uid()
RETURNING id, title;
-- Expected: Should delete and return the test post info

-- =====================================================
-- INTERPRETATION GUIDE
-- =====================================================
/*
✅ ALL TESTS PASS = RLS is properly configured, deletion should work

❌ TEST 1 FAILS (RLS not enabled):
   → Run: ALTER TABLE iso_posts ENABLE ROW LEVEL SECURITY;

❌ TEST 2 FAILS (No policies):
   → Apply FIX_ISO_POST_DELETION_RLS.sql

❌ TEST 3 FAILS (Not authenticated):
   → Login to your app first, then run these tests

❌ TEST 4 FAILS (No posts visible):
   → Check if you have created any posts
   → Verify author_id matches your user ID

❌ TEST 6 FAILS (Update blocked):
   → This is the core issue - apply the RLS fix immediately
   → Use FIX_ISO_POST_DELETION_RLS.sql or ALTERNATIVE_FIX_EDGE_FUNCTION.sql

❌ TEST 7 FAILS (Debug function error):
   → Run FIX_ISO_POST_DELETION_RLS.sql to create the function
   → Or use ALTERNATIVE_FIX_EDGE_FUNCTION.sql for simpler approach

❌ TEST 8 FAILS (No permissions):
   → Run: GRANT ALL ON iso_posts TO authenticated;

❌ TEST 9/10 FAIL (Insert/Delete blocked):
   → RLS policies are too restrictive
   → Apply ALTERNATIVE_FIX_EDGE_FUNCTION.sql for simplified policies
*/

-- =====================================================
-- QUICK FIX REFERENCE
-- =====================================================
/*
If any test fails:

1. Option 1 (Recommended):
   → Run /app/FIX_ISO_POST_DELETION_RLS.sql

2. Option 2 (Simpler):
   → Run /app/ALTERNATIVE_FIX_EDGE_FUNCTION.sql

3. Option 3 (Nuclear):
   → Deploy Edge Function from /app/supabase/functions/delete-iso-post/
   → Update frontend to use deletePostViaEdgeFunction()

After applying fix, re-run all tests to verify.
*/

-- =====================================================
-- COMPLETED
-- =====================================================
