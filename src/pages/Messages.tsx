import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Pin, Trash2, RotateCcw, Filter, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { MessageService, Conversation } from '@/services/messageService';
import { ConversationService, ConversationDetails } from '@/services/conversationService';
import { NewMessageModal } from '@/components/NewMessageModal';
import { CreateGroupChat } from '@/components/CreateGroupChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'unread' | 'sent' | 'deleted' | 'groups';

// Unified conversation type for UI
interface UnifiedConversation {
  id: string; // This will be matchId or conversationId
  type: 'direct' | 'group';
  name: string;
  photo: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline?: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  participantCount?: number;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
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
      // Map filter types for conversation service (it doesn't support 'sent')
      const conversationFilter = activeFilter === 'sent' ? 'all' : activeFilter;
      
      // Load both match-based and conversation-based threads
      const [matchConvos, conversationThreads] = await Promise.all([
        MessageService.getConversations(user.id, activeFilter).catch(() => []),
        ConversationService.getUserConversations(user.id, conversationFilter as 'all' | 'unread' | 'groups' | 'direct' | 'deleted').catch(() => [])
      ]);

      // Convert match-based conversations to unified format
      const unifiedMatchConvos: UnifiedConversation[] = matchConvos.map((conv: Conversation) => ({
        id: conv.matchId,
        type: 'direct' as const,
        name: conv.otherUserName,
        photo: conv.otherUserPhoto,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount,
        isOnline: conv.isOnline,
        isPinned: conv.isPinned,
        isDeleted: conv.isDeleted
      }));

      // Convert conversation-based threads to unified format
      const unifiedConversationThreads: UnifiedConversation[] = conversationThreads.map((conv: ConversationDetails) => {
        // For direct chats in conversation system, get the other user's name
        let name = conv.groupName || 'Chat';
        let photo = conv.groupPhoto || '';
        
        if (conv.conversationType === 'direct') {
          const otherParticipant = conv.participants.find(p => p.userId !== user.id);
          name = otherParticipant?.profile?.displayName || 'User';
          photo = otherParticipant?.profile?.photos?.[0] || '';
        }

        return {
          id: conv.id,
          type: conv.conversationType,
          name,
          photo,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount,
          isPinned: conv.isPinned || false,
          isDeleted: conv.isDeleted || false,
          participantCount: conv.participants.filter(p => p.isActive).length
        };
      });

      // Merge and deduplicate (prefer conversation-based over match-based for same chat)
      let merged = [...unifiedConversationThreads, ...unifiedMatchConvos];
      
      // Additional client-side filtering for 'sent' and 'groups'
      if (activeFilter === 'sent') {
        // For conversation threads, we can't easily determine if last message was sent by user
        // So we keep only match-based conversations that were already filtered
        merged = unifiedMatchConvos;
      } else if (activeFilter === 'groups') {
        // Show only group conversations
        merged = merged.filter(c => c.type === 'group');
      }
      
      // Sort: pinned first, then by last message time
      const sorted = merged.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });

      setConversations(sorted);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = (conversation: UnifiedConversation, e: React.MouseEvent) => {
    // Prevent opening chat if clicking on action buttons
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }
    // Navigate to unified chat page
    navigate(`/messages/${conversation.id}`);
  };

  const handlePinConversation = async (conversation: UnifiedConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      if (conversation.type === 'group' || conversation.type === 'direct') {
        // Try conversation-based system first
        await ConversationService.togglePinConversation(user.id, conversation.id);
      } else {
        // Fallback to match-based system
        await MessageService.togglePinConversation(user.id, conversation.id);
      }
      loadConversations();
    } catch (error) {
      console.error('Error pinning conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversation: UnifiedConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (confirm('Delete this conversation? You can restore it later from deleted messages.')) {
      try {
        if (conversation.type === 'group' || conversation.type === 'direct') {
          await ConversationService.deleteConversation(user.id, conversation.id);
        } else {
          await MessageService.deleteConversation(user.id, conversation.id);
        }
        loadConversations();
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  const handleRestoreConversation = async (conversation: UnifiedConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      if (conversation.type === 'group' || conversation.type === 'direct') {
        await ConversationService.restoreConversation(user.id, conversation.id);
      } else {
        await MessageService.restoreConversation(user.id, conversation.id);
      }
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
      case 'groups': return 'Group Chats';
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
            {/* Create Group Button */}
            <Button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
              data-testid="create-group-button"
            >
              <Users className="h-5 w-5 mr-1" />
              Group
            </Button>
            
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
                  {(['all', 'unread', 'sent', 'groups', 'deleted'] as FilterType[]).map((filter) => (
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
          {activeFilter === 'groups' && `${conversations.length} group chats`}
          {activeFilter === 'deleted' && `${conversations.length} deleted conversations`}
        </p>
      </div>

      {/* Conversations List */}
      <div className="p-4 space-y-2">
        {conversations.map((conversation) => (
          <Card
            key={conversation.id}
            onClick={(e) => handleConversationClick(conversation, e)}
            className={`bg-black/50 border-pink-500/30 hover:border-pink-500/60 transition-all cursor-pointer ${
              conversation.isPinned ? 'border-pink-500/60' : ''
            }`}
            data-testid={`conversation-${conversation.id}`}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* Profile Image with Online Indicator */}
                <div className="relative">
                  {conversation.type === 'group' ? (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                  ) : (
                    <img
                      src={conversation.photo || 'https://via.placeholder.com/150'}
                      alt={conversation.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                  )}
                </div>
                
                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold truncate">
                        {conversation.name}
                      </h3>
                      {conversation.isPinned && (
                        <Pin className="h-4 w-4 text-pink-500 fill-pink-500" />
                      )}
                      {conversation.type === 'group' && conversation.participantCount && (
                        <span className="text-white/40 text-xs">({conversation.participantCount})</span>
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
                      onClick={(e) => handleRestoreConversation(conversation, e)}
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
                        onClick={(e) => handlePinConversation(conversation, e)}
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
                        onClick={(e) => handleDeleteConversation(conversation, e)}
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
              {activeFilter === 'groups' && 'No group chats yet'}
              {activeFilter === 'all' && 'No messages yet'}
            </h3>
            <p className="text-white/60 text-sm">
              {activeFilter === 'all' && 'Start a conversation with your matches!'}
              {activeFilter === 'deleted' && 'Deleted conversations will appear here'}
              {activeFilter === 'unread' && 'All caught up!'}
              {activeFilter === 'sent' && 'Send your first message!'}
              {activeFilter === 'groups' && 'Create a group chat to get started!'}
            </p>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
      />

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupChat onClose={() => setShowCreateGroupModal(false)} />
      )}
    </div>
  );
};
