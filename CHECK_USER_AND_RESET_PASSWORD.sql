-- =====================================================
-- CHECK USER EXISTS AND RESET PASSWORD
-- =====================================================
-- Use this to troubleshoot login issues after fixing the profiles table
-- =====================================================

-- =====================================================
-- 1. CHECK IF USER EXISTS
-- =====================================================

-- Check if the user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
WHERE email = 'kwitter1982@gmail.com';

-- Check if user has a profile
SELECT 
    id,
    display_name,
    email,
    is_admin,
    account_type,
    membership_tier,
    profile_completed,
    created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'kwitter1982@gmail.com';

-- =====================================================
-- 2. LIST ALL USERS (if you need to see what exists)
-- =====================================================

SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    p.display_name,
    p.account_type,
    p.membership_tier
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 20;

-- =====================================================
-- 3. CREATE A NEW TEST USER (if needed)
-- =====================================================
-- Note: This creates the auth user, the trigger will create the profile

-- You can't directly create auth.users via SQL (Supabase manages this)
-- Instead, you need to use one of these methods:
-- 
-- METHOD 1: Supabase Dashboard
-- Go to: Authentication → Users → Add User
-- Email: test@example.com
-- Password: (your choice)
-- Confirm Email: Yes
--
-- METHOD 2: Your app's signup page
-- Just sign up normally through your app
--
-- METHOD 3: Supabase API (from your app or postman)

-- =====================================================
-- 4. PASSWORD RESET OPTIONS
-- =====================================================

-- OPTION A: Reset via Supabase Dashboard (RECOMMENDED)
-- 1. Go to: https://supabase.com/dashboard/project/cbefwjwqworwfctadogk
-- 2. Click "Authentication" → "Users"
-- 3. Find user: kwitter1982@gmail.com
-- 4. Click the three dots → "Reset Password"
-- 5. This sends a password reset email

-- OPTION B: Manually update password (TESTING ONLY - NOT SECURE)
-- WARNING: This is for testing only. In production, use proper password reset flow.
-- This requires the service role key and should be done via Supabase auth API

-- OPTION C: Request password reset from your app
-- Go to your app's login page and click "Forgot Password"
-- Enter: kwitter1982@gmail.com
-- Check email for reset link

-- =====================================================
-- 5. VERIFY EMAIL IS CONFIRMED
-- =====================================================

-- Check if email is confirmed
SELECT 
    email,
    email_confirmed_at,
    confirmation_sent_at
FROM auth.users
WHERE email = 'kwitter1982@gmail.com';

-- If email_confirmed_at is NULL, the user needs to confirm their email
-- You can manually confirm it in Supabase Dashboard:
-- Authentication → Users → Find user → Click "..." → "Confirm Email"

-- =====================================================
-- 6. CHECK FOR ACCOUNT LOCKS OR BANS
-- =====================================================

SELECT 
    email,
    banned_until,
    deleted_at,
    is_super_admin,
    raw_user_meta_data
FROM auth.users
WHERE email = 'kwitter1982@gmail.com';

-- If banned_until is set, the account is temporarily locked
-- If deleted_at is set, the account is deleted

-- =====================================================
-- 7. VERIFY TRIGGERS ARE WORKING
-- =====================================================

-- Check if the profile was created automatically
SELECT 
    COUNT(*) as profiles_count,
    (SELECT COUNT(*) FROM auth.users) as users_count
FROM profiles;

-- These numbers should match
-- If profiles_count < users_count, some users don't have profiles

-- Create missing profiles for users without them
INSERT INTO public.profiles (id, display_name, membership_tier, account_type, is_admin)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email, 'User'),
    'basic',
    'individual',
    FALSE
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TROUBLESHOOTING STEPS
-- =====================================================

-- If login still fails with "invalid_credentials":
--
-- 1. Verify the user exists (run query #1 above)
--    - If no results, user doesn't exist → Sign up first
--
-- 2. Check if email is confirmed (run query #5 above)
--    - If NULL, confirm email in dashboard or resend confirmation
--
-- 3. Reset the password (use Option A above)
--    - Safest method via Supabase Dashboard
--
-- 4. Try creating a new test account
--    - Sign up through your app with a new email
--    - This will test if signup and login work for new users
--
-- 5. Check Supabase Auth logs
--    - Dashboard → Logs → Auth Logs
--    - Look for failed login attempts and reasons

-- =====================================================
-- SUCCESS CHECKLIST
-- =====================================================

-- Run these to verify everything is working:

-- ✅ Profiles table exists
SELECT COUNT(*) FROM profiles;

-- ✅ User exists
SELECT email FROM auth.users WHERE email = 'kwitter1982@gmail.com';

-- ✅ User has profile
SELECT id FROM profiles WHERE id = (
    SELECT id FROM auth.users WHERE email = 'kwitter1982@gmail.com'
);

-- ✅ Email is confirmed
SELECT email_confirmed_at IS NOT NULL as email_confirmed 
FROM auth.users WHERE email = 'kwitter1982@gmail.com';

-- ✅ No bans
SELECT banned_until IS NULL as not_banned 
FROM auth.users WHERE email = 'kwitter1982@gmail.com';

-- If all checks pass ✅, the issue is just the password
-- Reset it via Supabase Dashboard → Authentication → Users → Reset Password
