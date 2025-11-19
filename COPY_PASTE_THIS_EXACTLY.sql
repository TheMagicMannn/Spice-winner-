-- ========================================
-- COPY THIS ENTIRE FILE AND PASTE IN SUPABASE SQL EDITOR
-- THEN CLICK "RUN"
-- ========================================

-- Step 1: Drop existing function if it exists
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

-- Step 2: Create the function with proper type handling
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
    RAISE WARNING 'Failed to log activity: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO service_role;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO anon;

-- Step 4: Test the function works
DO $$
DECLARE
    test_user_id UUID;
    test_result UUID;
BEGIN
    -- Get a user ID to test with
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found in profiles table. Function created but not tested.';
    ELSE
        -- Test the function
        SELECT log_user_activity(
            test_user_id,
            'login',
            '{"test": true, "source": "setup_script"}'::jsonb,
            NULL,
            'Setup Test'
        ) INTO test_result;
        
        IF test_result IS NOT NULL THEN
            RAISE NOTICE '✅ SUCCESS! Function created and tested. Activity ID: %', test_result;
        ELSE
            RAISE NOTICE '⚠️ Function created but test returned NULL. Check logs.';
        END IF;
    END IF;
END $$;

-- Step 5: Show verification
SELECT 
    '✅ Function log_user_activity created successfully!' as status,
    COUNT(*) as test_activities_logged
FROM user_activity_log 
WHERE activity_data->>'test' = 'true' 
AND activity_data->>'source' = 'setup_script';
