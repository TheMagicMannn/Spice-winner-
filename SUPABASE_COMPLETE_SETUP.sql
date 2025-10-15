-- =====================================================
-- SPICE DATING APP - COMPLETE SUPABASE SETUP
-- =====================================================
-- This SQL script creates the complete database schema with:
-- ✅ Correct snake_case column names (matching transformation layer)
-- ✅ Comprehensive RLS policies for security
-- ✅ Automatic triggers for user creation and updates
-- ✅ Storage buckets and policies for photos
-- ✅ Indexes for performance
--
-- Run this in Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste this → Run
-- =====================================================

-- =====================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. DROP EXISTING OBJECTS (for clean install)
-- =====================================================
-- WARNING: This will delete all existing data!
-- Comment out this section if you want to preserve data

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS on_subscription_change ON subscriptions;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_membership_tier();

-- Drop tables (cascade to remove dependencies)
DROP TABLE IF EXISTS user_reports CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- 3. CREATE PROFILES TABLE
-- =====================================================
-- Uses snake_case to match database conventions
-- Frontend transformation layer converts camelCase → snake_case

CREATE TABLE profiles (
    -- Primary identification (same as auth.users.id, NOT a separate user_id column)
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Account type and membership
    account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'couple')),
    membership_tier TEXT DEFAULT 'basic' CHECK (membership_tier IN ('basic', 'vip')),
    membership_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Core profile information (INDIVIDUAL)
    display_name TEXT,
    location TEXT,
    age INTEGER CHECK (age >= 18 AND age <= 100),
    bio TEXT CHECK (LENGTH(bio) >= 69 AND LENGTH(bio) <= 1000),
    
    -- Identity fields (INDIVIDUAL)
    gender TEXT,
    orientation TEXT,
    
    -- Couple profile fields (for PARTNER 2)
    display_name2 TEXT,
    age2 INTEGER CHECK (age2 IS NULL OR (age2 >= 18 AND age2 <= 100)),
    gender2 TEXT,
    orientation2 TEXT,
    
    -- Relationship and seeking information
    relationship_status TEXT,
    seeking TEXT[] DEFAULT '{}',
    seeking_relationship_type TEXT[] DEFAULT '{}',
    lifestyle_experience TEXT DEFAULT 'New' CHECK (lifestyle_experience IN ('New', 'Beginner', 'Moderate', 'Advanced')),
    
    -- Interests, kinks, and limits (max 10 each enforced by app)
    interests TEXT[] DEFAULT '{}',
    kinks TEXT[] DEFAULT '{}',
    soft_limits TEXT[] DEFAULT '{}',
    hard_limits TEXT[] DEFAULT '{}',
    
    -- Safety and rules
    safety_practices TEXT,
    rules TEXT,
    
    -- Photos (array of public URLs from storage)
    photos TEXT[] DEFAULT '{}',
    
    -- Match preferences stored as JSONB
    -- NOTE: Frontend uses 'sexualities' but DB stores as 'orientations'
    -- The transformation layer handles this conversion automatically
    match_preferences JSONB DEFAULT jsonb_build_object(
        'ageRange', ARRAY[18, 65],
        'genders', ARRAY[]::text[],
        'orientations', ARRAY[]::text[],
        'searchingFor', ARRAY[]::text[],
        'distance', 50,
        'vipOnly', false,
        'verifiedOnly', true,
        'experienceLevels', ARRAY[]::text[]
    ),
    
    -- Profile status and verification
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment explaining the transformation
COMMENT ON COLUMN profiles.match_preferences IS 
'JSONB object containing match preferences. 
NOTE: Frontend uses "sexualities" field but DB stores as "orientations". 
The transformation layer (transformers.ts) handles this conversion automatically.';

-- =====================================================
-- 4. CREATE SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Subscription details
    tier TEXT NOT NULL CHECK (tier IN ('basic', 'vip')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
    
    -- Billing information (for Stripe integration)
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Pricing
    amount_cents INTEGER,
    currency TEXT DEFAULT 'USD',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CREATE MATCHES TABLE
-- =====================================================

CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Match status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected', 'blocked')),
    matched_at TIMESTAMP WITH TIME ZONE,
    
    -- Who initiated the match
    initiated_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id)  -- Ensures consistent ordering
);

-- =====================================================
-- 6. CREATE MESSAGES TABLE
-- =====================================================

CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Message content
    content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gif')),
    
    -- Message status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. CREATE EVENTS TABLE
-- =====================================================

CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Event details
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Event settings
    is_vip_only BOOLEAN DEFAULT TRUE,
    max_attendees INTEGER CHECK (max_attendees > 0),
    current_attendees INTEGER DEFAULT 0 CHECK (current_attendees >= 0),
    
    -- Event status
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'canceled')),
    
    -- Organizer
    created_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. CREATE EVENT ATTENDEES TABLE
-- =====================================================

CREATE TABLE event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Attendance status
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show')),
    
    -- Timestamps
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate registrations
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- 9. CREATE USER REPORTS TABLE
-- =====================================================

CREATE TABLE user_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reported_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Report details
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    
    -- Admin notes
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-reporting
    CHECK (reporter_id != reported_id)
);

-- =====================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Profile indexes
CREATE INDEX idx_profiles_membership_tier ON profiles(membership_tier);
CREATE INDEX idx_profiles_account_type ON profiles(account_type);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_profile_completed ON profiles(profile_completed);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);

-- Match indexes
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created_at ON matches(created_at DESC);

-- Message indexes
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- Subscription indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Event indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_is_vip_only ON events(is_vip_only);

-- =====================================================
-- 11. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        display_name,
        age,
        account_type,
        membership_tier,
        is_active,
        profile_completed
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 18),
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
        'basic',
        TRUE,
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update membership tier based on subscription
CREATE OR REPLACE FUNCTION update_membership_tier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE profiles 
        SET 
            membership_tier = NEW.tier,
            membership_expires_at = NEW.current_period_end
        WHERE id = NEW.user_id;
    ELSIF NEW.status IN ('canceled', 'expired') THEN
        UPDATE profiles 
        SET 
            membership_tier = 'basic',
            membership_expires_at = NULL
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure proper match ordering
CREATE OR REPLACE FUNCTION ensure_match_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure user1_id is always less than user2_id
    IF NEW.user1_id > NEW.user2_id THEN
        DECLARE
            temp_id UUID;
        BEGIN
            temp_id := NEW.user1_id;
            NEW.user1_id := NEW.user2_id;
            NEW.user2_id := temp_id;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update match status to 'matched' when both users like each other
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new like/match
    IF NEW.status = 'pending' THEN
        -- Check if there's a reverse match
        UPDATE matches 
        SET status = 'matched', matched_at = NOW()
        WHERE (user1_id = NEW.user2_id AND user2_id = NEW.user1_id)
        OR (user1_id = NEW.user1_id AND user2_id = NEW.user2_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events 
        SET current_attendees = current_attendees + 1
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events 
        SET current_attendees = GREATEST(0, current_attendees - 1)
        WHERE id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Trigger for updating updated_at timestamps
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON matches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendees_updated_at 
    BEFORE UPDATE ON event_attendees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- Trigger for subscription changes
CREATE TRIGGER on_subscription_change
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW 
    EXECUTE FUNCTION update_membership_tier();

-- Trigger to ensure match ordering
CREATE TRIGGER ensure_match_order_trigger
    BEFORE INSERT ON matches
    FOR EACH ROW 
    EXECUTE FUNCTION ensure_match_order();

-- Trigger to check for mutual matches
CREATE TRIGGER check_mutual_match_trigger
    AFTER INSERT OR UPDATE ON matches
    FOR EACH ROW 
    EXECUTE FUNCTION check_mutual_match();

-- Trigger to update event attendee count
CREATE TRIGGER update_event_attendee_count_trigger
    AFTER INSERT OR DELETE ON event_attendees
    FOR EACH ROW 
    EXECUTE FUNCTION update_event_attendee_count();

-- =====================================================
-- 13. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 14. PROFILES RLS POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can view other active, completed profiles (for matching)
CREATE POLICY "Users can view active profiles"
    ON profiles FOR SELECT
    USING (
        is_active = TRUE 
        AND profile_completed = TRUE 
        AND id != auth.uid()
    );

-- =====================================================
-- 15. SUBSCRIPTIONS RLS POLICIES
-- =====================================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can manage all subscriptions (for Stripe webhooks)
CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- 16. MATCHES RLS POLICIES
-- =====================================================

-- Users can view matches they're involved in
CREATE POLICY "Users can view their matches"
    ON matches FOR SELECT
    USING (
        auth.uid() = user1_id 
        OR auth.uid() = user2_id
    );

-- Users can create matches (like/pass on someone)
CREATE POLICY "Users can create matches"
    ON matches FOR INSERT
    WITH CHECK (
        auth.uid() = user1_id 
        OR auth.uid() = user2_id
    );

-- Users can update matches they're involved in
CREATE POLICY "Users can update their matches"
    ON matches FOR UPDATE
    USING (
        auth.uid() = user1_id 
        OR auth.uid() = user2_id
    );

-- =====================================================
-- 17. MESSAGES RLS POLICIES
-- =====================================================

-- Users can view messages in their matched conversations
CREATE POLICY "Users can view their messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
            AND matches.status = 'matched'
        )
    );

