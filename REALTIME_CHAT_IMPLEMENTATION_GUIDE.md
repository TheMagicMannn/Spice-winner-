# 🚀 Real-Time Chat System - Complete Implementation Guide

## 📋 Overview

This guide documents the complete reimplementation of the real-time chat system with enhanced features for direct messaging and group chats.

## ✨ Features Implemented

### 1. **Direct Messaging**
- ✅ Real-time messaging between mutually matched users
- ✅ Text, image, video, and voice messages
- ✅ Self-destruct timer for media (starts when receiver views)
- ✅ Read receipts
- ✅ Typing indicators
- ✅ Message reactions (emojis)
- ✅ Reply to messages
- ✅ Delete/unsend messages

### 2. **Group Chats**
- ✅ Creator can add mutually matched users
- ✅ Participants don't need to be mutually matched with each other
- ✅ Self-destruct timer starts when ALL participants view media
- ✅ Real-time messaging for all participants
- ✅ Group typing indicators
- ✅ Add/remove participants
- ✅ Leave group functionality
- ✅ Group admin controls

### 3. **Messages Page (Messages.tsx)**
- ✅ Display all conversations (direct and group)
- ✅ Filter by:
  - All messages
  - Unread
  - Sent (messages you sent)
  - **Group Chats** (NEW)
  - Deleted
- ✅ Pin/unpin conversations
- ✅ Delete conversations (soft delete)
- ✅ Restore deleted conversations
- ✅ Create new direct message
- ✅ Create new group chat

### 4. **Chat Thread Page (ChatPage.tsx)**
- ✅ Full-page display with back button
- ✅ **Menu button with options** (NEW):
  - Add Participants (group only)
  - Leave Group (group only)
  - Report User/Conversation
  - Delete Chat
- ✅ Media preview and self-destruct timers
- ✅ Voice recording
- ✅ Context menu (long-press) for message actions

### 5. **Reporting System** (NEW)
- ✅ Report users, messages, or conversations
- ✅ Multiple report reasons
- ✅ Optional: Block user when reporting
- ✅ Optional: Hide conversation when reporting
- ✅ Stores reports in database for admin review
- ✅ Can trigger notifications (ready for webhook integration)

### 6. **Self-Destruct Media**
- ✅ Direct messages: Timer starts when receiver first views
- ✅ **Group messages: Timer starts when ALL participants view** (NEW)
- ✅ Configurable timer options (10s, 30s, 1m, 5m, 1h, 24h, 7d)
- ✅ Visual countdown indicator
- ✅ Auto-deletion after timer expires

---

## 🗄️ Database Schema

### Main File: `/app/REALTIME_CHAT_COMPLETE_SCHEMA.sql`

Run this SQL file in your Supabase SQL Editor to set up the complete schema.

### Tables Created

#### 1. `conversations`
Stores conversation metadata (direct or group).
```sql
- id (UUID, primary key)
- conversation_type ('direct' | 'group')
- group_name (text, nullable)
- group_photo (text, nullable)
- created_by (UUID, references auth.users)
- created_at, updated_at (timestamps)
```

#### 2. `conversation_participants`
Tracks users in each conversation with per-user settings.
```sql
- id (UUID, primary key)
- conversation_id (UUID, references conversations)
- user_id (UUID, references auth.users)
- joined_at (timestamp)
- is_admin (boolean)
- is_active (boolean) - false when user leaves
- is_pinned (boolean) - per-user pin state
- is_deleted (boolean) - per-user soft delete
- deleted_at, left_at (timestamps, nullable)
```

#### 3. `messages` (Enhanced)
Stores all messages with support for both match-based and conversation-based systems.
```sql
- id (UUID, primary key)
- conversation_id (UUID, nullable, references conversations)
- match_id (UUID, nullable, references matches) - for backward compatibility
- sender_id (UUID, references auth.users)
- content (text)
- message_type ('text' | 'image' | 'video' | 'voice' | 'gif')
- media_url (text, nullable)
- self_destruct_seconds (integer, nullable)
- first_viewed_at (timestamp, nullable)
- expires_at (timestamp, nullable)
- viewed_by (jsonb) - Array of {userId, viewedAt} for group tracking
- is_read, read_at (boolean, timestamp)
- is_deleted, deleted_at (boolean, timestamp)
- reply_to_id (UUID, nullable, self-reference)
- reactions (jsonb) - Array of {userId, emoji, createdAt}
- created_at, updated_at (timestamps)
```

