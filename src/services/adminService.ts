// src/services/adminService.ts
import { supabase } from './supabase';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  profile?: {
    display_name?: string;
    email?: string;
  };
}

export interface UserMembership {
  id: string;
  user_id: string;
  membership_level: 'free' | 'premium' | 'vip' | 'platinum';
  started_at: string;
  expires_at?: string;
  is_active: boolean;
  auto_renew: boolean;
  last_payment_date?: string;
  last_payment_amount?: number;
  next_billing_date?: string;
  payment_method?: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_method?: string;
  transaction_id?: string;
  membership_level?: string;
  billing_period?: string;
  created_at: string;
  completed_at?: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id?: string;
  action_details: any;
  notes?: string;
  created_at: string;
}

export interface UserManagement {
  id: string;
  email: string;
  display_name?: string;
  account_type?: string;
  is_verified?: boolean;
  is_admin?: boolean;
  is_active?: boolean;
  created_at: string;
  last_sign_in_at?: string;
  membership_tier?: 'basic' | 'vip';
  vip_expires_at?: string;
}

export interface ActivitySummary {
  activity_type: string;
  count: number;
}

export interface DailyReport {
  report_date: string;
  total_signups: number;
  total_logins: number;
  total_messages: number;
  total_likes: number;
  total_matches: number;
  total_payments: number;
  active_users: number;
  new_premium_users: number;
}

