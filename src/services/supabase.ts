import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseUrl, supabaseAnonKey } from '../config';
import { AppState, Platform } from 'react-native';

// AsyncStorage adapter for React Native
const AsyncStorageAdapter = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  },
};

// Create Supabase client with React Native configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
    storage: AsyncStorageAdapter,
    storageKey: 'spice-dating-auth',
    flowType: 'pkce',
    debug: __DEV__,
  },
  global: {
    fetch: (url, options) => {
      // Convert url to string for checking
      const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
      
      // Debug logging for message inserts
      if (urlString.includes('/messages') && options?.method === 'POST') {
        console.log('[SUPABASE_FETCH] POST to /messages');
        console.log('[SUPABASE_FETCH] URL:', urlString);
        console.log('[SUPABASE_FETCH] Headers:', options.headers);
        console.log('[SUPABASE_FETCH] Body:', options.body);
        console.log('[SUPABASE_FETCH] Body length:', options.body?.toString().length, 'bytes');
        
        // Parse and log the actual JSON being sent
        try {
          const bodyObj = JSON.parse(options.body as string);
          console.log('[SUPABASE_FETCH] Parsed body:', bodyObj);
          console.log('[SUPABASE_FETCH] Body keys:', Object.keys(bodyObj));
          
          // CRITICAL CHECK: Is 'id' in the body?
          if ('id' in bodyObj) {
            console.error('[SUPABASE_FETCH] ⚠️ WARNING: id field detected in HTTP body!');
            console.error('[SUPABASE_FETCH] ID value:', bodyObj.id);
          }
        } catch (e) {
          console.log('[SUPABASE_FETCH] Could not parse body:', e);
        }
      }
      
      return fetch(url, options);
    }
  },
  db: {
    schema: 'public',
  },
});

// Handle app state changes for real-time connection
let currentAppState = AppState.currentState;

AppState.addEventListener('change', (nextAppState) => {
  if (currentAppState.match(/inactive|background/) && nextAppState === 'active') {
    // App has come to the foreground, refresh auth session
    supabase.auth.startAutoRefresh();
  } else if (currentAppState === 'active' && nextAppState.match(/inactive|background/)) {
    // App is going to background, stop auto refresh to save resources
    supabase.auth.stopAutoRefresh();
  }
  currentAppState = nextAppState;
});

// Export convenience methods
export const getCurrentUser = () => supabase.auth.getUser();
export const getCurrentSession = () => supabase.auth.getSession();
export const signOut = () => supabase.auth.signOut();