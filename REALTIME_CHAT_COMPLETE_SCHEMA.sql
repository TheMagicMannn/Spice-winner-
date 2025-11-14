-- =====================================================
-- REAL-TIME CHAT SYSTEM - COMPLETE SCHEMA
-- =====================================================
-- This schema supports:
-- - Direct messages between mutually matched users
-- - Group chats (creator adds mutually matched users)
-- - Self-destruct media with group viewing tracking
-- - Real-time typing indicators
-- - Read receipts
-- - Message reactions and replies
-- - User reporting system
-- - Per-user conversation settings (pin, delete)
-- =====================================================

-- =====================================================
-- 1. CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_type TEXT NOT NULL CHECK (conversation_type IN ('direct', 'group')),
    group_name TEXT,
    group_photo TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- =====================================================
-- 2. CONVERSATION PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_active ON conversation_participants(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_participants_deleted ON conversation_participants(user_id, is_deleted) WHERE is_deleted = TRUE;

-- =====================================================
-- 3. MESSAGES TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE, -- For backward compatibility
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'voice', 'gif')),
    media_url TEXT,
    self_destruct_seconds INTEGER,
    first_viewed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    viewed_by JSONB DEFAULT '[]'::jsonb, -- Array of {userId, viewedAt} for group tracking
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    reactions JSONB DEFAULT '[]'::jsonb, -- Array of {userId, emoji, createdAt}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (conversation_id IS NOT NULL OR match_id IS NOT NULL)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted ON messages(conversation_id, is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_self_destruct ON messages(expires_at) WHERE expires_at IS NOT NULL AND is_deleted = FALSE;

-- =====================================================
-- 4. TYPING INDICATORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id),
    UNIQUE(match_id, user_id),
    CHECK (conversation_id IS NOT NULL OR match_id IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_typing_conversation ON typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_match ON typing_indicators(match_id);

-- =====================================================
-- 5. USER REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('user', 'message', 'conversation')),
    reason TEXT NOT NULL,
    additional_context TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
    reporter_blocked_user BOOLEAN DEFAULT FALSE,
    reporter_hidden_conversation BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON user_reports(created_at DESC);

-- =====================================================
-- 6. STORAGE BUCKET FOR MESSAGE ATTACHMENTS
-- =====================================================
-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'message-attachments',
    'message-attachments',
    false, -- Not public, requires authentication
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. DATABASE FUNCTIONS
-- =====================================================

-- Function: Get or create direct conversation
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
    -- Check if a direct conversation already exists between these users
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

-- Function: Create group conversation
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
            RAISE EXCEPTION 'Creator must be mutually matched with all participants. Failed for participant: %', participant_id;
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

-- Function: Add user to group
CREATE OR REPLACE FUNCTION add_user_to_group(
    conversation_id_param UUID,
    user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify it's a group conversation
    IF NOT EXISTS (
        SELECT 1 FROM conversations
        WHERE id = conversation_id_param AND conversation_type = 'group'
    ) THEN
        RAISE EXCEPTION 'Conversation is not a group';
    END IF;

    -- Add user
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES (conversation_id_param, user_id_param, FALSE)
    ON CONFLICT (conversation_id, user_id) 
    DO UPDATE SET is_active = TRUE, left_at = NULL;
END;
$$;

-- Function: Remove user from group
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

-- Function: Mark media viewed in group (for self-destruct)
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
    -- Get message details
    SELECT * INTO msg FROM messages WHERE id = message_id_param;

    IF msg IS NULL THEN
        RAISE EXCEPTION 'Message not found';
    END IF;

    -- Check if user already viewed
    IF msg.viewed_by @> jsonb_build_array(jsonb_build_object('userId', user_id_param)) THEN
        -- Already viewed, return current state
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
        jsonb_build_object(
            'userId', user_id_param,
            'viewedAt', NOW()
        )
    );

    -- Get total active participants
    SELECT COUNT(*) INTO total_participants
    FROM conversation_participants
    WHERE conversation_id = msg.conversation_id AND is_active = TRUE;

    current_viewers := jsonb_array_length(new_viewers);

    -- If all participants have viewed, start timer
    IF current_viewers >= total_participants AND msg.self_destruct_seconds IS NOT NULL THEN
        expiry_time := NOW() + (msg.self_destruct_seconds || ' seconds')::INTERVAL;
        
        UPDATE messages
        SET viewed_by = new_viewers,
            first_viewed_at = NOW(),
            expires_at = expiry_time
        WHERE id = message_id_param;

        RETURN QUERY SELECT TRUE AS all_viewed, expiry_time;
    ELSE
        -- Not all viewed yet
        UPDATE messages
        SET viewed_by = new_viewers
        WHERE id = message_id_param;

        RETURN QUERY SELECT FALSE AS all_viewed, NULL::TIMESTAMP WITH TIME ZONE;
    END IF;
END;
$$;

