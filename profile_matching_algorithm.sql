-- =====================================================
-- PROFILE MATCHING ALGORITHM & SYSTEM
-- =====================================================
-- Comprehensive matching system that uses match_preferences to find
-- compatible profiles with mutual compatibility scoring
-- 
-- Features:
-- - Bidirectional matching (both users must match each other's preferences)
-- - Compatibility scoring (0-100)
-- - Distance-based filtering
-- - Swipe history tracking (like/pass)
-- - Efficient querying with indexes
-- =====================================================

-- =====================================================
-- 1. CREATE SWIPE ACTIONS TABLE
-- =====================================================

-- Table to track user swipe actions (like/pass)
CREATE TABLE IF NOT EXISTS swipe_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Action type
    action TEXT CHECK (action IN ('like', 'pass', 'super_like')) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate actions for same pair
    UNIQUE(user_id, target_user_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_swipe_actions_user_id ON swipe_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_actions_target_user_id ON swipe_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_actions_action ON swipe_actions(action);
CREATE INDEX IF NOT EXISTS idx_swipe_actions_created_at ON swipe_actions(created_at);

-- =====================================================
-- 2. ADD LOCATION COORDINATES TO PROFILES
-- =====================================================

-- Add latitude and longitude columns for distance calculations
DO $$ 
BEGIN
    -- Add latitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE profiles ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    -- Add longitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE profiles ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
    
    RAISE NOTICE 'Location coordinates columns added to profiles table';
END $$;

-- Create spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);

-- =====================================================
-- 3. CALCULATE DISTANCE FUNCTION
-- =====================================================

-- Function to calculate distance between two points using Haversine formula
-- Returns distance in miles
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    r DECIMAL := 3959; -- Earth's radius in miles
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    -- Handle null values
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;
    
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlon/2) * sin(dlon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 4. MATCH COMPATIBILITY SCORING FUNCTION
-- =====================================================

-- Function to calculate compatibility score between two profiles
-- Returns score from 0-100 based on how well they match each other's preferences
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
    user_profile JSONB,
    target_profile JSONB,
    user_preferences JSONB,
    target_preferences JSONB
)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    max_score INTEGER := 0;
    age_match BOOLEAN := FALSE;
    gender_match BOOLEAN := FALSE;
    sexuality_match BOOLEAN := FALSE;
    account_type_match BOOLEAN := FALSE;
    experience_match BOOLEAN := FALSE;
BEGIN
    -- Age range matching (20 points each direction = 40 total)
    max_score := max_score + 40;
    
    -- Check if target's age falls within user's preferred range
    IF (target_profile->>'age')::INTEGER >= (user_preferences->'ageRange'->0)::INTEGER 
       AND (target_profile->>'age')::INTEGER <= (user_preferences->'ageRange'->1)::INTEGER THEN
        score := score + 20;
    END IF;
    
    -- Check if user's age falls within target's preferred range
    IF (user_profile->>'age')::INTEGER >= (target_preferences->'ageRange'->0)::INTEGER 
       AND (user_profile->>'age')::INTEGER <= (target_preferences->'ageRange'->1)::INTEGER THEN
        score := score + 20;
    END IF;
    
    -- Gender matching (20 points each direction = 40 total)
    max_score := max_score + 40;
    
    -- Check if target's gender is in user's preferred genders (or user has no preference)
    IF jsonb_array_length(user_preferences->'genders') = 0 
       OR user_preferences->'genders' @> to_jsonb(ARRAY[target_profile->>'gender']) THEN
        score := score + 20;
    END IF;
    
    -- Check if user's gender is in target's preferred genders (or target has no preference)
    IF jsonb_array_length(target_preferences->'genders') = 0 
       OR target_preferences->'genders' @> to_jsonb(ARRAY[user_profile->>'gender']) THEN
        score := score + 20;
    END IF;
    
    -- Sexuality/Orientation matching (20 points each direction = 40 total)
    max_score := max_score + 40;
    
    -- Check if target's orientation is in user's preferred sexualities
    IF jsonb_array_length(user_preferences->'sexualities') = 0 
       OR user_preferences->'sexualities' @> to_jsonb(ARRAY[target_profile->>'orientation']) THEN
        score := score + 20;
    END IF;
    
    -- Check if user's orientation is in target's preferred sexualities
    IF jsonb_array_length(target_preferences->'sexualities') = 0 
       OR target_preferences->'sexualities' @> to_jsonb(ARRAY[user_profile->>'orientation']) THEN
        score := score + 20;
    END IF;
    
    -- Account type matching (10 points each direction = 20 total)
    max_score := max_score + 20;
    
    -- Check if target's account type matches user's searchingFor preference
    IF jsonb_array_length(user_preferences->'searchingFor') = 0 
       OR user_preferences->'searchingFor' @> to_jsonb(ARRAY['Both'])
       OR (user_preferences->'searchingFor' @> to_jsonb(ARRAY['Individual']) 
           AND target_profile->>'accountType' = 'individual')
       OR (user_preferences->'searchingFor' @> to_jsonb(ARRAY['Couple']) 
           AND target_profile->>'accountType' = 'couple') THEN
        score := score + 10;
    END IF;
    
    -- Check if user's account type matches target's searchingFor preference
    IF jsonb_array_length(target_preferences->'searchingFor') = 0 
       OR target_preferences->'searchingFor' @> to_jsonb(ARRAY['Both'])
       OR (target_preferences->'searchingFor' @> to_jsonb(ARRAY['Individual']) 
           AND user_profile->>'accountType' = 'individual')
       OR (target_preferences->'searchingFor' @> to_jsonb(ARRAY['Couple']) 
           AND user_profile->>'accountType' = 'couple') THEN
        score := score + 10;
    END IF;
    
    -- Experience level matching (10 points if both have matching preferences)
    max_score := max_score + 10;
    
    IF (jsonb_array_length(user_preferences->'experienceLevels') = 0 
        OR user_preferences->'experienceLevels' @> to_jsonb(ARRAY[target_profile->>'lifestyleExperience']))
       AND (jsonb_array_length(target_preferences->'experienceLevels') = 0 
            OR target_preferences->'experienceLevels' @> to_jsonb(ARRAY[user_profile->>'lifestyleExperience'])) THEN
        score := score + 10;
    END IF;
    
    -- Normalize score to 0-100 scale
    IF max_score > 0 THEN
        RETURN (score * 100) / max_score;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 5. GET MATCHED PROFILES FUNCTION
