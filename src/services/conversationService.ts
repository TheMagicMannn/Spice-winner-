import { supabase } from './supabase';
import { Profile } from '@/types';

export interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: string;
  isAdmin: boolean;
  isActive: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  profile?: Profile;
}

export interface ConversationDetails {
  id: string;
  conversationType: 'direct' | 'group';
  groupName?: string;
  groupPhoto?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isPinned?: boolean;
  isDeleted?: boolean;
}

export class ConversationService {
  /**
   * Get or create a direct conversation between two users
   * Falls back to match-based system if conversation schema not yet deployed
   */
  static async getOrCreateDirectConversation(
    userId1: string,
    userId2: string
  ): Promise<string> {
    try {
      console.log("[v0] getOrCreateDirectConversation called with users:", userId1, userId2);
      
      // Try new conversation system first
      const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
        user1_id: userId1,
        user2_id: userId2
      });

      if (error) {
        console.error("[v0] Conversation RPC error:", error.message);
        // If function doesn't exist, fall back to match-based system
        console.log('[v0] Conversation system not fully deployed yet, using match-based system');
        return await this.getMatchIdFallback(userId1, userId2);
      }
      
      console.log("[v0] Direct conversation created/retrieved:", data);
      return data;
    } catch (error: any) {
      console.error('[v0] Error getting/creating direct conversation:', error?.message || error);
      // Try fallback
      return await this.getMatchIdFallback(userId1, userId2);
    }
  }

  /**
   * Fallback: Get matchId between two users (legacy system)
   */
  private static async getMatchIdFallback(
    userId1: string,
    userId2: string
  ): Promise<string> {
    try {
      console.log("[v0] Using match-based fallback for users:", userId1, userId2);
      
      const { data, error } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'matched')
        .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
        .maybeSingle();

      if (error) {
        console.error("[v0] Match lookup error:", error);
        throw error;
      }
      
      if (data) {
        console.log("[v0] Match found:", data.id);
        return data.id;
      } else {
        console.warn("[v0] No match found between users");
        throw new Error('No match found between these users');
      }
    } catch (error: any) {
      console.error('[v0] Error in getMatchIdFallback:', error?.message || error);
      throw error;
    }
  }

  /**
   * Create a new group conversation
   */
  static async createGroupConversation(
    creatorId: string,
    groupName: string,
    participantIds: string[],
    groupPhoto?: string
  ): Promise<string> {
    try {
      console.log("[v0] Creating group conversation:", groupName, "with participants:", participantIds.length);
      
      // First create the group using the database function
      const { data: conversationId, error: funcError } = await supabase.rpc(
        'create_group_conversation',
        {
          creator_id: creatorId,
          group_name_param: groupName,
          participant_ids: participantIds
        }
      );

      if (funcError) {
        console.error("[v0] Group creation RPC error:", funcError.message);
        throw new Error(`Failed to create group: ${funcError.message}`);
      }

      console.log("[v0] Group conversation created:", conversationId);

      // Update group photo if provided
      if (groupPhoto && conversationId) {
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ group_photo: groupPhoto })
          .eq('id', conversationId);

        if (updateError) {
          console.error('[v0] Error updating group photo:', updateError);
          // Don't fail - photo is optional
        }
      }

      return conversationId;
    } catch (error: any) {
      console.error('[v0] Error creating group conversation:', error?.message || error);
      throw error;
    }
  }

  /**
   * Convert a direct conversation to a group by adding more participants
   */
  static async convertToGroupConversation(
    conversationId: string,
    groupName: string,
    additionalParticipantIds: string[]
  ): Promise<void> {
    try {
      console.log("[v0] Converting conversation to group:", conversationId);
      
      // Update conversation type and name
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          conversation_type: 'group',
          group_name: groupName
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error("[v0] Error updating conversation type:", updateError);
        throw updateError;
      }

      // Add new participants
      for (const userId of additionalParticipantIds) {
        await this.addParticipantToGroup(conversationId, userId);
      }

      console.log("[v0] Conversation converted to group");
    } catch (error: any) {
      console.error('[v0] Error converting to group conversation:', error?.message || error);
      throw error;
    }
  }

  /**
   * Add a participant to a group conversation
   */
  static async addParticipantToGroup(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      console.log("[v0] Adding participant to group:", userId);
      
      const { error } = await supabase.rpc('add_user_to_group', {
        conversation_id_param: conversationId,
        user_id_param: userId
      });

      if (error) {
        console.error("[v0] Error adding participant:", error);
        throw error;
      }

      console.log("[v0] Participant added successfully");
    } catch (error: any) {
      console.error('[v0] Error adding participant to group:', error?.message || error);
      throw error;
    }
  }

  /**
   * Remove a participant from a group conversation
   */
  static async removeParticipantFromGroup(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      console.log("[v0] Removing participant from group:", userId);
      
      const { error } = await supabase.rpc('remove_user_from_group', {
        conversation_id_param: conversationId,
        user_id_param: userId
      });

      if (error) {
        console.error("[v0] Error removing participant:", error);
        throw error;
      }

      console.log("[v0] Participant removed successfully");
    } catch (error: any) {
      console.error('[v0] Error removing participant from group:', error?.message || error);
      throw error;
    }
  }

  /**
   * Get details of a specific conversation by ID
   */
  static async getConversationDetails(conversationId: string): Promise<ConversationDetails | null> {
    try {
      console.log("[v0] Getting conversation details:", conversationId);
      
      // Get conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();

      if (convError) {
        console.error("[v0] Error fetching conversation:", convError);
        throw convError;
      }

      if (!conversation) {
        console.log("[v0] Conversation not found:", conversationId);
        return null;
      }

      // Get all participants
      const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_active', true);

      if (partError) {
        console.error("[v0] Error fetching participants:", partError);
        throw partError;
      }

      // Get profile data for all participants
      const userIds = participants?.map(p => p.user_id) || [];
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profileError) {
        console.error("[v0] Error fetching profiles:", profileError);
        throw profileError;
      }

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Build participant details
      const participantDetails: ConversationParticipant[] = (participants || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        conversationId: p.conversation_id,
        joinedAt: p.joined_at,
        isAdmin: p.is_admin,
        isActive: p.is_active,
        isPinned: p.is_pinned,
        isDeleted: p.is_deleted,
        profile: profileMap.get(p.user_id)
      }));

      // Get last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, message_type, created_at')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const details: ConversationDetails = {
        id: conversation.id,
        conversationType: conversation.conversation_type,
        groupName: conversation.group_name,
        groupPhoto: conversation.group_photo,
        createdBy: conversation.created_by,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        participants: participantDetails,
        lastMessage: lastMessage?.content,
        lastMessageAt: lastMessage?.created_at,
        unreadCount: 0
      };

      console.log("[v0] Conversation details retrieved successfully");
      return details;
    } catch (error: any) {
      console.error('[v0] Error getting conversation details:', error?.message || error);
      return null;
    }
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(
    userId: string,
    filter: 'all' | 'unread' | 'groups' | 'direct' | 'deleted' = 'all'
  ): Promise<ConversationDetails[]> {
    try {
      console.log("[v0] Getting user conversations with filter:", filter);
      
      // Get user's active conversations
      const { data: participantData, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, is_pinned, is_deleted')
        .eq('user_id', userId);

      if (partError) {
        console.error("[v0] Error fetching participant data:", partError);
        throw partError;
      }

      if (!participantData || participantData.length === 0) {
        console.log("[v0] User has no conversations");
        return [];
      }

      console.log("[v0] Found", participantData.length, "participant records");

      // Filter based on deleted status
      let conversationIds: string[];
      if (filter === 'deleted') {
        conversationIds = participantData
          .filter(p => p.is_deleted)
          .map(p => p.conversation_id);
      } else {
        conversationIds = participantData
          .filter(p => !p.is_deleted)
          .map(p => p.conversation_id);
      }

      if (conversationIds.length === 0) {
        console.log("[v0] No conversations found after filtering");
        return [];
      }

      console.log("[v0] Fetching details for", conversationIds.length, "conversations");

      // Get conversation details
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convError) {
        console.error("[v0] Error fetching conversations:", convError);
        throw convError;
      }

      // Get all participants for these conversations
      const { data: allParticipants, error: allPartError } = await supabase
        .from('conversation_participants')
        .select('*')
        .in('conversation_id', conversationIds)
        .eq('is_active', true);

      if (allPartError) {
        console.error("[v0] Error fetching all participants:", allPartError);
        throw allPartError;
      }

      // Get profile data for all participants
      const allUserIds = Array.from(
        new Set(allParticipants?.map(p => p.user_id) || [])
      );

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allUserIds);

      if (profileError) {
        console.error("[v0] Error fetching profiles:", profileError);
        throw profileError;
      }

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Build conversation details
      const conversationDetails: ConversationDetails[] = await Promise.all(
        (conversations || []).map(async (conv: any) => {
          const participants = (allParticipants || [])
            .filter((p: any) => p.conversation_id === conv.id)
            .map((p: any) => ({
              id: p.id,
              userId: p.user_id,
              conversationId: p.conversation_id,
              joinedAt: p.joined_at,
              isAdmin: p.is_admin,
              isActive: p.is_active,
              isPinned: p.is_pinned,
              isDeleted: p.is_deleted,
              profile: profileMap.get(p.user_id)
            }));

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, message_type, created_at')
            .eq('conversation_id', conv.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', userId)
            .eq('is_deleted', false);

          const userParticipant = participantData.find(
            p => p.conversation_id === conv.id
          );

          return {
            id: conv.id,
            conversationType: conv.conversation_type,
            groupName: conv.group_name,
            groupPhoto: conv.group_photo,
            createdBy: conv.created_by,
            createdAt: conv.created_at,
            updatedAt: conv.updated_at,
            participants,
            lastMessage: lastMessage?.content,
            lastMessageAt: lastMessage?.created_at,
            unreadCount: unreadCount || 0,
            isPinned: userParticipant?.is_pinned || false,
            isDeleted: userParticipant?.is_deleted || false
          } as ConversationDetails;
        })
      );

      // Apply additional filters
      let filtered = conversationDetails;
      
      switch (filter) {
        case 'unread':
          filtered = conversationDetails.filter(c => c.unreadCount > 0);
          break;
        case 'groups':
          filtered = conversationDetails.filter(c => c.conversationType === 'group');
          break;
        case 'direct':
          filtered = conversationDetails.filter(c => c.conversationType === 'direct');
          break;
      }

      // Sort: pinned first, then by last message time
      const sorted = filtered.sort((a, b) => {
        const aPinned = participantData.find(p => p.conversation_id === a.id)?.is_pinned;
        const bPinned = participantData.find(p => p.conversation_id === b.id)?.is_pinned;
        
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });

      console.log("[v0] Returning", sorted.length, "conversations after filtering and sorting");
      return sorted;
    } catch (error: any) {
      console.error('[v0] Error getting user conversations:', error?.message || error);
      throw error;
    }
  }

  /**
   * Get conversation details by ID
   */
  static async getConversationById(conversationId: string): Promise<ConversationDetails | null> {
    try {
      console.log("[v0] Getting conversation by ID:", conversationId);
      
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error("[v0] Error fetching conversation:", convError);
        throw convError;
      }

      if (!conversation) {
        console.log("[v0] Conversation not found");
        return null;
      }

      // Get participants
      const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_active', true);

      if (partError) {
        console.error("[v0] Error fetching participants:", partError);
        throw partError;
      }

      // Get profiles
      const userIds = participants?.map(p => p.user_id) || [];
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profileError) {
        console.error("[v0] Error fetching profiles:", profileError);
        throw profileError;
      }

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const participantDetails = (participants || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        conversationId: p.conversation_id,
        joinedAt: p.joined_at,
        isAdmin: p.is_admin,
        isActive: p.is_active,
        isPinned: p.is_pinned,
        isDeleted: p.is_deleted,
        profile: profileMap.get(p.user_id)
      }));

      console.log("[v0] Conversation retrieved successfully");

      return {
        id: conversation.id,
        conversationType: conversation.conversation_type,
        groupName: conversation.group_name,
        groupPhoto: conversation.group_photo,
        createdBy: conversation.created_by,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        participants: participantDetails,
        unreadCount: 0
      };
    } catch (error: any) {
      console.error('[v0] Error getting conversation by ID:', error?.message || error);
      return null;
    }
  }

  /**
   * Update group conversation details
   */
  static async updateGroupConversation(
    conversationId: string,
    updates: { groupName?: string; groupPhoto?: string }
  ): Promise<void> {
    try {
      const updateData: any = {};
      if (updates.groupName) updateData.group_name = updates.groupName;
      if (updates.groupPhoto) updateData.group_photo = updates.groupPhoto;

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (error) throw error;

      console.log("[v0] Group conversation updated successfully");
    } catch (error: any) {
      console.error('[v0] Error updating group conversation:', error?.message || error);
      throw error;
    }
  }

  /**
   * Toggle pin conversation for user
   */
  static async togglePinConversation(
    userId: string,
    conversationId: string
  ): Promise<boolean> {
    try {
      const { data: existing } = await supabase
        .from('conversation_participants')
        .select('is_pinned')
        .eq('user_id', userId)
        .eq('conversation_id', conversationId)
        .single();

      const newPinnedState = !existing?.is_pinned;

      const { error } = await supabase
        .from('conversation_participants')
        .update({ is_pinned: newPinnedState })
        .eq('user_id', userId)
        .eq('conversation_id', conversationId);

      if (error) throw error;

      console.log("[v0] Pin state toggled to:", newPinnedState);
      return newPinnedState;
    } catch (error: any) {
      console.error('[v0] Error toggling pin conversation:', error?.message || error);
      throw error;
    }
  }

  /**
   * Delete (soft delete) a conversation for user
   */
  static async deleteConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('conversation_id', conversationId);

      if (error) throw error;

      console.log("[v0] Conversation deleted successfully");
    } catch (error: any) {
      console.error('[v0] Error deleting conversation:', error?.message || error);
      throw error;
    }
  }

  /**
   * Restore a deleted conversation
   */
  static async restoreConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({
          is_deleted: false,
          deleted_at: null
        })
        .eq('user_id', userId)
        .eq('conversation_id', conversationId);

      if (error) throw error;

      console.log("[v0] Conversation restored successfully");
    } catch (error: any) {
      console.error('[v0] Error restoring conversation:', error?.message || error);
      throw error;
    }
  }

  /**
   * Leave a group conversation
   */
  static async leaveGroupConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    try {
      await this.removeParticipantFromGroup(conversationId, userId);
      console.log("[v0] Left group conversation");
    } catch (error: any) {
      console.error('[v0] Error leaving group conversation:', error?.message || error);
      throw error;
    }
  }

  /**
   * Permanently delete a conversation (removes participant record completely)
   */
  static async permanentlyDeleteConversation(
    conversationId: string
  ): Promise<void> {
    try {
      // Delete the participant record entirely
      const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      console.log("[v0] Conversation permanently deleted");
    } catch (error: any) {
      console.error('[v0] Error permanently deleting conversation:', error?.message || error);
      throw error;
    }
  }
}
