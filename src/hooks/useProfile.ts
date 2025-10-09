import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';
import { Profile } from '../types';
import { apiGetSignedUploadUrl, apiUploadPhotoWithSignedUrl, apiUpdateProfile } from '../services/api';

export const useProfile = () => {
  const { user, updateProfile } = useAuth();

  const uploadPhoto = async (file: File) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No session token found');
      
      const { signedUrl, publicUrl } = await apiGetSignedUploadUrl(file.name, token);
      
      await apiUploadPhotoWithSignedUrl(signedUrl, file);

      return { data: { publicUrl }, error: null };
    } catch (error: any) {
      console.error('Upload error:', error.message, error.stack);
      return { data: null, error: error.message || 'Failed to upload photo' };
    }
  };
  
  const completeProfileSetup = async (profileData: Profile) => {
    if (!user) {
      const error = 'User not authenticated';
      console.error(error);
      return { error };
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No session token found');

      // Ensure user_id is included in the profile data
      const profileDataWithUserId = {
        ...profileData,
        user_id: user.id,
      };

      // Call the API to update the profile
      const response = await apiUpdateProfile(profileDataWithUserId, token);
      if (response.error) throw new Error(response.error);

      // Update global state
      updateProfile(profileDataWithUserId);
      return { error: null };
    } catch (error: any) {
      console.error('Failed to save profile:', error.message, error.stack);
      return { error: error.message || 'Failed to save profile' };
    }
  };

  return { uploadPhoto, completeProfileSetup };
};
