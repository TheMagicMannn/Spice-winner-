-- =====================================================
-- MESSAGE ATTACHMENTS STORAGE BUCKET SETUP
-- Creates bucket and configures RLS policies
-- =====================================================

-- Create the message-attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'message-attachments',
    'message-attachments',
    false,  -- Private bucket
    52428800,  -- 50MB limit
    ARRAY[
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'audio/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'audio/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav'
    ];

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their message attachments" ON storage.objects;

-- =====================================================
-- STORAGE POLICIES - MESSAGE ATTACHMENTS
-- =====================================================

-- Policy 1: Users can upload to their own folder
CREATE POLICY "Users can upload message attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'message-attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy 2: Users can view attachments in their matched conversations
CREATE POLICY "Users can view their message attachments"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'message-attachments'
        AND (
            -- User can view their own uploads
            auth.uid()::text = (storage.foldername(name))[1]
            OR
            -- User can view if they have a matched conversation with the uploader
            EXISTS (
                SELECT 1 FROM matches 
                WHERE matches.status = 'matched'
                AND (
                    (matches.user1_id = auth.uid() AND matches.user2_id::text = (storage.foldername(name))[1])
                    OR
                    (matches.user2_id = auth.uid() AND matches.user1_id::text = (storage.foldername(name))[1])
                )
            )
        )
    );

-- Policy 3: Users can delete their own attachments
CREATE POLICY "Users can delete their message attachments"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'message-attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Verify setup
DO $$
BEGIN
    RAISE NOTICE 'Message attachments storage bucket configured successfully!';
    RAISE NOTICE 'Bucket: message-attachments (private)';
    RAISE NOTICE 'File size limit: 50MB';
    RAISE NOTICE 'Policies: Upload, View (matched users), Delete';
END $$;
