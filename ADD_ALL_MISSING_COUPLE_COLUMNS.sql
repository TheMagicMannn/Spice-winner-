-- =====================================================
-- ADD ALL MISSING COUPLE/PARTNER COLUMNS TO PROFILES TABLE
-- Comprehensive fix for all partner-related fields
-- =====================================================

-- Partner Experience Levels
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_experience TEXT DEFAULT 'New';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_experience TEXT DEFAULT 'New';

-- Partner Roles & Kink Info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_quiz_results JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_quiz_results JSONB DEFAULT '{}';

-- Partner Kinks Arrays
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_kinks TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_kinks TEXT[];

-- Partner Limits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_soft_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_soft_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_hard_limits TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_hard_limits TEXT[];

-- Partner Safety & Rules
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_safety_practices TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_safety_practices TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_rules TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_rules TEXT;

-- Partner 1 Physical Stats (if not already exist)
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
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_tattoos BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_piercings BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_body_hair TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_grooming_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_birth_control TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_latex_allergy BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_last_sti_test_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_sti_positive_results TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_can_host TEXT;

-- Partner 2 Physical Stats (if not already exist)
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
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_tattoos BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_piercings BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_body_hair TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_grooming_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_birth_control TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_latex_allergy BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_last_sti_test_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_sti_positive_results TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_can_host TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.partner1_experience IS 'Experience level for Partner 1 (New, Beginner, Moderate, Advanced)';
COMMENT ON COLUMN profiles.partner2_experience IS 'Experience level for Partner 2 (New, Beginner, Moderate, Advanced)';
COMMENT ON COLUMN profiles.partner1_role IS 'BDSM/Lifestyle role for Partner 1';
COMMENT ON COLUMN profiles.partner2_role IS 'BDSM/Lifestyle role for Partner 2';
COMMENT ON COLUMN profiles.partner1_kinks IS 'Array of kink interests for Partner 1';
COMMENT ON COLUMN profiles.partner2_kinks IS 'Array of kink interests for Partner 2';

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name LIKE 'partner%'
ORDER BY column_name;

-- Success message
SELECT 'All partner/couple columns added successfully!' as status;
