import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Profile } from '../types';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { profileFromDatabase } from '../utils/transformers';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  logout: () => Promise<any>;
  signUp: (email: string, pass: string, name: string, age: string) => Promise<{ error: any }>;
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
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            setUser({ ...session.user, profile: null });
          } else {
            const transformedProfile = profile ? profileFromDatabase(profile) : null;
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
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signUp = async (email: string, pass: string, name: string, age: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          display_name: name,
          age: parseInt(age, 10),
        },
      },
    });
    return { error };
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

  const value = {
    user, isLoading, login, logout, signUp, updateProfile,
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