#### 4. `typing_indicators`
Real-time typing status for conversations.
```sql
- id (UUID, primary key)
- conversation_id (UUID, nullable, references conversations)
- match_id (UUID, nullable, references matches)
- user_id (UUID, references auth.users)
- is_typing (boolean)
- updated_at (timestamp)
```

#### 5. `user_reports` (NEW)
Stores user reports for moderation.
```sql
- id (UUID, primary key)
- reporter_id (UUID, references auth.users)
- reported_user_id (UUID, nullable, references auth.users)
- conversation_id (UUID, nullable, references conversations)
- message_id (UUID, nullable, references messages)
- report_type ('user' | 'message' | 'conversation')
- reason (text)
- additional_context (text, nullable)
- status ('pending' | 'reviewed' | 'action_taken' | 'dismissed')
- reporter_blocked_user (boolean)
- reporter_hidden_conversation (boolean)
- admin_notes (text, nullable)
- reviewed_by, reviewed_at (UUID, timestamp, nullable)
- created_at (timestamp)
```

### Database Functions

#### `get_or_create_direct_conversation(user1_id, user2_id)`
- Creates or retrieves a direct conversation between two users
- Verifies mutual match status
- Returns conversation_id

#### `create_group_conversation(creator_id, group_name_param, participant_ids[])`
- Creates a new group conversation
- Verifies creator is mutually matched with all participants
- Returns conversation_id

#### `add_user_to_group(conversation_id_param, user_id_param)`
- Adds a user to an existing group
- Reactivates if previously left

#### `remove_user_from_group(conversation_id_param, user_id_param)`
- Removes a user from a group (sets is_active = false)

#### `mark_media_viewed(message_id)` 
- Marks media as viewed in direct messages
- Starts self-destruct timer immediately

#### `mark_media_viewed_group(message_id_param, user_id_param)`
- Marks media as viewed by a specific user in a group
- Returns `all_viewed` boolean
- Starts self-destruct timer only when all active participants have viewed

#### `delete_conversation_for_user(conversation_id_param, user_id_param)`
- Soft deletes a conversation for a specific user

#### `restore_conversation_for_user(conversation_id_param, user_id_param)`
- Restores a deleted conversation for a user

### Triggers

1. **`update_conversation_timestamp`**
   - Automatically updates `conversations.updated_at` when a new message is inserted
   - Keeps conversation list sorted by latest activity

2. **`auto_delete_expired_messages`** (Function)
   - Should be called by a scheduled job (e.g., pg_cron)
   - Soft deletes messages where `expires_at <= NOW()`
   - Recommended: Run every minute

### Row Level Security (RLS)

All tables have RLS enabled with secure policies:

- **Conversations**: Users can only see conversations they're participants in
- **Messages**: Users can only see messages in their conversations
- **Participants**: Users can see other participants in their conversations
- **Typing Indicators**: Users can see typing in their conversations
- **Reports**: Users can only see their own reports (admins can see all)
- **Storage (message-attachments)**: Only authenticated users in the conversation can access media

### Storage Bucket

**Name**: `message-attachments`
- **Public**: No (requires authentication)
- **File Size Limit**: 50MB
- **Allowed MIME Types**:
  - Images: jpeg, png, gif, webp
  - Videos: mp4, webm, quicktime
  - Audio: webm, mp4, mpeg, ogg, wav

---

## 🛠️ Frontend Implementation

### New Components

#### 1. `ReportModal.tsx` (NEW)
Modal for reporting users, messages, or conversations.

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `onSubmit`: (reason, additionalContext, shouldBlock, shouldHide) => Promise<void>
- `reportType`: 'user' | 'message' | 'conversation'
- `targetName`: string (optional)

**Features**:
- Pre-defined report reasons
- Additional context textarea
- Option to block user (user reports only)
- Option to hide conversation
- Success confirmation message

