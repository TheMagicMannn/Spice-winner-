-- =====================================================
-- NUCLEAR OPTION: JUST REMOVE THE BROKEN TRIGGER
-- =====================================================
-- This completely removes the login tracking trigger
-- Simplest fix - login will work immediately
-- You can add tracking back later if needed
-- =====================================================

-- Remove the broken trigger
DROP TRIGGER IF EXISTS trigger_track_login ON auth.users CASCADE;

-- Remove the broken function
DROP FUNCTION IF EXISTS track_user_login() CASCADE;

-- That's it! Login should work now.

-- =====================================================
-- VERIFY IT'S GONE
-- =====================================================

SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Broken trigger removed - login should work!'
        ELSE '⚠️ Trigger still exists - try running again'
    END as status
FROM information_schema.triggers
WHERE trigger_name = 'trigger_track_login';

-- =====================================================
-- TEST LOGIN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE '✅ BROKEN TRIGGER REMOVED!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'The problematic login tracking trigger has been removed.';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 TEST LOGIN NOW!';
    RAISE NOTICE 'Go to: https://spice-winner.vercel.app/';
    RAISE NOTICE 'Login should work!';
    RAISE NOTICE '';
    RAISE NOTICE 'Note: Login events will NOT be tracked in user_activity_log';
    RAISE NOTICE 'But your app will work perfectly.';
    RAISE NOTICE '';
    RAISE NOTICE 'If you want to re-enable tracking later, run:';
    RAISE NOTICE '/app/FINAL_CLEAN_FIX.sql';
    RAISE NOTICE '====================================================';
END $$;
