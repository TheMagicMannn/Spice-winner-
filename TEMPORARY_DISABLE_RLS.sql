-- =====================================================
-- ⚠️ TEMPORARY: DISABLE RLS FOR TESTING
-- =====================================================
-- THIS IS FOR TESTING ONLY!
-- This will let you send messages to confirm the app works
-- Then we can fix the RLS policies properly
-- =====================================================

-- Disable RLS on messages table
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

SELECT 'RLS DISABLED on messages table' AS status;
SELECT 'You should now be able to send messages!' AS info;
SELECT 'This is TEMPORARY - we need to fix the policies!' AS warning;

-- =====================================================
-- TO RE-ENABLE RLS LATER:
-- =====================================================
-- Run this when ready:
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
--
-- Then we'll create proper policies that work!
-- =====================================================

-- =====================================================
-- NEXT STEPS AFTER TESTING:
-- =====================================================
-- 1. Try sending a message in your app
-- 2. If it works → RLS policies are the problem
-- 3. If it still doesn't work → something else is wrong
-- 4. Let me know the result and we'll fix the policies properly
-- =====================================================