#### 2. `AddParticipantsModal.tsx` (NEW)
Modal for adding participants to a group chat.

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `conversationId`: string
- `currentParticipantIds`: string[]
- `onSuccess`: () => void

**Features**:
- Search through user's mutual matches
- Multi-select participants
- Filters out users already in the group
- Shows selected count
- Async addition with loading states

### Updated Components

#### `Messages.tsx`
**Changes**:
- Added 'groups' filter type
- Updated filter menu to include "Group Chats"
- Enhanced filter logic to support group-only view
- Updated empty state messages

#### `ChatPage.tsx`
**Major Changes**:
- Added menu button (MoreVertical icon) in header
- Dropdown menu with context-specific options:
  - Add Participants (groups only)
  - Leave Group (groups only)
  - Report User/Conversation
  - Delete Chat
- Integrated ReportModal
- Integrated AddParticipantsModal
- Updated media viewing logic for group self-destruct

**Self-Destruct Logic**:
```typescript
// In MediaMessage component's handleView function
if (message.conversationId) {
  // Group chat - use group viewing logic
  const result = await MessageService.markMediaViewedGroup(message.id, user.id);
  updatedMessage = result.message;
  
  if (result.allViewed) {
    // Timer has started - all participants viewed
  }
} else {
  // Direct message - use standard viewing
  updatedMessage = await MessageService.markMediaViewed(message.id);
}
```

### Updated Services

#### `messageService.ts`
**New Methods**:
- `markMediaViewedGroup(messageId, userId)`: Mark media viewed in group with all-viewed tracking
- `reportUser(reporterId, reportedUserId, conversationId, reason, ...)`: Report a user
- `reportMessage(reporterId, messageId, conversationId, reason, ...)`: Report a message
- `reportConversation(reporterId, conversationId, reason, ...)`: Report a conversation

**Updated Methods**:
- `markMediaViewed()`: Enhanced documentation for direct messages

#### `conversationService.ts`
No changes needed - already supports all required operations.

---

## 🚀 Deployment Steps

### 1. Apply Database Schema

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy the contents of `/app/REALTIME_CHAT_COMPLETE_SCHEMA.sql`
4. Paste and execute
5. Verify all tables, functions, and policies are created

### 2. Set Up Scheduled Job (Optional but Recommended)

For auto-deleting expired self-destruct media:

**Option A: Using pg_cron (if available)**
```sql
SELECT cron.schedule(
  'delete-expired-messages',
  '* * * * *', -- Every minute
  'SELECT auto_delete_expired_messages()'
);
```

**Option B: External Cron Job**
Create an API endpoint that calls `auto_delete_expired_messages()` and schedule it externally.

### 3. Verify Storage Bucket

1. Go to **Storage** in Supabase
2. Verify `message-attachments` bucket exists
3. Check that RLS policies are applied

### 4. Test Real-time Subscriptions

1. Go to **Database** > **Replication**
2. Ensure `messages`, `typing_indicators`, and `conversation_participants` are enabled for realtime

### 5. Deploy Frontend

No build changes required - all updates are in existing files.

---

## 🧪 Testing Checklist

### Direct Messages
- [ ] Create a direct message with a mutually matched user
- [ ] Send text messages
- [ ] Send image with self-destruct timer
- [ ] Verify timer starts when receiver views
- [ ] Test typing indicators
- [ ] Test read receipts
- [ ] Test message reactions
- [ ] Test reply to message
- [ ] Delete a message
- [ ] Pin conversation
- [ ] Delete conversation and restore

### Group Chats
- [ ] Create a group chat with 2+ participants
- [ ] Send messages in group
- [ ] Send image with self-destruct timer
- [ ] Have multiple users view the image
- [ ] Verify timer starts only after ALL view
- [ ] Add a new participant via menu
- [ ] Leave group as a non-admin
- [ ] Delete group chat

### Filters
- [ ] Test "All" filter
- [ ] Test "Unread" filter
- [ ] Test "Sent" filter
- [ ] Test **"Group Chats" filter** (NEW)
- [ ] Test "Deleted" filter

