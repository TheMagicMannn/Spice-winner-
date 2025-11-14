import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ConversationService } from '@/services/conversationService';
import { ProfileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types';
import { Spinner } from '@/components/Spinner';

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  currentParticipantIds: string[];
  onSuccess: () => void;
}

export const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  currentParticipantIds,
  onSuccess
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadAvailableMatches();
    }
  }, [isOpen, user]);

  const loadAvailableMatches = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get user's matches
      const matchedProfiles = await ProfileService.getMatchedProfiles(user.id);
      
      // Filter out users already in the conversation
      const availableMatches = matchedProfiles.filter(
        profile => !currentParticipantIds.includes(profile.id!)
      );
      
      setMatches(availableMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      setError('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatches = matches.filter(match =>
    match.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (profile: Profile) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === profile.id);
      if (isSelected) {
        return prev.filter(u => u.id !== profile.id);
      } else {
        return [...prev, profile];
      }
    });
  };

  const handleAddParticipants = async () => {
    if (!user || selectedUsers.length === 0) {
      setError('Please select at least one person to add');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      // Add each selected user to the group
      for (const selectedUser of selectedUsers) {
        await ConversationService.addParticipantToGroup(
          conversationId,
          selectedUser.id!
        );
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error adding participants:', error);
      setError(error?.message || 'Failed to add participants. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUsers([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-pink-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-pink-500" />
            <h2 className="text-xl font-bold text-white">Add Participants</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              type="text"
              placeholder="Search your matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-800">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 bg-pink-500/20 rounded-full px-3 py-1"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.photos?.[0] || "/placeholder.svg"} alt={user.displayName} />
                    <AvatarFallback className="bg-pink-600 text-white text-xs">
                      {user.displayName?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">{user.displayName}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {selectedUsers.length} person{selectedUsers.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchQuery ? 'No matches found' : 'No available contacts to add'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMatches.map(match => {
                const isSelected = selectedUsers.find(u => u.id === match.id);
                return (
                  <button
                    key={match.id}
                    onClick={() => toggleUserSelection(match)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-pink-500/20 border-2 border-pink-500'
                        : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={match.photos?.[0] || "/placeholder.svg"} alt={match.displayName} />
                      <AvatarFallback className="bg-pink-600 text-white">
                        {match.displayName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{match.displayName}</p>
                      {match.bio && (
                        <p className="text-sm text-gray-400 truncate">{match.bio}</p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="bg-pink-500 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-500/20 border-t border-red-500/30">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={handleAddParticipants}
            disabled={isAdding || selectedUsers.length === 0}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? 'Adding...' : `Add ${selectedUsers.length} participant${selectedUsers.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
