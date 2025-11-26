import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { PrivacyPolicyPage } from './pages/PrivacyPolicy';
import { TermsOfServicePage } from './pages/TermsOfService';
import { ProfileSetupPage } from './pages/ProfileSetup';
import { ProfileSetupComprehensive } from './pages/ProfileSetupComprehensive';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';
import { DashboardPage } from './pages/Dashboard';
import { HeroPage } from './pages/Hero';
import { CommunityPage } from './pages/Community';
import { EventsPage } from './pages/Events';
import { EventDetailPage } from './pages/EventDetailPage';
import { ISOPage } from './pages/ISOPage';
import { ISOPostDetailPage } from './pages/ISOPostDetailPage';
import { BrowsePage } from './pages/Browse';
import { MatchesPage } from './pages/Matches';
import { MessagesPage } from './pages/Messages';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { AdminVerificationPage } from './pages/AdminVerification';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfilePage } from './pages/UserProfile';
import { HelpSupportPage } from './pages/HelpSupport';
import { AboutSpicePage } from './pages/AboutSpice';
import { LearningJourneyPage } from './pages/LearningJourney';
import { SpiceGroupsPage } from './pages/SpiceGroups';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Spinner } from './components/Spinner';
import { ToastProvider } from './hooks/useToast';
import { ToastContextProvider } from './hooks/use-toast';
import { Toaster } from './components/Toaster';
import { QueryClientProvider } from './lib/queryClient';
import { Profile } from './types';

/**
 * Check if profile setup is complete
 * Uses the database profileCompleted flag which is set during profile setup
 */
const isProfileComplete = (profile: Profile | null | undefined): boolean => {
  if (!profile) {
    console.log('Profile check: No profile found');
    return false;
  }
  
  // Debug: Log the entire profile object to see what fields are available
  console.log('🔍 DEBUG: Full profile object:', profile);
  console.log('🔍 DEBUG: Profile keys:', Object.keys(profile));
  
  // Check the profileCompleted flag from database
  // This flag is set to true when user completes the profile setup flow
  const isComplete = profile.profileCompleted === true;
  
  console.log('Profile completion check:', {
    profileCompleted: profile.profileCompleted,
    profileCompletedType: typeof profile.profileCompleted,
    isComplete,
    displayName: profile.displayName,
    accountType: profile.accountType
  });
  
  return isComplete;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Check if current route is chat page
  const isChatPage = location.pathname.startsWith('/messages/') && location.pathname.split('/').length > 2;

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
    // Check if profile setup is complete
    const profileComplete = isProfileComplete(user.profile);
    
    if (!profileComplete) {
      return (
         <Routes>
          <Route path="/profile-setup" element={<ProfileSetupComprehensive />} />
          <Route path="/profile-setup-old" element={<ProfileSetupPage />} />
          <Route path="*" element={<Navigate to="/profile-setup" />} />
        </Routes>
      );
    }
    
    return (
      <>
        <main className={isChatPage ? '' : 'pb-16'}>
          <Routes>
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/iso" element={<ISOPage />} />
            <Route path="/iso/:postId" element={<ISOPostDetailPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<ChatPage />} />
            <Route path="/messages/:matchId/:otherUserId" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/learning-journey" element={<LearningJourneyPage />} />
            <Route path="/spice-groups" element={<SpiceGroupsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
            <Route path="/about-spice" element={<AboutSpicePage />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/admin/verification" element={<AdminVerificationPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/community" />} />
          </Routes>
        </main>
        {!isChatPage && <BottomNav />}
      </>
    );
  }

  // Public (Unauthenticated) User Flow
  return (
    <Routes>
      <Route path="/" element={<HeroPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
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
