-- =====================================================
-- EVENTS TABLE MIGRATION FIX
-- =====================================================
-- This script migrates your existing events table to match
-- the expected schema without losing any data
-- 
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- STEP 1: Add missing columns if they don't exist
-- =====================================================

-- Add author_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'author_id') THEN
        ALTER TABLE events ADD COLUMN author_id UUID;
    END IF;
END $$;

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'is_active') THEN
        ALTER TABLE events ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add category column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'category') THEN
        ALTER TABLE events ADD COLUMN category TEXT DEFAULT 'House Party';
    END IF;
END $$;

-- Add event_time column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'event_time') THEN
        ALTER TABLE events ADD COLUMN event_time TIME DEFAULT '19:00:00';
    END IF;
END $$;

-- Add max_capacity column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'max_capacity') THEN
        ALTER TABLE events ADD COLUMN max_capacity INTEGER DEFAULT 50;
    END IF;
END $$;

-- Add price column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'price') THEN
        ALTER TABLE events ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

-- Add tags column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'tags') THEN
        ALTER TABLE events ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'image_url') THEN
        ALTER TABLE events ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- =====================================================
-- STEP 2: Migrate data from created_by to author_id
-- =====================================================

-- Copy created_by to author_id if author_id is null and created_by exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'events' AND column_name = 'created_by') THEN
        UPDATE events SET author_id = created_by WHERE author_id IS NULL;
    END IF;
END $$;

-- =====================================================
-- STEP 3: Set default values for existing rows
-- =====================================================

-- Set is_active to true for all existing events if null
UPDATE events SET is_active = true WHERE is_active IS NULL;

-- Set default category for existing events if null
UPDATE events SET category = 'House Party' WHERE category IS NULL OR category = '';

-- Set default event_time for existing events if null
UPDATE events SET event_time = '19:00:00' WHERE event_time IS NULL;

-- Set default max_capacity if null
UPDATE events SET max_capacity = 50 WHERE max_capacity IS NULL;

-- Set default price if null
UPDATE events SET price = 0 WHERE price IS NULL;

-- Set default tags if null
UPDATE events SET tags = '{}' WHERE tags IS NULL;

-- =====================================================
-- STEP 4: Make author_id NOT NULL and add foreign key
-- =====================================================

-- Make author_id NOT NULL
ALTER TABLE events ALTER COLUMN author_id SET NOT NULL;

-- Drop existing foreign key if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_author' AND table_name = 'events') THEN
        ALTER TABLE events DROP CONSTRAINT fk_author;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_events_author' AND table_name = 'events') THEN
        ALTER TABLE events DROP CONSTRAINT fk_events_author;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'events_author_id_fkey' AND table_name = 'events') THEN
        ALTER TABLE events DROP CONSTRAINT events_author_id_fkey;
    END IF;
END $$;

-- Add foreign key constraint
ALTER TABLE events 
ADD CONSTRAINT fk_events_author 
FOREIGN KEY (author_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- =====================================================
-- STEP 5: Add constraints
-- =====================================================

-- Drop existing constraints if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'valid_category' AND table_name = 'events') THEN
        ALTER TABLE events DROP CONSTRAINT valid_category;
    END IF;
END $$;

-- Add category constraint
ALTER TABLE events ADD CONSTRAINT valid_category 
CHECK (category IN (
    'Hotel Takeover',
    'House Party',
    'Community Munch',
    'Meet and Greet',
    'Swingers Club Events',
    'Workshop/Education',
    'Private Play Events'
));

-- Add other constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'valid_capacity' AND table_name = 'events') THEN
        ALTER TABLE events ADD CONSTRAINT valid_capacity CHECK (max_capacity > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'valid_price' AND table_name = 'events') THEN
        ALTER TABLE events ADD CONSTRAINT valid_price CHECK (price >= 0);
    END IF;
END $$;

-- =====================================================
-- STEP 6: Create or update indexes
-- =====================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_events_author ON events(author_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active) WHERE is_active = true;
-- Note: Removed idx_events_future because CURRENT_DATE is not immutable and can't be used in index predicates

-- =====================================================
-- STEP 7: Update or create RLS policies
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active future events" ON events;
DROP POLICY IF EXISTS "Users can create their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Recreate policies
CREATE POLICY "Anyone can view active future events"
    ON events FOR SELECT
    USING (is_active = true);

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
-- STEP 8: Create helper functions and triggers
-- =====================================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_events_updated_at ON events;

-- Create trigger
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_event_updated_at();

-- =====================================================
-- STEP 9: Optional - Drop created_by column if it exists
-- =====================================================
-- Uncomment the following lines if you want to remove the old created_by column
-- after verifying that the migration was successful

-- DO $$ 
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.columns 
--                WHERE table_name = 'events' AND column_name = 'created_by') THEN
--         ALTER TABLE events DROP COLUMN created_by;
--     END IF;
-- END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries after migration to verify everything worked:

-- Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'events'
-- ORDER BY ordinal_position;

-- Check constraints
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'events';

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'events';

-- Check RLS policies
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'events';

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Your events table is now compatible with the frontend code.
-- All existing data has been preserved.
-- 
-- Next steps:
-- 1. Test the query that was failing before
-- 2. If everything works, you can uncomment Step 9 to drop the old created_by column
-- =====================================================
