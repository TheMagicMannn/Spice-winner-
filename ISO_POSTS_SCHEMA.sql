-- =====================================================
-- ISO POSTS FEATURE - DATABASE SCHEMA
-- =====================================================
-- This schema adds ISO (In Search Of) posts functionality
-- allowing users to create posts about what/who they're seeking

-- =====================================================
-- 1. ISO POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS iso_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Post content
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    location TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT title_length CHECK (char_length(title) >= 10 AND char_length(title) <= 200),
    CONSTRAINT content_length CHECK (char_length(content) >= 50 AND char_length(content) <= 2000)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_iso_posts_author ON iso_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_iso_posts_created ON iso_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iso_posts_active ON iso_posts(is_active) WHERE is_active = true;

-- =====================================================
-- 2. ISO LIKES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS iso_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES iso_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per user per post
    UNIQUE(post_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_iso_likes_post ON iso_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_iso_likes_user ON iso_likes(user_id);

-- =====================================================
-- 3. ISO COMMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS iso_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES iso_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT comment_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_iso_comments_post ON iso_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_iso_comments_user ON iso_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_iso_comments_created ON iso_comments(created_at DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE iso_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE iso_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE iso_comments ENABLE ROW LEVEL SECURITY;

-- ISO Posts Policies
-- Anyone can view active posts
CREATE POLICY "Anyone can view active ISO posts"
    ON iso_posts FOR SELECT
    USING (is_active = true);

-- Users can create their own posts
CREATE POLICY "Users can create their own ISO posts"
    ON iso_posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own ISO posts"
    ON iso_posts FOR UPDATE
    USING (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own ISO posts"
    ON iso_posts FOR DELETE
    USING (auth.uid() = author_id);

-- ISO Likes Policies
-- Anyone can view likes
CREATE POLICY "Anyone can view ISO likes"
    ON iso_likes FOR SELECT
    USING (true);

-- Users can like posts
CREATE POLICY "Users can like ISO posts"
    ON iso_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can unlike posts
CREATE POLICY "Users can unlike ISO posts"
    ON iso_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ISO Comments Policies
-- Anyone can view comments
CREATE POLICY "Anyone can view ISO comments"
    ON iso_comments FOR SELECT
    USING (true);

-- Users can create comments
CREATE POLICY "Users can create ISO comments"
    ON iso_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own ISO comments"
    ON iso_comments FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own ISO comments"
    ON iso_comments FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_iso_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on posts
CREATE TRIGGER update_iso_posts_updated_at
    BEFORE UPDATE ON iso_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_iso_post_updated_at();

-- Trigger to auto-update updated_at on comments
CREATE TRIGGER update_iso_comments_updated_at
    BEFORE UPDATE ON iso_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_iso_post_updated_at();

-- =====================================================
-- 6. VIEWS FOR EASIER QUERYING
-- =====================================================

-- View to get ISO posts with author details and counts
CREATE OR REPLACE VIEW iso_posts_with_details AS
SELECT 
    p.*,
    pr.display_name,
    pr.display_name2,
    pr.account_type,
    pr.photos,
    pr.is_verified,
    pr.membership_tier,
    pr.location as author_location,
    pr.age,
    pr.age2,
    (SELECT COUNT(*) FROM iso_likes WHERE post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM iso_comments WHERE post_id = p.id) as comments_count
FROM iso_posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

-- =====================================================
-- COMPLETED: ISO POSTS SCHEMA
-- =====================================================
-- To apply this schema to your Supabase database:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
-- =====================================================
