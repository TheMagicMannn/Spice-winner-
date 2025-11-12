import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Pin, Trash2, RotateCcw, Filter, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { MessageService, Conversation } from '@/services/messageService';
import { NewMessageModal } from '@/components/NewMessageModal';
import { CreateGroupChat } from '@/components/CreateGroupChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'unread' | 'sent' | 'deleted';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, activeFilter]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const convos = await MessageService.getConversations(user.id, activeFilter);
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = (conversation: Conversation, e: React.MouseEvent) => {
    // Prevent opening chat if clicking on action buttons
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }
    // Navigate to chat page
    navigate(`/messages/${conversation.matchId}/${conversation.otherUserId}`);
  };

  const handlePinConversation = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await MessageService.togglePinConversation(user.id, matchId);
      loadConversations();
    } catch (error) {
      console.error('Error pinning conversation:', error);
    }
  };

  const handleDeleteConversation = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (confirm('Delete this conversation? You can restore it later from deleted messages.')) {
      try {
        await MessageService.deleteConversation(user.id, matchId);
        loadConversations();
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const handleRestoreConversation = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await MessageService.restoreConversation(user.id, matchId);
      loadConversations();
    } catch (error) {
      console.error('Error restoring conversation:', error);
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

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'all': return 'All';
      case 'unread': return 'Unread';
      case 'sent': return 'Sent';
      case 'deleted': return 'Deleted';
    }
  };

  const getFilterCount = () => {
    switch (activeFilter) {
      case 'unread':
        return conversations.length;
      case 'sent':
        return conversations.length;
      case 'deleted':
        return conversations.length;
      default:
        return conversations.filter(c => c.unreadCount > 0).length;
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white" data-testid="text-messages-title">
            Messages
          </h1>
          
          <div className="flex items-center gap-2">
            {/* New Message Button */}
            <Button
              onClick={() => setShowNewMessageModal(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white"
              size="sm"
            >
              <Plus className="h-5 w-5 mr-1" />
              New
            </Button>
            
            {/* Filter Button */}
            <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="text-white hover:bg-pink-500/10"
            >
              <Filter className="h-5 w-5 mr-2" />
              {getFilterLabel(activeFilter)}
            </Button>

            {/* Filter Menu */}
            {showFilterMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-pink-500/30 rounded-lg shadow-xl z-50 min-w-[150px]">
                  {(['all', 'unread', 'sent', 'deleted'] as FilterType[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-white hover:bg-pink-500/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        activeFilter === filter ? 'bg-pink-500/20' : ''
                      }`}
                    >
                      {getFilterLabel(filter)}
                    </button>
                  ))}
                </div>
              </>
            )}
            </div>
          </div>
        </div>
        
        <p className="text-white/70 text-sm">
          {activeFilter === 'all' && `${getFilterCount()} unread conversations`}
          {activeFilter === 'unread' && `${conversations.length} unread conversations`}
          {activeFilter === 'sent' && `${conversations.length} conversations with sent messages`}
          {activeFilter === 'deleted' && `${conversations.length} deleted conversations`}
        </p>
      </div>

      {/* Conversations List */}
      <div className="p-4 space-y-2">
        {conversations.map((conversation) => (
          <Card
            key={conversation.matchId}
            onClick={(e) => handleConversationClick(conversation, e)}
            className={`bg-black/50 border-pink-500/30 hover:border-pink-500/60 transition-all cursor-pointer ${
              conversation.isPinned ? 'border-pink-500/60' : ''
            }`}
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
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold truncate">
                        {conversation.otherUserName}
                      </h3>
                      {conversation.isPinned && (
                        <Pin className="h-4 w-4 text-pink-500 fill-pink-500" />
                      )}
                    </div>
                    <span className="text-white/50 text-xs whitespace-nowrap ml-2">
                      {formatTimestamp(conversation.lastMessageAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-white/70 text-sm truncate flex-1">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-pink-600 text-white border-0 ml-2">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 action-button">
                  {activeFilter === 'deleted' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRestoreConversation(conversation.matchId, e)}
                      className="text-green-500 hover:bg-green-500/10 h-8 w-8 p-0"
                      title="Restore conversation"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handlePinConversation(conversation.matchId, e)}
                        className={`h-8 w-8 p-0 ${
                          conversation.isPinned
                            ? 'text-pink-500 hover:bg-pink-500/10'
                            : 'text-white/70 hover:bg-white/10'
                        }`}
                        title={conversation.isPinned ? 'Unpin conversation' : 'Pin conversation'}
                      >
                        <Pin className={conversation.isPinned ? 'fill-pink-500' : ''} style={{ height: '16px', width: '16px' }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteConversation(conversation.matchId, e)}
                        className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {conversations.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">
              {activeFilter === 'deleted' && 'No deleted conversations'}
              {activeFilter === 'unread' && 'No unread messages'}
              {activeFilter === 'sent' && 'No sent messages'}
              {activeFilter === 'all' && 'No messages yet'}
            </h3>
            <p className="text-white/60 text-sm">
              {activeFilter === 'all' && 'Start a conversation with your matches!'}
              {activeFilter === 'deleted' && 'Deleted conversations will appear here'}
              {activeFilter === 'unread' && 'All caught up!'}
              {activeFilter === 'sent' && 'Send your first message!'}
            </p>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
      />
    </div>
  );
};
