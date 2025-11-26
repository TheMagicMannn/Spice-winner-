// src/types_comprehensive.ts
import { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Account Types:
 * - individual: Single user, single login
 * - couple_shared: One profile, two separate login emails, shared management  
 * - couple_shell: Two individual profiles that link together to form a couple view
 */
export type AccountType = 'individual' | 'couple_shared' | 'couple_shell';

/**
 * Match Preferences Interface
 */
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

/**
 * Couple Link Interface (for couple_shell accounts)
 */
export interface CoupleLink {
  id: string;
  partner1Id: string;
  partner2Id: string;
  linkStatus: 'pending' | 'accepted' | 'rejected';
  requestedBy: string;
  requestedAt: string;
  respondedAt?: string;
  coupleDisplayName?: string;
  coupleBio?: string;
  couplePhotos?: string[];
  sharedSeeking?: string[];
  sharedBoundaries?: any;
  sharedRules?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Comprehensive Profile Interface
 */
export interface Profile {
  // === ACCOUNT TYPE ===
  accountType?: AccountType;

  // === CORE FIELDS ===
  id?: string;
  displayName?: string;
  displayName2?: string; // For couple_shared
  location?: string;
  dateOfBirth?: string; // MM/DD/YYYY
  age?: number;
  age2?: number; // For couple_shared
  bio?: string;
  photos?: string[];
  
  // === COUPLE SHARED SPECIFIC ===
  partner1Email?: string; // Login email for partner 1
  partner2Email?: string; // Login email for partner 2
  partner1LastLogin?: string;
  partner2LastLogin?: string;
  sharedAccountCreatedBy?: 'partner1' | 'partner2';
  
  // === COUPLE SHELL SPECIFIC ===
  coupleLink?: CoupleLink; // Link to couple shell data
  linkedPartnerId?: string; // ID of linked partner profile
  
  // === IDENTITY ===
  gender?: string;
  gender2?: string;
  orientation?: string;
  orientation2?: string;
  
  // === EXPERIENCE LEVEL (Detailed) ===
  experienceLevel?: 'curious_newbie' | 'exploring' | 'beginner' | 'intermediate' | 'experienced' | 'veteran' | '24_7_lifestyle';
  yearsInLifestyle?: number;
  currentlyActive?: boolean;
  
  // === BDSM/KINK DETAILED ===
  bdsmRolePrimary?: string; // Dominant, Submissive, Switch, etc.
  bdsmRoleSecondary?: string[];
  powerExchangeLevel?: 'none' | 'bedroom_only' | 'lifestyle' | '24_7' | 'high_protocol';
  protocolLevel?: 'none' | 'low' | 'medium' | 'high' | 'very_high';
  collaredOwned?: boolean;
  collarOwnershipStatus?: string;
  lookingForCollarOwnership?: boolean;
  hardLimitsDetailed?: any; // JSONB structure
  softLimitsDetailed?: any;
  negotiationStyle?: string;
  aftercareNeeds?: string[];
  safeWords?: string[];
  scenePreferences?: any;
  dungeonEtiquetteKnowledge?: string;
  publicPlayComfort?: string;
  demoPerformanceComfort?: string;
  
  // === SWINGER DETAILED ===
  swingerType?: 'full_swap' | 'soft_swap' | 'same_room' | 'separate_room' | 'voyeur' | 'exhibitionist';
  swapPreferences?: string[];
  partyEventPreferences?: string[];
  clubExperience?: boolean;
  favoriteClubs?: string[];
  groupPlayMaxSize?: number;
  watchingBeingWatched?: 'exhibitionist' | 'voyeur' | 'both' | 'neither';
  unicornBullExperience?: boolean;
  hostingCapability?: string;
  travelForPlay?: boolean;
  
  // === ENM/POLY DETAILED ===
  polyStructureDetailed?: string;
  hierarchyLevel?: string;
  nestingPartnerStatus?: string;
  polyculeSize?: number;
  polySaturationLevel?: 'room_for_more' | 'at_capacity' | 'unsure' | 'not_looking';
  kitchenTableParallel?: 'kitchen_table' | 'parallel' | 'garden_party' | 'flexible';
  vetoPowerExists?: boolean;
  schedulingStyle?: string;
  metamourRelationshipPreference?: string;
  relationshipEscalatorViews?: string;
  soloPolyStatus?: boolean;
  
  // === COMMUNICATION & COMPATIBILITY ===
  communicationStyle?: string;
  conflictResolutionStyle?: string;
  textingFrequencyPreference?: string;
  phoneCallPreference?: string;
  videoChatComfort?: string;
  responseTimeExpectation?: string;
  loveLanguages?: string[];
  attachmentStyle?: string;
  personalityTraits?: string[];
  
  // === MEETING & DATING PREFERENCES ===
  firstMeetingPreference?: string;
  howSoonToMeet?: string;
  datingPace?: string;
  idealDateActivities?: string[];
  travelDistanceWilling?: number;
  localEventsAttend?: boolean;
  
  // === SEXUAL HEALTH & SAFETY (Detailed) ===
  stiTestingFrequency?: string;
  testingRequiredBeforePlay?: boolean;
  barrierMethodRequired?: boolean;
  fluidBondingStatus?: string[];
  birthControlStatusDetailed?: string;
  sexualHealthDiscussionTiming?: string;
  riskProfile?: 'very_cautious' | 'moderate' | 'open' | 'fluid_bonded_only';
  lastSTITestDate?: string;
  stiPositiveResults?: string;
  
  // === BOUNDARIES & RULES (Comprehensive) ===
  partnerRulesList?: string[];
  boundariesNonNegotiable?: string[];
  boundariesFlexible?: string[];
  checkInFrequency?: string;
  transparencyLevel?: string;
  photoVideoConsent?: string;
  socialMediaBoundaries?: string;
  overnightStaysAllowed?: boolean;
  relationshipProgressionPace?: string;
  
  // === LIFESTYLE INTEGRATION ===
  outToVanillaFriends?: boolean;
  outToFamily?: boolean;
  outAtWork?: boolean;
  discretionNeeds?: string;
  workScheduleType?: string;
  availabilityTimes?: string[];
  hasChildren?: boolean;
  childrenLiveWith?: boolean;
  parentingSchedule?: string;
  
  // === INTERESTS & ACTIVITIES (Expanded) ===
  munchesAttend?: boolean;
  workshopsClassesInterest?: boolean;
  kinkConventionsAttend?: boolean;
  onlineCommunitiesActive?: boolean;
  mentorMenteeInterest?: 'want_mentor' | 'want_to_mentor' | 'both' | 'neither';
  volunteerCommunityRoles?: string[];
  lifestyleActivities?: string[];
  tryingInterests?: string;
  
  // === FOR COUPLES: RELATIONSHIP DYNAMICS ===
  coupleRelationshipLength?: string;
  howCoupleMet?: string;
  coupleDynamicType?: string;
  bothPartnersBi?: boolean;
  couplePlayStyle?: 'always_together' | 'sometimes_separate' | 'completely_separate' | 'depends';
  jealousyManagementStyle?: string;
  compersionExperience?: string;
  
  // === PARTNER PREFERENCES ===
  ageGapComfort?: string;
  bodyTypePreferences?: string[];
  appearanceImportance?: string;
  chemistryVsCompatibility?: string;
  dealBreakersAbsolute?: string[];
  mustHavesList?: string[];
  niceToHavesList?: string[];
  
  // === PROFILE VERIFICATION & TRUST ===
  referencesAvailable?: boolean;
  referenceWillingness?: string;
  referenceContacts?: string[];
  backgroundCheckCompleted?: boolean;
  stdTestShareWillingness?: string;
  
  // === PHYSICAL STATS ===
  height?: string;
  weight?: string;
  bodyType?: string;
  hairColor?: string;
  eyeColor?: string;
  facialHair?: string;
  ethnicity?: string;
  cigaretteSmoker?: string;
  alcoholDrinker?: string;
  marijuanaUser?: string;
  tattoos?: boolean;
  piercings?: boolean;
  bodyHair?: string;
  groomingStyle?: string;
  birthControl?: string;
  latexAllergy?: boolean;
  canHost?: string;
  
  // === PARTNER DATA (for couple_shared accounts) ===
  partner1Data?: any; // JSONB with all partner 1 specific fields
  partner2Data?: any; // JSONB with all partner 2 specific fields
  
  // === ORIGINAL ENHANCED WORKFLOW FIELDS ===
  relationshipContext?: string;
  partnerAlignment?: string[];
  consentConfirmed?: boolean;
  lifestyleIdentities?: string[];
  enmPolyStructure?: string[];
  swingerStructure?: string[];
  bdsmRoles?: string[];
  intentHereFor?: string[];
  comfortableMeeting?: string[];
  comfortEnvironments?: string[];
  negotiationComfort?: string;
  autonomyLevel?: string;
  seekingDetailed?: string[];
  polyRole?: string;
  interestedInGenders?: string[];
  interestedInTypes?: string[];
  couplePref?: string[];
  coupleInteraction?: string;
  coupleInteractionGenders?: string[];
  singlesGenders?: string[];
  groupTypes?: string[];
  polyculePreferences?: string[];
  
  // === ROLE/KINK FIELDS ===
  topRoles?: string[];
  lifestyleExperience?: string;
  interestedKinks?: string[];
  kinkQuizResults?: Record<string, number>;
  softLimits?: string[];
  hardLimits?: string[];
  safetyPractices?: string;
  rules?: string;
  
  // === MATCH PREFERENCES ===
  matchPreferences?: MatchPreferences;
  
  // === MEMBERSHIP ===
  membershipTier?: 'basic' | 'vip';
  vipExpiresAt?: string;
  
  // === METADATA ===
  relationshipStatus?: string;
  seeking?: string[];
  seekingRelationshipType?: string[];
  interests?: string[];
  kinks?: string[];
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  isActive?: boolean;
  profileCompleted?: boolean;
  lastActiveAt?: string;
  
  // === MISSING FIELDS FROM STEP COMPONENTS ===
  // Added for TypeScript compatibility
  hairLength?: string;
  fitnessLevel?: string;
  energyLevel?: string;
  hasMetamours?: boolean;
  metamourRelationship?: string;
  parallelDating?: string;
  escalatorInterests?: string[];
}

export type User = SupabaseUser & {
  profile?: Profile | null;
};
