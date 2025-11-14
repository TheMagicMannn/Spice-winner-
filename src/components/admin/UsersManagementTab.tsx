// src/components/admin/UsersManagementTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { adminService, UserManagement } from '@/services/adminService';
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
  Crown
} from 'lucide-react';
import { format } from 'date-fns';

export const UsersManagementTab: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
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

  const handleUpdateMembership = async (
    userId: string,
    level: 'free' | 'premium' | 'vip' | 'platinum'
  ) => {
    if (!user || !confirm(`Update membership level to ${level}?`)) return;

    setIsUpdating(true);
    try {
      const expiresAt = level !== 'free'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await adminService.updateMembershipLevel(userId, level, expiresAt, user.id);
      alert('Membership level updated successfully!');
      loadUsers();
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership level.');
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
            Search and manage user accounts
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
        <div className="text-white/70 text-sm">
          Showing {users.length} users
        </div>

        {users.map((userData) => (
          <Card key={userData.id} className="bg-gray-900/50 border-pink-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {userData.display_name || 'No Name'}
                    </h3>
                    {userData.is_verified && (
                      <Badge className="bg-blue-500/20 text-blue-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {userData.is_admin && (
                      <Badge className="bg-red-500/20 text-red-300">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    <Badge className={getMembershipColor(userData.membership_level)}>
                      <Crown className="h-3 w-3 mr-1" />
                      {userData.membership_level || 'free'}
                    </Badge>
                  </div>

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

                <div className="flex flex-col gap-2">
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

                  <select
                    value={userData.membership_level || 'free'}
                    onChange={(e) =>
                      handleUpdateMembership(
                        userData.id,
                        e.target.value as any
                      )
                    }
                    disabled={isUpdating}
                    className="px-3 py-1.5 text-sm rounded-md bg-gray-800 border border-gray-700 text-white"
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
