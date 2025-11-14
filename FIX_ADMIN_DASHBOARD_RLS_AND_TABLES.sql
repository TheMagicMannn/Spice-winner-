-- ================================================================
-- FIX ADMIN DASHBOARD - Tables, Foreign Keys, and RLS Policies
-- ================================================================
-- This script will fix all issues preventing the admin dashboard from loading data
-- Run this in your Supabase SQL editor

-- ================================================================
-- STEP 1: Ensure tables exist with proper structure
-- ================================================================

-- Check and create user_activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check and create daily_activity_reports table
CREATE TABLE IF NOT EXISTS public.daily_activity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE,
  total_signups INTEGER DEFAULT 0,
  total_logins INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_payments NUMERIC(10, 2) DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_premium_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check and create user_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON public.user_activity_log(activity_type);

CREATE INDEX IF NOT EXISTS idx_daily_activity_reports_date ON public.daily_activity_reports(report_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON public.user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON public.user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON public.user_reports(created_at DESC);

-- ================================================================
-- STEP 2: Drop ALL existing duplicate/conflicting RLS policies
-- ================================================================

-- Drop all existing policies on profiles
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Drop all existing policies on user_activity_log
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_activity_log' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_activity_log', pol.policyname);
    END LOOP;
END $$;

-- Drop all existing policies on user_reports
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_reports' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_reports', pol.policyname);
    END LOOP;
END $$;

-- Drop all existing policies on daily_activity_reports
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'daily_activity_reports' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.daily_activity_reports', pol.policyname);
    END LOOP;
END $$;

-- ================================================================
-- STEP 3: Enable RLS on all tables
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_reports ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 4: Create NEW simplified RLS policies
-- ================================================================

-- ============= PROFILES TABLE POLICIES =============

-- Admins can do everything
CREATE POLICY "admins_all_access_profiles"
ON public.profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Users can view their own profile
CREATE POLICY "users_view_own_profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can insert their own profile (during signup)
CREATE POLICY "users_insert_own_profile"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- Authenticated users can view active profiles
CREATE POLICY "users_view_active_profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated' AND profileCompleted = true);

-- ============= USER_ACTIVITY_LOG TABLE POLICIES =============

-- Admins can view all activity logs
CREATE POLICY "admins_view_all_activity_logs"
ON public.user_activity_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- System can insert activity logs (for logging purposes)
CREATE POLICY "system_insert_activity_logs"
ON public.user_activity_log
FOR INSERT
WITH CHECK (true);

-- Users can view their own activity
CREATE POLICY "users_view_own_activity"
ON public.user_activity_log
FOR SELECT
USING (user_id = auth.uid());

-- ============= USER_REPORTS TABLE POLICIES =============

-- Admins can view all reports
CREATE POLICY "admins_view_all_reports"
ON public.user_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can update reports
CREATE POLICY "admins_update_reports"
ON public.user_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Authenticated users can create reports
CREATE POLICY "users_create_reports"
ON public.user_reports
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  reporter_id = auth.uid()
);

-- Users can view their own submitted reports
CREATE POLICY "users_view_own_reports"
ON public.user_reports
FOR SELECT
USING (reporter_id = auth.uid());

-- ============= DAILY_ACTIVITY_REPORTS TABLE POLICIES =============

-- Admins can view all daily reports
CREATE POLICY "admins_view_daily_reports"
ON public.daily_activity_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- System can insert/update daily reports
CREATE POLICY "system_manage_daily_reports"
ON public.daily_activity_reports
FOR ALL
USING (true)
WITH CHECK (true);

-- ================================================================
-- STEP 5: Create helper function for activity summary
-- ================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_activity_summary(TEXT, TEXT);

-- Create activity summary function
CREATE OR REPLACE FUNCTION public.get_activity_summary(
  start_date TEXT,
  end_date TEXT
)
RETURNS TABLE (
  activity_type TEXT,
  count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    ual.activity_type,
    COUNT(*)::BIGINT as count
  FROM public.user_activity_log ual
  WHERE ual.created_at >= start_date::timestamptz
    AND ual.created_at <= end_date::timestamptz
  GROUP BY ual.activity_type
  ORDER BY count DESC;
END;
$$;

-- ================================================================
-- STEP 6: Fix foreign key relationships if needed
-- ================================================================

-- Ensure user_activity_log has proper foreign key to profiles
-- Drop old constraint if exists with wrong name
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_activity_log_user_id_fkey'
        AND table_name = 'user_activity_log'
    ) THEN
        ALTER TABLE public.user_activity_log 
        DROP CONSTRAINT user_activity_log_user_id_fkey;
    END IF;
END $$;

-- Add the foreign key back (it will now reference auth.users)
-- The profiles table should already have a link to auth.users via id field
ALTER TABLE public.user_activity_log
ADD CONSTRAINT user_activity_log_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- ================================================================
-- STEP 7: Grant necessary permissions
-- ================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant permissions on tables
GRANT SELECT, INSERT ON public.user_activity_log TO authenticated;
GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT SELECT, INSERT ON public.user_reports TO authenticated;
GRANT SELECT ON public.daily_activity_reports TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_activity_summary(TEXT, TEXT) TO authenticated;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these to verify everything is set up correctly:

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_activity_log', 'user_reports', 'daily_activity_reports')
ORDER BY table_name;

-- Check RLS policies on profiles
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND schemaname = 'public'
ORDER BY policyname;

-- Check RLS policies on user_activity_log
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_activity_log' 
  AND schemaname = 'public';

-- Check RLS policies on user_reports
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_reports' 
  AND schemaname = 'public';

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('user_activity_log', 'user_reports')
ORDER BY tc.table_name, kcu.column_name;

-- ================================================================
-- STEP 8: Seed some test data (optional, for testing)
-- ================================================================

-- Insert a sample daily report for today (if none exists)
INSERT INTO public.daily_activity_reports (
  report_date,
  total_signups,
  total_logins,
  total_messages,
  total_likes,
  total_matches,
  total_payments,
  active_users,
  new_premium_users
)
VALUES (
  CURRENT_DATE,
  5,
  20,
  150,
  45,
  12,
  299.99,
  35,
  3
)
ON CONFLICT (report_date) DO NOTHING;

-- ================================================================
-- DONE! 
-- ================================================================
-- After running this script:
-- 1. Your admin dashboard should be able to load data
-- 2. All duplicate policies will be removed
-- 3. Proper RLS policies will be in place
-- 4. Foreign keys will be correctly configured
--
-- If you still see errors, check the browser console and
-- the response from Supabase for more details
-- ================================================================
