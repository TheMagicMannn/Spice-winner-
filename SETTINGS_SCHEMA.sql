-- =====================================================
-- SPICE Dating App - Settings & User Management Schema
-- =====================================================
-- This file contains all database tables, RLS policies,
-- triggers, and storage configurations needed for the
-- Settings functionality in the SPICE app.
-- =====================================================

-- =====================================================
-- TABLE: user_settings
-- Stores user preferences for notifications, privacy, etc.
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  notifications_messages BOOLEAN DEFAULT true,
  notifications_priority_messages BOOLEAN DEFAULT true,
  notifications_likes BOOLEAN DEFAULT true,
  notifications_new_matches BOOLEAN DEFAULT true,
  notifications_email BOOLEAN DEFAULT true,
  notifications_activity BOOLEAN DEFAULT true,
  
  -- Privacy Settings
  hide_account BOOLEAN DEFAULT false,
  incognito_mode BOOLEAN DEFAULT false,
  touch_face_id_protection BOOLEAN DEFAULT false, -- Coming soon feature
  show_distance BOOLEAN DEFAULT true,
  activity_visibility BOOLEAN DEFAULT true,
  
  -- Other Settings
  location_distance VARCHAR(20) DEFAULT 'Distance', -- 'Distance' or unit preference
  measurement_system VARCHAR(10) DEFAULT 'MI', -- 'MI' (miles) or 'KM' (kilometers)
  app_icon_preference VARCHAR(50) DEFAULT 'default',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_id ON user_settings(id);

