-- =====================================================
-- ADD EMAIL COLUMN TO PROFILES TABLE
-- =====================================================
-- This ensures the profiles table has an email column
-- so admins can see user emails without querying auth.users
-- =====================================================

-- Check if email column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        -- Add email column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN email TEXT;
        
        RAISE NOTICE 'Email column added to profiles table';
    ELSE
        RAISE NOTICE 'Email column already exists in profiles table';
    END IF;
END $$;

-- Add last_sign_in_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'last_sign_in_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'last_sign_in_at column added to profiles table';
    ELSE
        RAISE NOTICE 'last_sign_in_at column already exists in profiles table';
    END IF;
END $$;

-- =====================================================
-- SYNC EMAILS FROM AUTH.USERS TO PROFILES
-- =====================================================

-- Create a function to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile with email from auth.users
    UPDATE profiles
    SET email = NEW.email,
        last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_user_email ON auth.users;

-- Create trigger to sync email on user creation/update
CREATE TRIGGER trigger_sync_user_email
    AFTER INSERT OR UPDATE OF email, last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email();

-- =====================================================
-- ONE-TIME SYNC: Copy existing emails to profiles
-- =====================================================

-- Update all existing profiles with their email from auth.users
UPDATE profiles p
SET 
    email = au.email,
    last_sign_in_at = au.last_sign_in_at
FROM auth.users au
WHERE p.id = au.id
AND (p.email IS NULL OR p.email != au.email OR p.last_sign_in_at IS NULL);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if columns were added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name IN ('email', 'last_sign_in_at')
ORDER BY column_name;

-- Check if emails were synced
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as profiles_with_email,
    COUNT(CASE WHEN email IS NULL THEN 1 END) as profiles_without_email
FROM profiles;

-- Show sample of profiles with emails
SELECT 
    id,
    display_name,
    email,
    is_admin,
    last_sign_in_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- DONE!
-- =====================================================
-- After running this:
-- 1. Profiles table now has email column
-- 2. Emails are synced from auth.users
-- 3. Future user signups will auto-sync emails
-- 4. Admin dashboard can now display emails!
-- =====================================================
