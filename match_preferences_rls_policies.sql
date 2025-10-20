-- =====================================================
-- MATCH PREFERENCES RLS POLICIES
-- =====================================================
-- This file contains RLS policies for updating match_preferences
-- in the profiles table. These policies ensure users can only
-- update their own match preferences while maintaining security.
--
-- Date: 2025
-- Purpose: Allow users to safely update their match preferences
-- =====================================================

-- =====================================================
-- 1. VERIFY EXISTING RLS IS ENABLED
-- =====================================================
-- RLS should already be enabled on profiles table from the main schema
-- This is just a verification step

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        -- Enable RLS if not already enabled
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on profiles table';
    ELSE
        RAISE NOTICE 'RLS already enabled on profiles table';
    END IF;
END $$;

-- =====================================================
-- 2. CREATE/UPDATE MATCH PREFERENCES UPDATE POLICY
-- =====================================================

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can update match preferences" ON profiles;

-- Create policy allowing users to update their own match preferences
-- This policy specifically allows updates to the match_preferences JSONB field
CREATE POLICY "Users can update match preferences"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. VALIDATION FUNCTION FOR MATCH PREFERENCES
-- =====================================================

-- Create a function to validate match_preferences structure
-- This ensures data integrity when updating preferences
CREATE OR REPLACE FUNCTION validate_match_preferences()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure match_preferences is a valid JSONB object
    IF NEW.match_preferences IS NOT NULL THEN
        -- Validate ageRange exists and is valid
        IF NOT (NEW.match_preferences ? 'ageRange') THEN
            RAISE EXCEPTION 'match_preferences must contain ageRange';
        END IF;
        
        -- Validate ageRange is an array with 2 elements
        IF jsonb_array_length(NEW.match_preferences->'ageRange') != 2 THEN
            RAISE EXCEPTION 'ageRange must be an array with exactly 2 elements';
        END IF;
        
        -- Validate age values are reasonable (18-99)
        IF (NEW.match_preferences->'ageRange'->0)::int < 18 OR 
           (NEW.match_preferences->'ageRange'->1)::int > 99 THEN
            RAISE EXCEPTION 'ageRange values must be between 18 and 99';
        END IF;
        
        -- Validate min age <= max age
        IF (NEW.match_preferences->'ageRange'->0)::int > 
           (NEW.match_preferences->'ageRange'->1)::int THEN
            RAISE EXCEPTION 'Minimum age cannot exceed maximum age';
        END IF;
        
        -- Validate distance is reasonable (0-200 miles)
        IF (NEW.match_preferences->>'distance')::int < 0 OR 
           (NEW.match_preferences->>'distance')::int > 200 THEN
            RAISE EXCEPTION 'Distance must be between 0 and 200 miles';
        END IF;
        
        -- Ensure required boolean fields exist
        IF NOT (NEW.match_preferences ? 'vipOnly') THEN
            NEW.match_preferences = NEW.match_preferences || '{"vipOnly": false}'::jsonb;
        END IF;
        
        IF NOT (NEW.match_preferences ? 'verifiedOnly') THEN
            NEW.match_preferences = NEW.match_preferences || '{"verifiedOnly": false}'::jsonb;
        END IF;
        
        -- Ensure array fields exist (can be empty)
        IF NOT (NEW.match_preferences ? 'genders') THEN
            NEW.match_preferences = NEW.match_preferences || '{"genders": []}'::jsonb;
        END IF;
        
        IF NOT (NEW.match_preferences ? 'sexualities') THEN
            NEW.match_preferences = NEW.match_preferences || '{"sexualities": []}'::jsonb;
        END IF;
        
        IF NOT (NEW.match_preferences ? 'searchingFor') THEN
            NEW.match_preferences = NEW.match_preferences || '{"searchingFor": []}'::jsonb;
        END IF;
        
        IF NOT (NEW.match_preferences ? 'experienceLevels') THEN
            NEW.match_preferences = NEW.match_preferences || '{"experienceLevels": []}'::jsonb;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE TRIGGER FOR VALIDATION
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_match_preferences_trigger ON profiles;

-- Create trigger to validate match_preferences before insert or update
CREATE TRIGGER validate_match_preferences_trigger
    BEFORE INSERT OR UPDATE OF match_preferences ON profiles
    FOR EACH ROW
    WHEN (NEW.match_preferences IS NOT NULL)
    EXECUTE FUNCTION validate_match_preferences();

-- =====================================================
-- 5. CREATE INDEX FOR MATCH PREFERENCES QUERIES
-- =====================================================

-- Create GIN index on match_preferences for efficient JSONB queries
-- This improves performance when filtering profiles by preferences
DROP INDEX IF EXISTS idx_profiles_match_preferences;
CREATE INDEX idx_profiles_match_preferences 
    ON profiles USING GIN (match_preferences);

-- Create index for age range queries
DROP INDEX IF EXISTS idx_profiles_match_age_range;
CREATE INDEX idx_profiles_match_age_range 
    ON profiles ((match_preferences->'ageRange'));

-- =====================================================
-- 6. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Ensure authenticated users can update match_preferences
GRANT UPDATE (match_preferences, updated_at) ON profiles TO authenticated;

-- =====================================================
-- 7. CREATE HELPER FUNCTION FOR MATCH PREFERENCE UPDATES
-- =====================================================

-- Function to update only match preferences (cleaner API)
CREATE OR REPLACE FUNCTION update_match_preferences(
    p_user_id UUID,
    p_preferences JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_updated_preferences JSONB;
BEGIN
    -- Verify the user is updating their own preferences
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Cannot update another user''s preferences';
    END IF;
    
    -- Update the match_preferences field
    UPDATE profiles
    SET 
        match_preferences = p_preferences,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING match_preferences INTO v_updated_preferences;
    
    -- Return the updated preferences
    RETURN v_updated_preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_match_preferences(UUID, JSONB) TO authenticated;

-- =====================================================
-- 8. COMPLETION LOG
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Match Preferences RLS Policies Installation Complete';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Created/Updated:';
    RAISE NOTICE '  ✓ RLS policy: "Users can update match preferences"';
    RAISE NOTICE '  ✓ Validation function: validate_match_preferences()';
    RAISE NOTICE '  ✓ Validation trigger: validate_match_preferences_trigger';
    RAISE NOTICE '  ✓ GIN index: idx_profiles_match_preferences';
    RAISE NOTICE '  ✓ Helper function: update_match_preferences()';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Users can now safely update their match preferences';
    RAISE NOTICE 'All updates are validated and secured with RLS';
    RAISE NOTICE '=================================================';
END $$;
