import { supabase } from './supabase';
import { Profile } from '../types';
import { profileFromDatabase } from '../utils/transformers';

export interface MatchedProfile extends Profile {
  distanceMiles?: number;
  compatibilityScore: number;
}

export interface SwipeResult {
  success: boolean;
  action: 'like' | 'pass' | 'super_like';
  isMatch: boolean;
  matchId?: string;
}

export class MatchingService {
  /**
   * Get matched profiles for the current user using the matching algorithm
   */
  static async getMatchedProfiles(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<MatchedProfile[]> {
    try {
      const { data, error } = await supabase.rpc('get_matched_profiles', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Error fetching matched profiles:', error);
        throw error;
      }

      // Transform database results to frontend format
      return (data || []).map((dbProfile: any) => {
        // Convert snake_case fields to camelCase
        const profile = profileFromDatabase({
          id: dbProfile.profile_id,
          display_name: dbProfile.display_name,
          display_name2: dbProfile.display_name2,
          age: dbProfile.age,
          age2: dbProfile.age2,
          account_type: dbProfile.account_type,
          location: dbProfile.location,
          bio: dbProfile.bio,
          photos: dbProfile.photos,
          gender: dbProfile.gender,
          gender2: dbProfile.gender2,
          orientation: dbProfile.orientation,
          orientation2: dbProfile.orientation2,
          relationship_status: dbProfile.relationship_status,
          lifestyle_experience: dbProfile.lifestyle_experience,
          interests: dbProfile.interests,
          kinks: dbProfile.kinks,
          membership_tier: dbProfile.membership_tier,
          is_verified: dbProfile.is_verified,
          last_active_at: dbProfile.last_active_at
        });

        // Add matching-specific fields
        return {
          ...profile,
          distanceMiles: dbProfile.distance_miles,
          compatibilityScore: dbProfile.compatibility_score
        } as MatchedProfile;
      });
    } catch (error) {
      console.error('MatchingService.getMatchedProfiles error:', error);
      throw error;
    }
  }

  /**
   * Record a swipe action (like/pass/super_like)
   */
  static async recordSwipe(
    userId: string,
    targetUserId: string,
    action: 'like' | 'pass' | 'super_like'
  ): Promise<SwipeResult> {
    try {
      const { data, error } = await supabase.rpc('record_swipe_action', {
        p_user_id: userId,
        p_target_user_id: targetUserId,
        p_action: action
      });

      if (error) {
        console.error('Error recording swipe:', error);
        throw error;
      }

      return {
        success: data.success,
        action: data.action,
        isMatch: data.is_match,
        matchId: data.match_id
      };
    } catch (error) {
      console.error('MatchingService.recordSwipe error:', error);
      throw error;
    }
  }

  /**
   * Get user's swipe history
   */
  static async getSwipeHistory(
    userId: string,
    limit: number = 100
  ): Promise<Array<{ targetUserId: string; action: string; createdAt: string }>> {
    try {
      const { data, error } = await supabase
        .from('swipe_actions')
        .select('target_user_id, action, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching swipe history:', error);
        throw error;
      }

      return (data || []).map(item => ({
        targetUserId: item.target_user_id,
        action: item.action,
        createdAt: item.created_at
      }));
    } catch (error) {
      console.error('MatchingService.getSwipeHistory error:', error);
      throw error;
    }
  }

  /**
   * Get profiles the user has liked
   */
  static async getLikedProfiles(userId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('swipe_actions')
        .select(`
          target_user_id,
          profiles!swipe_actions_target_user_id_fkey (*)
        `)
        .eq('user_id', userId)
        .eq('action', 'like')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching liked profiles:', error);
        throw error;
      }

      // Transform profiles from database format
      return (data || [])
        .filter(item => item.profiles)
        .map(item => profileFromDatabase(item.profiles));
    } catch (error) {
      console.error('MatchingService.getLikedProfiles error:', error);
      throw error;
    }
  }

  /**
   * Check if two users have mutually liked each other
   */
  static async checkMutualLike(
    userId: string,
    targetUserId: string
  ): Promise<boolean> {
    try {
      // Check if both users liked each other
      const { data, error } = await supabase
        .from('swipe_actions')
        .select('user_id')
        .or(
          `and(user_id.eq.${userId},target_user_id.eq.${targetUserId},action.eq.like),` +
          `and(user_id.eq.${targetUserId},target_user_id.eq.${userId},action.eq.like)`
        );

      if (error) {
        console.error('Error checking mutual like:', error);
        throw error;
      }

      // If we have 2 records, it's a mutual like
      return (data || []).length === 2;
    } catch (error) {
      console.error('MatchingService.checkMutualLike error:', error);
      throw error;
    }
  }

  /**
   * Update user's location coordinates for distance-based matching
   */
  static async updateLocation(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude,
          longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating location:', error);
        throw error;
      }
    } catch (error) {
      console.error('MatchingService.updateLocation error:', error);
      throw error;
    }
  }

  /**
   * Get geolocation from browser and update profile
   */
  static async updateLocationFromBrowser(userId: string): Promise<boolean> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await this.updateLocation(
              userId,
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(true);
          } catch (error) {
            console.error('Failed to update location:', error);
            resolve(false);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          resolve(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000 // Cache for 10 minutes
        }
      );
    });
  }

  /**
   * Get compatibility score between two profiles
   * (This is calculated server-side, but useful for display)
   */
  static getCompatibilityLevel(score: number): {
    label: string;
    color: string;
    emoji: string;
  } {
    if (score >= 90) {
      return { label: 'Excellent Match', color: 'text-green-400', emoji: '🔥' };
    } else if (score >= 75) {
      return { label: 'Great Match', color: 'text-blue-400', emoji: '⭐' };
    } else if (score >= 60) {
      return { label: 'Good Match', color: 'text-purple-400', emoji: '💫' };
    } else if (score >= 40) {
      return { label: 'Potential Match', color: 'text-pink-400', emoji: '💖' };
    } else {
      return { label: 'Low Match', color: 'text-gray-400', emoji: '👋' };
    }
  }

  /**
   * Calculate estimated distance text
   */
  static formatDistance(miles?: number): string {
    if (!miles) return 'Distance unknown';
    
    if (miles < 1) {
      return 'Less than 1 mile away';
    } else if (miles < 10) {
      return `${miles.toFixed(1)} miles away`;
    } else {
      return `${Math.round(miles)} miles away`;
    }
  }
}

export default MatchingService;
