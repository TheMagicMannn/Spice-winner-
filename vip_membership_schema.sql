-- =====================================================
-- VIP Membership Upgrade Implementation - SQL Schema
-- =====================================================
-- This file contains only the database components needed for VIP membership upgrades

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- Membership tier enum
DO $$ BEGIN
    CREATE TYPE membership_tier AS ENUM ('basic', 'vip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscription status enum
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- ADD COLUMNS TO PROFILES TABLE
-- =====================================================

-- Add VIP membership columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS membership_tier membership_tier DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMPTZ;

-- Create index for membership queries
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_vip_expires ON profiles(vip_expires_at);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================

-- Create subscriptions table matching your existing schema
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier = ANY (ARRAY['basic'::text, 'vip'::text])),
    status TEXT DEFAULT 'pending' CHECK (
        status = ANY (ARRAY['active'::text, 'canceled'::text, 'expired'::text, 'pending'::text])
    ),
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    amount_cents INTEGER,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions USING btree (stripe_subscription_id);

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

-- Function to automatically update profile membership tier when subscription changes
CREATE OR REPLACE FUNCTION update_membership_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile membership tier based on subscription
    IF NEW.status = 'active' AND NEW.tier = 'vip' THEN
        UPDATE profiles
        SET 
            membership_tier = 'vip',
            vip_expires_at = NEW.current_period_end,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    ELSIF NEW.status IN ('canceled', 'expired') OR (NEW.status = 'active' AND NEW.tier = 'basic') THEN
        UPDATE profiles
        SET 
            membership_tier = 'basic',
            vip_expires_at = NULL,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_subscription_change ON subscriptions;
CREATE TRIGGER on_subscription_change
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_membership_tier();

-- Function to automatically downgrade expired VIP memberships
CREATE OR REPLACE FUNCTION check_expired_vip_memberships()
RETURNS void AS $$
BEGIN
    -- Downgrade users whose VIP has expired
    UPDATE profiles
    SET membership_tier = 'basic'
    WHERE membership_tier = 'vip'
        AND vip_expires_at IS NOT NULL
        AND vip_expires_at < NOW();
    
    -- Update expired subscriptions
    UPDATE subscriptions
    SET status = 'expired'
    WHERE status = 'active'
        AND current_period_end < NOW()
        AND cancel_at_period_end = FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    tier TEXT,
    status TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    amount_cents INTEGER,
    currency TEXT,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.tier,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.amount_cents,
        s.currency,
        s.stripe_subscription_id,
        s.stripe_customer_id
    FROM subscriptions s
    WHERE s.user_id = user_id_param
        AND s.status IN ('active', 'canceled', 'pending')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or upgrade subscription
CREATE OR REPLACE FUNCTION create_vip_subscription(
    user_id_param UUID,
    tier_param TEXT DEFAULT 'vip',
    period_months INTEGER DEFAULT 1,
    amount_cents_param INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    subscription_id UUID;
    period_start TIMESTAMPTZ := NOW();
    period_end TIMESTAMPTZ;
    amount INTEGER;
BEGIN
    -- Calculate period end and amount based on period
    IF period_months = 12 THEN
        period_end := period_start + INTERVAL '1 year';
        amount := COALESCE(amount_cents_param, 14999); -- $149.99
    ELSE
        period_end := period_start + (period_months || ' months')::INTERVAL;
        amount := COALESCE(amount_cents_param, 1699); -- $16.99
    END IF;
    
    -- Cancel any existing active subscriptions
    UPDATE subscriptions
    SET status = 'canceled',
        updated_at = NOW()
    WHERE user_id = user_id_param
        AND status = 'active';
    
    -- Create new subscription
    INSERT INTO subscriptions (
        user_id,
        tier,
        status,
        current_period_start,
        current_period_end,
        amount_cents,
        currency
    ) VALUES (
        user_id_param,
        tier_param,
        'active',
        period_start,
        period_end,
        amount,
        'USD'
    )
    RETURNING id INTO subscription_id;
    
    -- Profile will be updated automatically by trigger
    
    RETURN subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel subscription
CREATE OR REPLACE FUNCTION cancel_vip_subscription(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_record RECORD;
BEGIN
    -- Get active subscription
    SELECT * INTO subscription_record
    FROM subscriptions
    WHERE user_id = user_id_param
        AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF subscription_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Cancel subscription (user keeps access until period end)
    UPDATE subscriptions
    SET 
        status = 'canceled',
        updated_at = NOW()
    WHERE id = subscription_record.id;
    
    -- Note: User will retain VIP access until current_period_end
    -- The check_expired_vip_memberships function will downgrade them after expiry
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reactivate cancelled subscription
CREATE OR REPLACE FUNCTION reactivate_vip_subscription(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_record RECORD;
BEGIN
    -- Get cancelled subscription that hasn't expired yet
    SELECT * INTO subscription_record
    FROM subscriptions
    WHERE user_id = user_id_param
        AND status = 'canceled'
        AND current_period_end > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF subscription_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Reactivate subscription
    UPDATE subscriptions
    SET 
        status = 'active',
        updated_at = NOW()
    WHERE id = subscription_record.id;
    
    -- Profile will be updated automatically by trigger
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (for service/function use)
CREATE POLICY "Users can insert own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can view all subscriptions (optional)
CREATE POLICY "Admins can view all subscriptions"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- SCHEDULED JOBS (Run via pg_cron or external scheduler)
-- =====================================================

-- Note: Run this function daily to check for expired memberships
-- If using pg_cron extension:
/*
SELECT cron.schedule(
    'check-expired-vip',
    '0 0 * * *', -- Every day at midnight
    'SELECT check_expired_vip_memberships();'
);
*/

-- Alternative: Call from your application daily or use Supabase Edge Functions

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION create_vip_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_vip_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_vip_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION check_expired_vip_memberships TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify subscriptions table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'subscriptions'
    ) THEN
        RAISE NOTICE '✓ Subscriptions table created successfully';
    ELSE
        RAISE NOTICE '✗ Subscriptions table creation failed';
    END IF;
END $$;

-- Verify profiles columns exist
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'membership_tier'
    ) THEN
        RAISE NOTICE '✓ Profiles.membership_tier column exists';
    ELSE
        RAISE NOTICE '✗ Profiles.membership_tier column missing';
    END IF;
    
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'vip_expires_at'
    ) THEN
        RAISE NOTICE '✓ Profiles.vip_expires_at column exists';
    ELSE
        RAISE NOTICE '✗ Profiles.vip_expires_at column missing';
    END IF;
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE tablename = 'subscriptions' AND rowsecurity = TRUE
    ) THEN
        RAISE NOTICE '✓ RLS enabled on subscriptions table';
    ELSE
        RAISE NOTICE '✗ RLS not enabled on subscriptions table';
    END IF;
