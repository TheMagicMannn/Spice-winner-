# Frontend Integration Guide for Group Chats

## Overview
After running `COMPLETE_GROUP_CHAT_IMPLEMENTATION.sql`, here's how to integrate group chats in your frontend.

---

## Key Concepts

### 1. **Conversation Types**
- `direct`: 1-on-1 conversation (replaces match-based messaging)
- `group`: Group conversation with multiple users

### 2. **Soft Delete Per User**
- Each user can delete a conversation independently
- `is_deleted` flag is per-user in `conversation_participants`
- Deleted conversations don't show in "All Messages"
- Stay in "Deleted" folder

### 3. **New Messages After Delete**
- When user messages someone they previously deleted
- `get_or_create_direct_conversation()` creates a **NEW** conversation
- Old deleted conversation stays deleted
- New conversation appears in "All Messages"

---

## Frontend Changes Needed

### 1. Update messageService.ts

```typescript
// Add to messageService.ts

/**
 * Get or create a direct conversation with another user
 */
static async getOrCreateDirectConversation(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .rpc('get_or_create_direct_conversation', {
        user1_id: currentUserId,
        user2_id: otherUserId
      });

    if (error) throw error;
    return data; // Returns conversation_id
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
}

/**
 * Send message in a conversation (group or direct)
 */
static async sendMessageInConversation(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: 'text' | 'image' | 'video' = 'text'
): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        match_id: null // Important: set to null for conversation messages
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformMessage(data);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Load messages by conversation ID
 */
static async getMessagesByConversation(
  conversationId: string,
  limit: number = 50
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, reply_to_message:reply_to_id(id, content, message_type, sender_id)')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(this.transformMessage);
  } catch (error) {
    console.error('Error loading conversation messages:', error);
    return [];
  }
}

/**
 * Delete conversation for current user (soft delete)
 */
static async deleteConversationForUser(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('delete_conversation_for_user', {
        conversation_id_param: conversationId,
        user_id_param: userId
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}
```

### 2. Update ChatPage Flow

```typescript
// In ChatPage.tsx

const handleSendMessage = async () => {
  if (!user || !inputText.trim()) return;
  
  setIsSending(true);
  try {
    let conversationId: string;
    
    // If it's a direct chat and no conversation exists yet
    if (otherUserId && !conversationDetails) {
      // Get or create conversation (creates NEW one if old was deleted)
      conversationId = await MessageService.getOrCreateDirectConversation(
        user.id,
        otherUserId
      );
    } else if (conversationDetails) {
      conversationId = conversationDetails.id;
    } else {
      throw new Error('No conversation context');
    }
    
    // Send message in the conversation
    await MessageService.sendMessageInConversation(
      conversationId,
      user.id,
      inputText.trim()
    );
    
    setInputText('');
    
  } catch (error) {
    console.error('Failed to send message:', error);
    setUploadError('Failed to send message');
  } finally {
    setIsSending(false);
  }
};
```

### 3. Update Messages List Page

```typescript
// In Messages.tsx

const loadConversations = async () => {
  try {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        *,
        conversation:conversations(*),
        other_participants:conversation_participants(
          user_id,
          profile:profiles(*)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('is_deleted', false) // Only show non-deleted
      .order('conversation(updated_at)', { ascending: false });
    
    if (error) throw error;
    
    // Transform and set conversations
    setConversations(data);
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
};

// For deleted conversations
const loadDeletedConversations = async () => {
  try {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        *,
        conversation:conversations(*),
        other_participants:conversation_participants(
          user_id,
          profile:profiles(*)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_deleted', true) // Only show deleted
      .order('deleted_at', { ascending: false });
    
    if (error) throw error;
    setDeletedConversations(data);
  } catch (error) {
    console.error('Error loading deleted conversations:', error);
  }
};
```

### 4. Create Group Chat UI

```typescript
// New component: CreateGroupChat.tsx

const handleCreateGroup = async () => {
  if (!user || !groupName || selectedUsers.length === 0) return;
  
  try {
    const { data: conversationId, error } = await supabase
      .rpc('create_group_conversation', {
        creator_id: user.id,
        group_name_param: groupName,
        participant_ids: selectedUsers.map(u => u.id)
      });
    
    if (error) throw error;
    
    // Navigate to the new group chat
    navigate(`/chat/${conversationId}`);
  } catch (error) {
    console.error('Error creating group:', error);
  }
};
```

---

## Migration Path

### For Existing Match-Based Messages

**Option 1: Keep Both Systems**
- Old messages stay with `match_id`
- New messages use `conversation_id`
- RLS policies support both

**Option 2: Migrate to Conversations**
```sql
-- Create conversations for all existing matches
INSERT INTO conversations (conversation_type, created_by, created_at, updated_at)
SELECT 
  'direct',
  user1_id,
  matched_at,
  matched_at
FROM matches
WHERE status = 'matched';

-- Add participants for each match
INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
SELECT 
  c.id,
  m.user1_id,
  true
FROM conversations c
JOIN matches m ON m.matched_at = c.created_at
WHERE c.conversation_type = 'direct'
UNION ALL
SELECT 
  c.id,
  m.user2_id,
  true
FROM conversations c
JOIN matches m ON m.matched_at = c.created_at
WHERE c.conversation_type = 'direct';

-- Update messages to use conversation_id
UPDATE messages
SET conversation_id = c.id
FROM conversations c
JOIN matches m ON m.matched_at = c.created_at
WHERE messages.match_id = m.id;
```

---

## Testing Checklist

### Direct Chats
- [ ] Send message to new user → creates conversation
- [ ] Delete conversation → messages disappear from "All Messages"
- [ ] Message deleted user again → creates NEW conversation
- [ ] Old deleted conversation stays in "Deleted" folder
- [ ] New conversation appears in "All Messages"

### Group Chats
- [ ] Create group with 3+ users
- [ ] All users see the group
- [ ] Send text message → all receive
- [ ] Send photo → all receive
- [ ] Grouped avatars display in header
- [ ] Member count shows correctly

### Edge Cases
- [ ] User deletes group → group disappears for them only
- [ ] Other users still see the group
- [ ] Deleted user can't send messages (is_deleted check)
- [ ] User re-added to group → conversation restored

---

## Summary

**What's Implemented:**
✅ Group chat tables and relationships  
✅ Soft delete per user (independent deletion)  
✅ New conversation after delete (fresh thread)  
✅ RLS policies for both direct and group  
✅ Helper functions for common operations  
✅ Proper trigger for conversation updates  

**Frontend Needs:**
1. Update messageService with new methods
2. Modify ChatPage to use conversations
3. Update Messages list to show conversations
4. Add Create Group UI
5. Handle deleted conversations separately

**Key Behavior:**
- Deleting a conversation marks it deleted for YOU only
- Messaging someone after delete creates a NEW thread
- Old deleted thread stays in "Deleted" folder
- New thread appears in "All Messages" fresh
