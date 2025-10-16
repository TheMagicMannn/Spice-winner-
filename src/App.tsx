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
  const isProfileComplete = (profile: Profile | null, accountType: string): boolean => {
  if (!profile) return false;
  
  const baseRequirements = [
    profile.displayName,
    profile.location,
    profile.age && profile.age >= 18,
    profile.gender,
    profile.orientation,
    profile.relationshipStatus,
    profile.bio && profile.bio.length >= 69,
    profile.photos && profile.photos.length >= 2
  ];
  
  if (accountType === 'couple') {
    const coupleRequirements = [
      profile.displayName2,
      profile.age2 && profile.age2 >= 18,
      profile.gender2,
      profile.orientation2
    ];
    return [...baseRequirements, ...coupleRequirements].every(Boolean);
  }
  
  return baseRequirements.every(Boolean);
};
  
  // Authenticated User Flow
  if (user) {
    // If profile exists but is incomplete, force setup.
    if (!user.profile || !user.profile.displayName || !user.profile.photos || user.profile.photos.length === 0) {
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
