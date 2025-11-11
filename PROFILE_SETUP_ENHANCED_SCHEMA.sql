-- =====================================================
-- SPICE PROFILE SETUP ENHANCED SCHEMA
-- Complete database setup for enhanced profile workflow
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE ENHANCEMENTS
-- =====================================================

-- Add new columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS what_brings_you_here TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_philosophy TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS three_things_about_me TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS my_ideal_experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS turn_ons TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deal_breakers TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitness_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dietary_preferences TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS endowment TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_confidence TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_categories JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_photo_index INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_privacy_levels JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_type_preferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kink_compatibility_requirements JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meeting_preferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS frequency_expectations TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_goals TEXT;

-- Couple-specific enhancements
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_type TEXT; -- Married, Dating, Engaged, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS time_together TEXT; -- <1yr, 1-3yrs, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS both_partners_present TEXT; -- Always, Sometimes, Varies
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS decision_making TEXT; -- Joint, One leads, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_pronouns TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_pronouns TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_dynamics TEXT; -- Both bi, One bi/one straight, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS play_style TEXT; -- Same room only, Full swap, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS third_party_rules TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS how_we_met TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS what_makes_us_unique TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS our_ideal_connection TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS what_we_bring TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_turn_ons TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_deal_breakers TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_confidence_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_confidence_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_fitness TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_fitness TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_partner TEXT; -- P1, P2, or both
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS who_manages_profile TEXT; -- Both, P1, P2, Takes turns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for TEXT[]; -- Singles, Couples, Both, Groups
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS single_gender_preferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_configuration_preferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level_match TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS play_style_match TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meeting_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_preference TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{}';

-- Profile completion tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS setup_step_completed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_updated_step TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- 2. VERIFICATION SYSTEM TABLES
-- =====================================================

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    method TEXT NOT NULL CHECK (method IN ('selfie', 'fetlife')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Common fields
    email TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    
    -- Selfie verification fields
    selfie_photo_url TEXT,
    verification_date DATE,
    
    -- FetLife verification fields
    fetlife_profile_url TEXT,
    fetlife_screenshot_url TEXT,
    
    -- Partner 2 fields (for couples)
    partner2_email TEXT,
    partner2_selfie_photo_url TEXT,
    partner2_fetlife_profile_url TEXT,
    partner2_fetlife_screenshot_url TEXT,
    
    -- Admin notes
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, status) WHERE status = 'pending'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at ON verification_requests(submitted_at DESC);

-- Verified users table (approved verifications)
CREATE TABLE IF NOT EXISTS verified_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_method TEXT NOT NULL CHECK (verification_method IN ('selfie', 'fetlife')),
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    verified_by UUID REFERENCES auth.users(id),
    verification_request_id UUID REFERENCES verification_requests(id),
    verification_badge_level TEXT DEFAULT 'verified' CHECK (verification_badge_level IN ('verified', 'premium_verified')),
    expires_at TIMESTAMPTZ, -- Optional expiration for re-verification
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verified_users_user_id ON verified_users(user_id);

-- =====================================================
-- 3. PHOTO MANAGEMENT TABLES
-- =====================================================

-- Enhanced photo metadata
CREATE TABLE IF NOT EXISTS profile_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    
    -- Photo categorization
    category TEXT CHECK (category IN ('face', 'body', 'lifestyle', 'kink', 'couple', 'solo_partner1', 'solo_partner2')),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Privacy settings
    privacy_level TEXT DEFAULT 'members' CHECK (privacy_level IN ('public', 'members', 'private', 'face_blurred')),
    blur_face BOOLEAN DEFAULT false,
    
    -- Verification
    is_verified_photo BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    
    -- Metadata
    caption TEXT,
    tags TEXT[],
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    file_size INTEGER,
    mime_type TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_is_primary ON profile_photos(is_primary);
CREATE INDEX IF NOT EXISTS idx_profile_photos_privacy_level ON profile_photos(privacy_level);

-- =====================================================
-- 4. PROFILE SETUP PROGRESS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_setup_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type TEXT CHECK (account_type IN ('individual', 'couple')),
    
    -- Step completion tracking
    steps_completed JSONB DEFAULT '[]',
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 7, -- 7 for individual, 8 for couple
    
    -- Data completeness
    required_fields_completed JSONB DEFAULT '{}',
    optional_fields_completed JSONB DEFAULT '{}',
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Auto-save data (temporary storage)
    draft_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_setup_progress_user_id ON profile_setup_progress(user_id);

