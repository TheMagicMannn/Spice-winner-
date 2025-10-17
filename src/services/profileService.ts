import { Profile } from '../types';
import { supabase } from './supabase';
import { profileToDatabase, profileFromDatabase } from '../utils/transformers';

export class ProfileService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data ? profileFromDatabase(data) : null;
    } catch (error) {
      console.error('ProfileService.getProfile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, profileData: Profile): Promise<Profile> {
    try {
      // Transform camelCase to snake_case for database
      const dbProfile = profileToDatabase(profileData);
      
      // Remove id from update data
      const { id, ...updateData } = dbProfile;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Transform back to camelCase
      return profileFromDatabase(data);
    } catch (error) {
      console.error('ProfileService.updateProfile error:', error);
      throw error;
    }
  }

  /**
   * Upload profile photo to Supabase Storage
   */
  static async uploadPhoto(userId: string, file: File): Promise<string> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading photo:', error);
        throw error;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (error) {
      console.error('ProfileService.uploadPhoto error:', error);
      throw error;
    }
  }

  /**
   * Delete profile photo from Supabase Storage
   */
  static async deletePhoto(photoUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(photoUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts.slice(-2).join('/'); // userId/filename.ext

      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting photo:', error);
        throw error;
      }
    } catch (error) {
      console.error('ProfileService.deletePhoto error:', error);
      throw error;
    }
  }

  /**
   * Get profiles for browsing (excluding current user)
   */
  static async getBrowseProfiles(
    userId: string, 
    limit: number = 10,
    offset: number = 0
  ): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .eq('is_active', true)
        .eq('profile_completed', true)
        .range(offset, offset + limit - 1)
        .order('last_active_at', { ascending: false });

      if (error) {
        console.error('Error fetching browse profiles:', error);
        throw error;
      }

      // Transform all profiles from database format
      return (data || []).map(profileFromDatabase);
    } catch (error) {
      console.error('ProfileService.getBrowseProfiles error:', error);
      throw error;
    }
  }

  /**
   * Search profiles with filters
   */
  static async searchProfiles(
    userId: string,
    filters: {
      ageRange?: [number, number];
      genders?: string[];
      accountTypes?: string[];
      location?: string;
      verifiedOnly?: boolean;
      vipOnly?: boolean;
      distance?: number;
    } = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<Profile[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .eq('is_active', true)
        .eq('profile_completed', true);

      // Apply filters
      if (filters.ageRange) {
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1]);
      }

      if (filters.genders && filters.genders.length > 0) {
        query = query.in('gender', filters.genders);
      }

      if (filters.accountTypes && filters.accountTypes.length > 0) {
        query = query.in('account_type', filters.accountTypes);
      }

      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      if (filters.vipOnly) {
        query = query.eq('membership_tier', 'vip');
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1)
        .order('last_active_at', { ascending: false });

      if (error) {
        console.error('Error searching profiles:', error);
        throw error;
      }

      return (data || []).map(profileFromDatabase);
    } catch (error) {
      console.error('ProfileService.searchProfiles error:', error);
      throw error;
    }
  }

  /**
   * Get online users for Community page
   */
  static async getOnlineUsers(
    userId: string, 
    limit: number = 50
  ): Promise<Profile[]> {
    try {
      // Get users active in the last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .eq('is_active', true)
        .eq('profile_completed', true)
        .gte('last_active_at', fifteenMinutesAgo)
        .limit(limit)
        .order('last_active_at', { ascending: false });

      if (error) {
        console.error('Error fetching online users:', error);
        throw error;
      }

      return (data || []).map(profileFromDatabase);
    } catch (error) {
      console.error('ProfileService.getOnlineUsers error:', error);
      throw error;
    }
  }

  /**
   * Update user's last active timestamp
   */
  static async updateLastActive(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          last_active_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating last active:', error);
        // Don't throw - this is not critical
      }
    } catch (error) {
      console.error('ProfileService.updateLastActive error:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Mark profile as completed
   */
  static async markProfileCompleted(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error marking profile completed:', error);
        throw error;
      }
    } catch (error) {
      console.error('ProfileService.markProfileCompleted error:', error);
      throw error;
    }
  }

  /**
   * Batch upload multiple photos
   */
  static async uploadMultiplePhotos(
    userId: string, 
    files: File[]
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadPhoto(userId, file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('ProfileService.uploadMultiplePhotos error:', error);
      throw error;
    }
  }

  /**
   * Reorder profile photos
   */
  static async reorderPhotos(
    userId: string, 
    photoUrls: string[]
  ): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          photos: photoUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error reordering photos:', error);
        throw error;
      }

      return profileFromDatabase(data);
    } catch (error) {
      console.error('ProfileService.reorderPhotos error:', error);
      throw error;
    }
  }

  /**
   * Get profile statistics
   */
  static async getProfileStats(userId: string): Promise<{
    totalViews: number;
    totalLikes: number;
    totalMatches: number;
    profileCompletion: number;
  }> {
    try {
      // Get profile to calculate completion
      const profile = await this.getProfile(userId);
      
      // Calculate profile completion percentage
      let completionScore = 0;
      const totalFields = 10; // Adjust based on required fields

      if (profile) {
        if (profile.displayName) completionScore++;
        if (profile.age && profile.age >= 18) completionScore++;
        if (profile.location) completionScore++;
        if (profile.bio && profile.bio.length >= 50) completionScore++;
        if (profile.photos && profile.photos.length >= 2) completionScore++;
        if (profile.gender) completionScore++;
        if (profile.orientation) completionScore++;
        if (profile.relationshipStatus) completionScore++;
        if (profile.interests && profile.interests.length > 0) completionScore++;
        if (profile.seeking && profile.seeking.length > 0) completionScore++;
      }

      const profileCompletion = Math.round((completionScore / totalFields) * 100);

      // TODO: Implement views, likes, matches counting from respective tables
      return {
        totalViews: 0,
        totalLikes: 0, 
        totalMatches: 0,
        profileCompletion
      };
    } catch (error) {
      console.error('ProfileService.getProfileStats error:', error);
      throw error;
    }
  }
}

export default ProfileService;