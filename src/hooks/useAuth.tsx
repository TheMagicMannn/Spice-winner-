import { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { apiLogin, apiSignUp } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error: any) {
        console.error('Error fetching session:', error.message, error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: authUser, error } = await apiLogin(email, password);
      if (error) throw new Error(error);
      setUser(authUser);
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error.message, error.stack);
      return { error: error.message || 'Failed to login' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: authUser, error } = await apiSignUp(email, password);
      if (error) throw new Error(error);
      setUser(authUser);
      return { error: null };
    } catch (error: any) {
      console.error('Sign-up error:', error.message, error.stack);
      return { error: error.message || 'Failed to sign up' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      setUser(null);
      return { error: null };
    } catch (error: any) {
      console.error('Logout error:', error.message, error.stack);
      return { error: error.message || 'Failed to logout' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (currentUser: User) => {
    setUser(currentUser);
  };

  return { user, login, signUp, logout, updateProfile, loading };
};
