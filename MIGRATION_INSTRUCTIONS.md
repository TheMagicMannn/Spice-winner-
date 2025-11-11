# Events Table Migration Instructions

## Problem Summary
Your Supabase events table has the wrong schema, causing 400 errors when the frontend tries to query events. The table is using `created_by` instead of `author_id`, and is missing several required fields.

## Solution
Run the migration script to fix the schema without losing any existing data.

---

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard
- Navigate to **SQL Editor** (left sidebar)

### 2. Run the Migration Script
- Open the file `/app/EVENTS_TABLE_MIGRATION_FIX.sql`
- Copy the entire contents
- Paste into the Supabase SQL Editor
- Click **Run** or press `Ctrl+Enter`

### 3. Wait for Completion
The script will:
- ✅ Add missing columns (`author_id`, `is_active`, `category`, `event_time`, etc.)
- ✅ Migrate data from `created_by` to `author_id`
- ✅ Add proper constraints and indexes
- ✅ Update RLS policies
- ✅ Preserve all your existing event data

### 4. Verify the Migration
After running the script, run these verification queries:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (uuid)
- `author_id` (uuid) ✅ NEW/FIXED
- `title` (text)
- `description` (text)
- `location` (text)
- `event_date` (date)
- `event_time` (time) ✅ NEW
- `category` (text) ✅ NEW
- `max_capacity` (integer) ✅ NEW
- `price` (numeric)
- `tags` (text[])
- `image_url` (text)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)
- `is_active` (boolean) ✅ NEW
- `created_by` (uuid) - OLD FIELD (will be removed later)

```sql
-- Check RLS policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'events';
```

Expected policies:
- Anyone can view active future events (SELECT)
- Users can create their own events (INSERT)
- Users can update their own events (UPDATE)
- Users can delete their own events (DELETE)

### 5. Test the Frontend
- Open your app
- Try to view events
- The 400 error should be gone! ✅

### 6. Optional: Remove Old Column
Once you've verified everything works, you can remove the old `created_by` column:

```sql
-- Only run this after confirming everything works!
ALTER TABLE events DROP COLUMN created_by;
```

---

## What Changed?

### Before (Your Current Schema)
```
events table:
  - created_by (wrong field name)
  - Missing: author_id, is_active, category, event_time
```

### After (Fixed Schema)
```
events table:
  - author_id (correctly references profiles)
  - is_active (for filtering active events)
  - category (event type)
  - event_time (time of event)
  + All other required fields
```

---

## Troubleshooting

### If you get "relation profiles does not exist"
This means your profiles table isn't set up. You need to run the main database schema first.

### If you get "column already exists"
This is fine! The script handles this automatically and will skip adding duplicate columns.

### If you get permission errors
Make sure you're using the correct Supabase project and have admin access.

---

## Need Help?
If you encounter any issues:
1. Check the error message in the SQL Editor
2. Take a screenshot of the error
3. Let me know what went wrong and I'll help fix it!
