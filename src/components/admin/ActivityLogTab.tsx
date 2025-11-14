// src/components/admin/ActivityLogTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { adminService, UserActivity } from '@/services/adminService';
import {
  Activity,
  Filter,
  Calendar,
  User,
  MessageSquare,
  Heart,
  UserPlus,
  LogIn,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export const ActivityLogTab: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        startDate: dateRange.start,
        endDate: new Date(dateRange.end).toISOString(),
        limit: 200
      };

      if (selectedType !== 'all') {
        filters.activityType = selectedType;
      }

      const data = await adminService.getUserActivities(filters);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <UserPlus className="h-4 w-4" />;
      case 'user_login':
        return <LogIn className="h-4 w-4" />;
      case 'message_sent':
        return <MessageSquare className="h-4 w-4" />;
      case 'profile_liked':
        return <Heart className="h-4 w-4" />;
      case 'payment_completed':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_signup':
        return 'bg-green-500/20 text-green-300';
      case 'user_login':
        return 'bg-blue-500/20 text-blue-300';
      case 'message_sent':
        return 'bg-purple-500/20 text-purple-300';
      case 'profile_liked':
        return 'bg-pink-500/20 text-pink-300';
      case 'payment_completed':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'user_signup', label: 'Signups' },
    { value: 'user_login', label: 'Logins' },
    { value: 'message_sent', label: 'Messages' },
    { value: 'profile_liked', label: 'Likes' },
    { value: 'payment_completed', label: 'Payments' }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gray-900/50 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription className="text-white/70">
            Monitor user activities across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="text-sm text-white/70 mb-1 block">Activity Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={loadActivities}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Activities List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-white/70 text-sm">
            Showing {activities.length} activities
          </div>

          {activities.map((activity) => (
            <Card key={activity.id} className="bg-gray-900/50 border-pink-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActivityColor(activity.activity_type)}>
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-white/60">
                        {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm:ss')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-white">
                      <User className="h-4 w-4" />
                      <span>{activity.profile?.display_name || 'Unknown User'}</span>
                    </div>

                    {activity.activity_data && (
                      <div className="mt-2 text-sm text-white/60">
                        <pre className="bg-gray-800/50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(activity.activity_data, null, 2)}
                        </pre>
                      </div>
                    )}

                    {activity.ip_address && (
                      <div className="mt-2 text-xs text-white/40">
                        IP: {activity.ip_address}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {activities.length === 0 && (
            <Card className="bg-gray-900/50 border-pink-500/30">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">No activities found for the selected filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
