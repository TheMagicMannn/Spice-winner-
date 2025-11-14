-- =====================================================
-- CHECK IF ADMIN POLICIES ARE INSTALLED
-- =====================================================

-- Check if the is_user_admin function exists
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ is_user_admin function exists'
        ELSE '❌ is_user_admin function MISSING - need to run FIX_ADMIN_ACCESS_NO_RECURSION.sql'
    END as function_status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'is_user_admin';

-- Check policies on user_reports
SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'user_reports'
ORDER BY policyname;

-- Check policies on user_activity_log
SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'user_activity_log'
ORDER BY policyname;

-- Check policies on profiles
SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Summary
DO $$
DECLARE
    func_exists BOOLEAN;
    reports_policies INTEGER;
    activity_policies INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_name = 'is_user_admin'
    ) INTO func_exists;
    
    SELECT COUNT(*) INTO reports_policies
    FROM pg_policies
    WHERE tablename = 'user_reports';
    
    SELECT COUNT(*) INTO activity_policies
    FROM pg_policies
    WHERE tablename = 'user_activity_log';
    
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'ADMIN POLICY CHECK';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'is_user_admin function: %', CASE WHEN func_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE 'user_reports policies: %', reports_policies;
    RAISE NOTICE 'user_activity_log policies: %', activity_policies;
    RAISE NOTICE '';
    
    IF NOT func_exists THEN
        RAISE NOTICE '⚠️ ACTION REQUIRED:';
        RAISE NOTICE 'Run: /app/FIX_ADMIN_ACCESS_NO_RECURSION.sql';
    ELSE
        RAISE NOTICE '✅ Admin policies installed correctly!';
    END IF;
    
    RAISE NOTICE '====================================================';
END $$;
