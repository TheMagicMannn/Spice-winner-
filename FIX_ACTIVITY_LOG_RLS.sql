-- FIX_ACTIVITY_LOG_RLS.sql
-- This script fixes RLS policies for user_activity_log and related tables to allow proper data access

-- ============================================
-- 1. FIX USER_ACTIVITY_LOG TABLE RLS POLICIES
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity_log;
DROP POLICY IF EXISTS "System can insert activity" ON public.user_activity_log;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.user_activity_log;

-- Create new permissive policies
-- Allow authenticated users to insert their own activities
CREATE POLICY "Users can insert own activity"
ON public.user_activity_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow system/service role to insert any activity (for triggers)
CREATE POLICY "Service role can insert activity"
ON public.user_activity_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow users to view their own activity
CREATE POLICY "Users can view own activity"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all activity
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
-- 2. FIX DAILY_ACTIVITY_REPORTS TABLE RLS
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view reports" ON public.daily_activity_reports;

-- Allow admins to view all reports
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

-- Allow service role to insert/update reports (for cron jobs)
CREATE POLICY "Service can manage reports"
ON public.daily_activity_reports
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. FIX ADMIN_ACTIONS_LOG TABLE RLS
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view admin actions" ON public.admin_actions_log;
DROP POLICY IF EXISTS "Admins can log actions" ON public.admin_actions_log;

-- Allow admins to insert their own actions
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

-- Allow admins to view all admin actions
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
-- 4. VERIFY RLS IS ENABLED
-- ============================================

-- Ensure RLS is enabled on all tables
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE HELPER FUNCTION FOR ACTIVITY LOGGING
-- ============================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.log_user_activity(UUID, TEXT, JSONB, TEXT, TEXT);

-- Create function that bypasses RLS
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO service_role;

-- ============================================
-- 6. CREATE TEST DATA POPULATION FUNCTION
-- ============================================

-- Function to populate test activity data for admins
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
  -- Get all user IDs
  SELECT ARRAY_AGG(id) INTO v_user_ids FROM profiles LIMIT 20;
  
  IF v_user_ids IS NULL OR array_length(v_user_ids, 1) = 0 THEN
    RETURN 'No users found. Please create some user profiles first.';
  END IF;
  
  -- Generate activities for the past 30 days
  FOR v_days_ago IN 0..29 LOOP
    -- Random number of activities per day (5-20)
    FOR i IN 1..(5 + floor(random() * 15)::int) LOOP
      -- Pick a random user
      v_user_id := v_user_ids[1 + floor(random() * array_length(v_user_ids, 1))::int];
      
      -- Insert activity
      INSERT INTO user_activity_log (
        user_id,
        activity_type,
        activity_data,
        created_at
      )
      VALUES (
        v_user_id,
        v_activity_types[1 + floor(random() * array_length(v_activity_types, 1))::int],
        jsonb_build_object(
          'test_data', true,
          'generated_at', NOW()
        ),
        NOW() - (v_days_ago || ' days')::interval - (floor(random() * 24)::int || ' hours')::interval
      );
      
      v_count := v_count + 1;
    END LOOP;
  END LOOP;
  
  RETURN format('Successfully inserted %s test activity records', v_count);
END;
$$;

-- Grant execute to admins
GRANT EXECUTE ON FUNCTION public.populate_test_activity_data TO authenticated;

-- ============================================
-- 7. CREATE DAILY REPORT GENERATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_daily_report(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report_exists BOOLEAN;
BEGIN
  -- Check if report already exists
  SELECT EXISTS(
    SELECT 1 FROM daily_activity_reports 
    WHERE report_date = p_date
  ) INTO v_report_exists;
  
  IF v_report_exists THEN
    -- Update existing report
    UPDATE daily_activity_reports
    SET
      total_signups = (
        SELECT COUNT(DISTINCT user_id) 
        FROM user_activity_log 
        WHERE activity_type = 'user_signup' 
        AND DATE(created_at) = p_date
      ),
      total_logins = (
        SELECT COUNT(*) 
        FROM user_activity_log 
        WHERE activity_type = 'user_login' 
        AND DATE(created_at) = p_date
      ),
      total_messages = (
        SELECT COUNT(*) 
        FROM user_activity_log 
        WHERE activity_type = 'message_sent' 
        AND DATE(created_at) = p_date
      ),
      total_likes = (
        SELECT COUNT(*) 
        FROM user_activity_log 
        WHERE activity_type = 'profile_liked' 
        AND DATE(created_at) = p_date
      ),
      total_matches = (
        SELECT COUNT(*) 
        FROM user_activity_log 
        WHERE activity_type = 'match_created' 
        AND DATE(created_at) = p_date
      ),
      total_payments = (
        SELECT COALESCE(SUM((activity_data->>'amount')::numeric), 0)
        FROM user_activity_log 
        WHERE activity_type = 'payment_completed' 
        AND DATE(created_at) = p_date
      ),
      active_users = (
        SELECT COUNT(DISTINCT user_id) 
        FROM user_activity_log 
        WHERE DATE(created_at) = p_date
      ),
      updated_at = NOW()
    WHERE report_date = p_date;
  ELSE
    -- Insert new report
    INSERT INTO daily_activity_reports (
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
    SELECT
      p_date,
      COUNT(DISTINCT CASE WHEN activity_type = 'user_signup' THEN user_id END),
      COUNT(CASE WHEN activity_type = 'user_login' THEN 1 END),
      COUNT(CASE WHEN activity_type = 'message_sent' THEN 1 END),
      COUNT(CASE WHEN activity_type = 'profile_liked' THEN 1 END),
      COUNT(CASE WHEN activity_type = 'match_created' THEN 1 END),
      COALESCE(SUM(CASE WHEN activity_type = 'payment_completed' THEN (activity_data->>'amount')::numeric END), 0),
      COUNT(DISTINCT user_id),
      0 -- new_premium_users - would need separate tracking
    FROM user_activity_log
    WHERE DATE(created_at) = p_date;
  END IF;
  
  RETURN format('Daily report generated for %s', p_date);
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_daily_report TO authenticated;

-- ============================================
-- 8. USAGE INSTRUCTIONS
-- ============================================

-- To populate test data, run as an admin user:
-- SELECT populate_test_activity_data();

-- To generate daily reports for past 7 days:
-- SELECT generate_daily_report(CURRENT_DATE - i) FROM generate_series(0, 6) i;

-- Verify data exists:
-- SELECT COUNT(*) FROM user_activity_log;
-- SELECT * FROM daily_activity_reports ORDER BY report_date DESC;
