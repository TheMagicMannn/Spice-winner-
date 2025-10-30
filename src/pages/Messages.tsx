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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4">
        <h1 className="text-2xl font-bold text-white mb-1" data-testid="text-messages-title">
          Messages
        </h1>
        <p className="text-white/70 text-sm">
          {conversations.filter(c => c.unread > 0).length} unread conversations
        </p>
      </div>

      {/* Conversations List */}
      <div className="p-4 space-y-2">
        {conversations.map((conversation) => (
          <Card
            key={conversation.id}
            className="bg-black/50 border-pink-500/30 hover:border-pink-500/60 transition-all cursor-pointer"
            data-testid={`conversation-${conversation.id}`}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* Profile Image with Online Indicator */}
                <div className="relative">
                  <img
                    src={conversation.image}
                    alt={conversation.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                  )}
                </div>
                
                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-white/50 text-xs whitespace-nowrap ml-2">
                      {conversation.timestamp}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-white/70 text-sm truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <Badge className="bg-pink-600 text-white border-0 ml-2">
                        {conversation.unread}
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

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
        data-testid="button-new-message"
      >
        <Send className="h-6 w-6" />
      </Button>
    </div>
  );
};
