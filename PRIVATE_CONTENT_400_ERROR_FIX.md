# Private Content 400 Error - Complete Fix Guide

## Problem Summary
You're getting a **400 error** when accessing videos from the `private-content` bucket because:
- The bucket is **private** (correct for security)
- The code was using **public URLs** which don't work with private buckets
- Private buckets require **signed URLs** with authentication

## Root Cause
```
Error URL: /storage/v1/object/public/private-content/...
                                   ^^^^^^
                                   This tries public access!
```

The word "public" in the URL indicates it's trying to access files publicly, but the `private-content` bucket is correctly configured as **private**.

---

## Solution Applied

### ✅ Code Changes (Already Done)

I've updated the following files to use **signed URLs** instead of public URLs:

1. **`/app/src/services/privateContentService.ts`**
   - Changed `getPrivateContentUrl()` to use `createSignedUrl()` 
   - Made it async to handle promise
   - Added `getPrivateContentUrls()` for batch URL generation
   - Signed URLs expire after 1 hour (3600 seconds)

2. **`/app/src/components/EditProfileModal.tsx`**
   - Added state to store signed URLs
   - Updated to load signed URLs when content is loaded
   - Updated thumbnails to use signed URLs

3. **`/app/src/pages/UserProfile.tsx`**
   - Added state to store signed URLs  
   - Updated to load signed URLs when content is loaded
   - Updated image/video display to use signed URLs
   - Added proper video player support

---

## Database Setup Required

### Step 1: Run SQL Script in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open a new query
3. Copy and paste the contents of `/app/FIX_PRIVATE_CONTENT_STORAGE_BUCKET.sql`
4. Click **Run**

This script will:
- ✅ Create/update the `private-content` bucket as **private**
- ✅ Set file size limit to 50MB
- ✅ Configure allowed MIME types (images and videos)
- ✅ Set up 5 RLS policies:
  1. Users can upload to their own folder
  2. Users can view their own content
  3. Users can view content if granted access
  4. Users can update their own content
  5. Users can delete their own content

### Step 2: Verify Setup

After running the SQL script, verify in the SQL Editor:

```sql
-- Check bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'private-content';
```

**Expected result:**
- `public`: `false` ✅
- `file_size_limit`: `52428800` (50MB)

```sql
-- Check policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%private content%';
```

**Expected result:** 5 policies listed

---

## How It Works Now

### Before (Broken ❌)
```typescript
// Tried to use public URLs for private bucket
static getPrivateContentUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from('private-content')
    .getPublicUrl(storagePath);  // ❌ Doesn't work for private buckets
  
  return data.publicUrl;
}
```

### After (Fixed ✅)
```typescript
// Uses signed URLs with authentication
static async getPrivateContentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('private-content')
    .createSignedUrl(storagePath, 3600);  // ✅ Generates authenticated URL
  
  if (error) throw error;
  return data.signedUrl;
}
```

### Signed URL Benefits
- ✅ **Secure**: Requires authentication to generate
- ✅ **Time-limited**: Expires after 1 hour (configurable)
- ✅ **Access-controlled**: Only users with permission can generate URLs
- ✅ **Works with private buckets**: Designed for this use case

---

## Testing the Fix

### 1. Test Upload
1. Log in to your app
2. Go to Profile → Edit Profile → Private Content tab
3. Try uploading a photo or video
4. **Expected**: Upload succeeds

### 2. Test Viewing Own Content
1. Stay on the Private Content tab
2. **Expected**: You see thumbnails of your uploaded content
3. Check browser console - no 400 errors

### 3. Test Viewing Others' Content
1. Grant access to another user (from profile menu)
2. Have that user view your profile
3. They should see your private content
4. Check their browser console - no 400 errors

### 4. Test Video Playback
1. Upload a .mov, .mp4, or other video
2. View the video in the profile
3. **Expected**: Video loads and plays correctly

---

## Troubleshooting

### Still getting 400 errors?

**Check 1: Is the bucket private?**
```sql
SELECT public FROM storage.buckets WHERE id = 'private-content';
-- Should return: false
```

**Check 2: Are policies in place?**
```sql
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%private content%';
-- Should return: 5
```

**Check 3: Is user authenticated?**
- Make sure you're logged in
- Check JWT token is valid
- Try logging out and back in

**Check 4: Are signed URLs being generated?**
- Open browser DevTools → Console
- Look for errors related to `createSignedUrl`
- Check Network tab for the actual URLs being used

### URLs expire after 1 hour

This is expected behavior. Signed URLs are temporary for security. The app will automatically generate new ones when needed (on page load or when viewing content).

If you need longer expiration:
```typescript
// In privateContentService.ts, change 3600 to desired seconds
.createSignedUrl(storagePath, 7200); // 2 hours
```

### Error: "policy violation" when generating signed URLs

This means the RLS policies aren't correctly set. Re-run the SQL script.

---

## Summary of Changes

| File | Change |
|------|--------|
| `privateContentService.ts` | ✅ Switch from `getPublicUrl()` to `createSignedUrl()` |
| `EditProfileModal.tsx` | ✅ Add signed URL state and loading |
| `UserProfile.tsx` | ✅ Add signed URL state and loading |
| Storage Bucket | ✅ Configure as private with proper RLS policies |

---

## Security Notes

✅ **Private bucket** - Content not publicly accessible
✅ **Signed URLs** - Temporary, authenticated access only  
✅ **RLS policies** - Database-level access control
✅ **Access grants** - Explicit permission system via `private_photo_access` table

Your private content is now properly secured! 🔒
