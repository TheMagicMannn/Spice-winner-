import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Users, Crown, Shield, Star, Sparkles, Loader2, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { useAuth } from '@/hooks/useAuth';
import { MatchingService, MatchedProfile } from '@/services/matchingService';
import { Spinner } from '@/components/Spinner';
import { ProfileDetailModal } from '@/components/ProfileDetailModal';
import { MatchPreferencesModal } from '@/components/MatchPreferencesModal';
import { ProfileService } from '@/services/profileService';
import { MatchPreferences } from '@/types';

export const BrowsePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [isMatchPreferencesOpen, setIsMatchPreferencesOpen] = useState(false);

  const currentProfile = profiles[currentIndex];

  // Load matched profiles on component mount
  useEffect(() => {
    loadProfiles();
    // Optional: Update user's location for distance-based matching
    if (user?.id) {
      MatchingService.updateLocationFromBrowser(user.id);
    }
  }, [user?.id]);

  const loadProfiles = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const matchedProfiles = await MatchingService.getMatchedProfiles(user.id, 50, 0);
      setProfiles(matchedProfiles);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user?.id || !currentProfile) return;
    
    setSwipeLoading(true);
    try {
      const result = await MatchingService.recordSwipe(
        user.id,
        currentProfile.id!,
        'like'
      );
      
      // Check if it's a match
      if (result.isMatch) {
        setMatchedProfile(currentProfile);
        setShowMatchModal(true);
      }
      
      handleNext();
    } catch (error) {
      console.error('Failed to record like:', error);
    } finally {
      setSwipeLoading(false);
    }
  };

  const handlePass = async () => {
    if (!user?.id || !currentProfile) return;
    
    setSwipeLoading(true);
    try {
      await MatchingService.recordSwipe(
        user.id,
        currentProfile.id!,
        'pass'
      );
      
      handleNext();
    } catch (error) {
      console.error('Failed to record pass:', error);
    } finally {
      setSwipeLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Try to load more profiles
      loadProfiles();
    }
    // Reset photo index when moving to next profile
    setCurrentPhotoIndex(0);
  };

  const handleSaveMatchPreferences = async (updatedPreferences: MatchPreferences) => {
    if (!user?.id || !user?.profile) return;
    
    try {
      console.log('BrowsePage - Saving match preferences:', updatedPreferences);
      const updatedProfileData = {
        ...user.profile,
        matchPreferences: updatedPreferences
      };
      const savedProfile = await ProfileService.updateProfile(user.id, updatedProfileData);
      updateProfile(savedProfile);
      console.log('BrowsePage - Match preferences saved successfully');
      
      // Reload profiles with new preferences
      await loadProfiles();
    } catch (error) {
      console.error('BrowsePage - Failed to save match preferences:', error);
      throw error;
    }
  };

  const handlePrevPhoto = () => {
    const photos = currentProfile?.photos || [];
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = () => {
    const photos = currentProfile?.photos || [];
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Get display name based on account type
  const getDisplayName = (profile: MatchedProfile) => {
    if (profile.accountType === 'couple' && profile.displayName2) {
      return `${profile.displayName} & ${profile.displayName2}`;
    }
    return profile.displayName || 'Anonymous';
  };

  // Get compatibility level styling
  const compatibilityInfo = currentProfile 
    ? MatchingService.getCompatibilityLevel(currentProfile.compatibilityScore)
    : null;

  // Loading state
  if (loading) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <Spinner />
          <p className="text-white mt-4">Finding your perfect matches...</p>
        </div>
      </SpiceBackground>
    );
  }

  // No profiles state
  if (!currentProfile || profiles.length === 0) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center px-4">
          <Sparkles className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl mb-2 font-bold">No More Profiles</h2>
          <p className="text-white/60 mb-6">
            We've shown you all available matches based on your preferences.
          </p>
          <Button 
            onClick={loadProfiles}
            className="bg-pink-600 hover:bg-pink-700"
          >
            Refresh Matches
          </Button>
        </div>
      </SpiceBackground>
    );
  }

  return (
    <SpiceBackground className="max-w-md mx-auto min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <div className="flex items-center justify-between">
          <h1 className={`text-xl ${spiceTheme.components.text.title}`} data-testid="text-browse-title">
            Discover
          </h1>
          <div className="flex items-center gap-2">
            <Badge className={`${spiceTheme.components.badge.pink} animate-pulse`}>
              {currentIndex + 1} of {profiles.length}
            </Badge>
            {compatibilityInfo && (
              <Badge className={`bg-black/70 ${compatibilityInfo.color} border-0`}>
                {compatibilityInfo.emoji} {currentProfile.compatibilityScore}%
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-4">
        <Card 
          className={`${spiceTheme.components.card} overflow-hidden animate-fade-in`} 
          data-testid={`card-profile-${currentProfile.id}`}
        >
          <div className="relative cursor-pointer" onClick={() => setShowProfileDetail(true)}>
            <img
              src={currentProfile.photos?.[currentPhotoIndex] || 'https://via.placeholder.com/600x800?text=No+Photo'}
              alt={getDisplayName(currentProfile)}
              className="w-full h-96 object-cover"
              data-testid={`img-profile-photo-${currentPhotoIndex}`}
            />

            {/* Photo Navigation - Only show if multiple photos */}
            {currentProfile.photos && currentProfile.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 backdrop-blur-sm text-white hover:bg-black/90 transition-all flex items-center justify-center z-10"
                  data-testid="button-prev-photo-preview"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 backdrop-blur-sm text-white hover:bg-black/90 transition-all flex items-center justify-center z-10"
                  data-testid="button-next-photo-preview"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Photo Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {currentProfile.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex(index);
                      }}
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

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Profile badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              {currentProfile.isVerified && (
                <Badge className={`${spiceTheme.components.badge.verified} animate-glow`}>
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {currentProfile.membershipTier === 'vip' && (
                <Badge className={`${spiceTheme.components.badge.premium} animate-glow`}>
                  <Crown className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
            </div>

            {/* Compatibility badge */}
            {compatibilityInfo && (
              <div className="absolute top-4 left-4">
                <Badge className={`bg-black/70 backdrop-blur-sm ${compatibilityInfo.color} border-0 text-sm font-semibold`}>
                  <Star className="h-3 w-3 mr-1" />
                  {compatibilityInfo.label}
                </Badge>
              </div>
            )}

            {/* Distance badge */}
            {currentProfile.distanceMiles !== null && currentProfile.distanceMiles !== undefined && (
              <div className="absolute bottom-20 left-4">
                <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {MatchingService.formatDistance(currentProfile.distanceMiles)}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className={`text-xl font-bold ${spiceTheme.components.text.gradient}`} data-testid={`text-profile-name-${currentProfile.id}`}>
                {getDisplayName(currentProfile)}
              </h2>
              <div className="flex items-center gap-2 text-white/60">
                <span>{currentProfile.age || 'Age not specified'}</span>
                {currentProfile.age2 && currentProfile.accountType === 'couple' && (
                  <span>& {currentProfile.age2}</span>
                )}
                <Badge className={spiceTheme.components.badge.pink}>
                  {currentProfile.accountType}
                </Badge>
              </div>
            </div>

            {/* Location */}
            {currentProfile.location && (
              <div className="flex items-center text-white/60">
                <MapPin className="h-4 w-4 mr-2 text-pink-400" />
                <span>{currentProfile.location}</span>
              </div>
            )}

            {/* Bio */}
            {currentProfile.bio && (
              <p className="text-white/80 leading-relaxed" data-testid={`text-profile-bio-${currentProfile.id}`}>
                {currentProfile.bio}
              </p>
            )}

            {/* Interests */}
            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.slice(0, 5).map((interest, idx) => (
                  <Badge key={idx} variant="outline" className="text-pink-400 border-pink-400/50">
                    {interest}
                  </Badge>
                ))}
                {currentProfile.interests.length > 5 && (
                  <Badge variant="outline" className="text-white/60 border-white/30">
                    +{currentProfile.interests.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-pink-400" />
                <span>{currentProfile.photos?.length || 0} photos</span>
              </div>
              {currentProfile.lifestyleExperience && (
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-pink-400" />
                  <span>{currentProfile.lifestyleExperience}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={handlePass}
            disabled={swipeLoading}
            className="h-16 w-16 rounded-full border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 animate-glow flex items-center justify-center disabled:opacity-50"
            data-testid="button-pass-profile"
          >
            {swipeLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <X className="h-6 w-6" />}
          </button>

          <button
            onClick={handleLike}
            disabled={swipeLoading}
            className={`h-16 w-16 rounded-full ${spiceTheme.components.button.gradient} transition-all duration-300 animate-glow flex items-center justify-center hover:scale-110 transform disabled:opacity-50`}
            data-testid="button-like-profile"
          >
            {swipeLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && matchedProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" data-testid="match-modal">
          <Card className="bg-gradient-to-b from-pink-900/50 to-black border-pink-500/50 max-w-md w-full">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-pink-400 mb-2" data-testid="text-match-title">
                It's a Match!
              </h2>
              <p className="text-white/80 mb-6" data-testid="text-match-description">
                You and {getDisplayName(matchedProfile)} liked each other!
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowMatchModal(false)}
                  variant="outline"
                  className="flex-1 border-pink-500/50 text-white hover:bg-pink-500/10"
                  data-testid="button-keep-browsing"
                >
                  Keep Browsing
                </Button>
                <Button
                  onClick={() => {
                    setShowMatchModal(false);
                    // Navigate to messages page with matched user
                    navigate('/messages', { state: { matchedUserId: matchedProfile.id } });
                  }}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                  data-testid="button-send-message"
                >
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={currentProfile}
        isOpen={showProfileDetail}
        onClose={() => setShowProfileDetail(false)}
        onLike={handleLike}
        showActions={true}
        compatibilityScore={currentProfile?.compatibilityScore}
        distanceMiles={currentProfile?.distanceMiles}
      />

      {/* Theme Styles */}
      <style>{themeStyles}</style>
    </SpiceBackground>
  );
};
