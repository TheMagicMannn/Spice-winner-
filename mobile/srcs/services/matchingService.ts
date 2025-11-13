import { supabase } from './supabase';
import { Profile } from '../types';
import { profileFromDatabase } from '../utils/transformers';
import Geolocation from '@react-native-community/geolocation';

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
  static async getMatchedProfiles(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<MatchedProfile[]> {
    const { data, error } = await supabase.rpc('get_matched_profiles', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset
    });

    if (error) throw error;

    return (data || []).map((dbProfile: any) => {
      const profile = profileFromDatabase(dbProfile);
      return { ...profile, distanceMiles: dbProfile.distance_miles, compatibilityScore: dbProfile.compatibility_score } as MatchedProfile;
    });
  }

  static async recordSwipe(
    userId: string,
    targetUserId: string,
    action: 'like' | 'pass' | 'super_like'
  ): Promise<SwipeResult> {
    const { data, error } = await supabase.rpc('record_swipe_action', {
      p_user_id: userId,
      p_target_user_id: targetUserId,
      p_action: action
    });
    if (error) throw error;
    return data;
  }

  static async getMutualMatches(userId: string): Promise<Profile[]> {
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (matchError) throw matchError;
    if (!matches) return [];

    const otherUserIds = matches.map(match =>
      match.user1_id === userId ? match.user2_id : match.user1_id
    );

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    if (profileError) throw profileError;
    return (profiles || []).map(profileFromDatabase);
  }

  static async getLikedProfiles(userId: string): Promise<Profile[]> {
    const { data: swipes, error: swipeError } = await supabase
      .from('swipe_actions')
      .select('target_user_id')
      .eq('user_id', userId)
      .eq('action', 'like');

    if (swipeError) throw swipeError;
    if (!swipes) return [];

    const targetUserIds = swipes.map(s => s.target_user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', targetUserIds);

    if (profileError) throw profileError;
    return (profiles || []).map(profileFromDatabase);
  }

  static async getProfilesWhoLikeMe(userId: string): Promise<Profile[]> {
    const { data: swipes, error: swipeError } = await supabase
      .from('swipe_actions')
      .select('user_id')
      .eq('target_user_id', userId)
      .eq('action', 'like');

    if (swipeError) throw swipeError;
    if (!swipes) return [];

    const userIds = swipes.map(s => s.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profileError) throw profileError;
    return (profiles || []).map(profileFromDatabase);
  }

  static async updateLocation(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ latitude, longitude, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  }

  static async updateLocationFromDevice(userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            await this.updateLocation(userId, position.coords.latitude, position.coords.longitude);
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
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }
}
