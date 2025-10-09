import { supabase } from './supabase';
import { Profile, User } from '../types';

export const apiLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Login error:', error.message, error);
      return { user: null, error: error.message };
    }
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('API login error:', error.message, error.stack);
    return { user: null, error: error.message || 'Failed to login' };
  }
};

export const apiSignUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error('Sign-up error:', error.message, error);
      return { user: null, error: error.message };
    }
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('API sign-up error:', error.message, error.stack);
    return { user: null, error: error.message || 'Failed to sign up' };
  }
};

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
