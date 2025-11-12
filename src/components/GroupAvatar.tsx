import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface GroupAvatarProps {
  participants: Array<{
    id: string;
    name: string;
    photo?: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
}

/**
 * GroupAvatar Component
 * Displays multiple user avatars grouped together in an overlapping style
 * Perfect for group chat headers
 */
export const GroupAvatar: React.FC<GroupAvatarProps> = ({ 
  participants, 
  size = 'md',
  maxDisplay = 3 
}) => {
  // Size configurations
  const sizeConfig = {
    sm: { container: 'h-8', avatar: 'h-6 w-6', text: 'text-[10px]', offset: '-ml-2' },
    md: { container: 'h-10', avatar: 'h-8 w-8', text: 'text-xs', offset: '-ml-3' },
    lg: { container: 'h-12', avatar: 'h-10 w-10', text: 'text-sm', offset: '-ml-3' }
  };

  const config = sizeConfig[size];
  const displayParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  if (participants.length === 0) {
    return (
      <Avatar className={`${config.avatar} border-2 border-black`}>
        <AvatarFallback className="bg-pink-600 text-white">
          G
        </AvatarFallback>
      </Avatar>
    );
  }

  if (participants.length === 1) {
    // Single participant - show normal avatar
    const participant = participants[0];
    return (
      <Avatar className={`${config.avatar} border-2 border-pink-500/30`}>
        <AvatarImage src={participant.photo} alt={participant.name} />
        <AvatarFallback className="bg-pink-600 text-white">
          {participant.name[0] || '?'}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Multiple participants - show grouped/overlapping avatars
  return (
    <div className={`flex items-center ${config.container}`}>
      {displayParticipants.map((participant, index) => (
        <Avatar 
          key={participant.id}
          className={`${config.avatar} border-2 border-black ${index > 0 ? config.offset : ''} relative z-${10 - index}`}
          style={{ zIndex: displayParticipants.length - index }}
        >
          <AvatarImage src={participant.photo} alt={participant.name} />
          <AvatarFallback className="bg-pink-600 text-white">
            {participant.name[0] || '?'}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={`${config.avatar} ${config.offset} rounded-full bg-gray-800 border-2 border-black flex items-center justify-center relative`}
          style={{ zIndex: 0 }}
        >
          <span className={`${config.text} text-white font-semibold`}>
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};
