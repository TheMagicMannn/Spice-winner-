import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';
import { Profile } from '../types';
import { apiGetSignedUploadUrl, apiUploadPhotoWithSignedUrl } from '../services/api';
import { profileToDatabase, profileFromDatabase, validateProfileForDatabase } from '../utils/transformers';

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
      console.log('🔄 Transforming profile data for database...');
      
      // Transform camelCase frontend data to snake_case database format
      const dbProfileData = profileToDatabase(profileData);
      
      // Validate the transformed data
      const validation = validateProfileForDatabase(dbProfileData);
      if (!validation.valid) {
        console.error('❌ Validation errors:', validation.errors);
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      console.log('✅ Profile data validation passed');
      console.log('📤 Sending to database:', dbProfileData);
      
      // Save to Supabase with snake_case fields
      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            ...dbProfileData,
            profile_completed: true,  // Mark profile as completed
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
        throw supabaseError;
      }
      
      console.log('✅ Profile saved successfully to database');

      // Update global state with profileCompleted flag set to true
      updateProfile({ ...profileData, profileCompleted: true });
      return { error: null };
    } catch (error: any) {
      console.error('❌ Failed to save profile:', error);
      return { error: error.message };
    }
  };

  /**
   * Fetch profile from database and transform to frontend format
   */
  const getProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Transform snake_case database data to camelCase frontend format
      return { data: profileFromDatabase(data), error: null };
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      return { data: null, error: error.message };
    }
  };

  return { uploadPhoto, completeProfileSetup, getProfile };
};
