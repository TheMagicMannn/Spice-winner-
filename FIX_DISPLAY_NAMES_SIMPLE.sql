-- =====================================================
-- FIX DISPLAY NAMES - SIMPLE VERSION
-- =====================================================

-- Step 1: Check what columns actually exist in profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check current state
SELECT 
    COUNT(*) as total_profiles,
    COUNT(display_name) as profiles_with_name,
    COUNT(*) - COUNT(display_name) as profiles_without_name
FROM profiles;

-- Step 3: View a few sample profiles (using only id and display_name)
SELECT id, display_name, created_at
FROM profiles
LIMIT 5;

-- Step 4: Update display_name from auth.users email
-- Profiles.id should match auth.users.id
UPDATE profiles
SET display_name = SPLIT_PART(u.email, '@', 1)
FROM auth.users u
WHERE profiles.id = u.id
  AND profiles.display_name IS NULL
  AND u.email IS NOT NULL;

-- Step 5: For remaining NULL display_names, use ID
UPDATE profiles
SET display_name = 'User-' || SUBSTRING(id::text, 1, 8)
WHERE display_name IS NULL;

-- Step 6: Verify results
SELECT 
    COUNT(*) as total_profiles,
    COUNT(display_name) as profiles_with_name,
    COUNT(*) - COUNT(display_name) as should_be_zero
FROM profiles;

-- Step 7: Show some updated profiles
SELECT 
    p.id, 
    p.display_name, 
    u.email as user_email,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Step 8: Final check - should return 0
SELECT COUNT(*) as profiles_still_without_name
FROM profiles
WHERE display_name IS NULL;

-- =====================================================
-- If you see 0 in the last query, you're all set!
-- =====================================================
