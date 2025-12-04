-- ============================================
-- SPICE Profile Setup Redesign - Database Migration
-- 10-Step Workflow with Partner Linking
-- ============================================

-- Step 1: Create partner_links table
CREATE TABLE IF NOT EXISTS partner_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL DEFAULT 'pending',
  relationship_type TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'matches_only', 'private')) DEFAULT 'public',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, partner_id)
);

-- Step 2: Create profile_verifications table
CREATE TABLE IF NOT EXISTS profile_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  identity_verified BOOLEAN DEFAULT FALSE,
  identity_verified_at TIMESTAMP,
  lifestyle_verified TEXT[],
  partner_verified_ids UUID[],
  verification_documents JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Alter profiles table - Add new columns
-- Note: Check if columns exist before adding to avoid errors
DO $$ 
BEGIN
    -- Account type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='account_type') THEN
        ALTER TABLE profiles ADD COLUMN account_type TEXT 
        CHECK (account_type IN ('individual', 'individual_with_linking', 'shared_couple'));
    END IF;

    -- Exploring with column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='exploring_with') THEN
        ALTER TABLE profiles ADD COLUMN exploring_with TEXT 
        CHECK (exploring_with IN ('partner', 'solo', 'n/a')) DEFAULT 'n/a';
    END IF;

    -- Lifestyles array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='lifestyles') THEN
        ALTER TABLE profiles ADD COLUMN lifestyles TEXT[];
    END IF;

    -- Roles array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='roles') THEN
        ALTER TABLE profiles ADD COLUMN roles TEXT[];
    END IF;

    -- Kink tags array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='kink_tags') THEN
        ALTER TABLE profiles ADD COLUMN kink_tags TEXT[];
    END IF;

    -- Safeword
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='safeword') THEN
        ALTER TABLE profiles ADD COLUMN safeword TEXT;
    END IF;

    -- Pronouns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='pronouns') THEN
        ALTER TABLE profiles ADD COLUMN pronouns TEXT;
    END IF;

    -- Birthdate (separate from age)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='birthdate') THEN
        ALTER TABLE profiles ADD COLUMN birthdate TEXT;
    END IF;

    -- Gender identity (more inclusive)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='gender_identity') THEN
        ALTER TABLE profiles ADD COLUMN gender_identity TEXT;
    END IF;

    -- Sexual orientation array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='sexual_orientation') THEN
        ALTER TABLE profiles ADD COLUMN sexual_orientation TEXT[];
    END IF;

    -- Profile visibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='profile_visibility') THEN
        ALTER TABLE profiles ADD COLUMN profile_visibility TEXT 
        CHECK (profile_visibility IN ('public', 'verified_only', 'matches_only', 'private')) 
        DEFAULT 'public';
    END IF;

    -- Trust score
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='trust_score') THEN
        ALTER TABLE profiles ADD COLUMN trust_score INTEGER DEFAULT 0;
    END IF;

    -- Couple-specific: primary user id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='primary_user_id') THEN
        ALTER TABLE profiles ADD COLUMN primary_user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Couple-specific: secondary user id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='secondary_user_id') THEN
        ALTER TABLE profiles ADD COLUMN secondary_user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Couple name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='couple_name') THEN
        ALTER TABLE profiles ADD COLUMN couple_name TEXT;
    END IF;

    -- Couple bio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='couple_bio') THEN
        ALTER TABLE profiles ADD COLUMN couple_bio TEXT;
    END IF;

    -- Partner quick stats (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='partner_quick_stats') THEN
        ALTER TABLE profiles ADD COLUMN partner_quick_stats JSONB;
    END IF;
END $$;

-- Step 4: Update photos table (if it exists) or add photo metadata to profiles
-- Check if photos table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='photos') THEN
        -- Add visibility column to photos table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='photos' AND column_name='visibility') THEN
            ALTER TABLE photos ADD COLUMN visibility TEXT 
            CHECK (visibility IN ('public', 'matches_only', 'private')) 
            DEFAULT 'public';
        END IF;

        -- Add blur until match column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='photos' AND column_name='is_blurred_until_match') THEN
            ALTER TABLE photos ADD COLUMN is_blurred_until_match BOOLEAN DEFAULT FALSE;
        END IF;
    ELSE
        -- If photos table doesn't exist, we'll store photo data in profiles.photos as JSONB
        -- This is already handled by the current schema using TEXT[] for photo URLs
        -- For enhanced photo metadata, we could create a photos table:
        CREATE TABLE photos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            url TEXT NOT NULL,
            visibility TEXT CHECK (visibility IN ('public', 'matches_only', 'private')) DEFAULT 'public',
            is_blurred_until_match BOOLEAN DEFAULT FALSE,
            uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE INDEX idx_photos_profile_id ON photos(profile_id);
    END IF;
END $$;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_links_user_id ON partner_links(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_links_partner_id ON partner_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_links_status ON partner_links(status);
CREATE INDEX IF NOT EXISTS idx_profile_verifications_profile_id ON profile_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_lifestyles ON profiles USING GIN(lifestyles);
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_profiles_kink_tags ON profiles USING GIN(kink_tags);

-- Step 6: Row Level Security (RLS) Policies

-- Partner Links RLS
ALTER TABLE partner_links ENABLE ROW LEVEL SECURITY;

-- Users can view partner links where they are either the user or the partner
CREATE POLICY "Users can view their own partner links"
ON partner_links FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Users can insert partner link invites
CREATE POLICY "Users can send partner link invites"
ON partner_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Partners can update status (accept/reject)
CREATE POLICY "Partners can update link status"
ON partner_links FOR UPDATE
USING (auth.uid() = partner_id)
WITH CHECK (auth.uid() = partner_id);

-- Users can delete their own partner links
CREATE POLICY "Users can delete their partner links"
ON partner_links FOR DELETE
USING (auth.uid() = user_id);

-- Profile Verifications RLS
ALTER TABLE profile_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification
CREATE POLICY "Users can view own verification"
ON profile_verifications FOR SELECT
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = profile_verifications.profile_id 
    AND profiles.id = auth.uid()
));

