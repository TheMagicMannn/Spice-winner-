-- =====================================================
-- ADMIN DASHBOARD - Complete Schema
-- =====================================================
-- This schema supports:
-- - Activity logging (messages, likes, logins, matches, upgrades, signups)
-- - User management
-- - Membership tracking
-- - Billing information
-- - Admin operations logging
-- =====================================================

-- =====================================================
-- 1. USER ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'signup', 'login', 'logout', 'profile_update', 
        'message_sent', 'message_received', 'like_sent', 'like_received',
        'match_created', 'match_unmatched', 'membership_upgraded', 'membership_downgraded',
        'payment_made', 'payment_failed', 'subscription_renewed', 'subscription_cancelled',
        'photo_uploaded', 'photo_deleted', 'password_reset', 'email_verified',
        'verification_submitted', 'verification_approved', 'verification_rejected',
        'user_blocked', 'user_unblocked', 'report_submitted', 'admin_action'
    )),
    activity_data JSONB, -- Store additional context (e.g., matched_user_id, amount, etc.)
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity_log(activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_type ON user_activity_log(user_id, activity_type, created_at DESC);

-- =====================================================
-- 2. MEMBERSHIP TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_level TEXT NOT NULL DEFAULT 'free' CHECK (membership_level IN ('free', 'premium', 'vip', 'platinum')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    last_payment_amount DECIMAL(10,2),
    next_billing_date TIMESTAMP WITH TIME ZONE,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_membership_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_level ON user_memberships(membership_level);
CREATE INDEX IF NOT EXISTS idx_membership_expires ON user_memberships(expires_at);
CREATE INDEX IF NOT EXISTS idx_membership_next_billing ON user_memberships(next_billing_date);

-- =====================================================
-- 3. PAYMENT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_method TEXT,
    transaction_id TEXT,
    membership_level TEXT,
    billing_period TEXT, -- 'monthly', 'yearly'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_user ON payment_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_created ON payment_history(created_at DESC);

-- =====================================================
-- 4. ADMIN ACTIONS LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_actions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'user_verified', 'user_rejected', 'user_banned', 'user_unbanned',
        'membership_changed', 'password_reset', 'profile_edited', 'content_removed',
        'report_reviewed', 'email_sent', 'refund_issued', 'other'
    )),
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_details JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions_log(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions_log(action_type, created_at DESC);

-- =====================================================
-- 5. DAILY ACTIVITY REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_activity_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL UNIQUE,
    total_signups INTEGER DEFAULT 0,
    total_logins INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    total_payments DECIMAL(10,2) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_premium_users INTEGER DEFAULT 0,
    report_data JSONB, -- Detailed breakdown
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_daily_report_date ON daily_activity_reports(report_date DESC);

-- =====================================================
-- 6. EMAIL REPORT SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_email_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    email TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    filters JSONB, -- What activities to include
    last_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_email_reports_admin ON admin_email_reports(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_reports_active ON admin_email_reports(is_active, report_type);

-- =====================================================
-- 7. FUNCTIONS FOR ACTIVITY LOGGING
-- =====================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_data JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_log (user_id, activity_type, activity_data, ip_address, user_agent)
    VALUES (p_user_id, p_activity_type, p_activity_data, p_ip_address, p_user_agent)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action_type TEXT,
    p_target_user_id UUID DEFAULT NULL,
    p_action_details JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    action_id UUID;
BEGIN
    INSERT INTO admin_actions_log (admin_id, action_type, target_user_id, action_details, notes)
    VALUES (p_admin_id, p_action_type, p_target_user_id, p_action_details, p_notes)
    RETURNING id INTO action_id;
    
    RETURN action_id;
END;
$$;

-- Function to get activity summary for a date range
CREATE OR REPLACE FUNCTION get_activity_summary(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    activity_type TEXT,
    count BIGINT
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        activity_type,
        COUNT(*) as count
    FROM user_activity_log
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY activity_type
    ORDER BY count DESC;
$$;

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC ACTIVITY LOGGING
-- =====================================================

-- Trigger for login tracking
CREATE OR REPLACE FUNCTION track_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_sign_in_at > OLD.last_sign_in_at OR OLD.last_sign_in_at IS NULL THEN
        PERFORM log_user_activity(
            NEW.id,
            'login',
            jsonb_build_object('email', NEW.email),
            NEW.last_sign_in_ip::inet,
            NULL
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;
CREATE TRIGGER trigger_track_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION track_user_login();

-- =====================================================
-- 9. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_email_reports ENABLE ROW LEVEL SECURITY;

-- Admin can see everything
CREATE POLICY "Admins can view all activity" ON user_activity_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all memberships" ON user_memberships
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all payments" ON payment_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view admin actions" ON admin_actions_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can insert admin actions" ON admin_actions_log
    FOR INSERT
    WITH CHECK (
        admin_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view daily reports" ON daily_activity_reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can manage email reports" ON admin_email_reports
    FOR ALL
    USING (
        admin_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON user_activity_log
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can view own membership" ON user_memberships
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can view own payments" ON payment_history
    FOR SELECT
    USING (user_id = auth.uid());

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_summary TO authenticated;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- Features included:
-- ✓ Activity logging for all user actions
-- ✓ Membership tracking with billing info
-- ✓ Payment history
-- ✓ Admin actions logging
-- ✓ Daily activity reports
-- ✓ Email report subscriptions
-- ✓ Automatic login tracking
-- ✓ RLS policies for security
-- =====================================================
