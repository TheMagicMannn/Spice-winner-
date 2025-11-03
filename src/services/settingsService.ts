import { supabase } from './supabase';

export interface UserSettings {
  id: string;
  // Notification Preferences
  notificationsMessages: boolean;
  notificationsPriorityMessages: boolean;
  notificationsLikes: boolean;
  notificationsNewMatches: boolean;
  notificationsEmail: boolean;
  notificationsActivity: boolean;
  
  // Privacy Settings
  hideAccount: boolean;
  incognitoMode: boolean;
  touchFaceIdProtection: boolean;
  showDistance: boolean;
  activityVisibility: boolean;
  
  // Other Settings
  locationDistance: string;
  measurementSystem: 'MI' | 'KM';
  appIconPreference: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  reason?: string;
  createdAt: string;
  blockedProfile?: {
    displayName: string;
    photos: string[];
    age?: number;
    location?: string;
  };
}

export interface PrivatePhotoAccess {
  id: string;
  ownerId: string;
  grantedToId: string;
  grantedAt: string;
  expiresAt?: string;
  grantedProfile?: {
    displayName: string;
    photos: string[];
  };
}

class SettingsService {
  /**
   * Transform database snake_case to frontend camelCase
   */
  private transformFromDatabase(data: any): UserSettings {
    return {
      id: data.id,
      notificationsMessages: data.notifications_messages ?? true,
      notificationsPriorityMessages: data.notifications_priority_messages ?? true,
      notificationsLikes: data.notifications_likes ?? true,
      notificationsNewMatches: data.notifications_new_matches ?? true,
      notificationsEmail: data.notifications_email ?? true,
      notificationsActivity: data.notifications_activity ?? true,
      hideAccount: data.hide_account ?? false,
      incognitoMode: data.incognito_mode ?? false,
      touchFaceIdProtection: data.touch_face_id_protection ?? false,
      showDistance: data.show_distance ?? true,
      activityVisibility: data.activity_visibility ?? true,
      locationDistance: data.location_distance ?? 'Distance',
      measurementSystem: data.measurement_system ?? 'MI',
      appIconPreference: data.app_icon_preference ?? 'default',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Transform frontend camelCase to database snake_case
   */
  private transformToDatabase(settings: Partial<UserSettings>): any {
    const dbData: any = {};
    
    if (settings.notificationsMessages !== undefined) dbData.notifications_messages = settings.notificationsMessages;
    if (settings.notificationsPriorityMessages !== undefined) dbData.notifications_priority_messages = settings.notificationsPriorityMessages;
    if (settings.notificationsLikes !== undefined) dbData.notifications_likes = settings.notificationsLikes;
    if (settings.notificationsNewMatches !== undefined) dbData.notifications_new_matches = settings.notificationsNewMatches;
    if (settings.notificationsEmail !== undefined) dbData.notifications_email = settings.notificationsEmail;
    if (settings.notificationsActivity !== undefined) dbData.notifications_activity = settings.notificationsActivity;
    if (settings.hideAccount !== undefined) dbData.hide_account = settings.hideAccount;
    if (settings.incognitoMode !== undefined) dbData.incognito_mode = settings.incognitoMode;
    if (settings.touchFaceIdProtection !== undefined) dbData.touch_face_id_protection = settings.touchFaceIdProtection;
    if (settings.showDistance !== undefined) dbData.show_distance = settings.showDistance;
    if (settings.activityVisibility !== undefined) dbData.activity_visibility = settings.activityVisibility;
    if (settings.locationDistance !== undefined) dbData.location_distance = settings.locationDistance;
    if (settings.measurementSystem !== undefined) dbData.measurement_system = settings.measurementSystem;
    if (settings.appIconPreference !== undefined) dbData.app_icon_preference = settings.appIconPreference;
    
    return dbData;
  }

  /**
   * Get user settings by user ID
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user settings:', error);
        throw error;
      }

      // If no settings exist, create default settings
      if (!data) {
        return this.createDefaultSettings(userId);
      }

      return this.transformFromDatabase(data);
    } catch (error) {
      console.error('SettingsService.getUserSettings error:', error);
      throw error;
    }
  }

  /**
   * Create default settings for a new user
   */
  async createDefaultSettings(userId: string): Promise<UserSettings> {
    try {
      const defaultSettings = {
        id: userId,
        notifications_messages: true,
        notifications_priority_messages: true,
        notifications_likes: true,
        notifications_new_matches: true,
        notifications_email: true,
        notifications_activity: true,
        hide_account: false,
        incognito_mode: false,
        touch_face_id_protection: false,
        show_distance: true,
        activity_visibility: true,
        location_distance: 'Distance',
        measurement_system: 'MI',
        app_icon_preference: 'default'
      };

      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        throw error;
      }

      return this.transformFromDatabase(data);
    } catch (error) {
      console.error('SettingsService.createDefaultSettings error:', error);
      throw error;
    }
  }

  /**
   * Update user settings
   */
  async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const dbSettings = this.transformToDatabase(settings);

      const { data, error } = await supabase
        .from('user_settings')
        .update(dbSettings)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }

