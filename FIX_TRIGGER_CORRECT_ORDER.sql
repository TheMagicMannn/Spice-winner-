-- =====================================================
-- 🔧 FIX TRIGGER - Correct Order
-- =====================================================

-- Drop trigger FIRST (before function)
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;

-- Now drop the function (with CASCADE just in case)
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;

-- Success message
SELECT 'All triggers dropped! Try sending a message now.' AS status;

-- Verify no broken triggers remain
SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table = 'messages';
