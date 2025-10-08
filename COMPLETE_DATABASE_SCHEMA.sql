-- =====================================================
-- SPICE DATING APP - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This schema includes all profile data, membership tiers,
-- storage buckets, and comprehensive RLS policies

-- =====================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =====================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing and encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. CREATE CUSTOM TYPES
-- =====================================================

-- Account types
CREATE TYPE account_type AS ENUM ('individual', 'couple');

-- Membership tiers
CREATE TYPE membership_tier AS ENUM ('basic', 'vip');

-- Gender options
CREATE TYPE gender_type AS ENUM (
    'Male', 'Female', 'Non-binary', 'Transgender Male', 
    'Transgender Female', 'Genderqueer', 'Other'
);

-- Sexuality/Orientation options
CREATE TYPE orientation_type AS ENUM (
    'Straight', 'Bisexual', 'Gay', 'Pansexual', 
    'Queer', 'Asexual', 'Other'
);

-- Relationship status options
CREATE TYPE relationship_status_type AS ENUM (
    'Single', 'Married', 'Divorced', 'Widowed', 
    'In a Relationship', 'Open Relationship', 'It''s Complicated'
);

-- Experience levels
CREATE TYPE experience_level AS ENUM ('New', 'Beginner', 'Moderate', 'Advanced');

-- =====================================================
-- 3. MAIN PROFILES TABLE
-- =====================================================

CREATE TABLE profiles (
    -- Primary identification
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Account type and membership
    account_type account_type DEFAULT 'individual',
    membership_tier membership_tier DEFAULT 'basic',
    membership_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Core profile information
    display_name TEXT,
    location TEXT,
    age INTEGER CHECK (age >= 18 AND age <= 100),
    bio TEXT,
    
    -- Individual profile fields
    gender gender_type,
    orientation orientation_type,
    
    -- Couple profile fields (for couples only)
    display_name2 TEXT, -- Partner's name
    gender2 gender_type, -- Partner's gender
    orientation2 orientation_type, -- Partner's orientation
    age2 INTEGER CHECK (age2 >= 18 AND age2 <= 100), -- Partner's age
    
    -- Relationship and seeking information
    relationship_status relationship_status_type,
    seeking TEXT[], -- Array of what they're seeking (Men, Women, Couples, etc.)
    seeking_relationship_type TEXT[], -- Array of relationship types (Casual NSA, FWB, etc.)
    lifestyle_experience experience_level DEFAULT 'New',
    
    -- Interests and preferences
    interests TEXT[], -- General interests (Wine Tasting, Hiking, etc.)
    kinks TEXT[], -- Lifestyle kinks and preferences
    soft_limits TEXT[], -- Things they might try
    hard_limits TEXT[], -- Absolute no's
    
    -- Safety and rules
    safety_practices TEXT, -- Safety practices they follow
    rules TEXT, -- Personal rules and boundaries
    
    -- Photos (stored as array of URLs)
    photos TEXT[] DEFAULT '{}',
    
    -- Match preferences (stored as JSONB for flexibility)
    match_preferences JSONB DEFAULT '{
        "ageRange": [18, 65],
        "genders": [],
        "orientations": [],
        "searchingFor": [],
        "distance": 50,
        "vipOnly": false,
        "verifiedOnly": false,
        "experienceLevels": []
    }'::jsonb,
    
    -- Profile status and verification
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. MEMBERSHIP SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Subscription details
    tier membership_tier NOT NULL,
    status TEXT CHECK (status IN ('active', 'canceled', 'expired', 'pending')) DEFAULT 'pending',
    
    -- Billing information
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Pricing
    amount_cents INTEGER, -- Price in cents
    currency TEXT DEFAULT 'USD',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. MATCHES TABLE
-- =====================================================

CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Match status
    status TEXT CHECK (status IN ('pending', 'matched', 'rejected', 'blocked')) DEFAULT 'pending',
    matched_at TIMESTAMP WITH TIME ZONE,
    
    -- Who initiated
    initiated_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate matches
    UNIQUE(user1_id, user2_id),
    -- Ensure users can't match themselves
    CHECK (user1_id != user2_id)
);

-- =====================================================
-- 6. MESSAGES TABLE
-- =====================================================

CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gif')),
    
    -- Message status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. EVENTS TABLE (VIP-only events)
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
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    
    -- Event status
    status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed', 'canceled')) DEFAULT 'upcoming',
    
    -- Organizer
    created_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. EVENT ATTENDEES TABLE
-- =====================================================

CREATE TABLE event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Attendance status
    status TEXT CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show')) DEFAULT 'registered',
    
    -- Timestamps
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate registrations
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- 9. USER REPORTS TABLE
-- =====================================================

CREATE TABLE user_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Report details
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
    
    -- Admin notes
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at);

-- Match indexes
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Message indexes
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

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
$$ language 'plpgsql';

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        display_name, 
        age,
        account_type,
        membership_tier
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 18),
        COALESCE((NEW.raw_user_meta_data->>'account_type')::account_type, 'individual'),
        'basic'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update membership tier based on subscription
CREATE OR REPLACE FUNCTION update_membership_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile membership tier when subscription changes
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

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Trigger for updating updated_at timestamps
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON matches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger for subscription changes
CREATE TRIGGER on_subscription_change
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_membership_tier();

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can view other active profiles (for matching)
CREATE POLICY "Users can view other active profiles"
    ON profiles FOR SELECT
    USING (
        is_active = true 
        AND profile_completed = true 
        AND auth.uid() != id
    );

