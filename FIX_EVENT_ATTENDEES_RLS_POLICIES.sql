-- ============================================
-- FIX RLS POLICIES FOR EVENT_ATTENDEES AND EVENT_COMMENTS
-- ============================================
-- This script fixes the 400 errors when querying event_attendees and event_comments
-- by ensuring proper RLS policies are in place

-- ============================================
-- 1. EVENT_ATTENDEES TABLE
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all event attendees" ON event_attendees;
DROP POLICY IF EXISTS "Users can add themselves as attendees" ON event_attendees;
DROP POLICY IF EXISTS "Users can remove themselves as attendees" ON event_attendees;
DROP POLICY IF EXISTS "Event authors can view all attendees" ON event_attendees;

-- Enable RLS (if not already enabled)
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to view event attendees
-- This is needed for displaying attendee lists on event detail pages
CREATE POLICY "Users can view all event attendees"
ON event_attendees
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow users to add themselves as attendees (RSVP)
CREATE POLICY "Users can add themselves as attendees"
ON event_attendees
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to remove themselves as attendees (Cancel RSVP)
CREATE POLICY "Users can remove themselves as attendees"
ON event_attendees
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 4: Allow event authors to delete any attendee (event management)
CREATE POLICY "Event authors can delete attendees"
ON event_attendees
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

-- ============================================
-- 2. EVENT_COMMENTS TABLE
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all event comments" ON event_comments;
DROP POLICY IF EXISTS "Users can add comments to events" ON event_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON event_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON event_comments;
DROP POLICY IF EXISTS "Event authors can delete any comment" ON event_comments;

-- Enable RLS (if not already enabled)
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to view event comments
CREATE POLICY "Users can view all event comments"
ON event_comments
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow authenticated users to add comments
CREATE POLICY "Users can add comments to events"
ON event_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON event_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON event_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 5: Allow event authors to delete any comment on their events
CREATE POLICY "Event authors can delete any comment"
ON event_comments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_comments.event_id
    AND events.author_id = auth.uid()
  )
);

-- ============================================
-- 3. VERIFY THE POLICIES
-- ============================================

-- Check event_attendees policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'event_attendees'
ORDER BY policyname;

-- Check event_comments policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'event_comments'
ORDER BY policyname;

-- ============================================
-- INSTRUCTIONS
-- ============================================
/*
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste this entire script
4. Click "Run" to execute

This will:
- Create proper RLS policies for event_attendees and event_comments tables
- Allow authenticated users to view all attendees and comments
- Allow users to manage their own attendance and comments
- Allow event authors to manage comments on their events

After running this script, the 400 errors should be resolved and the event detail pages will load correctly.
*/
