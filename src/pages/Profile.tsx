import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  MapPin, 
  LogOut, 
  Edit3, 
  Settings, 
  HelpCircle, 
  Shield, 
  Eye,
  Star,
  Crown,
  CheckCircle,
  Calendar,
  Camera,
  Zap
} from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { ProfileCard } from '@/components/ProfileCard';
import { EditProfileModal } from '@/components/EditProfileModal';
import { MatchPreferencesModal } from '@/components/MatchPreferencesModal';
import { GetVerifiedModal } from '@/components/GetVerifiedModal';
import { ProfileService } from '@/services/profileService';
import { verificationService } from '@/services/verificationService';
import { SpiceBackground, SpiceButton } from '@/components/SpiceComponents';
import { spiceTheme, themeStyles } from '@/styles/theme';
import { Profile, MatchPreferences } from '@/types';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatchPreferencesOpen, setIsMatchPreferencesOpen] = useState(false);
  const [isGetVerifiedOpen, setIsGetVerifiedOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'own' | 'preview'>('own');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Enhanced error boundary logging
  React.useEffect(() => {
    console.log('ProfilePage - Mounted');
    console.log('ProfilePage - User:', user);
    console.log('ProfilePage - Profile:', user?.profile);
    
    if (user && !user.profile) {
      console.error('ProfilePage - User exists but profile is null/undefined');
      setError('Profile data is missing. Please try logging out and back in.');
    }
  }, [user]);

  // Catch any render errors
  if (renderError) {
    console.error('ProfilePage - Render error:', renderError);
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="text-red-400 text-xl font-bold">Profile Page Error</div>
          <div className="text-white text-sm">{renderError.message}</div>
          <button
            onClick={() => {
              setRenderError(null);
              window.location.reload();
            }}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full"
          >
            Reload Page
          </button>
          <button
            onClick={logout}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full ml-2"
          >
            Sign Out
          </button>
        </div>
      </SpiceBackground>
    );
  }

  if (!user || !user.profile) {
    console.log('ProfilePage - No user or profile, showing spinner/error');
    return (
      <SpiceBackground className="min-h-screen flex items-center justify-center">
        {error ? (
          <div className="text-center space-y-4 p-8">
            <div className="text-red-400 text-xl">{error}</div>
            <button
              onClick={logout}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full"
            >
              Sign Out & Try Again
            </button>
          </div>
        ) : (
          <Spinner />
        )}
      </SpiceBackground>
    );
  }

  const { email, profile } = user;
  
  // Safe destructuring with defaults
  const displayName = profile?.displayName || '';
  const photos = profile?.photos || [];
  const bio = profile?.bio || '';
  const age = profile?.age;
  const location = profile?.location || '';

  // Get profile stats with safe fallbacks
  const profileStats = {
    photosCount: photos.length,
    isVerified: profile?.isVerified || false,
    membershipTier: profile?.membershipTier || 'basic',
    profileCompletion: calculateProfileCompletion(profile)
  };

  function calculateProfileCompletion(profile: Profile | null | undefined): number {
    if (!profile) return 0;
    const requiredFields = [
      profile.displayName,
      profile.age && profile.age >= 18,
      profile.location,
      profile.bio && profile.bio.length >= 50,
      profile.photos && profile.photos.length >= 2,
      profile.gender,
      profile.orientation,
      profile.relationshipStatus
    ];
    
    if (profile.accountType === 'couple') {
      requiredFields.push(
        profile.displayName2,
        profile.age2 && profile.age2 >= 18,
        profile.gender2,
        profile.orientation2
      );
    }
    
    const completedFields = requiredFields.filter(Boolean).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (updatedProfile: Profile) => {
    setIsLoading(true);
    try {
      console.log('ProfilePage - Saving profile:', updatedProfile);
      const savedProfile = await ProfileService.updateProfile(user.id, updatedProfile);
      updateProfile(savedProfile);
      console.log('ProfilePage - Profile saved successfully');
    } catch (error) {
      console.error('ProfilePage - Failed to save profile:', error);
      setError('Failed to save profile. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMatchPreferences = async (updatedPreferences: MatchPreferences) => {
    setIsLoading(true);
    try {
      console.log('ProfilePage - Saving match preferences:', updatedPreferences);
      const updatedProfile = {
        ...profile,
        matchPreferences: updatedPreferences
      };
      const savedProfile = await ProfileService.updateProfile(user.id, updatedProfile);
      updateProfile(savedProfile);
      console.log('ProfilePage - Match preferences saved successfully');
    } catch (error) {
      console.error('ProfilePage - Failed to save match preferences:', error);
      setError('Failed to save match preferences. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPhoto = async (file: File): Promise<string> => {
    return await ProfileService.uploadPhoto(user.id, file);
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    await ProfileService.deletePhoto(photoUrl);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getNameDisplay = () => {
    if (profile.accountType === 'couple' && profile.displayName2) {
      return `${displayName || 'User'} & ${profile.displayName2}`;
    }
    return displayName || 'Complete your profile';
  };

  return (
    <SpiceBackground className="min-h-screen pb-20">
      {/* Header */}
      <div className={spiceTheme.components.header}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl ${spiceTheme.components.text.title} mb-1`}>Profile</h1>
            <p className={spiceTheme.components.text.subtitle}>Manage your account and preferences</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'own' ? 'preview' : 'own')}
              className={spiceTheme.components.button.secondary}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Profile Preview Mode */}
        {viewMode === 'preview' && (
          <Card className={`${spiceTheme.components.card} animate-fade-in`}>
            <CardHeader>
              <CardTitle className="text-pink-400 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                How others see your profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileCard 
                profile={profile}
                showActions={false}
                variant="full"
              />
              <div className="mt-4 text-center">
                <Button
                  onClick={() => setViewMode('own')}
                  variant="outline"
                  className={spiceTheme.components.button.secondary}
                >
                  Back to Edit Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Own Profile View Mode */}
        {viewMode === 'own' && (
          <>
            {/* Profile Header */}
            <Card className={`${spiceTheme.components.card} animate-fade-in`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={photos?.[0]} />
                      <AvatarFallback className="bg-pink-500/20 text-pink-400 text-xl">
                        {displayName?.[0] || email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {profileStats.isVerified && (
                      <CheckCircle className="absolute -top-1 -right-1 h-6 w-6 text-blue-400 bg-black rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      {getNameDisplay()}
                      {profileStats.membershipTier === 'vip' && (
                        <Crown className="h-5 w-5 text-yellow-400" />
                      )}
                    </h2>
                    <div className="text-white/70 text-sm space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{email}</span>
                      </div>
                      {location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{location}</span>
                        </div>
                      )}
                      {age && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{age} years old</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <SpiceButton
                    onClick={handleEditProfile}
                    variant="secondary"
                    className="!py-2 !px-4"
                    data-testid="button-edit-profile"
                  >
                    <Edit3 className="h-4 w-4" />
                  </SpiceButton>
                </div>

                {/* Profile Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">{profileStats.photosCount}</div>
                    <div className="text-xs text-white/60">Photos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">{profileStats.profileCompletion}%</div>
                    <div className="text-xs text-white/60">Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">
                      {profileStats.membershipTier === 'vip' ? 'VIP' : 'Basic'}
                    </div>
                    <div className="text-xs text-white/60">Membership</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">Profile Completion</span>
                    <span className="text-sm text-pink-400">{profileStats.profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${profileStats.profileCompletion}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            {bio && (
              <Card className={`${spiceTheme.components.card} animate-fade-in`}>
                <CardHeader>
                  <CardTitle className="text-white">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 leading-relaxed">{bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className={`${spiceTheme.components.card} animate-fade-in`}>
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={handleEditProfile}
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  data-testid="edit-profile-action"
                >
                  <User className="h-4 w-4 mr-3" />
                  Edit Profile
                </Button>
                <Separator className="bg-pink-500/30" />
                <Button
                  variant="ghost"
                  onClick={() => setIsMatchPreferencesOpen(true)}
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  data-testid="match-preferences-action"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Match Preferences
                </Button>
                <Separator className="bg-pink-500/30" />
                {!profileStats.isVerified && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setIsGetVerifiedOpen(true)}
                      className="w-full justify-start text-blue-400 hover:bg-blue-500/10"
                      data-testid="get-verified-action"
                    >
                      <CheckCircle className="h-4 w-4 mr-3" />
                      Get Verified
                    </Button>
                    <Separator className="bg-pink-500/30" />
                  </>
                )}
                {profileStats.membershipTier === 'basic' && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Crown className="h-4 w-4 mr-3" />
                      Upgrade to VIP
                    </Button>
                    <Separator className="bg-pink-500/30" />
                  </>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                >
                  <Zap className="h-4 w-4 mr-3" />
                  Create Event or ISO Post
                </Button>
                <Separator className="bg-pink-500/30" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
                <Separator className="bg-pink-500/30" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Privacy & Safety
                </Button>
                <Separator className="bg-pink-500/30" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Help & Support
                </Button>
              </CardContent>
            </Card>

            {/* Sign Out Button with Hero Styling */}
            <button
              onClick={handleLogout}
              className="w-full py-4 px-5 bg-gray-900 text-red-400 font-bold text-lg rounded-full border-2 border-red-500/50 transition-all duration-300 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/50 flex items-center justify-center animate-glow-red"
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onUploadPhoto={handleUploadPhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      {/* Match Preferences Modal */}
      <MatchPreferencesModal
        isOpen={isMatchPreferencesOpen}
        onClose={() => setIsMatchPreferencesOpen(false)}
        currentPreferences={{
          ageRange: profile.matchPreferences?.ageRange || [18, 55],
          genders: profile.matchPreferences?.genders || [],
          sexualities: profile.matchPreferences?.sexualities || [],
          searchingFor: profile.matchPreferences?.searchingFor || [],
          distance: profile.matchPreferences?.distance ?? 50,
          vipOnly: profile.matchPreferences?.vipOnly ?? false,
          verifiedOnly: profile.matchPreferences?.verifiedOnly ?? true,
          experienceLevels: profile.matchPreferences?.experienceLevels || []
        }}
        onSave={handleSaveMatchPreferences}
      />

      {/* Get Verified Modal */}
      <GetVerifiedModal
        isOpen={isGetVerifiedOpen}
        onClose={() => setIsGetVerifiedOpen(false)}
        userId={user.id}
        userEmail={email}
        profile={profile}
      />

      {/* Theme Styles */}
      <style>{`
        ${themeStyles}
        
        .animate-glow-red {
          animation: glowRed 2.4s ease-in-out infinite;
        }
        
        @keyframes glowRed {
          0%, 100% {
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
            border-color: rgba(239, 68, 68, 0.5);
          }
          50% {
            box-shadow: 0 0 16px rgba(239, 68, 68, 1);
            border-color: rgba(239, 68, 68, 1);
          }
        }
      `}</style>
    </SpiceBackground>
  );
};
