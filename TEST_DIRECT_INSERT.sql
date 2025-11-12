-- =====================================================
-- 🧪 TEST DIRECT INSERT
-- =====================================================
-- Since RLS is disabled and still getting 404,
-- let's test if we can insert directly via SQL
-- =====================================================

-- Step 1: Check if table exists and is accessible
SELECT 
    '=== Table Exists Check ===' AS info;

SELECT 
    tablename,
    schemaname
FROM pg_tables
WHERE tablename = 'messages';

-- Step 2: Check for any triggers on messages table
SELECT 
    '=== Triggers on Messages Table ===' AS info;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'messages';

-- Step 3: Check for constraints
SELECT 
    '=== Constraints on Messages Table ===' AS info;

SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'messages'::regclass;

-- Step 4: Try a direct INSERT (this should work if RLS is disabled)
SELECT 
    '=== Attempting Direct Insert ===' AS info;

-- Get a real match_id and user_id for testing
DO $$
DECLARE
    test_match_id UUID;
    test_user_id UUID;
    new_message_id UUID;
BEGIN
    -- Get first match
    SELECT id INTO test_match_id
    FROM matches
    LIMIT 1;
    
    -- Get first user
    SELECT id INTO test_user_id
    FROM auth.users
    LIMIT 1;
    
    IF test_match_id IS NULL THEN
        RAISE NOTICE 'ERROR: No matches found in database!';
        RAISE NOTICE 'You need to create a match before sending messages.';
    ELSIF test_user_id IS NULL THEN
        RAISE NOTICE 'ERROR: No users found in database!';
    ELSE
        -- Try to insert a test message
        BEGIN
            INSERT INTO messages (
                match_id,
                sender_id,
                content,
                message_type
            ) VALUES (
                test_match_id,
                test_user_id,
                'Test message from SQL',
                'text'
            )
            RETURNING id INTO new_message_id;
            
            RAISE NOTICE 'SUCCESS: Direct insert worked! Message ID: %', new_message_id;
            RAISE NOTICE 'This means the table works fine.';
            RAISE NOTICE 'The problem is with the Supabase REST API or frontend.';
            
            -- Clean up test message
            DELETE FROM messages WHERE id = new_message_id;
            RAISE NOTICE 'Test message cleaned up.';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: Direct insert failed: %', SQLERRM;
            RAISE NOTICE 'This suggests a constraint or trigger issue.';
        END;
    END IF;
END $$;

-- =====================================================
-- INTERPRETATION:
-- =====================================================
-- If direct insert works:
--   → Table is fine
--   → Problem is with Supabase REST API or frontend
--   → Check if API is enabled for messages table
--   → Check what data frontend is sending
--
-- If direct insert fails:
--   → There's a constraint/trigger blocking inserts
--   → Check the error message
--   → Fix the constraint/trigger
--
-- If no matches found:
--   → You need to create a match first
--   → Messages require a valid match_id
-- =====================================================
