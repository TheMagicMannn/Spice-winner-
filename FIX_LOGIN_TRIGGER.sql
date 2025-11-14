-- =====================================================
-- FIX FOR LOGIN ERROR: last_sign_in_ip field missing
-- =====================================================
-- This script fixes the database trigger that's causing login failures
-- Error: record "new" has no field "last_sign_in_ip"
--
-- Run this in your Supabase SQL Editor to fix the login issue
-- =====================================================

-- Drop the existing broken trigger
DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;

-- Update the function to NOT use last_sign_in_ip (which doesn't exist in auth.users)
CREATE OR REPLACE FUNCTION track_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_sign_in_at > OLD.last_sign_in_at OR OLD.last_sign_in_at IS NULL THEN
        -- Log login activity without IP address since auth.users doesn't have last_sign_in_ip field
        PERFORM log_user_activity(
            NEW.id,
            'user_login',
            jsonb_build_object(
                'email', NEW.email,
                'timestamp', NEW.last_sign_in_at
            ),
            NULL,  -- IP address - set to NULL since it's not available in auth.users
            NULL   -- User agent - also not available
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER trigger_track_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION track_user_login();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the fix worked:

-- 1. Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_track_login';

-- 2. Check the function definition
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'track_user_login';

-- =====================================================
-- Now you should be able to login successfully!
-- =====================================================
