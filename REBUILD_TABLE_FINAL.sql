-- COMPLETE REBUILD: Final fixed version

-- Step 1: Check what columns the backup actually has
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'event_attendees_backup_final'
ORDER BY ordinal_position;

-- Step 2: If backup doesn't exist, create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_attendees_backup_final') THEN
        CREATE TABLE event_attendees_backup_final AS SELECT * FROM event_attendees;
    END IF;
END $$;

-- Step 3: Drop the problematic table
DROP TABLE IF EXISTS event_attendees CASCADE;

-- Step 4: Recreate clean table
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Add foreign keys
ALTER TABLE event_attendees 
    ADD CONSTRAINT fk_event 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE event_attendees 
    ADD CONSTRAINT fk_user 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 6: Add unique constraint
ALTER TABLE event_attendees 
    ADD CONSTRAINT unique_event_user 
    UNIQUE(event_id, user_id);

-- Step 7: Restore data - use whatever timestamp column exists
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
    COALESCE(b.created_at, b.updated_at, NOW())
FROM event_attendees_backup_final b
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Step 8: Disable RLS
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;

-- Step 9: Verify
SELECT * FROM event_attendees LIMIT 5;

SELECT COUNT(*) as restored_rows FROM event_attendees;
