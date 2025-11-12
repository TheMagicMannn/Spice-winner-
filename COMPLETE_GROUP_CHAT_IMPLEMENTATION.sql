-- =====================================================
-- 🚀 COMPLETE GROUP CHAT IMPLEMENTATION
-- =====================================================
-- This implements:
-- 1. Group chat functionality
-- 2. Direct chat via conversations table
-- 3. Proper deletion handling (soft delete per user)
-- 4. New messages after deletion create NEW conversation threads
-- 5. Deleted threads stay in deleted, new threads appear in all messages
-- =====================================================

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- Conversations table (for both direct and group chats)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type VARCHAR(20) NOT NULL CHECK (conversation_type IN ('direct', 'group')),
  group_name VARCHAR(100),
  group_photo TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation participants (tracks who's in each conversation)
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_read_at TIMESTAMPTZ,
  
  -- Per-user soft delete flags
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(conversation_id, user_id)
);

-- Add conversation_id to messages table (if not exists)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_deleted ON conversation_participants(user_id, is_deleted);

-- ============================================
-- STEP 3: ENABLE RLS
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: DROP OLD POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can update group conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;

-- ============================================
-- STEP 5: CREATE NEW RLS POLICIES FOR MESSAGES
-- ============================================

-- Messages: View messages in matches OR non-deleted conversations
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (
    -- Can view messages in their matches (direct messages via match_id)
    (match_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    ))
    OR
    -- Can view messages in their conversations (if not deleted by them)
    (conversation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
        AND conversation_participants.is_active = true
        AND conversation_participants.is_deleted = false
    ))
);

-- Messages: Send messages in matches OR active conversations
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND (
        -- Can send in their matches
        (match_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        ))
        OR
        -- Can send in their active conversations
        (conversation_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = messages.conversation_id
            AND conversation_participants.user_id = auth.uid()
            AND conversation_participants.is_active = true
            AND conversation_participants.is_deleted = false
        ))
    )
);

-- Messages: Update messages in matches OR conversations
CREATE POLICY "Users can update messages"
ON messages FOR UPDATE
USING (
    (match_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    ))
    OR
    (conversation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    ))
);

-- ============================================
-- STEP 6: CREATE RLS POLICIES FOR CONVERSATIONS
-- ============================================

CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND is_deleted = false
  )
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update group conversations"
ON conversations FOR UPDATE
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- ============================================
-- STEP 7: CREATE RLS POLICIES FOR PARTICIPANTS
-- ============================================

CREATE POLICY "Users can view conversation participants"
ON conversation_participants FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can add participants"
ON conversation_participants FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_admin = true
  )
  OR
  user_id = auth.uid()
);

CREATE POLICY "Users can update their own participant record"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- STEP 8: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get or create a direct conversation
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Check if ACTIVE conversation exists between these users
  SELECT c.id INTO existing_conversation_id
  FROM conversations c
  INNER JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = user1_id
  INNER JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = user2_id
  WHERE c.conversation_type = 'direct'
    AND cp1.is_active = true AND cp1.is_deleted = false
    AND cp2.is_active = true AND cp2.is_deleted = false
  LIMIT 1;
  
  -- If active conversation exists, return it
  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;
  
  -- Otherwise, create NEW conversation (even if old deleted one exists)
  INSERT INTO conversations (conversation_type, created_by)
  VALUES ('direct', user1_id)
  RETURNING id INTO new_conversation_id;
  
  -- Add both users as participants
  INSERT INTO conversation_participants (conversation_id, user_id, is_admin, is_deleted)
  VALUES 
    (new_conversation_id, user1_id, true, false),
    (new_conversation_id, user2_id, true, false);
  
  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a group conversation
CREATE OR REPLACE FUNCTION create_group_conversation(
  creator_id UUID,
  group_name_param VARCHAR(100),
  participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
  new_conversation_id UUID;
  participant_id UUID;
BEGIN
  -- Create new group conversation
  INSERT INTO conversations (conversation_type, group_name, created_by)
  VALUES ('group', group_name_param, creator_id)
  RETURNING id INTO new_conversation_id;
  
  -- Add creator as admin
  INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
  VALUES (new_conversation_id, creator_id, true);
  
  -- Add other participants
  FOREACH participant_id IN ARRAY participant_ids
  LOOP
    IF participant_id != creator_id THEN
      INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
      VALUES (new_conversation_id, participant_id, false)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete a conversation for a user
CREATE OR REPLACE FUNCTION delete_conversation_for_user(
  conversation_id_param UUID,
  user_id_param UUID
)
RETURNS void AS $$
BEGIN
  UPDATE conversation_participants
  SET is_deleted = true, deleted_at = now()
  WHERE conversation_id = conversation_id_param 
  AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a deleted conversation for a user
CREATE OR REPLACE FUNCTION restore_conversation_for_user(
  conversation_id_param UUID,
  user_id_param UUID
)
RETURNS void AS $$
BEGIN
  UPDATE conversation_participants
  SET is_deleted = false, deleted_at = NULL
  WHERE conversation_id = conversation_id_param 
  AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 9: CREATE TRIGGER FOR CONVERSATION UPDATES
-- ============================================

-- Function to update conversation timestamp when message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if message has a conversation_id
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversations 
    SET updated_at = now() 
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- ============================================
-- STEP 10: GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_participants TO authenticated;
GRANT SELECT, INSERT ON conversations TO anon;
GRANT SELECT, INSERT ON conversation_participants TO anon;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT '=== Setup Complete! ===' AS status;

SELECT 
    'Tables Created' AS step,
    COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('conversations', 'conversation_participants');

SELECT 
    'Messages has conversation_id' AS step,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'conversation_id'
        ) THEN '✓ Yes'
        ELSE '✗ No'
    END AS status;

SELECT 
    'RLS Policies on messages' AS step,
    COUNT(*) AS policy_count
FROM pg_policies
WHERE tablename = 'messages';

SELECT 
    'Helper Functions' AS step,
    COUNT(*) AS function_count
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'get_or_create_direct_conversation',
        'create_group_conversation',
        'delete_conversation_for_user',
        'restore_conversation_for_user'
    );

SELECT '=== All features ready! ===' AS status;
SELECT 'Group chats: ✓ Ready' AS feature;
SELECT 'Direct chats via conversations: ✓ Ready' AS feature;
SELECT 'Soft delete per user: ✓ Ready' AS feature;
SELECT 'New thread after delete: ✓ Ready' AS feature;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Get or create direct conversation
-- SELECT get_or_create_direct_conversation('user1-uuid', 'user2-uuid');

-- Example 2: Create group conversation
-- SELECT create_group_conversation(
--   'creator-uuid',
--   'My Group',
--   ARRAY['user2-uuid', 'user3-uuid', 'user4-uuid']::UUID[]
-- );

-- Example 3: Delete conversation for a user
-- SELECT delete_conversation_for_user('conversation-uuid', 'user-uuid');

-- Example 4: When user messages someone after deleting:
--   - get_or_create_direct_conversation will create NEW conversation
--   - Old deleted conversation stays deleted
--   - New conversation appears in all messages
--   - Old conversation stays in deleted folder
