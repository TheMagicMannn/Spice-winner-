-- =====================================================
-- CHECK PROFILE STATUS - DIAGNOSTIC QUERY
-- =====================================================
-- Run this to see exactly what's in your profile
-- =====================================================

-- Check your specific profile
SELECT 
    id,
    email,
    display_name,
    profile_completed,
    is_active,
    account_type,
    created_at,
    updated_at
FROM profiles
WHERE email = 'kwitter1982@gmail.com';

-- Check all profiles to see pattern
SELECT 
    email,
    display_name,
    profile_completed,
    CASE 
        WHEN profile_completed IS NULL THEN '⚠️ NULL (will redirect to setup)'
        WHEN profile_completed = false THEN '⚠️ FALSE (will redirect to setup)'
        WHEN profile_completed = true THEN '✅ TRUE (will skip setup)'
        ELSE '❓ UNKNOWN'
    END as status
FROM profiles
ORDER BY created_at DESC;

-- Count profiles by completion status
SELECT 
    profile_completed,
    COUNT(*) as count
FROM profiles
GROUP BY profile_completed;