END $$;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

/*
-- Example 1: Create a monthly VIP subscription ($16.99)
SELECT create_vip_subscription(
    'user-uuid-here',  -- user_id
    'vip',             -- tier
    1,                 -- period_months
    1699               -- amount_cents (optional, defaults to 1699)
);

-- Example 2: Create an annual VIP subscription ($149.99)
SELECT create_vip_subscription(
    'user-uuid-here',  -- user_id
    'vip',             -- tier
    12,                -- period_months
    14999              -- amount_cents (optional, defaults to 14999)
);

-- Example 3: Get user's active subscription
SELECT * FROM get_user_subscription('user-uuid-here');

-- Example 4: Cancel a subscription (user keeps VIP until period end)
SELECT cancel_vip_subscription('user-uuid-here');

-- Example 5: Reactivate a cancelled subscription
SELECT reactivate_vip_subscription('user-uuid-here');

-- Example 6: Check for expired memberships (run daily)
SELECT check_expired_vip_memberships();

-- Example 7: View all active VIP users
SELECT id, display_name, membership_tier, vip_expires_at
FROM profiles
WHERE membership_tier = 'vip'
ORDER BY vip_expires_at DESC;

-- Example 8: View subscription history for a user
SELECT 
    tier,
    status,
    current_period_start,
    current_period_end,
    amount_cents,
    currency
FROM subscriptions
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;

-- Example 9: Create subscription with Stripe IDs (after Stripe checkout)
INSERT INTO subscriptions (
    user_id,
    tier,
    status,
    stripe_subscription_id,
    stripe_customer_id,
    current_period_start,
    current_period_end,
    amount_cents,
    currency
) VALUES (
    'user-uuid-here',
    'vip',
    'active',
    'sub_stripe_id',
    'cus_stripe_id',
    NOW(),
    NOW() + INTERVAL '1 month',
    1699,
    'USD'
);
-- Note: The trigger will automatically update the profile to VIP tier
*/

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

RAISE NOTICE '==========================================';
RAISE NOTICE 'VIP Membership Schema Installation Complete!';
RAISE NOTICE '==========================================';
RAISE NOTICE 'Created:';
RAISE NOTICE '  - Subscriptions table';
RAISE NOTICE '  - VIP columns in profiles table';
RAISE NOTICE '  - 5 RPC functions';
RAISE NOTICE '  - 4 RLS policies';
RAISE NOTICE '  - 6 indexes';
RAISE NOTICE '  - 1 trigger';
RAISE NOTICE '==========================================';
RAISE NOTICE 'Next Steps:';
RAISE NOTICE '  1. Set up daily cron job for check_expired_vip_memberships()';
RAISE NOTICE '  2. Configure Stripe webhooks (optional)';
RAISE NOTICE '  3. Test subscription flow in your app';
RAISE NOTICE '==========================================';
