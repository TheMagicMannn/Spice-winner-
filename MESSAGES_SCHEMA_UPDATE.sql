-- =====================================================
-- MESSAGES TABLE SCHEMA UPDATE
-- Add support for media, self-destruct, and typing indicators
-- =====================================================

-- Drop the old CHECK constraint on message_type
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_message_type_check;

-- Add new CHECK constraint with updated message types
ALTER TABLE messages ADD CONSTRAINT messages_message_type_check 
  CHECK (message_type IN ('text', 'image', 'video', 'voice', 'gif'));

-- Add new columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS self_destruct_seconds INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

-- Enable RLS on typing_indicators
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their typing indicators" ON typing_indicators;

-- Create policy for typing indicators
CREATE POLICY "Users can manage their typing indicators"
    ON typing_indicators FOR ALL
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = typing_indicators.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_typing_indicators_match_id ON typing_indicators(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON messages(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to auto-delete expired media messages
CREATE OR REPLACE FUNCTION delete_expired_media()
RETURNS void AS $$
BEGIN
    UPDATE messages
    SET is_deleted = TRUE, deleted_at = NOW()
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW()
    AND is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark message as viewed and set expiration
CREATE OR REPLACE FUNCTION mark_media_viewed(message_id UUID)
RETURNS void AS $$
DECLARE
    msg RECORD;
BEGIN
    SELECT * INTO msg FROM messages WHERE id = message_id;
    
    IF msg.first_viewed_at IS NULL AND msg.self_destruct_seconds IS NOT NULL THEN
        UPDATE messages
        SET 
            first_viewed_at = NOW(),
            expires_at = NOW() + (msg.self_destruct_seconds || ' seconds')::INTERVAL
        WHERE id = message_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE typing_indicators IS 'Tracks real-time typing status in conversations';
COMMENT ON FUNCTION delete_expired_media() IS 'Soft deletes messages that have expired based on self-destruct timer';
COMMENT ON FUNCTION mark_media_viewed(UUID) IS 'Marks media as viewed and calculates expiration time';

-- Verify installation
DO $$
BEGIN
    RAISE NOTICE 'Messages schema update completed successfully!';
    RAISE NOTICE 'Added columns: media_url, self_destruct_seconds, first_viewed_at, expires_at, is_deleted, deleted_at';
    RAISE NOTICE 'Created table: typing_indicators';
    RAISE NOTICE 'Created functions: mark_media_viewed(), delete_expired_media()';
END $$;
