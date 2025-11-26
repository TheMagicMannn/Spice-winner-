-- =====================================================
-- COMPREHENSIVE 3 ACCOUNT TYPES SCHEMA
-- Supports: Individual, Couple Shared, Couple Shell
-- =====================================================

-- =====================================================
-- 1. UPDATE PROFILES TABLE FOR 3 ACCOUNT TYPES
-- =====================================================

-- Update account_type to support 3 types
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_account_type_check 
  CHECK (account_type IN ('individual', 'couple_shared', 'couple_shell'));

-- =====================================================
-- 2. COUPLE SHARED ACCOUNTS (1 profile, 2 logins)
-- =====================================================

-- Add fields for couple shared accounts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_last_login TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_last_login TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shared_account_created_by TEXT; -- 'partner1' or 'partner2'

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_partner1_email ON profiles(partner1_email);
CREATE INDEX IF NOT EXISTS idx_profiles_partner2_email ON profiles(partner2_email);

-- =====================================================
-- 3. COUPLE SHELL ACCOUNTS (2 individual accounts linked)
-- =====================================================

-- Create couple_links table to track linked accounts
CREATE TABLE IF NOT EXISTS couple_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    partner2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    link_status TEXT NOT NULL DEFAULT 'pending' CHECK (link_status IN ('pending', 'accepted', 'rejected')),
    requested_by UUID NOT NULL REFERENCES profiles(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    
    -- Couple shell profile data (combined profile)
    couple_display_name TEXT,
    couple_bio TEXT,
    couple_photos TEXT[],
    
    -- Shared preferences for the couple
    shared_seeking TEXT[],
    shared_boundaries JSONB,
    shared_rules TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure no duplicate links
    UNIQUE(partner1_id, partner2_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_couple_links_partner1 ON couple_links(partner1_id);
CREATE INDEX IF NOT EXISTS idx_couple_links_partner2 ON couple_links(partner2_id);
CREATE INDEX IF NOT EXISTS idx_couple_links_status ON couple_links(link_status);

-- =====================================================
-- 4. ENHANCED PROFILE FIELDS - DEEP COMMUNITY QUESTIONS
-- =====================================================

-- Experience Level (detailed progression)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_in_lifestyle INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currently_active BOOLEAN DEFAULT true;

-- BDSM/Kink Detailed Fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bdsm_role_primary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bdsm_role_secondary TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS power_exchange_level TEXT; -- None, Bedroom only, 24/7, High protocol, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS protocol_level TEXT; -- None, Low, Medium, High, Very High
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS collared_owned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS collar_ownership_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for_collar_ownership BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hard_limits_detailed JSONB; -- Detailed structure with reasoning
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS soft_limits_detailed JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS negotiation_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aftercare_needs TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS safe_words TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scene_preferences JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dungeon_etiquette_knowledge TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_play_comfort TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS demo_performance_comfort TEXT;

-- Swinger Detailed Fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swinger_type TEXT; -- Full swap, Soft swap, Same room, Separate room, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swap_preferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS party_event_preferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_experience BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_clubs TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS group_play_max_size INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS watching_being_watched TEXT; -- Exhibitionist, Voyeur, Both, Neither
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unicorn_bull_experience BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hosting_capability TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel_for_play BOOLEAN DEFAULT false;

-- ENM/Poly Detailed Fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS poly_structure_detailed TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hierarchy_level TEXT; -- Primary/Secondary, Non-hierarchical, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nesting_partner_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS polycule_size INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS poly_saturation_level TEXT; -- Room for more, At capacity, Unsure
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kitchen_table_parallel TEXT; -- Kitchen table, Parallel, Garden party
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS veto_power_exists BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scheduling_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metamour_relationship_preference TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_escalator_views TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS solo_poly_status BOOLEAN DEFAULT false;

-- Communication & Compatibility
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS conflict_resolution_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS texting_frequency_preference TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_call_preference TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_chat_comfort TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time_expectation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS love_languages TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS attachment_style TEXT;

-- Meeting & Dating Preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_meeting_preference TEXT; -- Coffee, Dinner, Event, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS how_soon_to_meet TEXT; -- Chat first, Meet quickly, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dating_pace TEXT; -- Slow burn, Quick connection, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ideal_date_activities TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel_distance_willing INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS local_events_attend BOOLEAN DEFAULT false;

-- Sexual Health & Safety (Detailed)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sti_testing_frequency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS testing_required_before_play BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS barrier_method_required BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fluid_bonding_status TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_control_status_detailed TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sexual_health_discussion_timing TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS risk_profile TEXT; -- Very cautious, Moderate, Open, etc.

-- Boundaries & Rules (Comprehensive)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_rules_list TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS boundaries_non_negotiable TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS boundaries_flexible TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS check_in_frequency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS transparency_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_video_consent TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_media_boundaries TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS overnight_stays_allowed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_progression_pace TEXT;

-- Lifestyle Integration
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS out_to_vanilla_friends BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS out_to_family BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS out_at_work BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discretion_needs TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_schedule_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_times TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS children_live_with BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parenting_schedule TEXT;

-- Interests & Activities (Expanded)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS munches_attend BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS workshops_classes_interest BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kink_conventions_attend BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS online_communities_active BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mentor_mentee_interest TEXT; -- Want mentor, Want to mentor, Both, Neither
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS volunteer_community_roles TEXT[];

-- For Couples: Relationship Dynamics
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_relationship_length TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS how_couple_met TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_dynamic_type TEXT; -- Equal partners, Power exchange, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS both_partners_bi BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_play_style TEXT; -- Always together, Sometimes separate, etc.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jealousy_management_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS compersion_experience TEXT;

-- Partner Preferences (for those seeking partners)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_gap_comfort TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_type_preferences TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS appearance_importance TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chemistry_vs_compatibility TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deal_breakers_absolute TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_haves_list TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nice_to_haves_list TEXT[];

-- Profile Verification & Trust
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS references_available BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reference_contacts TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_check_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS std_test_share_willingness TEXT;

-- =====================================================
-- 5. PARTNER-SPECIFIC FIELDS (For Couple Shared & Couple Shell)
-- =====================================================

-- All the above fields can be prefixed with partner1_ or partner2_ for couple accounts
-- (This would be handled in application logic, storing JSONB for each partner)

-- Add JSONB columns for storing partner-specific data in couple accounts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_data JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_data JSONB DEFAULT '{}';

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_power_exchange_level ON profiles(power_exchange_level);
CREATE INDEX IF NOT EXISTS idx_profiles_poly_structure ON profiles(poly_structure_detailed);
CREATE INDEX IF NOT EXISTS idx_profiles_swinger_type ON profiles(swinger_type);
CREATE INDEX IF NOT EXISTS idx_profiles_years_in_lifestyle ON profiles(years_in_lifestyle);

-- =====================================================
-- 7. RLS POLICIES FOR COUPLE LINKS
-- =====================================================

-- Enable RLS
ALTER TABLE couple_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own couple links
CREATE POLICY "Users can view own couple links"
    ON couple_links FOR SELECT
    USING (
        partner1_id = auth.uid() OR 
        partner2_id = auth.uid()
    );

-- Policy: Users can create couple link requests
CREATE POLICY "Users can create couple links"
    ON couple_links FOR INSERT
    WITH CHECK (
        requested_by = auth.uid() AND
        (partner1_id = auth.uid() OR partner2_id = auth.uid())
    );

-- Policy: Users can update couple links they're part of
CREATE POLICY "Users can update own couple links"
    ON couple_links FOR UPDATE
    USING (
        partner1_id = auth.uid() OR 
        partner2_id = auth.uid()
    );

-- Policy: Users can delete couple links they're part of
CREATE POLICY "Users can delete own couple links"
    ON couple_links FOR DELETE
    USING (
        partner1_id = auth.uid() OR 
        partner2_id = auth.uid()
    );

-- =====================================================
-- 8. FUNCTIONS FOR COUPLE SHARED AUTHENTICATION
-- =====================================================

-- Function to check if email can access a couple_shared profile
CREATE OR REPLACE FUNCTION can_access_couple_shared_profile(
    p_email TEXT,
    p_profile_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_profile_id
        AND account_type = 'couple_shared'
        AND (partner1_email = p_email OR partner2_email = p_email)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_couple_links_updated_at
    BEFORE UPDATE ON couple_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE couple_links IS 'Tracks couple shell accounts where two individual profiles link together';
COMMENT ON COLUMN profiles.account_type IS 'Type: individual, couple_shared (1 profile 2 logins), couple_shell (2 profiles linked)';
COMMENT ON COLUMN profiles.partner1_email IS 'For couple_shared: first partner email for login';
COMMENT ON COLUMN profiles.partner2_email IS 'For couple_shared: second partner email for login';
COMMENT ON COLUMN profiles.power_exchange_level IS 'BDSM power exchange: None, Bedroom only, 24/7, High protocol';
COMMENT ON COLUMN profiles.poly_structure_detailed IS 'Detailed polyamory structure and configuration';
COMMENT ON COLUMN profiles.swinger_type IS 'Swinger preferences: Full swap, Soft swap, etc.';
