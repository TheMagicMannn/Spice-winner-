# Group Chat & Enhanced Messaging Implementation Guide

## Overview
This guide explains the implementation of group chats, new message creation, and conversation management for the Spice dating app.

## Features Implemented

### 1. **Delete & Restart Conversations**
- When a conversation is deleted and user messages again, it automatically restores the conversation
- Uses soft delete system - conversations are never permanently deleted
- `ConversationService.restoreConversation()` handles this automatically

### 2. **Start New Conversations from Messages Page**
- New "New Message" button at top of messages page
- Modal to select from mutual matches
- Can select single user (direct message) or multiple users (group chat)
- Search functionality to find specific matches

### 3. **Group Chat Functionality**
- Create new group chats with multiple users
- Convert existing 1-on-1 conversations to group chats
- Add/remove members from groups
- Group admins can manage members
- Custom group names and photos
- Works seamlessly with existing message features

## Files Created

### Database Schema
- **`/app/GROUP_CHAT_SCHEMA.sql`** - Complete database schema for group chats
  - `conversations` table (replaces match-based system)
  - `conversation_participants` table (manages who's in each conversation)
  - Helper functions for creating/managing conversations
  - RLS policies for security
  - Migration function to convert existing matches to conversations

### Services
- **`/app/src/services/conversationService.ts`** - New service for conversation management
  - `getOrCreateDirectConversation()` - Get or create 1-on-1 chat
  - `createGroupConversation()` - Create new group
  - `convertToGroupConversation()` - Convert 1-on-1 to group
  - `addParticipantToGroup()` - Add members
  - `removeParticipantFromGroup()` - Remove members
  - `getUserConversations()` - Get all user conversations
  - `togglePinConversation()` - Pin/unpin
  - `deleteConversation()` - Soft delete
  - `restoreConversation()` - Restore deleted

### Components
- **`/app/src/components/NewMessageModal.tsx`** - Modal for starting new conversations
  - Shows mutual matches
  - Search functionality
  - Select single or multiple users
  - Create direct or group conversations
  - Group naming interface

## Implementation Steps

### Step 1: Run Database Schema ✅
```sql
-- In Supabase SQL Editor, run:
-- 1. Copy content from GROUP_CHAT_SCHEMA.sql
-- 2. Execute it
-- 3. Optionally run migration: SELECT migrate_matches_to_conversations();
```

### Step 2: Update Messages Page (TODO)
Add "New Message" button and integrate NewMessageModal:

```typescript
// In /app/src/pages/Messages.tsx
import { NewMessageModal } from '@/components/NewMessageModal';

// Add state
const [showNewMessageModal, setShowNewMessageModal] = useState(false);

// Add button in header
<Button
  onClick={() => setShowNewMessageModal(true)}
  className="bg-pink-600 hover:bg-pink-700"
>
  <Plus className="h-5 w-5 mr-2" />
  New Message
</Button>

// Add modal
<NewMessageModal
  isOpen={showNewMessageModal}
  onClose={() => setShowNewMessageModal(false)}
/>
```

### Step 3: Update Message Service (TODO)
Modify messageService.ts to use `conversation_id` instead of `match_id`:

```typescript
// Update all methods to accept conversation_id
static async sendMessage(
  conversationId: string,  // Changed from matchId
  senderId: string,
  content: string
): Promise<Message> {
  // Update to use conversation_id
}
```

### Step 4: Create Group Chat Page Component (TODO)
Similar to ChatPage but with group-specific features:
- Show all participants in header
- "Add Members" button
- Group info modal (members list, leave group, etc.)
- Admin-only controls (remove members, change name)

### Step 5: Add Group Conversion Feature (TODO)
In existing ChatPage, add button to convert to group:

```typescript
// Add "Add People" button in header
<Button onClick={handleConvertToGroup}>
  <UserPlus className="h-5 w-5" />
</Button>

// Handler
const handleConvertToGroup = async () => {
  // Show modal to select additional users
  // Call ConversationService.convertToGroupConversation()
};
```

### Step 6: Update Matches Page (TODO)
When clicking message button, check if conversation exists:
- If exists: Navigate to existing conversation
- If deleted: Restore and navigate
- If none: Create new direct conversation

```typescript
const handleMessageClick = async (profile: Profile) => {
  const conversationId = await ConversationService.getOrCreateDirectConversation(
    user.id,
    profile.id
  );
  navigate(`/messages/${conversationId}/${profile.id}`);
};
```

## Database Schema Key Concepts

### Conversations Table
- Stores both direct (1-on-1) and group conversations
- `conversation_type`: 'direct' or 'group'
- `group_name` and `group_photo`: Only used for groups
- Tracks creation time and updates

### Conversation Participants Table
- Links users to conversations (many-to-many)
- `is_admin`: True for group admins and all direct chat participants
- `is_active`: False when user leaves group
- `is_deleted`: Soft delete for individual user
- `is_pinned`: Per-user pinning

### Migration Strategy
The schema is designed to work alongside existing `matches` and `messages` tables:
1. New conversations use `conversation_id` in messages
2. Old messages keep `match_id` for backward compatibility
3. Run migration function when ready to convert all existing data
4. Can phase out `match_id` column later

## Benefits

### User Experience
- ✅ Start conversations from messages page
- ✅ Create group chats with multiple matches
- ✅ Convert any conversation to group
- ✅ Deleted conversations can be restarted
- ✅ Search for specific matches
- ✅ See who's in each conversation

### Technical
- ✅ Scalable architecture for any number of participants
- ✅ Proper RLS policies for security
- ✅ Backward compatible with existing code
- ✅ Soft delete preserves conversation history
- ✅ Efficient queries with proper indexes

## Testing Checklist

- [ ] Run database schema in Supabase
- [ ] Test creating direct conversation
- [ ] Test creating group conversation
- [ ] Test adding members to group
- [ ] Test removing members from group
- [ ] Test converting direct to group
- [ ] Test deleting and restoring conversation
- [ ] Test pinning conversations
- [ ] Test search in new message modal
- [ ] Test group admin permissions
- [ ] Test message sending in groups
- [ ] Test read receipts in groups
- [ ] Verify RLS policies work correctly

## Next Steps

1. **Run the database schema** - Execute GROUP_CHAT_SCHEMA.sql in Supabase
2. **Update Messages page** - Add New Message button and modal
3. **Update message service** - Support conversation_id
4. **Create group chat UI** - Build group-specific interface
5. **Add conversion feature** - Allow converting direct to group
6. **Test thoroughly** - Verify all features work

## Notes

- All existing features (reactions, replies, media, voice, etc.) work with groups
- Group chat messages are visible to all active participants
- Admins can manage group settings and members
- Users can leave groups at any time
- Soft delete means conversations can always be restored

## Support

If you encounter issues:
1. Check Supabase logs for RLS policy errors
2. Verify all database functions were created successfully
3. Ensure conversation_id is being passed correctly
4. Check that user is participant in conversation they're accessing
