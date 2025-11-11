# Quick Setup Guide - RSVP Approval System

## Why Approve/Deny Not Showing?

The approve/deny buttons require:
1. ✅ Code is ready (already done)
2. ❌ Database has `status` column in `event_attendees` table
3. ❌ RLS policies allow reading attendees

## 3-Step Fix

### Step 1: Run SQL Migration (2 minutes)

1. Open https://supabase.com/dashboard
2. Select your project: `cbefwjwqworwfctadogk`
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy ENTIRE contents from `/app/EVENT_ATTENDEE_APPROVAL_SCHEMA.sql`
6. Click **Run** (or Cmd/Ctrl + Enter)

**Expected Result**: "Success. No rows returned"

### Step 2: Verify Schema

Run this in SQL Editor to check:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'event_attendees' 
AND column_name = 'status';
```

**Expected Result**: Should show the `status` column

### Step 3: Test the Feature

1. Open your app
2. Have another user (or create test account) RSVP to your event
3. Refresh the event detail page
4. You should see **"Pending Requests"** section (yellow)
5. Click **✓ Approve** or **✗ Deny**

## Testing Without Another User

If you don't have test users, you can manually insert test data:

```sql
-- Find your event ID
SELECT id, title FROM events WHERE author_id = auth.uid() LIMIT 5;

-- Insert yourself as a pending attendee (for testing UI only)
INSERT INTO event_attendees (event_id, user_id, status)
VALUES ('YOUR_EVENT_ID', auth.uid(), 'pending')
ON CONFLICT DO NOTHING;

-- Check it worked
SELECT * FROM event_attendees WHERE event_id = 'YOUR_EVENT_ID';
```

Replace `YOUR_EVENT_ID` with actual ID from first query.

## Troubleshooting

### "No pending requests" showing?

**Check 1**: Do you have RSVPs?
```sql
SELECT COUNT(*) as total_rsvps 
FROM event_attendees 
WHERE event_id = 'YOUR_EVENT_ID';
```

**Check 2**: What's their status?
```sql
SELECT status, COUNT(*) 
FROM event_attendees 
WHERE event_id = 'YOUR_EVENT_ID' 
GROUP BY status;
```

**Check 3**: Are you the event host?
```sql
SELECT author_id, title 
FROM events 
WHERE id = 'YOUR_EVENT_ID';
```

### Still not working?

1. Check browser console (F12) for errors
2. Look for: "Could not fetch attendees (likely RLS policy issue)"
3. If you see this, the RLS policies need to be added

**Quick Fix SQL**:
```sql
-- Enable reading attendees
DROP POLICY IF EXISTS "Users can view all event attendees" ON event_attendees;
CREATE POLICY "Users can view all event attendees"
ON event_attendees FOR SELECT TO authenticated USING (true);

-- Enable host updates
DROP POLICY IF EXISTS "Event hosts can update attendee status" ON event_attendees;
CREATE POLICY "Event hosts can update attendee status"
ON event_attendees FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_attendees.event_id
    AND events.author_id = auth.uid()
  )
);
```

## What Success Looks Like

### For Event Host:
```
┌─────────────────────────────────────┐
│ 🟡 Pending Requests (2)             │
├─────────────────────────────────────┤
│ 👤 John Doe     [✓ Approve] [✗ Deny]│
│ 👤 Jane Smith   [✓ Approve] [✗ Deny]│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Confirmed Attendees (5)             │
├─────────────────────────────────────┤
│ 👤 Alice Cooper                     │
│ 👤 Bob Marley                       │
└─────────────────────────────────────┘
```

### For Event Attendee:
```
After RSVP:
🟡 ⏳ Awaiting host approval

After Approval:
🟢 ✓ Your RSVP is confirmed

After Denial:
🔴 ✗ Your RSVP was declined
```

## Files Reference

- Full SQL: `/app/EVENT_ATTENDEE_APPROVAL_SCHEMA.sql`
- Test Data: `/app/TEST_ATTENDEES_INSERT.sql`
- Documentation: `/app/RSVP_APPROVAL_SYSTEM_GUIDE.md`

## Need Help?

1. Check if schema has `status` column
2. Check if RLS policies exist
3. Check browser console for errors
4. Verify you're logged in as event host
