-- =====================================================
-- FIX GROUP CHAT RLS POLICIES FOR MESSAGES TABLE
-- =====================================================
-- This script fixes the RLS policy issue preventing group chat messages
-- from being sent (both text and media messages with photos/videos)
--
-- Issue: Current policies only check match_id, but group chats use conversation_id
-- Solution: Update policies to support BOTH match-based and conversation-based messaging
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop existing RLS policies on messages table
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

-- Step 2: Create new policies that support BOTH match_id and conversation_id

-- Policy 1: Users can view messages in their matches OR conversations
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (
    -- Check if user is part of the match (for direct messages)
    EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        AND matches.status = 'matched'
    )
    OR
    -- Check if user is an active participant in the conversation (for group chats)
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
        AND conversation_participants.is_active = true
    )
);

-- Policy 2: Users can send messages in their matches OR conversations
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    -- User must be the sender
    auth.uid() = sender_id
    AND (
        -- Either: User is part of the match (for direct messages)
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
            AND matches.status = 'matched'
        )
        OR
        -- Or: User is an active participant in the conversation (for group chats)
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = messages.conversation_id
            AND conversation_participants.user_id = auth.uid()
            AND conversation_participants.is_active = true
        )
    )
);

-- Policy 3: Users can update messages in their matches OR conversations
-- (For marking as read, adding reactions, etc.)
CREATE POLICY "Users can update messages"
ON messages FOR UPDATE
USING (
    -- Check if user is part of the match (for direct messages)
    EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
    OR
    -- Check if user is a participant in the conversation (for group chats)
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
);

-- =====================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =====================================================

-- Test 1: Check if policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- Test 2: Verify conversation_participants table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'conversation_participants'
) as table_exists;

-- Test 3: Check if messages table has conversation_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name IN ('match_id', 'conversation_id', 'sender_id');

-- =====================================================
-- NOTES:
-- =====================================================
-- After running this script:
-- 1. Group chat messages (text & media) will work ✓
-- 2. Existing 1-on-1 chat messages will continue to work ✓
-- 3. Users can only send messages in conversations they're part of ✓
-- 4. Users can only view messages in their conversations ✓
-- 5. RLS security is maintained for both types of messaging ✓
--
-- If you get errors about policies not existing during DROP, that's okay.
-- The important part is that the CREATE POLICY statements succeed.
-- =====================================================
