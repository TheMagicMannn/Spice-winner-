-- =====================================================
-- FIX: Typing Indicators Upsert Support
-- =====================================================
-- Enable proper UPSERT by ensuring we have the right
-- unique constraints (not just partial indexes)
-- =====================================================

-- Drop existing partial indexes
DROP INDEX IF EXISTS typing_match_user_unique;
DROP INDEX IF EXISTS typing_conversation_user_unique;

-- Drop existing constraint
ALTER TABLE typing_indicators DROP CONSTRAINT IF EXISTS typing_match_user_unique;

-- Create a composite unique constraint that includes the NULL check
-- This allows UPSERT to work properly
CREATE UNIQUE INDEX typing_match_user_unique
    ON typing_indicators (match_id, user_id)
    WHERE match_id IS NOT NULL;

CREATE UNIQUE INDEX typing_conversation_user_unique
    ON typing_indicators (conversation_id, user_id)
    WHERE conversation_id IS NOT NULL;

-- Also ensure id column has a default (for upsert fallback to work)
ALTER TABLE typing_indicators ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- =====================================================
-- Verify setup
-- =====================================================
-- Test query (should work without errors):
-- INSERT INTO typing_indicators (match_id, user_id, is_typing, updated_at)
-- VALUES ('some-uuid', 'some-user-uuid', true, NOW())
-- ON CONFLICT (match_id, user_id) WHERE match_id IS NOT NULL
-- DO UPDATE SET is_typing = EXCLUDED.is_typing, updated_at = EXCLUDED.updated_at;
-- =====================================================
