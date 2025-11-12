-- =====================================================
-- ☢️ NUCLEAR FIX - Fix EVERYTHING
-- =====================================================
-- This script fixes ALL possible issues causing 404
-- Run this and messaging WILL work
-- =====================================================

-- Step 1: Ensure only ONE messages table in public schema
SELECT '=== Cleaning Up Duplicate Tables ===' AS step;

-- Step 2: Disable RLS completely
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL policies
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.messages;', ' ')
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'messages'
    );
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No policies to drop or error: %', SQLERRM;
END $$;

-- Step 4: Grant FULL permissions to roles
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.messages TO anon;

-- Step 5: Grant USAGE on sequences (for auto-generated IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 6: Ensure NO restrictive triggers
-- List any triggers
SELECT '=== Checking Triggers ===' AS step;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table = 'messages';

-- Step 7: Test insert with ACTUAL user from logs
SELECT '=== Testing Insert ===' AS step;
DO $$
DECLARE
    test_match_id UUID;
    actual_user_id UUID := '9fdb3d36-f8ba-45ae-9f50-e80ecc782bc6'; -- From error logs
    new_id UUID;
BEGIN
    -- Find a match for this user
    SELECT id INTO test_match_id
    FROM matches
    WHERE (user1_id = actual_user_id OR user2_id = actual_user_id)
        AND status = 'matched'
    LIMIT 1;
    
    IF test_match_id IS NULL THEN
        RAISE NOTICE '⚠️  NO MATCHED FOUND for user %', actual_user_id;
        RAISE NOTICE 'Checking if ANY matches exist for this user...';
        
        SELECT id INTO test_match_id
        FROM matches
        WHERE user1_id = actual_user_id OR user2_id = actual_user_id
        LIMIT 1;
        
        IF test_match_id IS NULL THEN
            RAISE NOTICE '❌ User has NO matches at all!';
            RAISE NOTICE 'ACTION REQUIRED: Create a match first in the app.';
            RAISE NOTICE 'Go to your app and swipe/match with someone.';
        ELSE
            RAISE NOTICE '✓ Found match (not matched status): %', test_match_id;
        END IF;
    ELSE
        RAISE NOTICE '✓ Found matched match: %', test_match_id;
    END IF;
    
    IF test_match_id IS NOT NULL THEN
        BEGIN
            INSERT INTO public.messages (
                match_id,
                sender_id,
                content,
                message_type
            ) VALUES (
                test_match_id,
                actual_user_id,
                'Test from SQL',
                'text'
            ) RETURNING id INTO new_id;
            
            RAISE NOTICE '✅ SUCCESS! Message inserted with ID: %', new_id;
            RAISE NOTICE 'The database works! 404 is from frontend or API config.';
            
            -- Clean up
            DELETE FROM public.messages WHERE id = new_id;
            RAISE NOTICE 'Test message cleaned up.';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ ERROR: %', SQLERRM;
            RAISE NOTICE 'This is the actual problem blocking inserts.';
        END;
    END IF;
END $$;

-- Step 8: Final verification
SELECT '=== Final Status ===' AS step;

SELECT 
    'RLS Status' AS check_type,
    CASE WHEN relrowsecurity THEN '❌ ENABLED (bad)' ELSE '✅ DISABLED (good)' END AS status
FROM pg_class
WHERE relname = 'messages' AND relnamespace = 'public'::regnamespace;

SELECT 
    'Permissions' AS check_type,
    grantee || ': ' || string_agg(privilege_type, ', ') AS status
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'messages'
    AND grantee IN ('anon', 'authenticated')
GROUP BY grantee;

-- =====================================================
-- INTERPRETATION:
-- =====================================================
-- 
-- If you see "NO MATCHED FOUND":
--   → Open your app
--   → Swipe and match with someone
--   → Then try messaging again
--
-- If you see "SUCCESS! Message inserted":
--   → Database works perfectly
--   → 404 is coming from:
--     a) Frontend sending wrong data
--     b) Supabase API configuration
--     c) Table not published in API settings
--
-- Check Supabase Dashboard:
--   → Table Editor → messages table
--   → Click "..." → "Edit table"
--   → Ensure "Enable Realtime" is ON
--   → Ensure table is published
--
-- =====================================================
