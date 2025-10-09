import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';
import { Profile } from '../types';

export const useProfile = () => {
  const { user, updateProfile } = useAuth();

  // --- Upload Photo ---
  const uploadPhoto = async (file: File) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      // Create a Supabase storage path
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('profile-photos') // Make sure bucket exists
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return { data: { publicUrl: publicUrlData.publicUrl }, error: null };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { data: null, error: error.message };
    }
  };

  // --- Complete or Update Profile ---
  const completeProfileSetup = async (profileData: Profile) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      // Prepare full profile object
      const payload: Partial<Profile> = {
        ...profileData,
        photos: profileData.photos || [], // array of URLs
        kinks: profileData.kinks || [],
        softLimits: profileData.softLimits || [],
        hardLimits: profileData.hardLimits || [],
        seeking: profileData.seeking || [],
        seekingRelationshipType: profileData.seekingRelationshipType || [],
        matchPreferences: profileData.matchPreferences || {},
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            ...payload,
          },
          { onConflict: 'id' }
        );

      if (error) throw error;

      // Update global auth/profile state
      updateProfile(payload as Profile);

      return { error: null };
    } catch (error: any) {
      console.error('Profile save error:', error);
      return { error: error.message };
    }
  };

  return { uploadPhoto, completeProfileSetup };
};
