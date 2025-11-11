-- DIAGNOSTIC: Find out what's wrong with event_attendees table (PostgreSQL 12+ compatible)

-- 1. Check if table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'event_attendees'
ORDER BY ordinal_position;

-- 2. Check for any CHECK constraints (fixed for newer PostgreSQL)
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'event_attendees' 
AND con.contype = 'c';

-- 3. Count total rows
SELECT COUNT(*) as total_rows FROM event_attendees;

-- 4. Check actual data
SELECT 
    id,
    event_id,
    user_id,
    status,
    created_at
FROM event_attendees
LIMIT 10;

-- 5. Check status value distribution
SELECT 
    COALESCE(status, 'NULL') as status_value,
    COUNT(*) as count
FROM event_attendees
GROUP BY status;

-- 6. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'event_attendees';

-- 7. Check for a specific event's attendees (replace with your event ID)
-- SELECT * FROM event_attendees WHERE event_id = 'YOUR_EVENT_ID_HERE';
