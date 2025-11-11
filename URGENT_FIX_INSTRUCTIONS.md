# 🚨 URGENT: Fix Event Detail Page 400 Errors

## Problem
The event detail pages are getting 400 errors when querying `event_attendees` and `event_comments` tables. This is a **database RLS (Row Level Security) policy issue**, not a code issue.

## Root Cause
The RLS policies on `event_attendees` and `event_comments` tables are either:
1. Missing completely
2. Too restrictive (not allowing SELECT queries)
3. Misconfigured

## Solution: Run SQL Script in Supabase

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `cbefwjwqworwfctadogk`
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Click **"New Query"**
2. Copy the **entire contents** of the file `/app/FIX_EVENT_ATTENDEES_RLS_POLICIES.sql`
3. Paste into the SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)

### Step 3: Verify the Fix
After running the script, you should see:
- ✅ "Success. No rows returned" (this is expected)
- The policies are now created

### Step 4: Test the App
1. Refresh your app at https://spice-winner.vercel.app/
2. Click on any event from:
   - Events page
   - Profile page
   - Community page
3. The event detail page should now load successfully!

## What the SQL Script Does

### For `event_attendees` table:
- ✅ Allows all authenticated users to **view** attendee lists
- ✅ Allows users to **add themselves** as attendees (RSVP)
- ✅ Allows users to **remove themselves** as attendees (Cancel RSVP)
- ✅ Allows event authors to **remove any attendee** (event management)

### For `event_comments` table:
- ✅ Allows all authenticated users to **view** comments
- ✅ Allows users to **add** comments
- ✅ Allows users to **edit/delete** their own comments
- ✅ Allows event authors to **delete any comment** on their events

## Why This Happened
When the events feature was initially created, the RLS policies for these tables were either:
- Not created
- Created with incorrect permissions
- Deleted accidentally

RLS is Supabase's security mechanism that controls who can read/write data. Without proper policies, all queries return 400 errors.

## Alternative: Disable RLS (NOT RECOMMENDED)
If you can't run the SQL script right now, you can temporarily disable RLS:

```sql
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments DISABLE ROW LEVEL SECURITY;
```

⚠️ **WARNING**: This is a security risk! Anyone can access all data. Only use for testing!

## Need Help?
If you encounter any errors when running the SQL:
1. Check if the tables exist: `SELECT * FROM event_attendees LIMIT 1;`
2. Check current policies: `SELECT * FROM pg_policies WHERE tablename IN ('event_attendees', 'event_comments');`
3. Share any error messages

## Files Reference
- SQL Fix: `/app/FIX_EVENT_ATTENDEES_RLS_POLICIES.sql`
- Documentation: `/app/EVENT_NAVIGATION_FIX_COMPLETE.md`
- Auth Fix: `/app/AUTH_FIX_401_EVENTS_PROFILE.md`
