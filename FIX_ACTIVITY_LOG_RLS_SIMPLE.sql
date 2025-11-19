-- FIX_ACTIVITY_LOG_RLS_SIMPLE.sql
-- Simplified version - Run each section separately if the full script has issues

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================
-- Run this first to clear all existing policies

-- Drop all policies on user_activity_log
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_activity_log') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_activity_log';
    END LOOP;
END $$;

-- Drop all policies on daily_activity_reports
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_activity_reports') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.daily_activity_reports';
    END LOOP;
END $$;

-- Drop all policies on admin_actions_log
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_actions_log') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.admin_actions_log';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: CREATE NEW POLICIES FOR user_activity_log
-- ============================================

CREATE POLICY "Users can insert own activity"
ON public.user_activity_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert activity"
ON public.user_activity_log
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Users can view own activity"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================
-- STEP 3: CREATE NEW POLICIES FOR daily_activity_reports
-- ============================================

CREATE POLICY "Admins can view all reports"
ON public.daily_activity_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Service can manage reports"
ON public.daily_activity_reports
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 4: CREATE NEW POLICIES FOR admin_actions_log
-- ============================================

CREATE POLICY "Admins can log own actions"
ON public.admin_actions_log
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = admin_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can view all actions"
ON public.admin_actions_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- ============================================
-- STEP 5: ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: CREATE HELPER FUNCTION
-- ============================================

-- Drop all versions of the function
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure 
        FROM pg_proc 
        WHERE proname = 'log_user_activity' 
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.oid::regprocedure || ' CASCADE';
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_data,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_activity_type,
    p_activity_data,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO service_role;

-- ============================================
-- STEP 7: CREATE TEST DATA FUNCTION
-- ============================================

-- Drop all versions of the function
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure 
        FROM pg_proc 
        WHERE proname = 'populate_test_activity_data' 
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.oid::regprocedure || ' CASCADE';
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.populate_test_activity_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_ids UUID[];
  v_user_id UUID;
  v_count INTEGER := 0;
  v_activity_types TEXT[] := ARRAY[
    'user_login',
    'user_signup',
    'profile_updated',
    'profile_viewed',
    'profile_liked',
    'match_created',
    'message_sent',
    'photo_uploaded'
  ];
  v_days_ago INTEGER;
BEGIN
  SELECT ARRAY_AGG(id) INTO v_user_ids FROM profiles LIMIT 20;
  
  IF v_user_ids IS NULL OR array_length(v_user_ids, 1) = 0 THEN
    RETURN 'No users found. Please create some user profiles first.';
  END IF;
  
  FOR v_days_ago IN 0..29 LOOP
    FOR i IN 1..(5 + floor(random() * 15)::int) LOOP
      v_user_id := v_user_ids[1 + floor(random() * array_length(v_user_ids, 1))::int];
      
      INSERT INTO user_activity_log (
        user_id,
        activity_type,
        activity_data,
        created_at
      )
      VALUES (
        v_user_id,
        v_activity_types[1 + floor(random() * array_length(v_activity_types, 1))::int],
        jsonb_build_object('test_data', true, 'generated_at', NOW()),
        NOW() - (v_days_ago || ' days')::interval - (floor(random() * 24)::int || ' hours')::interval
      );
      
      v_count := v_count + 1;
    END LOOP;
  END LOOP;
  
  RETURN format('Successfully inserted %s test activity records', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.populate_test_activity_data TO authenticated;

-- ============================================
-- STEP 8: CREATE DAILY REPORT FUNCTION
-- ============================================

-- Drop all versions of the function
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure 
        FROM pg_proc 
        WHERE proname = 'generate_daily_report' 
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.oid::regprocedure || ' CASCADE';
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.generate_daily_report(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM daily_activity_reports WHERE report_date = p_date
  ) INTO v_report_exists;
  
  IF v_report_exists THEN
    UPDATE daily_activity_reports
    SET
      total_signups = (SELECT COUNT(DISTINCT user_id) FROM user_activity_log WHERE activity_type = 'user_signup' AND DATE(created_at) = p_date),
      total_logins = (SELECT COUNT(*) FROM user_activity_log WHERE activity_type = 'user_login' AND DATE(created_at) = p_date),
      total_messages = (SELECT COUNT(*) FROM user_activity_log WHERE activity_type = 'message_sent' AND DATE(created_at) = p_date),
      total_likes = (SELECT COUNT(*) FROM user_activity_log WHERE activity_type = 'profile_liked' AND DATE(created_at) = p_date),
      total_matches = (SELECT COUNT(*) FROM user_activity_log WHERE activity_type = 'match_created' AND DATE(created_at) = p_date),
      total_payments = (SELECT COALESCE(SUM((activity_data->>'amount')::numeric), 0) FROM user_activity_log WHERE activity_type = 'payment_completed' AND DATE(created_at) = p_date),
      active_users = (SELECT COUNT(DISTINCT user_id) FROM user_activity_log WHERE DATE(created_at) = p_date),
      updated_at = NOW()
    WHERE report_date = p_date;
  ELSE
    INSERT INTO daily_activity_reports (report_date, total_signups, total_logins, total_messages, total_likes, total_matches, total_payments, active_users, new_premium_users)
    SELECT
      p_date,
      COUNT(DISTINCT CASE WHEN activity_type = 'user_signup' THEN user_id END),
      COUNT(CASE WHEN activity_type = 'user_login' THEN 1 END),
      COUNT(CASE WHEN activity_type = 'message_sent' THEN 1 END),
      COUNT(CASE WHEN activity_type = 'profile_liked' THEN 1 END),
      COUNT(CASE WHEN activity_type = 'match_created' THEN 1 END),
      COALESCE(SUM(CASE WHEN activity_type = 'payment_completed' THEN (activity_data->>'amount')::numeric END), 0),
      COUNT(DISTINCT user_id),
      0
    FROM user_activity_log
    WHERE DATE(created_at) = p_date;
  END IF;
  
  RETURN format('Daily report generated for %s', p_date);
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_daily_report TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify the setup:

-- Check policies
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename IN ('user_activity_log', 'daily_activity_reports', 'admin_actions_log')
ORDER BY tablename, policyname;

-- Check functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('log_user_activity', 'populate_test_activity_data', 'generate_daily_report');

-- Success message
SELECT 'RLS policies fixed successfully! Now run: SELECT populate_test_activity_data();' as status;
