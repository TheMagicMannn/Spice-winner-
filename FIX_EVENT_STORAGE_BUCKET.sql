-- =====================================================
-- FIX EVENT IMAGES STORAGE BUCKET
-- =====================================================
-- This script sets up the storage bucket for event images
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Create storage bucket for event images
-- =====================================================

-- Insert bucket (will skip if already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'event-images', 
    'event-images', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- =====================================================
-- STEP 2: Drop existing storage policies
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;

-- =====================================================
-- STEP 3: Create storage policies for event images
-- =====================================================

-- Policy 1: Anyone can view/download event images (SELECT)
CREATE POLICY "Anyone can view event images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-images');

-- Policy 2: Authenticated users can upload event images (INSERT)
CREATE POLICY "Authenticated users can upload event images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'event-images' AND
        auth.role() = 'authenticated'
    );

-- Policy 3: Users can update their own event images (UPDATE)
CREATE POLICY "Users can update their own event images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'event-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'event-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy 4: Users can delete their own event images (DELETE)
CREATE POLICY "Users can delete their own event images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'event-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup:

-- Check if bucket exists
-- SELECT id, name, public, file_size_limit, allowed_mime_types 
-- FROM storage.buckets 
-- WHERE id = 'event-images';

-- Check storage policies
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects'
-- AND policyname LIKE '%event%';

-- =====================================================
-- STORAGE BUCKET SETUP COMPLETE!
-- =====================================================
-- The event-images bucket is now configured with:
-- - Public read access (anyone can view images)
-- - Authenticated upload (logged-in users can upload)
-- - User-specific update/delete (users can manage their own images)
-- - 5MB file size limit
-- - Image file types only (jpeg, jpg, png, webp, gif)
-- =====================================================
