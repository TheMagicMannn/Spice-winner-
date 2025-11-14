-- =====================================================
-- CHECK AND FIX DISPLAY NAMES IN PROFILES
-- =====================================================

-- Step 1: Check how many profiles have NULL displayName
SELECT 
    COUNT(*) as total_profiles,
    COUNT(display_name) as profiles_with_name,
    COUNT(*) - COUNT(display_name) as profiles_without_name
FROM profiles;

-- Step 2: See sample profiles without display_name
SELECT id, email, display_name, created_at
FROM profiles
WHERE display_name IS NULL
LIMIT 10;

-- Step 3: Update profiles without displayName to use email prefix
-- This ensures all profiles have at least some name
UPDATE profiles
SET display_name = SPLIT_PART(email, '@', 1)
WHERE display_name IS NULL
  AND email IS NOT NULL;

-- Step 4: For profiles without email (shouldn't happen but just in case)
UPDATE profiles
SET display_name = 'User-' || SUBSTRING(id::text, 1, 8)
WHERE display_name IS NULL;

-- Step 5: Verify all profiles now have display_name
SELECT 
    COUNT(*) as total_profiles,
    COUNT(display_name) as profiles_with_name,
    COUNT(*) - COUNT(display_name) as profiles_without_name
FROM profiles;

-- Step 6: Show sample of updated profiles
SELECT id, email, display_name, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- OPTIONAL: Set NOT NULL constraint on display_name
-- =====================================================
-- Uncomment if you want to enforce display_name in future
-- ALTER TABLE profiles ALTER COLUMN display_name SET NOT NULL;

-- =====================================================
-- RESULT
-- =====================================================
-- After running this script, all profiles should have
-- a display_name, fixing the "Unknown" and "User" issues
-- =====================================================
