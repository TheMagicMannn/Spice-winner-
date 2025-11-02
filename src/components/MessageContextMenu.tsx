import React from 'react';
import { Message } from '../services/messageService';
import { Copy, Reply, Trash2, Smile } from 'lucide-react';

interface MessageContextMenuProps {
  message: Message;
  isMine: boolean;
  position: { x: number; y: number };
  onCopy: () => void;
  onReply: () => void;
  onUnsend: () => void;
  onReact: () => void;
  onClose: () => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  isMine,
  position,
  onCopy,
  onReply,
  onUnsend,
  onReact,
  onClose
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div
        className="fixed z-50 bg-gray-900 rounded-lg shadow-xl border border-pink-500/30 py-2 min-w-[180px]"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          transform: 'translateY(-100%)'
        }}
      >
        {/* React */}
        <button
          onClick={onReact}
          className="w-full px-4 py-2 text-left text-white hover:bg-pink-500/10 flex items-center gap-3 transition-colors"
        >
          <Smile className="h-4 w-4" />
          <span>React</span>
        </button>

        {/* Reply */}
        <button
          onClick={onReply}
          className="w-full px-4 py-2 text-left text-white hover:bg-pink-500/10 flex items-center gap-3 transition-colors"
        >
          <Reply className="h-4 w-4" />
          <span>Reply</span>
        </button>

        {/* Copy (only for text messages) */}
        {message.messageType === 'text' && (
          <button
            onClick={onCopy}
            className="w-full px-4 py-2 text-left text-white hover:bg-pink-500/10 flex items-center gap-3 transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </button>
        )}

        {/* Unsend (only for own messages) */}
        {isMine && (
          <>
            <div className="border-t border-gray-700 my-1" />
            <button
              onClick={onUnsend}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Unsend</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};