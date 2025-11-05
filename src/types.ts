// src/types.ts
import { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Match Preferences Interface (Frontend Format - camelCase)
 * Note: When saving to database, 'sexualities' is transformed to 'orientations'
 */
export interface MatchPreferences {
  ageRange: [number, number];
  genders: string[];
  sexualities: string[];       // Frontend field - maps to 'orientations' in DB
  searchingFor: string[];      // 'Individual' | 'Couple' | 'Both' values from UI
  distance: number;
  vipOnly: boolean;
  verifiedOnly: boolean;
  experienceLevels: string[];
}

/**
 * Profile Interface (Frontend Format - camelCase)
 * Note: All fields are automatically transformed to snake_case when saving to database
 * Example: displayName -> display_name, matchPreferences -> match_preferences
 */
export interface Profile {
  // account type (your UI uses 'individual' | 'couple')
  accountType?: 'individual' | 'couple';

  // core/display fields
  displayName?: string;
  displayName2?: string; // for couples
  location?: string;
  age?: number;
  age2?: number; // partner 2 age (couples)
  bio?: string;
  photos?: string[]; // uploaded public URLs

  // relationship + lifestyle
  relationshipStatus?: string;
  lifestyleExperience?: string;
  membershipTier?: 'basic' | 'vip';

  // seeking / interests / kinks / limits
  seeking?: string[];                 // SEEKING_OPTIONS
  seekingRelationshipType?: string[]; // SEEKING_RELATIONSHIP_TYPE_OPTIONS
  interests?: string[];               // INTERESTS_OPTIONS
  kinks?: string[];                   // KINKS_OPTIONS
  softLimits?: string[];              // LIMITS_OPTIONS
  hardLimits?: string[];              // LIMITS_OPTIONS

  // safety & rules
  safetyPractices?: string;
  rules?: string;

  // identity fields
  gender?: string;
  gender2?: string;
  orientation?: string;   // sexuality field
  orientation2?: string;

  // matching preferences
  matchPreferences?: MatchPreferences;

  // kink quiz results
  kinkQuizResults?: Record<string, number>;

  // DB-related optional meta (from profiles table)
  id?: string;  // User's UUID (same as auth.users.id)
  createdAt?: string;  // Maps to created_at in database
  updatedAt?: string;  // Maps to updated_at in database
  
  // Profile status flags
  isVerified?: boolean;
  isActive?: boolean;
  profileCompleted?: boolean;
  lastActiveAt?: string;
}

// optional User type if you want to extend Supabase user with profile
export type User = SupabaseUser & {
  profile?: Profile | null;
};
