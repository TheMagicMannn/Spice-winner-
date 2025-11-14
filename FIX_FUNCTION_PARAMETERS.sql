-- =====================================================
-- FIX: Function Parameter Ambiguity
-- =====================================================
-- The get_or_create_direct_conversation function has
-- parameter names that conflict with column names
-- =====================================================

-- Drop and recreate with proper parameter references
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
    v_user1_id UUID := user1_id;  -- Store in variable to avoid ambiguity
    v_user2_id UUID := user2_id;
BEGIN
    -- Check if a direct conversation already exists
    SELECT c.id INTO existing_conversation
    FROM conversations c
    INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.conversation_type = 'direct'
        AND cp1.user_id = v_user1_id
        AND cp2.user_id = v_user2_id
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
        AND ((matches.user1_id = v_user1_id AND matches.user2_id = v_user2_id) OR
             (matches.user1_id = v_user2_id AND matches.user2_id = v_user1_id))
    ) THEN
        RAISE EXCEPTION 'Users must be mutually matched to create a conversation';
    END IF;

    -- Create new conversation
    INSERT INTO conversations (conversation_type, created_by)
    VALUES ('direct', v_user1_id)
    RETURNING id INTO conversation_id;

    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES 
        (conversation_id, v_user1_id, TRUE),
        (conversation_id, v_user2_id, TRUE);

    RETURN conversation_id;
END;
$$;

-- Also fix create_group_conversation for same issue
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
    v_creator_id UUID := creator_id;  -- Store in variable
BEGIN
    -- Verify all participants are mutually matched with creator
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM matches
            WHERE status = 'matched'
            AND ((matches.user1_id = v_creator_id AND matches.user2_id = participant_id) OR
                 (matches.user1_id = participant_id AND matches.user2_id = v_creator_id))
        ) THEN
            RAISE EXCEPTION 'Creator must be mutually matched with all participants';
        END IF;
    END LOOP;

    -- Create conversation
    INSERT INTO conversations (conversation_type, group_name, created_by)
    VALUES ('group', group_name_param, v_creator_id)
    RETURNING id INTO conversation_id;

    -- Add creator as admin
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES (conversation_id, v_creator_id, TRUE);

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

-- =====================================================
-- FIX COMPLETE
-- =====================================================
-- Now functions use local variables to avoid
-- parameter/column name ambiguity
-- =====================================================
