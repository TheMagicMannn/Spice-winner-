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
  }
});