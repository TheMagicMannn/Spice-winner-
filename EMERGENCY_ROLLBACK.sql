-- =====================================================
-- 🚨 EMERGENCY ROLLBACK - RUN THIS IMMEDIATELY
-- =====================================================
-- This restores the OLD RLS policies that only check match_id
-- Run this to fix the 500 errors and get messaging working again
-- =====================================================

-- Step 1: Drop the new policies (that reference conversation_id)
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

-- Step 2: Restore the OLD policies (match_id only)
-- These are the original policies that worked before

-- Policy 1: Users can view messages in their matches
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

-- Policy 2: Users can send messages in their matches
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

-- Policy 3: Users can update their messages
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
    RAISE NOTICE '=== Rollback Complete ===';
    RAISE NOTICE '✓ Old RLS policies restored';
    RAISE NOTICE '✓ Messaging should work now for 1-on-1 chats';
    RAISE NOTICE '';
    RAISE NOTICE 'Test by refreshing your app and sending a message';
END $$;

-- =====================================================
-- NOTES:
-- =====================================================
-- After running this:
-- 1. Refresh your app
-- 2. Try sending a message in a 1-on-1 chat
-- 3. It should work now ✓
--
-- This rollback:
-- - Removes policies that reference conversation_id and conversation_participants
-- - Restores original match_id-only policies
-- - Gets your app working again immediately
--
-- For group chat support, you'll need to:
-- 1. Run STEP_1_SETUP_DATABASE_SCHEMA.sql (adds tables and columns)
-- 2. Run STEP_2_FIX_RLS_POLICIES.sql (updates policies to support both)
--
-- But for now, this gets basic messaging working!
-- =====================================================
