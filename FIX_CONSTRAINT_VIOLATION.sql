-- FIX: Check constraint violation in event_attendees table

-- Step 1: Drop the problematic constraint
ALTER TABLE event_attendees DROP CONSTRAINT IF EXISTS event_attendees_status_check;

-- Step 2: Check what invalid values exist
SELECT 
    COALESCE(status, 'NULL') as status_value,
    COUNT(*) as count
FROM event_attendees
GROUP BY status;

-- Step 3: Fix all invalid values
-- Set NULL and empty strings to 'confirmed'
UPDATE event_attendees 
SET status = 'confirmed' 
WHERE status IS NULL OR status = '' OR status NOT IN ('pending', 'confirmed', 'denied');

-- Step 4: Verify all values are now valid
SELECT 
    status,
    COUNT(*) as count
FROM event_attendees
GROUP BY status;

-- Step 5: Re-add the constraint (now it will work)
ALTER TABLE event_attendees 
ADD CONSTRAINT event_attendees_status_check 
CHECK (status IN ('pending', 'confirmed', 'denied'));

-- Step 6: Verify table is working
SELECT * FROM event_attendees LIMIT 5;

-- Done! Your table should now work properly.
