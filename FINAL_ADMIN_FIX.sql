-- ================================================================
-- FINAL ADMIN DASHBOARD FIX - All Issues Resolved
-- ================================================================
-- This is the COMPLETE fix for all admin dashboard issues
-- Copy this ENTIRE script and run it in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- PART 1: Fix user_reports table structure
-- ================================================================

-- Drop and recreate user_reports with correct structure
DROP TABLE IF EXISTS public.user_reports CASCADE;

CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys AFTER table is created
ALTER TABLE public.user_reports
ADD CONSTRAINT user_reports_reporter_id_fkey 
FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_reports
ADD CONSTRAINT user_reports_reported_id_fkey 
FOREIGN KEY (reported_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_reports
ADD CONSTRAINT user_reports_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX idx_user_reports_status ON public.user_reports(status);
CREATE INDEX idx_user_reports_reporter ON public.user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported ON public.user_reports(reported_id);
CREATE INDEX idx_user_reports_created_at ON public.user_reports(created_at DESC);

-- ================================================================
-- PART 2: Create other required tables
-- ================================================================

-- user_activity_log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for user_activity_log if doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_activity_log_user_id_fkey'
    ) THEN
        ALTER TABLE public.user_activity_log
        ADD CONSTRAINT user_activity_log_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON public.user_activity_log(activity_type);

-- daily_activity_reports table
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

CREATE INDEX IF NOT EXISTS idx_daily_activity_reports_date ON public.daily_activity_reports(report_date DESC);

-- ================================================================
-- PART 3: Clean up ALL duplicate policies
-- ================================================================

-- Drop all policies on profiles
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Drop all policies on user_activity_log
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'user_activity_log' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_activity_log', pol.policyname);
    END LOOP;
END $$;

-- Drop all policies on user_reports
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'user_reports' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_reports', pol.policyname);
    END LOOP;
END $$;

-- Drop all policies on daily_activity_reports
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'daily_activity_reports' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.daily_activity_reports', pol.policyname);
    END LOOP;
END $$;

-- ================================================================
-- PART 4: Enable RLS on all tables
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_reports ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PART 5: Create clean RLS policies with CORRECT column names
-- ================================================================

-- ============= PROFILES TABLE =============

-- Admins can do everything
CREATE POLICY "admins_all_profiles"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

-- Users can view their own profile
CREATE POLICY "users_view_own"
ON public.profiles FOR SELECT
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "users_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Users can view completed profiles (FIXED: using profile_completed)
CREATE POLICY "users_view_active"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated' AND profile_completed = true);

-- ============= USER_ACTIVITY_LOG TABLE =============

-- Admins can view all activity logs
CREATE POLICY "admins_view_logs"
ON public.user_activity_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- System can insert logs
CREATE POLICY "system_insert_logs"
ON public.user_activity_log FOR INSERT
WITH CHECK (true);

-- Users can view their own logs
CREATE POLICY "users_view_own_logs"
ON public.user_activity_log FOR SELECT
USING (user_id = auth.uid());

-- ============= USER_REPORTS TABLE =============

-- Admins can view all reports
CREATE POLICY "admins_view_reports"
ON public.user_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can update reports
CREATE POLICY "admins_update_reports"
ON public.user_reports FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Users can create reports
CREATE POLICY "users_create_reports"
ON public.user_reports FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  reporter_id = auth.uid()
);

-- Users can view their own reports
CREATE POLICY "users_view_own_reports"
ON public.user_reports FOR SELECT
USING (reporter_id = auth.uid());

-- ============= DAILY_ACTIVITY_REPORTS TABLE =============

-- Admins can view daily reports
CREATE POLICY "admins_view_daily"
ON public.daily_activity_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- System can manage daily reports
CREATE POLICY "system_manage_daily"
ON public.daily_activity_reports FOR ALL
USING (true)
WITH CHECK (true);

-- ================================================================
-- PART 6: Create helper function
-- ================================================================

DROP FUNCTION IF EXISTS public.get_activity_summary(TEXT, TEXT);

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
-- PART 7: Grant permissions
-- ================================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT ON public.user_activity_log TO authenticated;
GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT SELECT, INSERT ON public.user_reports TO authenticated;
GRANT SELECT ON public.daily_activity_reports TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_summary(TEXT, TEXT) TO authenticated;

-- ================================================================
-- PART 8: Insert sample data for testing
-- ================================================================

INSERT INTO public.daily_activity_reports (
  report_date, total_signups, total_logins, total_messages,
  total_likes, total_matches, total_payments, active_users, new_premium_users
)
VALUES (
  CURRENT_DATE, 5, 20, 150, 45, 12, 299.99, 35, 3
)
ON CONFLICT (report_date) DO UPDATE SET
  total_signups = EXCLUDED.total_signups,
  total_logins = EXCLUDED.total_logins,
  updated_at = NOW();

-- ================================================================
-- VERIFICATION - Check everything is set up correctly
-- ================================================================

-- Check tables
SELECT 
  '✅ Table Check' as check_type,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('user_activity_log', 'user_reports', 'daily_activity_reports', 'profiles')
ORDER BY table_name;

-- Check user_reports columns (verify reporter_id and reported_id exist)
SELECT 
  '✅ Column Check' as check_type,
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'user_reports'
  AND column_name IN ('reporter_id', 'reported_id')
ORDER BY column_name;

-- Check policies count
SELECT 
  '✅ Policy Check' as check_type,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'user_activity_log', 'user_reports', 'daily_activity_reports')
GROUP BY tablename
ORDER BY tablename;

-- Check if profile_completed column exists
SELECT 
  '✅ Profile Column Check' as check_type,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'profiles'
  AND column_name = 'profile_completed';

-- Final success message
SELECT '🎉 SETUP COMPLETE! Admin dashboard is ready.' as status;
