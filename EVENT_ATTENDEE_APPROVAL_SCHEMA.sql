-- ============================================
-- EVENT ATTENDEE APPROVAL SYSTEM
-- ============================================
-- This adds an approval system where hosts can confirm/deny RSVPs

-- 1. Add status column to event_attendees table
ALTER TABLE event_attendees 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'denied'));

-- 2. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(event_id, status);

-- 3. Update existing records to 'confirmed' (backward compatibility)
UPDATE event_attendees SET status = 'confirmed' WHERE status IS NULL;

-- 4. Update RLS policies to allow hosts to update attendee status
DROP POLICY IF EXISTS "Event hosts can update attendee status" ON event_attendees;

CREATE POLICY "Event hosts can update attendee status"
ON event_attendees
FOR UPDATE
TO authenticated
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

-- 5. Ensure SELECT policy exists for all authenticated users
DROP POLICY IF EXISTS "Users can view all event attendees" ON event_attendees;

CREATE POLICY "Users can view all event attendees"
ON event_attendees
FOR SELECT
TO authenticated
USING (true);

-- 6. Ensure INSERT policy exists
DROP POLICY IF EXISTS "Users can add themselves as attendees" ON event_attendees;

CREATE POLICY "Users can add themselves as attendees"
ON event_attendees
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 7. Ensure DELETE policy exists
DROP POLICY IF EXISTS "Users can remove themselves as attendees" ON event_attendees;

CREATE POLICY "Users can remove themselves as attendees"
ON event_attendees
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Event authors can delete attendees" ON event_attendees;

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

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'event_attendees' 
AND column_name = 'status';
