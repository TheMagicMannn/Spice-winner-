# Profile Setup Redirection Fix

## Problem
Users were being redirected to the profile setup page every time they logged in, even after completing their profile setup. This was happening because the profile data fetched from Supabase was not being properly transformed from database format (snake_case) to frontend format (camelCase).

## Root Cause
In `/app/src/hooks/useAuth.tsx`, when fetching the user's profile from the database after login, the profile data was being used directly without transformation:

```typescript
// ❌ BEFORE (Incorrect)
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .maybeSingle();

setUser({ ...session.user, profile: profile as Profile });
```

The database stores fields in snake_case format:
- `display_name`
- `profile_completed`
- `relationship_status`
- etc.

But the frontend expects camelCase format:
- `displayName`
- `profileCompleted`
- `relationshipStatus`
- etc.

When `isProfileComplete()` in `/app/src/App.tsx` checked for required fields like `profile.displayName`, it couldn't find them (because the actual field was `profile.display_name`), causing the validation to fail and redirecting users back to profile setup.

## Solution
Updated `/app/src/hooks/useAuth.tsx` to use the `profileFromDatabase()` transformer function when fetching profile data:

```typescript
// ✅ AFTER (Correct)
import { profileFromDatabase } from '../utils/transformers';

const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .maybeSingle();

// Transform database snake_case to frontend camelCase
const transformedProfile = profile ? profileFromDatabase(profile) : null;
setUser({ ...session.user, profile: transformedProfile });
```

## Files Modified
1. `/app/src/hooks/useAuth.tsx` - Added import and transformation logic

## Testing
After this fix:
1. Users complete profile setup → profile is saved with `profile_completed: true` in database
2. Users log out
3. Users log back in → profile data is fetched and transformed to camelCase
4. `isProfileComplete()` validation passes → users are directed to dashboard
5. Only first-time users (with incomplete profiles) are directed to profile setup

## Technical Details
The transformation is handled by `/app/src/utils/transformers.ts` which provides:
- `profileToDatabase()` - Converts camelCase to snake_case for saving
- `profileFromDatabase()` - Converts snake_case to camelCase for reading
- Handles special cases like `matchPreferences.sexualities` ↔ `match_preferences.orientations`
