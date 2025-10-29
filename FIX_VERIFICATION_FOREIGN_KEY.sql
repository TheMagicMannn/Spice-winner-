-- =====================================================
-- FIX: Add Foreign Key from verification_requests to profiles
-- =====================================================
-- This fixes the 400 error when fetching verification requests with profile data
-- 
-- Problem: verification_requests.user_id references auth.users(id)
--          profiles.id also references auth.users(id)
--          But no direct FK exists between verification_requests and profiles
--
-- Solution: Add FK constraint so PostgREST can join these tables
-- =====================================================

-- Step 1: Drop the constraint if it already exists (makes this script idempotent)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'fk_verification_requests_profiles'
    ) THEN
        ALTER TABLE verification_requests 
        DROP CONSTRAINT fk_verification_requests_profiles;
        RAISE NOTICE 'Dropped existing fk_verification_requests_profiles constraint';
    END IF;
END $$;

-- Step 2: Add the foreign key constraint
-- This creates a direct relationship from verification_requests to profiles
ALTER TABLE verification_requests 
ADD CONSTRAINT fk_verification_requests_profiles 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 3: Verify the constraint was created
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'fk_verification_requests_profiles'
    ) THEN
        RAISE NOTICE '✓ Foreign key constraint created successfully!';
        RAISE NOTICE '✓ PostgREST can now join verification_requests with profiles';
    ELSE
        RAISE EXCEPTION '✗ Failed to create foreign key constraint';
    END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- After running this migration, the following query should work:
--
-- SELECT * FROM verification_requests 
-- JOIN profiles ON verification_requests.user_id = profiles.id;
--
-- PostgREST syntax (used in frontend):
-- /verification_requests?select=*,profiles:user_id(display_name,display_name2,account_type,photos)
-- =====================================================

COMMENT ON CONSTRAINT fk_verification_requests_profiles ON verification_requests IS 
'Foreign key to profiles table - enables PostgREST joins for admin verification panel';
