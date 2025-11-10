-- =====================================================
-- SPICE Learning System Database Schema
-- =====================================================
-- This schema creates tables for tracking user progress
-- through learning modules and awarding completion badges
-- =====================================================

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS learning_path_badges CASCADE;
DROP TABLE IF EXISTS user_module_progress CASCADE;
DROP TABLE IF EXISTS learning_modules CASCADE;

-- =====================================================
-- Learning Modules Table
-- Stores the catalog of all available learning modules
-- =====================================================
CREATE TABLE learning_modules (
    id TEXT PRIMARY KEY,
    path_id TEXT NOT NULL,
    path_title TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    category TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster path queries
CREATE INDEX idx_learning_modules_path ON learning_modules(path_id);

-- =====================================================
-- User Module Progress Table
-- Tracks individual user progress through each module
-- =====================================================
CREATE TABLE user_module_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    quiz_score INTEGER,
    quiz_attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Add indexes for faster queries
CREATE INDEX idx_user_module_progress_user ON user_module_progress(user_id);
CREATE INDEX idx_user_module_progress_module ON user_module_progress(module_id);
CREATE INDEX idx_user_module_progress_status ON user_module_progress(status);

-- =====================================================
-- Learning Path Badges Table
-- Stores badges earned by users for completing paths
-- =====================================================
CREATE TABLE learning_path_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    path_id TEXT NOT NULL,
    path_title TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, path_id)
);

-- Add indexes for faster badge queries
CREATE INDEX idx_learning_path_badges_user ON learning_path_badges(user_id);
CREATE INDEX idx_learning_path_badges_path ON learning_path_badges(path_id);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_badges ENABLE ROW LEVEL SECURITY;

-- Learning Modules Policies (Public Read)
CREATE POLICY "Anyone can view learning modules"
    ON learning_modules FOR SELECT
    USING (is_active = true);

-- User Module Progress Policies
CREATE POLICY "Users can view their own progress"
    ON user_module_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
    ON user_module_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_module_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
    ON user_module_progress FOR DELETE
    USING (auth.uid() = user_id);

-- Learning Path Badges Policies
CREATE POLICY "Users can view their own badges"
    ON learning_path_badges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
    ON learning_path_badges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can also view other users' badges (public achievement)
CREATE POLICY "Anyone can view all badges"
    ON learning_path_badges FOR SELECT
    USING (true);

-- =====================================================
-- Triggers for Automatic Updates
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for learning_modules
CREATE TRIGGER update_learning_modules_updated_at
    BEFORE UPDATE ON learning_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_module_progress
CREATE TRIGGER update_user_module_progress_updated_at
    BEFORE UPDATE ON user_module_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_module_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set completed_at
CREATE TRIGGER set_completed_at_on_completion
    BEFORE UPDATE ON user_module_progress
    FOR EACH ROW
    EXECUTE FUNCTION set_module_completed_at();

-- =====================================================
-- Function to Check Path Completion and Award Badge
-- =====================================================
CREATE OR REPLACE FUNCTION check_and_award_path_badge()
RETURNS TRIGGER AS $$
DECLARE
    v_path_id TEXT;
    v_path_title TEXT;
    v_total_modules INTEGER;
    v_completed_modules INTEGER;
    v_badge_exists BOOLEAN;
BEGIN
    -- Only proceed if module was just completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Get the path information for this module
        SELECT path_id, path_title INTO v_path_id, v_path_title
        FROM learning_modules
        WHERE id = NEW.module_id;

        -- Count total modules in this path
        SELECT COUNT(*) INTO v_total_modules
        FROM learning_modules
        WHERE path_id = v_path_id AND is_active = true;

        -- Count completed modules for this user in this path
        SELECT COUNT(*) INTO v_completed_modules
        FROM user_module_progress ump
        JOIN learning_modules lm ON ump.module_id = lm.id
        WHERE ump.user_id = NEW.user_id
        AND lm.path_id = v_path_id
        AND ump.status = 'completed';

        -- Check if badge already exists
        SELECT EXISTS(
            SELECT 1 FROM learning_path_badges
            WHERE user_id = NEW.user_id AND path_id = v_path_id
        ) INTO v_badge_exists;

        -- Award badge if all modules are completed and badge doesn't exist
        IF v_completed_modules = v_total_modules AND NOT v_badge_exists THEN
            INSERT INTO learning_path_badges (user_id, path_id, path_title)
            VALUES (NEW.user_id, v_path_id, v_path_title);
            
            RAISE NOTICE 'Badge awarded for path % to user %', v_path_id, NEW.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically award badges
CREATE TRIGGER award_badge_on_path_completion
    AFTER INSERT OR UPDATE ON user_module_progress
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_path_badge();

-- =====================================================
-- Insert Initial Learning Modules Data
-- =====================================================

