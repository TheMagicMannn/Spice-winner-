// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/Input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { SpiceBackground } from '@/components/SpiceComponents';
import { verificationService } from '@/services/verificationService';
import { adminService } from '@/services/adminService';
import {
  Shield,
  Users,
  Activity,
  DollarSign,
  Settings,
  Download,
  Mail,
  Search,
  Filter,
  Calendar,
  BarChart3,
  UserCheck,
  CreditCard,
  Key,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      const adminStatus = await verificationService.isAdmin(user.id);
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        navigate('/profile');
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      navigate('/profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SpiceBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      </SpiceBackground>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SpiceBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Shield className="h-8 w-8 text-pink-500" />
                  Admin Dashboard
                </h1>
                <p className="text-white/70 mt-1">
                  Comprehensive administration and monitoring
                </p>
              </div>
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="border-pink-500/30 text-white hover:bg-pink-500/10"
              >
                Back to Profile
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-900 border border-pink-500/30 p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="verification"
                className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-white"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Verification
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-white"
              >
                <Activity className="h-4 w-4 mr-2" />
                Activity Log
              </TabsTrigger>
              <TabsTrigger
                value="memberships"
                className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-white"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Memberships
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <OverviewTab />
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6">
              <Button
                onClick={() => navigate('/admin/verification')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Go to Verification Panel
              </Button>
              <Card className="bg-gray-900/50 border-pink-500/30">
                <CardHeader>
                  <CardTitle className="text-white">User Verification</CardTitle>
                  <CardDescription className="text-white/70">
                    Manage user verification requests and approvals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60">
                    Click the button above to access the full verification panel where you can
                    review and approve user verification requests.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <UsersManagementTab />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <ActivityLogTab />
            </TabsContent>

            {/* Memberships Tab */}
            <TabsContent value="memberships" className="space-y-6">
              <MembershipsTab />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <ReportsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SpiceBackground>
  );
};

// Overview Tab Component
const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      
      const [todayReport, monthActivities] = await Promise.all([
        adminService.getDailyReport(today),
        adminService.getActivitySummary(startOfMonth, new Date().toISOString())
      ]);

      setStats({ todayReport, monthActivities });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gray-900/50 border-pink-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white/70 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Today's Signups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {stats?.todayReport?.total_signups || 0}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-pink-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white/70 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Today's Logins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {stats?.todayReport?.total_logins || 0}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-pink-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white/70 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Today's Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {stats?.todayReport?.total_messages || 0}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-pink-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white/70 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Today's Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            ${stats?.todayReport?.total_payments?.toFixed(2) || '0.00'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Import other tab components
import { UsersManagementTab } from '@/components/admin/UsersManagementTab';
import { ActivityLogTab } from '@/components/admin/ActivityLogTab';
import { MembershipsTab } from '@/components/admin/MembershipsTab';
import { ReportsTab } from '@/components/admin/ReportsTab';
