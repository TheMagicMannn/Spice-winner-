// Photo Visibility Selector Component
import React from 'react';
import { PhotoItem, Visibility } from '../types/profile';

interface PhotoVisibilitySelectorProps {
  photo: PhotoItem;
  onVisibilityChange: (photoId: string, visibility: Visibility) => void;
  onBlurToggle?: (photoId: string, isBlurred: boolean) => void;
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: string; color: string }[] = [
  { value: 'public', label: 'Public', icon: '🌐', color: 'text-green-400' },
  { value: 'matches_only', label: 'Matches Only', icon: '🔒', color: 'text-yellow-400' },
  { value: 'private', label: 'Private', icon: '👁️', color: 'text-red-400' },
];

export const PhotoVisibilitySelector: React.FC<PhotoVisibilitySelectorProps> = ({
  photo,
  onVisibilityChange,
  onBlurToggle,
}) => {
  const currentOption = VISIBILITY_OPTIONS.find((opt) => opt.value === photo.visibility) || VISIBILITY_OPTIONS[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{currentOption.icon}</span>
        <select
          value={photo.visibility}
          onChange={(e) => onVisibilityChange(photo.id, e.target.value as Visibility)}
          className="flex-1 bg-black/50 border border-brand-primary/50 text-white rounded-lg py-1 px-2 text-sm"
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>

      {onBlurToggle && photo.visibility === 'matches_only' && (
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={photo.isBlurredUntilMatch || false}
            onChange={(e) => onBlurToggle(photo.id, e.target.checked)}
            className="toggle scale-75"
          />
          <span>Blur until match</span>
        </label>
      )}
    </div>
  );
};
