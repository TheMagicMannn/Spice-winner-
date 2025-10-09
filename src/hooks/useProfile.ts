import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';
import { Profile } from '../types';
import { apiGetSignedUploadUrl, apiUploadPhotoWithSignedUrl } from '../services/api';

export const useProfile = () => {
  const { user, updateProfile } = useAuth();

  const uploadPhoto = async (file: File) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No session token found');

      const { signedUrl, publicUrl } = await apiGetSignedUploadUrl(file.name, token);
      await apiUploadPhotoWithSignedUrl(signedUrl, file);

      return { data: { publicUrl }, error: null };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { data: null, error: error.message };
    }
  };

  const completeProfileSetup = async (profileData: Profile) => {
    if (!user) {
      const error = 'User not authenticated';
      console.error(error);
      return { error };
    }

    try {
      // Save directly to Supabase
      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            ...profileData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (supabaseError) throw supabaseError;

      updateProfile(profileData); // Update global state
      return { error: null };
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      return { error: error.message };
    }
  };

  return { uploadPhoto, completeProfileSetup };
};
