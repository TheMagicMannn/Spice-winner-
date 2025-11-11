import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../config';

// The hard error checks were removed to prevent a crash on load.
// The app will now load, and Supabase API calls will fail gracefully
// if the credentials in config.ts are not set, which is a better UX.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Storage key with app-specific prefix for better isolation
    storageKey: 'spice-dating-auth',
    // Improved session detection for mobile browsers
    flowType: 'pkce'
  }
});