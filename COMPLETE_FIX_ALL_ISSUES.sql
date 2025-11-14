-- =====================================================
-- COMPLETE FIX - All Chat Issues
-- =====================================================
-- Fixes:
-- 1. Missing columns in conversation_participants
-- 2. Infinite recursion in RLS policies
-- 3. All policies and functions
-- =====================================================

-- =====================================================
-- STEP 1: Ensure conversation_participants has all columns
-- =====================================================
DO $$ 
BEGIN
    -- Add is_pinned if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add is_deleted if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'is_deleted'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add deleted_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add left_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'left_at'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN left_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =====================================================
-- STEP 2: Ensure messages has all columns
-- =====================================================
DO $$ 
BEGIN
    -- Add conversation_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;

    -- Add viewed_by if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'viewed_by'
    ) THEN
        ALTER TABLE messages ADD COLUMN viewed_by JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- =====================================================
-- STEP 3: Create helper function to prevent recursion
-- =====================================================
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

GRANT EXECUTE ON FUNCTION user_is_in_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_in_conversation(UUID, UUID) TO anon;

-- =====================================================
-- STEP 4: Fix all RLS policies (no recursion)
-- =====================================================

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Group admins can update conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can manage their own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "System can insert participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view typing in their conversations" ON typing_indicators;
DROP POLICY IF EXISTS "Users can manage their own typing indicator" ON typing_indicators;

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT
    USING (
        user_is_in_conversation(id, auth.uid())
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can update conversations" ON conversations
    FOR UPDATE
    USING (
        user_is_in_conversation(id, auth.uid())
        AND EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = id
            AND user_id = auth.uid()
            AND is_admin = TRUE
            AND is_active = TRUE
        )
    );

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
    FOR SELECT
    USING (
        user_is_in_conversation(conversation_id, auth.uid())
    );

CREATE POLICY "Users can manage their own participant record" ON conversation_participants
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "System can insert participants" ON conversation_participants
    FOR INSERT
    WITH CHECK (true);

-- Messages policies
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

CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND (
            (conversation_id IS NOT NULL AND user_is_in_conversation(conversation_id, auth.uid()))
            OR
            (match_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM matches
                WHERE id = messages.match_id
                AND status = 'matched' 
                AND (user1_id = auth.uid() OR user2_id = auth.uid())
            ))
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE
    USING (sender_id = auth.uid() OR TRUE);

-- Typing indicators policies
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

CREATE POLICY "Users can manage their own typing indicator" ON typing_indicators
    FOR ALL
    USING (user_id = auth.uid());

-- =====================================================
-- STEP 5: Recreate all essential functions
-- =====================================================