-- =====================================================

-- Main function to get matched profiles for a user
CREATE OR REPLACE FUNCTION get_matched_profiles(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    profile_id UUID,
    display_name TEXT,
    display_name2 TEXT,
    age INTEGER,
    age2 INTEGER,
    account_type TEXT,
    location TEXT,
    bio TEXT,
    photos TEXT[],
    gender TEXT,
    gender2 TEXT,
    orientation TEXT,
    orientation2 TEXT,
    relationship_status TEXT,
    lifestyle_experience TEXT,
    interests TEXT[],
    kinks TEXT[],
    membership_tier TEXT,
    is_verified BOOLEAN,
    distance_miles DECIMAL,
    compatibility_score INTEGER,
    last_active_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    user_profile RECORD;
    user_prefs JSONB;
BEGIN
    -- Get current user's profile and preferences
    SELECT p.*, p.match_preferences INTO user_profile
    FROM profiles p
    WHERE p.id = p_user_id;
    
    -- If user profile doesn't exist, return empty
    IF user_profile.id IS NULL THEN
        RETURN;
    END IF;
    
    user_prefs := user_profile.match_preferences;
    
    -- If user hasn't set preferences, use defaults
    IF user_prefs IS NULL THEN
        user_prefs := '{
            "ageRange": [18, 99],
            "genders": [],
            "sexualities": [],
            "searchingFor": [],
            "distance": 200,
            "vipOnly": false,
            "verifiedOnly": false,
            "experienceLevels": []
        }'::jsonb;
    END IF;
    
    -- Return matched profiles with scoring
    RETURN QUERY
    SELECT 
        p.id AS profile_id,
        p.display_name,
        p.display_name2,
        p.age,
        p.age2,
        p.account_type::TEXT,
        p.location,
        p.bio,
        p.photos,
        p.gender::TEXT,
        p.gender2::TEXT,
        p.orientation::TEXT,
        p.orientation2::TEXT,
        p.relationship_status::TEXT,
        p.lifestyle_experience::TEXT,
        p.interests,
        p.kinks,
        p.membership_tier::TEXT,
        p.is_verified,
        calculate_distance(
            user_profile.latitude, 
            user_profile.longitude, 
            p.latitude, 
            p.longitude
        ) AS distance_miles,
        calculate_compatibility_score(
            to_jsonb(user_profile),
            to_jsonb(p),
            user_prefs,
            COALESCE(p.match_preferences, '{}'::jsonb)
        ) AS compatibility_score,
        p.last_active_at
    FROM profiles p
    WHERE 
        -- Exclude self
        p.id != p_user_id
        
        -- Must be active and profile completed
        AND p.is_active = TRUE
        AND p.profile_completed = TRUE
        
        -- Exclude already swiped profiles
        AND NOT EXISTS (
            SELECT 1 FROM swipe_actions sa
            WHERE sa.user_id = p_user_id
            AND sa.target_user_id = p.id
        )
        
        -- Age range filter (user's preference)
        AND p.age >= (user_prefs->'ageRange'->0)::INTEGER
        AND p.age <= (user_prefs->'ageRange'->1)::INTEGER
        
        -- Gender filter (if user has preference)
        AND (
            jsonb_array_length(user_prefs->'genders') = 0
            OR user_prefs->'genders' @> to_jsonb(ARRAY[p.gender::TEXT])
        )
        
        -- Sexuality filter (if user has preference)
        AND (
            jsonb_array_length(user_prefs->'sexualities') = 0
            OR user_prefs->'sexualities' @> to_jsonb(ARRAY[p.orientation::TEXT])
        )
        
        -- Account type filter (searchingFor)
        AND (
            jsonb_array_length(user_prefs->'searchingFor') = 0
            OR user_prefs->'searchingFor' @> to_jsonb(ARRAY['Both'])
            OR (user_prefs->'searchingFor' @> to_jsonb(ARRAY['Individual']) 
                AND p.account_type = 'individual')
            OR (user_prefs->'searchingFor' @> to_jsonb(ARRAY['Couple']) 
                AND p.account_type = 'couple')
        )
        
        -- Distance filter (if coordinates available)
        AND (
            user_profile.latitude IS NULL 
            OR user_profile.longitude IS NULL
            OR p.latitude IS NULL
            OR p.longitude IS NULL
            OR calculate_distance(
                user_profile.latitude,
                user_profile.longitude,
                p.latitude,
                p.longitude
            ) <= (user_prefs->>'distance')::DECIMAL
        )
        
        -- VIP only filter
        AND (
            (user_prefs->>'vipOnly')::BOOLEAN = FALSE
            OR p.membership_tier = 'vip'
        )
        
        -- Verified only filter
        AND (
            (user_prefs->>'verifiedOnly')::BOOLEAN = FALSE
            OR p.is_verified = TRUE
        )
        
        -- Experience level filter
        AND (
            jsonb_array_length(user_prefs->'experienceLevels') = 0
            OR user_prefs->'experienceLevels' @> to_jsonb(ARRAY[p.lifestyle_experience::TEXT])
        )
        
        -- Must have minimum compatibility score (at least 40%)
        AND calculate_compatibility_score(
            to_jsonb(user_profile),
            to_jsonb(p),
            user_prefs,
            COALESCE(p.match_preferences, '{}'::jsonb)
        ) >= 40
    
    -- Order by compatibility score (highest first), then by last active
    ORDER BY 
        compatibility_score DESC,
        p.last_active_at DESC
    
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. RECORD SWIPE ACTION FUNCTION
-- =====================================================

-- Function to record a swipe action (like/pass)
CREATE OR REPLACE FUNCTION record_swipe_action(
    p_user_id UUID,
    p_target_user_id UUID,
    p_action TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_existing_action TEXT;
    v_mutual_like BOOLEAN := FALSE;
    v_match_id UUID;
BEGIN
    -- Validate action type
    IF p_action NOT IN ('like', 'pass', 'super_like') THEN
        RAISE EXCEPTION 'Invalid action type. Must be like, pass, or super_like';
    END IF;
    
    -- Validate users exist and are different
    IF p_user_id = p_target_user_id THEN
        RAISE EXCEPTION 'Cannot swipe on yourself';
    END IF;
    
    -- Check if action already exists
    SELECT action INTO v_existing_action
    FROM swipe_actions
    WHERE user_id = p_user_id AND target_user_id = p_target_user_id;
    
    -- Insert or update swipe action
    INSERT INTO swipe_actions (user_id, target_user_id, action)
    VALUES (p_user_id, p_target_user_id, p_action)
    ON CONFLICT (user_id, target_user_id) 
    DO UPDATE SET 
        action = p_action,
        created_at = NOW();
    
    -- If this is a 'like' action, check for mutual like (match)
    IF p_action IN ('like', 'super_like') THEN
        -- Check if target user also liked this user
        SELECT EXISTS(
            SELECT 1 FROM swipe_actions
            WHERE user_id = p_target_user_id
            AND target_user_id = p_user_id
            AND action IN ('like', 'super_like')
        ) INTO v_mutual_like;
        
        -- If mutual like, create or update match
        IF v_mutual_like THEN
            -- Check if match already exists
            SELECT id INTO v_match_id
            FROM matches
            WHERE (user1_id = p_user_id AND user2_id = p_target_user_id)
               OR (user1_id = p_target_user_id AND user2_id = p_user_id);
            
            IF v_match_id IS NULL THEN
                -- Create new match
                INSERT INTO matches (user1_id, user2_id, status, matched_at, initiated_by)
                VALUES (
                    LEAST(p_user_id, p_target_user_id),
                    GREATEST(p_user_id, p_target_user_id),
                    'matched',
                    NOW(),
                    p_user_id
                )
                RETURNING id INTO v_match_id;
            ELSE
                -- Update existing match status
                UPDATE matches
                SET 
                    status = 'matched',
                    matched_at = NOW()
                WHERE id = v_match_id;
            END IF;
        END IF;
    END IF;
    
    -- Return result
    RETURN jsonb_build_object(
        'success', true,
        'action', p_action,
        'is_match', v_mutual_like,
        'match_id', v_match_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RLS POLICIES FOR SWIPE ACTIONS
-- =====================================================

-- Enable RLS on swipe_actions table
ALTER TABLE swipe_actions ENABLE ROW LEVEL SECURITY;

-- Users can view their own swipe actions
CREATE POLICY "Users can view their own swipes"
    ON swipe_actions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own swipe actions
CREATE POLICY "Users can create swipes"
    ON swipe_actions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own swipe actions
CREATE POLICY "Users can update their swipes"
    ON swipe_actions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users cannot delete swipe actions (maintain history)
-- No DELETE policy = no one can delete

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON swipe_actions TO authenticated;
GRANT INSERT ON swipe_actions TO authenticated;
GRANT UPDATE ON swipe_actions TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_compatibility_score(JSONB, JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_matched_profiles(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_swipe_action(UUID, UUID, TEXT) TO authenticated;

-- =====================================================
-- 9. CREATE HELPER VIEWS
-- =====================================================

-- View to see mutual likes that haven't been matched yet
CREATE OR REPLACE VIEW mutual_likes AS
SELECT 
    sa1.user_id AS user1_id,
    sa1.target_user_id AS user2_id,
    sa1.created_at AS user1_liked_at,
    sa2.created_at AS user2_liked_at
FROM swipe_actions sa1
INNER JOIN swipe_actions sa2 
    ON sa1.user_id = sa2.target_user_id 
    AND sa1.target_user_id = sa2.user_id
WHERE sa1.action IN ('like', 'super_like')
  AND sa2.action IN ('like', 'super_like')
  AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user1_id = sa1.user_id AND m.user2_id = sa1.target_user_id)
         OR (m.user1_id = sa1.target_user_id AND m.user2_id = sa1.user_id)
  );

-- =====================================================
-- 10. PERFORMANCE OPTIMIZATION INDEXES
-- =====================================================

-- Composite indexes for efficient matching queries
CREATE INDEX IF NOT EXISTS idx_profiles_matching_filters 
    ON profiles(is_active, profile_completed, age) 
    WHERE is_active = TRUE AND profile_completed = TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_membership_verified 
    ON profiles(membership_tier, is_verified) 
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_last_active 
    ON profiles(last_active_at DESC) 
    WHERE is_active = TRUE;

-- =====================================================
-- 11. COMPLETION LOG
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Profile Matching Algorithm Installation Complete';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  * swipe_actions table for tracking likes/passes';
    RAISE NOTICE '  * Location coordinates (latitude/longitude) in profiles';
    RAISE NOTICE '  * calculate_distance() - Haversine formula';
    RAISE NOTICE '  * calculate_compatibility_score() - 0-100 scoring';
    RAISE NOTICE '  * get_matched_profiles() - Main matching function';
    RAISE NOTICE '  * record_swipe_action() - Track user actions';
    RAISE NOTICE '  * RLS policies for swipe_actions';
    RAISE NOTICE '  * Performance indexes for fast queries';
    RAISE NOTICE '  * mutual_likes view for analytics';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Matching Algorithm Features:';
    RAISE NOTICE '  * Bidirectional compatibility scoring';
    RAISE NOTICE '  * Age, gender, sexuality matching';
    RAISE NOTICE '  * Distance-based filtering';
    RAISE NOTICE '  * Experience level matching';
    RAISE NOTICE '  * VIP and verified filters';
    RAISE NOTICE '  * Automatic match creation on mutual likes';
    RAISE NOTICE '  * Minimum 40%% compatibility threshold';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Update profiles with location coordinates';
    RAISE NOTICE '  2. Use get_matched_profiles() in Browse page';
    RAISE NOTICE '  3. Call record_swipe_action() on user swipes';
    RAISE NOTICE '=================================================';
END $$;
