import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserX, AlertCircle } from 'lucide-react';
import { settingsService, BlockedUser } from '@/services/settingsService';
import { Spinner } from './Spinner';

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({
  isOpen,
  onClose
}) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBlockedUsers();
    }
  }, [isOpen]);

  const loadBlockedUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const users = await settingsService.getBlockedUsers();
      setBlockedUsers(users);
    } catch (err: any) {
      console.error('Error loading blocked users:', err);
      setError('Failed to load blocked users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    setUnblockingId(blockedId);
    
    try {
      await settingsService.unblockUser(blockedId);
      setBlockedUsers(blockedUsers.filter(user => user.blockedId !== blockedId));
    } catch (err: any) {
      console.error('Error unblocking user:', err);
      setError('Failed to unblock user');
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-pink-500/30 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-pink-400">
            <UserX className="h-5 w-5 mr-2" />
            Blocked Users
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Users you've blocked won't be able to see your profile or contact you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No blocked users</p>
              <p className="text-white/40 text-sm mt-1">
                Users you block will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  data-testid={`blocked-user-${blockedUser.blockedId}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={blockedUser.blockedProfile?.photos?.[0]} />
                      <AvatarFallback className="bg-pink-500/20 text-pink-400">
                        {blockedUser.blockedProfile?.displayName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {blockedUser.blockedProfile?.displayName || 'Unknown User'}
                      </div>
                      {blockedUser.blockedProfile?.age && blockedUser.blockedProfile?.location && (
                        <div className="text-white/60 text-sm truncate">
                          {blockedUser.blockedProfile.age} • {blockedUser.blockedProfile.location}
                        </div>
                      )}
                      <div className="text-white/40 text-xs mt-1">
                        Blocked {new Date(blockedUser.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnblock(blockedUser.blockedId)}
                    disabled={unblockingId === blockedUser.blockedId}
                    className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 ml-2"
                    data-testid={`unblock-button-${blockedUser.blockedId}`}
                  >
                    {unblockingId === blockedUser.blockedId ? (
                      <Spinner />
                    ) : (
                      'Unblock'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-pink-500/20">
          <Button
            onClick={onClose}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            data-testid="close-blocked-users-button"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
