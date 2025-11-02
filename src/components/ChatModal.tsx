import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  CheckCheck
} from 'lucide-react';
import { MessageService, Message } from '@/services/messageService';
import { useAuth } from '@/hooks/useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { MessageContextMenu } from './MessageContextMenu';
import { EmojiPicker } from './EmojiPicker';

interface ChatModalProps {
  matchId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto: string;
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
}

const SELF_DESTRUCT_OPTIONS = [
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '1 hour', value: 3600 },
  { label: '24 hours', value: 86400 },
  { label: '7 days', value: 604800 }
];

// File size limits in bytes
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024,  // 50MB
  voice: 5 * 1024 * 1024    // 5MB
};

export const ChatModal: React.FC<ChatModalProps> = ({
  matchId,
  otherUserId,
  otherUserName,
  otherUserPhoto,
  isOpen,
  onClose,
  onProfileClick
}) => {
  const { user } = useAuth();
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
  // Load messages
  useEffect(() => {
    if (isOpen && matchId) {
      loadMessages();
      markAsRead();
    }
  }, [isOpen, matchId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (isOpen && matchId && user) {
      messageChannelRef.current = MessageService.subscribeToMessages(
        matchId,
        handleNewMessage
      );

      typingChannelRef.current = MessageService.subscribeToTyping(
        matchId,
        user.id,
        setIsTyping
      );

      return () => {
        messageChannelRef.current?.unsubscribe();
        typingChannelRef.current?.unsubscribe();
      };
    }
  }, [isOpen, matchId, user]);

  // Check if user is scrolled near the bottom
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    const threshold = 150; // pixels from bottom
    const position = container.scrollTop + container.clientHeight;
    const bottom = container.scrollHeight;
    
    return bottom - position < threshold;
  };

  // Auto-scroll to bottom only if user is near bottom or on initial load
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

  // Also scroll when modal opens and reset initial load flag
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      isInitialLoadRef.current = true;
      setTimeout(() => scrollToBottom('auto'), 200);
    }
  }, [isOpen]);

  const loadMessages = async () => {
    try {
      const loadedMessages = await MessageService.getMessages(matchId);
      setMessages(loadedMessages);
      // Scroll instantly on initial load
      setTimeout(() => scrollToBottom('auto'), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async () => {
    if (user) {
      await MessageService.markConversationAsRead(matchId, user.id);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => {
      const exists = prev.find(m => m.id === message.id);
      if (exists) {
        return prev.map(m => m.id === message.id ? message : m);
      }
      
      // Show scroll button if user is not at bottom and new message arrives
      if (!isNearBottom() && message.senderId !== user?.id) {
        setShowScrollButton(true);
      }
      
      return [...prev, message];
    });

    // Mark as read if it's from the other user
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
    if (!inputText.trim() || !user || isSending) return;

    setIsSending(true);
    const messageText = inputText;
    setInputText(''); // Clear input immediately for better UX
    
    try {
      let newMessage;
      if (replyingTo) {
        // Send as reply
        newMessage = await MessageService.sendReplyMessage(matchId, user.id, messageText, replyingTo.id);
        setReplyingTo(null);
      } else {
        // Send normal message
        newMessage = await MessageService.sendMessage(matchId, user.id, messageText);
      }
      // Add message immediately to UI
      handleNewMessage(newMessage);
      handleTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(messageText); // Restore text on error
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (typing: boolean) => {
    if (!user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      MessageService.setTyping(matchId, user.id, true);
      typingTimeoutRef.current = setTimeout(() => {
        MessageService.setTyping(matchId, user.id, false);
      }, 3000);
    } else {
      MessageService.setTyping(matchId, user.id, false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    handleTyping(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
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
    if (!selectedMedia || !mediaType || !user) return;

    setIsSending(true);
    setUploadError(null);
    try {
      const newMessage = await MessageService.sendMediaMessage(
        matchId,
        user.id,
        selectedMedia,
        mediaType,
        selectedSelfDestruct
      );
      // Add message immediately to UI
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
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Try different mime types for better browser compatibility
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
        
        if (user) {
          setIsSending(true);
          try {
            const newMessage = await MessageService.sendMediaMessage(matchId, user.id, audioFile, 'voice');
            // Add message immediately to UI
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
      
      // Provide specific error messages
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

  // Message interaction handlers
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
      // Could add a toast notification here
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
      // Update local state
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
    // Keep the message ID and show emoji picker
    setContextMenu({ messageId, x: 0, y: 0 });
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (!user || !contextMenu) return;
    
    try {
      const updatedMessage = await MessageService.toggleReaction(contextMenu.messageId, user.id, emoji);
      // Update local state
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
          className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}
        >
          <div className="max-w-[70%] relative group">
            <div
              className={`${
                isMine
                  ? 'bg-pink-600 text-white rounded-l-2xl rounded-tr-2xl'
                  : 'bg-black/40 text-white rounded-r-2xl rounded-tl-2xl'
              } px-4 py-2 cursor-pointer`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onContextMenu={handleContextMenu}
            >
              {/* Reply preview */}
              {message.replyToMessage && (
                <div className="mb-2 pb-2 border-l-2 border-white/30 pl-2 opacity-70">
                  <p className="text-xs font-semibold">Replying to</p>
                  <p className="text-xs truncate">{message.replyToMessage.content}</p>
                </div>
              )}

              {/* Message content */}
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

              {/* Reactions */}
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
      // Return error message instead of crashing
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[80vh] p-0 bg-black/95 border-pink-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-500/30">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-pink-500/10 -ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <button
              onClick={onProfileClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                <AvatarFallback>{otherUserName[0]}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h3 className="text-white font-semibold">{otherUserName}</h3>
                {isTyping && (
                  <p className="text-xs text-pink-400">typing...</p>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 scroll-smooth"
        >
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="absolute bottom-24 right-8 z-10">
            <Button
              onClick={() => scrollToBottom('smooth')}
              className="bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg"
              size="sm"
            >
              <ChevronLeft className="h-5 w-5 rotate-[-90deg]" />
              <span className="ml-1">New messages</span>
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
          <div className="p-4 border-t border-pink-500/30 bg-black/50">
            <div className="relative">
              {mediaType === 'image' && (
                <img src={mediaPreview} alt="Preview" className="max-h-40 rounded-lg" />
              )}
              {mediaType === 'video' && (
                <video src={mediaPreview} className="max-h-40 rounded-lg" controls />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMediaSelection}
                className="absolute top-2 right-2 bg-black/50 text-white"
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

        {/* Input */}
        <div className="border-t border-pink-500/30">
          {/* Reply Preview */}
          {replyingTo && (
            <div className="px-4 pt-2 pb-0">
              <div className="bg-black/60 border-l-2 border-pink-500 p-2 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-pink-400 font-semibold">Replying to</p>
                    <p className="text-sm text-white truncate">{replyingTo.content}</p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-white/70 hover:text-white ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 flex items-center gap-2">
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
              className="text-white hover:bg-pink-500/10"
              disabled={isSending}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              className="text-white hover:bg-pink-500/10"
              disabled={isSending}
            >
              <Video className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`text-white hover:bg-pink-500/10 ${isRecording ? 'bg-red-500/50 animate-pulse' : ''}`}
              disabled={isSending}
              title={isRecording ? 'Stop recording' : 'Record voice message'}
            >
              <Mic className="h-5 w-5" />
            </Button>

            {isRecording && (
              <span className="text-red-500 text-xs animate-pulse">Recording...</span>
            )}

            <Input
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-black/30 border-pink-500/30 text-white"
              disabled={isSending || isRecording}
            />

            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              className="bg-pink-600 hover:bg-pink-700 text-white"
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
      </DialogContent>
    </Dialog>
  );
};

// Media Message Component with Self-Destruct
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

      updateCountdown(); // Run immediately
      const interval = setInterval(() => {
        const remaining = updateCountdown();
        if (remaining === 0) {
          clearInterval(interval);
          // Mark as deleted locally
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
    if (!isViewed && message.selfDestructSeconds && !isSender) {
      setIsLoading(true);
      try {
        // Mark as viewed in database and get updated message
        const updatedMessage = await MessageService.markMediaViewed(message.id);
        setIsViewed(true);
        
        // Update the message in parent state with expires_at
        onMessageUpdate(updatedMessage);
      } catch (err: any) {
        console.error('Error marking media as viewed:', err);
        setError(err.message || 'Failed to load media');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle errors gracefully
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

  // Show "Tap to view" for receiver when media has self-destruct and hasn't been viewed
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

  // Show countdown info for sender before receiver views
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
