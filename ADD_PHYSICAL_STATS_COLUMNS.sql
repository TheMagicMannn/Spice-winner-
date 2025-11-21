-- Migration: Add Physical Stats Fields to Profiles Table
-- This adds all physical stats fields for Individual and Couple accounts
-- To match EditProfileModal.tsx and UserProfile.tsx

-- ============================================
-- INDIVIDUAL ACCOUNT PHYSICAL STATS
-- ============================================

-- Physical Appearance (Individual)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS height TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS body_type TEXT CHECK (body_type IS NULL OR body_type IN (
    'Slim', 'Average', 'Athletic', 'Muscular', 'Curvy', 'Dad Bod', 
    'Thick', 'BBW', 'Fit', 'Petite', 'Heavyset'
  )),
  ADD COLUMN IF NOT EXISTS hair_color TEXT CHECK (hair_color IS NULL OR hair_color IN (
    'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 
    'White', 'Salt and Pepper', 'Bald', 'Other'
  )),
  ADD COLUMN IF NOT EXISTS eye_color TEXT CHECK (eye_color IS NULL OR eye_color IN (
    'Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Other'
  )),
  ADD COLUMN IF NOT EXISTS facial_hair TEXT CHECK (facial_hair IS NULL OR facial_hair IN (
    'Clean Shaven', 'Stubble', 'Goatee', 'Beard', 'Mustache', 
    'Full Beard', 'Doesn''t Apply'
  )),
  ADD COLUMN IF NOT EXISTS ethnicity TEXT CHECK (ethnicity IS NULL OR ethnicity IN (
    'Asian', 'Black/African', 'Caucasian/White', 'Hispanic/Latino', 
    'Middle Eastern', 'Native American', 'Pacific Islander', 
    'Mixed/Multiracial', 'Other', 'Prefer not to say'
  )),
  ADD COLUMN IF NOT EXISTS body_hair TEXT CHECK (body_hair IS NULL OR body_hair IN (
    'None', 'Light', 'Moderate', 'Heavy', 'Trimmed', 'Natural'
  )),
  ADD COLUMN IF NOT EXISTS grooming_style TEXT CHECK (grooming_style IS NULL OR grooming_style IN (
    'Natural', 'Trimmed', 'Shaved', 'Waxed', 'Prefer not to say'
  )),
  ADD COLUMN IF NOT EXISTS tattoos BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS piercings BOOLEAN DEFAULT FALSE;

-- Lifestyle (Individual)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cigarette_smoker TEXT CHECK (cigarette_smoker IS NULL OR cigarette_smoker IN ('Yes', 'No')),
  ADD COLUMN IF NOT EXISTS alcohol_drinker TEXT CHECK (alcohol_drinker IS NULL OR alcohol_drinker IN ('Yes', 'No')),
  ADD COLUMN IF NOT EXISTS marijuana_user TEXT CHECK (marijuana_user IS NULL OR marijuana_user IN ('Yes', 'No'));

-- Health & Safety (Individual)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_control TEXT CHECK (birth_control IS NULL OR birth_control IN (
    'Yes', 'No', 'Sometimes', 'Prefer not to say'
  )),
  ADD COLUMN IF NOT EXISTS latex_allergy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_sti_test_date DATE,
  ADD COLUMN IF NOT EXISTS sti_positive_results TEXT CHECK (sti_positive_results IS NULL OR sti_positive_results IN (
    'Negative', 'Positive', 'Prefer not to say'
  )),
  ADD COLUMN IF NOT EXISTS can_host TEXT CHECK (can_host IS NULL OR can_host IN ('Yes', 'No', 'Possibly'));

-- ============================================
-- COUPLE ACCOUNT - PARTNER 1 PHYSICAL STATS
-- ============================================

