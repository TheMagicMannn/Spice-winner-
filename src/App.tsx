import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { ProfileSetupPage } from './pages/ProfileSetup';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';
import { DashboardPage } from './pages/Dashboard';
import { HeroPage } from './pages/Hero';
import { CommunityPage } from './pages/Community';
import { EventsPage } from './pages/Events';
import { ISOPage } from './pages/ISOPage';
import { ISOPostDetailPage } from './pages/ISOPostDetailPage';
import { BrowsePage } from './pages/Browse';
import { MatchesPage } from './pages/Matches';
import { MessagesPage } from './pages/Messages';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { AdminVerificationPage } from './pages/AdminVerification';
import { UserProfilePage } from './pages/UserProfile';
import { HelpSupportPage } from './pages/HelpSupport';
import { AboutSpicePage } from './pages/AboutSpice';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Spinner } from './components/Spinner';
import { ToastProvider } from './hooks/useToast';
import { ToastContextProvider } from './hooks/use-toast';
import { Toaster } from './components/Toaster';
import { QueryClientProvider } from './lib/queryClient';
import { Profile } from './types';

/**
 * Comprehensive profile completion validation
 * Checks all required fields for both individual and couple accounts
 */
const isProfileComplete = (profile: Profile | null | undefined, accountType?: string): boolean => {
  if (!profile) {
    console.log('Profile check: No profile found');
    return false;
  }
  
  // Debug: Log profile data
  console.log('Checking profile completion:', {
    displayName: profile.displayName,
    location: profile.location,
    age: profile.age,
    gender: profile.gender,
    orientation: profile.orientation,
    relationshipStatus: profile.relationshipStatus,
    bioLength: profile.bio?.length,
    photoCount: profile.photos?.length,
    accountType: profile.accountType
  });
  
  // Base requirements for all account types
  const baseRequirements = [
    profile.displayName && profile.displayName.trim().length > 0,
    profile.location && profile.location.trim().length > 0,
    profile.age && profile.age >= 18,
    profile.gender && profile.gender.trim().length > 0,
    profile.orientation && profile.orientation.trim().length > 0,
    profile.relationshipStatus && profile.relationshipStatus.trim().length > 0,
    profile.bio && profile.bio.trim().length >= 69,
    profile.photos && profile.photos.length >= 2
  ];
  
  // Check if all base requirements are met
  const baseComplete = baseRequirements.every(Boolean);
  
  console.log('Base requirements check:', {
    hasDisplayName: !!profile.displayName,
    hasLocation: !!profile.location,
    hasAge: !!profile.age && profile.age >= 18,
    hasGender: !!profile.gender,
    hasOrientation: !!profile.orientation,
    hasRelationshipStatus: !!profile.relationshipStatus,
    hasBio: !!profile.bio && profile.bio.length >= 69,
    hasPhotos: !!profile.photos && profile.photos.length >= 2,
    baseComplete
  });
  
  if (!baseComplete) {
    console.log('Profile incomplete: Base requirements not met');
    return false;
  }
  
  // Additional requirements for couple accounts
  if (accountType === 'couple' || profile.accountType === 'couple') {
    const coupleRequirements = [
      profile.displayName2 && profile.displayName2.trim().length > 0,
      profile.age2 && profile.age2 >= 18,
      profile.gender2 && profile.gender2.trim().length > 0,
      profile.orientation2 && profile.orientation2.trim().length > 0
    ];
    
    const coupleComplete = coupleRequirements.every(Boolean);
    console.log('Couple requirements check:', {
      hasDisplayName2: !!profile.displayName2,
      hasAge2: !!profile.age2 && profile.age2 >= 18,
      hasGender2: !!profile.gender2,
      hasOrientation2: !!profile.orientation2,
      coupleComplete
    });
    
    return coupleComplete;
  }
  
  console.log('Profile complete!');
  return true;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // This effect ensures the view scrolls to the top on route changes.
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  // Authenticated User Flow
  if (user) {
    // Comprehensive profile completion check
    const profileComplete = isProfileComplete(user.profile, user.profile?.accountType);
    
    if (!profileComplete) {
      return (
         <Routes>
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
          <Route path="*" element={<Navigate to="/profile-setup" />} />
        </Routes>
      );
    }
    
    return (
      <>
        <main className="pb-16">
          <Routes>
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/iso" element={<ISOPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
            <Route path="/about-spice" element={<AboutSpicePage />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/admin/verification" element={<AdminVerificationPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/community" />} />
          </Routes>
        </main>
        <BottomNav />
      </>
    );
  }

  // Public (Unauthenticated) User Flow
  return (
    <Routes>
      <Route path="/" element={<HeroPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <QueryClientProvider>
        <ToastProvider>
          <ToastContextProvider>
            <HashRouter>
              <AppContent />
              <Toaster />
            </HashRouter>
          </ToastContextProvider>
        </ToastProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
