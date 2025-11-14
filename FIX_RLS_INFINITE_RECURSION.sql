-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- =====================================================
-- The issue is that conversation_participants policy
-- was querying itself, causing infinite recursion.
-- Solution: Use a SECURITY DEFINER function to bypass RLS
-- =====================================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can manage their own participant record" ON conversation_participants;

-- Create helper function to check if user is in conversation
-- SECURITY DEFINER bypasses RLS, preventing recursion
CREATE OR REPLACE FUNCTION user_is_in_conversation(
    conversation_id_param UUID,
    user_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conversation_id_param
        AND user_id = user_id_param
        AND is_active = TRUE
    );
$$;

-- Create new policy using the helper function
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
    FOR SELECT
    USING (
        user_is_in_conversation(conversation_id, auth.uid())
    );

CREATE POLICY "Users can manage their own participant record" ON conversation_participants
    FOR UPDATE
    USING (user_id = auth.uid());

-- Also fix the conversations policy to avoid similar issues
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT
    USING (
        user_is_in_conversation(id, auth.uid())
    );

-- Fix messages policy to avoid recursion as well
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT
    USING (
        (conversation_id IS NOT NULL AND user_is_in_conversation(conversation_id, auth.uid()))
        OR
        (match_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM matches
            WHERE id = messages.match_id
            AND status = 'matched' 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        ))
    );

-- Fix typing indicators policy
DROP POLICY IF EXISTS "Users can view typing in their conversations" ON typing_indicators;

CREATE POLICY "Users can view typing in their conversations" ON typing_indicators
    FOR SELECT
    USING (
        (conversation_id IS NOT NULL AND user_is_in_conversation(conversation_id, auth.uid()))
        OR
        (match_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM matches
            WHERE id = typing_indicators.match_id
            AND status = 'matched' 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        ))
    );

-- =====================================================
-- Grant execute permission on the helper function
-- =====================================================
GRANT EXECUTE ON FUNCTION user_is_in_conversation(UUID, UUID) TO authenticated;

-- =====================================================
-- FIX COMPLETE
-- =====================================================
-- Run this script to fix the infinite recursion issue
-- The SECURITY DEFINER function bypasses RLS when checking
-- membership, preventing the recursion loop
-- =====================================================
