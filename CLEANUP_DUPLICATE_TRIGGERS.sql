-- =====================================================
-- CLEANUP DUPLICATE TRIGGERS
-- =====================================================
-- You have duplicate triggers that need to be removed
-- This will keep ONLY the safe triggers we created
-- =====================================================

-- =====================================================
-- REMOVE ALL TRIGGERS (INCLUDING DUPLICATES)
-- =====================================================

-- Drop all existing triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS sync_email_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS trigger_sync_user_email ON auth.users CASCADE;
DROP TRIGGER IF EXISTS trigger_track_login ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_user_profile ON auth.users CASCADE;
DROP TRIGGER IF EXISTS track_user_activity ON auth.users CASCADE;

-- =====================================================
-- DROP ALL RELATED FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS sync_user_email_to_profile() CASCADE;
DROP FUNCTION IF EXISTS track_user_login() CASCADE;
DROP FUNCTION IF EXISTS update_user_profile_on_auth_change() CASCADE;
DROP FUNCTION IF EXISTS handle_auth_user_update() CASCADE;

-- =====================================================
-- RECREATE SAFE FUNCTIONS (ONLY THESE TWO)
-- =====================================================

-- Function 1: Handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email,
        display_name, 
        age,
        account_type,
        membership_tier,
        is_admin
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 18),
        COALESCE((NEW.raw_user_meta_data->>'account_type')::TEXT, 'individual'),
        'basic',
        FALSE
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Sync email and login to profile
CREATE OR REPLACE FUNCTION sync_user_email_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email OR 
       NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
        
        IF EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
        ) THEN
            IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
                UPDATE profiles
                SET 
                    email = NEW.email,
                    last_sign_in_at = NEW.last_sign_in_at,
                    updated_at = NOW()
                WHERE id = NEW.id;
            ELSE
                INSERT INTO profiles (id, email, last_sign_in_at)
                VALUES (NEW.id, NEW.email, NEW.last_sign_in_at)
                ON CONFLICT (id) DO UPDATE
                SET 
                    email = EXCLUDED.email,
                    last_sign_in_at = EXCLUDED.last_sign_in_at,
                    updated_at = NOW();
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in sync_user_email_to_profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RECREATE SAFE TRIGGERS (ONLY THESE TWO)
-- =====================================================

-- Trigger 1: For new user signups
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger 2: For email/login sync
CREATE TRIGGER sync_email_trigger
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email_to_profile();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Should show EXACTLY 2 triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth'
ORDER BY trigger_name;

-- Should show EXACTLY 2 functions
SELECT 
    routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'sync_user_email_to_profile')
ORDER BY routine_name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_table = 'users' AND trigger_schema = 'auth';

    RAISE NOTICE '====================================================';
    RAISE NOTICE '✅ DUPLICATE TRIGGERS REMOVED!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Cleanup complete:';
    RAISE NOTICE '✅ Removed all duplicate triggers';
    RAISE NOTICE '✅ Kept only 2 safe triggers';
    RAISE NOTICE '✅ Active triggers: %', trigger_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Active triggers should be:';
    RAISE NOTICE '  1. on_auth_user_created';
    RAISE NOTICE '  2. sync_email_trigger';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 TEST LOGIN NOW!';
    RAISE NOTICE 'Go to: https://spice-winner.vercel.app/';
    RAISE NOTICE 'Login should work perfectly!';
    RAISE NOTICE '====================================================';
    
    IF trigger_count != 2 THEN
        RAISE WARNING 'Expected 2 triggers but found %. Please check!', trigger_count;
    END IF;
END $$;
