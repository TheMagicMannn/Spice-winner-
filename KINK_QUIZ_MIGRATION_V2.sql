-- =====================================================
-- KINK QUIZ MIGRATION TO V2 (CORRECTED CATEGORIES)
-- =====================================================
-- This migration updates the quiz to use corrected category mappings
-- Run this AFTER updating the KinkQuiz.tsx component
-- =====================================================

-- =====================================================
-- 1. BACKUP EXISTING RESULTS (OPTIONAL BUT RECOMMENDED)
-- =====================================================

-- Create a backup table for old results
CREATE TABLE IF NOT EXISTS kink_quiz_results_v1_backup (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    old_results JSONB NOT NULL,
    backed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backup all existing quiz results
INSERT INTO kink_quiz_results_v1_backup (user_id, profile_id, old_results)
SELECT 
    auth_users.id as user_id,
    profiles.id as profile_id,
    profiles.kink_quiz_results as old_results
FROM profiles
LEFT JOIN auth.users auth_users ON profiles.id = auth_users.id
WHERE profiles.kink_quiz_results IS NOT NULL;

-- Also backup to history table
INSERT INTO kink_quiz_history (user_id, quiz_results)
SELECT 
    auth_users.id as user_id,
    profiles.kink_quiz_results
FROM profiles
LEFT JOIN auth.users auth_users ON profiles.id = auth_users.id
WHERE profiles.kink_quiz_results IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM kink_quiz_history h 
    WHERE h.user_id = auth_users.id 
    AND h.quiz_results = profiles.kink_quiz_results
  );

-- Log backup count
DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM kink_quiz_results_v1_backup;
    RAISE NOTICE '✓ Backed up % existing quiz results', backup_count;
END $$;

-- =====================================================
-- 2. ADD VERSION TRACKING
-- =====================================================

-- Add quiz_version column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'kink_quiz_version'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN kink_quiz_version INTEGER DEFAULT 1;
        
        RAISE NOTICE '✓ Added kink_quiz_version column to profiles';
    ELSE
        RAISE NOTICE '  kink_quiz_version column already exists';
    END IF;
END $$;

-- Add version to history table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'kink_quiz_history' 
        AND column_name = 'quiz_version'
    ) THEN
        ALTER TABLE kink_quiz_history 
        ADD COLUMN quiz_version INTEGER DEFAULT 1;
        
        RAISE NOTICE '✓ Added quiz_version column to kink_quiz_history';
    ELSE
        RAISE NOTICE '  quiz_version column already exists';
    END IF;
END $$;

-- =====================================================
-- 3. CLEAR OLD RESULTS
-- =====================================================

-- Option A: Clear all results (recommended for accuracy)
UPDATE profiles
SET 
    kink_quiz_results = NULL,
    kink_quiz_taken_at = NULL,
    kink_quiz_version = 2,
    updated_at = NOW()
WHERE kink_quiz_results IS NOT NULL;

-- Log cleared count
DO $$
DECLARE
    cleared_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cleared_count 
    FROM profiles 
    WHERE kink_quiz_version = 2 AND kink_quiz_results IS NULL;
    
    RAISE NOTICE '✓ Cleared % user quiz results for retake', cleared_count;
END $$;

-- =====================================================
-- 4. UPDATE FUNCTIONS FOR V2
-- =====================================================