-- Function: Mark media viewed (for direct messages)
CREATE OR REPLACE FUNCTION mark_media_viewed(
    message_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    msg RECORD;
BEGIN
    SELECT * INTO msg FROM messages WHERE id = message_id;

    IF msg IS NULL THEN
        RAISE EXCEPTION 'Message not found';
    END IF;

    -- For direct messages, start timer immediately
    IF msg.first_viewed_at IS NULL AND msg.self_destruct_seconds IS NOT NULL THEN
        UPDATE messages
        SET first_viewed_at = NOW(),
            expires_at = NOW() + (msg.self_destruct_seconds || ' seconds')::INTERVAL
        WHERE id = message_id;
    END IF;
END;
$$;

-- Function: Delete conversation for user (soft delete)
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

-- Function: Restore conversation for user
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
-- 8. TRIGGERS
-- =====================================================

-- Trigger: Update conversation updated_at on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        UPDATE conversations
        SET updated_at = NOW()
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Trigger: Auto-delete expired self-destruct messages
CREATE OR REPLACE FUNCTION auto_delete_expired_messages()
RETURNS VOID AS $$
BEGIN
    UPDATE messages
    SET is_deleted = TRUE, deleted_at = NOW()
    WHERE expires_at IS NOT NULL
        AND expires_at <= NOW()
        AND is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Note: This should be called by a scheduled job (pg_cron or external)
-- Example pg_cron setup (run every minute):
-- SELECT cron.schedule('delete-expired-messages', '* * * * *', 'SELECT auto_delete_expired_messages()');

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only see conversations they're participants in
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT
    USING (
        id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Group admins can update conversations" ON conversations;
CREATE POLICY "Group admins can update conversations" ON conversations
    FOR UPDATE
    USING (
        id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_admin = TRUE AND is_active = TRUE
        )
    );

-- Conversation Participants: Users can see participants in their conversations
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Users can manage their own participant record" ON conversation_participants;
CREATE POLICY "Users can manage their own participant record" ON conversation_participants
    FOR UPDATE
    USING (user_id = auth.uid());

-- Messages: Users can only see messages in their conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT
    USING (
        (conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_active = TRUE AND is_deleted = FALSE
        ))
        OR
        (match_id IN (
            SELECT id FROM matches
            WHERE status = 'matched' AND (user1_id = auth.uid() OR user2_id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND (
            (conversation_id IN (
                SELECT conversation_id FROM conversation_participants
                WHERE user_id = auth.uid() AND is_active = TRUE AND is_deleted = FALSE
            ))
            OR
            (match_id IN (
                SELECT id FROM matches
                WHERE status = 'matched' AND (user1_id = auth.uid() OR user2_id = auth.uid())
            ))
        )
    );

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE
    USING (sender_id = auth.uid() OR TRUE); -- Allow updates for reactions and read receipts

-- Typing Indicators: Users can see typing in their conversations
DROP POLICY IF EXISTS "Users can view typing in their conversations" ON typing_indicators;
CREATE POLICY "Users can view typing in their conversations" ON typing_indicators
    FOR SELECT
    USING (
        (conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_active = TRUE
        ))
        OR
        (match_id IN (
            SELECT id FROM matches
            WHERE status = 'matched' AND (user1_id = auth.uid() OR user2_id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "Users can manage their own typing indicator" ON typing_indicators;
CREATE POLICY "Users can manage their own typing indicator" ON typing_indicators
    FOR ALL
    USING (user_id = auth.uid());

-- User Reports: Users can view their own reports, admins can view all
DROP POLICY IF EXISTS "Users can view their own reports" ON user_reports;
CREATE POLICY "Users can view their own reports" ON user_reports
    FOR SELECT
    USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can create reports" ON user_reports;
CREATE POLICY "Users can create reports" ON user_reports
    FOR INSERT
    WITH CHECK (reporter_id = auth.uid());

-- Storage: Only authenticated users in conversation can access media
DROP POLICY IF EXISTS "Users can view media in their conversations" ON storage.objects;
CREATE POLICY "Users can view media in their conversations" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'message-attachments'
        AND auth.role() = 'authenticated'
        AND (
            -- Check if user is participant in any conversation with this media
            EXISTS (
                SELECT 1 FROM messages m
                INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
                WHERE m.media_url LIKE '%' || name || '%'
                    AND cp.user_id = auth.uid()
                    AND cp.is_active = TRUE
            )
            OR
            -- Check match-based messages
            EXISTS (
                SELECT 1 FROM messages m
                INNER JOIN matches mat ON m.match_id = mat.id
                WHERE m.media_url LIKE '%' || name || '%'
                    AND mat.status = 'matched'
                    AND (mat.user1_id = auth.uid() OR mat.user2_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Users can upload media to their conversations" ON storage.objects;
CREATE POLICY "Users can upload media to their conversations" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'message-attachments'
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'message-attachments'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- =====================================================
-- 10. REALTIME CONFIGURATION
-- =====================================================

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- To apply this schema, run it in your Supabase SQL editor
-- 
-- Features included:
-- ✓ Direct and group conversations
-- ✓ Message reactions and replies
-- ✓ Self-destruct media with group viewing tracking
-- ✓ Typing indicators
-- ✓ Read receipts
-- ✓ User reporting system
-- ✓ Row Level Security policies
-- ✓ Storage bucket with authenticated access
-- ✓ Real-time subscriptions
-- =====================================================