-- Users can insert their own verification
CREATE POLICY "Users can insert own verification"
ON profile_verifications FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = profile_verifications.profile_id 
    AND profiles.id = auth.uid()
));

-- Users can update their own verification
CREATE POLICY "Users can update own verification"
ON profile_verifications FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = profile_verifications.profile_id 
    AND profiles.id = auth.uid()
));

-- Photos RLS (if photos table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='photos') THEN
        EXECUTE 'ALTER TABLE photos ENABLE ROW LEVEL SECURITY';
        
        -- Users can view their own photos
        EXECUTE 'CREATE POLICY "Users can view own photos"
        ON photos FOR SELECT
        USING (EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = photos.profile_id 
            AND profiles.id = auth.uid()
        ))';
        
        -- Users can insert their own photos
        EXECUTE 'CREATE POLICY "Users can insert own photos"
        ON photos FOR INSERT
        WITH CHECK (EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = photos.profile_id 
            AND profiles.id = auth.uid()
        ))';
        
        -- Users can update their own photos
        EXECUTE 'CREATE POLICY "Users can update own photos"
        ON photos FOR UPDATE
        USING (EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = photos.profile_id 
            AND profiles.id = auth.uid()
        ))';
        
        -- Users can delete their own photos
        EXECUTE 'CREATE POLICY "Users can delete own photos"
        ON photos FOR DELETE
        USING (EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = photos.profile_id 
            AND profiles.id = auth.uid()
        ))';
    END IF;
END $$;

-- Step 7: Update profiles RLS for couple accounts
-- Couple profiles can be edited by both primary and secondary users
CREATE POLICY "Couple profile editable by both partners"
ON profiles FOR UPDATE
USING (
    auth.uid() = id OR 
    auth.uid() = primary_user_id OR 
    auth.uid() = secondary_user_id
)
WITH CHECK (
    auth.uid() = id OR 
    auth.uid() = primary_user_id OR 
    auth.uid() = secondary_user_id
);

-- Step 8: Helper functions

-- Function to get partner links for a user
CREATE OR REPLACE FUNCTION get_user_partner_links(user_uuid UUID)
RETURNS TABLE (
    link_id UUID,
    partner_id UUID,
    partner_name TEXT,
    status TEXT,
    relationship_type TEXT,
    visibility TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pl.id,
        pl.partner_id,
        p.display_name,
        pl.status,
        pl.relationship_type,
        pl.visibility,
        pl.created_at
    FROM partner_links pl
    JOIN profiles p ON p.id = pl.partner_id
    WHERE pl.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(profile_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    verification_record RECORD;
BEGIN
    -- Get verification record
    SELECT * INTO verification_record
    FROM profile_verifications
    WHERE profile_id = profile_uuid;
    
    -- Base score
    score := 0;
    
    -- Identity verified: +50 points
    IF verification_record.identity_verified THEN
        score := score + 50;
    END IF;
    
    -- Lifestyle verified: +10 points per lifestyle
    IF verification_record.lifestyle_verified IS NOT NULL THEN
        score := score + (array_length(verification_record.lifestyle_verified, 1) * 10);
    END IF;
    
    -- Partner verified: +15 points per verified partner
    IF verification_record.partner_verified_ids IS NOT NULL THEN
        score := score + (array_length(verification_record.partner_verified_ids, 1) * 15);
    END IF;
    
    -- Update profile trust score
    UPDATE profiles SET trust_score = score WHERE id = profile_uuid;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Triggers

-- Trigger to update partner_links updated_at timestamp
CREATE OR REPLACE FUNCTION update_partner_links_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partner_links_updated_at
BEFORE UPDATE ON partner_links
FOR EACH ROW
EXECUTE FUNCTION update_partner_links_timestamp();

-- Trigger to update profile_verifications updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_verifications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_verifications_updated_at
BEFORE UPDATE ON profile_verifications
FOR EACH ROW
EXECUTE FUNCTION update_profile_verifications_timestamp();

-- Trigger to recalculate trust score on verification changes
CREATE OR REPLACE FUNCTION recalculate_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_trust_score(NEW.profile_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_trust_score_trigger
AFTER INSERT OR UPDATE ON profile_verifications
FOR EACH ROW
EXECUTE FUNCTION recalculate_trust_score();

-- Step 10: Data migration for existing profiles
-- Migrate old account_type values
UPDATE profiles 
SET account_type = 'individual' 
WHERE account_type IS NULL OR account_type = 'individual';

UPDATE profiles 
SET account_type = 'shared_couple' 
WHERE account_type = 'couple';

-- Set default exploring_with for existing profiles
UPDATE profiles 
SET exploring_with = 'n/a' 
WHERE exploring_with IS NULL;

-- Set default profile_visibility
UPDATE profiles 
SET profile_visibility = 'public' 
WHERE profile_visibility IS NULL;

-- Initialize verification records for existing profiles
INSERT INTO profile_verifications (profile_id, identity_verified, lifestyle_verified, partner_verified_ids)
SELECT 
    id,
    FALSE,
    ARRAY[]::TEXT[],
    ARRAY[]::UUID[]
FROM profiles
WHERE NOT EXISTS (
    SELECT 1 FROM profile_verifications WHERE profile_id = profiles.id
);

-- ============================================
-- Migration Complete
-- ============================================

-- Verification queries
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_partner_links FROM partner_links;
SELECT COUNT(*) as total_verifications FROM profile_verifications;
