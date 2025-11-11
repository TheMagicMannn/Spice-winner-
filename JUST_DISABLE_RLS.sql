-- DISABLE RLS COMPLETELY
-- This will make your app work immediately

ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('event_attendees', 'event_comments');

-- You should see rls_enabled = false for both tables
