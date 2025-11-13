import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  matchId: string;
  conversationId?: string; // Added for conversation-based messaging
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'voice' | 'gif';
  mediaUrl?: string;
  selfDestructSeconds?: number;
  firstViewedAt?: string;
  expiresAt?: string;
  isRead: boolean;
  readAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  replyToId?: string;
  replyToMessage?: Message;
  reactions?: MessageReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Conversation {
  matchId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  lastMessageSenderId?: string; // Track who sent the last message
}

export class MessageService {
  /**
   * Get all conversations for a user with optional filtering
   */
  static async getConversations(
    userId: string, 
    filter: 'all' | 'unread' | 'sent' | 'deleted' = 'all'
  ): Promise<Conversation[]> {
    try {
      // Get all matched conversations
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, matched_at')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'matched')
        .order('matched_at', { ascending: false });

      if (matchError) throw matchError;

      if (!matches || matches.length === 0) {
        return [];
      }

      // Get conversation settings for this user
      const { data: settings, error: settingsError } = await supabase
        .from('conversation_settings')
        .select('*')
        .eq('user_id', userId);

      if (settingsError) throw settingsError;

      const settingsMap = new Map(settings?.map(s => [s.match_id, s]) || []);

      // Get profiles for all users in matches
      const userIds = Array.from(new Set(
        matches.flatMap(m => [m.user1_id, m.user2_id])
      )).filter(id => id !== userId);

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, photos, last_active_at')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Create a map for quick profile lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get last message and unread count for each match
      const conversations: Conversation[] = await Promise.all(
        matches.map(async (match: any) => {
          const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
          const otherUser = profileMap.get(otherUserId);
          const setting = settingsMap.get(match.id);
          
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, message_type, sender_id, created_at')
            .eq('match_id', match.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
            .eq('is_read', false)
            .neq('sender_id', userId)
            .eq('is_deleted', false);

          // Check if user is online (active in last 15 minutes)
          const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
          const isOnline = otherUser?.last_active_at && otherUser.last_active_at > fifteenMinutesAgo;

          return {
            matchId: match.id,
            otherUserId: otherUserId || '',
            otherUserName: otherUser?.display_name || 'Unknown User',
            otherUserPhoto: otherUser?.photos?.[0] || '',
            lastMessage: lastMessage ? this.formatLastMessage(lastMessage) : undefined,
            lastMessageAt: lastMessage?.created_at,
            lastMessageSenderId: lastMessage?.sender_id,
            unreadCount: unreadCount || 0,
            isOnline: !!isOnline,
            isPinned: setting?.is_pinned || false,
            isDeleted: setting?.is_deleted || false
          };
        })
      );

      // Filter conversations based on filter type
      let filtered = conversations;
      
      switch (filter) {
        case 'unread':
          filtered = conversations.filter(c => c.unreadCount > 0 && !c.isDeleted);
          break;
        case 'sent':
          filtered = conversations.filter(c => c.lastMessageSenderId === userId && !c.isDeleted);
          break;
        case 'deleted':
          filtered = conversations.filter(c => c.isDeleted);
          break;
        default: // 'all'
          filtered = conversations.filter(c => !c.isDeleted);
      }

      // Sort: pinned first, then by last message time
      return filtered.sort((a, b) => {
        // Pinned conversations always first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then sort by last message time
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  /**
   * Format last message for display
   */
  private static formatLastMessage(message: any): string {
    switch (message.message_type) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'voice':
        return '🎤 Voice message';
      case 'gif':
        return '🎬 GIF';
      default:
        return message.content || '';
    }
  }

  /**
   * Get messages for a conversation (works for both match-based and conversation-based)
   */
  static async getMessages(matchId: string, limit: number = 50): Promise<Message[]> {
    try {
      console.log("[v0] getMessages called with matchId:", matchId);
      
      // Try conversation_id first (for group chats and new direct chats)
      let data, error;
      
      const conversationQuery = await supabase
        .from('messages')
        .select(`
          *,
          reply_to_message:reply_to_id (
            id,
            content,
            message_type,
            sender_id
          )
        `)
        .eq('conversation_id', matchId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(limit);

      console.log("[v0] Conversation query result:", { 
        dataLength: conversationQuery.data?.length, 
        error: conversationQuery.error 
      });

      if (conversationQuery.data && conversationQuery.data.length > 0) {
        data = conversationQuery.data;
        error = conversationQuery.error;
      } else {
        // Fallback to match_id (for legacy direct messages)
        const matchQuery = await supabase
          .from('messages')
          .select(`
            *,
            reply_to_message:reply_to_id (
              id,
              content,
              message_type,
              sender_id
            )
          `)
          .eq('match_id', matchId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(limit);
        
        console.log("[v0] Match query result:", { 
          dataLength: matchQuery.data?.length, 
          error: matchQuery.error 
        });

        data = matchQuery.data;
        error = matchQuery.error;
      }

      if (error) {
        console.error("[v0] Error fetching messages:", error);
        throw error;
      }

      const messages = (data || []).map(this.transformMessage);
      console.log("[v0] Successfully loaded", messages.length, "messages");
      return messages;
    } catch (error: any) {
      console.error("[v0] Error in getMessages:", error?.message || error);
      throw error;
    }
  }

  /**
   * Send a text message
   */
  static async sendMessage(
    matchId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    try {
      console.log("[v0] sendMessage called with matchId:", matchId, "senderId:", senderId);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: senderId,
          content,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) {
        console.error("[v0] Error sending message:", error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log("[v0] Message sent successfully:", data.id);
      return this.transformMessage(data);
    } catch (error: any) {
      console.error("[v0] Error in sendMessage:", error?.message || error);
      throw error;
    }
  }

  /**
   * Send media message (image, video, voice)
   */
  static async sendMediaMessage(
    matchId: string,
    senderId: string,
    file: File,
    messageType: 'image' | 'video' | 'voice',
    selfDestructSeconds?: number
  ): Promise<Message> {
    try {
      // Upload file to storage
      const mediaUrl = await this.uploadMedia(senderId, matchId, file, messageType);

      // Create message with media
      // Provide meaningful content for all media types to satisfy DB constraint
      let content = '';
      switch (messageType) {
        case 'image':
          content = 'Photo';
          break;
        case 'video':
          content = 'Video';
          break;
        case 'voice':
          content = 'Voice message';
          break;
        default:
          content = 'Media';
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: senderId,
          content: content,
          message_type: messageType,
          media_url: mediaUrl,
          self_destruct_seconds: selfDestructSeconds
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformMessage(data);
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }

  /**
   * Upload media to Supabase Storage
   */
  static async uploadMedia(
    userId: string,
    matchId: string,
    file: File,
    type: string
  ): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${matchId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Storage upload error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Payload too large')) {
          throw new Error('File is too large. Maximum size is 50MB for videos and 10MB for images.');
        } else if (error.message.includes('policy')) {
          throw new Error('You do not have permission to upload this file.');
        } else if (error.message.includes('mime')) {
          throw new Error('File type not supported. Please use JPG, PNG, MP4, or WebM.');
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      const { data: publicData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  static async markAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Mark all messages in a conversation as read (works for both match-based and conversation-based)
   */
  static async markConversationAsRead(matchId: string, userId: string): Promise<void> {
    try {
      // Try conversation_id first
      const conversationUpdate = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', matchId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      // If no rows affected, try match_id
      if (!conversationUpdate.error) {
        // Also update match-based messages for backward compatibility
        await supabase
          .from('messages')
          .update({
            is_read: true,
            read_at: new Date().toISOString()
          })
          .eq('match_id', matchId)
          .neq('sender_id', userId)
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  /**
   * Mark media as viewed and start self-destruct timer
   */
  static async markMediaViewed(messageId: string): Promise<Message> {
    try {
      const { error } = await supabase.rpc('mark_media_viewed', {
        message_id: messageId
      });

      if (error) throw error;

      // Fetch the updated message to get first_viewed_at and expires_at
      const { data: updatedMessage, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      return this.transformMessage(updatedMessage);
    } catch (error) {
      console.error('Error marking media as viewed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to new messages in a conversation (supports both match_id and conversation_id)
   */
  static subscribeToMessages(
    matchId: string,
    onMessage: (message: Message) => void
  ): RealtimeChannel {
    console.log("[v0] Setting up message subscription for:", matchId);

    const channel = supabase
      .channel(`messages:${matchId}`)
      // Subscribe to conversation-based messages
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${matchId}`
        },
        (payload) => {
          console.log("[v0] New message received (conversation):", payload.new.id);
          onMessage(this.transformMessage(payload.new));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${matchId}`
        },
        (payload) => {
          console.log("[v0] Message updated (conversation):", payload.new.id);
          onMessage(this.transformMessage(payload.new));
        }
      )
      // Also subscribe to match-based messages for backward compatibility
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log("[v0] New message received (match):", payload.new.id);
          onMessage(this.transformMessage(payload.new));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log("[v0] Message updated (match):", payload.new.id);
          onMessage(this.transformMessage(payload.new));
        }
      )
      .on('error', (error) => {
        console.error("[v0] Realtime subscription error:", error);
      })
      .subscribe((status, err) => {
        console.log("[v0] Subscription status:", status, "Error:", err);
      });

    return channel;
  }

  /**
   * Set typing indicator
   */
  static async setTyping(matchId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      if (isTyping) {
        await supabase
          .from('typing_indicators')
          .upsert({
            match_id: matchId,
            user_id: userId,
            is_typing: true,
            updated_at: new Date().toISOString()
          });
      } else {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('match_id', matchId)
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Error setting typing indicator:', error);
    }
  }

  /**
   * Subscribe to typing indicators
   */
  static subscribeToTyping(
    matchId: string,
    currentUserId: string,
    onTypingChange: (isTyping: boolean) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`typing:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `match_id=eq.${matchId}`
        },
        (payload: any) => {
          // Only notify if it's the other user typing
          if (payload.new && payload.new.user_id && payload.new.user_id !== currentUserId) {
            onTypingChange(payload.new.is_typing || false);
          } else if (payload.eventType === 'DELETE' && payload.old && payload.old.user_id !== currentUserId) {
            onTypingChange(false);
          }
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Get other user's profile from match
   */
  static async getOtherUserFromMatch(matchId: string, currentUserId: string): Promise<any> {
    try {
      // Get the match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      // Determine other user ID
      const otherUserId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;

      // Get the other user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (profileError) throw profileError;

      return profile;
    } catch (error) {
      console.error('Error getting other user from match:', error);
      throw error;
    }
  }

  /**
   * Unsend (delete) a message - only sender can unsend
   */
  static async unsendMessage(messageId: string, userId: string): Promise<void> {
    try {
      // First verify the user is the sender
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;
      if (message.sender_id !== userId) {
        throw new Error('You can only unsend your own messages');
      }

      // Soft delete the message
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unsending message:', error);
      throw error;
    }
  }

  /**
   * Add or remove reaction to a message
   */
  static async toggleReaction(messageId: string, userId: string, emoji: string): Promise<Message> {
    try {
      // Get current message with reactions
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      let reactions = message.reactions || [];
      
      // Check if user already reacted with this emoji
      const existingIndex = reactions.findIndex(
        (r: MessageReaction) => r.userId === userId && r.emoji === emoji
      );

      if (existingIndex >= 0) {
        // Remove reaction
        reactions = reactions.filter((_: any, i: number) => i !== existingIndex);
      } else {
        // Add reaction
        reactions.push({
          userId,
          emoji,
          createdAt: new Date().toISOString()
        });
      }

      // Update message with new reactions
      const { data: updatedMessage, error: updateError } = await supabase
        .from('messages')
        .update({ reactions })
        .eq('id', messageId)
        .select()
        .single();

      if (updateError) throw updateError;

      return this.transformMessage(updatedMessage);
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  }

  /**
   * Send a reply message
   */
  static async sendReplyMessage(
    matchId: string,
    senderId: string,
    content: string,
    replyToId: string
  ): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: senderId,
          content,
          message_type: 'text',
          reply_to_id: replyToId
        })
        .select(`
          *,
          reply_to_message:reply_to_id (
            id,
            content,
            message_type,
            sender_id
          )
        `)
        .single();

      if (error) throw error;

      return this.transformMessage(data);
    } catch (error) {
      console.error('Error sending reply message:', error);
      throw error;
    }
  }

  /**
   * Pin or unpin a conversation
   */
  static async togglePinConversation(userId: string, matchId: string): Promise<boolean> {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('conversation_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .maybeSingle();

      if (existing) {
        // Toggle pin status
        const { error } = await supabase
          .from('conversation_settings')
          .update({ 
            is_pinned: !existing.is_pinned,
            pinned_at: !existing.is_pinned ? new Date().toISOString() : null
          })
          .eq('user_id', userId)
          .eq('match_id', matchId);

        if (error) throw error;
        return !existing.is_pinned;
      } else {
        // Create new setting with pinned = true
        const { error } = await supabase
          .from('conversation_settings')
          .insert({
            user_id: userId,
            match_id: matchId,
            is_pinned: true,
            pinned_at: new Date().toISOString()
          });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error toggling pin conversation:', error);
      throw error;
    }
  }

  /**
   * Delete (soft delete) a conversation
   */
  static async deleteConversation(userId: string, matchId: string): Promise<void> {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('conversation_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .maybeSingle();

      if (existing) {
        // Update to deleted
        const { error } = await supabase
          .from('conversation_settings')
          .update({ 
            is_deleted: true,
            deleted_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('match_id', matchId);

        if (error) throw error;
      } else {
        // Create new setting with deleted = true
        const { error } = await supabase
          .from('conversation_settings')
          .insert({
            user_id: userId,
            match_id: matchId,
            is_deleted: true,
            deleted_at: new Date().toISOString()
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Restore a deleted conversation
   */
  static async restoreConversation(userId: string, matchId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_settings')
        .update({ 
          is_deleted: false,
          deleted_at: null
        })
        .eq('user_id', userId)
        .eq('match_id', matchId);

      if (error) throw error;
    } catch (error) {
      console.error('Error restoring conversation:', error);
      throw error;
    }
  }

  /**
   * Get matchId between two users
   */
  static async getMatchIdBetweenUsers(userId1: string, userId2: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'matched')
        .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
        .maybeSingle();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error getting match ID:', error);
      return null;
    }
  }

  // ============================================
  // CONVERSATION-BASED MESSAGING (Group Chat Support)
  // ============================================

  /**
   * Get or create a direct conversation with another user
   * Creates NEW conversation if old one was deleted
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
    messageType: 'text' | 'image' | 'video' | 'voice' | 'gif' = 'text'
  ): Promise<Message> {
    try {
      console.log("[v0] sendMessageInConversation called with conversationId:", conversationId);

      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .single();

      if (convError || !convData) {
        console.error("[v0] Conversation not found or no access:", convError);
        throw new Error('Conversation not found or you do not have access');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: messageType,
          match_id: null
        })
        .select()
        .single();

      if (error) {
        console.error("[v0] Error sending conversation message:", error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log("[v0] Conversation message sent successfully:", data.id);
      return this.transformMessage(data);
    } catch (error: any) {
      console.error("[v0] Error in sendMessageInConversation:", error?.message || error);
      throw error;
    }
  }

  /**
   * Send media message in a conversation
   */
  static async sendMediaMessageInConversation(
    conversationId: string,
    senderId: string,
    file: File,
    messageType: 'image' | 'video' | 'voice',
    selfDestructSeconds?: number
  ): Promise<Message> {
    try {
      console.log("[v0] Uploading media for conversation:", conversationId);

      // Upload file to storage
      const mediaUrl = await this.uploadMedia(senderId, conversationId, file, messageType);

      // Create message with media
      let content = '';
      switch (messageType) {
        case 'image':
          content = 'Photo';
          break;
        case 'video':
          content = 'Video';
          break;
        case 'voice':
          content = 'Voice message';
          break;
        default:
          content = 'Media';
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: messageType,
          media_url: mediaUrl,
          self_destruct_seconds: selfDestructSeconds,
          match_id: null
        })
        .select()
        .single();

      if (error) {
        console.error("[v0] Error creating media message:", error);
        throw new Error(`Failed to send media: ${error.message}`);
      }

      console.log("[v0] Media message sent successfully:", data.id);
      return this.transformMessage(data);
    } catch (error: any) {
      console.error("[v0] Error in sendMediaMessageInConversation:", error?.message || error);
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

  /**
   * Restore deleted conversation for current user
   */
  static async restoreConversationForUser(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('restore_conversation_for_user', {
          conversation_id_param: conversationId,
          user_id_param: userId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error restoring conversation:', error);
      throw error;
    }
  }

  /**
   * Create a group conversation
   */
  static async createGroupConversation(
    creatorId: string,
    groupName: string,
    participantIds: string[]
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('create_group_conversation', {
          creator_id: creatorId,
          group_name_param: groupName,
          participant_ids: participantIds
        });

      if (error) throw error;
      return data; // Returns conversation_id
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Transform conversation_id in message data
   */
  private static transformMessage(data: any): Message {
    return {
      id: data.id,
      matchId: data.match_id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      content: data.content,
      messageType: data.message_type,
      mediaUrl: data.media_url,
      selfDestructSeconds: data.self_destruct_seconds,
      firstViewedAt: data.first_viewed_at,
      expiresAt: data.expires_at,
      isRead: data.is_read,
      readAt: data.read_at,
      isDeleted: data.is_deleted,
      deletedAt: data.deleted_at,
      replyToId: data.reply_to_id,
      replyToMessage: data.reply_to_message ? this.transformMessage(data.reply_to_message) : undefined,
      reactions: data.reactions ? JSON.parse(data.reactions) : [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
