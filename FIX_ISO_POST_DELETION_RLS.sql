-- =====================================================
-- FIX ISO POST DELETION - RLS POLICIES UPDATE
-- =====================================================
-- This fixes the "Permission denied" error when deleting ISO posts
-- Issue: RLS policies may be blocking UPDATE operations needed for soft delete

-- =====================================================
-- STEP 1: Drop and Recreate ISO Posts UPDATE Policy
-- =====================================================

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update their own ISO posts" ON iso_posts;

-- Create new UPDATE policy with proper permissions
-- This allows users to update their own posts including soft delete (is_active = false)
CREATE POLICY "Users can update their own ISO posts"
    ON iso_posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- =====================================================
-- STEP 2: Add Additional Policy for Soft Delete
-- =====================================================

-- Drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Users can soft delete their own ISO posts" ON iso_posts;

-- Create specific policy for soft delete operations
-- This ensures UPDATE operations work even when only changing is_active
CREATE POLICY "Users can soft delete their own ISO posts"
    ON iso_posts FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = author_id
    )
    WITH CHECK (
        auth.uid() = author_id
    );

-- =====================================================
-- STEP 3: Verify and Fix SELECT Policy
-- =====================================================

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Anyone can view active ISO posts" ON iso_posts;

-- Recreate SELECT policy to allow viewing active posts
CREATE POLICY "Anyone can view active ISO posts"
    ON iso_posts FOR SELECT
    USING (is_active = true);

-- Add policy for users to view their own inactive posts (for verification)
DROP POLICY IF EXISTS "Users can view their own inactive ISO posts" ON iso_posts;

CREATE POLICY "Users can view their own inactive ISO posts"
    ON iso_posts FOR SELECT
    TO authenticated
    USING (auth.uid() = author_id);

-- =====================================================
-- STEP 4: Verify INSERT Policy
-- =====================================================

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create their own ISO posts" ON iso_posts;

-- Recreate INSERT policy
CREATE POLICY "Users can create their own ISO posts"
    ON iso_posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- =====================================================
-- STEP 5: Add DELETE Policy (for hard delete if needed)
-- =====================================================

-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "Users can delete their own ISO posts" ON iso_posts;

-- Recreate DELETE policy
CREATE POLICY "Users can delete their own ISO posts"
    ON iso_posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- =====================================================
-- STEP 6: Add Helper Function for Debugging
-- =====================================================

-- Create a function to check if user can delete a post
-- This helps with debugging RLS issues
CREATE OR REPLACE FUNCTION can_user_delete_iso_post(post_uuid UUID)
RETURNS TABLE (
    can_delete BOOLEAN,
    current_user_id UUID,
    post_author_id UUID,
    post_exists BOOLEAN,
    is_post_active BOOLEAN,
    user_is_author BOOLEAN
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_post RECORD;
BEGIN
    -- Get post details
    SELECT id, author_id, is_active INTO v_post
    FROM iso_posts
    WHERE id = post_uuid;
    
    -- Return debugging info
    RETURN QUERY SELECT
        (auth.uid() IS NOT NULL AND v_post.author_id = auth.uid() AND v_post.is_active = true) AS can_delete,
        auth.uid() AS current_user_id,
        v_post.author_id AS post_author_id,
        (v_post.id IS NOT NULL) AS post_exists,
        COALESCE(v_post.is_active, false) AS is_post_active,
        (auth.uid() = v_post.author_id) AS user_is_author;
END;
$$;

-- =====================================================
-- STEP 7: Verify RLS is Enabled
-- =====================================================

-- Ensure RLS is enabled on iso_posts table
ALTER TABLE iso_posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: Grant Necessary Permissions
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON iso_posts TO authenticated;
GRANT DELETE ON iso_posts TO authenticated;

-- Grant usage on the debug function
GRANT EXECUTE ON FUNCTION can_user_delete_iso_post(UUID) TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES (Run these to test)
-- =====================================================

-- Check all policies on iso_posts table
-- SELECT * FROM pg_policies WHERE tablename = 'iso_posts';

-- Test if current user can delete a specific post (replace with actual post ID)
-- SELECT * FROM can_user_delete_iso_post('your-post-id-here');

-- Check current user
-- SELECT auth.uid();

-- Check posts owned by current user
-- SELECT id, author_id, is_active, auth.uid() = author_id as is_owner
-- FROM iso_posts
-- WHERE author_id = auth.uid();

-- =====================================================
-- COMPLETED
-- =====================================================
-- 
-- How to apply this fix:
-- 1. Copy this entire SQL script
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and click "Run"
-- 4. Refresh your app and try deleting a post again
-- 
-- If you still get errors, run this to debug:
-- SELECT * FROM can_user_delete_iso_post('your-post-id');
-- 
-- =====================================================
