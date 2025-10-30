# Real-Time Chat Implementation Guide

## Overview
This document explains the real-time chat functionality implemented for the SPICE dating app, including text messaging, media sharing (photos/videos/voice), self-destruct timers, typing indicators, and read receipts.

## Database Schema Updates

### 1. Messages Table Enhancements
**File:** `/app/MESSAGES_SCHEMA_UPDATE.sql`

The messages table has been updated to support:
- **Media types**: text, image, video, voice, gif
- **Media URLs**: Storage URLs for attachments
- **Self-destruct feature**:
  - `self_destruct_seconds`: Timer duration in seconds
  - `first_viewed_at`: When recipient first viewed the media
  - `expires_at`: Calculated expiration timestamp
  - `is_deleted`: Soft delete flag for expired media

### 2. Typing Indicators Table
New table to track real-time typing status:
```sql
CREATE TABLE typing_indicators (
    id UUID PRIMARY KEY,
    match_id UUID REFERENCES matches(id),
    user_id UUID REFERENCES auth.users(id),
    is_typing BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 3. Database Functions
- `mark_media_viewed(message_id)`: Sets first_viewed_at and calculates expires_at
- `delete_expired_media()`: Soft deletes messages past their expiration time

## Services

### MessageService (`/app/src/services/messageService.ts`)

#### Key Methods:

**Conversations**
- `getConversations(userId)`: Fetch all matched conversations with unread counts and last messages
- `getOtherUserFromMatch(matchId, currentUserId)`: Get the other user's profile from a match

**Messaging**
- `getMessages(matchId, limit)`: Load message history for a conversation
- `sendMessage(matchId, senderId, content)`: Send text message
- `sendMediaMessage(matchId, senderId, file, type, selfDestructSeconds)`: Upload and send media
- `uploadMedia(userId, matchId, file, type)`: Upload file to Supabase Storage

**Status Updates**
- `markAsRead(messageId)`: Mark single message as read
- `markConversationAsRead(matchId, userId)`: Mark all messages in conversation as read
- `markMediaViewed(messageId)`: Start self-destruct timer when media is viewed

**Real-Time Features**
- `subscribeToMessages(matchId, onMessage)`: Subscribe to real-time message updates
- `setTyping(matchId, userId, isTyping)`: Update typing status
- `subscribeToTyping(matchId, currentUserId, onTypingChange)`: Subscribe to typing indicators

## Components

### 1. ChatModal (`/app/src/components/ChatModal.tsx`)

Full-featured chat interface with:

**Features:**
- Real-time message updates via Supabase subscriptions
- Typing indicators (3-second timeout)
- Read receipts (checkmark icons)
- Message input with Enter key support
- Media attachments (photo, video, voice)
- Self-destruct timer selection
- Profile picture click → opens user profile modal

**Self-Destruct Options:**
- 10 seconds
- 30 seconds
- 1 minute
- 5 minutes
- 1 hour
- 24 hours
- 7 days
- No timer (default)

**Media Upload:**
- Photos: Click image icon, select file, choose timer, send
- Videos: Click video icon, select file, choose timer, send
- Voice: Click/hold mic icon to record, auto-sends on release

**Voice Recording:**
Uses browser's MediaRecorder API to capture audio as WebM format.

### 2. Messages Page (`/app/src/pages/Messages.tsx`)

**Updates:**
- Removed mock data
- Loads real conversations from Supabase
- Shows unread message counts with badges
- Online status indicators (green dot if active in last 15 min)
- Click conversation → opens ChatModal
- Real-time conversation list updates

### 3. MediaMessage Component (within ChatModal)

Handles self-destructing media display:
- Shows "Tap to view" button for unviewed media with timer info
- On tap: marks as viewed, starts countdown, displays media
- Shows remaining time overlay while viewing
- Auto-hides when expired (soft-deleted from database)

## Storage Buckets

### message-attachments
**Privacy:** Private (not publicly accessible)
**Usage:** Photos, videos, and voice notes shared in conversations
**Policies:**
- Users can upload to their own folder
- Users can view attachments in their matched conversations

## How It Works

### Sending a Text Message

```typescript
// User types message and hits send
await MessageService.sendMessage(matchId, userId, messageText);

// Real-time subscription notifies recipient
messageChannel.on('INSERT', (payload) => {
  handleNewMessage(payload.new);
});
```

### Sending Media with Self-Destruct

```typescript
// 1. User selects photo and sets 10-second timer
const file = selectedPhoto;
const selfDestructSeconds = 10;

