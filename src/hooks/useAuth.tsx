import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Profile } from '../types';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { profileFromDatabase } from '../utils/transformers';
import { activityLogService } from '../services/activityLogService';
import { ProfileService } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  logout: () => Promise<any>;
  signUp: (email: string, pass: string, name: string, age: string) => Promise<{ error: any }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: any }>;
  updateUserPassword: (password: string) => Promise<{ error: any }>;
  updateProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async (session: Session | null) => {
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching profile:", error);
            
            // Check if it's an auth error
            if (error.message?.includes('JWT') || error.message?.includes('session')) {
              console.warn('Session expired, clearing user state');
              setUser(null);
              return;
            }
            
            setUser({ ...session.user, profile: null });
          } else {
            // Debug: Log raw database profile
            console.log('🔍 RAW DATABASE PROFILE:', profile);
            console.log('🔍 profile_completed from DB:', profile?.profile_completed);
            
            // Transform database snake_case to frontend camelCase
            const transformedProfile = profile ? profileFromDatabase(profile) : null;
            
            // Debug: Log transformed profile
            console.log('🔍 TRANSFORMED PROFILE:', transformedProfile);
            console.log('🔍 profileCompleted after transform:', transformedProfile?.profileCompleted);
            
            setUser({ ...session.user, profile: transformedProfile });
          }
        } catch (error) {
          console.error('Unexpected error during profile fetch:', error);
          setUser({ ...session.user, profile: null });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    // Initial session fetch with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setIsLoading(false);
        return;
      }
      fetchSessionAndProfile(session);
    }).catch(error => {
      console.error('Failed to get session:', error);
      setUser(null);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        
        // Handle specific auth events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log(`Auth event: ${event}`);
        }
        
        if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          // Session was refreshed, update user
          fetchSessionAndProfile(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        } else {
          fetchSessionAndProfile(session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Update last_active_at every 5 minutes when user is logged in
  useEffect(() => {
    if (!user?.id) return;

    // Update immediately on login/mount
    ProfileService.updateLastActive(user.id);

    // Update every 5 minutes
    const interval = setInterval(() => {
      ProfileService.updateLastActive(user.id);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id]);

  // ✅ Direct Supabase auth - no API middleman
  const login = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      
      if (error) throw error;
      
      // Log the login activity
      if (data.user) {
        activityLogService.logLogin(data.user.id, { email });
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error };
    }
  };
  
  // ✅ Direct Supabase auth - no API middleman
  const signUp = async (email: string, pass: string, name: string, age: string) => {
    try {
      const { data, error} = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            display_name: name,
            age: parseInt(age, 10),
          },
        },
      });
      
      if (error) throw error;
      
      // Log the signup activity
      if (data.user) {
        activityLogService.logSignup(data.user.id, { 
          email,
          display_name: name,
          age: parseInt(age, 10)
        });
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const logout = () => {
    return supabase.auth.signOut();
  };

  const updateProfile = (profile: Profile) => {
    setUser((currentUser) => {
      if (currentUser) {
        return { ...currentUser, profile };
      }
      return null;
    });
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    try {
      // Use hash routing for password reset
      const redirectUrl = `${window.location.origin}${window.location.pathname}#/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { 
        redirectTo: redirectUrl 
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Password reset email error:', error);
      return { error };
    }
  };

  const updateUserPassword = async (password: string) => {
    try {
      // Check if user is authenticated (they should be from the reset link)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please use the password reset link from your email.');
      }

      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { error };
    }
  };

  const value = {
    user, isLoading, login, logout, signUp, updateProfile,
    sendPasswordResetEmail,
    updateUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
