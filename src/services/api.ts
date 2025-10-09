import { supabase } from './supabase';
import { Profile } from '../types';

export const apiUpdateProfile = async (profileData: Profile, token: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { ...profileData, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error.message, error);
      return { error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('API update profile error:', error.message, error.stack);
    return { error: error.message || 'Failed to update profile' };
  }
};

export const apiGetSignedUploadUrl = async (fileName: string, token: string) => {
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .createSignedUploadUrl(`public/${fileName}`);

  if (error) {
    console.error('Signed URL error:', error.message, error);
    throw error;
  }
  return { signedUrl: data.signedUrl, publicUrl: `https://your-supabase-project-id.supabase.co/storage/v1/object/public/profile-photos/public/${fileName}` };
};

export const apiUploadPhotoWithSignedUrl = async (signedUrl: string, file: File) => {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!response.ok) {
    const error = new Error('Failed to upload photo to signed URL');
    console.error(error.message, response.statusText);
    throw error;
  }
};