// 2. Upload to storage and create message
await MessageService.sendMediaMessage(
  matchId,
  userId,
  file,
  'image',
  selfDestructSeconds
);

// 3. Recipient receives message (unviewed)
// 4. Recipient taps "View Media"
await MessageService.markMediaViewed(messageId);
// Sets first_viewed_at = NOW()
// Sets expires_at = NOW() + 10 seconds

// 5. After 10 seconds, message.is_deleted = TRUE
// (via scheduled job or manual cleanup)
```

### Typing Indicators

```typescript
// User starts typing
handleInputChange() {
  MessageService.setTyping(matchId, userId, true);
  
  // Auto-stop after 3 seconds
  setTimeout(() => {
    MessageService.setTyping(matchId, userId, false);
  }, 3000);
}

// Other user sees "typing..." indicator
typingChannel.on('UPDATE', (payload) => {
  if (payload.new.user_id !== currentUserId) {
    setIsTyping(payload.new.is_typing);
  }
});
```

### Read Receipts

```typescript
// When recipient opens chat or receives message
await MessageService.markConversationAsRead(matchId, userId);

// Sender sees double checkmark (✓✓) instead of single (✓)
{message.isRead ? <CheckCheck /> : <Check />}
```

## Integration Steps

### Step 1: Run Database Migration
```sql
-- Execute MESSAGES_SCHEMA_UPDATE.sql in Supabase SQL editor
```

### Step 2: Install Dependencies
```bash
yarn add date-fns
```

### Step 3: Set Up Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Verify `message-attachments` bucket exists
3. If not, create it with private access

### Step 4: Testing

**Test Text Messaging:**
1. Create two test accounts
2. Match them together
3. Open Messages page as User A
4. Click conversation with User B
5. Send a text message
6. Open as User B → should see message instantly

**Test Media with Self-Destruct:**
1. In chat, click image icon
2. Select photo, choose "10 seconds"
3. Send media
4. As recipient, see "Tap to view" button
5. Tap → photo displays with 10s countdown
6. After 10s → "This media has expired" message

**Test Voice Messages:**
1. Click mic icon
2. Grant microphone permission
3. Speak (mic button turns red while recording)
4. Release mic button → auto-sends
5. Recipient sees audio player

**Test Typing Indicators:**
1. User A starts typing
2. User B should see "typing..." under name
3. Indicator disappears after 3 seconds of inactivity

**Test Read Receipts:**
1. User A sends message (single checkmark)
2. User B opens chat
3. User A's message shows double checkmark

## Security Considerations

1. **RLS Policies:** Already implemented in schema
   - Users can only send/view messages in their matched conversations
   - Users can only upload media to their own folders
   - Users can only view media in conversations they're part of

2. **Media Access:** Private storage bucket prevents direct URL access
   - Only matched users can retrieve media URLs

3. **Self-Destruct:** Soft delete approach
   - Media files remain in storage (for backup/legal purposes)
   - `is_deleted` flag prevents display
   - Implement periodic cleanup job to remove files if needed

## Future Enhancements

1. **GIF Support:** Integrate Giphy API for GIF search and send
2. **Message Editing:** Allow users to edit sent text messages
3. **Message Reactions:** Add emoji reactions to messages
4. **Voice Calls:** Implement WebRTC for voice/video calls
5. **Message Search:** Full-text search across conversations
6. **Push Notifications:** Send notifications for new messages
7. **File Attachments:** Support PDFs, documents, etc.
8. **Group Chats:** Support for group conversations
9. **Message Forwarding:** Forward messages between conversations
10. **Scheduled Cleanup:** Cron job to delete expired media files

## Troubleshooting

### Messages not appearing in real-time
- Check Supabase real-time is enabled for messages table
- Verify RLS policies allow reading from the table
- Check browser console for subscription errors

### Media upload fails
- Verify storage bucket exists and has correct policies
- Check file size limits (adjust in storage bucket settings)
- Ensure user has permissions to upload

### Typing indicators not working
- Check typing_indicators table has correct RLS policies
- Verify real-time subscriptions are enabled for the table
- Check browser console for errors

### Self-destruct timer not working
- Verify database function `mark_media_viewed` exists
- Check that RPC call is succeeding
- Ensure expires_at is being calculated correctly

## API Reference

See `/app/src/services/messageService.ts` for full API documentation with TypeScript types.

## Support

For issues or questions, refer to:
- Supabase Real-time Docs: https://supabase.com/docs/guides/realtime
- Supabase Storage Docs: https://supabase.com/docs/guides/storage
