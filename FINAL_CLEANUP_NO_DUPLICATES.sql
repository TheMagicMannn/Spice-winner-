-- =====================================================
-- 🔥 FINAL CLEANUP - Remove ALL Duplicate Policies
-- =====================================================
-- This script removes ALL policies on messages table
-- Then recreates them cleanly (no duplicates)
-- =====================================================

-- Step 1: Get a clean slate - drop EVERYTHING on messages table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on messages table (including duplicates)
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'messages'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON messages', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
    
    -- Drop all policies on conversation_participants
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversation_participants'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversation_participants', pol.policyname);
        RAISE NOTICE 'Dropped conversation_participants policy: %', pol.policyname;
    END LOOP;
    
    -- Drop all policies on conversations
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversations'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversations', pol.policyname);
        RAISE NOTICE 'Dropped conversations policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 3: Drop helper functions
DROP FUNCTION IF EXISTS get_or_create_direct_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS create_group_conversation(UUID, VARCHAR(100), UUID[]);
DROP FUNCTION IF EXISTS add_user_to_group(UUID, UUID);
DROP FUNCTION IF EXISTS remove_user_from_group(UUID, UUID);

-- Step 4: Remove conversation_id column
ALTER TABLE messages DROP COLUMN IF EXISTS conversation_id;

-- Step 5: Drop conversation tables
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Step 6: Create EXACTLY 3 policies on messages (no duplicates)
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        AND matches.status = 'matched'
    )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        AND matches.status = 'matched'
    )
);

CREATE POLICY "Users can update messages"
ON messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
);

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$ 
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count policies on messages table
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'messages';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Cleanup Complete ===';
    RAISE NOTICE 'Policies on messages table: % (should be 3)', policy_count;
    
    IF policy_count = 3 THEN
        RAISE NOTICE '✓ Correct number of policies!';
    ELSE
        RAISE NOTICE '✗ Warning: Expected 3 policies, found %', policy_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Policy names:';
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'messages'
        ORDER BY policyname
    LOOP
        RAISE NOTICE '  ✓ %', pol.policyname;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Ready to Test ===';
    RAISE NOTICE 'Refresh your app and try sending a message!';
END $$;

-- =====================================================
-- NOTES:
-- =====================================================
-- This script:
-- 1. Removes ALL policies (including duplicates)
-- 2. Removes conversation tables/columns
-- 3. Creates exactly 3 clean policies
-- 4. Verifies the result
--
-- After running:
-- - Refresh your app
-- - Open a 1-on-1 chat
-- - Send a message
-- - Should work! ✓
-- =====================================================
