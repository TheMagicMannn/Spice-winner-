// src/types.ts
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface MatchPreferences {
  ageRange: [number, number];
  genders: string[];
  sexualities: string[];       // used in your form
  searchingFor: string[];      // 'Individual' | 'Couple' | 'Both' values from UI
  distance: number;
  vipOnly: boolean;
  verifiedOnly: boolean;
  experienceLevels: string[];
}

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
  orientation?: string;   // in your code you used 'orientation' for sexuality
  orientation2?: string;

  // matching preferences
  matchPreferences?: MatchPreferences;

  // DB-related optional meta (commonly present in profiles table)
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// optional User type if you want to extend Supabase user with profile
export type User = SupabaseUser & {
  profile?: Profile | null;
};
