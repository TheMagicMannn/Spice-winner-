export interface Profile {
  user_id: string;
  accountType: 'individual' | 'couple';
  displayName: string;
  location: string;
  age: number;
  bio?: string;
  photos: string[];
  relationshipStatus: string;
  seeking: string[];
  seekingRelationshipType: string[];
  lifestyleExperience: string;
  interests: string[];
  kinks: string[];
  softLimits: string[];
  hardLimits: string[];
  safetyPractices?: string;
  rules?: string;
  gender: string;
  orientation: string;
  displayName2?: string;
  gender2?: string;
  orientation2?: string;
  age2?: number;
  matchPreferences: {
    ageRange: [number, number];
    genders: string[];
    sexualities: string[];
    searchingFor: string[];
    distance: number;
    vipOnly: boolean;
    verifiedOnly: boolean;
    experienceLevels: string[];
  };
  membershipTier: 'basic' | 'vip';
}
