-- =====================================================
-- SPICE APP - VERIFICATION SYSTEM
-- =====================================================
-- This SQL file sets up the complete verification system including:
-- 1. Verification requests table
-- 2. Admin role system
-- 3. Storage buckets for verification uploads
-- 4. RLS policies for security
-- 5. Triggers for auto-updating verification status
-- 6. Edge functions for verification workflow
-- =====================================================

-- =====================================================
-- 1. CREATE VERIFICATION TYPES
-- =====================================================

-- Verification method types
CREATE TYPE verification_method AS ENUM ('selfie', 'fetlife');

-- Verification status types
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');

-- =====================================================
-- 2. ADD ADMIN ROLE TO PROFILES
-- =====================================================

-- Add is_admin column to profiles table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);
    END IF;
END $$;

-- =====================================================
-- 3. CREATE VERIFICATION REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Verification method
    method verification_method NOT NULL,
    status verification_status DEFAULT 'pending' NOT NULL,
    
    -- Request details for Individual accounts
    email TEXT NOT NULL, -- Email used for verification (must match signup email)
    selfie_photo_url TEXT, -- URL to uploaded selfie photo
    verification_date DATE, -- Date written on paper for selfie method
    
    -- FetLife verification details
    fetlife_profile_url TEXT, -- FetLife profile URL
    fetlife_screenshot_url TEXT, -- Screenshot of logged-in FetLife profile
    
    -- Couple account - Partner 2 details
    partner2_email TEXT, -- Partner 2 email for couple accounts
    partner2_selfie_photo_url TEXT, -- Partner 2 selfie photo
    partner2_fetlife_profile_url TEXT, -- Partner 2 FetLife URL
    partner2_fetlife_screenshot_url TEXT, -- Partner 2 FetLife screenshot
    
    -- Admin review
    reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT, -- Admin's notes about the verification
    rejection_reason TEXT, -- Reason for rejection if rejected
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_selfie_data CHECK (
        method != 'selfie' OR (
            selfie_photo_url IS NOT NULL AND
            verification_date IS NOT NULL
        )
    ),
    CONSTRAINT valid_fetlife_data CHECK (
        method != 'fetlife' OR (
            fetlife_profile_url IS NOT NULL AND
            fetlife_screenshot_url IS NOT NULL
        )
    )
);

-- Create indexes for performance
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_method ON verification_requests(method);
CREATE INDEX idx_verification_requests_created_at ON verification_requests(created_at DESC);

-- =====================================================
-- 4. CREATE VERIFICATION HISTORY TABLE
-- =====================================================
-- Track all verification attempts and status changes

CREATE TABLE IF NOT EXISTS verification_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    verification_request_id UUID REFERENCES verification_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Status change
    old_status verification_status,
    new_status verification_status NOT NULL,
    
    -- Changed by
    changed_by UUID REFERENCES auth.users(id), -- Admin who made the change
    change_reason TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verification_history_request_id ON verification_history(verification_request_id);
CREATE INDEX idx_verification_history_user_id ON verification_history(user_id);

-- =====================================================
-- 5. CREATE STORAGE BUCKET FOR VERIFICATION UPLOADS
-- =====================================================

-- Create private storage bucket for verification uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'verification-uploads', 
    'verification-uploads', 
    false, -- Private bucket
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- =====================================================
-- 6. STORAGE POLICIES - VERIFICATION UPLOADS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload verification files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view verification files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete verification files" ON storage.objects;

-- Users can upload their own verification files
CREATE POLICY "Users can upload verification files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'verification-uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can view their own verification files
CREATE POLICY "Users can view their own verification files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Admins can view all verification files
CREATE POLICY "Admins can view verification files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'verification-uploads'
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Admins can delete verification files (for cleanup)
CREATE POLICY "Admins can delete verification files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'verification-uploads'
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- =====================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on verification tables
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can create verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can update their pending requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can view their verification history" ON verification_history;
DROP POLICY IF EXISTS "Admins can view all verification history" ON verification_history;

-- VERIFICATION REQUESTS POLICIES

-- Users can view their own verification requests
CREATE POLICY "Users can view their own verification requests"
    ON verification_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create verification requests (only if no pending request exists)
CREATE POLICY "Users can create verification requests"
    ON verification_requests FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM verification_requests 
            WHERE user_id = auth.uid() 
            AND status = 'pending'
        )
    );

-- Users can update their own pending requests (before admin review)
CREATE POLICY "Users can update their pending requests"
    ON verification_requests FOR UPDATE
    USING (
        auth.uid() = user_id 
        AND status = 'pending'
    );

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
    ON verification_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Admins can update any verification request
CREATE POLICY "Admins can update verification requests"
    ON verification_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- VERIFICATION HISTORY POLICIES

-- Users can view their own verification history
CREATE POLICY "Users can view their verification history"
    ON verification_history FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all verification history
CREATE POLICY "Admins can view all verification history"
    ON verification_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- System can insert history records (via triggers)
