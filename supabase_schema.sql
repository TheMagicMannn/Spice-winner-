-- =====================================================
-- SPICE Dating App - Complete Supabase Schema
-- =====================================================
-- This file contains all tables, triggers, functions, and RLS policies
-- Run this in Supabase SQL Editor to set up the complete database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE membership_tier AS ENUM ('basic', 'vip');
CREATE TYPE account_type AS ENUM ('individual', 'couple');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    photos TEXT[] DEFAULT '{}',
    date_of_birth DATE,
    gender TEXT,
    sexuality TEXT,
    location_city TEXT,
    location_state TEXT,
    location_country TEXT DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    account_type account_type DEFAULT 'individual',
    partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    relationship_status TEXT,
    desires TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    experience_level TEXT,
    membership_tier membership_tier DEFAULT 'basic',
    vip_expires_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_badge TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Physical attributes
    height INTEGER,
    body_type TEXT,
    ethnicity TEXT,
    eye_color TEXT,
    hair_color TEXT,
    grooming_style TEXT,
    
    -- Additional fields
    kink_quiz_results JSONB,
    
    CONSTRAINT valid_lat CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_lng CHECK (longitude >= -180 AND longitude <= 180)
);

-- Match Preferences Table
CREATE TABLE IF NOT EXISTS match_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    age_range INTEGER[] DEFAULT '{18,55}',
    genders TEXT[] DEFAULT '{}',
    sexualities TEXT[] DEFAULT '{}',
    searching_for TEXT[] DEFAULT '{}',
    distance INTEGER DEFAULT 50,
    vip_only BOOLEAN DEFAULT FALSE,
    verified_only BOOLEAN DEFAULT TRUE,
    experience_levels TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status subscription_status DEFAULT 'active',
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes Table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    liker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    liked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(liker_id, liked_id),
    CONSTRAINT no_self_like CHECK (liker_id != liked_id)
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    compatibility_score INTEGER,
    last_message_at TIMESTAMPTZ,
    UNIQUE(user1_id, user2_id),
    CONSTRAINT ordered_user_ids CHECK (user1_id < user2_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    message_type message_type DEFAULT 'text',
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Private Content Table
CREATE TABLE IF NOT EXISTS private_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'photo', 'video', etc.
    storage_path TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    thumbnail_path TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Private Content Access Table
CREATE TABLE IF NOT EXISTS private_content_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    granted_to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    UNIQUE(owner_id, granted_to_id),
    CONSTRAINT no_self_grant CHECK (owner_id != granted_to_id)
);

-- Legacy Private Photo Access (for backward compatibility)
CREATE TABLE IF NOT EXISTS private_photo_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    granted_to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, granted_to_id)
);

