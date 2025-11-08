-- =====================================================
-- MINIMAL FIX: User Settings for Signup
-- =====================================================
-- This creates only the essential user_settings table
-- and trigger needed to fix the signup error
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_settings
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_id ON user_settings(id);

-- =====================================================
-- RLS POLICIES: user_settings
-- =====================================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
DROP POLICY IF EXISTS user_settings_select_own ON user_settings;
CREATE POLICY user_settings_select_own 
  ON user_settings 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can insert their own settings
DROP POLICY IF EXISTS user_settings_insert_own ON user_settings;
CREATE POLICY user_settings_insert_own 
  ON user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own settings
DROP POLICY IF EXISTS user_settings_update_own ON user_settings;
CREATE POLICY user_settings_update_own 
  ON user_settings 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own settings
DROP POLICY IF EXISTS user_settings_delete_own ON user_settings;
CREATE POLICY user_settings_delete_own 
  ON user_settings 
  FOR DELETE 
  USING (auth.uid() = id);

-- =====================================================
-- FUNCTION: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
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
  EXECUTE FUNCTION update_updated_at();

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
-- VERIFICATION QUERY
-- =====================================================
-- After running this script, you can verify with:
-- SELECT * FROM user_settings;
-- 
-- Then try signing up a new user. The user_settings
-- row should be automatically created.