class AdminService {
  /**
   * Get all user activities with optional filters
   */
  async getUserActivities(
    filters?: {
      userId?: string;
      activityType?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<UserActivity[]> {
    try {
      console.log('[AdminService] Fetching user activities with filters:', filters);

      // Query user_activity_log without joins first
      let query = supabase
        .from('user_activity_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.activityType) {
        query = query.eq('activity_type', filters.activityType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(200);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[AdminService] Query error:', error);
        throw error;
      }

      console.log('[AdminService] Successfully fetched activities:', data?.length, 'records');

      if (!data || data.length === 0) {
        console.log('[AdminService] No activity records found in database');
        return [];
      }

      // Fetch profile data separately if we have activities
      const userIds = [...new Set(data.map(activity => activity.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        if (!profileError && profiles) {
          // Create a map of userId to profile for quick lookup
          const profileMap = new Map(profiles.map(p => [p.id, p]));
          
          // Add profile data to each activity
          return data.map(activity => ({
            ...activity,
            profile: profileMap.get(activity.user_id) || { display_name: 'Unknown User' }
          }));
        }
      }

      return data || [];
    } catch (error) {
      console.error('[AdminService] Error fetching user activities:', error);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  }

  /**
   * Get activity summary for date range
   */
  async getActivitySummary(startDate: string, endDate: string): Promise<ActivitySummary[]> {
    try {
      console.log('[AdminService] Fetching activity summary:', { startDate, endDate });

      const { data, error } = await supabase.rpc('get_activity_summary', {
        start_date: startDate,
        end_date: endDate
      });

      if (error) {
        console.error('[AdminService] RPC error:', error);
        // Return empty array if function doesn't exist
        return [];
      }

      console.log('[AdminService] Activity summary data:', data);
      return data || [];
    } catch (error) {
      console.error('[AdminService] Error fetching activity summary:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Get all users with management info
   */
  async getAllUsers(
    filters?: {
      search?: string;
      membershipLevel?: string;
      isVerified?: boolean;
      limit?: number;
    }
  ): Promise<UserManagement[]> {
    try {
      console.log('[AdminService] Fetching users with filters:', filters);

      // First, get profiles with membership_tier
      let query = supabase
        .from('profiles')
        .select('id, display_name, email, account_type, is_verified, is_admin, is_active, created_at, last_sign_in_at, membership_tier, vip_expires_at')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.ilike('display_name', `%${filters.search}%`);
      }

      if (filters?.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      const { data: profiles, error } = await query;

      console.log('[AdminService] Profiles query result:', { profiles, error, count: profiles?.length });

      if (error) {
        console.error('[AdminService] Query error:', error);
        throw error;
      }

      if (!profiles || profiles.length === 0) {
        console.log('[AdminService] No profiles found, returning empty array');
        return [];
      }

      // Map the data to include all fields (membership_tier is already in profiles)
      const users = profiles.map((user: any) => ({
        id: user.id,
        email: user.email || 'No email',
        display_name: user.display_name,
        account_type: user.account_type,
        is_verified: user.is_verified,
        is_admin: user.is_admin,
        is_active: user.is_active !== false, // Default to true if null
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        membership_tier: user.membership_tier || 'basic',
        vip_expires_at: user.vip_expires_at
      }));

      console.log('[AdminService] Returning users:', users.length);
      return users;
    } catch (error) {
      console.error('[AdminService] Error fetching users:', error);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  }

  /**
   * Get user membership info
   */
  async getUserMembership(userId: string): Promise<UserMembership | null> {
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user membership:', error);
      return null;
    }
  }

  /**
   * Update user membership level
   */
  async updateMembershipLevel(
    userId: string,
    membershipLevel: 'basic' | 'vip',
    expiresAt?: string,
    adminId?: string
  ): Promise<void> {
    try {
      console.log('[AdminService] Updating membership:', { userId, membershipLevel, expiresAt });

      // Use the tier directly
      const tier = membershipLevel;
      
      // Update profiles table with membership_tier
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          membership_tier: tier,
          vip_expires_at: tier === 'vip' && expiresAt ? expiresAt : null
        })
        .eq('id', userId);

      if (profileError) {
        console.error('[AdminService] Profile update error:', profileError);
        throw profileError;
      }

      // For free/basic memberships, cancel any active subscriptions
      if (tier === 'basic') {
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', userId)
          .eq('status', 'active');

        if (subError) {
          console.error('[AdminService] Subscription cancel error:', subError);
          // Don't throw, just log - profile update is what matters
        }
      } else {
        // For VIP memberships, create or update subscription
        const periodEnd = expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Check if subscription exists
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (existingSub) {
          // Update existing subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .update({
              tier: 'vip',
              status: 'active',
              current_period_end: periodEnd
            })
            .eq('id', existingSub.id);

          if (subError) {
            console.error('[AdminService] Subscription update error:', subError);
          }
        } else {
          // Create new subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              tier: 'vip',
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd,
              amount_cents: 1699, // Default monthly
              currency: 'USD'
            });

          if (subError) {
            console.error('[AdminService] Subscription insert error:', subError);
            // Don't throw - profile is already updated
          }
        }
      }

      // Log admin action
      if (adminId) {
        await this.logAdminAction(adminId, 'membership_changed', userId, {
          new_level: membershipLevel,
          expires_at: expiresAt
        });
      }

      console.log('[AdminService] Membership updated successfully');
    } catch (error) {
      console.error('[AdminService] Error updating membership:', error);
      throw error;
    }
  }

  /**
   * Ban or suspend user
   */
  async banUser(
    userId: string,
    adminId: string,
    reason: string,
    permanent: boolean = false
  ): Promise<void> {
    try {
      // Set is_active to false in profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'user_banned', userId, {
        reason,
        permanent,
        banned_at: new Date().toISOString()
      }, reason);

      console.log('[AdminService] User banned successfully');
    } catch (error) {
      console.error('[AdminService] Error banning user:', error);
      throw error;
    }
  }

  /**
   * Unban or lift suspension
   */
  async unbanUser(
    userId: string,
    adminId: string,
    notes?: string
  ): Promise<void> {
    try {
      // Set is_active to true in profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'user_unbanned', userId, {
        unbanned_at: new Date().toISOString()
      }, notes);

      console.log('[AdminService] User unbanned successfully');
    } catch (error) {
      console.error('[AdminService] Error unbanning user:', error);
      throw error;
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId: string, limit = 50): Promise<PaymentHistory[]> {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Reset user password (admin action)
   */
  async resetUserPassword(email: string, adminId: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(adminId, 'password_reset', undefined, {
        email
      }, `Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Log admin action
   */
  async logAdminAction(
    adminId: string,
    actionType: string,
    targetUserId?: string,
    actionDetails?: any,
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_actions_log')
        .insert({
          admin_id: adminId,
          action_type: actionType,
          target_user_id: targetUserId,
          action_details: actionDetails || {},
          notes: notes
        });

      if (error) {
        console.error('[AdminService] Error logging admin action:', error);
        // Don't throw, just log - we don't want to fail the main operation
      }
    } catch (error) {
      console.error('[AdminService] Error in logAdminAction:', error);
    }
  }

  /**
   * Get admin actions log
   */
  async getAdminActions(
    filters?: {
      adminId?: string;
      targetUserId?: string;
      actionType?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<AdminAction[]> {
    try {
      let query = supabase
        .from('admin_actions_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.adminId) {
        query = query.eq('admin_id', filters.adminId);
      }

      if (filters?.targetUserId) {
        query = query.eq('target_user_id', filters.targetUserId);
      }

      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      throw error;
    }
  }

  /**
   * Subscribe to email reports
   */
  async subscribeToEmailReports(
    adminId: string,
    email: string,
    reportType: 'daily' | 'weekly' | 'monthly',
    filters?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_email_reports')
        .upsert({
          admin_id: adminId,
          email,
          report_type: reportType,
          filters,
          is_active: true
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error subscribing to email reports:', error);
      throw error;
    }
  }

  /**
   * Get daily report
   */
  async getDailyReport(date: string): Promise<DailyReport | null> {
    try {
      console.log('[AdminService] Fetching daily report for date:', date);

      const { data, error } = await supabase
        .from('daily_activity_reports')
        .select('*')
        .eq('report_date', date)
        .maybeSingle();

      if (error) {
        console.error('[AdminService] Daily report error:', error);
        return null;
      }

      console.log('[AdminService] Daily report data:', data);
      return data;
    } catch (error) {
      console.error('[AdminService] Error fetching daily report:', error);
      return null;
    }
  }

  /**
   * Generate activity report for date range
   */
  async generateActivityReport(startDate: string, endDate: string): Promise<any> {
    try {
      const activities = await this.getUserActivities({ startDate, endDate, limit: 10000 });
      const summary = await this.getActivitySummary(startDate, endDate);

      // Group by type
      const grouped = summary.reduce((acc: any, item) => {
        acc[item.activity_type] = item.count;
        return acc;
      }, {});

      return {
        period: { start: startDate, end: endDate },
        total_activities: activities.length,
        by_type: grouped,
        activities: activities.slice(0, 100) // Return first 100 for preview
      };
    } catch (error) {
      console.error('Error generating activity report:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
