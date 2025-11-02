import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const popularEmojis = [
  '❤️', '😂', '😍', '🔥', '👍', '😢', '😮', '😡',
  '💯', '🎉', '👏', '🙏', '💪', '😘', '🥰', '😎',
  '🤔', '😅', '😭', '🤗', '🤩', '😇', '🥺', '😊'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Picker */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 rounded-lg shadow-xl border border-pink-500/30 p-3">
        <div className="grid grid-cols-8 gap-2">
          {popularEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="text-2xl hover:bg-pink-500/10 rounded p-2 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};