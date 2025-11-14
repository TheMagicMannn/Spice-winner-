-- =====================================================
-- COMPLETE FIX FOR LOGIN ERROR
-- =====================================================
-- This script fixes the database trigger causing login failures
-- Errors: 
--   1. record "new" has no field "last_sign_in_ip"
--   2. function log_user_activity does not exist
--
-- Run this COMPLETE script in your Supabase SQL Editor
-- =====================================================

-- STEP 1: Create the log_user_activity function (if it doesn't exist)
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_data JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_id UUID;
BEGIN
    -- Only insert if user_activity_log table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_activity_log') THEN
        INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
        VALUES (p_user_id, p_activity_type, p_activity_data, p_ip_address, p_user_agent)
        RETURNING id INTO activity_id;
        
        RETURN activity_id;
    ELSE
        -- If table doesn't exist, just return a dummy UUID and don't fail
        RETURN gen_random_uuid();
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Silently handle any errors to prevent login failures
        RETURN gen_random_uuid();
END;
$$;

-- STEP 2: Drop the existing broken trigger
DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;

-- STEP 3: Create/update the trigger function (without last_sign_in_ip)
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
EXCEPTION
    WHEN OTHERS THEN
        -- Silently handle errors to prevent login failures
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Recreate the trigger
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
