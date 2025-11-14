-- =====================================================
-- CHECK AND FIX DISPLAY NAMES IN PROFILES (CORRECTED)
-- =====================================================

-- Step 1: Check current state of profiles table
SELECT 
    COUNT(*) as total_profiles,
    COUNT(display_name) as profiles_with_name,
    COUNT(*) - COUNT(display_name) as profiles_without_name
FROM profiles;

-- Step 2: See what columns are available
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 3: View sample profiles to understand data structure
SELECT id, display_name, created_at, user_id
FROM profiles
LIMIT 5;

-- Step 4: Get email from auth.users and update display_name
-- Join with auth.users to get email addresses
UPDATE profiles
SET display_name = SPLIT_PART(u.email, '@', 1)
FROM auth.users u
WHERE profiles.id = u.id
  AND profiles.display_name IS NULL
  AND u.email IS NOT NULL;

-- Step 5: For any remaining profiles without display_name, use ID prefix
UPDATE profiles
SET display_name = 'User-' || SUBSTRING(id::text, 1, 8)
WHERE display_name IS NULL;

-- Step 6: Verify all profiles now have display_name
SELECT 
    COUNT(*) as total_profiles,
    COUNT(display_name) as profiles_with_name,
    COUNT(*) - COUNT(display_name) as profiles_without_name
FROM profiles;

-- Step 7: Show sample of updated profiles with their auth info
SELECT 
    p.id, 
    p.display_name, 
    u.email,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if any profiles still have NULL display_name
SELECT COUNT(*) as profiles_without_name
FROM profiles
WHERE display_name IS NULL;

-- This should return 0

-- =====================================================
-- RESULT
-- =====================================================
-- After running this script, all profiles should have
-- a display_name, fixing the "Member" and "User" issues
-- =====================================================
