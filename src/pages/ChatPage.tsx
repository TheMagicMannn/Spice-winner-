import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/Input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  X, 
  ChevronLeft,
  Clock,
  Check,
  CheckCheck,
  Phone,
  VideoIcon,
  Info,
  Users,
  MoreVertical,
  UserPlus,
  LogOut,
  Flag,
  Trash2
} from 'lucide-react';
import { MessageService, Message } from '@/services/messageService';
import { ProfileService } from '@/services/profileService';
import { ConversationService, ConversationDetails } from '@/services/conversationService';
import { useAuth } from '@/hooks/useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { MessageContextMenu } from '@/components/MessageContextMenu';
import { EmojiPicker } from '@/components/EmojiPicker';
import { ProfileDetailModal } from '@/components/ProfileDetailModal';
import { GroupAvatar } from '@/components/GroupAvatar';
import { ReportModal } from '@/components/ReportModal';
import { AddParticipantsModal } from '@/components/AddParticipantsModal';
import { Profile } from '@/types';

const SELF_DESTRUCT_OPTIONS = [
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '1 hour', value: 3600 },
  { label: '24 hours', value: 86400 },
  { label: '7 days', value: 604800 }
];

const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  voice: 5 * 1024 * 1024
};

export const ChatPage: React.FC = () => {
  const { conversationId, matchId, otherUserId } = useParams<{ conversationId?: string; matchId?: string; otherUserId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine the actual conversation/match ID to use
  const chatId = conversationId || matchId;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'voice' | null>(null);
  const [showSelfDestructMenu, setShowSelfDestructMenu] = useState(false);
  const [selectedSelfDestruct, setSelectedSelfDestruct] = useState<number | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [otherUserName, setOtherUserName] = useState('');
  const [otherUserPhoto, setOtherUserPhoto] = useState('');
  
  // Group chat state
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  
  // Menu and modals
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddParticipantsModal, setShowAddParticipantsModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isInitialLoadRef = useRef(true);
  const previousMessageCountRef = useRef(0);

  // Load conversation details (determines if group or direct chat)
  // This also loads profile for direct chats
  useEffect(() => {
    if (chatId) {
      loadConversationDetails();
    }
  }, [chatId]);

  // Load messages
  useEffect(() => {
    if (chatId) {
      loadMessages();
      markAsRead();
    }
  }, [chatId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (chatId && user) {
      messageChannelRef.current = MessageService.subscribeToMessages(
        chatId,
        handleNewMessage
      );

      // Subscribe to typing based on chat type
      if (conversationDetails) {
        typingChannelRef.current = MessageService.subscribeToTypingConversation(
          chatId,
          user.id,
          setIsTyping
        );
      } else {
        typingChannelRef.current = MessageService.subscribeToTyping(
          chatId,
          user.id,
          setIsTyping
        );
      }

      return () => {
        messageChannelRef.current?.unsubscribe();
        typingChannelRef.current?.unsubscribe();
      };
    }
  }, [chatId, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    const shouldScroll = isInitialLoadRef.current || 
                        isNearBottom() || 
                        messages.length > previousMessageCountRef.current;
    
    if (shouldScroll) {
      const timer = setTimeout(() => {
        const behavior = isInitialLoadRef.current ? 'auto' : 'smooth';
        scrollToBottom(behavior);
        isInitialLoadRef.current = false;
      }, 100);
      
      previousMessageCountRef.current = messages.length;
      return () => clearTimeout(timer);
    }
    
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  const loadConversationDetails = async () => {
    if (!chatId) return;
    try {
      // Try to get conversation details (for group chats and new conversation system)
      const details = await ConversationService.getConversationDetails(chatId);
      if (details) {
        setConversationDetails(details);
        
        if (details.conversationType === 'group') {
          setIsGroupChat(true);
          setOtherUserName(details.groupName || 'Group Chat');
          setOtherUserPhoto(details.groupPhoto || '');
        } else {
          // Direct conversation - get other user
          setIsGroupChat(false);
          const otherParticipant = details.participants.find(p => p.userId !== user?.id);
          if (otherParticipant?.profile) {
            const profile = otherParticipant.profile;
            // Better fallback for name
            const name = profile.displayName || 
                        (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : '') ||
                        profile.email?.split('@')[0] || 
                        'User';
            setOtherUserName(name);
            setOtherUserPhoto(profile.photos?.[0] || '');
            setOtherUserProfile(profile);
          }
        }
      } else {
        // Fallback to match-based system (legacy direct chats)
        setIsGroupChat(false);
        setConversationDetails(null);
        if (otherUserId) {
          loadOtherUserProfile();
        }
      }
    } catch (error) {
      // Fallback: assume it's a match-based direct chat
      console.log('Using match-based direct chat mode');
      setIsGroupChat(false);
      setConversationDetails(null);
      if (otherUserId) {
        loadOtherUserProfile();
      }
    }
  };

  const loadOtherUserProfile = async () => {
    if (!otherUserId) return;
    
    // Skip if otherUserId is not a valid UUID (e.g., "group" for group chats)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(otherUserId)) {
      console.log('Skipping profile load - not a valid user ID:', otherUserId);
      setOtherUserName('Chat');
      return;
    }
    
    try {
      const profile = await ProfileService.getProfile(otherUserId);
      if (profile) {
        setOtherUserProfile(profile);
        // Better fallback for name
        const name = profile.displayName || 
                    (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : '') ||
                    profile.email?.split('@')[0] || 
                    'User';
        setOtherUserName(name);
        setOtherUserPhoto(profile.photos?.[0] || '');
      } else {
        setOtherUserName('User');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setOtherUserName('User');
    }
  };

  const loadMessages = async () => {
    if (!chatId) return;
    try {
      const loadedMessages = await MessageService.getMessages(chatId);
      setMessages(loadedMessages);
      setTimeout(() => scrollToBottom('auto'), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async () => {
    if (user && chatId) {
      await MessageService.markConversationAsRead(chatId, user.id);
    }
  };

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 150;
    const position = container.scrollTop + container.clientHeight;
    const bottom = container.scrollHeight;
    return bottom - position < threshold;
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => {
      const exists = prev.find(m => m.id === message.id);
      if (exists) {
        return prev.map(m => m.id === message.id ? message : m);
      }
      
      if (!isNearBottom() && message.senderId !== user?.id) {
        setShowScrollButton(true);
      }
      
      return [...prev, message];
    });

    if (message.senderId !== user?.id) {
      MessageService.markAsRead(message.id);
    }
  };

  const handleMessageUpdate = (updatedMessage: Message) => {
    setMessages(prev => 
      prev.map(m => m.id === updatedMessage.id ? updatedMessage : m)
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user || isSending || !chatId) return;

    setIsSending(true);
    const messageText = inputText;
    setInputText('');
    
    try {
      let newMessage;
      
      // Check if this is a conversation-based chat (group or new direct)
      if (conversationDetails) {
        // Use conversation-based messaging
        if (replyingTo) {
          // For replies in conversation system, we still need to implement reply support
          // For now, send as regular message
          console.log('Reply feature not yet implemented for conversation system');
          newMessage = await MessageService.sendMessageInConversation(chatId, user.id, messageText);
          setReplyingTo(null);
        } else {
          newMessage = await MessageService.sendMessageInConversation(chatId, user.id, messageText);
        }
      } else if (otherUserId) {
        // Legacy match-based direct chat with otherUserId
        if (replyingTo) {
          newMessage = await MessageService.sendReplyMessage(chatId, user.id, messageText, replyingTo.id);
          setReplyingTo(null);
        } else {
          newMessage = await MessageService.sendMessage(chatId, user.id, messageText);
        }
      } else {
        // Try to detect if this is a conversation or match by attempting conversation-based first
        try {
          newMessage = await MessageService.sendMessageInConversation(chatId, user.id, messageText);
        } catch (convError) {
          // Fallback to match-based
          console.log('Falling back to match-based messaging');
          if (replyingTo) {
            newMessage = await MessageService.sendReplyMessage(chatId, user.id, messageText, replyingTo.id);
            setReplyingTo(null);
          } else {
            newMessage = await MessageService.sendMessage(chatId, user.id, messageText);
          }
        }
      }
      
      handleNewMessage(newMessage);
      handleTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(messageText);
      setUploadError('Failed to send message');
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (typing: boolean) => {
    if (!user || !chatId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      // Use appropriate typing method based on chat type
      if (conversationDetails) {
        MessageService.setTypingConversation(chatId, user.id, true);
        typingTimeoutRef.current = setTimeout(() => {
          MessageService.setTypingConversation(chatId, user.id, false);
        }, 3000);
      } else {
        MessageService.setTyping(chatId, user.id, true);
        typingTimeoutRef.current = setTimeout(() => {
          MessageService.setTyping(chatId, user.id, false);
        }, 3000);
      }
    } else {
      if (conversationDetails) {
        MessageService.setTypingConversation(chatId, user.id, false);
      } else {
        MessageService.setTyping(chatId, user.id, false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    handleTyping(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = FILE_SIZE_LIMITS[type];
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setUploadError(`File too large. Maximum size for ${type}s is ${maxSizeMB}MB`);
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setUploadError(null);
    setSelectedMedia(file);
    setMediaType(type);
    const preview = URL.createObjectURL(file);
    setMediaPreview(preview);
    setShowSelfDestructMenu(true);
  };

  const handleSendMedia = async () => {
    if (!selectedMedia || !mediaType || !user || !chatId) return;

    setIsSending(true);
    setUploadError(null);
    try {
      let newMessage;
      
      // Check if using conversation-based system
      if (conversationDetails) {
        newMessage = await MessageService.sendMediaMessageInConversation(
          chatId,
          user.id,
          selectedMedia,
          mediaType,
          selectedSelfDestruct
        );
      } else {
        // Fallback to match-based
        newMessage = await MessageService.sendMediaMessage(
          chatId,
          user.id,
          selectedMedia,
          mediaType,
          selectedSelfDestruct
        );
      }
      
      handleNewMessage(newMessage);
      clearMediaSelection();
    } catch (error: any) {
      console.error('Error sending media:', error);
      setUploadError(error.message || 'Failed to upload media. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const clearMediaSelection = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setShowSelfDestructMenu(false);
    setSelectedSelfDestruct(undefined);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      let options: MediaRecorderOptions = {};
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        ''
      ];

      for (const mimeType of mimeTypes) {
        if (mimeType === '' || MediaRecorder.isTypeSupported(mimeType)) {
          if (mimeType) {
            options = { mimeType };
          }
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const fileExt = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        const audioFile = new File([audioBlob], `voice-${Date.now()}.${fileExt}`, { type: mimeType });
        
        if (user && chatId) {
          setIsSending(true);
          try {
            let newMessage;
            if (conversationDetails) {
              newMessage = await MessageService.sendMediaMessageInConversation(chatId, user.id, audioFile, 'voice');
            } else {
              newMessage = await MessageService.sendMediaMessage(chatId, user.id, audioFile, 'voice');
            }
            handleNewMessage(newMessage);
          } catch (error) {
            console.error('Error sending voice message:', error);
            setUploadError('Failed to send voice message. Please try again.');
          } finally {
            setIsSending(false);
          }
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error('Error starting voice recording:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setUploadError('Microphone access denied. Please allow microphone permissions in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setUploadError('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setUploadError('Microphone is already in use by another application.');
      } else if (error.name === 'SecurityError') {
        setUploadError('Microphone access requires HTTPS. Please use a secure connection.');
      } else {
        setUploadError('Could not access microphone. Please check permissions and try again.');
      }
      
      setTimeout(() => setUploadError(null), 5000);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleLongPress = (messageId: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setContextMenu({
      messageId,
      x: rect.left,
      y: rect.top - 10
    });
  };

  const handleCopyMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setContextMenu(null);
    } catch (error) {
      console.error('Error copying message:', error);
    }
  };

  const handleReplyTo = (message: Message) => {
    setReplyingTo(message);
    setContextMenu(null);
  };

  const handleUnsendMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      await MessageService.unsendMessage(messageId, user.id);
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, isDeleted: true, deletedAt: new Date().toISOString() }
          : m
      ));
      setContextMenu(null);
    } catch (error) {
      console.error('Error unsending message:', error);
      alert('Failed to unsend message');
    }
  };

  const handleReactToMessage = (messageId: string) => {
    setContextMenu({ messageId, x: 0, y: 0 });
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (!user || !contextMenu) return;
    
    try {
      const updatedMessage = await MessageService.toggleReaction(contextMenu.messageId, user.id, emoji);
      setMessages(prev => prev.map(m => 
        m.id === contextMenu.messageId ? updatedMessage : m
      ));
      setShowEmojiPicker(false);
      setContextMenu(null);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    setShowScrollButton(false);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleDeleteChat = async () => {
    if (!user || !chatId) return;

    const confirmMessage = isGroupChat 
      ? 'Delete this group chat? You can restore it later from deleted messages.'
      : 'Delete this conversation? You can restore it later from deleted messages.';

    if (confirm(confirmMessage)) {
      try {
        if (conversationDetails) {
          await ConversationService.deleteConversation(user.id, chatId);
        } else {
          await MessageService.deleteConversation(user.id, chatId);
        }
        navigate('/messages');
      } catch (error) {
        console.error('Error deleting chat:', error);
        alert('Failed to delete chat');
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || !chatId || !isGroupChat) return;

    if (confirm('Leave this group? You won\'t receive messages anymore.')) {
      try {
        await ConversationService.leaveGroupConversation(user.id, chatId);
        navigate('/messages');
      } catch (error) {
        console.error('Error leaving group:', error);
        alert('Failed to leave group');
      }
    }
  };

  const handleReport = () => {
    setShowMenu(false);
    setShowReportModal(true);
  };

  const handleReportSubmit = async (
    reason: string,
    additionalContext: string,
    shouldBlock: boolean,
    shouldHide: boolean
  ) => {
    if (!user || !chatId) return;

    try {
      if (isGroupChat) {
        await MessageService.reportConversation(
          user.id,
          chatId,
          reason,
          additionalContext,
          shouldHide
        );
      } else if (otherUserProfile) {
        await MessageService.reportUser(
          user.id,
          otherUserProfile.id!,
          chatId,
          reason,
          additionalContext,
          shouldBlock,
          shouldHide
        );
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  };

  const handleAddParticipants = () => {
    setShowMenu(false);
    setShowAddParticipantsModal(true);
  };

  const handleParticipantsAdded = () => {
    // Reload conversation details to show new participants
    loadConversationDetails();
  };

  const renderMessage = (message: Message) => {
    try {
      const isMine = message.senderId === user?.id;
      let touchTimer: NodeJS.Timeout;

      const handleTouchStart = (e: React.TouchEvent) => {
        touchTimer = setTimeout(() => {
          handleLongPress(message.id, e);
        }, 500);
      };

      const handleTouchEnd = () => {
        clearTimeout(touchTimer);
      };

      const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        handleLongPress(message.id, e);
      };

      return (
        <div
          key={message.id}
          className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}
        >
          <div className="max-w-[70%] relative group">
            <div
              className={`${
                isMine
                  ? 'bg-pink-600 text-white rounded-l-2xl rounded-tr-2xl'
                  : 'bg-gray-800 text-white rounded-r-2xl rounded-tl-2xl'
              } px-4 py-2 cursor-pointer shadow-lg`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onContextMenu={handleContextMenu}
            >
              {message.replyToMessage && (
                <div className="mb-2 pb-2 border-l-2 border-white/30 pl-2 opacity-70">
                  <p className="text-xs font-semibold">Replying to</p>
                  <p className="text-xs truncate">{message.replyToMessage.content}</p>
                </div>
              )}

              {message.messageType === 'text' && (
                <p className="text-sm break-words">{message.content}</p>
              )}

              {(message.messageType === 'image' || message.messageType === 'video') && message.mediaUrl && (
                <MediaMessage message={message} onMessageUpdate={handleMessageUpdate} />
              )}

              {message.messageType === 'voice' && message.mediaUrl && (
                <div className="py-2">
                  <audio controls className="max-w-full w-64" preload="metadata" controlsList="nodownload">
                    <source src={message.mediaUrl} type="audio/webm" />
                    <source src={message.mediaUrl} type="audio/ogg" />
                    <source src={message.mediaUrl} type="audio/mp4" />
                    <source src={message.mediaUrl} type="audio/mpeg" />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(
                    message.reactions.reduce((acc: Record<string, number>, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count]) => {
                    const userReacted = message.reactions?.some(
                      r => r.emoji === emoji && r.userId === user?.id
                    );
                    return (
                      <button
                        key={emoji}
                        onClick={async () => {
                          if (!user) return;
                          try {
                            const updatedMessage = await MessageService.toggleReaction(message.id, user.id, emoji);
                            setMessages(prev => prev.map(m => 
                              m.id === message.id ? updatedMessage : m
                            ));
                          } catch (error) {
                            console.error('Error toggling reaction:', error);
                          }
                        }}
                        className={`text-sm px-2 py-0.5 rounded-full ${
                          userReacted ? 'bg-pink-500/30' : 'bg-white/10'
                        } hover:bg-pink-500/20 transition-colors`}
                      >
                        {emoji} {count}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                <span>{formatTime(message.createdAt)}</span>
                {isMine && (
                  <span className="ml-2">
                    {message.isRead ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering message:', error, message);
      return (
        <div key={message.id} className="flex justify-center mb-4">
          <div className="bg-red-500/20 text-red-200 px-4 py-2 rounded-lg text-xs">
            Unable to display this message
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black">
      {/* Instagram-style Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-pink-500/30 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-pink-400 transition-colors"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1"
            >
              {isGroupChat && conversationDetails ? (
                // Group chat - show grouped avatars
                <GroupAvatar
                  participants={conversationDetails.participants
                    .filter(p => p.isActive)
                    .map(p => ({
                      id: p.userId,
                      name: p.profile?.displayName || 'User',
                      photo: p.profile?.photos?.[0]
                    }))}
                  size="md"
                  maxDisplay={3}
                />
              ) : (
                // Direct chat - show single avatar
                <Avatar className="h-10 w-10 border-2 border-pink-500/30">
                  <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                  <AvatarFallback className="bg-pink-600 text-white">
                    {otherUserName[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-base">{otherUserName}</h3>
                  {isGroupChat && conversationDetails && (
                    <span className="text-white/60 text-xs">
                      ({conversationDetails.participants.filter(p => p.isActive).length} members)
                    </span>
                  )}
                </div>
                {isTyping && (
                  <p className="text-xs text-pink-400 animate-pulse">typing...</p>
                )}
              </div>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-white hover:text-pink-400 transition-colors p-2"
              >
                <MoreVertical className="h-6 w-6" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 bg-gray-900 border border-pink-500/30 rounded-lg shadow-xl z-50 min-w-[200px]">
                    {isGroupChat && (
                      <>
                        <button
                          onClick={handleAddParticipants}
                          className="w-full px-4 py-3 text-left text-white hover:bg-pink-500/10 flex items-center gap-3 transition-colors"
                        >
                          <UserPlus className="h-5 w-5" />
                          <span>Add Participants</span>
                        </button>
                        <button
                          onClick={handleLeaveGroup}
                          className="w-full px-4 py-3 text-left text-white hover:bg-pink-500/10 flex items-center gap-3 transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Leave Group</span>
                        </button>
                        <div className="border-t border-gray-800 my-1" />
                      </>
                    )}
                    <button
                      onClick={handleReport}
                      className="w-full px-4 py-3 text-left text-white hover:bg-pink-500/10 flex items-center gap-3 transition-colors"
                    >
                      <Flag className="h-5 w-5" />
                      <span>Report {isGroupChat ? 'Conversation' : 'User'}</span>
                    </button>
                    <div className="border-t border-gray-800 my-1" />
                    <button
                      onClick={handleDeleteChat}
                      className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors rounded-b-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>Delete Chat</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#ec4899 transparent' }}
      >
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-32 right-6 z-10">
          <Button
            onClick={() => scrollToBottom('smooth')}
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-2xl h-12 w-12 p-0"
          >
            <ChevronLeft className="h-6 w-6 rotate-[-90deg]" />
          </Button>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="px-4 py-3 bg-red-500/20 border-t border-red-500/50 text-red-200 text-sm">
          {uploadError}
        </div>
      )}

      {/* Media Preview */}
      {mediaPreview && (
        <div className="px-4 py-4 border-t border-pink-500/30 bg-black/90">
          <div className="relative">
            {mediaType === 'image' && (
              <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg" />
            )}
            {mediaType === 'video' && (
              <video src={mediaPreview} className="max-h-48 rounded-lg" controls />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMediaSelection}
              className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/90"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {showSelfDestructMenu && (
            <div className="mt-3">
              <p className="text-white text-sm mb-2">Self-destruct timer:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSelfDestruct === undefined ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSelfDestruct(undefined)}
                  className="text-xs"
                >
                  No timer
                </Button>
                {SELF_DESTRUCT_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={selectedSelfDestruct === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSelfDestruct(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleSendMedia}
                disabled={isSending}
                className="w-full mt-3 bg-pink-600 hover:bg-pink-700 text-white"
              >
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 pt-3 pb-2 border-t border-pink-500/30 bg-black/90">
          <div className="bg-gray-900/60 border-l-4 border-pink-500 p-3 rounded">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-pink-400 font-semibold mb-1">Replying to</p>
                <p className="text-sm text-white truncate">{replyingTo.content}</p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-white/70 hover:text-white ml-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Bar - Instagram Style */}
      <div className="border-t border-pink-500/30 bg-black/95 backdrop-blur-sm flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'image')}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFileSelect(e, 'video')}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-pink-400 hover:bg-pink-500/10 h-10 w-10 p-0 rounded-full"
            disabled={isSending}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
            className="text-pink-400 hover:bg-pink-500/10 h-10 w-10 p-0 rounded-full"
            disabled={isSending}
          >
            <Video className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`text-pink-400 hover:bg-pink-500/10 h-10 w-10 p-0 rounded-full ${
              isRecording ? 'bg-red-500/50 animate-pulse' : ''
            }`}
            disabled={isSending}
            title={isRecording ? 'Stop recording' : 'Record voice message'}
          >
            <Mic className="h-5 w-5" />
          </Button>

          {isRecording && (
            <span className="text-red-500 text-xs animate-pulse font-medium">Recording...</span>
          )}

          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message..."
              className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500 rounded-full px-4 h-10 focus:ring-pink-500 focus:border-pink-500"
              disabled={isSending || isRecording}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isSending}
            className="bg-transparent hover:bg-transparent text-pink-400 hover:text-pink-300 h-10 w-10 p-0 disabled:opacity-50 transition-colors"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          message={messages.find(m => m.id === contextMenu.messageId)!}
          isMine={messages.find(m => m.id === contextMenu.messageId)?.senderId === user?.id}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onCopy={() => {
            const msg = messages.find(m => m.id === contextMenu.messageId);
            if (msg) handleCopyMessage(msg);
          }}
          onReply={() => {
            const msg = messages.find(m => m.id === contextMenu.messageId);
            if (msg) handleReplyTo(msg);
          }}
          onUnsend={() => handleUnsendMessage(contextMenu.messageId)}
          onReact={() => handleReactToMessage(contextMenu.messageId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => {
            setShowEmojiPicker(false);
            setContextMenu(null);
          }}
        />
      )}

      {/* Profile Modal */}
      {otherUserProfile && (
        <ProfileDetailModal
          profile={otherUserProfile}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        reportType={isGroupChat ? 'conversation' : 'user'}
        targetName={otherUserName}
      />

      {/* Add Participants Modal */}
      {isGroupChat && conversationDetails && (
        <AddParticipantsModal
          isOpen={showAddParticipantsModal}
          onClose={() => setShowAddParticipantsModal(false)}
          conversationId={chatId!}
          currentParticipantIds={conversationDetails.participants.map(p => p.userId)}
          onSuccess={handleParticipantsAdded}
        />
      )}
    </div>
  );
};

// Media Message Component with Self-Destruct (same as before)
const MediaMessage: React.FC<{ 
  message: Message;
  onMessageUpdate: (updatedMessage: Message) => void;
}> = ({ message, onMessageUpdate }) => {
  const { user } = useAuth();
  const [isViewed, setIsViewed] = useState(!!message.firstViewedAt);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSender = message.senderId === user?.id;

  useEffect(() => {
    if (message.expiresAt) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const expires = new Date(message.expiresAt!).getTime();
        const remaining = Math.max(0, Math.floor((expires - now) / 1000));
        
        setTimeRemaining(remaining);
        return remaining;
      };

      updateCountdown();
      const interval = setInterval(() => {
        const remaining = updateCountdown();
        if (remaining === 0) {
          clearInterval(interval);
          onMessageUpdate({
            ...message,
            isDeleted: true,
            deletedAt: new Date().toISOString()
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [message.expiresAt, message, onMessageUpdate]);

  const handleView = async () => {
    if (!isViewed && message.selfDestructSeconds && !isSender && user) {
      setIsLoading(true);
      try {
        let updatedMessage: Message;
        
        // Check if it's a group chat by checking if message has conversationId
        if (message.conversationId) {
          // Group chat - use group viewing logic
          const result = await MessageService.markMediaViewedGroup(message.id, user.id);
          updatedMessage = result.message;
          
          // If all viewed, timer has started
          if (result.allViewed) {
            console.log('All participants have viewed the media. Timer started.');
          }
        } else {
          // Direct message - use standard viewing logic
          updatedMessage = await MessageService.markMediaViewed(message.id);
        }
        
        setIsViewed(true);
        onMessageUpdate(updatedMessage);
      } catch (err: any) {
        console.error('Error marking media as viewed:', err);
        setError(err.message || 'Failed to load media');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!message || !message.id) {
    return (
      <div className="text-red-200 text-xs p-2">
        Invalid message data
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-200 text-xs p-2">
        Error loading media: {error}
      </div>
    );
  }

  if (message.isDeleted) {
    return (
      <div className="flex items-center gap-2 text-white/50 italic text-sm py-4">
        <Clock className="h-4 w-4" />
        <span>This media has expired and been deleted</span>
      </div>
    );
  }

  if (message.selfDestructSeconds && !isViewed && !isSender) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-black/20 rounded-lg">
        <Clock className="h-8 w-8 text-pink-400" />
        <p className="text-sm font-semibold">Tap to view</p>
        <p className="text-xs opacity-70 text-center">
          This media will self-destruct after {message.selfDestructSeconds} seconds once opened
        </p>
        <Button
          onClick={handleView}
          disabled={isLoading}
          className="mt-2 bg-pink-600 hover:bg-pink-700 text-white"
          size="sm"
        >
          {isLoading ? 'Loading...' : 'View Media'}
        </Button>
      </div>
    );
  }

  if (message.selfDestructSeconds && !message.firstViewedAt && isSender) {
    return (
      <div className="relative">
        {message.messageType === 'image' && (
          <img
            src={message.mediaUrl}
            alt="Shared image"
            className="max-w-full rounded-lg"
          />
        )}
        {message.messageType === 'video' && (
          <video
            src={message.mediaUrl}
            className="max-w-full rounded-lg"
            controls
          />
        )}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Waiting to be viewed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {message.messageType === 'image' && (
        <img
          src={message.mediaUrl}
          alt="Shared image"
          className="max-w-full rounded-lg"
        />
      )}
      {message.messageType === 'video' && (
        <video
          src={message.mediaUrl}
          className="max-w-full rounded-lg"
          controls
        />
      )}
      {timeRemaining !== null && timeRemaining > 0 && (
        <div className="absolute top-2 right-2 bg-red-600/90 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 animate-pulse">
          <Clock className="h-4 w-4" />
          <span>Expires in {timeRemaining}s</span>
        </div>
      )}
      {timeRemaining !== null && timeRemaining === 0 && (
        <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Media expired</p>
          </div>
        </div>
      )}
    </div>
  );
};