-- =====================================================
-- 5. STORAGE BUCKETS
-- =====================================================

-- Profile photos bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

-- Verification photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-photos',
    'verification-photos',
    false, -- Not public
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_setup_progress ENABLE ROW LEVEL SECURITY;

-- Verification Requests Policies
CREATE POLICY "Users can view their own verification requests"
    ON verification_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests"
    ON verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending verification requests"
    ON verification_requests FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Admin policies for verification (assuming admin role)
CREATE POLICY "Admins can view all verification requests"
    ON verification_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update verification requests"
    ON verification_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Verified Users Policies
CREATE POLICY "Anyone can view verified users"
    ON verified_users FOR SELECT
    USING (true);

CREATE POLICY "Only system can insert verified users"
    ON verified_users FOR INSERT
    WITH CHECK (false); -- Will be done via trigger

-- Profile Photos Policies
CREATE POLICY "Users can view their own photos"
    ON profile_photos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public and member photos"
    ON profile_photos FOR SELECT
    USING (
        privacy_level = 'public' OR
        (privacy_level = 'members' AND auth.uid() IS NOT NULL)
    );

CREATE POLICY "Users can insert their own photos"
    ON profile_photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
    ON profile_photos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
    ON profile_photos FOR DELETE
    USING (auth.uid() = user_id);

-- Profile Setup Progress Policies
CREATE POLICY "Users can view their own setup progress"
    ON profile_setup_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own setup progress"
    ON profile_setup_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setup progress"
    ON profile_setup_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Storage Policies
-- Profile Photos Storage
CREATE POLICY "Users can upload their own profile photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'profile-photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own profile photos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'profile-photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own profile photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'profile-photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Anyone can view public profile photos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'profile-photos');

-- Verification Photos Storage
CREATE POLICY "Users can upload their verification photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'verification-photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Admins can view verification photos"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'verification-photos' AND
        (
            (storage.foldername(name))[1] = auth.uid()::text OR
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.is_admin = true
            )
        )
    );

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_verification_requests_updated_at
    BEFORE UPDATE ON verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_photos_updated_at
    BEFORE UPDATE ON profile_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create verified_user entry when verification approved
CREATE OR REPLACE FUNCTION create_verified_user_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only when status changes to approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        INSERT INTO verified_users (
            user_id,
            verification_method,
            verified_at,
            verified_by,
            verification_request_id
        )
        VALUES (
            NEW.user_id,
            NEW.method,
            NOW(),
            NEW.reviewed_by,
            NEW.id
        )
        ON CONFLICT (user_id) DO UPDATE SET
            verification_method = NEW.method,
            verified_at = NOW(),
            verified_by = NEW.reviewed_by,
            verification_request_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_verification_approval
    AFTER UPDATE ON verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_verified_user_on_approval();

-- Ensure only one primary photo per user
CREATE OR REPLACE FUNCTION ensure_single_primary_photo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        -- Set all other photos for this user to not primary
        UPDATE profile_photos
        SET is_primary = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_single_primary_photo
    BEFORE INSERT OR UPDATE ON profile_photos
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_photo();

-- Calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    required_fields INTEGER := 0;
    completed_fields INTEGER := 0;
    completion_pct INTEGER;
