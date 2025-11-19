// src/services/activityLogService.ts
import { supabase } from './supabase';

/**
 * Activity Log Service
 * Tracks user activities for admin dashboard analytics
 */

export type ActivityType = 
  | 'signup'
  | 'login'
  | 'profile_view'
  | 'profile_update'
  | 'like'
  | 'match'
  | 'message'
  | 'photo_upload'
  | 'payment'
  | 'verification_requested'
  | 'verification_completed';

interface LogActivityParams {
  userId: string;
  activityType: ActivityType;
  activityData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

class ActivityLogService {
  /**
   * Log a user activity
   */
  async logActivity({
    userId,
    activityType,
    activityData = {},
    ipAddress,
    userAgent
  }: LogActivityParams): Promise<void> {
    try {
      // Use the helper function that bypasses RLS
      const { error } = await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_activity_data: activityData,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });

      if (error) {
        console.error('[ActivityLog] Error logging activity:', error);
        // Don't throw - we don't want to break the user flow if logging fails
      }
    } catch (error) {
      console.error('[ActivityLog] Exception logging activity:', error);
      // Silent fail - logging shouldn't break user experience
    }
  }

  /**
   * Log user signup
   */
  async logSignup(userId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'signup',
      activityData: {
        timestamp: new Date().toISOString(),
        ...metadata
      },
      userAgent: navigator.userAgent
    });
  }

  /**
   * Log user login
   */
  async logLogin(userId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'login',
      activityData: {
        timestamp: new Date().toISOString(),
        ...metadata
      },
      userAgent: navigator.userAgent
    });
  }

  /**
   * Log profile view
   */
  async logProfileView(userId: string, viewedProfileId: string): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'profile_view',
      activityData: {
        viewed_profile_id: viewedProfileId,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log profile update
   */
  async logProfileUpdate(userId: string, updatedFields?: string[]): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'profile_update',
      activityData: {
        updated_fields: updatedFields,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log like/swipe
   */
  async logLike(userId: string, likedProfileId: string, isLike: boolean): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'like',
      activityData: {
        liked_profile_id: likedProfileId,
        is_like: isLike,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log match created
   */
  async logMatch(userId: string, matchedUserId: string): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'match',
      activityData: {
        matched_user_id: matchedUserId,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log message sent
   */
  async logMessage(userId: string, recipientId: string, conversationId: string): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'message',
      activityData: {
        recipient_id: recipientId,
        conversation_id: conversationId,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log photo upload
   */
  async logPhotoUpload(userId: string, photoUrl: string): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'photo_upload',
      activityData: {
        photo_url: photoUrl,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log payment
   */
  async logPayment(userId: string, amount: number, currency: string, membershipLevel?: string): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'payment',
      activityData: {
        amount,
        currency,
        membership_level: membershipLevel,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log verification request
   */
  async logVerificationRequest(userId: string): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'verification_requested',
      activityData: {
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log verification completed
   */
  async logVerificationCompleted(userId: string, verified: boolean): Promise<void> {
    await this.logActivity({
      userId,
      activityType: 'verification_completed',
      activityData: {
        verified,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export const activityLogService = new ActivityLogService();
