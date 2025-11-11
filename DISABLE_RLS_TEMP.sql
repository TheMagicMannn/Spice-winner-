-- TEMPORARY FIX: Disable RLS to verify everything works
-- WARNING: This removes security temporarily for testing only

-- Disable RLS on event_attendees table
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;

-- Check if it worked
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'event_attendees';

-- IMPORTANT: After verifying it works, re-enable RLS with:
-- ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
-- Then run the policy script again
