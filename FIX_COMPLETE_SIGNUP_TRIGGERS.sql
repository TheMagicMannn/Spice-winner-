-- =====================================================
-- COMPLETE SIGNUP FIX: All Required Tables & Triggers
-- =====================================================
-- This script fixes ALL signup issues by ensuring:
-- 1. profiles table exists
-- 2. user_settings table exists
-- 3. Both triggers work correctly
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Drop ALL existing triggers to avoid conflicts
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

-- =====================================================
-- STEP 2: Drop existing policies to avoid "already exists" errors
-- =====================================================
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_own ON profiles;

-- User settings policies
DROP POLICY IF EXISTS user_settings_select_own ON user_settings;
DROP POLICY IF EXISTS user_settings_insert_own ON user_settings;
DROP POLICY IF EXISTS user_settings_update_own ON user_settings;
DROP POLICY IF EXISTS user_settings_delete_own ON user_settings;

-- =====================================================
-- STEP 3: Create/Update profiles table
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    age INTEGER,
    gender VARCHAR(50),
    orientation VARCHAR(50),
    account_type VARCHAR(20) DEFAULT 'individual',
    bio TEXT,
    location VARCHAR(255),
    membership_tier VARCHAR(20) DEFAULT 'basic',
    membership_expires_at TIMESTAMPTZ,
    profile_completed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_membership ON profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active) WHERE is_active = TRUE;

-- =====================================================
-- STEP 4: Create/Update user_settings table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification Preferences
    notifications_messages BOOLEAN DEFAULT true,
    notifications_priority_messages BOOLEAN DEFAULT true,
    notifications_likes BOOLEAN DEFAULT true,
    notifications_new_matches BOOLEAN DEFAULT true,
    notifications_email BOOLEAN DEFAULT true,
    notifications_activity BOOLEAN DEFAULT true,
    
    -- Privacy Settings
    hide_account BOOLEAN DEFAULT false,
    incognito_mode BOOLEAN DEFAULT false,
    touch_face_id_protection BOOLEAN DEFAULT false,
    show_distance BOOLEAN DEFAULT true,
    activity_visibility BOOLEAN DEFAULT true,
    
    -- Other Settings
    location_distance VARCHAR(20) DEFAULT 'Distance',
    measurement_system VARCHAR(10) DEFAULT 'MI',
    app_icon_preference VARCHAR(50) DEFAULT 'default',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_id ON user_settings(id);

-- =====================================================
-- STEP 5: Enable RLS
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Create RLS Policies - profiles
-- =====================================================
CREATE POLICY profiles_select_own 
    ON profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY profiles_update_own 
    ON profiles 
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_insert_own 
    ON profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 7: Create RLS Policies - user_settings
-- =====================================================
CREATE POLICY user_settings_select_own 
    ON user_settings 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY user_settings_insert_own 
    ON user_settings 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY user_settings_update_own 
    ON user_settings 
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY user_settings_delete_own 
    ON user_settings 
    FOR DELETE 
    USING (auth.uid() = id);

-- =====================================================
-- STEP 8: Create Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Combined function to handle new user (creates both profile AND settings)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (
        id,
        display_name,
        age,
        account_type,
        membership_tier,
        is_active,
        profile_completed
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 18),
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
        'basic',
        TRUE,
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create user settings
    INSERT INTO public.user_settings (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 9: Create Triggers
-- =====================================================

-- Single trigger that handles EVERYTHING for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger for user_settings updated_at
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- STEP 10: Backfill for existing users
-- =====================================================

-- Create profiles for existing users who don't have them
INSERT INTO profiles (id, display_name, age, account_type, membership_tier, is_active, profile_completed)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'display_name', ''),
    COALESCE((u.raw_user_meta_data->>'age')::INTEGER, 18),
    COALESCE(u.raw_user_meta_data->>'account_type', 'individual'),
    'basic',
    TRUE,
    FALSE
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Create settings for existing users who don't have them
INSERT INTO user_settings (id)
SELECT u.id 
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.id
WHERE us.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 11: Verification
-- =====================================================
DO $$
DECLARE
    profiles_count INTEGER;
    settings_count INTEGER;
    users_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Count users
    SELECT COUNT(*) INTO users_count FROM auth.users;
    
    -- Count profiles
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    
    -- Count settings
    SELECT COUNT(*) INTO settings_count FROM user_settings;
    
    -- Count triggers
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_name IN ('on_auth_user_created', 'update_profiles_updated_at', 'update_user_settings_updated_at');
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE '✅ SIGNUP FIX COMPLETE!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Total users in auth.users: %', users_count;
    RAISE NOTICE 'Total profiles created: %', profiles_count;
    RAISE NOTICE 'Total user_settings created: %', settings_count;
    RAISE NOTICE 'Triggers created: %', trigger_count;
    RAISE NOTICE '==================================================';
    
    IF profiles_count = users_count AND settings_count = users_count THEN
        RAISE NOTICE '✅ All users have profiles and settings!';
    ELSE
        RAISE WARNING '⚠️  Some users missing profiles or settings';
        RAISE NOTICE 'Run the backfill section again if needed';
    END IF;
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'You can now test signup - it should work!';
    RAISE NOTICE '==================================================';
END $$;
