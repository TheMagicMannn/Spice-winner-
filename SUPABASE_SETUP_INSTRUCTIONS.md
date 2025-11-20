# Supabase Setup Instructions for User Profile Enhancements

## Overview
This document outlines the steps needed to set up the database schema for the new User Profile features:
1. Private Content functionality
2. Enhanced Stats display (no DB changes needed - uses existing columns)
3. User actions (Report, Block, Unmatch, Share Private Content)

## Step 1: Run the SQL Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `/app/USER_PROFILE_ENHANCEMENTS_SCHEMA.sql`
4. Copy the entire content
5. Paste it into the SQL Editor
6. Click **RUN** to execute the script

This will create:
- `private_content` table
- Enhancement to `private_photo_access` table (adds `is_active` column)
- RLS policies for security
- Helper functions for access control
- Triggers for automatic timestamp updates

## Step 2: Create Storage Bucket

### Option A: Via Supabase Dashboard (Recommended)
1. Navigate to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Set the following:
   - **Name**: `private-content`
   - **Public**: NO (keep it private)
   - **File size limit**: 50MB (or your preference)
   - **Allowed MIME types**: `image/*,video/*`
4. Click **Create bucket**

### Option B: Via SQL
```sql
-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('private-content', 'private-content', false)
ON CONFLICT (id) DO NOTHING;
```

## Step 3: Configure Storage Bucket Policies

After creating the bucket, set up the storage policies:

1. Go to **Storage** → **private-content** bucket → **Policies**
2. Add the following policies:

### Policy 1: Upload Policy
```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own private content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'private-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 2: Update Policy
```sql
-- Allow users to update their own files
CREATE POLICY "Users can update own private content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'private-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 3: Delete Policy
```sql
-- Allow users to delete their own files
CREATE POLICY "Users can delete own private content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'private-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 4: Select Policy (View with Access)
```sql
-- Allow users to view files if they have access
CREATE POLICY "Users can view private content with access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'private-content' 
  AND (
    -- Owner can always view
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Or user has been granted access
    EXISTS (
      SELECT 1 FROM public.private_photo_access
      WHERE owner_id::text = (storage.foldername(name))[1]
        AND granted_to_id = auth.uid()
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > now())
    )
  )
);
```

## Step 4: Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check if private_content table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'private_content';

-- Check if is_active column was added to private_photo_access
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'private_photo_access' 
AND column_name = 'is_active';

-- Check if helper functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'grant_private_content_access',
  'revoke_private_content_access',
  'check_private_content_access',
  'get_users_with_private_access'
);

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'private-content';
```

## Step 5: Test the Functionality

### Test Private Content Upload
```javascript
// In your application, try uploading a test file
const file = // ... your file object
await PrivateContentService.uploadPrivateContent(
  userId, 
  file, 
  'photo', 
  'Test photo'
);
```

### Test Access Grant
```javascript
// Grant access to another user
await PrivateContentService.grantAccess(
  ownerId, 
  grantedToUserId
);
```

### Test Access Check
```javascript
// Check if user has access
const hasAccess = await PrivateContentService.checkAccess(
  ownerId, 
  viewerId
);
console.log('Has access:', hasAccess);
```

## Troubleshooting

### Issue: RLS Policy Errors
**Solution**: Make sure RLS is enabled on the tables:
```sql
ALTER TABLE public.private_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_photo_access ENABLE ROW LEVEL SECURITY;
```

### Issue: Storage Upload Fails
**Solution**: Check that:
1. The bucket exists and is private
2. Storage policies are correctly set up
3. The user is authenticated

### Issue: Functions Not Found
**Solution**: Re-run the schema SQL file, specifically the functions section

### Issue: Access Denied Errors
**Solution**: Verify RLS policies and ensure the user has the correct permissions

## Notes

- The `private_photo_access` table is reused for all private content (not just photos)
- You can optionally rename it to `private_content_access` for clarity, but it's not required
- All physical stats columns already exist in the `profiles` table, so no changes needed there
- The existing `blocked_users`, `user_reports`, and `matches` tables are used for user actions

## Support

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Verify all policies are correctly set up
3. Ensure RLS is enabled on all relevant tables
4. Check browser console for any JavaScript errors
