-- ============================================
-- CONVERSATION MANAGEMENT SCHEMA UPDATE
-- Adds support for pinning and deleting conversations
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create conversation_settings table
CREATE TABLE IF NOT EXISTS conversation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    pinned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- Step 2: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_settings_user_id 
ON conversation_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_settings_match_id 
ON conversation_settings(match_id);

CREATE INDEX IF NOT EXISTS idx_conversation_settings_pinned 
ON conversation_settings(user_id, is_pinned) 
WHERE is_pinned = true;

CREATE INDEX IF NOT EXISTS idx_conversation_settings_deleted 
ON conversation_settings(user_id, is_deleted) 
WHERE is_deleted = true;

-- Step 3: Enable RLS
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversation_settings' 
        AND policyname = 'Users can view their own conversation settings'
    ) THEN
        DROP POLICY "Users can view their own conversation settings" ON conversation_settings;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversation_settings' 
        AND policyname = 'Users can insert their own conversation settings'
    ) THEN
        DROP POLICY "Users can insert their own conversation settings" ON conversation_settings;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversation_settings' 
        AND policyname = 'Users can update their own conversation settings'
    ) THEN
        DROP POLICY "Users can update their own conversation settings" ON conversation_settings;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversation_settings' 
        AND policyname = 'Users can delete their own conversation settings'
    ) THEN
        DROP POLICY "Users can delete their own conversation settings" ON conversation_settings;
    END IF;
END $$;

-- Step 5: Create RLS policies
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

-- Step 6: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_conversation_settings_updated_at ON conversation_settings;
CREATE TRIGGER trigger_update_conversation_settings_updated_at
    BEFORE UPDATE ON conversation_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_settings_updated_at();

-- Step 8: Add comments
COMMENT ON TABLE conversation_settings IS 'Stores user-specific conversation settings like pin and delete status';
COMMENT ON COLUMN conversation_settings.is_pinned IS 'Whether the conversation is pinned by this user';
COMMENT ON COLUMN conversation_settings.is_deleted IS 'Whether the conversation is deleted by this user (soft delete)';
COMMENT ON COLUMN conversation_settings.deleted_at IS 'When the conversation was deleted by this user';
COMMENT ON COLUMN conversation_settings.pinned_at IS 'When the conversation was pinned by this user';

-- Step 9: Verify the setup
DO $$
DECLARE
    table_exists BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'conversation_settings'
    ) INTO table_exists;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'conversation_settings';
    
    IF table_exists AND policy_count = 4 THEN
        RAISE NOTICE '✅ SUCCESS: Conversation settings table created!';
        RAISE NOTICE '✅ Table: conversation_settings EXISTS';
        RAISE NOTICE '✅ RLS Policies: % created', policy_count;
        RAISE NOTICE '✅ You can now pin and delete conversations';
    ELSE
        RAISE WARNING '⚠️ Setup incomplete. Table exists: %, Policies: %', table_exists, policy_count;
    END IF;
END $$;