BEGIN
    -- Count required fields (customize based on account type)
    IF NEW.accountType = 'individual' THEN
        required_fields := 15; -- Adjust based on your requirements
        
        IF NEW.displayName IS NOT NULL AND NEW.displayName != '' THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.location IS NOT NULL AND NEW.location != '' THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.age >= 18 THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.gender IS NOT NULL AND NEW.gender != '' THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.orientation IS NOT NULL AND NEW.orientation != '' THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.bio IS NOT NULL AND LENGTH(NEW.bio) >= 69 THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.photos IS NOT NULL AND array_length(NEW.photos, 1) >= 2 THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.relationshipStatus IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.topRoles IS NOT NULL AND array_length(NEW.topRoles, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.interestedKinks IS NOT NULL AND array_length(NEW.interestedKinks, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.hardLimits IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.height IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.bodyType IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.seeking IS NOT NULL AND array_length(NEW.seeking, 1) > 0 THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.membershipTier IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
    ELSE
        required_fields := 20; -- More fields for couples
        -- Add couple-specific field checks
        IF NEW.displayName IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
        IF NEW.displayName2 IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;
        -- ... add more couple checks
    END IF;
    
    completion_pct := ROUND((completed_fields::DECIMAL / required_fields::DECIMAL) * 100);
    NEW.profile_completion_percentage := completion_pct;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_profile_completion_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_profile_completion();

-- =====================================================
-- 8. FUNCTIONS FOR PROFILE SETUP
-- =====================================================

-- Function to get user verification status
CREATE OR REPLACE FUNCTION get_user_verification_status(p_user_id UUID)
RETURNS TABLE (
    is_verified BOOLEAN,
    verification_method TEXT,
    verified_at TIMESTAMPTZ,
    pending_verification BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM verified_users WHERE user_id = p_user_id),
        (SELECT verification_method FROM verified_users WHERE user_id = p_user_id),
        (SELECT verified_at FROM verified_users WHERE user_id = p_user_id),
        EXISTS(SELECT 1 FROM verification_requests WHERE user_id = p_user_id AND status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get profile completion details
CREATE OR REPLACE FUNCTION get_profile_completion_details(p_user_id UUID)
RETURNS TABLE (
    completion_percentage INTEGER,
    missing_required_fields TEXT[],
    completed_steps INTEGER,
    total_steps INTEGER
) AS $$
DECLARE
    v_missing_fields TEXT[] := '{}';
    v_profile profiles%ROWTYPE;
BEGIN
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
    
    -- Check missing required fields
    IF v_profile.displayName IS NULL OR v_profile.displayName = '' THEN
        v_missing_fields := array_append(v_missing_fields, 'Display Name');
    END IF;
    IF v_profile.location IS NULL OR v_profile.location = '' THEN
        v_missing_fields := array_append(v_missing_fields, 'Location');
    END IF;
    IF v_profile.bio IS NULL OR LENGTH(v_profile.bio) < 69 THEN
        v_missing_fields := array_append(v_missing_fields, 'Bio');
    END IF;
    IF v_profile.photos IS NULL OR array_length(v_profile.photos, 1) < 2 THEN
        v_missing_fields := array_append(v_missing_fields, 'Photos');
    END IF;
    
    RETURN QUERY
    SELECT 
        v_profile.profile_completion_percentage,
        v_missing_fields,
        v_profile.setup_step_completed,
        CASE 
            WHEN v_profile.accountType = 'individual' THEN 7
            WHEN v_profile.accountType = 'couple' THEN 8
            ELSE 7
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. ADMIN FUNCTIONS
-- =====================================================

-- Add is_admin column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Function to approve verification
CREATE OR REPLACE FUNCTION approve_verification(
    p_request_id UUID,
    p_admin_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE verification_requests
    SET 
        status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = p_admin_id,
        admin_notes = p_admin_notes
    WHERE id = p_request_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject verification
CREATE OR REPLACE FUNCTION reject_verification(
    p_request_id UUID,
    p_admin_id UUID,
    p_rejection_reason TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE verification_requests
    SET 
        status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = p_admin_id,
        rejection_reason = p_rejection_reason,
        admin_notes = p_admin_notes
    WHERE id = p_request_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(accountType);
CREATE INDEX IF NOT EXISTS idx_profiles_completion_pct ON profiles(profile_completion_percentage);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON profiles(membershipTier);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_gender_orientation ON profiles(gender, orientation);
CREATE INDEX IF NOT EXISTS idx_profiles_age_location ON profiles(age, location);

-- =====================================================
-- 11. SAMPLE DATA CONSTANTS (Optional)
-- =====================================================

-- Insert sample pronouns options (can be used in frontend)
CREATE TABLE IF NOT EXISTS pronouns_options (
    id SERIAL PRIMARY KEY,
    pronoun TEXT UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO pronouns_options (pronoun, display_order) VALUES
    ('He/Him', 1),
    ('She/Her', 2),
    ('They/Them', 3),
    ('He/They', 4),
    ('She/They', 5),
    ('Custom', 6)
ON CONFLICT (pronoun) DO NOTHING;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- This schema provides:
-- ✅ Enhanced profile fields for individuals and couples
-- ✅ Complete verification system with admin review
-- ✅ Photo management with privacy controls
-- ✅ Profile setup progress tracking
-- ✅ Storage buckets with RLS policies
-- ✅ Triggers for automation
-- ✅ Admin functions for verification management
-- =====================================================
