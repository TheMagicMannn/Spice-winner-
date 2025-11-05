-- =====================================================
-- KINK QUIZ SYSTEM - COMPLETE SETUP
-- =====================================================
-- This file sets up the complete kink quiz system including:
-- 1. Database schema for storing quiz results
-- 2. RLS policies for secure access
-- 3. Triggers for automatic updates
-- 4. Functions for quiz result management
-- =====================================================

-- =====================================================
-- 1. ADD KINK QUIZ RESULTS COLUMN TO PROFILES TABLE
-- =====================================================

-- Add kink_quiz_results column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'kink_quiz_results'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN kink_quiz_results JSONB DEFAULT NULL;
        
        RAISE NOTICE 'Added kink_quiz_results column to profiles table';
    ELSE
        RAISE NOTICE 'kink_quiz_results column already exists in profiles table';
    END IF;
END $$;

-- Add kink_quiz_taken_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'kink_quiz_taken_at'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN kink_quiz_taken_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        
        RAISE NOTICE 'Added kink_quiz_taken_at column to profiles table';
    ELSE
        RAISE NOTICE 'kink_quiz_taken_at column already exists in profiles table';
    END IF;
END $$;

-- Add index for faster queries on quiz results
CREATE INDEX IF NOT EXISTS idx_profiles_kink_quiz_results 
ON profiles USING GIN (kink_quiz_results);

-- =====================================================
-- 2. KINK QUIZ HISTORY TABLE (OPTIONAL - FOR TRACKING)
-- =====================================================
-- This table stores historical quiz results for users who retake the quiz

CREATE TABLE IF NOT EXISTS kink_quiz_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    quiz_results JSONB NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_quiz_results CHECK (jsonb_typeof(quiz_results) = 'object')
);

-- Add index for user lookups
CREATE INDEX IF NOT EXISTS idx_kink_quiz_history_user_id 
ON kink_quiz_history(user_id, taken_at DESC);

-- Enable RLS on kink_quiz_history
ALTER TABLE kink_quiz_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. RLS POLICIES FOR KINK QUIZ HISTORY
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own quiz history" ON kink_quiz_history;
DROP POLICY IF EXISTS "Users can insert own quiz history" ON kink_quiz_history;
DROP POLICY IF EXISTS "Users can delete own quiz history" ON kink_quiz_history;

-- Policy: Users can view their own quiz history
CREATE POLICY "Users can view own quiz history"
ON kink_quiz_history
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own quiz history
CREATE POLICY "Users can insert own quiz history"
ON kink_quiz_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own quiz history
CREATE POLICY "Users can delete own quiz history"
ON kink_quiz_history
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 4. FUNCTION: SAVE QUIZ RESULTS WITH HISTORY
-- =====================================================
-- This function saves quiz results and archives old results in history

