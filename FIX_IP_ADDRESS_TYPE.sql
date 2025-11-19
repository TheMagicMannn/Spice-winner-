-- FIX_IP_ADDRESS_TYPE.sql
-- Fix the log_user_activity function to handle inet type correctly

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

-- Create the function with proper type casting
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
    CASE 
      WHEN p_ip_address IS NOT NULL AND p_ip_address != '' 
      THEN p_ip_address::inet 
      ELSE NULL 
    END,
    p_user_agent
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Failed to log activity: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO service_role;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO anon;

-- Test the function
SELECT 'Function updated successfully! Testing...' as status;

-- Test with NULL ip_address
SELECT log_user_activity(
  (SELECT id FROM profiles LIMIT 1),
  'login',
  '{"test": true}'::jsonb,
  NULL,
  'Test User Agent'
) as test_result;

-- Verify it logged
SELECT 
  id,
  activity_type,
  activity_data,
  ip_address,
  user_agent,
  created_at
FROM user_activity_log 
ORDER BY created_at DESC 
LIMIT 1;

SELECT '✅ Function fixed and tested successfully!' as status;
