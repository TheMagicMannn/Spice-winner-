-- ============================================
-- COMPLETE SUPABASE DATABASE SETUP
-- For Spice App - Comprehensive Schema
-- Run this entire file in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type VARCHAR(20) NOT NULL CHECK (conversation_type IN ('direct', 'group')),
  group_name VARCHAR(100),
  group_photo TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);

-- ============================================
-- 2. CONVERSATION PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_read_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_active ON conversation_participants(user_id, is_active) WHERE is_active = true;

-- ============================================
-- 3. MESSAGES TABLE (Create or Update)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text',
  media_url TEXT,
  self_destruct_seconds INTEGER,
  first_viewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  reactions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (match_id IS NOT NULL OR conversation_id IS NOT NULL)
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS self_destruct_seconds INTEGER;
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMPTZ;
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID;
  ALTER TABLE messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::jsonb;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Drop old constraint if exists and add new one
DO $$
BEGIN
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
  ALTER TABLE messages ADD CONSTRAINT messages_message_type_check 
    CHECK (message_type IN ('text', 'image', 'video', 'voice', 'gif'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add foreign key for reply_to_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_reply_to_id_fkey'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_reply_to_id_fkey 
      FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON messages(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- ============================================
-- 4. TYPING INDICATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, user_id),
  UNIQUE(conversation_id, user_id)
);

-- Add conversation_id column if not exists
DO $$
BEGIN
  ALTER TABLE typing_indicators ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_typing_indicators_match_id ON typing_indicators(match_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);

-- ============================================
-- 5. CONVERSATION SETTINGS TABLE (for match-based backwards compatibility)
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  pinned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conversation_settings_user_id ON conversation_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_settings_match_id ON conversation_settings(match_id);

-- ============================================
-- 6. DATABASE FUNCTIONS
-- ============================================

-- Function: Get or create direct conversation
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Check if active conversation exists between these users
  SELECT c.id INTO existing_conversation_id
  FROM conversations c
  INNER JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = user1_id
  INNER JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = user2_id
  WHERE c.conversation_type = 'direct'
    AND cp1.is_active = true
    AND cp1.is_deleted = false
    AND cp2.is_active = true
    AND cp2.is_deleted = false
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create group conversation
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

-- Function: Delete conversation for user
CREATE OR REPLACE FUNCTION delete_conversation_for_user(
  conversation_id_param UUID,
  user_id_param UUID
)
RETURNS void AS $$
BEGIN
  UPDATE conversation_participants
  SET is_deleted = true, deleted_at = now()
  WHERE conversation_id = conversation_id_param AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Restore conversation for user
CREATE OR REPLACE FUNCTION restore_conversation_for_user(
  conversation_id_param UUID,
  user_id_param UUID
)
RETURNS void AS $$
BEGIN
  UPDATE conversation_participants
  SET is_deleted = false, deleted_at = NULL
  WHERE conversation_id = conversation_id_param AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark media as viewed
CREATE OR REPLACE FUNCTION mark_media_viewed(message_id UUID)
RETURNS void AS $$
DECLARE
  msg RECORD;
BEGIN
  SELECT * INTO msg FROM messages WHERE id = message_id;
  
  IF msg.first_viewed_at IS NULL AND msg.self_destruct_seconds IS NOT NULL THEN
    UPDATE messages
    SET 
      first_viewed_at = now(),
      expires_at = now() + (msg.self_destruct_seconds || ' seconds')::INTERVAL
    WHERE id = message_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete expired media
CREATE OR REPLACE FUNCTION delete_expired_media()
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET is_deleted = true, deleted_at = now()
  WHERE expires_at IS NOT NULL 
    AND expires_at < now()
    AND is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger: Update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversations 
    SET updated_at = now() 
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Trigger: Update conversation_settings timestamp
CREATE OR REPLACE FUNCTION update_conversation_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_settings_updated_at ON conversation_settings;
CREATE TRIGGER trigger_update_conversation_settings_updated_at
BEFORE UPDATE ON conversation_settings
FOR EACH ROW
EXECUTE FUNCTION update_conversation_settings_updated_at();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can update group conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can update participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can manage their typing indicators" ON typing_indicators;
DROP POLICY IF EXISTS "Users can view typing indicators in their conversations" ON typing_indicators;
DROP POLICY IF EXISTS "Users can view their own conversation settings" ON conversation_settings;
DROP POLICY IF EXISTS "Users can insert their own conversation settings" ON conversation_settings;
DROP POLICY IF EXISTS "Users can update their own conversation settings" ON conversation_settings;
DROP POLICY IF EXISTS "Users can delete their own conversation settings" ON conversation_settings;

-- CONVERSATIONS POLICIES
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_active = true AND is_deleted = false
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

-- CONVERSATION PARTICIPANTS POLICIES
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
);

CREATE POLICY "Admins can update participants"
ON conversation_participants FOR UPDATE
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can update their own participant record"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- MESSAGES POLICIES
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  (conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid() AND is_active = true
  ))
  OR
  (match_id IN (
    SELECT id FROM matches 
    WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'matched'
  ))
);

CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND (
    (conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    ))
    OR
    (match_id IN (
      SELECT id FROM matches 
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
        AND status = 'matched'
    ))
  )
);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
USING (sender_id = auth.uid());

-- TYPING INDICATORS POLICIES
CREATE POLICY "Users can manage their typing indicators"
ON typing_indicators FOR ALL
USING (
  user_id = auth.uid()
  OR conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
  OR match_id IN (
    SELECT id FROM matches 
    WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- CONVERSATION SETTINGS POLICIES (for match-based)
CREATE POLICY "Users can view their own conversation settings"
ON conversation_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation settings"
ON conversation_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation settings"
ON conversation_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation settings"
ON conversation_settings FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 9. VERIFICATION & SUCCESS MESSAGE
-- ============================================
DO $$
DECLARE
  conversations_exists BOOLEAN;
  participants_exists BOOLEAN;
  messages_exists BOOLEAN;
  function_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Check tables
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'conversations'
  ) INTO conversations_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'conversation_participants'
  ) INTO participants_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'messages'
  ) INTO messages_exists;
  
  -- Count functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc 
  WHERE proname IN (
    'get_or_create_direct_conversation',
    'create_group_conversation',
    'delete_conversation_for_user',
    'restore_conversation_for_user',
    'mark_media_viewed',
    'delete_expired_media'
  );
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'typing_indicators', 'conversation_settings');
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables Status:';
  RAISE NOTICE '   - conversations: %', CASE WHEN conversations_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   - conversation_participants: %', CASE WHEN participants_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '   - messages: %', CASE WHEN messages_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  Functions Created: % of 6', function_count;
  RAISE NOTICE '🔒 RLS Policies Active: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '🚀 Your app is ready to use!';
  RAISE NOTICE '==============================================';
END $$;
