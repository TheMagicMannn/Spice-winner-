// src/pages/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Shield, 
  Crown, 
  MapPin, 
  Calendar, 
  Heart,
  MessageSquare,
  Users,
  User as UserIcon,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme } from '@/styles/theme';
import { Spinner } from '@/components/Spinner';

interface UserProfile {
  id: string;
  account_type: 'individual' | 'couple';
  display_name?: string;
  display_name2?: string;
  location?: string;
  age?: number;
  age2?: number;
  bio?: string;
  gender?: string;
  gender2?: string;
  orientation?: string;
  orientation2?: string;
  relationship_status?: string;
  seeking?: string[];
  seeking_relationship_type?: string[];
  lifestyle_experience?: string;
  interests?: string[];
  kinks?: string[];
  soft_limits?: string[];
  hard_limits?: string[];
  safety_practices?: string;
  rules?: string;
  photos?: string[];
  is_verified: boolean;
  is_active: boolean;
  profile_completed: boolean;
  membership_tier?: string;
  created_at: string;
  last_active_at?: string;
}

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId]);

  const loadUserProfile = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error('Profile not found');
      }

      setProfile(data);
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Swipe gesture handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !profile?.photos) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
    if (isRightSwipe && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const goToNextPhoto = () => {
    if (profile?.photos && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const goToPreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center">
        <Spinner />
      </SpiceBackground>
    );
  }

  if (error || !profile) {
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center p-4">
        <Card className={spiceTheme.components.card}>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h2 className="text-white text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-white/70 mb-6">{error || 'This profile does not exist or has been removed.'}</p>
            <Button
              onClick={() => navigate(-1)}
              className={spiceTheme.components.button.primary}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </SpiceBackground>
    );
  }

  const displayName = profile.account_type === 'couple' && profile.display_name2
    ? `${profile.display_name || 'User'} & ${profile.display_name2}`
    : profile.display_name || 'User';

  const mainPhoto = profile.photos && profile.photos.length > 0 
    ? profile.photos[currentPhotoIndex] 
    : 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800';

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            {profile.is_verified && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {profile.membership_tier === 'vip' && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Crown className="h-3 w-3 mr-1" />
                VIP
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Profile Header Card */}
        <Card className={spiceTheme.components.card}>
          <CardContent className="p-0">
            {/* Main Photo with Swipe Support */}
            <div 
              className="relative h-96 touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={mainPhoto}
                alt={displayName}
                className="w-full h-full object-cover rounded-t-lg select-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg pointer-events-none" />
              
              {/* Navigation Arrows (Desktop) */}
              {profile.photos && profile.photos.length > 1 && (
                <>
                  {currentPhotoIndex > 0 && (
                    <button
                      onClick={goToPreviousPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                      data-testid="previous-photo-button"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  )}
                  
                  {currentPhotoIndex < profile.photos.length - 1 && (
                    <button
                      onClick={goToNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                      data-testid="next-photo-button"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  )}
                </>
              )}

              {/* Photo Counter */}
              {profile.photos && profile.photos.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
                  {currentPhotoIndex + 1} / {profile.photos.length}
                </div>
              )}
              
              {/* Photo Navigation Dots */}
              {profile.photos && profile.photos.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                  {profile.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentPhotoIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/75 w-2'
                      }`}
                      data-testid={`photo-dot-${index}`}
                    />
                  ))}
                </div>
              )}

              {/* Name & Badges Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center">
                      {displayName}
                      {profile.is_verified && <CheckCircle className="h-6 w-6 ml-2 text-blue-400" />}
                    </h1>
                    <div className="flex items-center space-x-3 text-white/90">
                      {profile.account_type === 'couple' ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                      <span className="capitalize">{profile.account_type}</span>
                      {profile.age && <span>• {profile.age} years old</span>}
                      {profile.account_type === 'couple' && profile.age2 && <span>& {profile.age2}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="p-6 space-y-4">
              {profile.location && (
                <div className="flex items-center text-white/80">
                  <MapPin className="h-5 w-5 mr-2 text-pink-400" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.last_active_at && (
                <div className="flex items-center text-white/60 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Last active: {formatDate(profile.last_active_at)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        {profile.bio && (
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-pink-400" />
                About
              </h2>
              <p className="text-white/80 whitespace-pre-wrap">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card className={spiceTheme.components.card}>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {profile.gender && (
                <div>
                  <div className="text-white/60 mb-1">Gender</div>
                  <div className="text-white font-medium">{profile.gender}</div>
                </div>
              )}
              
              {profile.account_type === 'couple' && profile.gender2 && (
                <div>
                  <div className="text-white/60 mb-1">Partner's Gender</div>
                  <div className="text-white font-medium">{profile.gender2}</div>
                </div>
              )}

              {profile.orientation && (
                <div>
                  <div className="text-white/60 mb-1">Orientation</div>
                  <div className="text-white font-medium">{profile.orientation}</div>
                </div>
              )}

              {profile.account_type === 'couple' && profile.orientation2 && (
                <div>
                  <div className="text-white/60 mb-1">Partner's Orientation</div>
                  <div className="text-white font-medium">{profile.orientation2}</div>
                </div>
              )}

              {profile.relationship_status && (
                <div>
                  <div className="text-white/60 mb-1">Status</div>
                  <div className="text-white font-medium">{profile.relationship_status}</div>
                </div>
              )}

              {profile.lifestyle_experience && (
                <div>
                  <div className="text-white/60 mb-1">Experience</div>
                  <div className="text-white font-medium">{profile.lifestyle_experience}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seeking */}
        {profile.seeking && profile.seeking.length > 0 && (
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-3">Looking For</h2>
              <div className="flex flex-wrap gap-2">
                {profile.seeking.map((item, index) => (
                  <Badge key={index} className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kinks */}
        {profile.kinks && profile.kinks.length > 0 && (
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-3">Kinks & Preferences</h2>
              <div className="flex flex-wrap gap-2">
                {profile.kinks.map((kink, index) => (
                  <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500/30">
                    {kink}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety & Rules */}
        {(profile.safety_practices || profile.rules) && (
          <Card className={spiceTheme.components.card}>
            <CardContent className="p-6 space-y-4">
              {profile.safety_practices && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Safety Practices</h2>
                  <p className="text-white/80 whitespace-pre-wrap">{profile.safety_practices}</p>
                </div>
              )}
              
              {profile.rules && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Rules & Boundaries</h2>
                  <p className="text-white/80 whitespace-pre-wrap">{profile.rules}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button className={`flex-1 ${spiceTheme.components.button.gradient}`}>
            <MessageSquare className="h-5 w-5 mr-2" />
            Send Message
          </Button>
          <Button className={spiceTheme.components.button.secondary}>
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Member Since */}
        <div className="text-center text-white/50 text-sm">
          Member since {formatDate(profile.created_at)}
        </div>
      </div>
    </SpiceBackground>
  );
};
