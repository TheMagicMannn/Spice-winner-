import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';
import { Profile } from '../types';
import { apiGetSignedUploadUrl, apiUploadPhotoWithSignedUrl } from '../services/api';

// Helper function to convert camelCase to snake_case for database fields
const toSnakeCase = (obj: any): any => {
  const snakeCaseObj: any = {};
  
  const fieldMapping: Record<string, string> = {
    accountType: 'account_type',
    displayName: 'display_name',
    displayName2: 'display_name2',
    relationshipStatus: 'relationship_status',
    lifestyleExperience: 'lifestyle_experience',
    seekingRelationshipType: 'seeking_relationship_type',
    softLimits: 'soft_limits',
    hardLimits: 'hard_limits',
    safetyPractices: 'safety_practices',
    matchPreferences: 'match_preferences',
    membershipTier: 'membership_tier',
    userId: 'user_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };

  for (const [key, value] of Object.entries(obj)) {
    const dbKey = fieldMapping[key] || key;
    snakeCaseObj[dbKey] = value;
  }

  return snakeCaseObj;
};

// Helper function to convert snake_case to camelCase when reading from database
export const toCamelCase = (obj: any): any => {
  if (!obj) return obj;
  
  const camelCaseObj: any = {};
  
  const fieldMapping: Record<string, string> = {
    account_type: 'accountType',
    display_name: 'displayName',
    display_name2: 'displayName2',
    relationship_status: 'relationshipStatus',
    lifestyle_experience: 'lifestyleExperience',
    seeking_relationship_type: 'seekingRelationshipType',
    soft_limits: 'softLimits',
    hard_limits: 'hardLimits',
    safety_practices: 'safetyPractices',
    match_preferences: 'matchPreferences',
    membership_tier: 'membershipTier',
    user_id: 'userId',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  };

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = fieldMapping[key] || key;
    camelCaseObj[camelKey] = value;
  }

  return camelCaseObj;
};

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
      // Convert camelCase to snake_case for database
      const dbData = toSnakeCase({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      });

      // Save directly to Supabase
      // Note: When id is the primary key, onConflict is not needed and can cause 400 errors
      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert(dbData);

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
