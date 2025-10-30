import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  matchId: string;
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
  createdAt: string;
  updatedAt: string;
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
}

export class MessageService {
  /**
   * Get all conversations for a user
   */
  static async getConversations(userId: string): Promise<Conversation[]> {
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
          
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, message_type, created_at')
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
            unreadCount: unreadCount || 0,
            isOnline: !!isOnline
          };
        })
      );

      // Sort by last message time
      return conversations.sort((a, b) => {
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
   * Get messages for a conversation
   */
  static async getMessages(matchId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(this.transformMessage);
    } catch (error) {
      console.error('Error getting messages:', error);
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

      if (error) throw error;

      return this.transformMessage(data);
    } catch (error) {
      console.error('Error sending message:', error);
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
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: senderId,
          content: messageType === 'voice' ? 'Voice message' : '',
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
          upsert: false
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
   * Mark all messages in a conversation as read
   */
  static async markConversationAsRead(matchId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('match_id', matchId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  /**
   * Mark media as viewed and start self-destruct timer
   */
  static async markMediaViewed(messageId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('mark_media_viewed', {
        message_id: messageId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking media as viewed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to new messages in a conversation
   */
  static subscribeToMessages(
    matchId: string,
    onMessage: (message: Message) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
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
          onMessage(this.transformMessage(payload.new));
        }
      )
      .subscribe();

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
   * Transform database message to app format
   */
  private static transformMessage(dbMessage: any): Message {
    return {
      id: dbMessage.id,
      matchId: dbMessage.match_id,
      senderId: dbMessage.sender_id,
      content: dbMessage.content || '',
      messageType: dbMessage.message_type,
      mediaUrl: dbMessage.media_url,
      selfDestructSeconds: dbMessage.self_destruct_seconds,
      firstViewedAt: dbMessage.first_viewed_at,
      expiresAt: dbMessage.expires_at,
      isRead: dbMessage.is_read,
      readAt: dbMessage.read_at,
      isDeleted: dbMessage.is_deleted,
      deletedAt: dbMessage.deleted_at,
      createdAt: dbMessage.created_at,
      updatedAt: dbMessage.updated_at
    };
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
}
