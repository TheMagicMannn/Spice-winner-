import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Profile } from '../types';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { apiLogin, apiSignUp } from '../services/api';

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

  const login = async (email: string, pass: string) => {
    try {
      const { session } = await apiLogin(email, pass);
      await supabase.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };
  
  const signUp = async (email: string, pass: string, name: string, age: string) => {
    try {
      await apiSignUp(email, pass, name, age);
      return { error: null };
    } catch (error: any) {
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
  
  const sendPasswordResetEmail = (email: string) => {
    const redirectUrl = `${window.location.origin}/#/reset-password`;
    return supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
  };

  const updateUserPassword = (password: string) => {
    return supabase.auth.updateUser({ password });
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