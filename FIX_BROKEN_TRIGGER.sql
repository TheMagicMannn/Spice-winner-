-- =====================================================
-- 🎯 FIX: Drop Broken Trigger
-- =====================================================
-- The messages table has a trigger that tries to update
-- the conversations table, which we deleted!
-- This is causing all INSERTs to fail!
-- =====================================================

-- Drop the broken trigger
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;

-- Drop the broken function
DROP FUNCTION IF EXISTS update_conversation_timestamp();

-- Verify it's gone
SELECT 
    'Trigger dropped! Try inserting a message now.' AS status;

-- Show remaining triggers (should be none that reference conversations)
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table = 'messages';
