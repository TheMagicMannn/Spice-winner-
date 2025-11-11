-- =====================================================
-- EVENTS DETAIL PAGE - DATABASE SCHEMA REFERENCE
-- =====================================================
-- This file documents the complete database schema for the Events feature
-- including all tables, RLS policies, triggers, and storage configurations
-- required for the Events Detail Page functionality.
--
-- This schema is already implemented in your Supabase database.
-- No changes are needed unless you want to add new features.
-- =====================================================

-- =====================================================
-- TABLES OVERVIEW
-- =====================================================
-- 1. events - Main events table with all event details
-- 2. event_attendees - Tracks RSVPs and attendance
-- 3. event_comments - Stores comments on events

-- =====================================================
-- 1. EVENTS TABLE
-- =====================================================
-- Stores all event information including metadata

CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Event details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    category TEXT NOT NULL,
    
    -- Capacity and pricing
    max_capacity INTEGER NOT NULL DEFAULT 50,
    price DECIMAL(10, 2) DEFAULT 0,
    
    -- Additional info
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT title_length CHECK (char_length(title) >= 10 AND char_length(title) <= 200),
    CONSTRAINT description_length CHECK (char_length(description) >= 50 AND char_length(description) <= 2000),
    CONSTRAINT valid_category CHECK (category IN (
        'Hotel Takeover',
        'House Party',
        'Community Munch',
        'Meet and Greet',
        'Swingers Club Events',
        'Workshop/Education',
        'Private Play Events'
    )),
    CONSTRAINT valid_capacity CHECK (max_capacity > 0),
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT future_date CHECK (event_date >= CURRENT_DATE)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_events_author ON events(author_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_future ON events(event_date) WHERE event_date >= CURRENT_DATE;

-- =====================================================
-- 2. EVENT ATTENDEES TABLE
-- =====================================================
-- Tracks which users are attending which events (RSVP)

CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one RSVP per user per event
    UNIQUE(event_id, user_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

-- =====================================================
-- 3. EVENT COMMENTS TABLE
-- =====================================================
-- Stores comments and discussions about events

CREATE TABLE IF NOT EXISTS event_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT comment_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_event_comments_event ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user ON event_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_created ON event_comments(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- These policies control who can read, create, update, and delete records

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- EVENTS TABLE POLICIES
-- =====================================================

-- Policy: Anyone can view active future events
-- Allows all users (authenticated and anonymous) to see active events
CREATE POLICY "Anyone can view active future events"
    ON events FOR SELECT
    USING (is_active = true AND event_date >= CURRENT_DATE);

-- Policy: Users can create their own events
-- Only allows authenticated users to create events for themselves
CREATE POLICY "Users can create their own events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- Policy: Users can update their own events
-- Only the event author can modify their event
CREATE POLICY "Users can update their own events"
    ON events FOR UPDATE
    USING (auth.uid() = author_id);

-- Policy: Users can delete their own events
-- Only the event author can delete (soft delete via is_active) their event
CREATE POLICY "Users can delete their own events"
    ON events FOR DELETE
    USING (auth.uid() = author_id);

-- =====================================================
-- EVENT ATTENDEES TABLE POLICIES
-- =====================================================

-- Policy: Anyone can view attendees
-- Allows all users to see who is attending events (transparency)
CREATE POLICY "Anyone can view event attendees"
    ON event_attendees FOR SELECT
    USING (true);

-- Policy: Users can RSVP to events
-- Only authenticated users can RSVP for themselves
CREATE POLICY "Users can RSVP to events"
    ON event_attendees FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can cancel their RSVP
-- Only the user who RSVP'd can cancel their attendance
CREATE POLICY "Users can cancel their RSVP"
    ON event_attendees FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- EVENT COMMENTS TABLE POLICIES
-- =====================================================

-- Policy: Anyone can view comments
-- Allows all users to read comments on events
CREATE POLICY "Anyone can view event comments"
    ON event_comments FOR SELECT
    USING (true);

-- Policy: Users can create comments
-- Only authenticated users can post comments
CREATE POLICY "Users can create event comments"
    ON event_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own comments
-- Only the comment author can edit their comment
CREATE POLICY "Users can update their own event comments"
    ON event_comments FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own comments
-- Only the comment author can delete their comment
CREATE POLICY "Users can delete their own event comments"
    ON event_comments FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE BUCKET FOR EVENT IMAGES
-- =====================================================

-- Create storage bucket for event images (public access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can view event images
-- Public read access to all event images
CREATE POLICY "Anyone can view event images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-images');

-- Storage Policy: Authenticated users can upload event images
-- Any logged-in user can upload images
CREATE POLICY "Authenticated users can upload event images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'event-images' AND
        auth.role() = 'authenticated'
    );

-- Storage Policy: Users can update their own event images
-- Users can only modify images in their own folder (based on user ID)
CREATE POLICY "Users can update their own event images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'event-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage Policy: Users can delete their own event images
-- Users can only delete images in their own folder
CREATE POLICY "Users can delete their own event images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'event-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on events table
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_event_updated_at();

-- Trigger: Auto-update updated_at on comments table
CREATE TRIGGER update_event_comments_updated_at
    BEFORE UPDATE ON event_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_event_updated_at();

-- =====================================================
-- HELPFUL VIEWS (OPTIONAL)
-- =====================================================

-- View: Events with full author details and counts
-- This view simplifies queries by pre-joining event data with profile information
CREATE OR REPLACE VIEW events_with_details AS
SELECT 
    e.*,
    pr.display_name,
    pr.display_name2,
    pr.account_type,
    pr.photos,
    pr.is_verified,
    pr.membership_tier,
    pr.location as author_location,
    pr.age,
    pr.age2,
    pr.gender,
    pr.gender2,
    pr.orientation,
    pr.orientation2,
    (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendees_count,
    (SELECT COUNT(*) FROM event_comments WHERE event_id = e.id) as comments_count
FROM events e
JOIN profiles pr ON e.author_id = pr.id
WHERE e.is_active = true AND e.event_date >= CURRENT_DATE
ORDER BY e.event_date ASC, e.event_time ASC;

-- =====================================================
-- FEATURE SUMMARY FOR EVENT DETAIL PAGE
-- =====================================================
-- The Event Detail Page supports the following features:
--
-- 1. VIEW EVENT DETAILS
--    - Full event information (title, description, date, time, location)
--    - Event image and category
--    - Host profile information with verification badge
--    - Capacity and pricing details
--    - Tags and additional metadata
--
-- 2. RSVP FUNCTIONALITY
--    - Users can RSVP to attend events
--    - Users can cancel their RSVP
--    - Real-time capacity tracking
--    - Full/Almost Full indicators
--
-- 3. ATTENDEES LIST
--    - View all users who are attending
--    - Clickable profiles to view attendee details
--    - Verification badges for verified users
--
-- 4. COMMENTS SECTION
--    - Users can post comments on events
--    - View all comments with timestamps
--    - Profile information for commenters
--
-- 5. AUTHOR CONTROLS (Event Creator Only)
--    - Edit event details via modal
--    - Cancel/Delete event (soft delete)
--    - Confirmation dialog for deletion
--
-- 6. NAVIGATION
--    - From Events page (View Event Details button)
--    - From Profile page (Active Events section)
--    - Back navigation to Events page
--    - Click author profile to view full profile
--
-- =====================================================
-- NOTES
-- =====================================================
-- - All deletions are "soft deletes" (is_active = false)
-- - Events are automatically hidden after their date passes
-- - Image uploads are organized by user ID in storage
-- - RLS policies ensure users can only modify their own data
-- - Cascade deletes protect data integrity
-- 
-- =====================================================
-- END OF SCHEMA REFERENCE
-- =====================================================
