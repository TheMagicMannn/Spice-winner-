# Database Migration Instructions for SPICE Profile Setup

## What This Migration Does
This migration adds all the necessary database columns to support the comprehensive 14-step profile setup workflow for both Individual and Couples accounts.

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/app/SPICE_PROFILE_SETUP_COMPLETE_MIGRATION.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

## Fields Added by This Migration

### New Profile Workflow Fields
- `relationship_context` - User's relationship situation
- `lifestyle_identities` - Selected lifestyle communities (Swinger, ENM, Poly, BDSM, etc.)
- `enm_poly_structure`, `swinger_structure`, `bdsm_roles` - Detailed structure preferences
- `intent_here_for` - What user is looking for on the platform
- `comfortable_meeting`, `comfort_environments` - Boundary preferences
- `seeking_detailed`, `poly_role` - Enhanced seeking options
- `interested_in_types`, `couple_pref`, `singles_genders`, etc. - Who they want to meet

### Couples Account Support
- `display_name_2`, `age_2`, `gender_2`, `orientation_2` - Partner 2 basic info
- `partner1_*` and `partner2_*` fields - Individual stats for each partner
- Role/kink preferences for both partners
- Physical stats for both partners

### Performance Indexes
- Indexes on frequently queried fields for fast filtering and matching

## Verification
After applying the migration, you can verify it worked by running this query in SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
  'relationship_context',
  'lifestyle_identities',
  'interested_in_types',
  'seeking_detailed'
)
ORDER BY column_name;
```

You should see all 4 columns listed.

## Storage Bucket Setup
The migration also ensures the `profile-photos` storage bucket exists. Verify it's configured:

1. Go to **Storage** in Supabase dashboard
2. Check that `profile-photos` bucket exists
3. Verify it's set to **Public**
4. Check the RLS policies allow authenticated users to upload their own photos

## Next Steps After Migration
Once the migration is applied:
1. The frontend will be able to save all profile fields
2. The backend API will transform and persist data correctly
3. Full testing of the 14-step workflow can proceed