-- Update save function to include version
CREATE OR REPLACE FUNCTION save_kink_quiz_results(
    p_user_id UUID,
    p_quiz_results JSONB,
    p_version INTEGER DEFAULT 2
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_results JSONB;
    v_old_version INTEGER;
    v_result JSONB;
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    
    -- Get existing results and version before updating
    SELECT kink_quiz_results, kink_quiz_version 
    INTO v_old_results, v_old_version
    FROM profiles
    WHERE id = p_user_id;
    
    -- If user had previous results, archive them with version
    IF v_old_results IS NOT NULL THEN
        INSERT INTO kink_quiz_history (user_id, quiz_results, quiz_version)
        VALUES (p_user_id, v_old_results, COALESCE(v_old_version, 1));
    END IF;
    
    -- Update profile with new results and version
    UPDATE profiles
    SET 
        kink_quiz_results = p_quiz_results,
        kink_quiz_taken_at = NOW(),
        kink_quiz_version = p_version,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING jsonb_build_object(
        'success', true,
        'quiz_results', kink_quiz_results,
        'taken_at', kink_quiz_taken_at,
        'version', kink_quiz_version
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION save_kink_quiz_results(UUID, JSONB, INTEGER) TO authenticated;

-- =====================================================
-- 5. CREATE MIGRATION REPORT FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_quiz_migration_report()
RETURNS TABLE (
    metric TEXT,
    count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total Users with Old Results (V1)' as metric, 
           COUNT(*) as count
    FROM kink_quiz_results_v1_backup
    
    UNION ALL
    
    SELECT 'Users Cleared for Retake' as metric, 
           COUNT(*) as count
    FROM profiles 
    WHERE kink_quiz_version = 2 AND kink_quiz_results IS NULL
    
    UNION ALL
    
    SELECT 'Users Completed V2 Quiz' as metric, 
           COUNT(*) as count
    FROM profiles 
    WHERE kink_quiz_version = 2 AND kink_quiz_results IS NOT NULL
    
    UNION ALL
    
    SELECT 'Total History Records' as metric, 
           COUNT(*) as count
    FROM kink_quiz_history;
END;
$$;

GRANT EXECUTE ON FUNCTION get_quiz_migration_report() TO authenticated;

-- =====================================================
-- 6. CREATE COMPARISON FUNCTION (OPTIONAL)
-- =====================================================

-- Allow users to compare V1 vs V2 results if they retake
CREATE OR REPLACE FUNCTION compare_quiz_versions(p_user_id UUID)
RETURNS TABLE (
    category TEXT,
    v1_percentage INTEGER,
    v2_percentage INTEGER,
    difference INTEGER
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
    WITH v1_results AS (
        SELECT old_results
        FROM kink_quiz_results_v1_backup
        WHERE profile_id = p_user_id
        ORDER BY backed_up_at DESC
        LIMIT 1
    ),
    v2_results AS (
        SELECT kink_quiz_results
        FROM profiles
        WHERE id = p_user_id
        AND kink_quiz_version = 2
    )
    SELECT 
        COALESCE(v1_keys.key, v2_keys.key)::TEXT as category,
        COALESCE((v1_results.old_results->>v1_keys.key)::INTEGER, 0) as v1_percentage,
        COALESCE((v2_results.kink_quiz_results->>v2_keys.key)::INTEGER, 0) as v2_percentage,
        COALESCE((v2_results.kink_quiz_results->>v2_keys.key)::INTEGER, 0) - 
        COALESCE((v1_results.old_results->>v1_keys.key)::INTEGER, 0) as difference
    FROM v1_results
    FULL OUTER JOIN v2_results ON true
    FULL OUTER JOIN LATERAL jsonb_each_text(v1_results.old_results) v1_keys ON true
    FULL OUTER JOIN LATERAL jsonb_each_text(v2_results.kink_quiz_results) v2_keys ON true
    WHERE COALESCE(v1_keys.key, v2_keys.key) IS NOT NULL
    ORDER BY ABS(
        COALESCE((v2_results.kink_quiz_results->>v2_keys.key)::INTEGER, 0) - 
        COALESCE((v1_results.old_results->>v1_keys.key)::INTEGER, 0)
    ) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION compare_quiz_versions(UUID) TO authenticated;

-- =====================================================
-- 7. ADD COMMENTS
-- =====================================================

COMMENT ON COLUMN profiles.kink_quiz_version IS 
'Quiz version number: 1 = original mappings, 2 = corrected mappings (2024)';

COMMENT ON TABLE kink_quiz_results_v1_backup IS 
'Backup of quiz results from V1 (original) before migration to V2 (corrected)';

COMMENT ON FUNCTION save_kink_quiz_results(UUID, JSONB, INTEGER) IS 
'Saves quiz results with version tracking. V2 uses corrected category mappings.';

COMMENT ON FUNCTION compare_quiz_versions(UUID) IS 
'Compares V1 vs V2 quiz results for a user to see how corrected mappings affected their profile';

-- =====================================================
-- 8. FINAL REPORT
-- =====================================================

DO $$
DECLARE
    v_backup_count INTEGER;
    v_cleared_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_backup_count FROM kink_quiz_results_v1_backup;
    SELECT COUNT(*) INTO v_cleared_count 
    FROM profiles 
    WHERE kink_quiz_version = 2 AND kink_quiz_results IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'KINK QUIZ MIGRATION TO V2 - COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Backed up % V1 results', v_backup_count;
    RAISE NOTICE '✓ Cleared % user results for retake', v_cleared_count;
    RAISE NOTICE '✓ Version tracking enabled';
    RAISE NOTICE '✓ Updated save functions';
    RAISE NOTICE '✓ Created comparison functions';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Users will be prompted to retake quiz';
    RAISE NOTICE '2. New results will use V2 (corrected) mappings';
    RAISE NOTICE '3. Old results are safely backed up';
    RAISE NOTICE '';
    RAISE NOTICE 'Run: SELECT * FROM get_quiz_migration_report();';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Check migration status
SELECT * FROM get_quiz_migration_report();

-- View backed up results (optional)
-- SELECT * FROM kink_quiz_results_v1_backup LIMIT 5;
