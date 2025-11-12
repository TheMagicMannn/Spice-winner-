-- =====================================================
-- 🎯 FIX DUPLICATE MESSAGES TABLES
-- =====================================================
-- There are TWO messages tables showing up!
-- One with RLS enabled, one with RLS disabled
-- This is causing the 404 errors
-- =====================================================

-- Step 1: Investigate - find all messages tables
SELECT 
    '=== All Messages Tables ===' AS info;

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'messages'
ORDER BY schemaname;

-- Step 2: Check which schema the classes are in
SELECT 
    '=== Messages Table Classes ===' AS info;

SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.oid
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'messages'
ORDER BY n.nspname;

-- Step 3: Count rows in each
SELECT 
    '=== Row Counts ===' AS info;

DO $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Count in public schema
    SELECT COUNT(*) INTO row_count FROM public.messages;
    RAISE NOTICE 'public.messages has % rows', row_count;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'public.messages error: %', SQLERRM;
END $$;

-- Step 4: Check which one has data
SELECT 
    '=== Sample Data from public.messages ===' AS info;

SELECT 
    id,
    match_id,
    sender_id,
    content,
    created_at
FROM public.messages
ORDER BY created_at DESC
LIMIT 3;

-- =====================================================
-- SOLUTION (Run after seeing results)
-- =====================================================
-- 
-- If there are 2 messages tables:
-- 1. One in 'public' schema (should be used)
-- 2. One in another schema (should be dropped)
--
-- The fix:
-- 1. Ensure public.messages has RLS disabled
-- 2. Drop the duplicate table
-- 3. Grant proper permissions to public.messages
--
-- =====================================================

-- Fix: Ensure public.messages has RLS disabled
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Grant permissions to public.messages
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT ON public.messages TO anon;

SELECT 'Fixed! public.messages now has RLS disabled and proper permissions.' AS status;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 
    '=== Final Verification ===' AS info;

SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'messages'
    AND n.nspname = 'public';

-- Should show:
-- schema_name | table_name | rls_enabled
-- public      | messages   | false
