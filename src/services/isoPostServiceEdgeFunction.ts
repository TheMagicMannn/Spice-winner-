/**
 * Alternative ISO Post Service using Supabase Edge Functions
 * Use this if RLS policies are causing issues with direct database updates
 */

import { supabase } from './supabase';
import { supabaseUrl } from '../config';

/**
 * Delete an ISO post using Supabase Edge Function (bypasses RLS)
 * This is an alternative to the direct database update method
 */
export async function deletePostViaEdgeFunction(postId: string): Promise<void> {
  try {
    // Get the current session to pass the auth token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Authentication error:', sessionError);
      throw new Error('You must be logged in to delete a post. Please refresh the page and try again.');
    }

    console.log('Deleting post via Edge Function:', { postId, userId: session.user.id });

    // Get the Supabase URL from config
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    // Call the Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/delete-iso-post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Edge function error:', data);
      throw new Error(data.error || 'Failed to delete post');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete post');
    }

    console.log('Post successfully deleted via Edge Function:', data);
  } catch (error: any) {
    console.error('Error deleting ISO post via Edge Function:', error);
    throw error;
  }
}
