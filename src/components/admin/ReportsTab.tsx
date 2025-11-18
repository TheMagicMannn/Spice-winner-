// src/components/admin/ReportsTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { reportService, UserReport } from '@/services/reportService';
import { adminService } from '@/services/adminService';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Filter,
  Calendar,
  User,
  Flag,
  MessageSquare
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export const ReportsTab: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'action_taken' | 'dismissed'>('all');
  const [reportCounts, setReportCounts] = useState({
    pending: 0,
    reviewed: 0,
    action_taken: 0,
    dismissed: 0
  });
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReports();
    loadReportCounts();

    // Setup realtime subscription for user_reports table
    const reportsSubscription = supabase
      .channel('admin-reports-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_reports'
        },
        (payload) => {
          console.log('Report change detected:', payload);
          loadReports();
          loadReportCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reportsSubscription);
    };
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        startDate: dateRange.start,
        endDate: new Date(dateRange.end).toISOString(),
        limit: 200
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const data = await reportService.getReports(filters);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportCounts = async () => {
    try {
      const counts = await reportService.getReportCounts();
      setReportCounts(counts);
    } catch (error) {
      console.error('Error loading report counts:', error);
    }
  };

  const handleUpdateStatus = async (
    reportId: string,
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  ) => {
    if (!user) {
      alert('You must be logged in to update reports');
      return;
    }

    setIsUpdating(true);
    try {
      console.log('[ReportsTab] Updating report:', { reportId, status, userId: user.id });
      await reportService.updateReportStatus(reportId, status, user.id, adminNotes);
      alert('Report status updated successfully!');
      setSelectedReport(null);
      setAdminNotes('');
      loadReports();
      loadReportCounts();
    } catch (error: any) {
      console.error('[ReportsTab] Error updating report status:', error);
      const errorMessage = error?.message || 'Failed to update report status. Please check your permissions.';
      alert(`Failed to update report: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const generateReport = async () => {
    try {
      const report = await adminService.generateActivityReport(
        dateRange.start,
        new Date(dateRange.end).toISOString()
      );

      // Create downloadable JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-report-${dateRange.start}-to-${dateRange.end}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-300';
      case 'resolved':
        return 'bg-green-500/20 text-green-300';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewed':
        return <Eye className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-yellow-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-300">{reportCounts.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">{reportCounts.reviewed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-300">{reportCounts.resolved}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Dismissed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-300">{reportCounts.dismissed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900/50 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flag className="h-5 w-5" />
            User Reports & Activity Reports
          </CardTitle>
          <CardDescription className="text-white/70 flex items-center gap-2">
            Review user reports and generate activity reports •
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live updates enabled
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              >
                <option value="all">All Reports</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={loadReports}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <Button
              onClick={generateReport}
              variant="outline"
              className="border-pink-500/30 text-white hover:bg-pink-500/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Activity Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-white/70 text-sm">
            Showing {reports.length} user reports
          </div>

          {reports.map((report) => (
            <Card key={report.id} className="bg-gray-900/50 border-pink-500/30">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status}</span>
                        </Badge>
                        <span className="text-sm text-white/60">
                          {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white">
                          <User className="h-4 w-4 text-red-400" />
                          <span className="font-medium">Reporter:</span>
                          <span>{report.reporter?.display_name || 'Unknown'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-white">
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          <span className="font-medium">Reported User:</span>
                          <span>{report.reported?.display_name || 'Unknown'}</span>
                        </div>

                        <div className="flex items-start gap-2 text-white">
                          <Flag className="h-4 w-4 text-pink-400 mt-1" />
                          <div>
                            <span className="font-medium">Reason:</span>
                            <div className="mt-1 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                              <p className="text-red-200 font-medium">{report.reason}</p>
                            </div>
                          </div>
                        </div>

                        {report.description && (
                          <div className="flex items-start gap-2 text-white">
                            <MessageSquare className="h-4 w-4 text-blue-400 mt-1" />
                            <div>
                              <span className="font-medium">Description:</span>
                              <p className="text-white/70 mt-1">{report.description}</p>
                            </div>
                          </div>
                        )}

                        {report.admin_notes && (
                          <div className="mt-2 bg-gray-800/50 rounded-lg p-3">
                            <p className="text-sm text-white/70">
                              <span className="font-medium">Admin Notes:</span> {report.admin_notes}
                            </p>
                            {report.reviewed_at && (
                              <p className="text-xs text-white/50 mt-1">
                                Reviewed {format(new Date(report.reviewed_at), 'MMM d, yyyy HH:mm')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {report.status === 'pending' && (
                      <Button
                        onClick={() => setSelectedReport(report)}
                        size="sm"
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      >
                        Review
                      </Button>
                    )}
                  </div>

                  {/* Review Panel */}
                  {selectedReport?.id === report.id && (
                    <div className="border-t border-gray-800 pt-4 space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-white mb-2 block">
                          Admin Notes
                        </label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add notes about this report..."
                          rows={3}
                          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                          disabled={isUpdating}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Mark Reviewed
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(report.id, 'resolved')}
                          disabled={isUpdating}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                          disabled={isUpdating}
                          className="flex-1 bg-gray-600 hover:bg-gray-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedReport(null);
                            setAdminNotes('');
                          }}
                          disabled={isUpdating}
                          variant="outline"
                          className="border-gray-700 text-white hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {reports.length === 0 && (
            <Card className="bg-gray-900/50 border-pink-500/30">
              <CardContent className="p-8 text-center">
                <Flag className="h-12 w-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">No user reports found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
