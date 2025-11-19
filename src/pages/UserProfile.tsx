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
  ChevronRight,
  ChevronDown,
  UserPlus,
  Ruler,
  Palette,
  Eye,
  Activity,
  ShieldCheck
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
  
  // Physical stats - Individual
  height?: string;
  weight?: string;
  body_type?: string;
  hair_color?: string;
  eye_color?: string;
  facial_hair?: string;
  ethnicity?: string;
  cigarette_smoker?: string;
  alcohol_drinker?: string;
  marijuana_user?: string;
  tattoos?: boolean;
  piercings?: boolean;
  body_hair?: string;
  grooming_style?: string;
  birth_control?: string;
  latex_allergy?: boolean;
  last_sti_test_date?: string;
  sti_positive_results?: string;
  can_host?: string;
  
  // Physical stats - Partner 1 (Couples)
  partner1_height?: string;
  partner1_weight?: string;
  partner1_body_type?: string;
  partner1_hair_color?: string;
  partner1_eye_color?: string;
  partner1_facial_hair?: string;
  partner1_ethnicity?: string;
  partner1_cigarette_smoker?: string;
  partner1_alcohol_drinker?: string;
  partner1_marijuana_user?: string;
  partner1_tattoos?: boolean;
  partner1_piercings?: boolean;
  
  // Physical stats - Partner 2 (Couples)
  partner2_height?: string;
  partner2_weight?: string;
  partner2_body_type?: string;
  partner2_hair_color?: string;
  partner2_eye_color?: string;
  partner2_facial_hair?: string;
  partner2_ethnicity?: string;
  partner2_cigarette_smoker?: string;
  partner2_alcohol_drinker?: string;
  partner2_marijuana_user?: string;
  partner2_tattoos?: boolean;
  partner2_piercings?: boolean;
  
  // Quiz results
  kink_quiz_results?: Record<string, number>;
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
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    aboutMe: false,
    myStats: false,
    kinksInterest: false,
    whatSeeking: false,
    bdsmQuiz: false,
    boundariesLimits: false
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId]);

  // Keyboard navigation for photos
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!profile?.photos) return;
      
      if (e.key === 'ArrowLeft' && currentPhotoIndex > 0) {
        setCurrentPhotoIndex(currentPhotoIndex - 1);
      } else if (e.key === 'ArrowRight' && currentPhotoIndex < profile.photos.length - 1) {
        setCurrentPhotoIndex(currentPhotoIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPhotoIndex, profile?.photos]);

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

  // Helper component for expandable sections
  const ExpandableSection: React.FC<{
    title: string;
    sectionKey: string;
    children: React.ReactNode;
    testId?: string;
  }> = ({ title, sectionKey, children, testId }) => (
    <Card className={spiceTheme.components.card} data-testid={testId}>
      <CardContent className="p-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
          data-testid={`${testId}-toggle`}
        >
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <ChevronDown 
            className={`h-6 w-6 text-pink-400 transition-transform duration-300 ${
              expandedSections[sectionKey] ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${
            expandedSections[sectionKey] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-6" data-testid={`${testId}-content`}>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Helper to get gender icon based on seeking preferences
  const getSeekingIcon = (item: string) => {
    const lowerItem = item.toLowerCase();
    if (lowerItem.includes('couple')) {
      return <Users className="h-5 w-5 text-blue-400" />;
    } else if (lowerItem.includes('male') || lowerItem.includes('man')) {
      return <UserIcon className="h-5 w-5 text-cyan-400" />;
    } else if (lowerItem.includes('female') || lowerItem.includes('woman')) {
      return <UserIcon className="h-5 w-5 text-pink-400" />;
    }
    return <UserPlus className="h-5 w-5 text-purple-400" />;
  };

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
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
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
      <div className="p-4 space-y-4" data-testid="profile-content">
        {/* Hero Profile Header */}
        <Card className={spiceTheme.components.card} data-testid="profile-hero">
          <CardContent className="p-0">
            {/* Main Photo with Overlay */}
            <div 
              className="relative h-[500px] touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              data-testid="profile-photo-section"
            >
              <img
                src={mainPhoto}
                alt={displayName}
                className="w-full h-full object-cover rounded-t-lg select-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-t-lg pointer-events-none" />
              
              {/* Navigation Arrows */}
              {profile.photos && profile.photos.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousPhoto}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10 ${
                      currentPhotoIndex === 0 ? 'opacity-0 pointer-events-none' : ''
                    }`}
                    data-testid="previous-photo-button"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={goToNextPhoto}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10 ${
                      currentPhotoIndex === profile.photos.length - 1 ? 'opacity-0 pointer-events-none' : ''
                    }`}
                    data-testid="next-photo-button"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Profile Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none z-10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                      {displayName}
                      {profile.is_verified && (
                        <CheckCircle className="h-7 w-7 ml-2 text-blue-400" />
                      )}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-white/90 text-lg">
                      <span>{profile.age || '??'}</span>
                      <span>•</span>
                      <span className="capitalize">{profile.gender || 'Not specified'}</span>
                      {profile.account_type === 'couple' && profile.age2 && (
                        <>
                          <span>•</span>
                          <span>{profile.age2}</span>
                        </>
                      )}
                      {profile.account_type === 'couple' && profile.gender2 && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{profile.gender2}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {profile.location && (
                  <div className="flex items-center text-white/90 mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-pink-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {/* STI Status Placeholder */}
                <div className="flex items-center text-white/70 text-sm">
                  <ShieldCheck className="h-4 w-4 mr-2 text-green-400" />
                  <span>STI tested (Placeholder)</span>
                </div>
              </div>
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
