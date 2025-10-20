// src/utils/transformers.ts
// Utility functions to transform between frontend camelCase and database snake_case

import { Profile, MatchPreferences } from '../types';

/**
 * Converts a camelCase string to snake_case
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converts a snake_case string to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively converts object keys from camelCase to snake_case
 */
function keysToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(keysToSnakeCase);
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = toSnakeCase(key);
      result[snakeKey] = keysToSnakeCase(obj[key]);
    }
  }
  return result;
}

/**
 * Recursively converts object keys from snake_case to camelCase
 */
function keysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(keysToCamelCase);
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = toCamelCase(key);
      result[camelKey] = keysToCamelCase(obj[key]);
    }
  }
  return result;
}

/**
 * Transform frontend Profile to database format
 * Handles special cases like matchPreferences.sexualities -> orientations
 * Filters out undefined/null values and ensures proper data types
 */
export function profileToDatabase(profile: Partial<Profile>): any {
  // Create a clean copy without undefined values
  const cleanProfile: any = {};

  // List of fields that should never be sent in updates
  const excludeFields = ['id', 'createdAt', 'updatedAt', 'lastActiveAt'];

  // Process each field
  Object.keys(profile).forEach(key => {
    const value = (profile as any)[key];
    
    // Skip excluded fields and undefined values
    if (excludeFields.includes(key) || value === undefined) {
      return;
    }

    // Handle null values - convert to appropriate defaults
    if (value === null) {
      // For arrays, use empty array
      if (['photos', 'seeking', 'seekingRelationshipType', 'interests', 'kinks', 'softLimits', 'hardLimits'].includes(key)) {
        cleanProfile[key] = [];
      }
      // For strings, skip null values (let DB handle defaults)
      return;
    }

    // Handle array fields - ensure they're actual arrays
    if (['photos', 'seeking', 'seekingRelationshipType', 'interests', 'kinks', 'softLimits', 'hardLimits'].includes(key)) {
      cleanProfile[key] = Array.isArray(value) ? value : [];
      return;
    }

    // Handle string fields - trim whitespace
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        cleanProfile[key] = trimmed;
      }
      return;
    }

    // Handle numbers - ensure they're valid
    if (typeof value === 'number' && !isNaN(value)) {
      cleanProfile[key] = value;
      return;
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      cleanProfile[key] = value;
      return;
    }

    // Handle matchPreferences specially
    if (key === 'matchPreferences' && typeof value === 'object') {
      cleanProfile[key] = value;
      return;
    }

    // For any other object/value, include as-is
    cleanProfile[key] = value;
  });

  // Fix matchPreferences field name mismatch: sexualities -> orientations
  if (cleanProfile.matchPreferences) {
    const { sexualities, ...rest } = cleanProfile.matchPreferences;
    
    // Create a properly formatted matchPreferences object
    const matchPrefs: any = {
      ageRange: rest.ageRange || [18, 65],
      genders: Array.isArray(rest.genders) ? rest.genders : [],
      orientations: Array.isArray(sexualities) ? sexualities : [],
      searchingFor: Array.isArray(rest.searchingFor) ? rest.searchingFor : [],
      distance: typeof rest.distance === 'number' ? rest.distance : 50,
      vipOnly: Boolean(rest.vipOnly),
      verifiedOnly: Boolean(rest.verifiedOnly),
      experienceLevels: Array.isArray(rest.experienceLevels) ? rest.experienceLevels : []
    };

    cleanProfile.matchPreferences = matchPrefs;
  }

  // Convert all keys to snake_case
  const result = keysToSnakeCase(cleanProfile);
  
  return result;
}

/**
 * Transform database Profile to frontend format
 * Handles special cases like matchPreferences.orientations -> sexualities
 */
export function profileFromDatabase(dbProfile: any): Profile {
  // Convert all keys to camelCase first
  const profile = keysToCamelCase(dbProfile);

  // Fix matchPreferences field name mismatch: orientations -> sexualities
  if (profile.matchPreferences && profile.matchPreferences.orientations) {
    profile.matchPreferences.sexualities = profile.matchPreferences.orientations;
    delete profile.matchPreferences.orientations;
  }

  return profile as Profile;
}

/**
 * Validate that all required fields are present before database insert
 */
export function validateProfileForDatabase(profile: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!profile.display_name) errors.push('display_name is required');
  if (!profile.location) errors.push('location is required');
  if (!profile.age || profile.age < 18) errors.push('age must be 18 or greater');
  if (!profile.gender) errors.push('gender is required');
  if (!profile.orientation) errors.push('orientation is required');
  
  // Validate couple-specific fields if account_type is couple
  if (profile.account_type === 'couple') {
    if (!profile.display_name2) errors.push('display_name2 is required for couples');
    if (!profile.gender2) errors.push('gender2 is required for couples');
    if (!profile.orientation2) errors.push('orientation2 is required for couples');
    if (!profile.age2 || profile.age2 < 18) errors.push('age2 must be 18 or greater for couples');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
