// src/components/admin/MembershipsTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { adminService, UserManagement } from '@/services/adminService';
import { useAuth } from '@/hooks/useAuth';
import {
  CreditCard,
  Crown,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

export const MembershipsTab: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    free: 0,
    premium: 0,
    vip: 0,
    platinum: 0
  });

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers({ limit: 200 });
      setUsers(data);

      // Calculate stats
      const newStats = { free: 0, premium: 0, vip: 0, platinum: 0 };
      data.forEach((u) => {
        const level = u.membership_level || 'free';
        if (level in newStats) {
          newStats[level as keyof typeof newStats]++;
        }
      });
      setStats(newStats);
    } catch (error) {
      console.error('Error loading memberships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMembership = async (
    userId: string,
    level: 'free' | 'premium' | 'vip' | 'platinum'
  ) => {
    if (!user || !confirm(`Update membership level to ${level}?`)) return;

    try {
      const expiresAt = level !== 'free'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await adminService.updateMembershipLevel(userId, level, expiresAt, user.id);
      alert('Membership level updated successfully!');
      loadMemberships();
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership level.');
    }
  };

  const getMembershipColor = (level?: string) => {
    switch (level) {
      case 'platinum':
        return 'bg-gray-300 text-gray-900';
      case 'vip':
        return 'bg-purple-500/20 text-purple-300';
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-pink-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white/70 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Free Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.free}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-yellow-300 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-300">{stats.premium}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              VIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-300">{stats.vip}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-300/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Platinum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-300">{stats.platinum}</div>
          </CardContent>
        </Card>
      </div>

      {/* Memberships List */}
      <Card className="bg-gray-900/50 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            All Memberships
          </CardTitle>
          <CardDescription className="text-white/70">
            Manage user membership levels and subscriptions
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {users
          .filter((u) => u.membership_level && u.membership_level !== 'free')
          .map((userData) => (
            <Card key={userData.id} className="bg-gray-900/50 border-pink-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {userData.display_name || 'No Name'}
                      </h3>
                      <Badge className={getMembershipColor(userData.membership_level)}>
                        <Crown className="h-3 w-3 mr-1" />
                        {userData.membership_level}
                      </Badge>
                      {userData.is_verified && (
                        <Badge className="bg-blue-500/20 text-blue-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-white/60">
                      {userData.email}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {format(new Date(userData.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <select
                      value={userData.membership_level || 'free'}
                      onChange={(e) =>
                        handleUpdateMembership(userData.id, e.target.value as any)
                      }
                      className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {users.filter((u) => u.membership_level && u.membership_level !== 'free').length === 0 && (
          <Card className="bg-gray-900/50 border-pink-500/30">
            <CardContent className="p-8 text-center">
              <p className="text-white/60">No paid memberships found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
