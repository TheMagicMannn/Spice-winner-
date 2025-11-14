// Quick test to verify the transformer works correctly
// You can run this in browser console to test

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function keysToCamelCase(obj, isJsonField = false) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamelCase(item, isJsonField));
  }
  if (typeof obj !== 'object') return obj;

  const result = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (isJsonField) {
        result[key] = keysToCamelCase(obj[key], true);
      } else {
        const camelKey = toCamelCase(key);
        const isNextJsonField = (key === 'match_preferences');
        
        if (isNextJsonField) {
          result[camelKey] = obj[key];
        } else {
          result[camelKey] = keysToCamelCase(obj[key], false);
        }
      }
    }
  }
  
  return result;
}

// Test with a sample profile
const dbProfile = {
  id: '123',
  display_name: 'John',
  profile_completed: true,
  is_active: true,
  created_at: '2024-01-01'
};

console.log('Input (snake_case):', dbProfile);
const transformed = keysToCamelCase(dbProfile);
console.log('Output (camelCase):', transformed);
console.log('profileCompleted:', transformed.profileCompleted);
console.log('Type of profileCompleted:', typeof transformed.profileCompleted);

// Expected output:
// profileCompleted: true
// Type: boolean