CREATE POLICY "System can insert verification history"
    ON verification_history FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 8. FUNCTIONS
-- =====================================================

-- Function to update verification status and profile
CREATE OR REPLACE FUNCTION update_profile_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update profile when status changes to 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE profiles
        SET 
            is_verified = true,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Log in history
        INSERT INTO verification_history (
            verification_request_id,
            user_id,
            old_status,
            new_status,
            changed_by,
            change_reason
        ) VALUES (
            NEW.id,
            NEW.user_id,
            OLD.status,
            NEW.status,
            NEW.reviewed_by,
            'Verification approved by admin'
        );
    END IF;
    
    -- Remove verification if rejected
    IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        UPDATE profiles
        SET 
            is_verified = false,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Log in history
        INSERT INTO verification_history (
            verification_request_id,
            user_id,
            old_status,
            new_status,
            changed_by,
            change_reason
        ) VALUES (
            NEW.id,
            NEW.user_id,
            OLD.status,
            NEW.status,
            NEW.reviewed_by,
            COALESCE(NEW.rejection_reason, 'Verification rejected by admin')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate couple account verification
CREATE OR REPLACE FUNCTION validate_couple_verification()
RETURNS TRIGGER AS $$
DECLARE
    account_type_val account_type;
BEGIN
    -- Get account type
    SELECT p.account_type INTO account_type_val
    FROM profiles p
    WHERE p.id = NEW.user_id;
    
    -- If couple account, ensure partner 2 data is provided
    IF account_type_val = 'couple' THEN
        IF NEW.method = 'selfie' AND (
            NEW.partner2_email IS NULL OR 
            NEW.partner2_selfie_photo_url IS NULL
        ) THEN
            RAISE EXCEPTION 'Couple accounts must provide verification for both partners (selfie method)';
        END IF;
        
        IF NEW.method = 'fetlife' AND (
            NEW.partner2_email IS NULL OR
            NEW.partner2_fetlife_profile_url IS NULL OR
            NEW.partner2_fetlife_screenshot_url IS NULL
        ) THEN
            RAISE EXCEPTION 'Couple accounts must provide FetLife verification for both partners';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Trigger to update profile verification status
DROP TRIGGER IF EXISTS on_verification_status_change ON verification_requests;
CREATE TRIGGER on_verification_status_change
    AFTER UPDATE ON verification_requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_profile_verification_status();

-- Trigger to validate couple account verification
DROP TRIGGER IF EXISTS validate_couple_verification_trigger ON verification_requests;
CREATE TRIGGER validate_couple_verification_trigger
    BEFORE INSERT OR UPDATE ON verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION validate_couple_verification();

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON verification_requests;
CREATE TRIGGER update_verification_requests_updated_at
    BEFORE UPDATE ON verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. HELPER VIEWS
-- =====================================================

-- View for pending verification requests (admin use)
CREATE OR REPLACE VIEW pending_verifications AS
SELECT 
    vr.*,
    p.display_name,
    p.display_name2,
    p.account_type,
    p.email as profile_email,
    p.photos,
    au.email as user_email
FROM verification_requests vr
JOIN profiles p ON vr.user_id = p.id
JOIN auth.users au ON vr.user_id = au.id
WHERE vr.status = 'pending'
ORDER BY vr.created_at ASC;

-- View for verification statistics
CREATE OR REPLACE VIEW verification_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE status = 'under_review') as under_review_count,
    COUNT(*) FILTER (WHERE method = 'selfie') as selfie_count,
    COUNT(*) FILTER (WHERE method = 'fetlife') as fetlife_count,
    AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))/3600) FILTER (WHERE reviewed_at IS NOT NULL) as avg_review_time_hours
FROM verification_requests;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON verification_requests TO authenticated;
GRANT SELECT ON verification_history TO authenticated;
GRANT SELECT ON pending_verifications TO authenticated;

-- =====================================================
-- 12. SAMPLE ADMIN USER (OPTIONAL - FOR TESTING)
-- =====================================================
-- Uncomment and modify the user_id to make a user an admin

-- UPDATE profiles 
-- SET is_admin = true 
-- WHERE id = 'YOUR_USER_ID_HERE';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICATION SYSTEM SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - verification_requests table';
    RAISE NOTICE '  - verification_history table';
    RAISE NOTICE '  - verification-uploads storage bucket';
    RAISE NOTICE '  - Admin role system (is_admin column)';
    RAISE NOTICE '  - RLS policies for security';
    RAISE NOTICE '  - Triggers for auto-verification';
    RAISE NOTICE '  - Helper views for admin panel';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Update a user to admin: UPDATE profiles SET is_admin = true WHERE id = ''USER_ID'';';
    RAISE NOTICE '  2. Deploy frontend components for verification submission';
    RAISE NOTICE '  3. Deploy admin panel for verification review';
    RAISE NOTICE '========================================';
END $$;
