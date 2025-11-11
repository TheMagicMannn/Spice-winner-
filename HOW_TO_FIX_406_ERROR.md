# How to Fix the 406 Error - Step by Step

## What's Happening?
The 406 error means your database is missing the `status` column. **This is normal for new setups**. You just need to run a quick SQL script once.

## 5-Minute Fix

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Find your project: `cbefwjwqworwfctadogk`
3. Click on it

### Step 2: Open SQL Editor
1. Look at the left sidebar
2. Find the icon that looks like `</>` or says **"SQL Editor"**
3. Click it

### Step 3: Create New Query
1. Click the **"New Query"** button (top right, green button)
2. A blank editor will open

### Step 4: Copy the SQL
Open the file `/app/SIMPLE_FIX.sql` and copy **everything** (Ctrl+A, Ctrl+C)

Or copy this:
```sql
ALTER TABLE event_attendees 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
CHECK (status IN ('pending', 'confirmed', 'denied'));

UPDATE event_attendees SET status = 'confirmed' WHERE status IS NULL;

DROP POLICY IF EXISTS "Users can view all event attendees" ON event_attendees;
CREATE POLICY "Users can view all event attendees"
ON event_attendees FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can add themselves as attendees" ON event_attendees;
CREATE POLICY "Users can add themselves as attendees"
ON event_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Event hosts can update attendee status" ON event_attendees;
CREATE POLICY "Event hosts can update attendee status"
ON event_attendees FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can remove themselves as attendees" ON event_attendees;
CREATE POLICY "Users can remove themselves as attendees"
ON event_attendees FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Event authors can delete attendees" ON event_attendees;
CREATE POLICY "Event authors can delete attendees"
ON event_attendees FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);
```

### Step 5: Paste and Run
1. Paste the SQL into the editor (Ctrl+V)
2. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait 2-5 seconds

### Step 6: Verify Success
You should see: **"Success. No rows returned"** ✅

If you see any errors, copy them and share them.

### Step 7: Refresh Your App
1. Go back to your app
2. Press Ctrl+R (or Cmd+R) to refresh
3. The 406 errors should be gone!
4. You should now see:
   - Attendee lists on event pages
   - Pending requests section (if you're a host)
   - Approve/Deny buttons

## What This Does

### Before:
- ❌ 406 errors in Supabase logs
- ❌ Attendees not showing
- ❌ No approve/deny options
- ❌ Capacity not updating

### After:
- ✅ No more 406 errors
- ✅ Attendees list shows
- ✅ Hosts can approve/deny RSVPs
- ✅ Status indicators for users
- ✅ Accurate capacity tracking

## Troubleshooting

### "relation does not exist" error?
Make sure you have an `event_attendees` table. If not, you need to create it first:
```sql
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

### Still getting 406 errors?
1. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. Clear browser cache
3. Check Supabase logs again - should see different errors or success

### Want to verify it worked?
Run this in SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'event_attendees';
```

You should see a `status` column in the results.

## What Features This Unlocks

1. **RSVP Approval System**
   - Hosts see pending requests
   - Quick approve/deny buttons
   - Users see their status

2. **Smart Capacity**
   - Only confirmed attendees count
   - Pending requests don't block spots
   - Accurate "X spots left" counter

3. **Status Indicators**
   - 🟡 Pending (awaiting approval)
   - 🟢 Confirmed (approved)
   - 🔴 Denied (declined)

4. **Better Host Controls**
   - Review profiles before approving
   - Bulk management of requests
   - Real-time updates

## Still Need Help?

Check these files:
- `/app/SIMPLE_FIX.sql` - The SQL to run
- `/app/EVENT_ATTENDEE_APPROVAL_SCHEMA.sql` - Detailed version
- `/app/QUICK_SETUP_GUIDE.md` - More troubleshooting

Or share the error message you're getting!
