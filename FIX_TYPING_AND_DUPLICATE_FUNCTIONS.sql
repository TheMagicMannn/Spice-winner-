-- =====================================================
-- FIX: Typing Indicators & Duplicate Functions
-- =====================================================

-- STEP 1: Remove ALL versions of create_group_conversation
-- This fixes the "could not choose best candidate" error
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure as func
        FROM pg_proc
        WHERE proname = 'create_group_conversation'
        AND pg_function_is_visible(oid)
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func || ' CASCADE';
    END LOOP;
END $$;

-- STEP 2: Remove ALL versions of get_or_create_direct_conversation
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure as func
        FROM pg_proc
        WHERE proname = 'get_or_create_direct_conversation'
        AND pg_function_is_visible(oid)
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func || ' CASCADE';
    END LOOP;
END $$;

-- STEP 3: Recreate functions with correct signatures
-- Get or create direct conversation
CREATE FUNCTION get_or_create_direct_conversation(
    user1_id UUID,
    user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_conversation_id UUID;
    existing_conv UUID;
    v_user1 UUID := user1_id;
    v_user2 UUID := user2_id;
BEGIN
    -- Check if conversation exists
    SELECT c.id INTO existing_conv
    FROM conversations c
    INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.conversation_type = 'direct'
        AND cp1.user_id = v_user1
        AND cp2.user_id = v_user2
        AND cp1.is_active = TRUE
        AND cp2.is_active = TRUE
        AND cp1.is_deleted = FALSE
        AND cp2.is_deleted = FALSE
    LIMIT 1;

    IF existing_conv IS NOT NULL THEN
        RETURN existing_conv;
    END IF;

    -- Check mutual match
    IF NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE m.status = 'matched'
        AND ((m.user1_id = v_user1 AND m.user2_id = v_user2) OR
             (m.user1_id = v_user2 AND m.user2_id = v_user1))
    ) THEN
        RAISE EXCEPTION 'Users must be mutually matched to create a conversation';
    END IF;

    -- Create conversation
    INSERT INTO conversations (conversation_type, created_by)
    VALUES ('direct', v_user1)
    RETURNING id INTO result_conversation_id;

    -- Add participants
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES 
        (result_conversation_id, v_user1, TRUE),
        (result_conversation_id, v_user2, TRUE);

    RETURN result_conversation_id;
END;
$$;

-- Create group conversation
CREATE FUNCTION create_group_conversation(
    creator_id UUID,
    group_name_param TEXT,
    participant_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_conversation_id UUID;
    participant_id UUID;
    v_creator UUID := creator_id;
BEGIN
    -- Verify mutual matches
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM matches m
            WHERE m.status = 'matched'
            AND ((m.user1_id = v_creator AND m.user2_id = participant_id) OR
                 (m.user1_id = participant_id AND m.user2_id = v_creator))
        ) THEN
            RAISE EXCEPTION 'Creator must be mutually matched with all participants';
        END IF;
    END LOOP;

    -- Create conversation
    INSERT INTO conversations (conversation_type, group_name, created_by)
    VALUES ('group', group_name_param, v_creator)
    RETURNING id INTO result_conversation_id;

    -- Add creator as admin
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES (result_conversation_id, v_creator, TRUE);

    -- Add participants
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
        VALUES (result_conversation_id, participant_id, FALSE)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END LOOP;

    RETURN result_conversation_id;
END;
$$;

-- STEP 4: Fix typing_indicators constraint
-- Make match_id nullable so we can use conversation_id instead
ALTER TABLE typing_indicators ALTER COLUMN match_id DROP NOT NULL;

-- Add conversation_id if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'typing_indicators' 
        AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE typing_indicators 
        ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update check constraint to allow either match_id OR conversation_id
ALTER TABLE typing_indicators DROP CONSTRAINT IF EXISTS typing_indicators_check;
ALTER TABLE typing_indicators DROP CONSTRAINT IF EXISTS typing_indicators_check1;

ALTER TABLE typing_indicators 
ADD CONSTRAINT typing_indicators_check 
CHECK (
    (match_id IS NOT NULL AND conversation_id IS NULL) OR
    (match_id IS NULL AND conversation_id IS NOT NULL)
);

-- Drop old unique constraint on match_id
ALTER TABLE typing_indicators DROP CONSTRAINT IF EXISTS typing_match_user_unique;

-- Create proper unique constraints for both cases
CREATE UNIQUE INDEX IF NOT EXISTS typing_match_user_unique
    ON typing_indicators(match_id, user_id)
    WHERE match_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS typing_conversation_user_unique
    ON typing_indicators(conversation_id, user_id)
    WHERE conversation_id IS NOT NULL;

-- =====================================================
-- STEP 5: Create helper function for setting typing in conversations
-- =====================================================
CREATE OR REPLACE FUNCTION set_typing_conversation(
    p_conversation_id UUID,
    p_user_id UUID,
    p_is_typing BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_is_typing THEN
        -- Delete existing and insert new
        DELETE FROM typing_indicators
        WHERE conversation_id = p_conversation_id
        AND user_id = p_user_id;

        INSERT INTO typing_indicators (conversation_id, user_id, is_typing, updated_at)
        VALUES (p_conversation_id, p_user_id, TRUE, NOW());
    ELSE
        -- Remove typing indicator
        DELETE FROM typing_indicators
        WHERE conversation_id = p_conversation_id
        AND user_id = p_user_id;
    END IF;
END;
$$;

-- Create helper function for setting typing in matches
CREATE OR REPLACE FUNCTION set_typing_match(
    p_match_id UUID,
    p_user_id UUID,
    p_is_typing BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_is_typing THEN
        -- Delete existing and insert new
        DELETE FROM typing_indicators
        WHERE match_id = p_match_id
        AND user_id = p_user_id;

        INSERT INTO typing_indicators (match_id, user_id, is_typing, updated_at)
        VALUES (p_match_id, p_user_id, TRUE, NOW());
    ELSE
        -- Remove typing indicator
        DELETE FROM typing_indicators
        WHERE match_id = p_match_id
        AND user_id = p_user_id;
    END IF;
END;
$$;

-- =====================================================
-- FIX COMPLETE
-- =====================================================
-- ✅ Removed duplicate functions
-- ✅ Fixed typing_indicators to support both match_id and conversation_id
-- ✅ Created helper functions for typing
-- =====================================================
