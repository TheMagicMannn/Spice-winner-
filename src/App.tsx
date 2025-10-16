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
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';
import { ToastProvider } from './hooks/useToast';
import { Toaster } from './components/Toaster';
import { Profile } from './types';

/**
 * Comprehensive profile completion validation
 * Checks all required fields for both individual and couple accounts
 */
const isProfileComplete = (profile: Profile | null, accountType?: string): boolean => {
  if (!profile) return false;
  
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
  
  if (!baseComplete) return false;
  
  // Additional requirements for couple accounts
  if (accountType === 'couple' || profile.accountType === 'couple') {
    const coupleRequirements = [
      profile.displayName2 && profile.displayName2.trim().length > 0,
      profile.age2 && profile.age2 >= 18,
      profile.gender2 && profile.gender2.trim().length > 0,
      profile.orientation2 && profile.orientation2.trim().length > 0
    ];
    
    return coupleRequirements.every(Boolean);
  }
  
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
        <Header />
        <main>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
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
      <ToastProvider>
        <HashRouter>
          <AppContent />
          <Toaster />
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
