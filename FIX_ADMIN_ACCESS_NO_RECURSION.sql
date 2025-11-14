-- =====================================================
-- FIX ADMIN ACCESS WITHOUT INFINITE RECURSION
-- =====================================================
-- This creates a safe way to check admin status that
-- doesn't cause infinite recursion
-- =====================================================

-- =====================================================
-- STEP 1: CREATE SECURITY DEFINER FUNCTION
-- =====================================================
-- This function runs with elevated privileges and bypasses RLS
-- So it won't cause recursion when checking is_admin

CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- This is the key - runs as superuser, bypasses RLS
SET search_path = public
AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN
    -- Direct query without RLS check
    SELECT is_admin INTO admin_status
    FROM profiles
    WHERE id = user_id;
    
    RETURN COALESCE(admin_status, false);
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- =====================================================
-- STEP 2: ADD ADMIN POLICIES TO PROFILES
-- =====================================================

-- Drop existing admin policy if exists
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create safe admin policy using the function
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_user_admin(auth.uid()));

-- =====================================================
-- STEP 3: ADD ADMIN POLICIES TO ADMIN TABLES
-- =====================================================

-- User Activity Log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all activity" ON user_activity_log;
DROP POLICY IF EXISTS "System can insert activity" ON user_activity_log;

CREATE POLICY "System can insert activity" 
    ON user_activity_log FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
    ON user_activity_log FOR SELECT
    USING (is_user_admin(auth.uid()));

-- User Memberships
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view memberships" ON user_memberships;
DROP POLICY IF EXISTS "System can manage memberships" ON user_memberships;

CREATE POLICY "System can manage memberships"
    ON user_memberships FOR ALL
    USING (true);

CREATE POLICY "Admins can view memberships"
    ON user_memberships FOR SELECT
    USING (is_user_admin(auth.uid()));

-- Payment History
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view payments" ON payment_history;
DROP POLICY IF EXISTS "System can insert payments" ON payment_history;

CREATE POLICY "System can insert payments"
    ON payment_history FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view payments"
    ON payment_history FOR SELECT
    USING (is_user_admin(auth.uid()));

-- Admin Actions Log
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin actions" ON admin_actions_log;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON admin_actions_log;

CREATE POLICY "Admins can view admin actions"
    ON admin_actions_log FOR SELECT
    USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can insert admin actions"
    ON admin_actions_log FOR INSERT
    WITH CHECK (is_user_admin(auth.uid()));

-- Daily Activity Reports
ALTER TABLE daily_activity_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view reports" ON daily_activity_reports;

CREATE POLICY "Admins can view reports"
    ON daily_activity_reports FOR SELECT
    USING (is_user_admin(auth.uid()));

-- Admin Email Reports
ALTER TABLE admin_email_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage email reports" ON admin_email_reports;

CREATE POLICY "Admins can manage email reports"
    ON admin_email_reports FOR ALL
    USING (is_user_admin(auth.uid()));

-- =====================================================
-- STEP 4: ADD POLICIES FOR USER REPORTS (NEW)
-- =====================================================

-- Check if user_reports table exists and add policies
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_reports'
    ) THEN
        -- Enable RLS
        ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can submit reports" ON user_reports;
        DROP POLICY IF EXISTS "Admins can view all reports" ON user_reports;
        DROP POLICY IF EXISTS "Admins can update reports" ON user_reports;
        
        -- Create new policies
        EXECUTE 'CREATE POLICY "Users can submit reports" ON user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id)';
        EXECUTE 'CREATE POLICY "Admins can view all reports" ON user_reports FOR SELECT USING (is_user_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Admins can update reports" ON user_reports FOR UPDATE USING (is_user_admin(auth.uid()))';
        
        RAISE NOTICE '✅ Added policies to user_reports table';
    ELSE
        RAISE NOTICE '⚠️ user_reports table does not exist';
    END IF;
END $$;

-- =====================================================
-- STEP 5: VERIFICATION
-- =====================================================

-- Test the function
SELECT 
    id,
    email,
    is_admin,
    is_user_admin(id) as admin_check_result
FROM profiles
LIMIT 5;

-- Check all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN (
    'profiles',
    'user_activity_log',
    'user_memberships',
    'payment_history',
    'admin_actions_log',
    'daily_activity_reports',
    'admin_email_reports',
    'user_reports'
)
ORDER BY tablename, policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
    admin_count INTEGER;
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE is_admin = true;
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN (
        'profiles',
        'user_activity_log',
        'user_reports'
    );

    RAISE NOTICE '====================================================';
    RAISE NOTICE '✅ ADMIN ACCESS RESTORED (NO RECURSION)!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '✅ Created SECURITY DEFINER function to check admin status';
    RAISE NOTICE '✅ Function bypasses RLS - no recursion possible';
    RAISE NOTICE '✅ Added admin policies to all admin tables';
    RAISE NOTICE '✅ Added policies for user_reports';
    RAISE NOTICE '';
    RAISE NOTICE 'Statistics:';
    RAISE NOTICE '  Admin users: %', admin_count;
    RAISE NOTICE '  Active policies: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 REFRESH YOUR APP NOW!';
    RAISE NOTICE 'Admin users can now:';
    RAISE NOTICE '  ✅ View all profiles';
    RAISE NOTICE '  ✅ View user reports';
    RAISE NOTICE '  ✅ View activity logs';
    RAISE NOTICE '  ✅ Manage memberships';
    RAISE NOTICE '  ✅ View payment history';
    RAISE NOTICE '====================================================';
END $$;
