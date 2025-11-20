-- =====================================================
-- PRIVATE CONTENT STORAGE BUCKET SETUP
-- Creates bucket and configures RLS policies for private content
-- =====================================================

-- Create the private-content bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'private-content',
    'private-content',
    false,  -- PRIVATE bucket - requires authentication
    52428800,  -- 50MB limit
    ARRAY[
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/mov',
        'video/avi',
        'video/webm',
        'audio/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,  -- Ensure it stays private
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/mov',
        'video/avi',
        'video/webm',
        'audio/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav'
    ];

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload private content to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own private content" ON storage.objects;
DROP POLICY IF EXISTS "Users can view private content with granted access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own private content" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own private content" ON storage.objects;

-- =====================================================
-- STORAGE POLICIES - PRIVATE CONTENT
-- =====================================================

-- Policy 1: Users can upload to their own folder
CREATE POLICY "Users can upload private content to their own folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'private-content' 
        AND auth.uid()::text = (storage.foldername(name))[1]
        AND auth.role() = 'authenticated'
    );

-- Policy 2: Users can view their own private content
CREATE POLICY "Users can view their own private content"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'private-content'
        AND auth.uid()::text = (storage.foldername(name))[1]
        AND auth.role() = 'authenticated'
    );

-- Policy 3: Users can view private content if they have been granted access
CREATE POLICY "Users can view private content with granted access"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'private-content'
        AND auth.role() = 'authenticated'
        AND (
            -- Owner can always view their own content
            auth.uid()::text = (storage.foldername(name))[1]
            OR
            -- User has been granted access
            EXISTS (
                SELECT 1 
                FROM public.private_photo_access 
                WHERE 
                    private_photo_access.owner_id::text = (storage.foldername(name))[1]
                    AND private_photo_access.granted_to_id = auth.uid()
                    AND private_photo_access.is_active = true
                    AND (
                        private_photo_access.expires_at IS NULL 
                        OR private_photo_access.expires_at > now()
                    )
            )
        )
    );

-- Policy 4: Users can update their own private content metadata
CREATE POLICY "Users can update their own private content"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'private-content' 
        AND auth.uid()::text = (storage.foldername(name))[1]
        AND auth.role() = 'authenticated'
    );

-- Policy 5: Users can delete their own private content
CREATE POLICY "Users can delete their own private content"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'private-content' 
        AND auth.uid()::text = (storage.foldername(name))[1]
        AND auth.role() = 'authenticated'
    );

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check if bucket exists and is configured correctly
DO $$
DECLARE
    bucket_record RECORD;
    policy_count INTEGER;
BEGIN
    -- Check bucket
    SELECT * INTO bucket_record 
    FROM storage.buckets 
    WHERE id = 'private-content';
    
    IF bucket_record.id IS NOT NULL THEN
        RAISE NOTICE '✓ Private content bucket exists';
        RAISE NOTICE '  - Bucket: private-content';
        RAISE NOTICE '  - Public: % (should be false)', bucket_record.public;
        RAISE NOTICE '  - File size limit: % MB', bucket_record.file_size_limit / 1024 / 1024;
    ELSE
        RAISE WARNING '✗ Private content bucket not found!';
    END IF;
    
    -- Check policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%private content%';
    
    RAISE NOTICE '✓ Storage policies: % configured', policy_count;
    
    IF policy_count < 5 THEN
        RAISE WARNING '⚠ Expected 5 policies, found %', policy_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Private content storage setup complete!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Update your frontend code to use signed URLs';
    RAISE NOTICE 'Use: supabase.storage.from("private-content").createSignedUrl()';
    RAISE NOTICE 'Instead of: .getPublicUrl()';
    RAISE NOTICE '';
END $$;
