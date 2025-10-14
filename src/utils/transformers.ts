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
 */
export function profileToDatabase(profile: Partial<Profile>): any {
  const dbProfile = { ...profile };

  // Fix matchPreferences field name mismatch: sexualities -> orientations
  if (dbProfile.matchPreferences) {
    const { sexualities, ...rest } = dbProfile.matchPreferences;
    // Create a new object with orientations instead of sexualities
    dbProfile.matchPreferences = {
      ...rest,
      orientations: sexualities || [],
    } as any;
  }

  // Convert all keys to snake_case
  return keysToSnakeCase(dbProfile);
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
