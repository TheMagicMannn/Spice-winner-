-- Create the profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    "accountType" TEXT,
    "displayName" TEXT,
    location TEXT,
    age INTEGER,
    photos TEXT[],
    bio TEXT,
    "relationshipStatus" TEXT,
    seeking TEXT[],
    "seekingRelationshipType" TEXT[],
    "lifestyleExperience" TEXT,
    interests TEXT[],
    kinks TEXT[],
    "softLimits" TEXT[],
    "hardLimits" TEXT[],
    "safetyPractices" TEXT,
    rules TEXT,
    gender TEXT,
    orientation TEXT,
    "displayName2" TEXT,
    gender2 TEXT,
    orientation2 TEXT,
    age2 INTEGER,
    "matchPreferences" JSONB,
    "membershipTier" TEXT DEFAULT 'basic',
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments for clarity
COMMENT ON TABLE public.profiles IS 'Stores user profile data, linked to authentication.';