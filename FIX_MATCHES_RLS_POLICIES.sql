-- =====================================================
-- FIX MATCHES AND SWIPE_ACTIONS RLS POLICIES
-- =====================================================
-- This script fixes RLS policies to allow:
-- 1. Users to see swipes where they are the target (Who Likes Me)
-- 2. Users to see their own swipes (Who I Like)
-- 3. Users to see mutual matches
-- =====================================================

-- =====================================================
-- 1. DROP EXISTING RESTRICTIVE POLICIES
-- =====================================================

-- Drop old swipe_actions policies
DROP POLICY IF EXISTS "Users can view their own swipes" ON swipe_actions;
DROP POLICY IF EXISTS "Users can create swipes" ON swipe_actions;
DROP POLICY IF EXISTS "Users can update their swipes" ON swipe_actions;

-- Drop old matches policies if they exist
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
DROP POLICY IF EXISTS "Users can view matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update matches" ON matches;

-- =====================================================
-- 2. CREATE NEW SWIPE_ACTIONS RLS POLICIES
-- =====================================================

-- Policy: Users can view swipes where they are EITHER the user OR the target
-- This allows seeing both "Who I Like" and "Who Likes Me"
CREATE POLICY "Users can view relevant swipes"
    ON swipe_actions FOR SELECT
    USING (
        auth.uid() = user_id OR auth.uid() = target_user_id
    );

-- Policy: Users can only insert their own swipe actions
CREATE POLICY "Users can create their swipes"
    ON swipe_actions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own swipe actions
CREATE POLICY "Users can update their swipes"
    ON swipe_actions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. ENABLE RLS ON MATCHES TABLE (if not already)
-- =====================================================

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE MATCHES RLS POLICIES
-- =====================================================

-- Policy: Users can view matches where they are either user1 or user2
CREATE POLICY "Users can view their matches"
    ON matches FOR SELECT
    USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Policy: Allow the record_swipe_action function to create matches
-- This is needed for the backend function to work
CREATE POLICY "System can create matches"
    ON matches FOR INSERT
    WITH CHECK (true);

-- Policy: Allow the record_swipe_action function to update matches
CREATE POLICY "System can update matches"
    ON matches FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Ensure authenticated users have proper permissions
GRANT SELECT ON matches TO authenticated;
GRANT INSERT ON matches TO authenticated;
GRANT UPDATE ON matches TO authenticated;

GRANT SELECT ON swipe_actions TO authenticated;
GRANT INSERT ON swipe_actions TO authenticated;
GRANT UPDATE ON swipe_actions TO authenticated;

-- Grant select on profiles for the foreign key queries
GRANT SELECT ON profiles TO authenticated;

-- =====================================================
-- 6. ENABLE RLS ON PROFILES (if needed for queries)
-- =====================================================

-- Check if profiles RLS policies exist and are correct
DO $$ 
BEGIN
    -- Enable RLS on profiles if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing restrictive profile policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Policy: Authenticated users can view active, completed profiles
-- This allows users to see matched users' profiles
CREATE POLICY "Authenticated users can view active profiles"
    ON profiles FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND (is_active = true OR id = auth.uid())
    );

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- 7. CREATE HELPER FUNCTION TO CHECK POLICIES
-- =====================================================

-- Function to verify RLS policies are working
CREATE OR REPLACE FUNCTION check_rls_policies()
RETURNS TABLE(
    table_name TEXT,
    policy_name TEXT,
    policy_command TEXT,
    policy_definition TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename::TEXT,
        policyname::TEXT,
        cmd::TEXT,
        qual::TEXT
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('swipe_actions', 'matches', 'profiles')
    ORDER BY tablename, policyname;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check that policies were created
SELECT 'RLS Policies Created:' as status;
SELECT * FROM check_rls_policies();

-- Check that RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('swipe_actions', 'matches', 'profiles');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES UPDATE COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Updated Tables:';
    RAISE NOTICE '  ✓ swipe_actions - Can now see swipes where user is target';
    RAISE NOTICE '  ✓ matches - Can now see mutual matches';
    RAISE NOTICE '  ✓ profiles - Can now see matched users profiles';
    RAISE NOTICE '';
    RAISE NOTICE 'New Capabilities:';
    RAISE NOTICE '  ✓ Who I Like tab - Shows profiles user has liked';
    RAISE NOTICE '  ✓ Who Likes Me tab - Shows users who liked current user';
    RAISE NOTICE '  ✓ Matches tab - Shows mutual matches';
    RAISE NOTICE '';
    RAISE NOTICE 'Run the verification queries above to confirm!';
    RAISE NOTICE '========================================';
END $$;