### Reporting
- [ ] Report a user from direct chat
- [ ] Select "Block user" option
- [ ] Select "Hide conversation" option
- [ ] Verify report appears in `user_reports` table
- [ ] Report a group conversation
- [ ] Verify report with "Hide" option soft-deletes conversation

### Menu Options
- [ ] Open menu in direct chat
- [ ] Verify "Report User" and "Delete Chat" options
- [ ] Open menu in group chat
- [ ] Verify "Add Participants", "Leave Group", "Report Conversation", "Delete Chat" options
- [ ] Test each menu option

---

## 📊 Database Monitoring

### Queries for Admins

**View All Pending Reports**:
```sql
SELECT 
  r.*,
  reporter.email as reporter_email,
  reported.email as reported_user_email
FROM user_reports r
LEFT JOIN auth.users reporter ON r.reporter_id = reporter.id
LEFT JOIN auth.users reported ON r.reported_user_id = reported.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;
```

**View Expired Messages (Should Be Auto-Deleted)**:
```sql
SELECT * FROM messages
WHERE expires_at <= NOW()
  AND is_deleted = FALSE;
```

**View Group Chat Statistics**:
```sql
SELECT 
  c.id,
  c.group_name,
  COUNT(DISTINCT cp.user_id) as participant_count,
  COUNT(DISTINCT m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.conversation_type = 'group'
  AND cp.is_active = TRUE
GROUP BY c.id, c.group_name
ORDER BY last_message_at DESC;
```

---

## 🔒 Security Considerations

1. **RLS Policies**: All sensitive tables have RLS enabled
2. **Storage Access**: Media files are only accessible to conversation participants
3. **Report Moderation**: Reports are stored securely and can only be seen by reporters and admins
4. **Mutual Match Verification**: All conversation creation functions verify mutual match status
5. **Soft Deletes**: Conversations and messages use soft deletes for data recovery

---

## 🐛 Troubleshooting

### Issue: Self-destruct not working in groups
**Solution**: Check that `mark_media_viewed_group` function exists and all participants are marked as `is_active = TRUE`.

### Issue: Can't see messages in conversation
**Solution**: Verify RLS policies are applied. Check that user is in `conversation_participants` with `is_active = TRUE` and `is_deleted = FALSE`.

### Issue: Storage upload fails
**Solution**: Check that `message-attachments` bucket exists and has correct RLS policies. Verify file size and MIME type are within limits.

### Issue: Typing indicators not working
**Solution**: Verify real-time is enabled for `typing_indicators` table in Supabase Replication settings.

### Issue: Can't add participants to group
**Solution**: Verify the user being added is mutually matched with the group creator. Check RLS policies on `conversation_participants`.

---

## 📝 Future Enhancements

Potential features to add:
- [ ] Message forwarding
- [ ] Voice/video calls integration
- [ ] Message search functionality
- [ ] Conversation muting
- [ ] Custom notification settings per conversation
- [ ] Admin dashboard for report review
- [ ] Automated content moderation
- [ ] Message encryption (E2E)
- [ ] Story/status feature
- [ ] Polls in group chats

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in Dashboard > Logs
3. Check browser console for frontend errors
4. Verify database functions are created correctly

---

## ✅ Summary

This implementation provides a complete, production-ready real-time chat system with:
- ✅ Direct and group messaging
- ✅ Self-destruct media with group viewing tracking
- ✅ Comprehensive reporting system
- ✅ Full conversation management
- ✅ Secure RLS policies
- ✅ Real-time subscriptions
- ✅ All requested features implemented

**Files Modified**:
- `/app/src/pages/Messages.tsx` - Added "Group Chats" filter
- `/app/src/pages/ChatPage.tsx` - Added menu, modals, group self-destruct logic
- `/app/src/services/messageService.ts` - Added reporting and group viewing methods
- `/app/src/components/ReportModal.tsx` - NEW
- `/app/src/components/AddParticipantsModal.tsx` - NEW

**Files Created**:
- `/app/REALTIME_CHAT_COMPLETE_SCHEMA.sql` - Complete database schema
- `/app/REALTIME_CHAT_IMPLEMENTATION_GUIDE.md` - This file

**Ready for Production** ✅