-- Users can send messages in their matched conversations
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
            AND matches.status = 'matched'
        )
    );

-- Users can update messages in their conversations (mark as read)
CREATE POLICY "Users can update messages"
    ON messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- =====================================================
-- 18. EVENTS RLS POLICIES
-- =====================================================

-- All authenticated users can view upcoming events
CREATE POLICY "Users can view upcoming events"
    ON events FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND status = 'upcoming'
    );

-- VIP users can view all events including VIP-only
CREATE POLICY "VIP users can view VIP events"
    ON events FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND (
            NOT is_vip_only 
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.membership_tier = 'vip'
            )
        )
    );

-- =====================================================
-- 19. EVENT ATTENDEES RLS POLICIES
-- =====================================================

-- Users can view their own event registrations
CREATE POLICY "Users can view own registrations"
    ON event_attendees FOR SELECT
    USING (auth.uid() = user_id);

-- Users can register for events
CREATE POLICY "Users can register for events"
    ON event_attendees FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = event_attendees.event_id 
            AND events.status = 'upcoming'
            AND (
                NOT events.is_vip_only 
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.membership_tier = 'vip'
                )
            )
        )
    );

-- Users can cancel their registrations
CREATE POLICY "Users can cancel registrations"
    ON event_attendees FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 20. USER REPORTS RLS POLICIES
-- =====================================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON user_reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
    ON user_reports FOR INSERT
    WITH CHECK (
        auth.uid() = reporter_id
        AND reporter_id != reported_id
    );

-- =====================================================
-- 21. STORAGE BUCKETS SETUP
-- =====================================================

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for event photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 22. STORAGE RLS POLICIES - PROFILE PHOTOS
-- =====================================================

-- Users can upload their own profile photos
CREATE POLICY "Users can upload profile photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can update their own profile photos
CREATE POLICY "Users can update profile photos"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own profile photos
CREATE POLICY "Users can delete profile photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'profile-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Public can view profile photos
CREATE POLICY "Public can view profile photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-photos');

-- =====================================================
-- 23. STORAGE RLS POLICIES - EVENT PHOTOS
-- =====================================================

-- Authenticated users can view event photos
CREATE POLICY "Authenticated users can view event photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'event-photos' 
        AND auth.role() = 'authenticated'
    );

-- =====================================================
-- 24. STORAGE RLS POLICIES - MESSAGE ATTACHMENTS
-- =====================================================

-- Users can upload message attachments
CREATE POLICY "Users can upload message attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'message-attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can view message attachments in their conversations
CREATE POLICY "Users can view their attachments"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'message-attachments'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR EXISTS (
                SELECT 1 FROM matches 
                WHERE (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
                AND matches.status = 'matched'
            )
        )
    );

-- =====================================================
-- 25. CREATE HELPER VIEWS
-- =====================================================

-- View for active profiles with full details
CREATE OR REPLACE VIEW active_profiles_view AS
SELECT 
    p.*,
    s.status as subscription_status,
    s.current_period_end as membership_expires
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
WHERE p.is_active = TRUE AND p.profile_completed = TRUE;

-- View for match statistics per user
CREATE OR REPLACE VIEW user_match_stats AS
SELECT 
    user_id,
    COUNT(*) FILTER (WHERE status = 'matched') as total_matches,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_matches,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_matches,
    COUNT(*) FILTER (WHERE status = 'blocked') as blocked_users
FROM (
    SELECT user1_id as user_id, status FROM matches
    UNION ALL
    SELECT user2_id as user_id, status FROM matches
) combined_matches
GROUP BY user_id;

-- =====================================================
-- 26. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ SPICE Dating App Database Setup Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '  - profiles (with snake_case columns)';
    RAISE NOTICE '  - subscriptions';
    RAISE NOTICE '  - matches';
    RAISE NOTICE '  - messages';
    RAISE NOTICE '  - events';
    RAISE NOTICE '  - event_attendees';
    RAISE NOTICE '  - user_reports';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 RLS Policies: Enabled for all tables';
    RAISE NOTICE '⚡ Triggers: Created for automation';
    RAISE NOTICE '📦 Storage Buckets: profile-photos, event-photos, message-attachments';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Schema is compatible with transformation layer!';
    RAISE NOTICE '   Frontend: camelCase → Transformer → Database: snake_case';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to use with your React + Supabase app!';
END $$;
