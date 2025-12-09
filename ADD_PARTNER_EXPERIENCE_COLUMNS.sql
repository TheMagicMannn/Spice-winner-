-- =====================================================
-- ADD MISSING PARTNER EXPERIENCE COLUMNS
-- Fix for: Could not find 'partner1_experience' column error
-- =====================================================

-- Add partner1_experience column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS partner1_experience TEXT DEFAULT 'New';

-- Add partner2_experience column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS partner2_experience TEXT DEFAULT 'New';

-- Add comment for documentation
COMMENT ON COLUMN profiles.partner1_experience IS 'Experience level for Partner 1 in couple accounts (New, Beginner, Moderate, Advanced)';
COMMENT ON COLUMN profiles.partner2_experience IS 'Experience level for Partner 2 in couple accounts (New, Beginner, Moderate, Advanced)';

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('partner1_experience', 'partner2_experience');
