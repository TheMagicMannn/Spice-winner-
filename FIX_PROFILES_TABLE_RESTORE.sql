-- =====================================================
-- FIX: RESTORE PROFILES TABLE
-- =====================================================
-- This script fixes the login error by recreating the profiles table
-- Error: "relation 'profiles' does not exist"
-- 
-- WHAT HAPPENED:
-- The admin dashboard SQL scripts referenced a profiles table with an is_admin column,
-- but when database setup scripts ran, they may have dropped and not properly recreated
-- the profiles table with all required columns.
--
-- WHAT THIS DOES:
-- ✅ Recreates the profiles table with ALL required columns including is_admin
-- ✅ Restores triggers for automatic profile creation on signup
-- ✅ Restores RLS policies for security
-- ✅ Makes it compatible with both the main app AND admin dashboard
--
-- RUN THIS IN SUPABASE:
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =====================================================

-- =====================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. RECREATE PROFILES TABLE
-- =====================================================
-- This will recreate the table if it doesn't exist
-- If it already exists but is missing the is_admin column, add it

-- First, check if profiles table exists and add is_admin if needed
DO $$ 
BEGIN
    -- Add is_admin column if profiles table exists but column doesn't
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        -- Add is_admin column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'is_admin'
        ) THEN
            ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added is_admin column to existing profiles table';
        END IF;
    END IF;
END $$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    -- Primary identification
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Account type and membership
    account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'couple')),
    membership_tier TEXT DEFAULT 'basic' CHECK (membership_tier IN ('basic', 'vip')),
    membership_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Core profile information (INDIVIDUAL)
    display_name TEXT,
    location TEXT,
    age INTEGER CHECK (age >= 18 AND age <= 100),
    bio TEXT,
    
    -- Identity fields (INDIVIDUAL)
    gender TEXT,
    orientation TEXT,
    
    -- Couple profile fields (for PARTNER 2)
    display_name2 TEXT,
    age2 INTEGER CHECK (age2 IS NULL OR (age2 >= 18 AND age2 <= 100)),
    gender2 TEXT,
    orientation2 TEXT,
    
    -- Relationship and seeking information
    relationship_status TEXT,
    seeking TEXT[] DEFAULT '{}',
    seeking_relationship_type TEXT[] DEFAULT '{}',
    lifestyle_experience TEXT DEFAULT 'New' CHECK (lifestyle_experience IN ('New', 'Beginner', 'Moderate', 'Advanced')),
    
    -- Interests, kinks, and limits
    interests TEXT[] DEFAULT '{}',
    kinks TEXT[] DEFAULT '{}',
    soft_limits TEXT[] DEFAULT '{}',
    hard_limits TEXT[] DEFAULT '{}',
    
    -- Safety and rules
    safety_practices TEXT,
    rules TEXT,
    
    -- Photos (array of public URLs from storage)
    photos TEXT[] DEFAULT '{}',
    
    -- Match preferences stored as JSONB
    match_preferences JSONB DEFAULT jsonb_build_object(
        'ageRange', ARRAY[18, 65],
        'genders', ARRAY[]::text[],
        'orientations', ARRAY[]::text[],
        'searchingFor', ARRAY[]::text[],
        'distance', 50,
        'vipOnly', false,
        'verifiedOnly', true,
        'experienceLevels', ARRAY[]::text[]
    ),
    
    -- Profile status and verification
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Admin flag (REQUIRED FOR ADMIN DASHBOARD)
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- =====================================================
-- 4. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function to handle new user registration
-- This creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        display_name, 
        age,
        account_type,
        membership_tier,
        is_admin
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 18),
        COALESCE((NEW.raw_user_meta_data->>'account_type')::TEXT, 'individual'),
        'basic',
        FALSE
    )
    ON CONFLICT (id) DO UPDATE
    SET
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        age = COALESCE(EXCLUDED.age, profiles.age),
        account_type = COALESCE(EXCLUDED.account_type, profiles.account_type);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth operation
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for updating updated_at timestamps
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other active profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can view other active profiles (for matching)
CREATE POLICY "Users can view other active profiles"
    ON profiles FOR SELECT
    USING (
        is_active = true 
        AND profile_completed = true 
        AND auth.uid() != id
    );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

-- =====================================================
-- 7. VERIFY EXISTING USERS HAVE PROFILES
-- =====================================================
-- Create profiles for any existing auth.users that don't have profiles yet

INSERT INTO public.profiles (id, display_name, membership_tier, account_type, is_admin)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User'),
    'basic',
    'individual',
    FALSE
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check if profiles table exists and has correct columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if triggers exist
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table 
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (trigger_name = 'on_auth_user_created' OR trigger_name = 'update_profiles_updated_at');

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- Count existing profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- Check for users without profiles
SELECT COUNT(*) as users_without_profiles
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- =====================================================
-- 9. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'PROFILES TABLE RESTORED SUCCESSFULLY!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check the verification queries above';
    RAISE NOTICE '2. Try logging in again - the error should be fixed';
    RAISE NOTICE '3. If you still see errors, check the function logs';
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '✅ Profiles table recreated with all columns';
    RAISE NOTICE '✅ is_admin column added for admin dashboard';
    RAISE NOTICE '✅ Triggers restored for automatic profile creation';
    RAISE NOTICE '✅ RLS policies restored for security';
    RAISE NOTICE '✅ Existing users now have profile entries';
    RAISE NOTICE '====================================================';
END $$;
