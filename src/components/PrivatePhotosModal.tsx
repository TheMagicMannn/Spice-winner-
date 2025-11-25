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
import { Lock, AlertCircle, X } from 'lucide-react';
import PrivateContentService from '@/services/privateContentService';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './Spinner';

interface UserWithAccess {
  user_id: string;
  granted_at: string;
  expires_at?: string;
  display_name?: string;
  photos?: string[];
}

interface PrivatePhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivatePhotosModal: React.FC<PrivatePhotosModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [accessList, setAccessList] = useState<UserWithAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadAccessList();
    }
  }, [isOpen, user?.id]);

  const loadAccessList = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const list = await PrivateContentService.getUsersWithAccess(user.id);
      setAccessList(list);
    } catch (err: any) {
      console.error('Error loading private content access list:', err);
      setError('Failed to load access list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (grantedToUserId: string) => {
    if (!user?.id) return;
    
    setRevokingId(grantedToUserId);
    
    try {
      await PrivateContentService.revokeAccess(user.id, grantedToUserId);
      setAccessList(accessList.filter(access => access.user_id !== grantedToUserId));
    } catch (err: any) {
      console.error('Error revoking access:', err);
      setError('Failed to revoke access');
    } finally {
      setRevokingId(null);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-pink-500/30 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-pink-400">
            <Lock className="h-5 w-5 mr-2" />
            Private Content Sharing List
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Manage who can see your private content (photos, videos, etc.).
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
          ) : accessList.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No shared access</p>
              <p className="text-white/40 text-sm mt-1">
                Users you grant private content access to will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {accessList.map((access) => (
                <div
                  key={access.user_id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  data-testid={`private-access-${access.user_id}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={access.photos?.[0]} />
                      <AvatarFallback className="bg-pink-500/20 text-pink-400">
                        {access.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {access.display_name || 'Unknown User'}
                      </div>
                      <div className="text-white/60 text-xs">
                        Granted {new Date(access.granted_at).toLocaleDateString()}
                      </div>
                      {access.expires_at && (
                        <div className={`text-xs mt-0.5 ${
                          isExpired(access.expires_at) ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {isExpired(access.expires_at) 
                            ? 'Expired' 
                            : `Expires ${new Date(access.expires_at).toLocaleDateString()}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevoke(access.user_id)}
                    disabled={revokingId === access.user_id}
                    className="text-red-400 hover:bg-red-500/10 ml-2"
                    data-testid={`revoke-button-${access.user_id}`}
                  >
                    {revokingId === access.user_id ? (
                      <Spinner />
                    ) : (
                      <X className="h-4 w-4" />
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
            data-testid="close-private-content-button"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
