-- Fix Messages Table Constraint
-- This allows messages to belong to either a match (direct chat) OR a conversation (group chat)
-- One of them must be non-null, but not both

-- Drop existing constraint if it exists
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_match_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS check_match_or_conversation;

-- Make match_id nullable (it already should be, but ensuring it)
ALTER TABLE messages ALTER COLUMN match_id DROP NOT NULL;

-- Add constraint: at least one of match_id or conversation_id must be non-null
ALTER TABLE messages ADD CONSTRAINT check_match_or_conversation 
  CHECK (
    (match_id IS NOT NULL AND conversation_id IS NULL) OR 
    (conversation_id IS NOT NULL AND match_id IS NULL)
  );

-- Re-add foreign key constraints with ON DELETE CASCADE
ALTER TABLE messages ADD CONSTRAINT messages_match_id_fkey 
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey 
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id) WHERE match_id IS NOT NULL;

-- Update typing_indicators to support conversation_id
ALTER TABLE typing_indicators ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
ALTER TABLE typing_indicators DROP CONSTRAINT IF EXISTS typing_indicators_match_id_fkey;
ALTER TABLE typing_indicators ALTER COLUMN match_id DROP NOT NULL;

-- Add constraint for typing_indicators: at least one of match_id or conversation_id must be non-null
ALTER TABLE typing_indicators ADD CONSTRAINT check_typing_match_or_conversation 
  CHECK (
    (match_id IS NOT NULL AND conversation_id IS NULL) OR 
    (conversation_id IS NOT NULL AND match_id IS NULL)
  );

ALTER TABLE typing_indicators ADD CONSTRAINT typing_indicators_match_id_fkey 
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

-- Create index for typing indicators
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON typing_indicators(conversation_id) WHERE conversation_id IS NOT NULL;
