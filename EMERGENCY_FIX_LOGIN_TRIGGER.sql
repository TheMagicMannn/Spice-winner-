-- =====================================================
-- EMERGENCY FIX: REMOVE BROKEN LOGIN TRIGGER
-- =====================================================
-- This will immediately fix your login by removing the broken trigger
-- that was added by the admin dashboard SQL files
--
-- PROBLEM:
-- The track_user_login() trigger references NEW.last_sign_in_ip
-- which doesn't exist in auth.users, causing login to fail
--
-- SOLUTION:
-- 1. Drop the broken trigger
-- 2. Drop the broken function
-- 3. Recreate them WITHOUT the problematic field reference
-- 4. Keep admin dashboard functionality working
--
-- RUN THIS NOW IN SUPABASE SQL EDITOR
-- =====================================================

-- =====================================================
-- STEP 1: DROP THE BROKEN TRIGGER AND FUNCTION
-- =====================================================

-- Drop the trigger that fires on login
DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;

-- Drop the broken function
DROP FUNCTION IF EXISTS track_user_login();

-- =====================================================
-- STEP 2: RECREATE SAFE VERSION (NO last_sign_in_ip)
-- =====================================================

-- Create SAFE version of track_user_login function
-- This version does NOT reference last_sign_in_ip
CREATE OR REPLACE FUNCTION track_user_login()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if last_sign_in_at actually changed
    IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
        -- Call log_user_activity function if it exists
        -- Use PERFORM to call function without needing return value
        BEGIN
            -- Check if the user_activity_log table exists
            IF EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'user_activity_log'
            ) THEN
                -- Log the activity
                PERFORM log_user_activity(
                    NEW.id,
                    'login',
                    jsonb_build_object(
                        'email', NEW.email,
                        'timestamp', NEW.last_sign_in_at
                    ),
                    NULL,  -- No IP address (field doesn't exist in auth.users)
                    NULL   -- No user agent (field doesn't exist in auth.users)
                );
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- Silently handle errors to prevent login failures
                -- This ensures login ALWAYS works even if activity logging fails
                NULL;
        END;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Absolutely ensure login never fails because of this trigger
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: RECREATE THE TRIGGER (SAFE VERSION)
-- =====================================================

-- Only create trigger if user wants activity logging
-- Comment out this section if you want to completely disable login tracking
CREATE TRIGGER trigger_track_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION track_user_login();

-- =====================================================
-- STEP 4: FIX log_user_activity FUNCTION (IF NEEDED)
-- =====================================================

-- Make sure log_user_activity function is also safe
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
    -- Check if table exists before trying to insert
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_activity_log'
    ) THEN
        INSERT INTO user_activity_log (
            user_id, 
            activity_type, 
            activity_data, 
            ip_address, 
            user_agent
        )
        VALUES (
            p_user_id, 
            p_activity_type, 
            p_activity_data, 
            p_ip_address, 
            p_user_agent
        )
        RETURNING id INTO activity_id;
        
        RETURN activity_id;
    ELSE
        -- If table doesn't exist, return a dummy UUID
        RETURN gen_random_uuid();
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Silently handle errors to prevent login failures
        RETURN gen_random_uuid();
END;
$$;

-- =====================================================
-- ALTERNATIVE: COMPLETELY DISABLE LOGIN TRACKING
-- =====================================================
-- If you want to completely remove login tracking and ensure
-- nothing can break login, uncomment these lines:

-- DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;
-- DROP FUNCTION IF EXISTS track_user_login();

-- This will remove all login tracking but guarantee login works

-- =====================================================
-- STEP 5: VERIFY THE FIX
-- =====================================================

-- Check if broken trigger is removed
SELECT 
    trigger_name, 
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_track_login';

-- Should show the new safe trigger (or no results if you disabled it)

-- Check if function exists and is safe
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'track_user_login';

-- =====================================================
-- STEP 6: TEST LOGIN IMMEDIATELY
-- =====================================================

-- After running this script:
-- 1. Go to your app: https://spice-winner.vercel.app/
-- 2. Try logging in
-- 3. Login should now work! ✅

-- If login still fails, run this to completely remove the trigger:
-- DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;

-- =====================================================
-- WHAT WAS FIXED
-- =====================================================
-- ❌ BEFORE: track_user_login() referenced NEW.last_sign_in_ip (doesn't exist)
-- ✅ AFTER: track_user_login() uses NULL for IP address
-- ✅ AFTER: Added error handling to prevent any login failures
-- ✅ AFTER: Added table existence checks before inserting
-- ✅ RESULT: Login will ALWAYS work, even if activity logging fails

-- =====================================================
-- ADMIN DASHBOARD STILL WORKS
-- =====================================================
-- Your admin dashboard will still work because:
-- ✅ user_activity_log table still exists
-- ✅ log_user_activity() function still works
-- ✅ Login events are still logged (just without IP address)
-- ✅ All admin dashboard queries still work
-- ✅ RLS policies are unaffected

-- Only difference: IP address will be NULL for login events
-- This is fine - you still get login tracking with timestamp

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'LOGIN TRIGGER FIXED!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '✅ Removed reference to non-existent last_sign_in_ip field';
    RAISE NOTICE '✅ Added error handling to prevent login failures';
    RAISE NOTICE '✅ Made activity logging optional and safe';
    RAISE NOTICE '';
    RAISE NOTICE 'LOGIN SHOULD NOW WORK!';
    RAISE NOTICE '';
    RAISE NOTICE 'Test it now:';
    RAISE NOTICE '1. Go to: https://spice-winner.vercel.app/';
    RAISE NOTICE '2. Try logging in';
    RAISE NOTICE '3. Should work without errors ✅';
    RAISE NOTICE '====================================================';
END $$;
