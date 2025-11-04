-- =====================================================
-- ISO POSTS ENHANCEMENTS - DATABASE SCHEMA UPDATE
-- =====================================================
-- This adds seeking types, comment replies, and comment likes

-- =====================================================
-- 1. ADD SEEKING TYPE TO ISO POSTS
-- =====================================================

-- Add seeking_type column to iso_posts
ALTER TABLE iso_posts 
ADD COLUMN IF NOT EXISTS seeking_type TEXT[] DEFAULT '{}';

-- Add constraint to ensure at least one and at most 3 seeking types
ALTER TABLE iso_posts
ADD CONSTRAINT seeking_type_length CHECK (
  array_length(seeking_type, 1) >= 1 AND 
  array_length(seeking_type, 1) <= 3
);

-- Create index for seeking_type filtering
CREATE INDEX IF NOT EXISTS idx_iso_posts_seeking_type ON iso_posts USING GIN(seeking_type);

-- =====================================================
-- 2. COMMENT REPLIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS iso_comment_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES iso_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT reply_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_iso_comment_replies_comment ON iso_comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_iso_comment_replies_user ON iso_comment_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_iso_comment_replies_created ON iso_comment_replies(created_at DESC);

-- =====================================================
-- 3. COMMENT LIKES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS iso_comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES iso_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per user per comment
    UNIQUE(comment_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_iso_comment_likes_comment ON iso_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_iso_comment_likes_user ON iso_comment_likes(user_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE iso_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE iso_comment_likes ENABLE ROW LEVEL SECURITY;

-- Comment Replies Policies
-- Anyone can view replies
CREATE POLICY "Anyone can view ISO comment replies"
    ON iso_comment_replies FOR SELECT
    USING (true);

-- Users can create replies
CREATE POLICY "Users can create ISO comment replies"
    ON iso_comment_replies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own replies
CREATE POLICY "Users can update their own ISO comment replies"
    ON iso_comment_replies FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own replies
CREATE POLICY "Users can delete their own ISO comment replies"
    ON iso_comment_replies FOR DELETE
    USING (auth.uid() = user_id);

-- Comment Likes Policies
-- Anyone can view comment likes
CREATE POLICY "Anyone can view ISO comment likes"
    ON iso_comment_likes FOR SELECT
    USING (true);

-- Users can like comments
CREATE POLICY "Users can like ISO comments"
    ON iso_comment_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can unlike comments
CREATE POLICY "Users can unlike ISO comments"
    ON iso_comment_likes FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Trigger to auto-update updated_at on replies
CREATE TRIGGER update_iso_comment_replies_updated_at
    BEFORE UPDATE ON iso_comment_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_iso_post_updated_at();

-- =====================================================
-- 6. UPDATE VIEW FOR ISO POSTS
-- =====================================================

-- Drop existing view
DROP VIEW IF EXISTS iso_posts_with_details;

-- Recreate view with seeking_type
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
    pr.gender,
    pr.gender2,
    pr.orientation,
    pr.orientation2,
    (SELECT COUNT(*) FROM iso_likes WHERE post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM iso_comments WHERE post_id = p.id) as comments_count
FROM iso_posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

-- =====================================================
-- COMPLETED: ISO POSTS ENHANCEMENTS
-- =====================================================
-- To apply this schema to your Supabase database:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
-- =====================================================
