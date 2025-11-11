-- ============================================
-- TEST DATA: Insert Sample Attendees
-- ============================================
-- This creates test attendees so you can see the approve/deny UI

-- IMPORTANT: Replace these values:
-- YOUR_EVENT_ID: The ID of your test event (from events table)
-- YOUR_USER_ID: Your user ID (the event host)
-- TEST_USER_ID: Another user's ID for testing (or create a test user)

-- Step 1: Find your event ID
-- Run this to see your events:
SELECT id, title, author_id FROM events WHERE author_id = auth.uid() ORDER BY created_at DESC LIMIT 5;

-- Step 2: Insert test attendees with PENDING status
-- Replace 'YOUR_EVENT_ID' and 'TEST_USER_ID' with actual IDs

INSERT INTO event_attendees (event_id, user_id, status)
VALUES 
  ('YOUR_EVENT_ID', 'TEST_USER_ID', 'pending')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- To insert multiple test users, repeat with different user IDs:
-- INSERT INTO event_attendees (event_id, user_id, status)
-- VALUES 
--   ('YOUR_EVENT_ID', 'ANOTHER_USER_ID', 'pending')
-- ON CONFLICT (event_id, user_id) DO NOTHING;

-- Step 3: Verify the data was inserted
SELECT 
  ea.*,
  p.display_name,
  e.title as event_title
FROM event_attendees ea
JOIN profiles p ON p.id = ea.user_id
JOIN events e ON e.id = ea.event_id
WHERE ea.event_id = 'YOUR_EVENT_ID'
ORDER BY ea.created_at DESC;

-- ============================================
-- QUICK FIX: If you just want to test the UI
-- ============================================
-- This will show ALL your event attendees and their current status:

SELECT 
  ea.id as attendee_record_id,
  ea.event_id,
  ea.user_id,
  ea.status,
  ea.created_at,
  e.title as event_title,
  e.author_id as event_host_id,
  p.display_name as attendee_name
FROM event_attendees ea
JOIN events e ON e.id = ea.event_id
JOIN profiles p ON p.id = ea.user_id
WHERE e.author_id = auth.uid()
ORDER BY ea.created_at DESC;

-- To manually set some to pending for testing:
UPDATE event_attendees 
SET status = 'pending' 
WHERE id = 'ATTENDEE_RECORD_ID';

-- ============================================
-- CLEANUP: Remove test data when done
-- ============================================
-- DELETE FROM event_attendees WHERE id = 'ATTENDEE_RECORD_ID';
