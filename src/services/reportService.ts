// src/services/reportService.ts
import { supabase } from './supabase';

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  reporter?: {
    display_name?: string;
    email?: string;
  };
  reported?: {
    display_name?: string;
    email?: string;
  };
}

class ReportService {
  /**
   * Submit a user report
   */
  async submitReport(
    reporterId: string,
    reportedId: string,
    reason: string,
    description?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: reporterId,
          reported_user_id: reportedId,
          reason,
          description,
          status: 'pending'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  }

  /**
   * Get all reports with filters (admin only)
   */
  async getReports(
    filters?: {
      status?: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
      reporterId?: string;
      reportedId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<UserReport[]> {
    try {
      console.log('[ReportService] Fetching reports with filters:', filters);

      // Query user_reports without joins first
      let query = supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.reporterId) {
        query = query.eq('reporter_id', filters.reporterId);
      }

      if (filters?.reportedId) {
        query = query.eq('reported_user_id', filters.reportedId);
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
        console.error('[ReportService] Query error:', error);
        throw error;
      }

      console.log('[ReportService] Successfully fetched reports:', data?.length);

      // Fetch profile data separately if we have reports
      if (data && data.length > 0) {
        const reporterIds = [...new Set(data.map(report => report.reporter_id).filter(Boolean))];
        const reportedIds = [...new Set(data.map(report => report.reported_user_id).filter(Boolean))];
        const allUserIds = [...new Set([...reporterIds, ...reportedIds])];
        
        if (allUserIds.length > 0) {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', allUserIds);

          if (!profileError && profiles) {
            // Create a map of userId to profile for quick lookup
            const profileMap = new Map(profiles.map(p => [p.id, p]));
            
            // Add profile data to each report
            return data.map(report => ({
              ...report,
              reporter: profileMap.get(report.reporter_id) || null,
              reported: profileMap.get(report.reported_user_id) || null
            }));
          }
        }
      }

      return data || [];
    } catch (error) {
      console.error('[ReportService] Error fetching reports:', error);
      // Return empty array to prevent UI crash
      return [];
    }
  }

  /**
   * Update report status (admin only)
   */
  async updateReportStatus(
    reportId: string,
    status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed',
    adminId: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      console.log('[ReportService] Updating report status:', {
        reportId,
        status,
        adminId,
        adminNotes
      });

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // Only add optional fields if they have values
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (adminId) {
        updateData.reviewed_by = adminId;
        updateData.reviewed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_reports')
        .update(updateData)
        .eq('id', reportId)
        .select();

      if (error) {
        console.error('[ReportService] Update error:', error);
        throw new Error(`Failed to update report: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Report not found or you do not have permission to update it');
      }

      console.log('[ReportService] Report updated successfully:', data);
    } catch (error: any) {
      console.error('[ReportService] Error updating report status:', error);
      throw error;
    }
  }

  /**
   * Get report count by status
   */
  async getReportCounts(): Promise<{
    pending: number;
    reviewed: number;
    resolved: number;
    dismissed: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('status');

      if (error) throw error;

      const counts = {
        pending: 0,
        reviewed: 0,
        resolved: 0,
        dismissed: 0
      };

      data?.forEach((report: any) => {
        if (report.status in counts) {
          counts[report.status as keyof typeof counts]++;
        }
      });

      return counts;
    } catch (error) {
      console.error('Error fetching report counts:', error);
      return {
        pending: 0,
        reviewed: 0,
        resolved: 0,
        dismissed: 0
      };
    }
  }
}

export const reportService = new ReportService();