-- =====================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- MATCHES TABLE POLICIES
-- =====================================================

-- Users can view matches they're involved in
CREATE POLICY "Users can view their matches"
    ON matches FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create matches (like/pass on someone)
CREATE POLICY "Users can create matches"
    ON matches FOR INSERT
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update matches they're involved in
CREATE POLICY "Users can update their matches"
    ON matches FOR UPDATE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

-- Users can view messages in their matches
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

-- Users can send messages in their matches
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

-- Users can update their own messages (mark as read, etc.)
CREATE POLICY "Users can update their messages"
    ON messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- =====================================================
-- EVENTS TABLE POLICIES
-- =====================================================

-- All users can view upcoming events
CREATE POLICY "Users can view events"
    ON events FOR SELECT
    USING (status = 'upcoming');

-- VIP users can view VIP-only events
CREATE POLICY "VIP users can view VIP events"
    ON events FOR SELECT
    USING (
        NOT is_vip_only 
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.membership_tier = 'vip'
        )
    );

-- =====================================================
-- EVENT ATTENDEES TABLE POLICIES
-- =====================================================

-- Users can view their own event registrations
CREATE POLICY "Users can view their event registrations"
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

-- =====================================================
-- USER REPORTS TABLE POLICIES
-- =====================================================

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
    ON user_reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
    ON user_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- =====================================================
-- 14. STORAGE BUCKETS AND POLICIES
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
-- STORAGE POLICIES - PROFILE PHOTOS
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
-- STORAGE POLICIES - EVENT PHOTOS
-- =====================================================

-- Authenticated users can view event photos
CREATE POLICY "Authenticated users can view event photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'event-photos' 
        AND auth.role() = 'authenticated'
    );

-- =====================================================
-- STORAGE POLICIES - MESSAGE ATTACHMENTS
-- =====================================================

-- Users can upload message attachments
CREATE POLICY "Users can upload message attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'message-attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can view message attachments in their conversations
CREATE POLICY "Users can view their message attachments"
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
-- 15. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample interests options
CREATE TABLE IF NOT EXISTS interest_options (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO interest_options (category, name) VALUES
('lifestyle', 'Live Music'),
('lifestyle', 'Wine Tasting'),
('lifestyle', 'Craft Beer'),
('lifestyle', 'Hiking'),
('lifestyle', 'Art Galleries'),
('lifestyle', 'Dancing'),
('lifestyle', 'Travel'),
('lifestyle', 'Fine Dining'),
('fitness', 'Fitness/Gym'),
('fitness', 'Yoga/Meditation'),
('creative', 'Photography'),
('entertainment', 'Gaming'),
('outdoor', 'Boating'),
('entertainment', 'Movies'),
('entertainment', 'Theater'),
('lifestyle', 'Cooking'),
('social', 'Rooftop Bars'),
('social', 'Speakeasies'),
('lifestyle', 'Cigars'),
('lifestyle', 'Whiskey'),
('lifestyle', 'Fashion'),
('social', 'Charity Events'),
('fitness', 'Sports'),
('intellectual', 'Reading'),
('social', 'Beach Clubs');

-- Insert sample kink options
CREATE TABLE IF NOT EXISTS kink_options (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO kink_options (category, name) VALUES
('power_exchange', 'BDSM'),
('roleplay', 'Roleplay'),
('exhibition', 'Voyeurism'),
('exhibition', 'Exhibitionism'),
('group', 'Swinging'),
('group', 'Group Play'),
('sensual', 'Tantric Sex'),
('sensual', 'Food Play'),
('power_exchange', 'Dominance'),
('power_exchange', 'Submission'),
('restraint', 'Bondage'),
('sensation', 'Impact Play'),
('sensation', 'Sensory Deprivation'),
('roleplay', 'Age Play'),
('psychological', 'Cuckolding'),
('fetish', 'Foot Fetish'),
('material', 'Leather/Latex'),
('roleplay', 'Uniforms'),
('roleplay', 'Medical Play'),
('roleplay', 'Pet Play'),
('psychological', 'Praise'),
('psychological', 'Degradation'),
('fetish', 'Watersports'),
('physical', 'Anal Play'),
('exhibition', 'Public Play');

-- =====================================================
-- 16. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active profiles with membership info
CREATE OR REPLACE VIEW active_profiles AS
SELECT 
    p.*,
    s.status as subscription_status,
    s.current_period_end as membership_expires
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
WHERE p.is_active = true AND p.profile_completed = true;

-- View for match statistics
CREATE OR REPLACE VIEW match_stats AS
SELECT 
    user_id,
    COUNT(*) FILTER (WHERE status = 'matched') as total_matches,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_matches,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_matches
FROM (
    SELECT user1_id as user_id, status FROM matches
    UNION ALL
    SELECT user2_id as user_id, status FROM matches
) combined_matches
GROUP BY user_id;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Add a comment to indicate schema completion
COMMENT ON SCHEMA public IS 'SPICE Dating App - Complete database schema with profiles, memberships, matches, messages, events, and comprehensive RLS policies';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'SPICE Dating App database schema created successfully!';
    RAISE NOTICE 'Tables created: profiles, subscriptions, matches, messages, events, event_attendees, user_reports';
    RAISE NOTICE 'Storage buckets: profile-photos, event-photos, message-attachments';
    RAISE NOTICE 'RLS policies enabled for all tables and storage buckets';
    RAISE NOTICE 'Membership tiers: basic (free) and vip ($24.99/month)';
END $$;