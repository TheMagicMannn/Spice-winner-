-- =====================================================
-- EVENTS FEATURE - STEP BY STEP SETUP
-- =====================================================
-- Run each section one at a time if you encounter errors
-- This allows you to identify which specific part fails

-- =====================================================
-- STEP 1: Enable Extensions (Run this first)
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 2: Create Events Table
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID NOT NULL,
    
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
    CONSTRAINT future_date CHECK (event_date >= CURRENT_DATE),
    
    -- Foreign key
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 3: Create Indexes for Events Table
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_events_author ON events(author_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_future ON events(event_date) WHERE event_date >= CURRENT_DATE;

-- =====================================================
-- STEP 4: Create Event Attendees Table
-- =====================================================

CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(event_id, user_id),
    
    -- Foreign keys
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 5: Create Indexes for Event Attendees
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

-- =====================================================
-- STEP 6: Create Event Comments Table
-- =====================================================

CREATE TABLE IF NOT EXISTS event_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT comment_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
    
    -- Foreign keys
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 7: Create Indexes for Event Comments
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_event_comments_event ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user ON event_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_created ON event_comments(created_at DESC);

-- =====================================================
-- STEP 8: Enable RLS on All Tables
-- =====================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 9: Create RLS Policies for Events
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active future events" ON events;
DROP POLICY IF EXISTS "Users can create their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Create new policies
CREATE POLICY "Anyone can view active future events"
    ON events FOR SELECT
    USING (is_active = true AND event_date >= CURRENT_DATE);

CREATE POLICY "Users can create their own events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own events"
    ON events FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own events"
    ON events FOR DELETE
    USING (auth.uid() = author_id);

-- =====================================================
-- STEP 10: Create RLS Policies for Event Attendees
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view event attendees" ON event_attendees;
DROP POLICY IF EXISTS "Users can RSVP to events" ON event_attendees;
DROP POLICY IF EXISTS "Users can cancel their RSVP" ON event_attendees;

-- Create new policies
CREATE POLICY "Anyone can view event attendees"
    ON event_attendees FOR SELECT
    USING (true);

CREATE POLICY "Users can RSVP to events"
    ON event_attendees FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their RSVP"
    ON event_attendees FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- STEP 11: Create RLS Policies for Event Comments
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view event comments" ON event_comments;
DROP POLICY IF EXISTS "Users can create event comments" ON event_comments;
DROP POLICY IF EXISTS "Users can update their own event comments" ON event_comments;
DROP POLICY IF EXISTS "Users can delete their own event comments" ON event_comments;

-- Create new policies
CREATE POLICY "Anyone can view event comments"
    ON event_comments FOR SELECT
    USING (true);

CREATE POLICY "Users can create event comments"
    ON event_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event comments"
    ON event_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event comments"
    ON event_comments FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- STEP 12: Create Helper Functions and Triggers
-- =====================================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_event_comments_updated_at ON event_comments;

-- Create function
CREATE OR REPLACE FUNCTION update_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_event_updated_at();

CREATE TRIGGER update_event_comments_updated_at
    BEFORE UPDATE ON event_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_event_updated_at();

-- =====================================================
-- STEP 13: Create View for Events with Details
-- =====================================================

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
-- STEP 14: Create Storage Bucket (Run in Supabase Dashboard)
-- =====================================================

-- NOTE: You may need to create this in the Supabase Dashboard UI
-- Go to Storage > Create bucket > Name: "event-images" > Make public

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 15: Create Storage Policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;

-- Create storage policies
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
-- COMPLETED!
-- =====================================================
-- All events tables, policies, and storage are now set up.
-- You can now use the Events feature in your app!
-- =====================================================
