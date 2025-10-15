import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Profile } from '../types';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';

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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          setUser({ ...session.user, profile: null });
        } else {
          setUser({ ...session.user, profile: profile as Profile });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
        fetchSessionAndProfile(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchSessionAndProfile(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Direct Supabase auth - no API middleman
  const login = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      
      if (error) throw error;
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
