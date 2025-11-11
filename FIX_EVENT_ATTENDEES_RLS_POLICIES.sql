-- ============================================
-- FIX RLS POLICIES FOR EVENT_ATTENDEES AND EVENT_COMMENTS
-- ============================================

-- EVENT_ATTENDEES TABLE
DROP POLICY IF EXISTS "Users can view all event attendees" ON event_attendees;
DROP POLICY IF EXISTS "Users can add themselves as attendees" ON event_attendees;
DROP POLICY IF EXISTS "Users can remove themselves as attendees" ON event_attendees;
DROP POLICY IF EXISTS "Event authors can delete attendees" ON event_attendees;

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all event attendees"
ON event_attendees FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add themselves as attendees"
ON event_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove themselves as attendees"
ON event_attendees FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Event authors can delete attendees"
ON event_attendees FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

-- EVENT_COMMENTS TABLE
DROP POLICY IF EXISTS "Users can view all event comments" ON event_comments;
DROP POLICY IF EXISTS "Users can add comments to events" ON event_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON event_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON event_comments;
DROP POLICY IF EXISTS "Event authors can delete any comment" ON event_comments;

ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all event comments"
ON event_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add comments to events"
ON event_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON event_comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON event_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Event authors can delete any comment"
ON event_comments FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_comments.event_id
    AND events.author_id = auth.uid()
  )
);
