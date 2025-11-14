-- =====================================================
-- SIMPLE & IMMEDIATE LOGIN FIX
-- =====================================================
-- This removes the problematic trigger so you can login NOW
-- You can add activity logging back later after proper setup
-- =====================================================

-- Simply drop the broken trigger to allow logins
DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;

-- Drop the trigger function (it will be recreated properly later)
DROP FUNCTION IF EXISTS track_user_login();

-- =====================================================
-- DONE! You should now be able to login immediately.
-- =====================================================
-- The trigger was tracking login activity, but it's optional.
-- Your app will work fine without it - you just won't have
-- automated login activity logging in the admin dashboard.
--
-- To re-enable activity tracking later, run the complete
-- schema from ADMIN_DASHBOARD_SCHEMA.sql
-- =====================================================
