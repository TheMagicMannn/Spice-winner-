// src/utils/transformers.test.ts
// Simple test examples to demonstrate the transformation

import { profileToDatabase, profileFromDatabase } from './transformers';
import { Profile } from '../types';

// Example 1: Individual Profile Transformation
const exampleIndividualProfile: Partial<Profile> = {
  accountType: 'individual',
  displayName: 'John Doe',
  location: 'Miami, FL',
  age: 28,
  bio: 'Looking for fun connections and new experiences in the lifestyle community.',
  gender: 'Male',
  orientation: 'Straight',
  relationshipStatus: 'Single',
  seeking: ['🙍‍♀️ Woman', '👫 Couple'],
  seekingRelationshipType: ['Casual NSA', 'FWB'],
  lifestyleExperience: 'Moderate',
  interests: ['Wine Tasting', 'Hiking', 'Travel'],
  kinks: ['BDSM', 'Roleplay', 'Bondage'],
  softLimits: ['Public Play'],
  hardLimits: ['Blood Play', 'Scat'],
  safetyPractices: 'Always use protection, regular testing',
  photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  membershipTier: 'basic',
  matchPreferences: {
    ageRange: [21, 40],
    genders: ['Female'],
    sexualities: ['Straight', 'Bisexual'],
    searchingFor: ['Individual', 'Couple'],
    distance: 50,
    vipOnly: false,
    verifiedOnly: true,
    experienceLevels: ['Beginner', 'Moderate'],
  },
};

// Example 2: Couple Profile Transformation
const exampleCoupleProfile: Partial<Profile> = {
  accountType: 'couple',
  displayName: 'Alex',
  displayName2: 'Sam',
  location: 'Los Angeles, CA',
  age: 32,
  age2: 29,
  bio: 'Adventurous couple looking to explore the lifestyle together and meet like-minded people.',
  gender: 'Male',
  gender2: 'Female',
  orientation: 'Straight',
  orientation2: 'Bisexual',
  relationshipStatus: 'Married',
  seeking: ['👫 Couple', '🙍‍♀️ Woman'],
  seekingRelationshipType: ['Swinging', 'Group Play'],
  lifestyleExperience: 'Advanced',
  interests: ['Dancing', 'Fine Dining', 'Boating'],
  kinks: ['Swinging', 'Group Play', 'Voyeurism'],
  softLimits: ['Age Play'],
  hardLimits: ['Scat', 'Blood Play', 'Non-Consensual'],
  safetyPractices: 'Regular testing, safe words, clear communication',
  rules: 'We always play together, no solo play without consent',
  photos: ['https://example.com/couple1.jpg', 'https://example.com/couple2.jpg'],
  membershipTier: 'vip',
  matchPreferences: {
    ageRange: [25, 45],
    genders: ['Female', 'Male'],
    sexualities: ['Bisexual', 'Pansexual'],
    searchingFor: ['Couple', 'Individual'],
    distance: 75,
    vipOnly: false,
    verifiedOnly: true,
    experienceLevels: ['Moderate', 'Advanced'],
  },
};

// Demonstrate transformation
console.log('\n=== TRANSFORMATION DEMO ===\n');

console.log('📝 Original Frontend Data (camelCase):');
console.log('- displayName:', exampleIndividualProfile.displayName);
console.log('- matchPreferences.sexualities:', exampleIndividualProfile.matchPreferences?.sexualities);
console.log('- seekingRelationshipType:', exampleIndividualProfile.seekingRelationshipType);

console.log('\n🔄 Transforming to Database Format...\n');
const dbFormat = profileToDatabase(exampleIndividualProfile);

console.log('💾 Database Format (snake_case):');
console.log('- display_name:', dbFormat.display_name);
console.log('- match_preferences.orientations:', dbFormat.match_preferences?.orientations);
console.log('- seeking_relationship_type:', dbFormat.seeking_relationship_type);

console.log('\n🔄 Transforming back to Frontend Format...\n');
const frontendFormat = profileFromDatabase(dbFormat);

console.log('📱 Frontend Format (camelCase):');
console.log('- displayName:', frontendFormat.displayName);
console.log('- matchPreferences.sexualities:', frontendFormat.matchPreferences?.sexualities);
console.log('- seekingRelationshipType:', frontendFormat.seekingRelationshipType);

console.log('\n✅ Transformation Complete!\n');

// Demonstrate couple profile transformation
console.log('=== COUPLE PROFILE TRANSFORMATION ===\n');
const dbCoupleFormat = profileToDatabase(exampleCoupleProfile);
console.log('💾 Couple Database Format:');
console.log('- display_name:', dbCoupleFormat.display_name);
console.log('- display_name2:', dbCoupleFormat.display_name2);
console.log('- age:', dbCoupleFormat.age);
console.log('- age2:', dbCoupleFormat.age2);
console.log('- gender:', dbCoupleFormat.gender);
console.log('- gender2:', dbCoupleFormat.gender2);
console.log('- orientation:', dbCoupleFormat.orientation);
console.log('- orientation2:', dbCoupleFormat.orientation2);

console.log('\n✅ All transformations working correctly!\n');

// Export for use in other files if needed
export const testProfiles = {
  individual: exampleIndividualProfile,
  couple: exampleCoupleProfile,
};
