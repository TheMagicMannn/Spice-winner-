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
  ShieldCheck,
  MoreVertical,
  Flag,
  UserX,
  Lock,
  HeartOff
} from 'lucide-react';
import { SpiceBackground } from '@/components/SpiceComponents';
import { spiceTheme } from '@/styles/theme';
import { Spinner } from '@/components/Spinner';
import { ReportModal } from '@/components/ReportModal';
import { useAuth } from '@/hooks/useAuth';
import UserActionsService from '@/services/userActionsService';
import PrivateContentService, { PrivateContent } from '@/services/privateContentService';
import { useToast } from '@/hooks/use-toast';
import PrivateContentViewer from '@/components/PrivateContentViewer';

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
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Menu and modals state
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false);
  const [showSharePrivateContent, setShowSharePrivateContent] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Private content state
  const [privateContent, setPrivateContent] = useState<PrivateContent[]>([]);
  const [hasPrivateAccess, setHasPrivateAccess] = useState(false);
  const [loadingPrivateContent, setLoadingPrivateContent] = useState(false);
  const [privateContentUrls, setPrivateContentUrls] = useState<Record<string, string>>({});
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    aboutMe: false,
    myStats: false,
    kinksInterest: false,
    whatSeeking: false,
    bdsmQuiz: false,
    boundariesLimits: false,
    privateContent: false
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
      checkMatchStatus();
      checkBlockStatus();
      loadPrivateContent();
    }
  }, [userId]);
  
  // Check match status
  useEffect(() => {
    if (user && userId && user.id !== userId) {
      checkMatchStatus();
    }
  }, [user, userId]);

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

  // Check if users are matched
  const checkMatchStatus = async () => {
    if (!user || !userId || user.id === userId) return;
    
    try {
      const matched = await UserActionsService.areUsersMatched(user.id, userId);
      setIsMatched(matched);
    } catch (error) {
      console.error('Error checking match status:', error);
    }
  };

  // Check if user is blocked
  const checkBlockStatus = async () => {
    if (!user || !userId || user.id === userId) return;
    
    try {
      const blocked = await UserActionsService.isUserBlocked(user.id, userId);
      setIsBlocked(blocked);
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  // Load private content
  const loadPrivateContent = async () => {
    if (!user || !userId) return;
    
    setLoadingPrivateContent(true);
    try {
      // Check if current user has access
      const hasAccess = await PrivateContentService.checkAccess(userId, user.id);
      setHasPrivateAccess(hasAccess);
      
      // Load content if has access or is owner
      if (hasAccess || user.id === userId) {
        const content = await PrivateContentService.getPrivateContentWithAccess(userId, user.id);
        setPrivateContent(content);
        
        // Generate signed URLs for all content
        if (content.length > 0) {
          const paths = content.map(item => item.storage_path);
          const urls = await PrivateContentService.getPrivateContentUrls(paths);
          setPrivateContentUrls(urls);
        }
      }
    } catch (error) {
      console.error('Error loading private content:', error);
    } finally {
      setLoadingPrivateContent(false);
    }
  };

  // Handle report user
  const handleReportUser = async (reason: string, description: string, shouldBlock: boolean) => {
    if (!user || !userId) return;
    
    try {
      await UserActionsService.reportUser(user.id, userId, reason, description);
      
      if (shouldBlock) {
        await handleBlockUser();
      }
      
      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe.',
      });
      
      setShowReportModal(false);
    } catch (error) {
      console.error('Error reporting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle block user
  const handleBlockUser = async () => {
    if (!user || !userId) return;
    
    try {
      await UserActionsService.blockUser(user.id, userId, 'Blocked from profile');
      setIsBlocked(true);
      setShowBlockConfirm(false);
      setShowMenu(false);
      
      toast({
        title: 'User blocked',
        description: 'You will no longer see this user.',
      });
      
      // Navigate back after blocking
      setTimeout(() => navigate(-1), 1500);
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to block user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle unmatch user
  const handleUnmatchUser = async () => {
    if (!user || !userId) return;
    
    try {
      await UserActionsService.unmatchUser(user.id, userId);
      setIsMatched(false);
      setShowUnmatchConfirm(false);
      setShowMenu(false);
      
      toast({
        title: 'Unmatched',
        description: 'You are no longer matched with this user.',
      });
    } catch (error) {
      console.error('Error unmatching user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unmatch. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle share private content
  const handleSharePrivateContent = async () => {
    if (!user || !userId) return;
    
    try {
      await PrivateContentService.grantAccess(user.id, userId);
      
      toast({
        title: 'Access granted',
        description: 'This user can now view your private content.',
      });
      
      setShowSharePrivateContent(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Error granting access:', error);
      toast({
        title: 'Error',
        description: 'Failed to grant access. Please try again.',
        variant: 'destructive',
      });
    }
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
            {user && user.id !== userId && (
              <div className="relative">
                <Button
                  onClick={() => setShowMenu(!showMenu)}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white"
                  data-testid="profile-menu-button"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
                
                {showMenu && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-white/10 rounded-lg shadow-lg overflow-hidden z-50"
                    data-testid="profile-menu-dropdown"
                  >
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left"
                      data-testid="report-user-button"
                    >
                      <Flag className="h-5 w-5 text-red-400" />
                      <span>Report User</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowBlockConfirm(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left"
                      data-testid="block-user-button"
                    >
                      <UserX className="h-5 w-5 text-orange-400" />
                      <span>Block User</span>
                    </button>
                    
                    {isMatched && (
                      <button
                        onClick={() => {
                          setShowUnmatchConfirm(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left"
                        data-testid="unmatch-user-button"
                      >
                        <HeartOff className="h-5 w-5 text-pink-400" />
                        <span>Unmatch</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setShowSharePrivateContent(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left"
                      data-testid="share-private-content-button"
                    >
                      <Lock className="h-5 w-5 text-purple-400" />
                      <span>Share Private Content</span>
                    </button>
                  </div>
                )}
              </div>
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

        {/* What I am open to - Pills */}
        {profile.seeking_relationship_type && profile.seeking_relationship_type.length > 0 && (
          <Card className={spiceTheme.components.card} data-testid="open-to-section">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-3">What I am open to:</h3>
              <div className="flex flex-wrap gap-2">
                {profile.seeking_relationship_type.map((type, index) => (
                  <Badge 
                    key={index} 
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-1.5 text-sm rounded-full"
                    data-testid={`relationship-type-${index}`}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* What I am interested in - Icons */}
        {profile.seeking && profile.seeking.length > 0 && (
          <Card className={spiceTheme.components.card} data-testid="interested-in-section">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">What I am interested in:</h3>
              <div className="flex flex-wrap gap-4">
                {profile.seeking.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center gap-1"
                    data-testid={`seeking-icon-${index}`}
                  >
                    <div className="bg-white/10 hover:bg-white/20 transition-colors rounded-full p-3 border border-white/20">
                      {getSeekingIcon(item)}
                    </div>
                    <span className="text-white/70 text-xs text-center max-w-[60px]">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expandable Section: About Me */}
        {profile.bio && (
          <ExpandableSection 
            title="About Me" 
            sectionKey="aboutMe"
            testId="about-me-section"
          >
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
          </ExpandableSection>
        )}

        {/* Expandable Section: My Stats / Our Stats */}
        <ExpandableSection 
          title={profile.account_type === 'couple' ? 'Our Stats' : 'My Stats'} 
          sectionKey="myStats"
          testId="my-stats-section"
        >
          {profile.account_type === 'individual' ? (
            <div className="space-y-4">
              {/* Physical Appearance */}
              <div>
                <h4 className="text-pink-400 font-semibold mb-3 text-sm uppercase tracking-wide">Physical Appearance</h4>
                <div className="space-y-2 text-white/80 text-sm">
                  {profile.height && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Height:</span>
                      <span className="font-medium">{profile.height}</span>
                    </div>
                  )}
                  {profile.weight && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Weight:</span>
                      <span className="font-medium">{profile.weight}</span>
                    </div>
                  )}
                  {profile.body_type && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Build:</span>
                      <span className="font-medium capitalize">{profile.body_type}</span>
                    </div>
                  )}
                  {profile.hair_color && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Hair:</span>
                      <span className="font-medium capitalize">{profile.hair_color}</span>
                    </div>
                  )}
                  {profile.eye_color && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Eyes:</span>
                      <span className="font-medium capitalize">{profile.eye_color}</span>
                    </div>
                  )}
                  {profile.facial_hair && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Facial Hair:</span>
                      <span className="font-medium capitalize">{profile.facial_hair}</span>
                    </div>
                  )}
                  {profile.ethnicity && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Ethnicity:</span>
                      <span className="font-medium capitalize">{profile.ethnicity}</span>
                    </div>
                  )}
                  {profile.tattoos !== undefined && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Tattoos:</span>
                      <span className="font-medium">{profile.tattoos ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {profile.piercings !== undefined && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Piercings:</span>
                      <span className="font-medium">{profile.piercings ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {profile.body_hair && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Body Hair:</span>
                      <span className="font-medium capitalize">{profile.body_hair}</span>
                    </div>
                  )}
                  {profile.grooming_style && (
                    <div className="flex items-center">
                      <span className="text-white/60 w-32">Grooming:</span>
                      <span className="font-medium capitalize">{profile.grooming_style}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Lifestyle */}
              {(profile.cigarette_smoker || profile.alcohol_drinker || profile.marijuana_user) && (
                <div>
                  <h4 className="text-blue-400 font-semibold mb-3 text-sm uppercase tracking-wide">Lifestyle</h4>
                  <div className="space-y-2 text-white/80 text-sm">
                    {profile.cigarette_smoker && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-32">Smoking:</span>
                        <span className="font-medium capitalize">{profile.cigarette_smoker}</span>
                      </div>
                    )}
                    {profile.alcohol_drinker && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-32">Drinking:</span>
                        <span className="font-medium capitalize">{profile.alcohol_drinker}</span>
                      </div>
                    )}
                    {profile.marijuana_user && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-32">Marijuana:</span>
                        <span className="font-medium capitalize">{profile.marijuana_user}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Health & Safety */}
              {(profile.birth_control || profile.latex_allergy !== undefined || profile.last_sti_test_date || profile.can_host) && (
                <div>
                  <h4 className="text-green-400 font-semibold mb-3 text-sm uppercase tracking-wide">Health & Safety</h4>
                  <div className="space-y-2 text-white/80 text-sm">
                    {profile.birth_control && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-32">Birth Control:</span>
                        <span className="font-medium capitalize">{profile.birth_control}</span>
                      </div>
                    )}
                    {profile.latex_allergy !== undefined && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-32">Latex Allergy:</span>
                        <span className="font-medium">{profile.latex_allergy ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {profile.last_sti_test_date && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-32">Last STI Test:</span>
                        <span className="font-medium">{new Date(profile.last_sti_test_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {profile.sti_positive_results && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-32">STI Results:</span>
                        <span className="font-medium">{profile.sti_positive_results}</span>
                      </div>
                    )}
                    {profile.can_host && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-32">Can Host:</span>
                        <span className="font-medium capitalize">{profile.can_host}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            ) : (
              <div className="space-y-6">
                {/* Partner 1 Stats */}
                <div>
                  <h4 className="text-pink-400 font-semibold mb-3 text-lg">{profile.display_name || 'Partner 1'}'s Stats</h4>
                  <div className="space-y-2 text-white/80 text-sm">
                    {profile.partner1_height && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Height:</span>
                        <span className="font-medium">{profile.partner1_height}</span>
                      </div>
                    )}
                    {profile.partner1_weight && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Weight:</span>
                        <span className="font-medium">{profile.partner1_weight}</span>
                      </div>
                    )}
                    {profile.partner1_body_type && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Build:</span>
                        <span className="font-medium capitalize">{profile.partner1_body_type}</span>
                      </div>
                    )}
                    {profile.partner1_hair_color && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Hair:</span>
                        <span className="font-medium capitalize">{profile.partner1_hair_color}</span>
                      </div>
                    )}
                    {profile.partner1_eye_color && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Eyes:</span>
                        <span className="font-medium capitalize">{profile.partner1_eye_color}</span>
                      </div>
                    )}
                    {profile.partner1_facial_hair && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Facial Hair:</span>
                        <span className="font-medium capitalize">{profile.partner1_facial_hair}</span>
                      </div>
                    )}
                    {profile.partner1_ethnicity && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Ethnicity:</span>
                        <span className="font-medium capitalize">{profile.partner1_ethnicity}</span>
                      </div>
                    )}
                    {profile.partner1_tattoos !== undefined && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Tattoos:</span>
                        <span className="font-medium">{profile.partner1_tattoos ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {profile.partner1_piercings !== undefined && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Piercings:</span>
                        <span className="font-medium">{profile.partner1_piercings ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {profile.partner1_cigarette_smoker && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Smoking:</span>
                        <span className="font-medium capitalize">{profile.partner1_cigarette_smoker}</span>
                      </div>
                    )}
                    {profile.partner1_alcohol_drinker && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Drinking:</span>
                        <span className="font-medium capitalize">{profile.partner1_alcohol_drinker}</span>
                      </div>
                    )}
                    {profile.partner1_marijuana_user && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Marijuana:</span>
                        <span className="font-medium capitalize">{profile.partner1_marijuana_user}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Partner 2 Stats */}
                <div>
                  <h4 className="text-blue-400 font-semibold mb-3 text-lg">{profile.display_name2 || 'Partner 2'}'s Stats</h4>
                  <div className="space-y-2 text-white/80 text-sm">
                    {profile.partner2_height && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Height:</span>
                        <span className="font-medium">{profile.partner2_height}</span>
                      </div>
                    )}
                    {profile.partner2_weight && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Weight:</span>
                        <span className="font-medium">{profile.partner2_weight}</span>
                      </div>
                    )}
                    {profile.partner2_body_type && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Build:</span>
                        <span className="font-medium capitalize">{profile.partner2_body_type}</span>
                      </div>
                    )}
                    {profile.partner2_hair_color && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Hair:</span>
                        <span className="font-medium capitalize">{profile.partner2_hair_color}</span>
                      </div>
                    )}
                    {profile.partner2_eye_color && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Eyes:</span>
                        <span className="font-medium capitalize">{profile.partner2_eye_color}</span>
                      </div>
                    )}
                    {profile.partner2_facial_hair && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Facial Hair:</span>
                        <span className="font-medium capitalize">{profile.partner2_facial_hair}</span>
                      </div>
                    )}
                    {profile.partner2_ethnicity && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Ethnicity:</span>
                        <span className="font-medium capitalize">{profile.partner2_ethnicity}</span>
                      </div>
                    )}
                    {profile.partner2_tattoos !== undefined && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Tattoos:</span>
                        <span className="font-medium">{profile.partner2_tattoos ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {profile.partner2_piercings !== undefined && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Piercings:</span>
                        <span className="font-medium">{profile.partner2_piercings ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {profile.partner2_cigarette_smoker && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Smoking:</span>
                        <span className="font-medium capitalize">{profile.partner2_cigarette_smoker}</span>
                      </div>
                    )}
                    {profile.partner2_alcohol_drinker && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Drinking:</span>
                        <span className="font-medium capitalize">{profile.partner2_alcohol_drinker}</span>
                      </div>
                    )}
                    {profile.partner2_marijuana_user && (
                      <div className="flex items-center">
                        <span className="text-white/60 w-28">Marijuana:</span>
                        <span className="font-medium capitalize">{profile.partner2_marijuana_user}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
        </ExpandableSection>

        {/* Expandable Section: Kinks and Interest */}
        {profile.kinks && profile.kinks.length > 0 && (
          <ExpandableSection 
            title="Kinks and Interest" 
            sectionKey="kinksInterest"
            testId="kinks-interest-section"
          >
            <div className="flex flex-wrap gap-2">
              {profile.kinks.map((kink, index) => (
                <Badge 
                  key={index} 
                  className="bg-red-500/20 text-red-400 border-red-500/30"
                  data-testid={`kink-badge-${index}`}
                >
                  {kink}
                </Badge>
              ))}
            </div>
          </ExpandableSection>
        )}

        {/* Expandable Section: Boundaries & Limits */}
        {(profile.soft_limits?.length || profile.hard_limits?.length || profile.safety_practices || profile.rules) && (
          <ExpandableSection 
            title="Boundaries & Limits" 
            sectionKey="boundariesLimits"
            testId="boundaries-limits-section"
          >
            <div className="space-y-4">
              {profile.soft_limits && profile.soft_limits.length > 0 && (
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-2">Soft Limits</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.soft_limits.map((limit, index) => (
                      <Badge 
                        key={index} 
                        className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        data-testid={`soft-limit-${index}`}
                      >
                        {limit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.hard_limits && profile.hard_limits.length > 0 && (
                <div>
                  <h4 className="text-red-400 font-semibold mb-2">Hard Limits</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.hard_limits.map((limit, index) => (
                      <Badge 
                        key={index} 
                        className="bg-red-500/20 text-red-400 border-red-500/30"
                        data-testid={`hard-limit-${index}`}
                      >
                        {limit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.safety_practices && (
                <div>
                  <h4 className="text-green-400 font-semibold mb-2">Safety Practices</h4>
                  <p className="text-white/80 whitespace-pre-wrap">{profile.safety_practices}</p>
                </div>
              )}
              
              {profile.rules && (
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">Rules</h4>
                  <p className="text-white/80 whitespace-pre-wrap">{profile.rules}</p>
                </div>
              )}
            </div>
          </ExpandableSection>
        )}

        {/* Expandable Section: What I am seeking */}
        {((profile.seeking && profile.seeking.length > 0) || (profile.seeking_relationship_type && profile.seeking_relationship_type.length > 0)) && (
          <ExpandableSection 
            title="What I am seeking" 
            sectionKey="whatSeeking"
            testId="what-seeking-section"
          >
            <div className="space-y-4">
              {profile.seeking && profile.seeking.length > 0 && (
                <div>
                  <h4 className="text-white/70 text-sm mb-2">Looking for:</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.seeking.map((item, index) => (
                      <Badge 
                        key={index} 
                        className="bg-pink-500/20 text-pink-400 border-pink-500/30"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.seeking_relationship_type && profile.seeking_relationship_type.length > 0 && (
                <div>
                  <h4 className="text-white/70 text-sm mb-2">Relationship types:</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.seeking_relationship_type.map((type, index) => (
                      <Badge 
                        key={index} 
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ExpandableSection>
        )}

        {/* Expandable Section: My BDSM Quiz results */}
        {profile.kink_quiz_results && Object.keys(profile.kink_quiz_results).length > 0 && (
          <ExpandableSection 
            title="My BDSM Quiz results" 
            sectionKey="bdsmQuiz"
            testId="bdsm-quiz-section"
          >
            <div className="space-y-3">
              {Object.entries(profile.kink_quiz_results)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([role, score], index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white/90 capitalize">{role.replace(/_/g, ' ')}</span>
                      <span className="text-pink-400 font-semibold">{Math.round(score as number)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </ExpandableSection>
        )}

        {/* Expandable Section: My Private Content - LAST TAB */}
        <ExpandableSection 
          title="My Private Content" 
          sectionKey="privateContent"
          testId="private-content-section"
        >
          {loadingPrivateContent ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : hasPrivateAccess || user?.id === userId ? (
            privateContent.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {privateContent.map((content) => (
                  <div key={content.id} className="relative aspect-square rounded-lg overflow-hidden bg-white/10">
                    {privateContentUrls[content.storage_path] ? (
                      content.content_type === 'video' ? (
                        <video 
                          src={privateContentUrls[content.storage_path]}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={privateContentUrls[content.storage_path]}
                          alt={content.description || 'Private content'}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Spinner />
                      </div>
                    )}
                    {content.content_type === 'video' && privateContentUrls[content.storage_path] && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-black/70 rounded-full p-2">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock className="h-12 w-12 mx-auto text-white/30 mb-3" />
                <p className="text-white/60">No private content uploaded yet</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <Lock className="h-12 w-12 mx-auto text-purple-400 mb-3" />
              <p className="text-white/80 font-semibold mb-2">Private Content</p>
              <p className="text-white/60 text-sm">
                This user's private content is only visible to those granted access.
              </p>
            </div>
          )}
        </ExpandableSection>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <Button 
            className={`flex-1 ${spiceTheme.components.button.gradient}`}
            data-testid="send-message-button"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Send Message
          </Button>
          <Button 
            className={spiceTheme.components.button.secondary}
            data-testid="like-button"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Member Since */}
        <div className="text-center text-white/50 text-sm mt-4">
          Member since {formatDate(profile.created_at)}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportUser}
          reportType="user"
          targetName={displayName}
        />
      )}

      {/* Block Confirmation Dialog */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className={`${spiceTheme.components.card} max-w-md w-full`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <UserX className="h-8 w-8 text-orange-400" />
                <h2 className="text-xl font-semibold text-white">Block User?</h2>
              </div>
              <p className="text-white/80 mb-6">
                Are you sure you want to block {displayName}? You will no longer see their profile or receive messages from them.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowBlockConfirm(false)}
                  className={spiceTheme.components.button.secondary}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBlockUser}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Block User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unmatch Confirmation Dialog */}
      {showUnmatchConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className={`${spiceTheme.components.card} max-w-md w-full`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <HeartOff className="h-8 w-8 text-pink-400" />
                <h2 className="text-xl font-semibold text-white">Unmatch?</h2>
              </div>
              <p className="text-white/80 mb-6">
                Are you sure you want to unmatch with {displayName}? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowUnmatchConfirm(false)}
                  className={spiceTheme.components.button.secondary}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnmatchUser}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Unmatch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Private Content Confirmation Dialog */}
      {showSharePrivateContent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className={`${spiceTheme.components.card} max-w-md w-full`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="h-8 w-8 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Share Private Content?</h2>
              </div>
              <p className="text-white/80 mb-6">
                Grant {displayName} access to view your private content? You can revoke access at any time from your settings.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowSharePrivateContent(false)}
                  className={spiceTheme.components.button.secondary}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSharePrivateContent}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Grant Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SpiceBackground>
  );
};
