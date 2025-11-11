-- COMPLETE FIX: Disable RLS temporarily, then re-enable with correct policies

-- Step 1: Disable RLS on both tables
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments DISABLE ROW LEVEL SECURITY;

-- Step 2: Re-enable RLS
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'event_attendees') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON event_attendees';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'event_comments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON event_comments';
    END LOOP;
END $$;

-- Step 4: Create fresh policies for event_attendees
CREATE POLICY "allow_all_select_event_attendees"
ON event_attendees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_insert_own_attendance"
ON event_attendees FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_by_host"
ON event_attendees FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

CREATE POLICY "allow_delete_own_attendance"
ON event_attendees FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "allow_delete_by_host"
ON event_attendees FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

-- Step 5: Create fresh policies for event_comments
CREATE POLICY "allow_all_select_event_comments"
ON event_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_insert_own_comments"
ON event_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own_comments"
ON event_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_comments"
ON event_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "allow_delete_comments_by_host"
ON event_comments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_comments.event_id
    AND events.author_id = auth.uid()
  )
);

-- Step 6: Verify policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('event_attendees', 'event_comments')
ORDER BY tablename, policyname;
