// src/utils/transformers.ts
import { Profile } from '../types';

/**
 * Transforms a profile object from the database (snake_case)
 * to the frontend-friendly format (camelCase).
 * @param dbProfile The profile object from the Supabase 'profiles' table.
 * @returns A Profile object with camelCase properties.
 */
export const profileFromDatabase = (dbProfile: any): Profile => {
  return {
    id: dbProfile.id,
    updatedAt: dbProfile.updated_at,
    displayName: dbProfile.display_name,
    displayName2: dbProfile.display_name_2,
    accountType: dbProfile.account_type,
    age: dbProfile.age,
    age2: dbProfile.age_2,
    gender: dbProfile.gender,
    gender2: dbProfile.gender_2,
    orientation: dbProfile.orientation,
    orientation2: dbProfile.orientation_2,
    relationshipStatus: dbProfile.relationship_status,
    lifestyleExperience: dbProfile.lifestyle_experience,
    seeking: dbProfile.seeking,
    seekingRelationshipType: dbProfile.seeking_relationship_type,
    bio: dbProfile.bio,
    photos: dbProfile.photos,
    privatePhotos: dbProfile.private_photos,
    interests: dbProfile.interests,
    kinks: dbProfile.kinks,
    softLimits: dbProfile.soft_limits,
    hardLimits: dbProfile.hard_limits,
    safetyPractices: dbProfile.safety_practices,
    rules: dbProfile.rules,
    location: dbProfile.location,
    isVerified: dbProfile.is_verified,
    membershipTier: dbProfile.membership_tier,
    lastActive: dbProfile.last_active,
    kinkQuizResults: dbProfile.kink_quiz_results,
    matchPreferences: dbProfile.match_preferences,
  };
};
