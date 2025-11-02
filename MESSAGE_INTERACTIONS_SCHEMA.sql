-- ============================================
-- MESSAGE INTERACTIONS SCHEMA UPDATE
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Add columns if they don't exist
DO $$ 
BEGIN
    -- Add reply_to_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'reply_to_id'
    ) THEN
        ALTER TABLE messages 
        ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added reply_to_id column';
    ELSE
        RAISE NOTICE 'reply_to_id column already exists';
    END IF;

    -- Add reactions column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'reactions'
    ) THEN
        ALTER TABLE messages 
        ADD COLUMN reactions JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Added reactions column';
    ELSE
        RAISE NOTICE 'reactions column already exists';
    END IF;
END $$;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id 
ON messages(reply_to_id) 
WHERE reply_to_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_reactions 
ON messages USING GIN (reactions) 
WHERE reactions != '[]'::jsonb;

-- Step 3: Drop existing policy if it exists and recreate
DO $$
BEGIN
    -- Drop the policy if it exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
        AND policyname = 'Users can update reactions on messages in their matches'
    ) THEN
        DROP POLICY "Users can update reactions on messages in their matches" ON messages;
        RAISE NOTICE 'Dropped existing reaction update policy';
    END IF;
END $$;

-- Create policy for updating reactions
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

-- Step 4: Add comments for documentation
COMMENT ON COLUMN messages.reply_to_id IS 'References the message this is replying to';
COMMENT ON COLUMN messages.reactions IS 'Array of reactions: [{userId, emoji, createdAt}]';

-- Step 5: Verify the changes
DO $$
DECLARE
    reply_exists BOOLEAN;
    reactions_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'reply_to_id'
    ) INTO reply_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'reactions'
    ) INTO reactions_exists;
    
    IF reply_exists AND reactions_exists THEN
        RAISE NOTICE '✅ SUCCESS: All columns created successfully!';
        RAISE NOTICE '✅ reply_to_id column: EXISTS';
        RAISE NOTICE '✅ reactions column: EXISTS';
        RAISE NOTICE '✅ You can now use message interactions (copy, reply, unsend, react)';
    ELSE
        RAISE WARNING '⚠️ Some columns may be missing. Please check manually.';
    END IF;
END $$;
