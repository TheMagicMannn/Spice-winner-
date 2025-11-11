# Event Images Storage Setup Guide

## Problem
You're getting a 400 error when trying to upload event images because the storage bucket isn't properly configured.

---

## Solution 1: SQL Script (Recommended)

### Run the SQL script:
1. Open Supabase Dashboard → **SQL Editor**
2. Copy contents of `/app/FIX_EVENT_STORAGE_BUCKET.sql`
3. Paste and click **Run**

This will:
- Create the `event-images` bucket
- Set up all required policies
- Configure file size limits and allowed types

---

## Solution 2: Manual Setup via UI (If SQL fails)

### Step 1: Create Storage Bucket
1. Go to Supabase Dashboard → **Storage** (left sidebar)
2. Click **New bucket**
3. Configure:
   - **Name**: `event-images`
   - **Public bucket**: ✅ CHECK THIS BOX
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
     - `image/gif`
4. Click **Create bucket**

### Step 2: Set Up Policies
After creating the bucket:

1. In Storage, click on the `event-images` bucket
2. Go to **Policies** tab
3. Click **New Policy**

#### Policy 1: Anyone can view images
- **Policy name**: `Anyone can view event images`
- **Allowed operation**: `SELECT`
- **Policy definition**: 
  ```sql
  bucket_id = 'event-images'
  ```

#### Policy 2: Authenticated users can upload
- **Policy name**: `Authenticated users can upload event images`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  bucket_id = 'event-images' AND auth.role() = 'authenticated'
  ```

#### Policy 3: Users can update their own images
- **Policy name**: `Users can update their own event images`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
  ```sql
  bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

#### Policy 4: Users can delete their own images
- **Policy name**: `Users can delete their own event images`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

---

## Verification

After setup, test with these queries in SQL Editor:

```sql
-- Check if bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'event-images';
```

Expected result:
```
id: event-images
name: event-images
public: true
file_size_limit: 5242880
allowed_mime_types: {image/jpeg, image/jpg, image/png, image/webp, image/gif}
```

```sql
-- Check policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%event%';
```

Expected result: 4 policies (view, upload, update, delete)

---

## Test Upload

After setup:
1. Go to your app
2. Try creating an event with an image
3. The upload should now work! ✅

---

## Troubleshooting

### Still getting 400 error?
Check:
1. **Bucket is public**: In Storage → event-images → Settings → Public bucket is checked
2. **Policies exist**: In Storage → event-images → Policies → Should see 4 policies
3. **User is authenticated**: Make sure you're logged in

### Getting permission denied?
- Verify you're logged in to the app
- Check that the JWT token is valid
- Try logging out and back in

### Images not displaying?
- Verify bucket is marked as **public**
- Check the image URL format: `https://[project].supabase.co/storage/v1/object/public/event-images/...`

---

## Summary

The storage bucket needs:
- ✅ Public access for viewing images
- ✅ Authenticated upload permissions
- ✅ User-specific update/delete permissions
- ✅ File size limits (5MB)
- ✅ Image-only file types

Once set up, event image uploads will work correctly!
