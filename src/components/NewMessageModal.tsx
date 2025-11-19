import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, X, Users, MessageSquare, Check } from 'lucide-react';
import { MatchingService } from '@/services/matchingService';
import { ConversationService } from '@/services/conversationService';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types';
import { Spinner } from '@/components/Spinner';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mutualMatches, setMutualMatches] = useState<Profile[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadMutualMatches();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = mutualMatches.filter(match =>
        match.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMatches(filtered);
    } else {
      setFilteredMatches(mutualMatches);
    }
  }, [searchQuery, mutualMatches]);

  const loadMutualMatches = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const matches = await MatchingService.getMutualMatches(user.id);
      setMutualMatches(matches);
      setFilteredMatches(matches);
    } catch (error) {
      console.error('Error loading mutual matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (profile: Profile) => {
    const isSelected = selectedUsers.find(u => u.id === profile.id);
    
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== profile.id));
    } else {
      setSelectedUsers([...selectedUsers, profile]);
    }
  };

  const handleCreateConversation = async () => {
    if (!user?.id || selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      if (selectedUsers.length === 1) {
        // Create direct conversation
        try {
          const conversationId = await ConversationService.getOrCreateDirectConversation(
            user.id,
            selectedUsers[0].id!
          );
          navigate(`/messages/${conversationId}/${selectedUsers[0].id}`);
          handleClose();
        } catch (error: any) {
          // If conversation system not ready, show helpful message
          if (error.message?.includes('No match found')) {
            alert('You must be matched with this user to start a conversation.');
          } else {
            console.error('Error creating conversation:', error);
            alert('Unable to start conversation. Please make sure you have an active match with this user.');
          }
        }
      } else {
        // Create group conversation
        if (!showGroupNameInput) {
          setShowGroupNameInput(true);
          setIsCreating(false);
          return;
        }

        if (!groupName.trim()) {
          alert('Please enter a group name');
          setIsCreating(false);
          return;
        }

        try {
          const participantIds = selectedUsers.map(u => u.id!).filter(Boolean);
          const conversationId = await ConversationService.createGroupConversation(
            user.id,
            groupName,
            participantIds
          );
          
          navigate(`/messages/${conversationId}/group`);
          handleClose();
        } catch (error) {
          console.error('Error creating group conversation:', error);
          alert('Group chat feature requires database update. Please ask the developer to run GROUP_CHAT_SCHEMA.sql in Supabase.');
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    setShowGroupNameInput(false);
    onClose();
  };

  const getDisplayName = (profile: Profile) => {
    if (profile.accountType === 'couple' && profile.displayName2) {
      return `${profile.displayName} & ${profile.displayName2}`;
    }
    return profile.displayName || 'Anonymous';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-black/95 border-pink-500/30 text-white max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-pink-400" />
            New Message
          </DialogTitle>
        </DialogHeader>

        {/* Selected Users Chips */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-3 border-b border-pink-500/30">
            {selectedUsers.map(user => (
              <Badge
                key={user.id}
                className="bg-pink-600 text-white flex items-center gap-1 px-3 py-1"
              >
                {getDisplayName(user)}
                <button
                  onClick={() => handleUserSelect(user)}
                  className="ml-1 hover:text-pink-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Group Name Input (shown when creating group) */}
        {showGroupNameInput && (
          <div className="pb-3">
            <label className="text-sm text-white/70 mb-1 block">Group Name</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="bg-gray-900/50 border-pink-500/30 text-white"
              autoFocus
            />
          </div>
        )}

        {/* Search */}
        {!showGroupNameInput && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mutual matches..."
              className="pl-10 bg-gray-900/50 border-pink-500/30 text-white"
            />
          </div>
        )}

        {/* User List */}
        {!showGroupNameInput && (
          <div className="flex-1 overflow-y-auto space-y-2 py-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No mutual matches found</p>
                {searchQuery && <p className="text-sm mt-2">Try a different search</p>}
              </div>
            ) : (
              filteredMatches.map((match) => {
                const isSelected = selectedUsers.find(u => u.id === match.id);
                
                return (
                  <button
                    key={match.id}
                    onClick={() => handleUserSelect(match)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-pink-600/30 border-2 border-pink-500'
                        : 'bg-gray-900/30 border-2 border-transparent hover:bg-gray-900/50'
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={match.photos?.[0] || ''}
                          alt={getDisplayName(match)}
                        />
                        <AvatarFallback className="bg-pink-600 text-white">
                          {getDisplayName(match)[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-pink-600 rounded-full p-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-white">
                        {getDisplayName(match)}
                      </h4>
                      {/* Primary user info */}
                      <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5">
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
                      {/* Secondary user info (for couples) */}
                      {match.accountType === 'couple' && (match.age2 || match.gender2 || match.orientation2) && (
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
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

                    <Badge className="bg-transparent text-pink-400 border-pink-500/50 text-xs">
                      {match.accountType}
                    </Badge>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-pink-500/30">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-pink-500/30 text-white hover:bg-pink-500/10"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0 || isCreating}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isCreating ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Creating...
              </>
            ) : showGroupNameInput ? (
              <>Create Group ({selectedUsers.length})</>
            ) : selectedUsers.length > 1 ? (
              <>Next ({selectedUsers.length} selected)</>
            ) : (
              <>Start Chat</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
