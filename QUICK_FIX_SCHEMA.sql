-- =====================================================
-- QUICK FIX FOR "OBJECT NOT FOUND" ERROR
-- =====================================================
-- Run this first to fix the immediate profile completion issue

-- 1. Create the profiles table with all required fields
CREATE TABLE IF NOT EXISTS profiles (
    -- Primary identification
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Account and membership
    account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'couple')),
    membership_tier TEXT DEFAULT 'basic' CHECK (membership_tier IN ('basic', 'vip')),
    membership_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Core profile information
    display_name TEXT,
    location TEXT,
    age INTEGER CHECK (age >= 18 AND age <= 100),
    bio TEXT,
    
    -- Individual profile fields
    gender TEXT,
    orientation TEXT,
    
    -- Couple profile fields
    display_name2 TEXT,
    gender2 TEXT,
    orientation2 TEXT,
    age2 INTEGER CHECK (age2 >= 18 AND age2 <= 100),
    
    -- Relationship and seeking
    relationship_status TEXT,
    seeking TEXT[],
    seeking_relationship_type TEXT[],
    lifestyle_experience TEXT DEFAULT 'New',
    
    -- Interests and kinks
    interests TEXT[],
    kinks TEXT[],
    soft_limits TEXT[],
    hard_limits TEXT[],
    
    -- Safety and rules
    safety_practices TEXT,
    rules TEXT,
    
    -- Photos
    photos TEXT[] DEFAULT '{}',
    
    -- Match preferences
    match_preferences JSONB DEFAULT '{
        "ageRange": [18, 65],
        "genders": [],
        "orientations": [],
        "searchingFor": [],
        "distance": 50,
        "vipOnly": false,
        "verifiedOnly": false,
        "experienceLevels": []
    }'::jsonb,
    
    -- Status flags
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies for profile photos
CREATE POLICY "Users can upload their own photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Public can view profile photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can delete their own photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 6. Function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        display_name, 
        age,
        account_type,
        membership_tier
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 18),
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
        'basic'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Trigger for updating timestamps
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Quick fix schema applied successfully! You can now complete profiles.' as status;