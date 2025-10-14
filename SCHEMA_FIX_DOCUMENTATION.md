# Supabase Schema Fix Documentation

## Problem Summary

The application had a schema mismatch between the frontend TypeScript code and the Supabase database:

### Issues Fixed:

1. **Case Mismatch**: Frontend used camelCase (`displayName`, `matchPreferences`) while Supabase expected snake_case (`display_name`, `match_preferences`)

2. **Field Name Inconsistency**: 
   - Frontend: `matchPreferences.sexualities`
   - Database: `match_preferences.orientations`

3. **No Transformation Layer**: Data was being sent directly to Supabase without proper field name conversion

## Solution Implemented

### 1. Created Transformation Utilities (`/src/utils/transformers.ts`)

**Key Functions:**
- `profileToDatabase(profile)` - Converts camelCase frontend data to snake_case database format
- `profileFromDatabase(dbProfile)` - Converts snake_case database data to camelCase frontend format
- `validateProfileForDatabase(profile)` - Validates required fields before database insertion

**Special Handling:**
- Automatically converts all camelCase keys to snake_case
- Maps `matchPreferences.sexualities` → `match_preferences.orientations`
- Maps `matchPreferences.orientations` → `matchPreferences.sexualities` (when reading from DB)

### 2. Updated `types.ts`

- Added comprehensive documentation explaining the transformation
- Clarified that frontend uses camelCase throughout
- Added additional database-related fields (`userId`, `createdAt`, `isVerified`, etc.)

### 3. Updated `useProfile.ts` Hook

**New Features:**
- `completeProfileSetup()` now transforms data before saving to Supabase
- Added validation before database insert
- Added detailed console logging for debugging
- Sets `profile_completed: true` flag when saving
- New `getProfile()` function that transforms data when fetching from DB

**Validation Includes:**
- Required fields: `display_name`, `location`, `age`, `gender`, `orientation`
- Couple-specific fields: `display_name2`, `gender2`, `orientation2`, `age2`
- Age validation (must be ≥ 18)

### 4. ProfileSetup.tsx - No Changes Needed!

The component already uses camelCase throughout, which is perfect. The transformation happens transparently in the hook layer.

## Database Schema Reference

### Profiles Table (snake_case)

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    account_type TEXT,
    membership_tier TEXT DEFAULT 'basic',
    
    -- Core fields
    display_name TEXT,
    display_name2 TEXT,
    location TEXT,
    age INTEGER,
    age2 INTEGER,
    bio TEXT,
    photos TEXT[],
    
    -- Identity
    gender TEXT,
    gender2 TEXT,
    orientation TEXT,
    orientation2 TEXT,
    
    -- Relationship
    relationship_status TEXT,
    seeking TEXT[],
    seeking_relationship_type TEXT[],
    lifestyle_experience TEXT,
    
    -- Interests/Kinks
    interests TEXT[],
    kinks TEXT[],
    soft_limits TEXT[],
    hard_limits TEXT[],
    
    -- Safety
    safety_practices TEXT,
    rules TEXT,
    
    -- Preferences (JSONB)
    match_preferences JSONB DEFAULT '{
        "ageRange": [18, 65],
        "genders": [],
        "orientations": [],
        "searchingFor": [],
        "distance": 50,
        "vipOnly": false,
        "verifiedOnly": false,
        "experienceLevels": []
    }'::jsonb,
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Field Mapping Reference

| Frontend (camelCase) | Database (snake_case) | Notes |
|---------------------|----------------------|-------|
| `displayName` | `display_name` | Auto-converted |
| `displayName2` | `display_name2` | Auto-converted |
| `matchPreferences` | `match_preferences` | Auto-converted |
| `matchPreferences.sexualities` | `match_preferences.orientations` | **Special mapping** |
| `seekingRelationshipType` | `seeking_relationship_type` | Auto-converted |
| `lifestyleExperience` | `lifestyle_experience` | Auto-converted |
| `softLimits` | `soft_limits` | Auto-converted |
| `hardLimits` | `hard_limits` | Auto-converted |
| `safetyPractices` | `safety_practices` | Auto-converted |
| `membershipTier` | `membership_tier` | Auto-converted |
| `userId` | `user_id` | Auto-converted |
| `createdAt` | `created_at` | Auto-converted |
| `updatedAt` | `updated_at` | Auto-converted |
| `isVerified` | `is_verified` | Auto-converted |
| `isActive` | `is_active` | Auto-converted |
| `profileCompleted` | `profile_completed` | Auto-converted |
| `lastActiveAt` | `last_active_at` | Auto-converted |

## Testing the Fix

### Manual Test:
1. Complete the profile setup form
2. Check browser console for transformation logs:
   - `🔄 Transforming profile data for database...`
   - `✅ Profile data validation passed`
   - `📤 Sending to database: [object]`
   - `✅ Profile saved successfully to database`

### Verify in Supabase:
1. Go to Supabase Dashboard → Table Editor → profiles
2. Check that data is saved in snake_case format
3. Verify `match_preferences` JSONB contains `orientations` field

### Fetch Test:
```typescript
const { data, error } = await useProfile().getProfile(userId);
// Data will be in camelCase format
console.log(data.matchPreferences.sexualities); // ✅ Works
```

## Error Handling

The transformation includes validation that will catch:
- Missing required fields
- Invalid age values (< 18)
- Couple accounts missing partner information
- Type mismatches

Errors are logged with clear messages and returned in the format:
```typescript
{ error: "Validation failed: display_name is required, age must be 18 or greater" }
```

## Future Considerations

1. **Type Safety**: Consider adding Zod or similar validation library for runtime type checking
2. **Database Types**: Generate TypeScript types from Supabase schema using their CLI
3. **Migration**: If changing schema, update both database and transformer functions
4. **Performance**: The recursive transformation is fast for profile data, but consider caching for frequently accessed profiles

## Files Changed

- ✅ `/src/utils/transformers.ts` - **NEW** - Transformation utilities
- ✅ `/src/types.ts` - Updated with better documentation
- ✅ `/src/hooks/useProfile.ts` - Added transformation and validation
- ✅ `/src/pages/ProfileSetup.tsx` - No changes needed (already correct!)

## Conclusion

The schema mismatch is now fixed with a clean, maintainable transformation layer. The frontend can continue using idiomatic JavaScript camelCase, while the database uses SQL-standard snake_case. All transformations happen automatically and transparently.
