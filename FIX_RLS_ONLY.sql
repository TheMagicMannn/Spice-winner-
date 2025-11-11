-- The status column exists, but RLS policies are blocking access
-- Run this to fix the permissions

-- 1. Make sure RLS is enabled
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- 2. Drop and recreate the SELECT policy
DROP POLICY IF EXISTS "Users can view all event attendees" ON event_attendees;
CREATE POLICY "Users can view all event attendees"
ON event_attendees FOR SELECT 
TO authenticated 
USING (true);

-- 3. Ensure INSERT policy exists
DROP POLICY IF EXISTS "Users can add themselves as attendees" ON event_attendees;
CREATE POLICY "Users can add themselves as attendees"
ON event_attendees FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 4. Add UPDATE policy for hosts
DROP POLICY IF EXISTS "Event hosts can update attendee status" ON event_attendees;
CREATE POLICY "Event hosts can update attendee status"
ON event_attendees FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

-- 5. Add DELETE policies
DROP POLICY IF EXISTS "Users can remove themselves as attendees" ON event_attendees;
CREATE POLICY "Users can remove themselves as attendees"
ON event_attendees FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Event authors can delete attendees" ON event_attendees;
CREATE POLICY "Event authors can delete attendees"
ON event_attendees FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

-- Verify policies are created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'event_attendees'
ORDER BY policyname;
