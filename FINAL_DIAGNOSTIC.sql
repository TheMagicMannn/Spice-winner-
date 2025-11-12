-- =====================================================
-- 🔬 FINAL COMPREHENSIVE DIAGNOSTIC
-- =====================================================
-- Let's check EVERYTHING about the messages table
-- =====================================================

-- 1. Confirm table exists and schema
SELECT '=== Table Location ===' AS step;
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables
WHERE tablename = 'messages';

-- 2. Check RLS status
SELECT '=== RLS Status ===' AS step;
SELECT 
    n.nspname AS schema,
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'messages'
    AND n.nspname = 'public';

-- 3. Check permissions
SELECT '=== Permissions ===' AS step;
SELECT 
    grantee,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'messages'
    AND grantee IN ('anon', 'authenticated', 'postgres', 'service_role')
GROUP BY grantee
ORDER BY grantee;

-- 4. Check policies (should be none if RLS disabled)
SELECT '=== Active Policies ===' AS step;
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'messages';

-- 5. Check constraints
SELECT '=== Constraints ===' AS step;
SELECT 
    conname AS constraint_name,
    contype AS type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.messages'::regclass
ORDER BY contype, conname;

-- 6. Try minimal insert
SELECT '=== Testing Insert ===' AS step;
DO $$
DECLARE
    test_match_id UUID;
    test_user_id UUID := '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'; -- The actual user from logs
    new_id UUID;
BEGIN
    -- Get any match
    SELECT id INTO test_match_id
    FROM matches
    WHERE user1_id = test_user_id OR user2_id = test_user_id
    LIMIT 1;
    
    IF test_match_id IS NULL THEN
        RAISE NOTICE 'ERROR: User % has no matches!', test_user_id;
        RAISE NOTICE 'Create a match first before sending messages.';
    ELSE
        RAISE NOTICE 'Found match: %', test_match_id;
        
        -- Try minimal insert
        BEGIN
            INSERT INTO public.messages (
                match_id,
                sender_id,
                content,
                message_type
            ) VALUES (
                test_match_id,
                test_user_id,
                'SQL test message',
                'text'
            ) RETURNING id INTO new_id;
            
            RAISE NOTICE 'SUCCESS! Inserted message ID: %', new_id;
            RAISE NOTICE 'The table works! Issue is with API or frontend.';
            
            -- Cleanup
            DELETE FROM public.messages WHERE id = new_id;
            RAISE NOTICE 'Test message deleted.';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR inserting: %', SQLERRM;
        END;
    END IF;
END $$;

-- 7. Check if API is published
SELECT '=== Table in API Schema ===' AS step;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'messages'
        ) THEN 'Table exists in public schema ✓'
        ELSE 'Table NOT in public schema ✗'
    END AS api_status;

-- =====================================================
-- NEXT STEPS BASED ON RESULTS:
-- =====================================================
-- 
-- If "User has no matches":
--   → You need to create a match before messaging
--
-- If "ERROR inserting":
--   → Check the error message
--   → Might be constraint violation
--
-- If "SUCCESS! Inserted":
--   → Table works fine in SQL
--   → Problem is frontend sending wrong data
--   → Need to check browser console/network tab
--
-- If permissions are missing:
--   → Run: GRANT ALL ON public.messages TO authenticated;
--   → Run: GRANT SELECT, INSERT ON public.messages TO anon;
--
-- =====================================================
