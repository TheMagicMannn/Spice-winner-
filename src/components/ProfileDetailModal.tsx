import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, ChevronLeft, ChevronRight, MapPin, Users, Crown, Shield, 
  Star, Sparkles, Heart, MessageSquare 
} from 'lucide-react';
import { spiceTheme } from '@/styles/theme';
import { Profile } from '@/types';

interface ProfileDetailModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onLike?: () => void;
  onMessage?: () => void;
  showActions?: boolean;
  compatibilityScore?: number;
  distanceMiles?: number | null;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  onLike,
  onMessage,
  showActions = true,
  compatibilityScore,
  distanceMiles
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!profile) return null;

  const photos = profile.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  const getDisplayName = () => {
    if (profile.accountType === 'couple' && profile.displayName2) {
      return `${profile.displayName} & ${profile.displayName2}`;
    }
    return profile.displayName || 'Anonymous';
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const formatDistance = (miles: number) => {
    if (miles < 1) return 'Less than 1 mile away';
    if (miles < 10) return `${Math.round(miles)} miles away`;
    return `${Math.round(miles / 10) * 10}+ miles away`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 border border-pink-500/30 p-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/70 backdrop-blur-sm text-white hover:bg-black/90 transition-all flex items-center justify-center"
          data-testid="button-close-profile-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Photo Carousel */}
        <div className="relative">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[currentPhotoIndex]}
                alt={`${getDisplayName()} - Photo ${currentPhotoIndex + 1}`}
                className="w-full h-96 object-cover"
                data-testid={`img-profile-photo-${currentPhotoIndex}`}
              />

              {/* Photo Navigation */}
              {hasMultiplePhotos && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 backdrop-blur-sm text-white hover:bg-black/90 transition-all flex items-center justify-center"
                    data-testid="button-prev-photo"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 backdrop-blur-sm text-white hover:bg-black/90 transition-all flex items-center justify-center"
                    data-testid="button-next-photo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Photo Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          index === currentPhotoIndex
                            ? 'bg-pink-500 w-6'
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                        data-testid={`button-photo-dot-${index}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-pink-900/30 to-black flex items-center justify-center">
              <p className="text-white/60">No photos available</p>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Profile Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {profile.isVerified && (
              <Badge className={`${spiceTheme.components.badge.verified} animate-glow`}>
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {profile.membershipTier === 'vip' && (
              <Badge className={`${spiceTheme.components.badge.premium} animate-glow`}>
                <Crown className="h-3 w-3 mr-1" />
                VIP
              </Badge>
            )}
          </div>

          {/* Compatibility Badge */}
          {compatibilityScore !== undefined && (
            <div className="absolute top-4 right-16">
              <Badge className="bg-black/70 backdrop-blur-sm text-pink-400 border-0 text-sm font-semibold">
                <Star className="h-3 w-3 mr-1" />
                {compatibilityScore}% Match
              </Badge>
            </div>
          )}

          {/* Distance Badge */}
          {distanceMiles !== null && distanceMiles !== undefined && (
            <div className="absolute bottom-20 left-4">
              <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
                <MapPin className="h-3 w-3 mr-1" />
                {formatDistance(distanceMiles)}
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          {/* Name and Basic Info */}
          <div>
            <h2 className={`text-2xl font-bold ${spiceTheme.components.text.gradient}`} data-testid="text-modal-profile-name">
              {getDisplayName()}
            </h2>
            <div className="flex items-center gap-2 text-white/60 mt-1">
              <span>{profile.age || 'Age not specified'}</span>
              {profile.age2 && profile.accountType === 'couple' && (
                <span>& {profile.age2}</span>
              )}
              <Badge className={spiceTheme.components.badge.pink}>
                {profile.accountType}
              </Badge>
            </div>
          </div>

          {/* Location */}
          {profile.location && (
            <div className="flex items-center text-white/60">
              <MapPin className="h-4 w-4 mr-2 text-pink-400" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="text-white font-semibold mb-2">About</h3>
              <p className="text-white/80 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-pink-400" />
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <Badge key={idx} variant="outline" className="text-pink-400 border-pink-400/50">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Seeking */}
          {profile.seeking && profile.seeking.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Seeking</h3>
              <div className="flex flex-wrap gap-2">
                {profile.seeking.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="text-purple-400 border-purple-400/50">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Kinks */}
          {profile.kinks && profile.kinks.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Kinks & Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.kinks.map((kink, idx) => (
                  <Badge key={idx} variant="outline" className="text-red-400 border-red-400/50">
                    {kink}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Soft Limits */}
          {profile.softLimits && profile.softLimits.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Soft Limits</h3>
              <div className="flex flex-wrap gap-2">
                {profile.softLimits.map((limit, idx) => (
                  <Badge key={idx} variant="outline" className="text-yellow-400 border-yellow-400/50">
                    {limit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Hard Limits */}
          {profile.hardLimits && profile.hardLimits.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Hard Limits</h3>
              <div className="flex flex-wrap gap-2">
                {profile.hardLimits.map((limit, idx) => (
                  <Badge key={idx} variant="outline" className="text-red-500 border-red-500/50">
                    {limit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Relationship Status & Experience */}
          <div className="grid grid-cols-2 gap-4">
            {profile.relationshipStatus && (
              <div>
                <h3 className="text-white/60 text-sm mb-1">Relationship Status</h3>
                <p className="text-white">{profile.relationshipStatus}</p>
              </div>
            )}
            {profile.lifestyleExperience && (
              <div>
                <h3 className="text-white/60 text-sm mb-1">Experience Level</h3>
                <p className="text-white">{profile.lifestyleExperience}</p>
              </div>
            )}
          </div>

          {/* Gender & Orientation */}
          <div className="grid grid-cols-2 gap-4">
            {profile.gender && (
              <div>
                <h3 className="text-white/60 text-sm mb-1">Gender</h3>
                <p className="text-white">
                  {profile.gender}
                  {profile.gender2 && profile.accountType === 'couple' && ` & ${profile.gender2}`}
                </p>
              </div>
            )}
            {profile.orientation && (
              <div>
                <h3 className="text-white/60 text-sm mb-1">Orientation</h3>
                <p className="text-white">
                  {profile.orientation}
                  {profile.orientation2 && profile.accountType === 'couple' && ` & ${profile.orientation2}`}
                </p>
              </div>
            )}
          </div>

          {/* Safety Practices */}
          {profile.safetyPractices && (
            <div>
              <h3 className="text-white font-semibold mb-2">Safety Practices</h3>
              <p className="text-white/80">{profile.safetyPractices}</p>
            </div>
          )}

          {/* Rules */}
          {profile.rules && (
            <div>
              <h3 className="text-white font-semibold mb-2">Rules</h3>
              <p className="text-white/80">{profile.rules}</p>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-3 pt-4">
              {onLike && (
                <Button
                  onClick={onLike}
                  className={`flex-1 ${spiceTheme.components.button.gradient}`}
                  data-testid="button-modal-like"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
              )}
              {onMessage && (
                <Button
                  onClick={onMessage}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                  data-testid="button-modal-message"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
