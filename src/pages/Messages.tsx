import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { ChatModal } from '@/components/ChatModal';
import { ProfileDetailModal } from '@/components/ProfileDetailModal';
import { MessageService, Conversation } from '@/services/messageService';
import { ProfileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const convos = await MessageService.getConversations(user.id);
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
    // Reload conversations to update unread counts
    loadConversations();
  };

  const handleProfileClick = async () => {
    if (!selectedConversation) return;

    try {
      const profile = await ProfileService.getProfile(selectedConversation.otherUserId);
      setSelectedProfile(profile);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-20 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4">
        <h1 className="text-2xl font-bold text-white mb-1" data-testid="text-messages-title">
          Messages
        </h1>
        <p className="text-white/70 text-sm">
          {conversations.filter(c => c.unreadCount > 0).length} unread conversations
        </p>
      </div>

      {/* Conversations List */}
      <div className="p-4 space-y-2">
        {conversations.map((conversation) => (
          <Card
            key={conversation.matchId}
            onClick={() => handleConversationClick(conversation)}
            className="bg-black/50 border-pink-500/30 hover:border-pink-500/60 transition-all cursor-pointer"
            data-testid={`conversation-${conversation.matchId}`}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* Profile Image with Online Indicator */}
                <div className="relative">
                  <img
                    src={conversation.otherUserPhoto || 'https://via.placeholder.com/150'}
                    alt={conversation.otherUserName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                  )}
                </div>
                
                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {conversation.otherUserName}
                    </h3>
                    <span className="text-white/50 text-xs whitespace-nowrap ml-2">
                      {formatTimestamp(conversation.lastMessageAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-white/70 text-sm truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-pink-600 text-white border-0 ml-2">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {conversations.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-white/60 text-sm">
              Start a conversation with your matches!
            </p>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedConversation && (
        <ChatModal
          matchId={selectedConversation.matchId}
          otherUserId={selectedConversation.otherUserId}
          otherUserName={selectedConversation.otherUserName}
          otherUserPhoto={selectedConversation.otherUserPhoto}
          isOpen={!!selectedConversation}
          onClose={handleCloseChat}
          onProfileClick={handleProfileClick}
        />
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfile(null);
          }}
        />
      )}
    </div>
  );
};
