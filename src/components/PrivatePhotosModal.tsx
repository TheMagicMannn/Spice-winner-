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
import { Image, AlertCircle, X } from 'lucide-react';
import { settingsService, PrivatePhotoAccess } from '@/services/settingsService';
import { Spinner } from './Spinner';

interface PrivatePhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivatePhotosModal: React.FC<PrivatePhotosModalProps> = ({
  isOpen,
  onClose
}) => {
  const [accessList, setAccessList] = useState<PrivatePhotoAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAccessList();
    }
  }, [isOpen]);

  const loadAccessList = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const list = await settingsService.getPrivatePhotoAccessList();
      setAccessList(list);
    } catch (err: any) {
      console.error('Error loading private photo access list:', err);
      setError('Failed to load access list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (grantedToId: string) => {
    setRevokingId(grantedToId);
    
    try {
      await settingsService.revokePrivatePhotoAccess(grantedToId);
      setAccessList(accessList.filter(access => access.grantedToId !== grantedToId));
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
            <Image className="h-5 w-5 mr-2" />
            Private Photos Sharing List
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Manage who can see your private photos.
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
              <Image className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No shared access</p>
              <p className="text-white/40 text-sm mt-1">
                Users you grant access to will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {accessList.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  data-testid={`private-access-${access.grantedToId}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={access.grantedProfile?.photos?.[0]} />
                      <AvatarFallback className="bg-pink-500/20 text-pink-400">
                        {access.grantedProfile?.displayName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {access.grantedProfile?.displayName || 'Unknown User'}
                      </div>
                      <div className="text-white/60 text-xs">
                        Granted {new Date(access.grantedAt).toLocaleDateString()}
                      </div>
                      {access.expiresAt && (
                        <div className={`text-xs mt-0.5 ${
                          isExpired(access.expiresAt) ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {isExpired(access.expiresAt) 
                            ? 'Expired' 
                            : `Expires ${new Date(access.expiresAt).toLocaleDateString()}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevoke(access.grantedToId)}
                    disabled={revokingId === access.grantedToId}
                    className="text-red-400 hover:bg-red-500/10 ml-2"
                    data-testid={`revoke-button-${access.grantedToId}`}
                  >
                    {revokingId === access.grantedToId ? (
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
            data-testid="close-private-photos-button"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
