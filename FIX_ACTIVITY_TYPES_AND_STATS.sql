-- FIX_ACTIVITY_TYPES_AND_STATS.sql
-- Fix activity type constraints and generate overview statistics

-- ========================================
-- STEP 1: Check current activity type constraint
-- ========================================
SELECT 
    'Current activity type constraint:' as info,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_activity_log'::regclass
AND conname LIKE '%activity_type%';

-- ========================================
-- STEP 2: Update constraint to allow all activity types
-- ========================================
ALTER TABLE user_activity_log 
DROP CONSTRAINT IF EXISTS user_activity_log_activity_type_check;

ALTER TABLE user_activity_log 
ADD CONSTRAINT user_activity_log_activity_type_check 
CHECK (activity_type IN (
  'login',
  'signup',
  'profile_view',
  'profile_update',
  'like',
  'match',
  'message',
  'photo_upload',
  'payment',
  'verification_requested',
  'verification_completed'
));

SELECT '✅ Activity type constraint updated!' as status;

-- ========================================
-- STEP 3: Show current activity breakdown
-- ========================================
SELECT 
    '📊 Current activities in database:' as info,
    activity_type,
    COUNT(*) as count,
    MAX(created_at) as latest_activity
FROM user_activity_log
GROUP BY activity_type
ORDER BY count DESC;

-- ========================================
-- STEP 4: Generate daily reports for last 7 days
-- ========================================
DO $$
DECLARE
    report_date DATE;
    days_back INTEGER;
BEGIN
    FOR days_back IN 0..6 LOOP
        report_date := CURRENT_DATE - days_back;
        
        -- Delete existing report if any
        DELETE FROM daily_activity_reports WHERE report_date = report_date;
        
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
            report_date,
            COUNT(DISTINCT CASE WHEN activity_type IN ('signup') THEN user_id END),
            COUNT(CASE WHEN activity_type IN ('login') THEN 1 END),
            COUNT(CASE WHEN activity_type IN ('message') THEN 1 END),
            COUNT(CASE WHEN activity_type IN ('like') THEN 1 END),
            COUNT(CASE WHEN activity_type IN ('match') THEN 1 END),
            COALESCE(SUM(CASE WHEN activity_type IN ('payment') THEN (activity_data->>'amount')::numeric END), 0),
            COUNT(DISTINCT user_id),
            0
        FROM user_activity_log
        WHERE DATE(created_at) = report_date;
        
        RAISE NOTICE 'Generated report for %', report_date;
    END LOOP;
END $$;

SELECT '✅ Daily reports generated for last 7 days!' as status;

-- ========================================
-- STEP 5: Verify daily reports
-- ========================================
SELECT 
    '📈 Daily reports:' as info,
    report_date,
    total_signups,
    total_logins,
    total_messages,
    total_likes,
    total_matches,
    active_users
FROM daily_activity_reports
ORDER BY report_date DESC;

-- ========================================
-- STEP 6: Check IP addresses in activities
-- ========================================
SELECT 
    '🌐 IP Address capture:' as info,
    COUNT(*) as total_activities,
    COUNT(ip_address) as with_ip_address,
    COUNT(*) - COUNT(ip_address) as without_ip_address,
    ROUND(100.0 * COUNT(ip_address) / COUNT(*), 2) || '%' as ip_capture_rate
FROM user_activity_log;

-- ========================================
-- STEP 7: Show sample activities with full details
-- ========================================
SELECT 
    '📋 Recent activities (with details):' as info,
    id,
    activity_type,
    user_id,
    ip_address,
    user_agent,
    activity_data->>'email' as email,
    activity_data->>'url' as url,
    created_at
FROM user_activity_log
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
SELECT 
    '✅ ALL FIXES APPLIED!' as status,
    '1. Activity type constraints updated' as fix_1,
    '2. Daily reports generated' as fix_2,
    '3. Now test in your app:' as next_step,
    '   - Login (should capture IP)' as test_1,
    '   - Update profile (should log)' as test_2,
    '   - Send message (should log)' as test_3,
    '   - Check Overview tab for stats' as test_4;
