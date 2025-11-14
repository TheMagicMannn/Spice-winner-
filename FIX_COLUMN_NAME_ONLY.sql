-- ================================================================
-- QUICK FIX: Just fix the column name in the policy
-- ================================================================
-- This is the minimal fix if you just want to correct the column name error
-- Run this in your Supabase SQL editor

-- Drop the policy with wrong column name
DROP POLICY IF EXISTS "users_view_active_profiles" ON public.profiles;

-- Recreate it with correct column name (profile_completed instead of profileCompleted)
CREATE POLICY "users_view_active_profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated' AND profile_completed = true);

-- Verify it was created
SELECT 'Policy fixed! ✅' as status;

SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND policyname = 'users_view_active_profiles';
