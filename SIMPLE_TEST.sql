-- =====================================================
-- ✅ SIMPLE TEST - Just Answer These Questions
-- =====================================================

-- Question 1: Does this user have any matches?
SELECT '=== Question 1: Does user have matches? ===' AS question;
SELECT 
    COUNT(*) AS match_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ NO MATCHES - This is why messaging fails!'
        ELSE '✅ Has matches - messaging should work'
    END AS status
FROM matches
WHERE user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
    OR user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6';

-- Question 2: Show the actual matches
SELECT '=== Question 2: Show actual matches ===' AS question;
SELECT 
    id AS match_id,
    user1_id,
    user2_id,
    status,
    matched_at
FROM matches
WHERE user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
    OR user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
LIMIT 5;

-- Question 3: Can we insert a message?
SELECT '=== Question 3: Can we insert a message? ===' AS question;
DO $$
DECLARE
    first_match UUID;
    new_msg_id UUID;
BEGIN
    -- Get first match
    SELECT id INTO first_match
    FROM matches
    WHERE user1_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
        OR user2_id = '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'
    LIMIT 1;
    
    IF first_match IS NULL THEN
        RAISE NOTICE '❌ ANSWER: No matches exist. User needs to match with someone first!';
    ELSE
        RAISE NOTICE 'Using match_id: %', first_match;
        
        BEGIN
            INSERT INTO messages (
                match_id,
                sender_id,
                content,
                message_type
            ) VALUES (
                first_match,
                '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6',
                'Test',
                'text'
            ) RETURNING id INTO new_msg_id;
            
            RAISE NOTICE '✅ ANSWER: YES! Message inserted successfully with ID: %', new_msg_id;
            RAISE NOTICE 'Database works fine. The 404 is from frontend or API settings.';
            
            DELETE FROM messages WHERE id = new_msg_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ ANSWER: NO! Error: %', SQLERRM;
            RAISE NOTICE 'This error is blocking message inserts.';
        END;
    END IF;
END $$;

-- Question 4: Is RLS the problem?
SELECT '=== Question 4: Is RLS enabled? ===' AS question;
SELECT 
    CASE 
        WHEN relrowsecurity = true THEN '❌ YES - RLS is ON (problem!)'
        ELSE '✅ NO - RLS is OFF (good!)'
    END AS answer
FROM pg_class
WHERE relname = 'messages'
    AND relnamespace = 'public'::regnamespace;

-- Question 5: Do roles have permissions?
SELECT '=== Question 5: Do roles have INSERT permission? ===' AS question;
SELECT 
    grantee,
    CASE 
        WHEN string_agg(privilege_type, ',') LIKE '%INSERT%' THEN '✅ YES'
        ELSE '❌ NO - Missing INSERT permission!'
    END AS has_insert
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'messages'
    AND grantee IN ('anon', 'authenticated')
GROUP BY grantee;
