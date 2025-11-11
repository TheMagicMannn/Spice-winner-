-- COPY THIS ENTIRE BLOCK AND RUN IN SUPABASE SQL EDITOR
-- This fixes the 406 error and enables RSVP approval features

-- 1. Add status column to event_attendees table
ALTER TABLE event_attendees 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
CHECK (status IN ('pending', 'confirmed', 'denied'));

-- 2. Set existing records to confirmed (backward compatibility)
UPDATE event_attendees SET status = 'confirmed' WHERE status IS NULL;

-- 3. Allow everyone to view attendees
DROP POLICY IF EXISTS "Users can view all event attendees" ON event_attendees;
CREATE POLICY "Users can view all event attendees"
ON event_attendees FOR SELECT TO authenticated USING (true);

-- 4. Allow users to RSVP
DROP POLICY IF EXISTS "Users can add themselves as attendees" ON event_attendees;
CREATE POLICY "Users can add themselves as attendees"
ON event_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Allow hosts to approve/deny
DROP POLICY IF EXISTS "Event hosts can update attendee status" ON event_attendees;
CREATE POLICY "Event hosts can update attendee status"
ON event_attendees FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

-- 6. Allow users to cancel their RSVP
DROP POLICY IF EXISTS "Users can remove themselves as attendees" ON event_attendees;
CREATE POLICY "Users can remove themselves as attendees"
ON event_attendees FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. Allow hosts to remove any attendee
DROP POLICY IF EXISTS "Event authors can delete attendees" ON event_attendees;
CREATE POLICY "Event authors can delete attendees"
ON event_attendees FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

-- Done! Refresh your app to see the changes.