-- Verification Requests Table
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    status verification_status DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    show_online_status BOOLEAN DEFAULT TRUE,
    incognito_mode BOOLEAN DEFAULT FALSE,
    distance_unit TEXT DEFAULT 'miles',
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'dark',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT,
    blocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id)
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location_name TEXT,
    location_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    max_attendees INTEGER,
    is_vip_only BOOLEAN DEFAULT FALSE,
    is_verified_only BOOLEAN DEFAULT TRUE,
    cover_photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs Table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going', -- 'going', 'maybe', 'not_going'
    rsvp_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Community Groups Table
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    privacy TEXT DEFAULT 'public', -- 'public', 'private'
    is_premium BOOLEAN DEFAULT FALSE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 0,
    cover_photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id ON likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_last_message ON matches(last_message_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Private content indexes
CREATE INDEX IF NOT EXISTS idx_private_content_owner ON private_content(owner_id);
CREATE INDEX IF NOT EXISTS idx_private_content_access_owner ON private_content_access(owner_id);
CREATE INDEX IF NOT EXISTS idx_private_content_access_granted ON private_content_access(granted_to_id);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_preferences_updated_at BEFORE UPDATE ON match_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_content_updated_at BEFORE UPDATE ON private_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_groups_updated_at BEFORE UPDATE ON community_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create match when mutual like occurs
CREATE OR REPLACE FUNCTION check_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the liked user has also liked the liker
    IF EXISTS (
        SELECT 1 FROM likes
        WHERE liker_id = NEW.liked_id AND liked_id = NEW.liker_id
    ) THEN
        -- Create a match (ensure user1_id < user2_id)
        INSERT INTO matches (user1_id, user2_id, matched_at)
        VALUES (
            LEAST(NEW.liker_id, NEW.liked_id),
            GREATEST(NEW.liker_id, NEW.liked_id),
            NOW()
        )
        ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_mutual_like_trigger AFTER INSERT ON likes
    FOR EACH ROW EXECUTE FUNCTION check_mutual_like();

-- Function to update match last_message_at
CREATE OR REPLACE FUNCTION update_match_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE matches
    SET last_message_at = NEW.created_at
    WHERE id = NEW.match_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_last_message_trigger AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_match_last_message();

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_groups
        SET member_count = member_count + 1
        WHERE id = NEW.group_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_groups
        SET member_count = member_count - 1
        WHERE id = OLD.group_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_member_count_trigger
AFTER INSERT OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Get users with private content access
CREATE OR REPLACE FUNCTION get_users_with_private_access(owner_id_param UUID)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    photos TEXT[],
    granted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.display_name,
        p.photos,
        pca.granted_at,
        pca.expires_at
    FROM private_content_access pca
    JOIN profiles p ON p.id = pca.granted_to_id
    WHERE pca.owner_id = owner_id_param
        AND pca.revoked_at IS NULL
        AND (pca.expires_at IS NULL OR pca.expires_at > NOW())
    ORDER BY pca.granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 3959; -- miles
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dlon/2) * sin(dlon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get potential matches with distance
CREATE OR REPLACE FUNCTION get_potential_matches(
    user_id_param UUID,
    max_distance INTEGER DEFAULT 50,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    photos TEXT[],
    bio TEXT,
    age INTEGER,
    distance_miles DECIMAL,
    compatibility_score INTEGER
) AS $$
DECLARE
    user_lat DECIMAL;
    user_lon DECIMAL;
BEGIN
    -- Get user's location
    SELECT latitude, longitude INTO user_lat, user_lon
    FROM profiles WHERE id = user_id_param;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.display_name,
        p.photos,
        p.bio,
        EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER as age,
        calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance_miles,
        50 as compatibility_score -- Placeholder, implement actual algorithm
    FROM profiles p
    WHERE p.id != user_id_param
        AND p.latitude IS NOT NULL
        AND p.longitude IS NOT NULL
        AND calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= max_distance
        AND NOT EXISTS (
            SELECT 1 FROM likes WHERE liker_id = user_id_param AND liked_id = p.id
        )
        AND NOT EXISTS (
            SELECT 1 FROM blocked_users 
            WHERE (blocker_id = user_id_param AND blocked_id = p.id)
               OR (blocker_id = p.id AND blocked_id = user_id_param)
        )
    ORDER BY distance_miles ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's matches with last message
CREATE OR REPLACE FUNCTION get_user_matches(user_id_param UUID)
RETURNS TABLE (
    match_id UUID,
    matched_user_id UUID,
    display_name TEXT,
    photos TEXT[],
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        CASE 
            WHEN m.user1_id = user_id_param THEN m.user2_id
            ELSE m.user1_id
        END as matched_user_id,
        p.display_name,
        p.photos,
        msg.content as last_message,
        m.last_message_at,
        (
            SELECT COUNT(*)::INTEGER
            FROM messages
            WHERE match_id = m.id
                AND receiver_id = user_id_param
                AND is_read = FALSE
        ) as unread_count
    FROM matches m
    JOIN profiles p ON p.id = CASE 
        WHEN m.user1_id = user_id_param THEN m.user2_id
        ELSE m.user1_id
    END
    LEFT JOIN LATERAL (
        SELECT content
        FROM messages
        WHERE match_id = m.id
        ORDER BY created_at DESC
        LIMIT 1
    ) msg ON true
    WHERE m.user1_id = user_id_param OR m.user2_id = user_id_param
    ORDER BY m.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_photo_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Match Preferences policies
CREATE POLICY "Users can view own preferences"
    ON match_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON match_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON match_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view likes they gave or received"
    ON likes FOR SELECT
    USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can insert their own likes"
    ON likes FOR INSERT
    WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can delete their own likes"
    ON likes FOR DELETE
    USING (auth.uid() = liker_id);

-- Matches policies
CREATE POLICY "Users can view their matches"
    ON matches FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages policies
CREATE POLICY "Users can view messages in their matches"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages in their matches"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Private Content policies
CREATE POLICY "Users can view own private content"
    ON private_content FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own private content"
    ON private_content FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own private content"
    ON private_content FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own private content"
    ON private_content FOR DELETE
    USING (auth.uid() = owner_id);

-- Private Content Access policies
CREATE POLICY "Owners can view access grants"
    ON private_content_access FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Granted users can view their access"
    ON private_content_access FOR SELECT
    USING (auth.uid() = granted_to_id);

CREATE POLICY "Owners can grant access"
    ON private_content_access FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can revoke access"
    ON private_content_access FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete access"
    ON private_content_access FOR DELETE
    USING (auth.uid() = owner_id);

-- User Settings policies
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Blocked Users policies
CREATE POLICY "Users can view who they blocked"
    ON blocked_users FOR SELECT
    USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
    ON blocked_users FOR DELETE
    USING (auth.uid() = blocker_id);

-- Reports policies
CREATE POLICY "Users can view their reports"
    ON reports FOR SELECT
    USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Events policies
CREATE POLICY "Everyone can view public events"
    ON events FOR SELECT
    USING (true);

CREATE POLICY "Users can create events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their events"
    ON events FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their events"
    ON events FOR DELETE
    USING (auth.uid() = creator_id);

-- Event RSVPs policies
CREATE POLICY "Users can view RSVPs for events"
    ON event_rsvps FOR SELECT
    USING (true);

CREATE POLICY "Users can RSVP to events"
    ON event_rsvps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their RSVPs"
    ON event_rsvps FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their RSVPs"
    ON event_rsvps FOR DELETE
    USING (auth.uid() = user_id);

-- Community Groups policies
CREATE POLICY "Everyone can view public groups"
    ON community_groups FOR SELECT
    USING (privacy = 'public' OR privacy = 'private');

CREATE POLICY "Users can create groups"
    ON community_groups FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their groups"
    ON community_groups FOR UPDATE
    USING (auth.uid() = creator_id);

-- Group Members policies
CREATE POLICY "Members can view group membership"
    ON group_members FOR SELECT
    USING (true);

CREATE POLICY "Users can join groups"
    ON group_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
    ON group_members FOR DELETE
    USING (auth.uid() = user_id);

-- Verification Requests policies
CREATE POLICY "Users can view own verification requests"
    ON verification_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verification requests"
    ON verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests"
    ON verification_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update verification requests"
    ON verification_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- =====================================================
-- STORAGE BUCKETS (for Supabase Storage)
-- =====================================================

-- Note: These need to be created in Supabase Dashboard or via SQL
-- Profile photos bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Private content bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('private-content', 'private-content', false);

-- Event photos bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', true);

-- =====================================================
-- INITIAL DATA / SEED DATA (Optional)
-- =====================================================

-- You can add seed data here if needed

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant authenticated users access to functions
GRANT EXECUTE ON FUNCTION get_users_with_private_access TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance TO authenticated;
GRANT EXECUTE ON FUNCTION get_potential_matches TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_matches TO authenticated;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'SPICE Dating App schema installation complete!';
    RAISE NOTICE 'Tables, triggers, functions, and RLS policies created successfully.';
    RAISE NOTICE 'Remember to configure Storage buckets in Supabase Dashboard.';
END $$;
