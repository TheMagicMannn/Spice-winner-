# Events SQL Troubleshooting Guide

## Error: "column author_id does not exist"

This error means the foreign key reference isn't working. Here's how to fix it:

### Solution 1: Use Step-by-Step SQL File

Instead of running the main SQL file, use the step-by-step version:

1. Open `/app/EVENTS_SCHEMA_STEP_BY_STEP.sql`
2. Run each section ONE AT A TIME
3. If a step fails, note which one and check below

### Solution 2: Verify Prerequisites

Before running any events SQL, verify:

```sql
-- Check if profiles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'profiles'
);
-- Should return: true

-- Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'id';
-- Should show: id | uuid

-- Check if uuid extension is enabled
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
-- Should return a row
```

### Solution 3: Manual Table Creation (If Above Fails)

If automated scripts fail, create tables manually:

#### Step 1: Create Events Table
```sql
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    category TEXT NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 50,
    price DECIMAL(10, 2) DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

#### Step 2: Add Foreign Key Separately
```sql
ALTER TABLE events 
ADD CONSTRAINT fk_events_author 
FOREIGN KEY (author_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;
```

#### Step 3: Add Constraints
```sql
ALTER TABLE events ADD CONSTRAINT title_length 
CHECK (char_length(title) >= 10 AND char_length(title) <= 200);

ALTER TABLE events ADD CONSTRAINT description_length 
CHECK (char_length(description) >= 50 AND char_length(description) <= 2000);

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

ALTER TABLE events ADD CONSTRAINT valid_capacity 
CHECK (max_capacity > 0);

ALTER TABLE events ADD CONSTRAINT valid_price 
CHECK (price >= 0);

ALTER TABLE events ADD CONSTRAINT future_date 
CHECK (event_date >= CURRENT_DATE);
```

#### Step 4: Create Attendees Table
```sql
CREATE TABLE event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

ALTER TABLE event_attendees 
ADD CONSTRAINT fk_attendees_event 
FOREIGN KEY (event_id) 
REFERENCES events(id) 
ON DELETE CASCADE;

ALTER TABLE event_attendees 
ADD CONSTRAINT fk_attendees_user 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;
```

#### Step 5: Create Comments Table
```sql
CREATE TABLE event_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT comment_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500)
);

ALTER TABLE event_comments 
ADD CONSTRAINT fk_comments_event 
FOREIGN KEY (event_id) 
REFERENCES events(id) 
ON DELETE CASCADE;

ALTER TABLE event_comments 
ADD CONSTRAINT fk_comments_user 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;
```

## Common Issues and Solutions

### Issue: "relation profiles does not exist"
**Solution**: You need to run the main database schema first that creates the profiles table.

### Issue: "function uuid_generate_v4() does not exist"
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: Storage bucket policies fail
**Solution**: Create the bucket in the UI first:
1. Go to Supabase Dashboard > Storage
2. Click "Create bucket"
3. Name: `event-images`
4. Check "Public bucket"
5. Click Create
6. Then run the policy SQL

### Issue: "permission denied for schema storage"
**Solution**: Run storage policies as the postgres user or create bucket via UI first.

## Verification Queries

After running the SQL, verify everything is set up:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'event%';
-- Should show: events, event_attendees, event_comments

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename LIKE 'event%';
-- All should show: t (true)

-- Check policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE tablename LIKE 'event%';
-- Should show multiple policies for each table

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename LIKE 'event%';
-- Should show multiple indexes

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'event-images';
-- Should return one row
```

## Quick Test Query

After setup, test with a simple query:

```sql
-- This should return empty result (no error)
SELECT * FROM events WHERE is_active = true;

-- Check if foreign key works
SELECT e.*, p.display_name 
FROM events e 
LEFT JOIN profiles p ON e.author_id = p.id 
LIMIT 1;
```

## Still Having Issues?

If you're still getting errors:

1. **Check Supabase logs**: Go to Dashboard > Database > Logs
2. **Verify auth**: Make sure you're using the correct service role key
3. **Check permissions**: Ensure your user has proper permissions
4. **Try UI approach**: Create tables manually in Table Editor
5. **Contact support**: Provide the exact error message and which step failed

## Alternative: Minimal Setup

If all else fails, here's a minimal setup without constraints:

```sql
-- Minimal events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    category TEXT NOT NULL,
    max_capacity INTEGER DEFAULT 50,
    price DECIMAL(10, 2) DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Public read" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Auth insert" ON events FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Owner update" ON events FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Owner delete" ON events FOR DELETE USING (auth.uid() = author_id);
```

This minimal setup will get events working, then you can add constraints and other tables incrementally.