-- Physical Appearance (Partner 1)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner1_height TEXT,
  ADD COLUMN IF NOT EXISTS partner1_weight TEXT,
  ADD COLUMN IF NOT EXISTS partner1_body_type TEXT CHECK (partner1_body_type IS NULL OR partner1_body_type IN (
    'Slim', 'Average', 'Athletic', 'Muscular', 'Curvy', 'Dad Bod', 
    'Thick', 'BBW', 'Fit', 'Petite', 'Heavyset'
  )),
  ADD COLUMN IF NOT EXISTS partner1_hair_color TEXT CHECK (partner1_hair_color IS NULL OR partner1_hair_color IN (
    'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 
    'White', 'Salt and Pepper', 'Bald', 'Other'
  )),
  ADD COLUMN IF NOT EXISTS partner1_eye_color TEXT CHECK (partner1_eye_color IS NULL OR partner1_eye_color IN (
    'Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Other'
  )),
  ADD COLUMN IF NOT EXISTS partner1_facial_hair TEXT CHECK (partner1_facial_hair IS NULL OR partner1_facial_hair IN (
    'Clean Shaven', 'Stubble', 'Goatee', 'Beard', 'Mustache', 
    'Full Beard', 'Doesn''t Apply'
  )),
  ADD COLUMN IF NOT EXISTS partner1_ethnicity TEXT CHECK (partner1_ethnicity IS NULL OR partner1_ethnicity IN (
    'Asian', 'Black/African', 'Caucasian/White', 'Hispanic/Latino', 
    'Middle Eastern', 'Native American', 'Pacific Islander', 
    'Mixed/Multiracial', 'Other', 'Prefer not to say'
  )),
  ADD COLUMN IF NOT EXISTS partner1_tattoos BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS partner1_piercings BOOLEAN DEFAULT FALSE;

-- Lifestyle (Partner 1)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner1_cigarette_smoker TEXT CHECK (partner1_cigarette_smoker IS NULL OR partner1_cigarette_smoker IN ('Yes', 'No')),
  ADD COLUMN IF NOT EXISTS partner1_alcohol_drinker TEXT CHECK (partner1_alcohol_drinker IS NULL OR partner1_alcohol_drinker IN ('Yes', 'No')),
  ADD COLUMN IF NOT EXISTS partner1_marijuana_user TEXT CHECK (partner1_marijuana_user IS NULL OR partner1_marijuana_user IN ('Yes', 'No'));

-- ============================================
-- COUPLE ACCOUNT - PARTNER 2 PHYSICAL STATS
-- ============================================

-- Physical Appearance (Partner 2)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner2_height TEXT,
  ADD COLUMN IF NOT EXISTS partner2_weight TEXT,
  ADD COLUMN IF NOT EXISTS partner2_body_type TEXT CHECK (partner2_body_type IS NULL OR partner2_body_type IN (
    'Slim', 'Average', 'Athletic', 'Muscular', 'Curvy', 'Dad Bod', 
    'Thick', 'BBW', 'Fit', 'Petite', 'Heavyset'
  )),
  ADD COLUMN IF NOT EXISTS partner2_hair_color TEXT CHECK (partner2_hair_color IS NULL OR partner2_hair_color IN (
    'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 
    'White', 'Salt and Pepper', 'Bald', 'Other'
  )),
  ADD COLUMN IF NOT EXISTS partner2_eye_color TEXT CHECK (partner2_eye_color IS NULL OR partner2_eye_color IN (
    'Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Other'
  )),
  ADD COLUMN IF NOT EXISTS partner2_facial_hair TEXT CHECK (partner2_facial_hair IS NULL OR partner2_facial_hair IN (
    'Clean Shaven', 'Stubble', 'Goatee', 'Beard', 'Mustache', 
    'Full Beard', 'Doesn''t Apply'
  )),
  ADD COLUMN IF NOT EXISTS partner2_ethnicity TEXT CHECK (partner2_ethnicity IS NULL OR partner2_ethnicity IN (
    'Asian', 'Black/African', 'Caucasian/White', 'Hispanic/Latino', 
    'Middle Eastern', 'Native American', 'Pacific Islander', 
    'Mixed/Multiracial', 'Other', 'Prefer not to say'
  )),
  ADD COLUMN IF NOT EXISTS partner2_tattoos BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS partner2_piercings BOOLEAN DEFAULT FALSE;

-- Lifestyle (Partner 2)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner2_cigarette_smoker TEXT CHECK (partner2_cigarette_smoker IS NULL OR partner2_cigarette_smoker IN ('Yes', 'No')),
  ADD COLUMN IF NOT EXISTS partner2_alcohol_drinker TEXT CHECK (partner2_alcohol_drinker IS NULL OR partner2_alcohol_drinker IN ('Yes', 'No')),
  ADD COLUMN IF NOT EXISTS partner2_marijuana_user TEXT CHECK (partner2_marijuana_user IS NULL OR partner2_marijuana_user IN ('Yes', 'No'));

