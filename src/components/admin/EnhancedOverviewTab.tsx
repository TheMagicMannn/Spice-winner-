// src/components/admin/EnhancedOverviewTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/Spinner';
import { adminService } from '@/services/adminService';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  Activity,
  Mail,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus,
  LogIn,
  Heart,
  MessageSquare,
  Crown
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="bg-gray-900/50 border-pink-500/30 overflow-hidden relative group hover:border-pink-500/50 transition-all">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-white/60 mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${
                isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
              }`}>
                {isPositive && <TrendingUp className="h-4 w-4" />}
                {isNegative && <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(change)}% vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-20`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EnhancedOverviewTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('[EnhancedOverviewTab] Loading stats for today:', today);
      
      // Get today's report (now fetches real-time data)
      const todayReport = await adminService.getDailyReport(today);
      console.log('[EnhancedOverviewTab] Today report:', todayReport);
      
      // Get overall platform stats
      const platformStats = await adminService.getOverallStats();
      console.log('[EnhancedOverviewTab] Platform stats:', platformStats);
      
      // Get last 7 days for chart
      const chartDataPromises = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        chartDataPromises.push(adminService.getDailyReport(dateStr));
      }
      
      const weekReports = await Promise.all(chartDataPromises);
      console.log('[EnhancedOverviewTab] Week reports:', weekReports);
      
      // Transform data for charts
      const formattedChartData = weekReports.map((report, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          signups: report?.total_signups || 0,
          logins: report?.total_logins || 0,
          messages: report?.total_messages || 0,
          matches: report?.total_matches || 0,
          revenue: report?.total_payments || 0
        };
      });

      console.log('[EnhancedOverviewTab] Formatted chart data:', formattedChartData);

      setChartData(formattedChartData);
      setStats({ todayReport });
      setOverallStats(platformStats);
    } catch (error) {
      console.error('[EnhancedOverviewTab] Error loading stats:', error);
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

  const todayStats = stats?.todayReport || {};
  const hasNoData = !stats?.todayReport && chartData.every(d => 
    d.signups === 0 && d.logins === 0 && d.messages === 0 && d.matches === 0
  );
  
  // Check if today has zero activity
  const todayHasZeroActivity = 
    (todayStats.total_signups || 0) === 0 &&
    (todayStats.total_logins || 0) === 0 &&
    (todayStats.total_messages || 0) === 0 &&
    (todayStats.total_matches || 0) === 0;
  
  // Calculate changes from yesterday
  const yesterdayData = chartData.length >= 2 ? chartData[chartData.length - 2] : null;
  const calculateChange = (today: number, yesterday: number) => {
    if (yesterday === 0) return 0;
    return Math.round(((today - yesterday) / yesterday) * 100);
  };
  
  const changes = {
    signups: yesterdayData ? calculateChange(todayStats.total_signups || 0, yesterdayData.signups) : 0,
    logins: yesterdayData ? calculateChange(todayStats.total_logins || 0, yesterdayData.logins) : 0,
    messages: yesterdayData ? calculateChange(todayStats.total_messages || 0, yesterdayData.messages) : 0,
    vipMembers: 0 // VIP members change - can be calculated if needed
  };

  // Pie chart data for activity distribution
  const activityDistribution = [
    { name: 'Messages', value: todayStats.total_messages || 0, color: '#ec4899' },
    { name: 'Likes', value: todayStats.total_likes || 0, color: '#f472b6' },
    { name: 'Matches', value: todayStats.total_matches || 0, color: '#a855f7' },
    { name: 'Signups', value: todayStats.total_signups || 0, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Platform Stats Card - Show when today has zero activity */}
      {todayHasZeroActivity && overallStats && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Activity className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  📊 Platform Overview (All-Time Stats)
                </h3>
                <p className="text-sm text-blue-300/80 mb-4">
                  No activity recorded for today yet. Here are your overall platform statistics:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300/70 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-white">{overallStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300/70 mb-1">Total Messages</p>
                    <p className="text-2xl font-bold text-white">{overallStats.totalMessages.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300/70 mb-1">Total Matches</p>
                    <p className="text-2xl font-bold text-white">{overallStats.totalMatches.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300/70 mb-1">Total Likes</p>
                    <p className="text-2xl font-bold text-white">{overallStats.totalLikes.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300/70 mb-1">Active Users (30d)</p>
                    <p className="text-2xl font-bold text-white">{overallStats.activeUsers.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300/70 mb-1">VIP Members</p>
                    <p className="text-2xl font-bold text-white">{overallStats.vipUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Database Setup Alert - Only show if NO data at all */}
      {hasNoData && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Activity className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  ⚠️ No Historical Data Available
                </h3>
                <p className="text-sm text-yellow-300/80 mb-3">
                  The dashboard is now fetching real-time data directly from your database tables. 
                  Charts will populate as users interact with your platform.
                </p>
                <p className="text-xs text-yellow-300/70 mt-3">
                  💡 Tip: The dashboard now shows live statistics from profiles, messages, matches, and likes tables.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Signups"
          value={todayStats.total_signups || 0}
          change={changes.signups}
          icon={<UserPlus className="h-6 w-6 text-green-400" />}
          color="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Today's Logins"
          value={todayStats.total_logins || 0}
          change={changes.logins}
          icon={<LogIn className="h-6 w-6 text-blue-400" />}
          color="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Today's Messages"
          value={todayStats.total_messages || 0}
          change={changes.messages}
          icon={<MessageSquare className="h-6 w-6 text-purple-400" />}
          color="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="New VIP Members"
          value={todayStats.new_premium_users || 0}
          change={changes.vipMembers}
          icon={<Crown className="h-6 w-6 text-yellow-400" />}
          color="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Trend */}
        <Card className="bg-gray-900/50 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-pink-400" />
              User Activity Trend (7 Days)
            </CardTitle>
            <CardDescription className="text-white/70">
              Daily signups and logins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #ec4899',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="#ec4899"
                  fillOpacity={1}
                  fill="url(#colorSignups)"
                  name="Signups"
                />
                <Area
                  type="monotone"
                  dataKey="logins"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorLogins)"
                  name="Logins"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card className="bg-gray-900/50 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-400" />
              Engagement Metrics (7 Days)
            </CardTitle>
            <CardDescription className="text-white/70">
              Messages and matches activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #ec4899',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="messages" fill="#ec4899" name="Messages" radius={[8, 8, 0, 0]} />
                <Bar dataKey="matches" fill="#a855f7" name="Matches" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-gray-900/50 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-400" />
              Revenue Trend (7 Days)
            </CardTitle>
            <CardDescription className="text-white/70">
              Daily revenue generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #fbbf24',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => `$${value.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ fill: '#fbbf24', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Distribution */}
        <Card className="bg-gray-900/50 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-pink-400" />
              Today's Activity Distribution
            </CardTitle>
            <CardDescription className="text-white/70">
              Breakdown of user activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #ec4899',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/50 border-pink-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Active Users</p>
                <h3 className="text-2xl font-bold text-white">{todayStats.active_users || 0}</h3>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-pink-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Matches</p>
                <h3 className="text-2xl font-bold text-white">{todayStats.total_matches || 0}</h3>
              </div>
              <Heart className="h-8 w-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-pink-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">New Premium Users</p>
                <h3 className="text-2xl font-bold text-white">{todayStats.new_premium_users || 0}</h3>
              </div>
              <Crown className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
