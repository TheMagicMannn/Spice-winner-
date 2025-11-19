-- CHECK_ACTIVITY_TYPES.sql
-- Run this to see what activity types are allowed in your database

-- Check the constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_activity_log'::regclass
AND conname LIKE '%activity_type%';

-- This will show you the exact allowed values
-- Example output might be:
-- CHECK (activity_type = ANY (ARRAY['login', 'signup', 'profile_view', 'message', ...]))