-- ============================================
-- ADD INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================

-- Index for filtering by physical attributes
CREATE INDEX IF NOT EXISTS idx_profiles_body_type ON public.profiles(body_type) WHERE body_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_ethnicity ON public.profiles(ethnicity) WHERE ethnicity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_tattoos ON public.profiles(tattoos) WHERE tattoos = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_piercings ON public.profiles(piercings) WHERE piercings = TRUE;

-- ============================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN public.profiles.height IS 'User height (e.g., "5''10\"", "175cm")';
COMMENT ON COLUMN public.profiles.weight IS 'User weight (e.g., "160 lbs", "72 kg")';
COMMENT ON COLUMN public.profiles.body_type IS 'Body type/build classification';
COMMENT ON COLUMN public.profiles.hair_color IS 'Hair color';
COMMENT ON COLUMN public.profiles.eye_color IS 'Eye color';
COMMENT ON COLUMN public.profiles.facial_hair IS 'Facial hair style';
COMMENT ON COLUMN public.profiles.ethnicity IS 'Ethnic background';
COMMENT ON COLUMN public.profiles.body_hair IS 'Body hair description';
COMMENT ON COLUMN public.profiles.grooming_style IS 'Personal grooming preferences';
COMMENT ON COLUMN public.profiles.tattoos IS 'Has tattoos (true/false)';
COMMENT ON COLUMN public.profiles.piercings IS 'Has piercings (true/false)';
COMMENT ON COLUMN public.profiles.cigarette_smoker IS 'Cigarette smoking status';
COMMENT ON COLUMN public.profiles.alcohol_drinker IS 'Alcohol consumption status';
COMMENT ON COLUMN public.profiles.marijuana_user IS 'Marijuana use status';
COMMENT ON COLUMN public.profiles.birth_control IS 'Birth control usage';
COMMENT ON COLUMN public.profiles.latex_allergy IS 'Has latex allergy (true/false)';
COMMENT ON COLUMN public.profiles.last_sti_test_date IS 'Date of last STI test';
COMMENT ON COLUMN public.profiles.sti_positive_results IS 'STI test results status';
COMMENT ON COLUMN public.profiles.can_host IS 'Ability to host meetups';

-- Partner 1 Comments
COMMENT ON COLUMN public.profiles.partner1_height IS 'Partner 1 height for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_weight IS 'Partner 1 weight for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_body_type IS 'Partner 1 body type for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_hair_color IS 'Partner 1 hair color for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_eye_color IS 'Partner 1 eye color for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_facial_hair IS 'Partner 1 facial hair for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_ethnicity IS 'Partner 1 ethnicity for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_tattoos IS 'Partner 1 has tattoos for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_piercings IS 'Partner 1 has piercings for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_cigarette_smoker IS 'Partner 1 smoking status for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_alcohol_drinker IS 'Partner 1 alcohol status for couple accounts';
COMMENT ON COLUMN public.profiles.partner1_marijuana_user IS 'Partner 1 marijuana status for couple accounts';

-- Partner 2 Comments
COMMENT ON COLUMN public.profiles.partner2_height IS 'Partner 2 height for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_weight IS 'Partner 2 weight for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_body_type IS 'Partner 2 body type for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_hair_color IS 'Partner 2 hair color for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_eye_color IS 'Partner 2 eye color for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_facial_hair IS 'Partner 2 facial hair for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_ethnicity IS 'Partner 2 ethnicity for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_tattoos IS 'Partner 2 has tattoos for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_piercings IS 'Partner 2 has piercings for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_cigarette_smoker IS 'Partner 2 smoking status for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_alcohol_drinker IS 'Partner 2 alcohol status for couple accounts';
COMMENT ON COLUMN public.profiles.partner2_marijuana_user IS 'Partner 2 marijuana status for couple accounts';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all columns were added successfully
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added physical stats columns for Individual and Couple accounts';
  RAISE NOTICE 'Run the following query to verify:';
  RAISE NOTICE 'SELECT column_name FROM information_schema.columns WHERE table_name = ''profiles'' ORDER BY column_name;';
END $$;
