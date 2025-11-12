-- =====================================================
-- 🧪 SIMPLE INSERT TEST (No Loops!)
-- =====================================================

-- Show the matches first
SELECT 
    id AS match_id,
    user1_id,
    user2_id,
    status
FROM matches
WHERE user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
    OR user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
LIMIT 2;

-- Now test insert
DO $$
DECLARE
    test_match_id UUID;
    new_msg_id UUID;
BEGIN
    -- Get first match
    SELECT id INTO test_match_id
    FROM matches
    WHERE user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
        OR user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
    LIMIT 1;
    
    RAISE NOTICE 'Using match_id: %', test_match_id;
    
    -- Try insert
    BEGIN
        INSERT INTO messages (
            match_id,
            sender_id,
            content,
            message_type
        ) VALUES (
            test_match_id,
            '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6',
            'Test from SQL',
            'text'
        ) RETURNING id INTO new_msg_id;
        
        RAISE NOTICE '✅ SUCCESS! Message inserted with ID: %', new_msg_id;
        RAISE NOTICE 'Database works perfectly!';
        RAISE NOTICE 'The 404 is from Supabase API settings or frontend.';
        
        -- Clean up
        DELETE FROM messages WHERE id = new_msg_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ INSERT FAILED!';
        RAISE NOTICE 'Error: %', SQLERRM;
        RAISE NOTICE 'Code: %', SQLSTATE;
    END;
END $$;

-- Check permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'messages'
    AND grantee IN ('authenticated', 'anon')
ORDER BY grantee, privilege_type;
