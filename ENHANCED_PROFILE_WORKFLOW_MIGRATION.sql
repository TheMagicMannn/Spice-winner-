-- =====================================================
-- SPICE ENHANCED PROFILE WORKFLOW MIGRATION
-- Database schema updates for new profile setup workflow
-- =====================================================

-- Step 2: Relationship Context fields
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

-- Step 7: What You're Seeking (Enhanced)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seeking_detailed TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS poly_role TEXT;

-- Step 8: Who You Want to Meet
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interested_in_genders TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interested_in_types TEXT[];

-- Conditional fields for Couples interest
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_pref TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_interaction TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couple_interaction_genders TEXT[];

-- Conditional fields for Singles interest
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS singles_genders TEXT[];

-- Conditional fields for Groups interest
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS group_types TEXT[];

-- Conditional fields for Polycules interest
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS polycule_preferences TEXT[];

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_relationship_context ON profiles(relationship_context);
CREATE INDEX IF NOT EXISTS idx_profiles_lifestyle_identities ON profiles USING GIN(lifestyle_identities);
CREATE INDEX IF NOT EXISTS idx_profiles_intent_here_for ON profiles USING GIN(intent_here_for);
CREATE INDEX IF NOT EXISTS idx_profiles_interested_in_types ON profiles USING GIN(interested_in_types);

-- Add comments for documentation
COMMENT ON COLUMN profiles.relationship_context IS 'User relationship situation: Single, Single but in Relationship, Married Solo, Partnered, Solo Poly, In a Polycule';
COMMENT ON COLUMN profiles.lifestyle_identities IS 'Communities user identifies with: Swinger, ENM, Poly, BDSM/Kink, Exploring';
COMMENT ON COLUMN profiles.intent_here_for IS 'What user is looking for: Dating, Play partners, Meeting couples/singles, etc.';
COMMENT ON COLUMN profiles.interested_in_types IS 'Types of connections: Singles, Couples, Groups, Polycules, Event hosts';

-- =====================================================
-- RLS POLICIES UPDATE
-- =====================================================
-- These new columns should follow the existing RLS patterns
-- The existing RLS policies should automatically cover these new columns
-- No additional RLS changes needed as they are part of the profiles table
