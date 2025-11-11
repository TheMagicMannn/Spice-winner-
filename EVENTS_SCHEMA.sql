-- =====================================================
-- EVENTS FEATURE - DATABASE SCHEMA
-- =====================================================
-- This schema adds Events functionality allowing users
-- to create and manage lifestyle events

-- =====================================================
-- 0. ENABLE REQUIRED EXTENSIONS
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. EVENTS TABLE
-- =====================================================

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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_events_author ON events(author_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_future ON events(event_date) WHERE event_date >= CURRENT_DATE;

-- =====================================================
-- 2. EVENT ATTENDEES TABLE (RSVP tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one RSVP per user per event
    UNIQUE(event_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

-- =====================================================
-- 3. EVENT COMMENTS TABLE
-- =====================================================

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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_event_comments_event ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user ON event_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_created ON event_comments(created_at DESC);

-- =====================================================
-- 4. STORAGE BUCKET FOR EVENT IMAGES
-- =====================================================

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;

-- Storage policies for event images
CREATE POLICY "Anyone can view event images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'event-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own event images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'event-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own event images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'event-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Events Policies
-- Anyone can view active future events
CREATE POLICY "Anyone can view active future events"
    ON events FOR SELECT
    USING (is_active = true AND event_date >= CURRENT_DATE);

-- Users can create their own events
CREATE POLICY "Users can create their own events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- Users can update their own events
CREATE POLICY "Users can update their own events"
    ON events FOR UPDATE
    USING (auth.uid() = author_id);

-- Users can delete their own events
CREATE POLICY "Users can delete their own events"
    ON events FOR DELETE
    USING (auth.uid() = author_id);

-- Event Attendees Policies
-- Anyone can view attendees
CREATE POLICY "Anyone can view event attendees"
    ON event_attendees FOR SELECT
    USING (true);

-- Users can RSVP to events
CREATE POLICY "Users can RSVP to events"
    ON event_attendees FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can cancel their RSVP
CREATE POLICY "Users can cancel their RSVP"
    ON event_attendees FOR DELETE
    USING (auth.uid() = user_id);

-- Event Comments Policies
-- Anyone can view comments
CREATE POLICY "Anyone can view event comments"
    ON event_comments FOR SELECT
    USING (true);

-- Users can create comments
CREATE POLICY "Users can create event comments"
    ON event_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own event comments"
    ON event_comments FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own event comments"
    ON event_comments FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on events
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_event_updated_at();

-- Trigger to auto-update updated_at on comments
CREATE TRIGGER update_event_comments_updated_at
    BEFORE UPDATE ON event_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_event_updated_at();

-- =====================================================
-- 7. VIEWS FOR EASIER QUERYING
-- =====================================================

-- View to get events with author details and counts
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
-- COMPLETED: EVENTS SCHEMA
-- =====================================================
-- To apply this schema to your Supabase database:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
-- =====================================================