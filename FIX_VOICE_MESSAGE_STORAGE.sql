-- FIX VOICE MESSAGE STORAGE BUCKET
-- This updates the message-attachments bucket to allow audio files

-- Update the bucket to allow audio MIME types
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'video/mp4', 
    'video/webm', 
    'video/quicktime', 
    'audio/webm', 
    'audio/mp4', 
    'audio/mpeg', 
    'audio/ogg', 
    'audio/wav',
    'audio/aac',
    'audio/aiff'
]
WHERE id = 'message-attachments';

-- Verify the update
SELECT id, name, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'message-attachments';
