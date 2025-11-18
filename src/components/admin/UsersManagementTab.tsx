// src/components/admin/UsersManagementTab.tsx
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
  Search,
  Mail,
  Calendar,
  Shield,
  User,
  CheckCircle2,
  XCircle,
  Key,
  Crown,
  Edit2,
  Save,
  X as XIcon,
  Trash2,
  Ban,
  UserX,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';

export const UsersManagementTab: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UserManagement>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
    
    // Setup realtime subscription for profiles table
    const profilesSubscription = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          // Reload users on any profile change
          loadUsers();
        }
      )
      .subscribe();

    // Setup realtime subscription for user_memberships table
    const membershipsSubscription = supabase
      .channel('admin-memberships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_memberships'
        },
        (payload) => {
          console.log('Membership change detected:', payload);
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(membershipsSubscription);
    };
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers({ limit: 100 });
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers({
        search: searchQuery,
        limit: 100
      });
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (userData: UserManagement) => {
    setEditingUserId(userData.id);
    setEditData({
      display_name: userData.display_name,
      is_verified: userData.is_verified,
      is_admin: userData.is_admin,
      membership_level: userData.membership_level
    });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditData({});
  };

  const saveUserChanges = async (userId: string) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      // Update profile fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: editData.display_name,
          is_verified: editData.is_verified,
          is_admin: editData.is_admin,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update membership if changed
      if (editData.membership_level) {
        const expiresAt = editData.membership_level !== 'free'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

        await adminService.updateMembershipLevel(
          userId,
          editData.membership_level as any,
          expiresAt,
          user.id
        );
      }

      alert('User updated successfully!');
      cancelEditing();
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!user || !confirm(`Send password reset email to ${email}?`)) return;

    setIsUpdating(true);
    try {
      await adminService.resetUserPassword(email, user.id);
      alert('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to send password reset email.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleVerified = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Unverify' : 'Verify'} this user?`)) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error toggling verification:', error);
      alert('Failed to update verification status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Remove' : 'Grant'} admin access for this user?`)) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('Failed to update admin status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBanUser = async (userId: string, displayName: string) => {
    const reason = prompt(`Why are you banning ${displayName}?`);
    if (!reason || !user) return;

    const permanent = confirm('Is this a permanent ban? (Click OK for permanent, Cancel for temporary suspension)');

    setIsUpdating(true);
    try {
      await adminService.banUser(userId, user.id, reason, permanent);
      alert(`User ${permanent ? 'banned' : 'suspended'} successfully!`);
      loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnbanUser = async (userId: string, displayName: string) => {
    if (!confirm(`Lift ban/suspension for ${displayName}?`) || !user) return;

    const notes = prompt('Add notes (optional):');

    setIsUpdating(true);
    try {
      await adminService.unbanUser(userId, user.id, notes || undefined);
      alert('Ban/suspension lifted successfully!');
      loadUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user.');
    } finally {
      setIsUpdating(false);
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
      {/* Search Bar */}
      <Card className="bg-gray-900/50 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription className="text-white/70">
            Search and manage user accounts • Realtime sync enabled ✨
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by display name..."
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        <div className="text-white/70 text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Showing {users.length} users (Live updates enabled)
        </div>

        {users.map((userData) => {
          const isEditing = editingUserId === userData.id;

          return (
            <Card key={userData.id} className="bg-gray-900/50 border-pink-500/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Display Name */}
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <Input
                          value={editData.display_name || ''}
                          onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                          className="max-w-xs bg-gray-800 border-gray-700 text-white"
                          placeholder="Display name"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-white">
                          {userData.display_name || 'No Name'}
                        </h3>
                      )}

                      {/* Verification Badge */}
                      {isEditing ? (
                        <button
                          onClick={() => setEditData({ ...editData, is_verified: !editData.is_verified })}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            editData.is_verified
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {editData.is_verified ? 'Verified' : 'Not Verified'}
                        </button>
                      ) : (
                        userData.is_verified && (
                          <Badge className="bg-blue-500/20 text-blue-300 cursor-pointer"
                                 onClick={() => toggleVerified(userData.id, userData.is_verified || false)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )
                      )}

                      {/* Admin Badge */}
                      {isEditing ? (
                        <button
                          onClick={() => setEditData({ ...editData, is_admin: !editData.is_admin })}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            editData.is_admin
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {editData.is_admin ? 'Admin' : 'Not Admin'}
                        </button>
                      ) : (
                        userData.is_admin && (
                          <Badge className="bg-red-500/20 text-red-300 cursor-pointer"
                                 onClick={() => toggleAdmin(userData.id, userData.is_admin || false)}>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )
                      )}

                      {/* Membership Badge */}
                      {isEditing ? (
                        <select
                          value={editData.membership_level || 'free'}
                          onChange={(e) => setEditData({ ...editData, membership_level: e.target.value })}
                          className="px-3 py-1 rounded-full text-xs bg-gray-800 border border-gray-700 text-white"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                          <option value="vip">VIP</option>
                          <option value="platinum">Platinum</option>
                        </select>
                      ) : (
                        <Badge className={getMembershipColor(userData.membership_level)}>
                          <Crown className="h-3 w-3 mr-1" />
                          {userData.membership_level || 'free'}
                        </Badge>
                      )}

                      {/* Ban/Suspension Status */}
                      {!userData.is_active && (
                        <Badge className="bg-red-500/20 text-red-300">
                          <Ban className="h-3 w-3 mr-1" />
                          Banned
                        </Badge>
                      )}
                    </div>

                    {/* User Details */}
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {userData.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {format(new Date(userData.created_at), 'MMM d, yyyy')}
                      </div>
                      {userData.last_sign_in_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last seen {format(new Date(userData.last_sign_in_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-white/50">
                      User ID: {userData.id}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => saveUserChanges(userData.id)}
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                          className="border-gray-700 text-white hover:bg-gray-800"
                        >
                          <XIcon className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => startEditing(userData)}
                          disabled={isUpdating}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(userData.email)}
                          disabled={isUpdating}
                          className="border-pink-500/30 text-white hover:bg-pink-500/10"
                        >
                          <Key className="h-3 w-3 mr-1" />
                          Reset Password
                        </Button>
                        {userData.is_active ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBanUser(userData.id, userData.display_name || 'User')}
                            disabled={isUpdating}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Ban/Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnbanUser(userData.id, userData.display_name || 'User')}
                            disabled={isUpdating}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Lift Ban
                          </Button>
                        )}
                      </>
                    )}
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
