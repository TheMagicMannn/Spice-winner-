// Quick test to verify the transformer fix
import { profileToDatabase } from './src/utils/transformers.ts';

const testProfile = {
  displayName: 'Test User',
  age: 30,
  location: 'New York',
  matchPreferences: {
    ageRange: [25, 45],
    genders: ['Female', 'Non-binary'],
    sexualities: ['Bisexual', 'Pansexual'],
    searchingFor: ['Individual', 'Couple'],
    distance: 75,
    vipOnly: false,
    verifiedOnly: true,
    experienceLevels: ['Moderate', 'Advanced']
  }
};

console.log('\n=== Testing profileToDatabase transformer ===\n');
console.log('Input (Frontend camelCase):');
console.log(JSON.stringify(testProfile, null, 2));

const result = profileToDatabase(testProfile);

console.log('\n\nOutput (Database format):');
console.log(JSON.stringify(result, null, 2));

console.log('\n\n=== Verification ===');
console.log('✓ Top-level keys are snake_case:', Object.keys(result).includes('display_name'));
console.log('✓ match_preferences exists:', !!result.match_preferences);
console.log('✓ match_preferences contains ageRange (camelCase):', 
  result.match_preferences && 'ageRange' in result.match_preferences);
console.log('✗ match_preferences contains age_range (snake_case):', 
  result.match_preferences && 'age_range' in result.match_preferences);

if (result.match_preferences && 'ageRange' in result.match_preferences) {
  console.log('\n✅ PASS: JSONB keys are correctly preserved in camelCase!');
} else {
  console.log('\n❌ FAIL: JSONB keys were incorrectly converted to snake_case!');
}
