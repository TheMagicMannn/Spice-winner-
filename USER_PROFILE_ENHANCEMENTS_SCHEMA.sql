-- =====================================================
-- USER PROFILE ENHANCEMENTS SCHEMA
-- Features: Private Content, Enhanced Stats Display
-- =====================================================

-- =====================================================
-- 1. PRIVATE CONTENT TABLE
-- Stores user's private photos/videos that require access grant
-- =====================================================
CREATE TABLE IF NOT EXISTS public.private_content (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type = ANY (ARRAY['photo'::text, 'video'::text])),
  storage_path text NOT NULL,
  thumbnail_path text,
  description text,
  uploaded_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT private_content_pkey PRIMARY KEY (id),
  CONSTRAINT private_content_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_private_content_owner_id ON public.private_content(owner_id);
CREATE INDEX IF NOT EXISTS idx_private_content_is_active ON public.private_content(is_active);

-- =====================================================
-- 2. ENHANCE PRIVATE_PHOTO_ACCESS TABLE
-- Add is_active column to existing table
-- =====================================================
ALTER TABLE public.private_photo_access 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Rename for clarity (optional - makes it work for all content types)
-- Note: This will create a new table if you want to rename, or just use the existing one
-- For now, we'll just add the column and keep using private_photo_access

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_private_photo_access_owner_id ON public.private_photo_access(owner_id);
CREATE INDEX IF NOT EXISTS idx_private_photo_access_granted_to_id ON public.private_photo_access(granted_to_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on private_content
ALTER TABLE public.private_content ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own private content
CREATE POLICY "Users can view own private content"
  ON public.private_content
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Users can insert their own private content
CREATE POLICY "Users can insert own private content"
  ON public.private_content
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own private content
CREATE POLICY "Users can update own private content"
  ON public.private_content
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Policy: Users can delete their own private content
CREATE POLICY "Users can delete own private content"
  ON public.private_content
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Policy: Users can view private content if they have been granted access
CREATE POLICY "Users can view private content with access"
  ON public.private_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.private_photo_access
      WHERE private_photo_access.owner_id = private_content.owner_id
        AND private_photo_access.granted_to_id = auth.uid()
        AND private_photo_access.is_active = true
        AND (private_photo_access.expires_at IS NULL OR private_photo_access.expires_at > now())
    )
  );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to grant private content access
CREATE OR REPLACE FUNCTION grant_private_content_access(
  p_owner_id uuid,
  p_granted_to_id uuid,
  p_expires_at timestamp with time zone DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access_id uuid;
BEGIN
  -- Check if the requester is the owner
  IF auth.uid() != p_owner_id THEN
    RAISE EXCEPTION 'Only the content owner can grant access';
  END IF;

  -- Check if access already exists
  SELECT id INTO v_access_id
  FROM public.private_photo_access
  WHERE owner_id = p_owner_id
    AND granted_to_id = p_granted_to_id;

  IF v_access_id IS NOT NULL THEN
    -- Update existing access
    UPDATE public.private_photo_access
    SET 
      is_active = true,
      granted_at = now(),
      expires_at = p_expires_at
    WHERE id = v_access_id;
  ELSE
    -- Insert new access
    INSERT INTO public.private_photo_access (owner_id, granted_to_id, expires_at, is_active)
    VALUES (p_owner_id, p_granted_to_id, p_expires_at, true)
    RETURNING id INTO v_access_id;
  END IF;

  RETURN v_access_id;
END;
$$;

-- Function to revoke private content access
CREATE OR REPLACE FUNCTION revoke_private_content_access(
  p_owner_id uuid,
  p_granted_to_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requester is the owner
  IF auth.uid() != p_owner_id THEN
    RAISE EXCEPTION 'Only the content owner can revoke access';
  END IF;

  UPDATE public.private_photo_access
  SET is_active = false
  WHERE owner_id = p_owner_id
    AND granted_to_id = p_granted_to_id;

  RETURN true;
END;
$$;

-- Function to check if user has access to another user's private content
CREATE OR REPLACE FUNCTION check_private_content_access(
  p_owner_id uuid,
  p_viewer_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_access boolean;
BEGIN
  -- Owner always has access to their own content
  IF p_owner_id = p_viewer_id THEN
    RETURN true;
  END IF;

  -- Check if access has been granted
  SELECT EXISTS (
    SELECT 1 FROM public.private_photo_access
    WHERE owner_id = p_owner_id
      AND granted_to_id = p_viewer_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  ) INTO v_has_access;

  RETURN v_has_access;
END;
$$;

-- Function to get users who have access to owner's private content
CREATE OR REPLACE FUNCTION get_users_with_private_access(
  p_owner_id uuid
)
RETURNS TABLE (
  user_id uuid,
  granted_at timestamp with time zone,
  expires_at timestamp with time zone,
  display_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requester is the owner
  IF auth.uid() != p_owner_id THEN
    RAISE EXCEPTION 'Only the content owner can view access list';
  END IF;

  RETURN QUERY
  SELECT 
    ppa.granted_to_id as user_id,
    ppa.granted_at,
    ppa.expires_at,
    p.display_name
  FROM public.private_photo_access ppa
  LEFT JOIN public.profiles p ON p.id = ppa.granted_to_id
  WHERE ppa.owner_id = p_owner_id
    AND ppa.is_active = true
    AND (ppa.expires_at IS NULL OR ppa.expires_at > now())
  ORDER BY ppa.granted_at DESC;
END;
$$;

-- =====================================================
-- 5. STORAGE BUCKET SETUP
-- Note: Storage buckets need to be created via Supabase Dashboard or CLI
-- Bucket name: 'private-content'
-- Policies should allow:
--   - Authenticated users to upload to their own folder
--   - Users to view content if they have access via private_photo_access table
-- =====================================================

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp on private_content
CREATE OR REPLACE FUNCTION update_private_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_private_content_timestamp
  BEFORE UPDATE ON public.private_content
  FOR EACH ROW
  EXECUTE FUNCTION update_private_content_updated_at();

-- =====================================================
-- 7. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.private_content IS 'Stores private photos and videos that require explicit access grant from owner';
COMMENT ON TABLE public.private_photo_access IS 'Tracks which users have access to view another users private content';
COMMENT ON FUNCTION grant_private_content_access IS 'Grants a user access to view private content. Only content owner can grant access.';
COMMENT ON FUNCTION revoke_private_content_access IS 'Revokes a users access to view private content. Only content owner can revoke access.';
COMMENT ON FUNCTION check_private_content_access IS 'Checks if a viewer has access to view an owners private content';
COMMENT ON FUNCTION get_users_with_private_access IS 'Returns list of users who have access to owners private content';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
