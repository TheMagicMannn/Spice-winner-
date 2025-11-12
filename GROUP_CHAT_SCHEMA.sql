-- Group Chat Schema for Spice App
-- This schema supports both 1-on-1 and group conversations

-- ============================================
-- 1. CONVERSATIONS TABLE (replaces match-based messaging)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type VARCHAR(20) NOT NULL CHECK (conversation_type IN ('direct', 'group')),
  group_name VARCHAR(100), -- Only for group chats
  group_photo TEXT, -- Only for group chats
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. CONVERSATION PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_admin BOOLEAN DEFAULT false, -- For group chat admins
  is_active BOOLEAN DEFAULT true, -- If user left the group
  last_read_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false, -- Soft delete for user
  deleted_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

-- ============================================
-- 3. UPDATE MESSAGES TABLE TO SUPPORT CONVERSATIONS
-- ============================================
-- Add conversation_id column to existing messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);

-- ============================================
-- 4. MIGRATION FUNCTION: Convert existing matches to conversations
-- ============================================
CREATE OR REPLACE FUNCTION migrate_matches_to_conversations()
RETURNS void AS $$
DECLARE
  match_record RECORD;
  new_conversation_id UUID;
BEGIN
  -- Loop through all matched conversations
  FOR match_record IN 
    SELECT id, user1_id, user2_id, matched_at 
    FROM matches 
    WHERE status = 'matched'
  LOOP
    -- Create a new conversation
    INSERT INTO conversations (conversation_type, created_at)
    VALUES ('direct', match_record.matched_at)
    RETURNING id INTO new_conversation_id;
    
    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id, joined_at, is_admin)
    VALUES 
      (new_conversation_id, match_record.user1_id, match_record.matched_at, true),
      (new_conversation_id, match_record.user2_id, match_record.matched_at, true);
    
    -- Update messages to link to new conversation
    UPDATE messages 
    SET conversation_id = new_conversation_id 
    WHERE match_id = match_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Get or create a direct conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Check if conversation already exists between these users
  SELECT c.id INTO existing_conversation_id
  FROM conversations c
  INNER JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = user1_id
  INNER JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = user2_id
  WHERE c.conversation_type = 'direct'
    AND cp1.is_active = true
    AND cp2.is_active = true
  LIMIT 1;
  
  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO conversations (conversation_type, created_by)
  VALUES ('direct', user1_id)
  RETURNING id INTO new_conversation_id;
  
  -- Add both users as participants
  INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
  VALUES 
    (new_conversation_id, user1_id, true),
    (new_conversation_id, user2_id, true);
  
  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Create a new group conversation
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
$$ LANGUAGE plpgsql;

-- Add user to group conversation
CREATE OR REPLACE FUNCTION add_user_to_group(
  conversation_id_param UUID,
  user_id_param UUID
)
RETURNS void AS $$
BEGIN
  INSERT INTO conversation_participants (conversation_id, user_id, is_admin, is_active)
  VALUES (conversation_id_param, user_id_param, false, true)
  ON CONFLICT (conversation_id, user_id) 
  DO UPDATE SET is_active = true, joined_at = now();
END;
$$ LANGUAGE plpgsql;

-- Remove user from group conversation
CREATE OR REPLACE FUNCTION remove_user_from_group(
  conversation_id_param UUID,
  user_id_param UUID
)
RETURNS void AS $$
BEGIN
  UPDATE conversation_participants
  SET is_active = false
  WHERE conversation_id = conversation_id_param AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can see conversations they're part of
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Conversations: Users can create conversations
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Conversations: Admins can update group conversations
CREATE POLICY "Admins can update group conversations"
ON conversations FOR UPDATE
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Participants: Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants"
ON conversation_participants FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Participants: Admins can add participants to groups
CREATE POLICY "Admins can add participants"
ON conversation_participants FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Participants: Admins can update participants
CREATE POLICY "Admins can update participants"
ON conversation_participants FOR UPDATE
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Participants: Users can update their own participant record
CREATE POLICY "Users can update their own participant record"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- ============================================
-- NOTES FOR IMPLEMENTATION:
-- ============================================
-- 1. Run this schema in Supabase SQL Editor
-- 2. Optionally run: SELECT migrate_matches_to_conversations(); to migrate existing data
-- 3. Update frontend to use conversation_id instead of match_id
-- 4. Keep match_id column for backward compatibility during migration
