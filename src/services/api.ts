import { Profile } from '../types';

const API_BASE_URL = '/api';

// Helper function to handle API requests
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'An unknown error occurred');
  }
  
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Auth API
export const apiSignUp = (email: string, password: string, name: string, age: string) => {
  return fetchApi('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, data: { display_name: name, age: parseInt(age, 10) } }),
  });
};

export const apiLogin = (email: string, password: string) => {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Profile API
export const apiUpdateProfile = (profileData: Profile, token: string) => {
  return fetchApi('/profile', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(profileData),
  });
};

// Storage API
export const apiGetSignedUploadUrl = (fileName: string, token: string): Promise<{ signedUrl: string; publicUrl: string; }> => {
  return fetchApi('/storage/upload-url', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fileName }),
  });
};

export const apiUploadPhotoWithSignedUrl = async (signedUrl: string, file: File) => {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 
        'Content-Type': file.type
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload file: ${errorText}`);
  }
  return response;
};


// AI API
export const apiGenerateBio = (interests: string[], token: string): Promise<{ bio: string }> => {
  return fetchApi('/ai/generate-bio', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ interests }),
  });
};