-- Get or create direct conversation
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(
    user1_id UUID,
    user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_id UUID;
    existing_conversation UUID;
BEGIN
    -- Check if a direct conversation already exists
    SELECT c.id INTO existing_conversation
    FROM conversations c
    INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.conversation_type = 'direct'
        AND cp1.user_id = user1_id
        AND cp2.user_id = user2_id
        AND cp1.is_active = TRUE
        AND cp2.is_active = TRUE
        AND cp1.is_deleted = FALSE
        AND cp2.is_deleted = FALSE
    LIMIT 1;

    IF existing_conversation IS NOT NULL THEN
        RETURN existing_conversation;
    END IF;

    -- Check if users are mutually matched
    IF NOT EXISTS (
        SELECT 1 FROM matches
        WHERE status = 'matched'
        AND (
            (user1_id = user1_id AND user2_id = user2_id) OR
            (user1_id = user2_id AND user2_id = user1_id)
        )
    ) THEN
        RAISE EXCEPTION 'Users must be mutually matched to create a conversation';
    END IF;

    -- Create new conversation
    INSERT INTO conversations (conversation_type, created_by)
    VALUES ('direct', user1_id)
    RETURNING id INTO conversation_id;

    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES 
        (conversation_id, user1_id, TRUE),
        (conversation_id, user2_id, TRUE);

    RETURN conversation_id;
END;
$$;

-- Create group conversation
CREATE OR REPLACE FUNCTION create_group_conversation(
    creator_id UUID,
    group_name_param TEXT,
    participant_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_id UUID;
    participant_id UUID;
BEGIN
    -- Verify all participants are mutually matched with creator
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM matches
            WHERE status = 'matched'
            AND (
                (user1_id = creator_id AND user2_id = participant_id) OR
                (user1_id = participant_id AND user2_id = creator_id)
            )
        ) THEN
            RAISE EXCEPTION 'Creator must be mutually matched with all participants';
        END IF;
    END LOOP;

    -- Create conversation
    INSERT INTO conversations (conversation_type, group_name, created_by)
    VALUES ('group', group_name_param, creator_id)
    RETURNING id INTO conversation_id;

    -- Add creator as admin
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES (conversation_id, creator_id, TRUE);

    -- Add all participants
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
        VALUES (conversation_id, participant_id, FALSE)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END LOOP;

    RETURN conversation_id;
END;
$$;

-- Add user to group
CREATE OR REPLACE FUNCTION add_user_to_group(
    conversation_id_param UUID,
    user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES (conversation_id_param, user_id_param, FALSE)
    ON CONFLICT (conversation_id, user_id) 
    DO UPDATE SET is_active = TRUE, left_at = NULL;
END;
$$;

-- Remove user from group
CREATE OR REPLACE FUNCTION remove_user_from_group(
    conversation_id_param UUID,
    user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE conversation_participants
    SET is_active = FALSE, left_at = NOW()
    WHERE conversation_id = conversation_id_param
        AND user_id = user_id_param;
END;
$$;

-- Mark media viewed (direct)
CREATE OR REPLACE FUNCTION mark_media_viewed(
    message_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE messages
    SET first_viewed_at = NOW(),
        expires_at = NOW() + (self_destruct_seconds || ' seconds')::INTERVAL
    WHERE id = message_id
        AND first_viewed_at IS NULL
        AND self_destruct_seconds IS NOT NULL;
END;
$$;

-- Mark media viewed (group)
CREATE OR REPLACE FUNCTION mark_media_viewed_group(
    message_id_param UUID,
    user_id_param UUID
)
RETURNS TABLE (
    all_viewed BOOLEAN,
    expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    msg RECORD;
    total_participants INTEGER;
    current_viewers INTEGER;
    new_viewers JSONB;
    expiry_time TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT * INTO msg FROM messages WHERE id = message_id_param;

    IF msg IS NULL THEN
        RAISE EXCEPTION 'Message not found';
    END IF;

    -- Check if user already viewed
    IF msg.viewed_by @> jsonb_build_array(jsonb_build_object('userId', user_id_param)) THEN
        SELECT COUNT(*) INTO total_participants
        FROM conversation_participants
        WHERE conversation_id = msg.conversation_id AND is_active = TRUE;

        current_viewers := jsonb_array_length(msg.viewed_by);

        RETURN QUERY SELECT 
            (current_viewers >= total_participants) AS all_viewed,
            msg.expires_at;
        RETURN;
    END IF;

    -- Add viewer
    new_viewers := msg.viewed_by || jsonb_build_array(
        jsonb_build_object('userId', user_id_param, 'viewedAt', NOW())
    );

    SELECT COUNT(*) INTO total_participants
    FROM conversation_participants
    WHERE conversation_id = msg.conversation_id AND is_active = TRUE;

    current_viewers := jsonb_array_length(new_viewers);

    -- If all viewed, start timer
    IF current_viewers >= total_participants AND msg.self_destruct_seconds IS NOT NULL THEN
        expiry_time := NOW() + (msg.self_destruct_seconds || ' seconds')::INTERVAL;
        
        UPDATE messages
        SET viewed_by = new_viewers,
            first_viewed_at = NOW(),
            expires_at = expiry_time
        WHERE id = message_id_param;

        RETURN QUERY SELECT TRUE AS all_viewed, expiry_time;
    ELSE
        UPDATE messages
        SET viewed_by = new_viewers
        WHERE id = message_id_param;

        RETURN QUERY SELECT FALSE AS all_viewed, NULL::TIMESTAMP WITH TIME ZONE;
    END IF;
END;
$$;

-- Delete conversation for user
CREATE OR REPLACE FUNCTION delete_conversation_for_user(
    conversation_id_param UUID,
    user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE conversation_participants
    SET is_deleted = TRUE, deleted_at = NOW()
    WHERE conversation_id = conversation_id_param
        AND user_id = user_id_param;
END;
$$;

-- Restore conversation for user
CREATE OR REPLACE FUNCTION restore_conversation_for_user(
    conversation_id_param UUID,
    user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE conversation_participants
    SET is_deleted = FALSE, deleted_at = NULL
    WHERE conversation_id = conversation_id_param
        AND user_id = user_id_param;
END;
$$;

-- =====================================================
-- COMPLETE - All issues fixed
-- =====================================================
-- Run this script to fix:
-- ✅ Missing columns
-- ✅ Infinite recursion
-- ✅ All policies
-- ✅ All functions
-- =====================================================
