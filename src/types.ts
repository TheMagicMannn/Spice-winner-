import { User as SupabaseUser } from '@supabase/supabase-js';

// Defines the structure for user's matching criteria
export interface MatchPreferences {
  ageRange: [number, number];
  genders: string[];
  sexualities: string[];
  searchingFor: string[];
  distance: number;
  vipOnly: boolean;
  verifiedOnly: boolean;
  experienceLevels: string[];
}

// Main Profile structure, accommodating both individual and couple accounts
export interface Profile {
  accountType: 'individual' | 'couple';
  
  // --- Core Info (Individual & Couple) ---
  id?: string;
  displayName: string;
  location: string;
  age: number;
  photos: string[];
  bio: string;
  relationshipStatus: string;
  seeking: string[]; // e.g., Men, Women, Couples
  seekingRelationshipType: string[]; // e.g., Casual NSA, FWB
  lifestyleExperience: string;
  
  // --- Detailed Info (Individual & Couple) ---
  interests: string[]; // Seeking matches with these interests
  kinks: string[];
  softLimits: string[];
  hardLimits: string[];
  safetyPractices: string;
  rules: string;
  
  // --- Individual-Specific Info ---
  gender?: string;
  orientation?: string; // Renamed from 'sexuality' for clarity

  // --- Couple-Specific Info ---
  displayName2?: string;
  gender2?: string;
  orientation2?: string;
  age2?: number;

  // --- App-Specific Data ---
  matchPreferences?: MatchPreferences;
  membershipTier?: 'basic' | 'vip';
}


export type User = SupabaseUser & {
  profile: Profile | null;
};
