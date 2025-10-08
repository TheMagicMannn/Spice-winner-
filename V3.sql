-- Enable Row Level Security on the storage objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to all files in the 'profile-photos' bucket.
CREATE POLICY "Public read access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'profile-photos' );

-- Policy 2: Allow authenticated users to upload files into a folder named with their own user ID.
CREATE POLICY "Allow user uploads in their own folder" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update and delete their own files.
CREATE POLICY "Allow user to manage their own files" 
ON storage.objects FOR (UPDATE, DELETE) TO authenticated 
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);