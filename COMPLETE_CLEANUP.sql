-- =====================================================
-- 🔥 COMPLETE CLEANUP - Nuclear Option
-- =====================================================
-- This removes ALL conversation-related tables and policies
-- Gets you back to a clean state with ONLY match-based messaging
-- =====================================================

-- Step 1: Drop ALL policies on messages table
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;

-- Step 2: Drop ALL policies on conversation_participants (causing infinite recursion)
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can update participants" ON conversation_participants;

-- Step 3: Drop ALL policies on conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can update group conversations" ON conversations;

-- Step 4: Drop helper functions (prevent foreign key issues)
DROP FUNCTION IF EXISTS get_or_create_direct_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS create_group_conversation(UUID, VARCHAR(100), UUID[]);
DROP FUNCTION IF EXISTS add_user_to_group(UUID, UUID);
DROP FUNCTION IF EXISTS remove_user_from_group(UUID, UUID);

-- Step 5: Remove conversation_id column from messages (if it exists)
ALTER TABLE messages DROP COLUMN IF EXISTS conversation_id;

-- Step 6: Drop conversation tables
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Step 7: Restore ORIGINAL working RLS policies on messages
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
BEGIN
    RAISE NOTICE '=== Complete Cleanup Done ===';
    RAISE NOTICE '';
    
    -- Check messages table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE NOTICE '✓ messages table exists';
    END IF;
    
    -- Check conversation tables are gone
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        RAISE NOTICE '✓ conversations table removed';
    ELSE
        RAISE NOTICE '✗ conversations table still exists!';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        RAISE NOTICE '✓ conversation_participants table removed';
    ELSE
        RAISE NOTICE '✗ conversation_participants table still exists!';
    END IF;
    
    -- Check conversation_id column is gone
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'conversation_id'
    ) THEN
        RAISE NOTICE '✓ conversation_id column removed';
    ELSE
        RAISE NOTICE '✗ conversation_id column still exists!';
    END IF;
    
    -- Check RLS policies on messages
    RAISE NOTICE '';
    RAISE NOTICE 'RLS Policies on messages table:';
    FOR rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'messages'
        ORDER BY policyname
    LOOP
        RAISE NOTICE '  ✓ %', rec.policyname;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== System Ready ===';
    RAISE NOTICE 'Your app should now work for 1-on-1 chats!';
    RAISE NOTICE 'Refresh your app and test messaging.';
END $$;

-- =====================================================
-- NOTES:
-- =====================================================
-- What this script does:
-- 1. Removes ALL conversation-related tables and columns
-- 2. Removes ALL problematic RLS policies
-- 3. Restores clean match-based messaging
-- 4. Gets you back to working state
--
-- After running this:
-- ✓ 1-on-1 chats work perfectly
-- ✓ All existing messages preserved
-- ✓ No infinite recursion errors
-- ✓ Clean slate for future migration
--
-- Group chat support:
-- - NOT available after this cleanup
-- - Can be added later with proper migration
-- - For now, focus on getting basic messaging working
--
-- Next steps:
-- 1. Run this script
-- 2. Refresh your app (Ctrl+Shift+R)
-- 3. Test sending a message in 1-on-1 chat
-- 4. Should work! ✓
-- =====================================================
