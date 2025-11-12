-- =====================================================
-- STEP 1: DATABASE SCHEMA SETUP
-- =====================================================
-- Run this FIRST before the RLS policy fix
-- This ensures all required tables and columns exist
-- =====================================================

-- Check current status
DO $$ 
BEGIN
    RAISE NOTICE '=== Checking Database Schema ===';
END $$;

-- ============================================
-- 1. CREATE CONVERSATIONS TABLE (if not exists)
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

-- ============================================
-- 2. CREATE CONVERSATION PARTICIPANTS TABLE (if not exists)
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

-- ============================================
-- 3. ADD CONVERSATION_ID COLUMN TO MESSAGES TABLE
-- ============================================
-- This is the critical column needed for group chat support
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);

-- ============================================
-- 5. ENABLE RLS ON NEW TABLES
-- ============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE BASIC RLS POLICIES FOR CONVERSATIONS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can update group conversations" ON conversations;

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

-- ============================================
-- 7. CREATE RLS POLICIES FOR CONVERSATION PARTICIPANTS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;

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
  OR
  -- Allow adding yourself to a conversation when it's first created
  user_id = auth.uid()
);

-- Participants: Users can update their own participant record
CREATE POLICY "Users can update their own participant record"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- 8. CREATE HELPER FUNCTIONS
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================

-- Verify tables exist
DO $$ 
BEGIN
    RAISE NOTICE '=== Verification ===';
    
    -- Check conversations table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        RAISE NOTICE '✓ conversations table exists';
    ELSE
        RAISE NOTICE '✗ conversations table MISSING';
    END IF;
    
    -- Check conversation_participants table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        RAISE NOTICE '✓ conversation_participants table exists';
    ELSE
        RAISE NOTICE '✗ conversation_participants table MISSING';
    END IF;
    
    -- Check conversation_id column in messages
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'conversation_id'
    ) THEN
        RAISE NOTICE '✓ messages.conversation_id column exists';
    ELSE
        RAISE NOTICE '✗ messages.conversation_id column MISSING';
    END IF;
    
    RAISE NOTICE '=== Setup Complete ===';
    RAISE NOTICE 'Next step: Run STEP_2_FIX_RLS_POLICIES.sql';
END $$;

-- =====================================================
-- NOTES:
-- =====================================================
-- After running this script successfully:
-- 1. You should see all checkmarks (✓) in the verification output
-- 2. The conversations and conversation_participants tables are created
-- 3. The messages table now has a conversation_id column
-- 4. Helper functions are available for creating conversations
-- 5. Basic RLS policies are in place
--
-- Next: Run the FIX_GROUP_CHAT_RLS_POLICIES.sql script to update messages RLS
-- =====================================================
