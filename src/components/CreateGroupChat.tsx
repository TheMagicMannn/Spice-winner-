import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageService } from '@/services/messageService';
import { ProfileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types';

interface CreateGroupChatProps {
  onClose: () => void;
}

export const CreateGroupChat: React.FC<CreateGroupChatProps> = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;
    
    try {
      // Get user's matches
      const matchedProfiles = await ProfileService.getMatchedProfiles(user.id);
      setMatches(matchedProfiles);
    } catch (error) {
      console.error('Error loading matches:', error);
      setError('Failed to load contacts');
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

  const handleCreateGroup = async () => {
    if (!user || !groupName.trim() || selectedUsers.length === 0) {
      setError('Please enter a group name and select at least one member');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const participantIds = selectedUsers
        .map(u => u.id)
        .filter((id): id is string => id !== undefined);
      
      console.log('[v0] Creating group with:', { groupName, participantIds, userId: user.id });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Group creation timed out')), 30000)
      );

      const conversationId = await Promise.race([
        MessageService.createGroupConversation(
          user.id,
          groupName.trim(),
          participantIds
        ),
        timeoutPromise
      ]) as string;

      console.log('[v0] Group created successfully:', conversationId);
      
      // Navigate to the new group chat
      navigate(`/messages/${conversationId}`);
      onClose();
    } catch (error: any) {
      console.error('[v0] Error creating group:', error);
      const errorMessage = error?.message || 'Failed to create group. Please try again.';
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-pink-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-pink-500" />
            <h2 className="text-xl font-bold text-white">Create Group</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Group Name Input */}
        <div className="p-4 border-b border-gray-800">
          <Input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            data-testid="group-name-input"
          />
        </div>

        {/* Search Members */}
        <div className="p-4 border-b border-gray-800">
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            data-testid="search-contacts-input"
          />
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
              {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchQuery ? 'No contacts found' : 'No contacts available'}
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
                    data-testid={`contact-${match.id}`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={match.photos?.[0] || "/placeholder.svg"} alt={match.displayName} />
                      <AvatarFallback className="bg-pink-600 text-white">
                        {match.displayName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{match.displayName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        {match.age && <span>{match.age}</span>}
                        {match.gender && (
                          <>
                            {match.age && <span>•</span>}
                            <span>{match.gender}</span>
                          </>
                        )}
                        {match.orientation && (
                          <>
                            {(match.age || match.gender) && <span>•</span>}
                            <span>{match.orientation}</span>
                          </>
                        )}
                      </div>
                      {match.accountType === 'couple' && (match.age2 || match.gender2 || match.orientation2) && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          {match.age2 && <span>{match.age2}</span>}
                          {match.gender2 && (
                            <>
                              {match.age2 && <span>•</span>}
                              <span>{match.gender2}</span>
                            </>
                          )}
                          {match.orientation2 && (
                            <>
                              {(match.age2 || match.gender2) && <span>•</span>}
                              <span>{match.orientation2}</span>
                            </>
                          )}
                        </div>
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
            onClick={handleCreateGroup}
            disabled={isCreating || !groupName.trim() || selectedUsers.length === 0}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="create-group-button"
          >
            {isCreating ? 'Creating...' : `Create Group (${selectedUsers.length} members)`}
          </Button>
        </div>
      </div>
    </div>
  );
};
