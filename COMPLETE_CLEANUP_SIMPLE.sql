-- =====================================================
-- 🔥 COMPLETE CLEANUP - Simple Version (No Verification Loop)
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
-- Success Message
-- =====================================================
SELECT 'Cleanup complete! Refresh your app and test messaging.' AS status;

-- =====================================================
-- Verification Queries (Optional - Run these separately if you want)
-- =====================================================
-- Check what tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check policies on messages:
-- SELECT policyname FROM pg_policies WHERE tablename = 'messages';

-- Check if conversation_id column exists:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'conversation_id';
