-- NUCLEAR OPTION: Drop and recreate event_attendees table
-- WARNING: This will delete all RSVP data!
-- Only use if nothing else works

-- 1. Backup existing data first
CREATE TABLE event_attendees_backup AS 
SELECT * FROM event_attendees;

-- 2. Drop the problematic table
DROP TABLE IF EXISTS event_attendees CASCADE;

-- 3. Recreate it properly
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'denied')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 4. Restore data with default status
INSERT INTO event_attendees (id, event_id, user_id, status, created_at)
SELECT id, event_id, user_id, COALESCE(status, 'confirmed'), created_at
FROM event_attendees_backup;

-- 5. Disable RLS for now
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;

-- 6. Verify
SELECT COUNT(*) as restored_rows FROM event_attendees;
