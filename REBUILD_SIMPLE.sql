-- SIMPLEST REBUILD: Just use updated_at

-- Backup if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'event_attendees_backup_final') THEN
        CREATE TABLE event_attendees_backup_final AS 
        SELECT * FROM event_attendees;
    END IF;
END $$;

-- Drop table
DROP TABLE IF EXISTS event_attendees CASCADE;

-- Recreate
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints
ALTER TABLE event_attendees 
    ADD CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD CONSTRAINT unique_event_user UNIQUE(event_id, user_id);

-- Restore data (use updated_at for created_at)
INSERT INTO event_attendees (id, event_id, user_id, status, created_at)
SELECT 
    id, 
    event_id, 
    user_id, 
    COALESCE(
        CASE WHEN status IN ('pending', 'confirmed', 'denied') 
        THEN status ELSE 'confirmed' END,
        'confirmed'
    ),
    updated_at
FROM event_attendees_backup_final;

-- Disable RLS
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT COUNT(*) as total_rows FROM event_attendees;
SELECT * FROM event_attendees LIMIT 3;
