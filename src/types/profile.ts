// Enhanced Profile Type Definitions for SPICE
import { MatchPreferences as BaseMatchPreferences } from '../types';

export type AccountType = "individual" | "individual_with_linking" | "shared_couple";
export type Visibility = "public" | "matches_only" | "private";
export type PartnerLinkStatus = "pending" | "accepted" | "rejected";
export type ProfileVisibility = "public" | "verified_only" | "matches_only" | "private";

export interface Location {
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface PhotoItem {
  id: string;
  url: string;
  visibility: Visibility;
  uploadedAt?: string;
  isBlurredUntilMatch?: boolean;
}

export interface PartnerLink {
  id: string;
  userId: string;
  partnerId: string;
  partnerName?: string;
  partnerEmail?: string;
  status: PartnerLinkStatus;
  relationshipType?: "primary" | "secondary" | "anchor" | "casual" | string;
  visibility?: Visibility;
  createdAt: string;
  updatedAt?: string;
}

export interface Verification {
  identityVerified?: boolean;
  identityVerifiedAt?: string | null;
  lifestyleVerified?: string[];
  partnerVerifiedIds?: string[];
}

// Use MatchPreferences from base types
export type MatchPreferences = BaseMatchPreferences;

export interface SpiceProfile {
  id?: string;
  accountType: AccountType | null;
  createdAt?: string;
  updatedAt?: string;

  // Common
  displayName?: string;
  bio?: string;
  location?: Location | string;
  profileVisibility?: ProfileVisibility;
  photos?: PhotoItem[];
  trustScore?: number;

  // Relationship & linking
  relationshipStatus?: ("single" | "in_relationship" | "partnered" | "open_relationship" | "polyamorous" | "swinger" | "other")[];
  exploringWith?: "partner" | "solo" | "n/a";
  partnerLinks?: PartnerLink[];
  linkedBy?: PartnerLink[];

  // Lifestyles & roles
  lifestyles?: ("ENM" | "BDSM" | "Poly" | "Swinger" | "Vanilla")[];
  roles?: string[];
  kinkTags?: string[];
  experienceLevel?: "New" | "Beginner" | "Moderate" | "Advanced";
  hardLimits?: string[];
  softLimits?: string[];
  safeword?: string | null;

  // Personal fields
  birthdate?: string | null;
  age?: number | null;
  genderIdentity?: string | null;
  pronouns?: string | null;
  sexualOrientation?: string[] | null;

  // Demographics
  height?: string;
  weight?: string;
  bodyType?: string;
  hairColor?: string;
  eyeColor?: string;
  tattoos?: boolean;
  piercings?: boolean;
  canHost?: "Yes" | "No" | "Possibly" | null;
  ethnicity?: string;
  cigaretteSmoker?: string;
  alcoholDrinker?: string;
  marijuanaUser?: string;
  bodyHair?: string;
  groomingStyle?: string;
  birthControl?: string;
  latexAllergy?: boolean;
  lastSTITestDate?: string;
  stiPositiveResults?: string;
  facialHair?: string;

  // Verification
  verification?: Verification;

  // Preferences
  matchPreferences?: MatchPreferences;

  // Couple-specific
  primaryUserId?: string;
  secondaryUserId?: string;
  coupleName?: string;
  coupleBio?: string;
  partnerQuickStats?: {
    partnerA?: { displayName?: string; age?: number; role?: string };
    partnerB?: { displayName?: string; age?: number; role?: string };
  };

  // Membership
  membershipTier?: "basic" | "vip";
}
