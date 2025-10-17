import React, { useState } from 'react';
import { Profile } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Heart, 
  MessageSquare, 
  MapPin, 
  Users, 
  Crown, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  User
} from 'lucide-react';
import { spiceTheme } from '../styles/theme';

interface ProfileCardProps {
  profile: Profile;
  onLike?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
  onPass?: (profileId: string) => void;
  showActions?: boolean;
  variant?: 'full' | 'compact' | 'browse';
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onLike,
  onMessage,
  onPass,
  showActions = true,
  variant = 'full',
  className = ''
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = profile.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  // Handle photo navigation
  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultiplePhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultiplePhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  // Calculate age display
  const getAgeDisplay = () => {
    if (profile.accountType === 'couple') {
      return `${profile.age || '?'} & ${profile.age2 || '?'}`;
    }
    return profile.age || 'Age not specified';
  };

  // Get location display
  const getLocationDisplay = () => {
    return profile.location || 'Location not specified';
  };

  // Get name display
  const getNameDisplay = () => {
    if (profile.accountType === 'couple' && profile.displayName2) {
      return `${profile.displayName || 'User'} & ${profile.displayName2}`;
    }
    return profile.displayName || 'User';
  };

  const renderCompactCard = () => (
    <Card className={`${spiceTheme.components.card} ${className}`} data-testid={`profile-card-${profile.id}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Profile Image */}
          <div className="relative">
            <img
              src={photos[currentPhotoIndex] || '/placeholder-avatar.png'}
              alt={getNameDisplay()}
              className="w-16 h-16 rounded-lg object-cover"
            />
            {profile.isVerified && (
              <Badge className={`absolute -top-1 -right-1 ${spiceTheme.components.badge.verified} text-xs p-1`}>
                <Shield className="h-3 w-3" />
              </Badge>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{getNameDisplay()}</h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Calendar className="h-3 w-3" />
              <span>{getAgeDisplay()}</span>
              <Badge variant="outline" className={spiceTheme.components.badge.pink}>
                {profile.accountType}
              </Badge>
            </div>
            {profile.location && (
              <div className="flex items-center text-xs text-white/50 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFullCard = () => (
    <Card className={`${spiceTheme.components.card} overflow-hidden ${className}`} data-testid={`profile-card-${profile.id}`}>
      {/* Photo Section */}
      <div className="relative">
        <img
          src={photos[currentPhotoIndex] || '/placeholder-avatar.png'}
          alt={getNameDisplay()}
          className="w-full h-96 object-cover"
        />

        {/* Photo Navigation */}
        {hasMultiplePhotos && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Photo Indicators */}
        {hasMultiplePhotos && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPhotoIndex ? 'bg-pink-500' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Profile Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {profile.isVerified && (
            <Badge className={spiceTheme.components.badge.verified}>
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          {profile.membershipTier === 'vip' && (
            <Badge className={spiceTheme.components.badge.premium}>
              <Crown className="h-3 w-3 mr-1" />
              VIP
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Name and Age */}
        <div>
          <h2 className="text-xl font-bold text-white" data-testid={`profile-name-${profile.id}`}>
            {getNameDisplay()}
          </h2>
          <div className="flex items-center gap-2 text-white/60">
            <Calendar className="h-4 w-4" />
            <span>{getAgeDisplay()}</span>
            <Badge variant="outline" className={spiceTheme.components.badge.pink}>
              {profile.accountType}
            </Badge>
          </div>
        </div>

        {/* Location */}
        {profile.location && (
          <div className="flex items-center text-white/60">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-white/80 leading-relaxed" data-testid={`profile-bio-${profile.id}`}>
            {profile.bio}
          </p>
        )}

        {/* Identity Information */}
        <div className="space-y-2">
          {profile.gender && (
            <div className="flex items-center text-sm text-white/60">
              <User className="h-4 w-4 mr-2" />
              <span>
                {profile.accountType === 'couple' && profile.gender2
                  ? `${profile.gender} & ${profile.gender2}`
                  : profile.gender}
              </span>
            </div>
          )}
          {profile.relationshipStatus && (
            <Badge variant="outline" className="border-pink-500/50 text-pink-400">
              {profile.relationshipStatus}
            </Badge>
          )}
        </div>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 6).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs border-pink-500/30 text-pink-300">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 6 && (
                <Badge variant="outline" className="text-xs border-pink-500/30 text-pink-300">
                  +{profile.interests.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-white/60 pt-2">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{photos.length} photos</span>
          </div>
          {profile.lifestyleExperience && (
            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
              {profile.lifestyleExperience} Experience
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-3 pt-4">
            {onMessage && (
              <Button
                onClick={() => onMessage(profile.id!)}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                data-testid={`message-profile-${profile.id}`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
            {onLike && (
              <Button
                onClick={() => onLike(profile.id!)}
                variant="outline"
                className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                data-testid={`like-profile-${profile.id}`}
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (variant === 'compact') {
    return renderCompactCard();
  }

  return renderFullCard();
};

export default ProfileCard;