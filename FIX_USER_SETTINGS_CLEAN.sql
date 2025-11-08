-- =====================================================
-- CLEAN FIX: User Settings Schema (Handles Existing Objects)
-- =====================================================
-- This script safely handles existing tables and policies
-- Run this if you get "already exists" errors
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Drop existing policies (if any)
-- =====================================================
DROP POLICY IF EXISTS user_settings_select_own ON user_settings;
DROP POLICY IF EXISTS user_settings_insert_own ON user_settings;
DROP POLICY IF EXISTS user_settings_update_own ON user_settings;
DROP POLICY IF EXISTS user_settings_delete_own ON user_settings;

DROP POLICY IF EXISTS blocked_users_select_own ON blocked_users;
DROP POLICY IF EXISTS blocked_users_insert_own ON blocked_users;
DROP POLICY IF EXISTS blocked_users_delete_own ON blocked_users;

DROP POLICY IF EXISTS private_photo_access_select_owner ON private_photo_access;
DROP POLICY IF EXISTS private_photo_access_select_granted ON private_photo_access;
DROP POLICY IF EXISTS private_photo_access_insert_owner ON private_photo_access;
DROP POLICY IF EXISTS private_photo_access_delete_owner ON private_photo_access;

DROP POLICY IF EXISTS account_deletion_select_own ON account_deletion_requests;
DROP POLICY IF EXISTS account_deletion_insert_own ON account_deletion_requests;
DROP POLICY IF EXISTS account_deletion_update_own ON account_deletion_requests;

-- =====================================================
-- STEP 2: Drop existing triggers (if any)
-- =====================================================
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_blocked_users_updated_at ON blocked_users;
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;

-- =====================================================
-- STEP 3: Create/Update Tables
-- =====================================================

-- TABLE: user_settings
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
  touch_face_id_protection BOOLEAN DEFAULT false,
  show_distance BOOLEAN DEFAULT true,
  activity_visibility BOOLEAN DEFAULT true,
  
  -- Other Settings
  location_distance VARCHAR(20) DEFAULT 'Distance',
  measurement_system VARCHAR(10) DEFAULT 'MI',
  app_icon_preference VARCHAR(50) DEFAULT 'default',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_id ON user_settings(id);

-- TABLE: blocked_users
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- TABLE: private_photo_access
CREATE TABLE IF NOT EXISTS private_photo_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_to_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(owner_id, granted_to_id)
);

CREATE INDEX IF NOT EXISTS idx_private_photo_access_owner ON private_photo_access(owner_id);
CREATE INDEX IF NOT EXISTS idx_private_photo_access_granted ON private_photo_access(granted_to_id);

-- TABLE: account_deletion_requests
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_deletion_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_account_deletion_user ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_status ON account_deletion_requests(status);

-- =====================================================
-- STEP 4: Enable RLS on all tables
-- =====================================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_photo_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create RLS Policies - user_settings
-- =====================================================
CREATE POLICY user_settings_select_own 
  ON user_settings 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY user_settings_insert_own 
  ON user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY user_settings_update_own 
  ON user_settings 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY user_settings_delete_own 
  ON user_settings 
  FOR DELETE 
  USING (auth.uid() = id);

-- =====================================================
-- STEP 6: Create RLS Policies - blocked_users
-- =====================================================
CREATE POLICY blocked_users_select_own 
  ON blocked_users 
  FOR SELECT 
  USING (auth.uid() = blocker_id);

CREATE POLICY blocked_users_insert_own 
  ON blocked_users 
  FOR INSERT 
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY blocked_users_delete_own 
  ON blocked_users 
  FOR DELETE 
  USING (auth.uid() = blocker_id);

-- =====================================================
-- STEP 7: Create RLS Policies - private_photo_access
-- =====================================================
CREATE POLICY private_photo_access_select_owner 
  ON private_photo_access 
  FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY private_photo_access_select_granted 
  ON private_photo_access 
  FOR SELECT 
  USING (auth.uid() = granted_to_id);

CREATE POLICY private_photo_access_insert_owner 
  ON private_photo_access 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY private_photo_access_delete_owner 
  ON private_photo_access 
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- =====================================================
-- STEP 8: Create RLS Policies - account_deletion_requests
-- =====================================================
CREATE POLICY account_deletion_select_own 
  ON account_deletion_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY account_deletion_insert_own 
  ON account_deletion_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY account_deletion_update_own 
  ON account_deletion_requests 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 9: Create Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize user settings on signup
CREATE OR REPLACE FUNCTION initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get blocked user IDs
CREATE OR REPLACE FUNCTION get_blocked_user_ids(user_id UUID)
RETURNS TABLE (blocked_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT bu.blocked_id
  FROM blocked_users bu
  WHERE bu.blocker_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(blocker UUID, blocked UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE blocker_id = blocker AND blocked_id = blocked
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check private photo access
CREATE OR REPLACE FUNCTION has_private_photo_access(photo_owner UUID, viewer UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Owner always has access
  IF photo_owner = viewer THEN
    RETURN true;
  END IF;
  
  -- Check if access has been granted and not expired
  RETURN EXISTS (
    SELECT 1 FROM private_photo_access
    WHERE owner_id = photo_owner 
      AND granted_to_id = viewer
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 10: Create Triggers
-- =====================================================

-- Trigger for user_settings updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger to auto-create settings when user signs up
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_settings();

-- =====================================================
-- STEP 11: Backfill settings for existing users
-- =====================================================
-- Create settings for any existing users who don't have them yet
INSERT INTO user_settings (id)
SELECT u.id 
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.id
WHERE us.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Verify the setup
DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('user_settings', 'blocked_users', 'private_photo_access', 'account_deletion_requests');
  
  RAISE NOTICE 'Tables created: %', table_count;
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('user_settings', 'blocked_users', 'private_photo_access', 'account_deletion_requests');
  
  RAISE NOTICE 'RLS Policies created: %', policy_count;
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_name IN ('update_user_settings_updated_at', 'on_auth_user_created_settings');
  
  RAISE NOTICE 'Triggers created: %', trigger_count;
  
  RAISE NOTICE '✅ Setup complete!';
END $$;
