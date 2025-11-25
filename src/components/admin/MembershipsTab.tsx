// src/components/admin/MembershipsTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { adminService, UserManagement } from '@/services/adminService';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  CreditCard,
  Crown,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  Edit2,
  Save,
  X as XIcon,
  RefreshCw
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface EditMembership {
  userId: string;
  level: 'basic' | 'vip';
  expiresAt?: string;
  autoRenew: boolean;
}

export const MembershipsTab: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMembership, setEditingMembership] = useState<EditMembership | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState({
    basic: 0,
    vip: 0
  });

  useEffect(() => {
    loadMemberships();

    // Setup realtime subscription for profiles membership_tier changes
    const profilesSubscription = supabase
      .channel('admin-profiles-membership')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'membership_tier=neq.null'
        },
        (payload) => {
          console.log('Profile membership change:', payload);
          loadMemberships();
        }
      )
      .subscribe();

    // Also subscribe to subscriptions table changes
    const subscriptionsSubscription = supabase
      .channel('admin-subscriptions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        (payload) => {
          console.log('Subscription change detected:', payload);
          loadMemberships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(subscriptionsSubscription);
    };
  }, []);

  const loadMemberships = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers({ limit: 200 });
      console.log('[MembershipsTab] Loaded users:', data.length);
      console.log('[MembershipsTab] First 3 users:', data.slice(0, 3).map(u => ({
        id: u.id,
        email: u.email,
        membership_tier: u.membership_tier,
        vip_expires_at: u.vip_expires_at
      })));
      setUsers(data);

      // Calculate stats based on membership_tier from profiles
      const newStats = { basic: 0, vip: 0 };
      data.forEach((u) => {
        const tier = u.membership_tier || 'basic';
        if (tier === 'vip') {
          newStats.vip++;
        } else {
          newStats.basic++;
        }
      });
      console.log('[MembershipsTab] Stats:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Error loading memberships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (userData: UserManagement) => {
    setEditingMembership({
      userId: userData.id,
      level: (userData.membership_tier || 'basic') as 'basic' | 'vip',
      expiresAt: userData.vip_expires_at || '',
      autoRenew: false
    });
  };

  const cancelEditing = () => {
    setEditingMembership(null);
  };

  const saveMembership = async () => {
    if (!user || !editingMembership) return;

    setIsUpdating(true);
    try {
      const expiresAt = editingMembership.level === 'vip' && editingMembership.expiresAt
        ? editingMembership.expiresAt
        : editingMembership.level === 'vip'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      // Update membership
      await adminService.updateMembershipLevel(
        editingMembership.userId,
        editingMembership.level,
        expiresAt,
        user.id
      );

      // No need to update auto_renew for the new system

      alert('Membership updated successfully!');
      cancelEditing();
      loadMemberships();
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickUpdate = async (
    userId: string,
    level: 'basic' | 'vip'
  ) => {
    if (!user || !confirm(`Update membership level to ${level}?`)) return;

    setIsUpdating(true);
    try {
      const expiresAt = level === 'vip'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await adminService.updateMembershipLevel(userId, level, expiresAt, user.id);
      loadMemberships();
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership level.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getMembershipColor = (tier?: string) => {
    switch (tier) {
      case 'vip':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'basic':
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
              Basic (Free) Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.basic}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              VIP Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-300">{stats.vip}</div>
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
          <CardDescription className="text-white/70 flex items-center gap-2">
            Manage user membership levels and subscriptions •
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live sync enabled
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={loadMemberships}
            variant="outline"
            size="sm"
            className="border-pink-500/30 text-white hover:bg-pink-500/10"
            disabled={isUpdating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="text-white/70 text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Showing {users.length} users (Auto-updating)
        </div>

        {users.map((userData) => {
          const isEditing = editingMembership?.userId === userData.id;

          return (
            <Card key={userData.id} className="bg-gray-900/50 border-pink-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {userData.display_name || 'No Name'}
                      </h3>
                      <Badge className={getMembershipColor(userData.membership_tier)}>
                        <Crown className="h-3 w-3 mr-1" />
                        {userData.membership_tier === 'vip' ? 'VIP' : 'Basic'}
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

                    {/* Edit Form */}
                    {isEditing && editingMembership && (
                      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg space-y-3">
                        <div>
                          <label className="text-sm text-white/70 mb-1 block">Membership Level</label>
                          <select
                            value={editingMembership.level}
                            onChange={(e) => setEditingMembership({
                              ...editingMembership,
                              level: e.target.value as 'basic' | 'vip'
                            })}
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                          >
                            <option value="basic">Basic (Free)</option>
                            <option value="vip">VIP</option>
                          </select>
                        </div>

                        {editingMembership.level === 'vip' && (
                          <>
                            <div>
                              <label className="text-sm text-white/70 mb-1 block">Expires At</label>
                              <Input
                                type="date"
                                value={editingMembership.expiresAt}
                                onChange={(e) => setEditingMembership({
                                  ...editingMembership,
                                  expiresAt: e.target.value
                                })}
                                className="bg-gray-800 border-gray-700 text-white"
                                placeholder="Leave empty for 30 days from now"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`autorenew-${userData.id}`}
                                checked={editingMembership.autoRenew}
                                onChange={(e) => setEditingMembership({
                                  ...editingMembership,
                                  autoRenew: e.target.checked
                                })}
                                className="rounded border-gray-700"
                              />
                              <label htmlFor={`autorenew-${userData.id}`} className="text-sm text-white/70">
                                Auto-renew subscription
                              </label>
                            </div>
                          </>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={saveMembership}
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save Changes
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            variant="outline"
                            disabled={isUpdating}
                            className="border-gray-700 text-white hover:bg-gray-800"
                          >
                            <XIcon className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {!isEditing ? (
                      <>
                        <Button
                          onClick={() => startEditing(userData)}
                          size="sm"
                          disabled={isUpdating}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <select
                          value={userData.membership_tier || 'basic'}
                          onChange={(e) => handleQuickUpdate(userData.id, e.target.value as 'basic' | 'vip')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 text-sm rounded-md bg-gray-800 border border-gray-700 text-white"
                        >
                          <option value="basic">Basic (Free)</option>
                          <option value="vip">VIP</option>
                        </select>
                      </>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {users.length === 0 && (
          <Card className="bg-gray-900/50 border-pink-500/30">
            <CardContent className="p-8 text-center">
              <p className="text-white/60">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
