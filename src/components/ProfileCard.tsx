import React, { useState } from 'react';
import { Profile } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
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
  User,
  Eye,
  Search,
  AlertTriangle,
  Zap,
  FileText
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

  // Get name display for individuals vs couples
  const getNameDisplay = () => {
    if (profile.accountType === 'couple') {
      return {
        primary: profile.displayName || 'User',
        secondary: profile.displayName2 || 'Partner'
      };
    }
    return {
      primary: profile.displayName || 'User',
      secondary: null
    };
  };

  // Get age display for individuals vs couples
  const getAgeDisplay = () => {
    if (profile.accountType === 'couple') {
      return {
        primary: profile.age || '?',
        secondary: profile.age2 || '?'
      };
    }
    return {
      primary: profile.age || '?',
      secondary: null
    };
  };

  // Get gender display for individuals vs couples
  const getGenderDisplay = () => {
    if (profile.accountType === 'couple') {
      return {
        primary: profile.gender || 'Not specified',
        secondary: profile.gender2 || 'Not specified'
      };
    }
    return {
      primary: profile.gender || 'Not specified',
      secondary: null
    };
  };

  // Get orientation display for individuals vs couples  
  const getOrientationDisplay = () => {
    if (profile.accountType === 'couple') {
      return {
        primary: profile.orientation || 'Not specified',
        secondary: profile.orientation2 || 'Not specified'
      };
    }
    return {
      primary: profile.orientation || 'Not specified',
      secondary: null
    };
  };

  const renderCompactCard = () => {
    const names = getNameDisplay();
    const ages = getAgeDisplay();
    
    return (
      <Card className={`${spiceTheme.components.card} ${className}`} data-testid={`profile-card-${profile.id}`}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={photos[currentPhotoIndex] || '/placeholder-avatar.png'}
                alt={names.primary}
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
              <h3 className="text-white font-semibold truncate">
                {names.secondary ? `${names.primary} & ${names.secondary}` : names.primary}
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar className="h-3 w-3" />
                <span>{ages.secondary ? `${ages.primary} & ${ages.secondary}` : ages.primary}</span>
                <Badge className={spiceTheme.components.badge.pink}>
                  {profile.accountType === 'couple' ? 'Couple' : 'Individual'}
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
  };

  const renderFullCard = () => {
    const names = getNameDisplay();
    const ages = getAgeDisplay();
    const genders = getGenderDisplay();
    const orientations = getOrientationDisplay();
    
    return (
      <Card className={`${spiceTheme.components.card} overflow-hidden ${className}`} data-testid={`profile-card-${profile.id}`}>
        {/* Photo Section */}
        <div className="relative">
          <img
            src={photos[currentPhotoIndex] || '/placeholder-avatar.png'}
            alt={names.primary}
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

        <CardContent className="p-6 space-y-6">
          {/* Names and Basic Info */}
          <div>
            {profile.accountType === 'couple' ? (
              <div>
                <h2 className={`text-2xl font-bold ${spiceTheme.components.text.gradient}`} data-testid={`profile-name-${profile.id}`}>
                  {names.primary} & {names.secondary}
                </h2>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-white/70">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{ages.primary} years old</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-4 w-4" />
                      <span>{genders.primary}</span>
                    </div>
                    <div className="text-sm text-pink-400">
                      {orientations.primary}
                    </div>
                  </div>
                  <div className="text-white/70">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{ages.secondary} years old</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-4 w-4" />
                      <span>{genders.secondary}</span>
                    </div>
                    <div className="text-sm text-pink-400">
                      {orientations.secondary}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className={`text-2xl font-bold ${spiceTheme.components.text.gradient}`} data-testid={`profile-name-${profile.id}`}>
                  {names.primary}
                </h2>
                <div className="flex items-center gap-4 text-white/70 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{ages.primary} years old</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{genders.primary}</span>
                  </div>
                </div>
                <div className="text-pink-400 mt-1">
                  {orientations.primary}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <Badge className={spiceTheme.components.badge.pink}>
                {profile.accountType === 'couple' ? 'Couple' : 'Individual'}
              </Badge>
              {profile.lifestyleExperience && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  {profile.lifestyleExperience} Experience
                </Badge>
              )}
            </div>
          </div>

          {/* Location */}
          {profile.location && (
            <div className="flex items-center text-white/60">
              <MapPin className="h-5 w-5 mr-2 text-pink-400" />
              <span className="text-lg">{profile.location}</span>
            </div>
          )}

          {/* Relationship Status */}
          {profile.relationshipStatus && (
            <div>
              <h4 className="text-white font-medium mb-2">Current Relationship Status:</h4>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                {profile.relationshipStatus}
              </Badge>
            </div>
          )}

          {/* Seeking */}
          <div>
            {profile.seekingRelationshipType && profile.seekingRelationshipType.length > 0 && (
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Seeking Relationship Type:</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.seekingRelationshipType.map((type, index) => (
                    <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/50">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {profile.seeking && profile.seeking.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Seeking:</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.seeking.map((item, index) => (
                    <Badge key={index} className="bg-pink-500/20 text-pink-400 border-pink-500/50">
                      <Search className="h-3 w-3 mr-1" />
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <h4 className="text-white font-medium mb-2">Bio</h4>
              <p className="text-white/80 leading-relaxed" data-testid={`profile-bio-${profile.id}`}>
                {profile.bio}
              </p>
            </div>
          )}

          <Separator className="bg-pink-500/30" />

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-3">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Kinks */}
          {profile.kinks && profile.kinks.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-3">Kinks</h4>
              <div className="flex flex-wrap gap-2">
                {profile.kinks.map((kink, index) => (
                  <Badge key={index} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {kink}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Limits */}
          {((profile.softLimits && profile.softLimits.length > 0) || (profile.hardLimits && profile.hardLimits.length > 0)) && (
            <div>
              <h4 className="text-white font-medium mb-3">Limits</h4>
              {profile.softLimits && profile.softLimits.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-yellow-400 text-sm font-medium mb-2">Soft Limits (might try):</h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.softLimits.map((limit, index) => (
                      <Badge key={index} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {limit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.hardLimits && profile.hardLimits.length > 0 && (
                <div>
                  <h5 className="text-red-400 text-sm font-medium mb-2">Hard Limits (absolute no's):</h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.hardLimits.map((limit, index) => (
                      <Badge key={index} className="bg-red-500/20 text-red-300 border-red-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {limit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Safety Practices */}
          {profile.safetyPractices && (
            <div>
              <h4 className="text-white font-medium mb-2">Safety Practices:</h4>
              <p className="text-white/80 leading-relaxed bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                {profile.safetyPractices}
              </p>
            </div>
          )}

          {/* Rules & Boundaries */}
          {profile.rules && (
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-orange-400" />
                Rules & Boundaries:
              </h4>
              <p className="text-white/80 leading-relaxed bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                {profile.rules}
              </p>
            </div>
          )}

          {/* Current ISO Posts Placeholder */}
          <div>
            <h4 className="text-white font-medium mb-3">Current ISO Posts:</h4>
            <Card className="bg-gray-900/50 border-pink-500/20 p-4">
              <div className="text-center py-4 text-white/60">
                <Zap className="h-8 w-8 text-pink-400/50 mx-auto mb-2" />
                <p className="text-sm">No active ISO posts</p>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <Separator className="bg-pink-500/30" />
          <div className="flex items-center gap-6 text-sm text-white/60">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-pink-400" />
              <span>{photos.length} photos</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2 text-pink-400" />
              <span>Profile views: 0</span>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-3 pt-4">
              {onMessage && (
                <Button
                  onClick={() => onMessage(profile.id!)}
                  className={`flex-1 ${spiceTheme.components.button.gradient}`}
                  data-testid={`message-profile-${profile.id}`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
              {onLike && (
                <Button
                  onClick={() => onLike(profile.id!)}
                  className={`px-4 ${spiceTheme.components.button.secondary}`}
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
  };

  if (variant === 'compact') {
    return renderCompactCard();
  }

  return renderFullCard();
};

export default ProfileCard;