INSERT INTO learning_modules (id, path_id, path_title, title, description, duration, category, sequence_order) VALUES
-- Communication Fundamentals Path
('mod-1', 'path-1', 'Communication Fundamentals', 'Introduction to Lifestyle Communication', 'Learn the basics of open and honest communication', '15 min', 'Communication', 1),
('mod-2', 'path-1', 'Communication Fundamentals', 'Setting Boundaries', 'Understand how to establish and respect boundaries', '20 min', 'Communication', 2),
('mod-3', 'path-1', 'Communication Fundamentals', 'Consent and Negotiation', 'Essential skills for healthy interactions', '25 min', 'Communication', 3),
('mod-4', 'path-1', 'Communication Fundamentals', 'Difficult Conversations', 'Navigate challenging discussions with confidence', '30 min', 'Communication', 4),
('mod-5', 'path-1', 'Communication Fundamentals', 'Active Listening', 'Enhance your listening skills for deeper connections', '15 min', 'Communication', 5),
('mod-6', 'path-1', 'Communication Fundamentals', 'Communication Mastery', 'Advanced techniques for lifestyle communication', '35 min', 'Communication', 6),

-- Safety & Privacy Path
('mod-7', 'path-2', 'Safety & Privacy', 'Digital Privacy Basics', 'Protect your online identity and information', '20 min', 'Safety', 1),
('mod-8', 'path-2', 'Safety & Privacy', 'Meeting Safely', 'Best practices for safe first meetings', '25 min', 'Safety', 2),
('mod-9', 'path-2', 'Safety & Privacy', 'Red Flags & Warning Signs', 'Identify potentially unsafe situations', '20 min', 'Safety', 3),
('mod-10', 'path-2', 'Safety & Privacy', 'Physical Safety Protocols', 'Essential safety measures for lifestyle encounters', '30 min', 'Safety', 4),
('mod-11', 'path-2', 'Safety & Privacy', 'Community Safety Standards', 'Understanding community guidelines and expectations', '15 min', 'Safety', 5),

-- Relationship Dynamics Path
('mod-12', 'path-3', 'Relationship Dynamics', 'Understanding Relationship Types', 'Explore different relationship structures', '20 min', 'Relationships', 1),
('mod-13', 'path-3', 'Relationship Dynamics', 'Polyamory Fundamentals', 'Introduction to ethical non-monogamy', '30 min', 'Relationships', 2),
('mod-14', 'path-3', 'Relationship Dynamics', 'Managing Jealousy', 'Healthy approaches to complex emotions', '25 min', 'Relationships', 3),
('mod-15', 'path-3', 'Relationship Dynamics', 'Building Trust', 'Foundation of strong lifestyle relationships', '20 min', 'Relationships', 4);

-- =====================================================
-- Helper Views for Quick Queries
-- =====================================================

-- View to see user progress summary by path
CREATE OR REPLACE VIEW user_path_progress_summary AS
SELECT 
    ump.user_id,
    lm.path_id,
    lm.path_title,
    COUNT(*) as total_modules,
    SUM(CASE WHEN ump.status = 'completed' THEN 1 ELSE 0 END) as completed_modules,
    ROUND(AVG(ump.progress_percentage), 2) as avg_progress,
    MAX(ump.updated_at) as last_activity
FROM user_module_progress ump
JOIN learning_modules lm ON ump.module_id = lm.id
GROUP BY ump.user_id, lm.path_id, lm.path_title;

-- =====================================================
-- Utility Functions
-- =====================================================

-- Function to reset user progress (for testing or user request)
CREATE OR REPLACE FUNCTION reset_user_learning_progress(p_user_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM learning_path_badges WHERE user_id = p_user_id;
    DELETE FROM user_module_progress WHERE user_id = p_user_id;
    RAISE NOTICE 'Learning progress reset for user %', p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's overall learning statistics
CREATE OR REPLACE FUNCTION get_user_learning_stats(p_user_id UUID)
RETURNS TABLE (
    total_modules_available INTEGER,
    modules_completed INTEGER,
    modules_in_progress INTEGER,
    total_quiz_attempts INTEGER,
    badges_earned INTEGER,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM learning_modules WHERE is_active = true),
        (SELECT COUNT(*)::INTEGER FROM user_module_progress WHERE user_id = p_user_id AND status = 'completed'),
        (SELECT COUNT(*)::INTEGER FROM user_module_progress WHERE user_id = p_user_id AND status = 'in-progress'),
        (SELECT COALESCE(SUM(quiz_attempts), 0)::INTEGER FROM user_module_progress WHERE user_id = p_user_id),
        (SELECT COUNT(*)::INTEGER FROM learning_path_badges WHERE user_id = p_user_id),
        (SELECT ROUND(
            CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100
            END, 2
        ) FROM user_module_progress WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant Necessary Permissions
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT ON learning_modules TO authenticated;
GRANT ALL ON user_module_progress TO authenticated;
GRANT ALL ON learning_path_badges TO authenticated;

-- Grant access to views
GRANT SELECT ON user_path_progress_summary TO authenticated;

-- =====================================================
-- Schema Complete
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- Make sure to run it as a single transaction
-- =====================================================
