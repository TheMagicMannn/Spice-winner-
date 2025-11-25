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
  dateOfBirth?: string; // MM/DD/YYYY format for individuals
  age?: number; // legacy, deprecated - use dateOfBirth instead
  age2?: number; // partner 2 age (couples)
  bio?: string;
  photos?: string[]; // uploaded public URLs

  // relationship + lifestyle
  relationshipStatus?: string;
  lifestyleExperience?: string;
  membershipTier?: 'basic' | 'vip';
  vip_expires_at?: string;

  // seeking / interests / kinks / limits
  seeking?: string[];                 // SEEKING_OPTIONS
  seekingRelationshipType?: string[]; // SEEKING_RELATIONSHIP_TYPE_OPTIONS
  seekingPreferences?: string[];      // SEEKING_PREFERENCES_OPTIONS
  interests?: string[];               // INTERESTS_OPTIONS
  kinks?: string[];                   // KINKS_OPTIONS
  interestedKinks?: string[];         // KINKS_INTERESTED_OPTIONS (Step 2 - Individual)
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

  // === ABOUT ME/ABOUT US STEP FIELDS ===
  // Physical Stats
  height?: string;              // Height in format "5'10&quot;"
  weight?: string;              // Weight in lbs
  bodyType?: string;            // Slim, Average, Dad Bod, Curvy, Fit, Thick, BBW
  hairColor?: string;           // Hair color options
  eyeColor?: string;            // Eye color options
  facialHair?: string;          // Yes/No/Doesn't Apply
  ethnicity?: string;           // Ethnicity options

  // Lifestyle & Health
  cigaretteSmoker?: string;      // Yes/No
  alcoholDrinker?: string;       // Yes/No
  marijuanaUser?: string;        // Yes/No
  tattoos?: boolean;             // Boolean
  piercings?: boolean;           // Boolean
  bodyHair?: string;             // Body hair options
  groomingStyle?: string;        // Grooming style options
  birthControl?: string;         // Birth control options
  latexAllergy?: boolean;        // Boolean

  // Health & Safety
  lastSTITestDate?: string;      // Date input format (will be converted to DATE in DB)
  stiPositiveResults?: string;    // Yes/No
  canHost?: string;              // Yes/No/Possibly

  // === COUPLES ACCOUNT - PARTNER 1 STATS ===
  partner1Height?: string;
  partner1Weight?: string;
  partner1BodyType?: string;
  partner1HairColor?: string;
  partner1EyeColor?: string;
  partner1FacialHair?: string;
  partner1Ethnicity?: string;
  partner1CigaretteSmoker?: string;
  partner1AlcoholDrinker?: string;
  partner1MarijuanaUser?: string;
  partner1Tattoos?: boolean;
  partner1Piercings?: boolean;
  partner1BodyHair?: string;
  partner1GroomingStyle?: string;
  partner1BirthControl?: string;
  partner1LatexAllergy?: boolean;
  partner1LastSTITestDate?: string;
  partner1StiPositiveResults?: string;
  partner1CanHost?: string;

  // === COUPLES ACCOUNT - PARTNER 2 STATS ===
  partner2Height?: string;
  partner2Weight?: string;
  partner2BodyType?: string;
  partner2HairColor?: string;
  partner2EyeColor?: string;
  partner2FacialHair?: string;
  partner2Ethnicity?: string;
  partner2CigaretteSmoker?: string;
  partner2AlcoholDrinker?: string;
  partner2MarijuanaUser?: string;
  partner2Tattoos?: boolean;
  partner2Piercings?: boolean;
  partner2BodyHair?: string;
  partner2GroomingStyle?: string;
  partner2BirthControl?: string;
  partner2LatexAllergy?: boolean;
  partner2LastSTITestDate?: string;
  partner2StiPositiveResults?: string;
  partner2CanHost?: string;

  // matching preferences
  matchPreferences?: MatchPreferences;

  // kink quiz results
  kinkQuizResults?: Record<string, number>;

  // === INDIVIDUAL ACCOUNT STEP 2 FIELDS ===
  // Role selection and quiz results
  topRoles?: string[];                 // Selected roles from quiz or manual selection

  // === COUPLES ACCOUNT STEP 2 FIELDS ===
  // Partner 1 fields
  partner1Role?: string;              // Selected role for partner 1
  partner1QuizResults?: Record<string, number>; // Quiz results for partner 1
  partner1Experience?: string;        // Lifestyle experience level
  partner1Kinks?: string[];           // Kinks interested in (max 15)
  partner1SoftLimits?: string[];      // Soft limits (max 10)
  partner1HardLimits?: string[];      // Hard limits (max 10)
  partner1SafetyPractices?: string;   // Safety practices
  partner1Rules?: string;             // Rules (optional)

  // Partner 2 fields
  partner2Role?: string;              // Selected role for partner 2
  partner2QuizResults?: Record<string, number>; // Quiz results for partner 2
  partner2Experience?: string;        // Lifestyle experience level
  partner2Kinks?: string[];           // Kinks interested in (max 15)
  partner2SoftLimits?: string[];      // Soft limits (max 10)
  partner2HardLimits?: string[];      // Hard limits (max 10)
  partner2SafetyPractices?: string;   // Safety practices
  partner2Rules?: string;             // Rules (optional)

  // DB-related optional meta (from profiles table)
  id?: string;  // User's UUID (same as auth.users.id)
  createdAt?: string;  // Maps to created_at in database
  updatedAt?: string;  // Maps to updated_at in database
  
  // Profile status flags
  isVerified?: boolean;
  isActive?: boolean;
  profileCompleted?: boolean;
  lastActiveAt?: string;
  
  // Membership level
  membershipLevel?: 'free' | 'premium' | 'vip' | 'platinum';
}

// optional User type if you want to extend Supabase user with profile
export type User = SupabaseUser & {
  profile?: Profile | null;
};
