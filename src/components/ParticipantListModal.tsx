import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, Crown, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { spiceTheme } from '@/styles/theme';

interface Participant {
  userId: string;
  name: string;
  photo?: string;
  isVerified?: boolean;
  membershipTier?: string;
  isOnline?: boolean;
}

interface ParticipantListModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  title?: string;
}

export const ParticipantListModal: React.FC<ParticipantListModalProps> = ({
  isOpen,
  onClose,
  participants,
  title = 'Group Participants'
}) => {
  const navigate = useNavigate();

  const handleParticipantClick = (userId: string) => {
    onClose();
    navigate(`/user/${userId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-black/95 border border-pink-500/30 p-0">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-pink-500/30 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            data-testid="close-participants-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Participants List */}
        <div className="p-4 space-y-2">
          {participants.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No participants to show</p>
            </div>
          ) : (
            participants.map((participant) => (
              <button
                key={participant.userId}
                onClick={() => handleParticipantClick(participant.userId)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 transition-all"
                data-testid={`participant-${participant.userId}`}
              >
                {/* Avatar with Online Indicator */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={participant.photo} alt={participant.name} />
                    <AvatarFallback className="bg-pink-600 text-white">
                      {participant.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{participant.name}</span>
                    {participant.isVerified && (
                      <Shield className="h-4 w-4 text-blue-400" />
                    )}
                    {participant.membershipTier === 'vip' && (
                      <Crown className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-white/60 text-sm">Tap to view profile</p>
                </div>

                {/* Arrow */}
                <div className="text-white/50">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
