// src/services/reportService.ts
import { supabase } from './supabase';

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
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
          reported_id: reportedId,
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
      status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
      reporterId?: string;
      reportedId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<UserReport[]> {
    try {
      let query = supabase
        .from('user_reports')
        .select(`
          *,
          reporter:profiles!user_reports_reporter_id_fkey (
            display_name
          ),
          reported:profiles!user_reports_reported_id_fkey (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.reporterId) {
        query = query.eq('reporter_id', filters.reporterId);
      }

      if (filters?.reportedId) {
        query = query.eq('reported_id', filters.reportedId);
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
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Update report status (admin only)
   */
  async updateReportStatus(
    reportId: string,
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
    adminId: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating report status:', error);
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
