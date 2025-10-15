# 🔧 Troubleshooting Guide

## Common Errors and Solutions

### ❌ Error: "The string did not match the expected pattern" (Login/Signup)

**Problem:** Authentication is failing with a pattern mismatch error.

**Root Cause:** The frontend was trying to use API routes that returned data in an incompatible format.

**Solution:** ✅ **FIXED** - Now using direct Supabase client authentication

The app now uses `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()` directly instead of going through API routes.

**If you still see this error:**
1. Check `/app/src/config.ts` has valid Supabase URL and anon key
2. Verify Supabase project is active
3. Check browser console for detailed error messages

---

### ❌ Error: "auth missing" (Reset Password)

**Problem:** Password reset fails with "auth missing" error.

**Root Cause:** User is trying to reset password without an active session from the email link.

**Solution:** ✅ **FIXED** - Added session validation before password update

```typescript
const updateUserPassword = async (password: string) => {
  // Now checks if user has active session from reset link
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session. Please use the password reset link from your email.');
  }
  // ... update password
};
```

**If you still see this error:**
1. Make sure you clicked the reset link from your email
2. The link should redirect you to `#/reset-password` with auth tokens
3. Try requesting a new reset link
4. Check if the link expired (links expire after 1 hour)

---

## Common Errors and Solutions

### ❌ Error: "Could not find the 'user_id' column of 'profiles' in the schema cache"

**Problem:** The code is trying to reference a `user_id` column in the profiles table, but the schema uses `id` instead.

**Explanation:** 
- The `profiles` table uses `id` as the primary key (which references `auth.users(id)`)
- There is NO separate `user_id` column
- The user's ID is stored directly in the `id` column

**Solution:**

✅ **Correct Usage:**
```typescript
// ✅ CORRECT - Use 'id' column
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// ✅ CORRECT - Insert/Update uses 'id'
await supabase
  .from('profiles')
  .upsert({
    id: user.id,  // ← Use 'id', not 'user_id'
    display_name: 'John',
    // ... other fields
  });
```

❌ **Incorrect Usage:**
```typescript
// ❌ WRONG - Don't use 'user_id'
await supabase
  .from('profiles')
  .upsert({
    user_id: user.id,  // ← This column doesn't exist!
    display_name: 'John',
  });
```

**Schema Reference:**
```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,  -- ← This IS the user ID
    display_name TEXT,
    -- ... other fields
);
```

---

### ❌ Error: "new row violates row-level security policy"

**Problem:** RLS policies are preventing the operation.

**Common Causes:**
1. User is not authenticated
2. User is trying to access/modify someone else's data
3. Required conditions not met (e.g., profile not completed)

**Solution:**

✅ **Check Authentication:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  console.error('User not authenticated');
  // Handle authentication error
}
```

✅ **Check Authorization:**
- Users can only modify their own profile where `auth.uid() = id`
- Ensure you're using the correct user ID
- Check RLS policies in Supabase Dashboard → Authentication → Policies

✅ **For Profile Creation:**
```typescript
// Make sure the ID matches the authenticated user
await supabase
  .from('profiles')
  .upsert({
    id: user.id,  // Must match authenticated user
    // ... other fields
  });
```

---

### ❌ Error: "null value in column 'display_name' violates not-null constraint"

**Problem:** Required fields are missing.

**Required Fields:**
- For **Individual profiles:**
  - `display_name`
  - `location`
  - `age` (≥ 18)
  - `gender`
  - `orientation`

- For **Couple profiles:**
  - All individual fields PLUS:
  - `display_name2`
  - `age2` (≥ 18)
  - `gender2`
  - `orientation2`

**Solution:**

✅ **Use Validation Before Saving:**
```typescript
import { validateProfileForDatabase } from './utils/transformers';

const dbData = profileToDatabase(profileData);
const validation = validateProfileForDatabase(dbData);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  // Show errors to user
  return;
}

