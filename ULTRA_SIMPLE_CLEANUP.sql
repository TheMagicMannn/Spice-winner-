-- =====================================================
-- 🔥 ULTRA SIMPLE CLEANUP - No Loops, No Errors
-- =====================================================
-- This is the absolute simplest version
-- Manually drops all known policies by name
-- Guaranteed to work!
-- =====================================================

-- Drop ALL possible policy names on messages (including duplicates)
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;
DROP POLICY IF EXISTS "Users can update reactions on messages in their" ON messages;
DROP POLICY IF EXISTS "Users can update reactions on messages in their matches" ON messages;

-- Drop conversation_participants policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can update participants" ON conversation_participants;

-- Drop conversations policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can update group conversations" ON conversations;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_or_create_direct_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS create_group_conversation(UUID, VARCHAR(100), UUID[]);
DROP FUNCTION IF EXISTS add_user_to_group(UUID, UUID);
DROP FUNCTION IF EXISTS remove_user_from_group(UUID, UUID);

-- Remove conversation_id column
ALTER TABLE messages DROP COLUMN IF EXISTS conversation_id;

-- Drop conversation tables
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create EXACTLY 3 clean policies (no duplicates!)
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

-- Show success message
SELECT 'Cleanup complete! You should have exactly 3 policies on messages table.' AS status;

-- =====================================================
-- VERIFICATION (Run this separately if you want)
-- =====================================================
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'messages' ORDER BY policyname;
-- Should show EXACTLY 3 policies:
--   Users can send messages (INSERT)
--   Users can update messages (UPDATE)
--   Users can view their messages (SELECT)
-- =====================================================