CREATE OR REPLACE FUNCTION save_kink_quiz_results(
    p_user_id UUID,
    p_quiz_results JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_results JSONB;
    v_result JSONB;
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    
    -- Get existing results before updating
    SELECT kink_quiz_results INTO v_old_results
    FROM profiles
    WHERE id = p_user_id;
    
    -- If user had previous results, archive them
    IF v_old_results IS NOT NULL THEN
        INSERT INTO kink_quiz_history (user_id, quiz_results)
        VALUES (p_user_id, v_old_results);
    END IF;
    
    -- Update profile with new results
    UPDATE profiles
    SET 
        kink_quiz_results = p_quiz_results,
        kink_quiz_taken_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING jsonb_build_object(
        'success', true,
        'quiz_results', kink_quiz_results,
        'taken_at', kink_quiz_taken_at
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_kink_quiz_results(UUID, JSONB) TO authenticated;

-- =====================================================
-- 5. FUNCTION: GET QUIZ HISTORY
-- =====================================================
-- This function retrieves quiz history for a user

CREATE OR REPLACE FUNCTION get_kink_quiz_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    quiz_results JSONB,
    taken_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if requesting user is the owner
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    RETURN QUERY
    SELECT 
        h.id,
        h.quiz_results,
        h.taken_at
    FROM kink_quiz_history h
    WHERE h.user_id = p_user_id
    ORDER BY h.taken_at DESC
    LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_kink_quiz_history(UUID, INTEGER) TO authenticated;

-- =====================================================
-- 6. FUNCTION: CLEAR QUIZ RESULTS
-- =====================================================
-- This function allows users to clear their quiz results

CREATE OR REPLACE FUNCTION clear_kink_quiz_results(
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Check if requesting user is the owner
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Archive current results before clearing
    INSERT INTO kink_quiz_history (user_id, quiz_results)
    SELECT id, kink_quiz_results
    FROM profiles
    WHERE id = p_user_id AND kink_quiz_results IS NOT NULL;
    
    -- Clear quiz results
    UPDATE profiles
    SET 
        kink_quiz_results = NULL,
        kink_quiz_taken_at = NULL,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING jsonb_build_object(
        'success', true,
        'message', 'Quiz results cleared successfully'
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION clear_kink_quiz_results(UUID) TO authenticated;

-- =====================================================
-- 7. TRIGGER: UPDATE TIMESTAMP ON QUIZ RESULTS CHANGE
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_update_kink_quiz_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only update timestamp if kink_quiz_results actually changed
    IF NEW.kink_quiz_results IS DISTINCT FROM OLD.kink_quiz_results THEN
        NEW.kink_quiz_taken_at := NOW();
        NEW.updated_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_kink_quiz_timestamp ON profiles;

-- Create trigger
CREATE TRIGGER update_kink_quiz_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
WHEN (NEW.kink_quiz_results IS DISTINCT FROM OLD.kink_quiz_results)
EXECUTE FUNCTION trigger_update_kink_quiz_timestamp();

-- =====================================================
-- 8. HELPER FUNCTION: GET TOP KINK ROLES
-- =====================================================
-- This function extracts top N roles from quiz results

CREATE OR REPLACE FUNCTION get_top_kink_roles(
    p_quiz_results JSONB,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    role_name TEXT,
    percentage INTEGER
)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        key::TEXT as role_name,
        value::INTEGER as percentage
    FROM jsonb_each_text(p_quiz_results)
    ORDER BY value::INTEGER DESC
    LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_top_kink_roles(JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_kink_roles(JSONB, INTEGER) TO anon;

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN profiles.kink_quiz_results IS 
'Stores user BDSM/Kink quiz results as JSONB. Format: {"Dominant": 85, "Sadist": 72, ...}';

COMMENT ON COLUMN profiles.kink_quiz_taken_at IS 
'Timestamp when the user last took the kink quiz';

COMMENT ON TABLE kink_quiz_history IS 
'Stores historical kink quiz results for users who retake the quiz';

COMMENT ON FUNCTION save_kink_quiz_results(UUID, JSONB) IS 
'Saves quiz results to profile and archives old results in history table';

COMMENT ON FUNCTION get_kink_quiz_history(UUID, INTEGER) IS 
'Retrieves quiz history for a user with optional limit';

COMMENT ON FUNCTION clear_kink_quiz_results(UUID) IS 
'Clears quiz results from profile after archiving in history';

COMMENT ON FUNCTION get_top_kink_roles(JSONB, INTEGER) IS 
'Extracts top N roles from quiz results sorted by percentage';

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Ensure authenticated users can read/write their own profiles
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Ensure public can read profile data (for matching)
GRANT SELECT ON profiles TO anon;

-- =====================================================
-- END OF KINK QUIZ SYSTEM SETUP
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✓ Kink Quiz System setup completed successfully';
    RAISE NOTICE '  - Quiz results column added to profiles';
    RAISE NOTICE '  - Quiz history table created';
    RAISE NOTICE '  - RLS policies configured';
    RAISE NOTICE '  - Helper functions created';
    RAISE NOTICE '  - Triggers configured';
END $$;
