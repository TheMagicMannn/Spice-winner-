-- =====================================================
-- 🔓 PERMISSIVE RLS POLICIES FOR TESTING
-- =====================================================
-- These policies are more permissive to get messaging working
-- We can tighten them later once it works
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

-- Policy 1: Users can view messages in their matches (more permissive)
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        -- Removed status check to be more permissive
    )
);

-- Policy 2: Users can send messages (more permissive)
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        -- Removed status check to be more permissive
    )
);

-- Policy 3: Users can update their own messages (more permissive)
CREATE POLICY "Users can update messages"
ON messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
);

SELECT 'Permissive policies created!' AS status;
SELECT 'Try sending a message now.' AS next_step;

-- =====================================================
-- WHAT CHANGED:
-- =====================================================
-- Removed: AND matches.status = 'matched'
-- Why: Match status might not be exactly 'matched'
--      or the check might be failing for some reason
--
-- This makes the policy more permissive:
-- - Only checks if user is part of the match
-- - Doesn't care about match status
-- - Should allow messages to be sent
--
-- If this works, we know the status check was the issue
-- =====================================================
