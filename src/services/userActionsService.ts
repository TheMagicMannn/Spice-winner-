// src/services/userActionsService.ts
import { supabase } from './supabase';
import { reportService } from './reportService';

export class UserActionsService {
  /**
   * Block a user
   */
  static async blockUser(
    blockerId: string,
    blockedId: string,
    reason?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: blockerId,
          blocked_id: blockedId,
          reason: reason || 'No reason provided'
        });

      if (error) {
        // Check if already blocked
        if (error.code === '23505') {
          throw new Error('User is already blocked');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Check if user is blocked
   */
  static async isUserBlocked(
    blockerId: string,
    blockedId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Get list of blocked users
   */
  static async getBlockedUsers(userId: string): Promise<Array<{
    id: string;
    blocked_id: string;
    reason?: string;
    created_at: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      throw error;
    }
  }

  /**
   * Unmatch with a user (remove match)
   */
  static async unmatchUser(userId: string, targetUserId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'rejected' })
        .or(
          `and(user1_id.eq.${userId},user2_id.eq.${targetUserId}),` +
          `and(user1_id.eq.${targetUserId},user2_id.eq.${userId})`
        )
        .eq('status', 'matched');

      if (error) throw error;
    } catch (error) {
      console.error('Error unmatching user:', error);
      throw error;
    }
  }

  /**
   * Check if two users are matched
   */
  static async areUsersMatched(
    userId: string,
    targetUserId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, status')
        .or(
          `and(user1_id.eq.${userId},user2_id.eq.${targetUserId}),` +
          `and(user1_id.eq.${targetUserId},user2_id.eq.${userId})`
        )
        .eq('status', 'matched')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if users are matched:', error);
      return false;
    }
  }

  /**
   * Report a user
   */
  static async reportUser(
    reporterId: string,
    reportedId: string,
    reason: string,
    description?: string
  ): Promise<void> {
    try {
      await reportService.submitReport(reporterId, reportedId, reason, description);
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }

  /**
   * Get match details between two users
   */
  static async getMatchDetails(userId: string, targetUserId: string): Promise<{
    id: string;
    status: string;
    matched_at?: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, status, matched_at')
        .or(
          `and(user1_id.eq.${userId},user2_id.eq.${targetUserId}),` +
          `and(user1_id.eq.${targetUserId},user2_id.eq.${userId})`
        )
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting match details:', error);
      return null;
    }
  }
}

export default UserActionsService;
