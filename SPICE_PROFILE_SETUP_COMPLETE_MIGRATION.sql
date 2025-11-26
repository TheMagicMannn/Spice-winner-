-- =====================================================
-- SPICE PROFILE SETUP COMPLETE MIGRATION
-- Adds all fields needed for the comprehensive 14-step
-- Individual and Couples profile setup workflow
-- =====================================================

-- =====================================================
-- 1. ENHANCED PROFILE WORKFLOW FIELDS
-- =====================================================

-- Step 2: Relationship Context
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_context TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_alignment TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_confirmed BOOLEAN DEFAULT false;

-- Step 3: Lifestyle Identity Selection
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle_identities TEXT[];

-- Step 4: Deep Relationship Structure (Adaptive)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enm_poly_structure TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swinger_structure TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bdsm_roles TEXT[];

-- Step 5: Intent
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intent_here_for TEXT[];

-- Step 6: Boundaries
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS comfortable_meeting TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS comfort_environments TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS negotiation_comfort TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS autonomy_level TEXT;

-- Step 7: What You're Seeking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seeking_detailed TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS poly_role TEXT;

-- Step 8: Who You Want to Meet
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interested_in_genders TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interested_in_types TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_pref TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_interaction TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_interaction_genders TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS singles_genders TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS group_types TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS polycule_preferences TEXT[];

-- Additional fields from step components
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personality_traits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hair_length TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitness_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle_activities TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trying_interests TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reference_willingness TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS energy_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_metamours BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metamour_relationship TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parallel_dating TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS escalator_interests TEXT[];

-- =====================================================
-- 2. ENSURE EXISTING FIELDS FROM SCHEMA ARE PRESENT
-- =====================================================

-- Account type with validation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_account_type_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_account_type_check 
        CHECK (account_type IN ('individual', 'couple', 'couple_shared', 'couple_shell'));
    END IF;
END $$;

-- Couples account fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name_2 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_2 INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender_2 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS orientation_2 TEXT;

-- Partner-specific role/kink fields for couples
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_quiz_results JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_kinks TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_soft_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_hard_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_safety_practices TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_rules TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_quiz_results JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_kinks TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_soft_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_hard_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_safety_practices TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_rules TEXT;

-- Partner physical stats for couples
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_height TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_weight TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_body_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_hair_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_eye_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_facial_hair TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_ethnicity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_cigarette_smoker TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_alcohol_drinker TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_marijuana_user TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_tattoos BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_piercings BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_body_hair TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_grooming_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_birth_control TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_latex_allergy BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_last_sti_test_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_sti_positive_results TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_can_host TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_height TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_weight TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_body_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_hair_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_eye_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_facial_hair TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_ethnicity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_cigarette_smoker TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_alcohol_drinker TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_marijuana_user TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_tattoos BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_piercings BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_body_hair TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_grooming_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_birth_control TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_latex_allergy BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_last_sti_test_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_sti_positive_results TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_can_host TEXT;

-- Individual role/kink fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS top_roles TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle_experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interested_kinks TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kink_quiz_results JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS soft_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hard_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS safety_practices TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rules TEXT;

-- Physical stats for individual
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hair_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS eye_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facial_hair TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cigarette_smoker TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alcohol_drinker TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marijuana_user TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tattoos BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS piercings BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_hair TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grooming_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_control TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latex_allergy BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_sti_test_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sti_positive_results TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_host TEXT;

-- Match preferences (stored as JSONB)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS match_preferences JSONB DEFAULT '{}';

-- Membership
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'basic';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMPTZ;

-- Profile status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_relationship_context ON profiles(relationship_context);
CREATE INDEX IF NOT EXISTS idx_profiles_lifestyle_identities ON profiles USING GIN(lifestyle_identities);
CREATE INDEX IF NOT EXISTS idx_profiles_interested_in_types ON profiles USING GIN(interested_in_types);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON profiles(last_active_at DESC);

-- =====================================================
-- 4. ENSURE STORAGE BUCKETS EXIST
-- =====================================================

-- Profile photos bucket
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

-- =====================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN profiles.relationship_context IS 'Step 2: Single, Partnered, Solo Poly, etc.';
COMMENT ON COLUMN profiles.lifestyle_identities IS 'Step 3: Swinger, ENM, Poly, BDSM/Kink, Exploring';
COMMENT ON COLUMN profiles.enm_poly_structure IS 'Step 4: ENM/Poly structure options';
COMMENT ON COLUMN profiles.swinger_structure IS 'Step 4: Swinger structure options';
COMMENT ON COLUMN profiles.bdsm_roles IS 'Step 4: BDSM roles';
COMMENT ON COLUMN profiles.intent_here_for IS 'Step 5: What user is here for';
COMMENT ON COLUMN profiles.comfortable_meeting IS 'Step 6: Who user is comfortable meeting';
COMMENT ON COLUMN profiles.seeking_detailed IS 'Step 7: Enhanced seeking options';
COMMENT ON COLUMN profiles.interested_in_types IS 'Step 8: Singles, Couples, Groups, Polycules, etc.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
