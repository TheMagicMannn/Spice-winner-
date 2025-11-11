-- Change default status to 'pending' for new RSVPs

ALTER TABLE event_attendees 
ALTER COLUMN status SET DEFAULT 'pending';

-- Verify the change
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'event_attendees' 
AND column_name = 'status';
