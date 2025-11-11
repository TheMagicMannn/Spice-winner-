# Event RSVP Approval System - Complete Guide

## Overview
Implemented a comprehensive RSVP approval system where event hosts can review and approve/deny attendance requests before users become confirmed attendees.

## Features Implemented

### 1. **Three-State Attendee Status**
- **Pending**: User has requested to attend, awaiting host approval
- **Confirmed**: Host has approved the user's RSVP
- **Denied**: Host has declined the user's RSVP

### 2. **Smart Capacity Management**
- Spots calculation only counts **confirmed** attendees
- Pending requests don't consume spots
- Accurate "spots left" counter on event pages

### 3. **Host Dashboard**
- Separate section showing pending RSVP requests
- Quick approve/deny buttons for each request
- Real-time counter showing pending requests
- View user profiles before approving

### 4. **User Experience**
- Clear status indicators after RSVP
  - "✓ Your RSVP is confirmed" (green)
  - "⏳ Awaiting host approval" (yellow)
  - "✗ Your RSVP was declined" (red)
- Can cancel RSVP at any time
- Pending/confirmed users can still cancel

### 5. **Attendee Lists**
- **Pending Requests** (host only, yellow highlight)
- **Confirmed Attendees** (visible to all)
- Each section shows accurate counts

## Database Changes Required

**IMPORTANT**: Run this SQL in your Supabase dashboard:

```sql
-- Add status column
ALTER TABLE event_attendees 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
CHECK (status IN ('pending', 'confirmed', 'denied'));

-- Update existing records
UPDATE event_attendees SET status = 'confirmed' WHERE status IS NULL;

-- Enable RLS policies (see /app/EVENT_ATTENDEE_APPROVAL_SCHEMA.sql for full script)
```

**File**: `/app/EVENT_ATTENDEE_APPROVAL_SCHEMA.sql`

## Code Changes

### Files Modified:
1. **eventService.ts**
   - Added `status` field to `EventAttendee` interface
   - Added `getAttendeeStatus()` method
   - Added `approveAttendee()` method
   - Added `denyAttendee()` method
   - Updated `hasUserAttendedEvent()` to check status

2. **EventDetailPage.tsx**
   - Added pending requests section (host only)
   - Added approve/deny handlers
   - Updated spots calculation
   - Added status indicators for users
   - Separated confirmed and pending attendees
   - Added real-time approval processing

## User Flows

### As an Event Host:
1. Create an event
2. Users RSVP → appear in "Pending Requests" (yellow section)
3. Review each pending request:
   - Click user name to view their profile
   - Click "✓ Approve" to confirm them
   - Click "✗ Deny" to decline them
4. Approved users move to "Confirmed Attendees"
5. Counter shows: "X confirmed (Y pending)"
6. Spots left only counts confirmed attendees

### As an Event Attendee:
1. Browse events, click RSVP
2. See status: "⏳ Awaiting host approval" (yellow box)
3. Wait for host decision
4. If approved: See "✓ Your RSVP is confirmed" (green box)
5. If denied: See "✗ Your RSVP was declined" (red box)
6. Can cancel RSVP anytime (even if pending)

## API Methods

### New Service Methods:

```typescript
// Check user's attendee status
await eventService.getAttendeeStatus(eventId, userId);
// Returns: 'pending' | 'confirmed' | 'denied' | null

// Approve an attendee (host only)
await eventService.approveAttendee(eventId, attendeeId, hostId);

// Deny an attendee (host only)
await eventService.denyAttendee(eventId, attendeeId, hostId);
```

## UI Components

### Pending Requests Section (Host Only):
```tsx
<Card className="border-yellow-500/30">
  <h3>Pending Requests (3)</h3>
  {pendingAttendees.map(attendee => (
    <div>
      <Avatar />
      <Button onClick={approve}>✓ Approve</Button>
      <Button onClick={deny}>✗ Deny</Button>
    </div>
  ))}
</Card>
```

### Status Indicator (User):
```tsx
{attendeeStatus === 'pending' && (
  <div className="bg-yellow-500/10 text-yellow-400">
    ⏳ Awaiting host approval
  </div>
)}
```

## Security

- ✅ Only event hosts can approve/deny attendees
- ✅ Verification checks in `approveAttendee()` and `denyAttendee()`
- ✅ RLS policies enforce host-only updates
- ✅ Users can only RSVP for themselves
- ✅ Users can only cancel their own RSVPs

## Testing Checklist

### As Host:
- [ ] Create event
- [ ] See pending requests when users RSVP
- [ ] Approve a request → user moves to confirmed
- [ ] Deny a request → user removed from list
- [ ] Pending counter updates correctly
- [ ] Spots left calculation is accurate

### As User:
- [ ] RSVP to event
- [ ] See "Awaiting approval" status
- [ ] Get approved → see "Confirmed" status
- [ ] Get denied → see "Declined" status
- [ ] Cancel RSVP works in all states
- [ ] Event full shows when spots = 0 (confirmed only)

## Migration Notes

**Existing RSVPs**: The SQL script sets all existing event_attendees to `status = 'confirmed'` for backward compatibility. No data loss.

**Default Behavior**: New RSVPs default to `status = 'pending'`

## Troubleshooting

### Attendees not showing?
- Run the SQL script in Supabase to add the `status` column
- Check RLS policies are enabled (see SQL file)

### Can't approve/deny?
- Verify you're the event host
- Check browser console for errors
- Ensure RLS UPDATE policy exists

### Spots calculation wrong?
- Should only count `status = 'confirmed'`
- Check `confirmedAttendeesCount` in code

## Future Enhancements

1. **Notifications**: Email/push when RSVP is approved/denied
2. **Bulk Actions**: Approve/deny multiple at once
3. **Auto-approve**: Toggle for hosts who don't want approval flow
4. **Waitlist**: When event is full, create waitlist
5. **RSVP Notes**: Let users add a message with their RSVP

## Files Reference

- Schema: `/app/EVENT_ATTENDEE_APPROVAL_SCHEMA.sql`
- Service: `/app/src/services/eventService.ts`
- UI: `/app/src/pages/EventDetailPage.tsx`
- Types: `EventAttendee` interface with `status` field

## Date: January 2025
## Status: ✅ IMPLEMENTED - Requires SQL Migration