      return this.transformFromDatabase(data);
    } catch (error) {
      console.error('SettingsService.updateSettings error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * Requires current password for security
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // First, verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('No user session found');
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        throw updateError;
      }

      // Log password change
      await this.logPasswordChange(user.id);
      
    } catch (error: any) {
      console.error('SettingsService.changePassword error:', error);
      throw error;
    }
  }

  /**
   * Log password change for security audit
   */
  private async logPasswordChange(userId: string): Promise<void> {
    try {
      await supabase
        .from('password_change_history')
        .insert({
          user_id: userId,
          changed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging password change:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Request account deletion (soft delete with 30-day grace period)
   */
  async requestAccountDeletion(reason?: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .rpc('schedule_account_deletion', {
          p_user_id: user.id,
          p_reason: reason || null
        });

      if (error) {
        console.error('Error requesting account deletion:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('SettingsService.requestAccountDeletion error:', error);
      throw error;
    }
  }

  /**
   * Cancel account deletion request
   */
  async cancelAccountDeletion(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      const { error } = await supabase
        .rpc('cancel_account_deletion', {
          p_user_id: user.id
        });

      if (error) {
        console.error('Error canceling account deletion:', error);
        throw error;
      }
    } catch (error) {
      console.error('SettingsService.cancelAccountDeletion error:', error);
      throw error;
    }
  }

  /**
   * Immediately delete account (hard delete - no grace period)
   */
  async deleteAccountImmediately(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      // This will cascade delete all related data
      const { error } = await supabase.rpc('execute_account_deletion', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }

      // Sign out
      await supabase.auth.signOut();
    } catch (error) {
      console.error('SettingsService.deleteAccountImmediately error:', error);
      throw error;
    }
  }

  /**
   * Get list of blocked users
   */
  async getBlockedUsers(): Promise<BlockedUser[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocker_id,
          blocked_id,
          reason,
          created_at,
          blocked_profile:profiles!blocked_users_blocked_id_fkey(
            display_name,
            photos,
            age,
            location
          )
        `)
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blocked users:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        blockerId: item.blocker_id,
        blockedId: item.blocked_id,
        reason: item.reason || undefined,
        createdAt: item.created_at,
        blockedProfile: item.blocked_profile ? {
          displayName: item.blocked_profile.display_name || 'Unknown User',
          photos: item.blocked_profile.photos || [],
          age: item.blocked_profile.age,
          location: item.blocked_profile.location
        } : undefined
      }));
    } catch (error) {
      console.error('SettingsService.getBlockedUsers error:', error);
      throw error;
    }
  }

  /**
   * Block a user
   */
  async blockUser(blockedUserId: string, reason?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedUserId,
          reason: reason || null
        });

      if (error) {
        console.error('Error blocking user:', error);
        throw error;
      }
    } catch (error) {
      console.error('SettingsService.blockUser error:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockedUserId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId);

      if (error) {
        console.error('Error unblocking user:', error);
        throw error;
      }
    } catch (error) {
      console.error('SettingsService.unblockUser error:', error);
      throw error;
    }
  }

  /**
   * Get private photo access list
   */
  async getPrivatePhotoAccessList(): Promise<PrivatePhotoAccess[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('private_photo_access')
        .select(`
          id,
          owner_id,
          granted_to_id,
          granted_at,
          expires_at,
          granted_profile:profiles!private_photo_access_granted_to_id_fkey(
            display_name,
            photos
          )
        `)
        .eq('owner_id', user.id)
        .order('granted_at', { ascending: false });

      if (error) {
        console.error('Error fetching private photo access:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        ownerId: item.owner_id,
        grantedToId: item.granted_to_id,
        grantedAt: item.granted_at,
        expiresAt: item.expires_at || undefined,
        grantedProfile: item.granted_profile ? {
          displayName: item.granted_profile.display_name || 'Unknown User',
          photos: item.granted_profile.photos || []
        } : undefined
      }));
    } catch (error) {
      console.error('SettingsService.getPrivatePhotoAccessList error:', error);
      throw error;
    }
  }

  /**
   * Grant private photo access to a user
   */
  async grantPrivatePhotoAccess(grantToUserId: string, expiresInDays?: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('private_photo_access')
        .insert({
          owner_id: user.id,
          granted_to_id: grantToUserId,
          expires_at: expiresAt
        });

      if (error) {
        console.error('Error granting private photo access:', error);
        throw error;
      }
    } catch (error) {
      console.error('SettingsService.grantPrivatePhotoAccess error:', error);
      throw error;
    }
  }

  /**
   * Revoke private photo access from a user
   */
  async revokePrivatePhotoAccess(grantedToUserId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      const { error } = await supabase
        .from('private_photo_access')
        .delete()
        .eq('owner_id', user.id)
        .eq('granted_to_id', grantedToUserId);

      if (error) {
        console.error('Error revoking private photo access:', error);
        throw error;
      }
    } catch (error) {
      console.error('SettingsService.revokePrivatePhotoAccess error:', error);
      throw error;
    }
  }

  /**
   * Send feedback
   */
  async sendFeedback(feedback: {
    subject: string;
    message: string;
    category: string;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user session found');
      }

      // TODO: Implement feedback submission
      // This could send to a feedback table, email, or external service
      console.log('Feedback submitted:', feedback);
      
      // For now, just log it
      // In production, you'd want to store this in a feedback table
    } catch (error) {
      console.error('SettingsService.sendFeedback error:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
