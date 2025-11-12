-- =====================================================
-- 🔍 CHECK IF SUPABASE API IS ENABLED
-- =====================================================
-- 404 errors can happen if the table isn't exposed via API
-- Let's check the API configuration
-- =====================================================

-- Check if table is in public schema (required for API access)
SELECT 
    '=== Schema Check ===' AS info;

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'messages';

-- Check table permissions for anon and authenticated roles
SELECT 
    '=== Table Permissions ===' AS info;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'messages'
    AND grantee IN ('anon', 'authenticated', 'postgres')
ORDER BY grantee, privilege_type;

-- Check if RLS is actually disabled
SELECT 
    '=== RLS Status ===' AS info;

SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled,
    relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relname = 'messages';

-- =====================================================
-- WHAT TO LOOK FOR:
-- =====================================================
-- 
-- 1. Schema should be 'public'
--    If not, table won't be accessible via REST API
--
-- 2. Permissions:
--    - 'anon' role should have: SELECT, INSERT
--    - 'authenticated' role should have: SELECT, INSERT, UPDATE, DELETE
--    If missing, API won't work
--
-- 3. RLS Status:
--    - rls_enabled should be FALSE (since we disabled it)
--    If TRUE, run TEMPORARY_DISABLE_RLS.sql again
--
-- =====================================================