// Proceed with save
await supabase.from('profiles').upsert(dbData);
```

---

### ❌ Error: "relation 'profiles' does not exist"

**Problem:** Database schema hasn't been set up.

**Solution:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `/SUPABASE_COMPLETE_SETUP.sql`
3. Paste and run the script
4. Wait for completion message
5. Verify tables exist in Table Editor

---

### ❌ Error: Photo upload fails with "storage object not found"

**Problem:** Storage bucket doesn't exist or policies are incorrect.

**Solution:**

✅ **Verify Bucket Exists:**
1. Go to Supabase Dashboard → Storage
2. Check `profile-photos` bucket exists
3. Verify it's marked as "public"

✅ **Check File Path Format:**
```typescript
// ✅ CORRECT format: {user_id}/{filename}
const filePath = `${user.id}/${Date.now()}_${file.name}`;

await supabase.storage
  .from('profile-photos')
  .upload(filePath, file);

// ❌ WRONG - Missing user folder
const filePath = `${file.name}`;  // Will fail RLS check
```

✅ **Verify RLS Policies:**
Run this SQL if policies are missing:
```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload profile photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

---

### ❌ Error: "Invalid input syntax for type jsonb"

**Problem:** `match_preferences` field has incorrect format.

**Solution:**

✅ **Use Correct JSONB Structure:**
```typescript
const matchPreferences = {
  ageRange: [21, 40],
  genders: ['Female'],
  orientations: ['Straight', 'Bisexual'],  // ← Note: 'orientations' not 'sexualities'
  searchingFor: ['Individual', 'Couple'],
  distance: 50,
  vipOnly: false,
  verifiedOnly: true,
  experienceLevels: ['Beginner', 'Moderate']
};
```

**Note:** The transformation layer automatically converts `sexualities` → `orientations` when saving to database.

---

### ❌ Error: Transformation not working / Data saving as camelCase

**Problem:** The transformation layer isn't being used.

**Solution:**

✅ **Always use `useProfile` hook:**
```typescript
// ✅ CORRECT - Uses transformation
import { useProfile } from '../hooks/useProfile';

const { completeProfileSetup } = useProfile();
await completeProfileSetup(profileData);  // Automatically transforms
```

❌ **Don't call Supabase directly:**
```typescript
// ❌ WRONG - Bypasses transformation
await supabase.from('profiles').upsert(profileData);
```

---

### ⚠️ Warning: "Bio must be between 69-1000 characters"

**Problem:** Bio length validation.

**Solution:**

✅ **Validate Before Submission:**
```typescript
const bioLength = String(formData.bio || '').length;

if (bioLength < 69) {
  setError('Bio must be at least 69 characters');
  return;
}

if (bioLength > 1000) {
  setError('Bio must not exceed 1000 characters');
  return;
}
```

---

## 🔍 Debugging Tips

### 1. Check Browser Console
Look for transformation logs:
```
🔄 Transforming profile data for database...
✅ Profile data validation passed
📤 Sending to database: [object]
✅ Profile saved successfully to database
```

### 2. Check Supabase Logs
Dashboard → Logs → API

Look for:
- Authentication errors (401)
- Permission errors (403)
- Schema errors (400)

### 3. Verify Data Format
Before saving, log the transformed data:
```typescript
const dbData = profileToDatabase(profileData);
console.log('Data being sent to DB:', JSON.stringify(dbData, null, 2));
```

### 4. Test RLS Policies
Use Supabase SQL Editor to test:
```sql
-- Test as specific user
SET request.jwt.claims.sub = 'user-uuid-here';

-- Try to select
SELECT * FROM profiles WHERE id = 'user-uuid-here';

-- Try to update
UPDATE profiles SET display_name = 'Test' WHERE id = 'user-uuid-here';
```

---

## 📚 Reference Documents

- **Schema Setup:** `/SUPABASE_COMPLETE_SETUP.sql`
- **Transformation Guide:** `/SCHEMA_FIX_DOCUMENTATION.md`
- **Quick Reference:** `/SCHEMA_FIX_SUMMARY.md`
- **Architecture:** `/SYSTEM_ARCHITECTURE.md`

---

## 🆘 Still Having Issues?

1. ✅ Check all required fields are filled
2. ✅ Verify user is authenticated
3. ✅ Check transformation is being used
4. ✅ Review Supabase logs
5. ✅ Test with minimal data first
6. ✅ Check database schema is deployed

If problem persists, review the complete documentation or check Supabase status page.
