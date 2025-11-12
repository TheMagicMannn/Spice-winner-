-- =====================================================
-- 🧪 TEST ACTUAL INSERT WITH REAL MATCH
-- =====================================================

-- Step 1: Show the actual matches
SELECT 
    '=== User Matches ===' AS step,
    id AS match_id,
    CASE 
        WHEN user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6' THEN 'user1'
        ELSE 'user2'
    END AS user_role,
    status
FROM matches
WHERE user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
    OR user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6';

-- Step 2: Try to insert with the first match
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
    
    RAISE NOTICE 'Attempting insert with match_id: %', test_match_id;
    
    BEGIN
        INSERT INTO messages (
            match_id,
            sender_id,
            content,
            message_type
        ) VALUES (
            test_match_id,
            '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6',
            'Test message from SQL',
            'text'
        ) RETURNING id INTO new_msg_id;
        
        RAISE NOTICE '✅ SUCCESS! Message ID: %', new_msg_id;
        RAISE NOTICE 'Database works! The 404 is NOT from the database.';
        RAISE NOTICE 'Issue is with Supabase REST API or frontend code.';
        
        -- Show the inserted message
        RAISE NOTICE 'Inserted message data:';
        FOR rec IN 
            SELECT * FROM messages WHERE id = new_msg_id
        LOOP
            RAISE NOTICE 'ID: %, match_id: %, sender_id: %, content: %', 
                rec.id, rec.match_id, rec.sender_id, rec.content;
        END LOOP;
        
        -- Clean up
        DELETE FROM messages WHERE id = new_msg_id;
        RAISE NOTICE 'Test message deleted.';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: %', SQLERRM;
        RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
        RAISE NOTICE 'This error is blocking inserts!';
    END;
END $$;

-- Step 3: Check what permissions authenticated role has
SELECT 
    '=== Authenticated Role Permissions ===' AS step,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'messages'
    AND grantee = 'authenticated'
ORDER BY privilege_type;
