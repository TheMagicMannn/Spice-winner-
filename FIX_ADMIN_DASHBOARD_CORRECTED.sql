-- ================================================================
-- FIX ADMIN DASHBOARD - CORRECTED VERSION
-- ================================================================
-- This fixes the column name issue in user_reports table
-- Run this in your Supabase SQL editor

-- ================================================================
-- STEP 1: Check and fix user_reports table structure
-- ================================================================

-- First, let's see what the current structure is (optional)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_reports';

-- Drop the table if it exists and recreate with correct structure
DROP TABLE IF EXISTS public.user_reports CASCADE;

-- Create user_reports table with correct column names
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

-- Add foreign key constraints AFTER table creation
ALTER TABLE public.user_reports
ADD CONSTRAINT user_reports_reporter_id_fkey 
FOREIGN KEY (reporter_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.user_reports
ADD CONSTRAINT user_reports_reported_id_fkey 
FOREIGN KEY (reported_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.user_reports
ADD CONSTRAINT user_reports_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Add indexes
CREATE INDEX idx_user_reports_status ON public.user_reports(status);
CREATE INDEX idx_user_reports_reporter ON public.user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported ON public.user_reports(reported_id);
CREATE INDEX idx_user_reports_created_at ON public.user_reports(created_at DESC);

-- ================================================================
-- STEP 2: Ensure other tables exist
-- ================================================================

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for user_activity_log
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_activity_log_user_id_fkey'
        AND table_name = 'user_activity_log'
    ) THEN
        ALTER TABLE public.user_activity_log
        ADD CONSTRAINT user_activity_log_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes for user_activity_log
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON public.user_activity_log(activity_type);

-- Create daily_activity_reports table
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
-- STEP 3: Clean up ALL existing RLS policies
-- ================================================================

-- Drop all policies on profiles
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

-- Drop all policies on user_activity_log
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

-- Drop all policies on user_reports
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

-- Drop all policies on daily_activity_reports
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
-- STEP 4: Enable RLS
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_reports ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 5: Create clean RLS policies
-- ================================================================

-- ============= PROFILES TABLE =============
CREATE POLICY "admins_all_access_profiles"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

CREATE POLICY "users_view_own_profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "users_update_own_profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "users_insert_own_profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "users_view_active_profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated' AND profileCompleted = true);

-- ============= USER_ACTIVITY_LOG TABLE =============
CREATE POLICY "admins_view_all_activity_logs"
ON public.user_activity_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "system_insert_activity_logs"
ON public.user_activity_log FOR INSERT
WITH CHECK (true);

CREATE POLICY "users_view_own_activity"
ON public.user_activity_log FOR SELECT
USING (user_id = auth.uid());

-- ============= USER_REPORTS TABLE =============
CREATE POLICY "admins_view_all_reports"
ON public.user_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "admins_update_reports"
ON public.user_reports FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "users_create_reports"
ON public.user_reports FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  reporter_id = auth.uid()
);

CREATE POLICY "users_view_own_reports"
ON public.user_reports FOR SELECT
USING (reporter_id = auth.uid());

-- ============= DAILY_ACTIVITY_REPORTS TABLE =============
CREATE POLICY "admins_view_daily_reports"
ON public.daily_activity_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "system_manage_daily_reports"
ON public.daily_activity_reports FOR ALL
USING (true)
WITH CHECK (true);

-- ================================================================
-- STEP 6: Create helper functions
-- ================================================================

-- Drop and recreate get_activity_summary function
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
-- STEP 7: Grant permissions
-- ================================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT ON public.user_activity_log TO authenticated;
GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT SELECT, INSERT ON public.user_reports TO authenticated;
GRANT SELECT ON public.daily_activity_reports TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_summary(TEXT, TEXT) TO authenticated;

-- ================================================================
-- STEP 8: Insert test data
-- ================================================================

-- Insert a sample daily report for today
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
ON CONFLICT (report_date) DO UPDATE SET
  total_signups = EXCLUDED.total_signups,
  total_logins = EXCLUDED.total_logins,
  total_messages = EXCLUDED.total_messages,
  total_likes = EXCLUDED.total_likes,
  total_matches = EXCLUDED.total_matches,
  total_payments = EXCLUDED.total_payments,
  active_users = EXCLUDED.active_users,
  new_premium_users = EXCLUDED.new_premium_users,
  updated_at = NOW();

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check tables exist
SELECT 'Tables created successfully' as status;

SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('user_activity_log', 'user_reports', 'daily_activity_reports')
ORDER BY table_name;

-- Check user_reports columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_reports'
ORDER BY ordinal_position;

-- Check policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'user_activity_log', 'user_reports', 'daily_activity_reports')
GROUP BY tablename
ORDER BY tablename;

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'user_reports'
ORDER BY tc.table_name, kcu.column_name;

SELECT 'Setup complete! ✅' as status;
