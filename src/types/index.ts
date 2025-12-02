// src/types/index.ts
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

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxAttendees?: number;
  currentAttendees?: number;
  createdBy: string;
  isPrivate: boolean;
  coverImage?: string;
  tags?: string[];
  attendees?: string[];
  price?: number;
  requirements?: string[];
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'video';
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  read: boolean;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastActivityAt: string;
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  adminId?: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
};

export type AuthStackParamList = {
  Hero: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Community: undefined;
  Events: undefined;
  Messages: undefined;
  Browse: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Chat: { conversationId: string };
  EventDetail: { eventId: string };
  UserProfile: { userId: string };
  Settings: undefined;
  AdminDashboard: undefined;
  AdminVerification: undefined;
  HelpSupport: undefined;
  AboutSpice: undefined;
  LearningJourney: undefined;
  SpiceGroups: undefined;
  ISO: undefined;
  ISOPostDetail: { postId: string };
};

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  age: string;
}