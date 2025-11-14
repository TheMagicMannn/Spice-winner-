-- =====================================================
-- SET PROFILE_COMPLETED FLAG FOR EXISTING USERS
-- =====================================================
-- This script marks existing profiles as completed
-- Run this if you're being redirected to profile setup
-- even though you've already completed your profile
-- =====================================================

-- Check current profile_completed status
SELECT 
    id,
    email,
    display_name,
    profile_completed,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- =====================================================
-- OPTION 1: Set profile_completed for ALL profiles
-- =====================================================
-- Use this if all existing users have completed profiles

UPDATE profiles
SET profile_completed = true
WHERE profile_completed IS NULL OR profile_completed = false;

-- =====================================================
-- OPTION 2: Set profile_completed for specific user
-- =====================================================
-- Use this to update just your account
-- Replace 'your-email@example.com' with your actual email

-- UPDATE profiles
-- SET profile_completed = true
-- WHERE email = 'kwitter1982@gmail.com';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check updated status
SELECT 
    email,
    display_name,
    profile_completed,
    CASE 
        WHEN profile_completed = true THEN '✅ Will skip profile setup'
        ELSE '⚠️ Will show profile setup'
    END as status
FROM profiles
ORDER BY created_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
    completed_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO completed_count FROM profiles WHERE profile_completed = true;
    SELECT COUNT(*) INTO total_count FROM profiles;

    RAISE NOTICE '====================================================';
    RAISE NOTICE '✅ PROFILE COMPLETION FLAGS UPDATED!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Profile statistics:';
    RAISE NOTICE '  Total profiles: %', total_count;
    RAISE NOTICE '  Completed profiles: %', completed_count;
    RAISE NOTICE '  Incomplete profiles: %', (total_count - completed_count);
    RAISE NOTICE '';
    RAISE NOTICE '🎯 REFRESH YOUR APP NOW!';
    RAISE NOTICE 'Users with profile_completed = true will skip profile setup';
    RAISE NOTICE '====================================================';
END $$;
