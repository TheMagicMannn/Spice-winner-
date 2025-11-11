-- Test if we can query event_attendees at all

-- Drop the CHECK constraint temporarily to see if that's the issue
ALTER TABLE event_attendees DROP CONSTRAINT IF EXISTS event_attendees_status_check;

-- Try to select data
SELECT * FROM event_attendees LIMIT 5;

-- If that works, re-add the constraint properly
ALTER TABLE event_attendees 
ADD CONSTRAINT event_attendees_status_check 
CHECK (status IS NULL OR status IN ('pending', 'confirmed', 'denied'));

-- Update any NULL values
UPDATE event_attendees SET status = 'confirmed' WHERE status IS NULL;
