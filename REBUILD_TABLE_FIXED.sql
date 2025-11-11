-- COMPLETE REBUILD: Fixed version

-- Step 1: Backup existing data
CREATE TABLE IF NOT EXISTS event_attendees_backup_final AS 
SELECT * FROM event_attendees;

-- Verify backup
SELECT COUNT(*) as backed_up_rows FROM event_attendees_backup_final;

-- Step 2: Drop the problematic table
DROP TABLE IF EXISTS event_attendees CASCADE;

-- Step 3: Recreate clean table
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Add foreign keys
ALTER TABLE event_attendees 
    ADD CONSTRAINT fk_event 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE event_attendees 
    ADD CONSTRAINT fk_user 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Add unique constraint
ALTER TABLE event_attendees 
    ADD CONSTRAINT unique_event_user 
    UNIQUE(event_id, user_id);

-- Step 6: Restore data (fixed column reference)
INSERT INTO event_attendees (id, event_id, user_id, status, created_at)
SELECT 
    b.id, 
    b.event_id, 
    b.user_id, 
    COALESCE(
        CASE 
            WHEN b.status IN ('pending', 'confirmed', 'denied') THEN b.status
            ELSE 'confirmed'
        END,
        'confirmed'
    ),
    b.created_at
FROM event_attendees_backup_final b
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Step 7: Disable RLS
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;

-- Step 8: Verify
SELECT * FROM event_attendees LIMIT 5;

SELECT 
    COUNT(*) as total_rows,
    COUNT(DISTINCT event_id) as unique_events,
    COUNT(DISTINCT user_id) as unique_users
FROM event_attendees;
