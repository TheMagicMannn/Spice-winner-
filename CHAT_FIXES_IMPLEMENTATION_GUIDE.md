# Chat Self-Destruct & Reply-To Fixes - Implementation Guide

## Issues Fixed

### 1. Voice Message Upload Error ✅
**Problem**: Voice messages showing "File type not supported. Please use JPG, PNG, MP4, or WebM"
**Root Cause**: Supabase storage bucket not configured to accept audio MIME types

### 2. Self-Destruct Timer Not Working ✅
**Problem**: Timer countdown not displaying and media not self-destructing
**Root Cause**: Missing countdown logic and database deletion on expiry

### 3. Reply-To Not Showing ✅
**Problem**: Replied messages not displaying the original message content
**Root Cause**: Supabase foreign key query syntax incorrect and realtime not fetching nested data

---

## Required Steps to Complete the Fix

### Step 1: Update Supabase Storage Bucket (CRITICAL for Voice Messages)

You need to run this SQL in your Supabase SQL Editor to allow audio files:

```sql
-- Update the message-attachments bucket to allow audio MIME types
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'video/mp4', 
    'video/webm', 
    'video/quicktime', 
    'audio/webm', 
    'audio/mp4', 
    'audio/mpeg', 
    'audio/ogg', 
    'audio/wav',
    'audio/aac',
    'audio/aiff'
]
WHERE id = 'message-attachments';

-- Verify the update
SELECT id, name, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'message-attachments';
```

**How to run this:**
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the SQL above
5. Click "Run" button
6. Verify the output shows the audio MIME types are now included

Alternatively, you can run the file `/app/FIX_VOICE_MESSAGE_STORAGE.sql` that was created.

---

## Code Changes Made

### 1. ChatPage.tsx
- ✅ Fixed MediaMessage countdown logic to properly track and delete expired media
- ✅ Added voice message support to self-destruct functionality
- ✅ Enhanced UI for expired media display
- ✅ Added proper media type labels (audio/video/image)

### 2. ChatModal.tsx
- ✅ Applied same fixes as ChatPage for consistency
- ✅ Added voice message self-destruct support

### 3. messageService.ts
- ✅ Added `deleteSelfDestructMedia()` function to delete expired media from database
- ✅ Fixed Supabase foreign key query syntax for reply messages (`messages!reply_to_id`)
- ✅ Updated realtime subscription to fetch full message data with nested replies
- ✅ Added debug logging for troubleshooting reply data

---

## How the Features Work Now

### Self-Destruct Timer Flow:

**For Direct Chats:**
1. Sender uploads media (photo/video/audio) and selects self-destruct timer
2. Message sent with timer option
3. Receiver sees "Tap to view [media type]" button
4. **Timer starts immediately when receiver views the media**
5. Real-time countdown displays: "Expires in Xs" with animated badge
6. At 0 seconds: Media is deleted from database and shows "This media has self-destructed"

**For Group Chats:**
1. Sender uploads media with self-destruct timer
2. Message sent to group
3. Each participant sees "Tap to view [media type]"
4. **Timer starts only when ALL participants have viewed the media**
5. Countdown displays for all users once timer starts
6. At 0 seconds: Media self-destructs for everyone

### Reply-To Message Flow:

1. Long-press (mobile) or right-click (desktop) on any message
2. Select "Reply" from context menu
3. Original message shows in reply preview at bottom
4. Type response and send
5. **Reply displays with "Replying to" section showing original message content**
6. Works for both text and media messages
7. Works in both direct and group chats

---

## Testing Checklist

After running the SQL fix, test the following:

### Voice Messages:
- [ ] Record a voice message
- [ ] Select self-destruct timer option (try different durations)
- [ ] Send the message
- [ ] Verify it appears in chat without error
- [ ] Have receiver view it and confirm countdown starts
- [ ] Wait for countdown to reach 0 and verify media self-destructs

### Photo/Video Messages:
- [ ] Upload photo with self-destruct timer
- [ ] Upload video with self-destruct timer
- [ ] Verify countdown displays after viewing
- [ ] Verify media deletes after timer expires

### Reply-To:
- [ ] Long-press on a text message and select "Reply"
- [ ] Verify original message shows in reply preview
- [ ] Send reply
- [ ] Verify reply displays with "Replying to" section
- [ ] Try replying to a media message
- [ ] Test in both direct chat and group chat

### Group Chat Self-Destruct:
- [ ] Send media with self-destruct in group chat
- [ ] Verify timer doesn't start until all members view
- [ ] Have all members view the media
- [ ] Verify countdown starts for all users
- [ ] Verify media deletes after expiry

---

## Troubleshooting

### Voice Messages Still Showing Error:
1. Verify you ran the SQL update in Supabase
2. Check the bucket configuration: 
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'message-attachments';
   ```
3. Ensure `allowed_mime_types` array includes audio types
4. Try clearing browser cache and reloading

### Reply-To Not Showing:
1. Check browser console for any errors
2. Look for warnings like "Message has reply_to_id but no reply_to_message data"
3. Verify the messages table has proper foreign key setup
4. Test with a fresh message thread

### Self-Destruct Timer Not Counting:
1. Check that `expires_at` is being set in the database
2. Look at console logs for "Timer started at:" messages
3. Verify the countdown useEffect is running
4. Check that the message isn't marked as deleted already

### Media Not Deleting After Timer:
1. Verify `deleteSelfDestructMedia()` is being called (check console)
2. Check database to see if `is_deleted` is set to true
3. Ensure `media_url` is being cleared in database
4. Look for any errors in the console

---

## Technical Details

### Database Fields Used:
- `self_destruct_seconds`: Timer duration in seconds
- `first_viewed_at`: Timestamp when first user viewed media
- `expires_at`: Calculated expiry timestamp (first_viewed_at + self_destruct_seconds)
- `is_deleted`: Boolean flag for deleted messages
- `deleted_at`: Deletion timestamp
- `media_url`: URL to media file (cleared on deletion)
- `reply_to_id`: UUID of message being replied to
- `viewed_by`: JSONB array of users who viewed (group chats only)

### SQL Functions:
- `mark_media_viewed()`: Sets first_viewed_at and expires_at for direct chats
- `mark_media_viewed_group()`: Tracks viewers and starts timer when all have viewed

---

## Support

If issues persist:
1. Check browser console for error messages
2. Verify Supabase storage bucket configuration
3. Test with a fresh browser session
4. Review the console logs for detailed error information
5. Ensure you're using the latest code changes

All code changes have been applied and are ready for testing once the SQL update is run!