-- =====================================================
-- TABLE: blocked_users
-- Stores which users have blocked which other users
-- =====================================================
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can't block the same person twice
  UNIQUE(blocker_id, blocked_id),
  
  -- Ensure a user can't block themselves
  CHECK (blocker_id != blocked_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- =====================================================
-- TABLE: private_photo_access
-- Manages who can see a user's private photos
-- =====================================================
CREATE TABLE IF NOT EXISTS private_photo_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_to_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL means no expiration
  
  -- Ensure unique access grants
  UNIQUE(owner_id, granted_to_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_private_photo_access_owner ON private_photo_access(owner_id);
CREATE INDEX IF NOT EXISTS idx_private_photo_access_granted ON private_photo_access(granted_to_id);

-- =====================================================
-- TABLE: account_deletion_requests
-- Track account deletion requests (soft delete with grace period)
-- =====================================================
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_deletion_at TIMESTAMPTZ NOT NULL, -- 30 days from request
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'cancelled', 'completed'
  
  UNIQUE(user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_account_deletion_user ON account_deletion_requests(user_id);

-- =====================================================
-- TABLE: password_change_history
-- Track password changes for security audit
-- =====================================================
CREATE TABLE IF NOT EXISTS password_change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_password_change_user ON password_change_history(user_id);

-- =====================================================
-- RLS POLICIES: user_settings
-- =====================================================

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own settings
CREATE POLICY user_settings_select_own 
  ON user_settings 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Users can insert their own settings
CREATE POLICY user_settings_insert_own 
  ON user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own settings
CREATE POLICY user_settings_update_own 
  ON user_settings 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own settings (rarely needed)
CREATE POLICY user_settings_delete_own 
  ON user_settings 
  FOR DELETE 
  USING (auth.uid() = id);

-- =====================================================
-- RLS POLICIES: blocked_users
-- =====================================================

-- Enable RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own blocked list
CREATE POLICY blocked_users_select_own 
  ON blocked_users 
  FOR SELECT 
  USING (auth.uid() = blocker_id);

-- Policy: Users can block other users
CREATE POLICY blocked_users_insert_own 
  ON blocked_users 
  FOR INSERT 
  WITH CHECK (auth.uid() = blocker_id);

-- Policy: Users can unblock users they blocked
CREATE POLICY blocked_users_delete_own 
  ON blocked_users 
  FOR DELETE 
  USING (auth.uid() = blocker_id);

-- =====================================================
-- RLS POLICIES: private_photo_access
-- =====================================================

-- Enable RLS
ALTER TABLE private_photo_access ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view their granted access list
CREATE POLICY private_photo_access_select_owner 
  ON private_photo_access 
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- Policy: Users can see who granted them access
CREATE POLICY private_photo_access_select_granted 
  ON private_photo_access 
  FOR SELECT 
  USING (auth.uid() = granted_to_id);

-- Policy: Owners can grant access
CREATE POLICY private_photo_access_insert_owner 
  ON private_photo_access 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Owners can revoke access
CREATE POLICY private_photo_access_delete_owner 
  ON private_photo_access 
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- =====================================================
-- RLS POLICIES: account_deletion_requests
-- =====================================================

-- Enable RLS
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own deletion requests
CREATE POLICY account_deletion_select_own 
  ON account_deletion_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can create deletion requests
CREATE POLICY account_deletion_insert_own 
  ON account_deletion_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can cancel their deletion requests
CREATE POLICY account_deletion_update_own 
  ON account_deletion_requests 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: password_change_history
-- =====================================================

-- Enable RLS
ALTER TABLE password_change_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own password change history
CREATE POLICY password_change_history_select_own 
  ON password_change_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: System can insert password change records (via service role)
CREATE POLICY password_change_history_insert_system 
  ON password_change_history 
  FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- TRIGGERS: Auto-update timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Initialize user settings on signup
-- =====================================================
CREATE OR REPLACE FUNCTION initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create settings when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_settings();

-- =====================================================
-- FUNCTION: Get blocked user IDs for a user
-- =====================================================
CREATE OR REPLACE FUNCTION get_blocked_user_ids(user_id UUID)
RETURNS TABLE (blocked_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT bu.blocked_id
  FROM blocked_users bu
  WHERE bu.blocker_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Check if user A has blocked user B
-- =====================================================
CREATE OR REPLACE FUNCTION is_user_blocked(blocker UUID, blocked UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE blocker_id = blocker AND blocked_id = blocked
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STORAGE BUCKET: private-photos
-- For private photos that require explicit access
-- =====================================================
-- This should be created in Supabase Storage UI or via SQL
-- if using Supabase CLI:
-- 
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('private-photos', 'private-photos', false);

-- =====================================================
-- STORAGE POLICIES: private-photos bucket
-- =====================================================

-- Policy: Users can upload their own private photos
-- CREATE POLICY "Users can upload private photos"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'private-photos' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can view their own private photos
-- CREATE POLICY "Users can view own private photos"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'private-photos' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can view private photos they have access to
-- CREATE POLICY "Users can view granted private photos"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'private-photos' AND
--   EXISTS (
--     SELECT 1 FROM private_photo_access
--     WHERE owner_id::text = (storage.foldername(name))[1]
--     AND granted_to_id = auth.uid()
--     AND (expires_at IS NULL OR expires_at > NOW())
--   )
-- );

-- Policy: Users can delete their own private photos
-- CREATE POLICY "Users can delete own private photos"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'private-photos' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- =====================================================
-- ADDITIONAL PROFILE TABLE UPDATES
-- Add columns to profiles table if they don't exist
-- =====================================================

-- Add associated_accounts column for linking social accounts
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS associated_accounts JSONB DEFAULT '[]'::jsonb;

-- Add privacy preferences
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS privacy_mode VARCHAR(20) DEFAULT 'public'; -- 'public', 'hidden', 'incognito'

-- Add last password change timestamp
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ;

-- =====================================================
-- INDEXES for better query performance
-- =====================================================

-- Index for searching non-hidden profiles
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_mode ON profiles(privacy_mode) WHERE privacy_mode != 'hidden';

-- Index for active, non-incognito profiles
CREATE INDEX IF NOT EXISTS idx_profiles_active_visible ON profiles(is_active, privacy_mode) 
  WHERE is_active = true AND privacy_mode = 'public';

-- =====================================================
-- FUNCTION: Soft delete user account
-- This function handles the complete deletion process
-- =====================================================
CREATE OR REPLACE FUNCTION schedule_account_deletion(
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
  v_deletion_date TIMESTAMPTZ;
BEGIN
  -- Set deletion date to 30 days from now
  v_deletion_date := NOW() + INTERVAL '30 days';
  
  -- Create or update deletion request
  INSERT INTO account_deletion_requests (user_id, scheduled_deletion_at, reason, status)
  VALUES (p_user_id, v_deletion_date, p_reason, 'pending')
  ON CONFLICT (user_id) 
  DO UPDATE SET
    scheduled_deletion_at = v_deletion_date,
    reason = p_reason,
    status = 'pending',
    requested_at = NOW()
  RETURNING id INTO v_request_id;
  
  -- Hide the profile immediately
  UPDATE profiles
  SET 
    privacy_mode = 'hidden',
    is_active = false,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Cancel account deletion
-- =====================================================
CREATE OR REPLACE FUNCTION cancel_account_deletion(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update deletion request status
  UPDATE account_deletion_requests
  SET status = 'cancelled'
  WHERE user_id = p_user_id AND status = 'pending';
  
  -- Restore profile visibility
  UPDATE profiles
  SET 
    privacy_mode = 'public',
    is_active = true,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Execute account deletion (called by scheduled job)
-- This would typically be run by a cron job or edge function
-- =====================================================
CREATE OR REPLACE FUNCTION execute_account_deletion(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Mark deletion as completed
  UPDATE account_deletion_requests
  SET status = 'completed'
  WHERE user_id = p_user_id;
  
  -- Delete all user data
  -- Note: Cascade deletes will handle related records
  DELETE FROM auth.users WHERE id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPFUL QUERIES FOR DEBUGGING
-- =====================================================

-- View all user settings
-- SELECT * FROM user_settings WHERE id = 'user-uuid-here';

-- View blocked users for a specific user
-- SELECT p.display_name, p.photos[1] as avatar, bu.created_at
-- FROM blocked_users bu
-- JOIN profiles p ON p.id = bu.blocked_id
-- WHERE bu.blocker_id = 'user-uuid-here'
-- ORDER BY bu.created_at DESC;

-- View private photo access grants
-- SELECT p.display_name, ppa.granted_at, ppa.expires_at
-- FROM private_photo_access ppa
-- JOIN profiles p ON p.id = ppa.granted_to_id
-- WHERE ppa.owner_id = 'user-uuid-here'
-- ORDER BY ppa.granted_at DESC;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- After running this schema:
-- 1. Verify all tables are created
-- 2. Test RLS policies with different users
-- 3. Create storage bucket 'private-photos' in Supabase UI
-- 4. Apply storage policies (uncomment and run above)
-- 5. Set up cron job for executing scheduled deletions
-- =====================================================
