-- Add reply_to_id and reactions columns to messages table

-- Add reply_to_id column for message replies
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Add reactions column as JSONB array
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance on replies
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id);

-- Add index for reactions queries
CREATE INDEX IF NOT EXISTS idx_messages_reactions ON messages USING GIN (reactions);

-- Update RLS policies to allow reactions and reply updates
-- Users should be able to update reactions on any message in their matches
CREATE POLICY "Users can update reactions on messages in their matches"
ON messages FOR UPDATE
USING (
  match_id IN (
    SELECT id FROM matches
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
)
WITH CHECK (
  match_id IN (
    SELECT id FROM matches
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);

-- Comment for reference
COMMENT ON COLUMN messages.reply_to_id IS 'References the message this is replying to';
COMMENT ON COLUMN messages.reactions IS 'Array of reactions: [{userId, emoji, createdAt}]';
