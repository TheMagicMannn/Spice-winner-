-- CLEAR_TEST_DATA.sql
-- Remove all test data and prepare for real activity logging

-- Delete all test activity records
DELETE FROM user_activity_log 
WHERE activity_data->>'test_data' = 'true';

-- Delete all daily reports (they'll be regenerated from real data)
DELETE FROM daily_activity_reports;

-- Verify cleanup
SELECT 
  (SELECT COUNT(*) FROM user_activity_log) as remaining_activities,
  (SELECT COUNT(*) FROM daily_activity_reports) as remaining_reports;

-- Success message
SELECT '✅ Test data cleared. Real activity logging is now ready!' as status;
