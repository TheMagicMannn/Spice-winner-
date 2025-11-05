-- =====================================================
-- ALTERNATIVE FIX: Simplified RLS Policy
-- =====================================================
-- If the main fix doesn't work, this is a simpler approach
-- that gives authenticated users full access to their own posts

-- =====================================================
-- STEP 1: Drop All Existing Policies
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active ISO posts" ON iso_posts;
DROP POLICY IF EXISTS "Users can view their own inactive ISO posts" ON iso_posts;
DROP POLICY IF EXISTS "Users can create their own ISO posts" ON iso_posts;
DROP POLICY IF EXISTS "Users can update their own ISO posts" ON iso_posts;
DROP POLICY IF EXISTS "Users can soft delete their own ISO posts" ON iso_posts;
DROP POLICY IF EXISTS "Users can delete their own ISO posts" ON iso_posts;

-- =====================================================
-- STEP 2: Create Simplified Policies
-- =====================================================

-- 1. Allow everyone to SELECT active posts
CREATE POLICY "select_active_posts"
    ON iso_posts
    FOR SELECT
    USING (is_active = true);

-- 2. Allow users to SELECT their own posts (active or inactive)
CREATE POLICY "select_own_posts"
    ON iso_posts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = author_id);

-- 3. Allow users to INSERT their own posts
CREATE POLICY "insert_own_posts"
    ON iso_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- 4. Allow users to UPDATE their own posts (this includes soft delete)
CREATE POLICY "update_own_posts"
    ON iso_posts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

-- 5. Allow users to DELETE their own posts (hard delete)
CREATE POLICY "delete_own_posts"
    ON iso_posts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- =====================================================
-- STEP 3: Ensure RLS is Enabled
-- =====================================================

ALTER TABLE iso_posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Grant Permissions
-- =====================================================

GRANT ALL ON iso_posts TO authenticated;
GRANT SELECT ON iso_posts TO anon;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to verify the setup:

-- 1. Check all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'iso_posts';

-- 2. Check if RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'iso_posts';

-- 3. Test if you can see your posts
-- SELECT id, title, author_id, is_active, 
--        auth.uid() as current_user,
--        (auth.uid() = author_id) as is_owner
-- FROM iso_posts 
-- WHERE author_id = auth.uid();

-- =====================================================
