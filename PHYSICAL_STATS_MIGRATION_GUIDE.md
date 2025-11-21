# Physical Stats Database Migration Guide

## Overview
This migration adds all physical stats fields to the `profiles` table to match the fields available in `EditProfileModal.tsx` and `UserProfile.tsx`.

## What's Being Added

### Individual Account Fields (19 new columns)

#### Physical Appearance
- `height` - TEXT - User's height (e.g., "5'10\"")
- `weight` - TEXT - User's weight (e.g., "160 lbs")
- `body_type` - TEXT - Body type with CHECK constraint (Slim, Average, Athletic, etc.)
- `hair_color` - TEXT - Hair color with CHECK constraint
- `eye_color` - TEXT - Eye color with CHECK constraint
- `facial_hair` - TEXT - Facial hair style with CHECK constraint
- `ethnicity` - TEXT - Ethnic background with CHECK constraint
- `body_hair` - TEXT - Body hair description with CHECK constraint
- `grooming_style` - TEXT - Grooming preferences with CHECK constraint
- `tattoos` - BOOLEAN - Has tattoos (default: FALSE)
- `piercings` - BOOLEAN - Has piercings (default: FALSE)

#### Lifestyle
- `cigarette_smoker` - TEXT - Smoking status (Yes/No)
- `alcohol_drinker` - TEXT - Drinking status (Yes/No)
- `marijuana_user` - TEXT - Marijuana use status (Yes/No)

#### Health & Safety
- `birth_control` - TEXT - Birth control usage (Yes/No/Sometimes/Prefer not to say)
- `latex_allergy` - BOOLEAN - Has latex allergy (default: FALSE)
- `last_sti_test_date` - DATE - Date of last STI test
- `sti_positive_results` - TEXT - STI test results (Negative/Positive/Prefer not to say)
- `can_host` - TEXT - Can host meetups (Yes/No/Possibly)

### Couple Account - Partner 1 Fields (12 new columns)
- `partner1_height` - TEXT
- `partner1_weight` - TEXT
- `partner1_body_type` - TEXT with CHECK constraint
- `partner1_hair_color` - TEXT with CHECK constraint
- `partner1_eye_color` - TEXT with CHECK constraint
- `partner1_facial_hair` - TEXT with CHECK constraint
- `partner1_ethnicity` - TEXT with CHECK constraint
- `partner1_tattoos` - BOOLEAN
- `partner1_piercings` - BOOLEAN
- `partner1_cigarette_smoker` - TEXT (Yes/No)
- `partner1_alcohol_drinker` - TEXT (Yes/No)
- `partner1_marijuana_user` - TEXT (Yes/No)

### Couple Account - Partner 2 Fields (12 new columns)
- `partner2_height` - TEXT
- `partner2_weight` - TEXT
- `partner2_body_type` - TEXT with CHECK constraint
- `partner2_hair_color` - TEXT with CHECK constraint
- `partner2_eye_color` - TEXT with CHECK constraint
- `partner2_facial_hair` - TEXT with CHECK constraint
- `partner2_ethnicity` - TEXT with CHECK constraint
- `partner2_tattoos` - BOOLEAN
- `partner2_piercings` - BOOLEAN
- `partner2_cigarette_smoker` - TEXT (Yes/No)
- `partner2_alcohol_drinker` - TEXT (Yes/No)
- `partner2_marijuana_user` - TEXT (Yes/No)

**Total: 43 new columns**

## How to Run the Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `ADD_PHYSICAL_STATS_COLUMNS.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute

### Option 2: Via Supabase CLI
```bash
supabase db push
```

### Option 3: Manual Execution
If you're connecting directly to your PostgreSQL database:
```bash
psql -h [your-host] -U [your-user] -d [your-database] -f ADD_PHYSICAL_STATS_COLUMNS.sql
```

## Verification

After running the migration, verify the columns were added:

```sql
-- Check all new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'height', 'weight', 'body_type', 'hair_color', 'eye_color',
    'partner1_height', 'partner2_height'
  )
ORDER BY column_name;

-- Count total columns in profiles table
SELECT COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'profiles';
```

## Field Name Mapping

The database uses `snake_case` while the frontend uses `camelCase`. Here's the mapping:

| Frontend (camelCase) | Database (snake_case) |
|---------------------|----------------------|
| `bodyType` | `body_type` |
| `hairColor` | `hair_color` |
| `eyeColor` | `eye_color` |
| `facialHair` | `facial_hair` |
| `bodyHair` | `body_hair` |
| `groomingStyle` | `grooming_style` |
| `cigaretteSmoker` | `cigarette_smoker` |
| `alcoholDrinker` | `alcohol_drinker` |
| `marijuanaUser` | `marijuana_user` |
| `birthControl` | `birth_control` |
| `latexAllergy` | `latex_allergy` |
| `lastSTITestDate` | `last_sti_test_date` |
| `stiPositiveResults` | `sti_positive_results` |
| `canHost` | `can_host` |
| `partner1Height` | `partner1_height` |
| `partner2BodyType` | `partner2_body_type` |
| etc. | etc. |

## Data Validation

All fields with predefined values have CHECK constraints to ensure data integrity:

### Body Type Options
- Slim, Average, Athletic, Muscular, Curvy, Dad Bod, Thick, BBW, Fit, Petite, Heavyset

### Hair Color Options
- Black, Brown, Blonde, Red, Auburn, Gray, White, Salt and Pepper, Bald, Other

### Eye Color Options
- Brown, Blue, Green, Hazel, Gray, Amber, Other

### Facial Hair Options
- Clean Shaven, Stubble, Goatee, Beard, Mustache, Full Beard, Doesn't Apply

### Ethnicity Options
- Asian, Black/African, Caucasian/White, Hispanic/Latino, Middle Eastern, Native American, Pacific Islander, Mixed/Multiracial, Other, Prefer not to say

### Body Hair Options
- None, Light, Moderate, Heavy, Trimmed, Natural

### Grooming Style Options
- Natural, Trimmed, Shaved, Waxed, Prefer not to say

### Yes/No Fields
- cigarette_smoker, alcohol_drinker, marijuana_user (and partner variants)

### Birth Control Options
- Yes, No, Sometimes, Prefer not to say

### STI Test Results Options
- Negative, Positive, Prefer not to say

### Can Host Options
- Yes, No, Possibly

## Performance Optimizations

The migration includes indexes for commonly filtered fields:
- `idx_profiles_body_type` - Index on body_type
- `idx_profiles_ethnicity` - Index on ethnicity
- `idx_profiles_tattoos` - Index on tattoos (filtered for TRUE values)
- `idx_profiles_piercings` - Index on piercings (filtered for TRUE values)

## Backward Compatibility

✅ All new columns are **optional** (nullable)
✅ Existing profiles will continue to work without these fields
✅ No data loss or breaking changes
✅ Frontend gracefully handles missing data

## Rollback Plan

If you need to rollback this migration:

```sql
-- WARNING: This will permanently delete all data in these columns
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS height,
  DROP COLUMN IF EXISTS weight,
  DROP COLUMN IF EXISTS body_type,
  DROP COLUMN IF EXISTS hair_color,
  DROP COLUMN IF EXISTS eye_color,
  DROP COLUMN IF EXISTS facial_hair,
  DROP COLUMN IF EXISTS ethnicity,
  DROP COLUMN IF EXISTS body_hair,
  DROP COLUMN IF EXISTS grooming_style,
  DROP COLUMN IF EXISTS tattoos,
  DROP COLUMN IF EXISTS piercings,
  DROP COLUMN IF EXISTS cigarette_smoker,
  DROP COLUMN IF EXISTS alcohol_drinker,
  DROP COLUMN IF EXISTS marijuana_user,
  DROP COLUMN IF EXISTS birth_control,
  DROP COLUMN IF EXISTS latex_allergy,
  DROP COLUMN IF EXISTS last_sti_test_date,
  DROP COLUMN IF EXISTS sti_positive_results,
  DROP COLUMN IF EXISTS can_host,
  DROP COLUMN IF EXISTS partner1_height,
  DROP COLUMN IF EXISTS partner1_weight,
  DROP COLUMN IF EXISTS partner1_body_type,
  DROP COLUMN IF EXISTS partner1_hair_color,
  DROP COLUMN IF EXISTS partner1_eye_color,
  DROP COLUMN IF EXISTS partner1_facial_hair,
  DROP COLUMN IF EXISTS partner1_ethnicity,
  DROP COLUMN IF EXISTS partner1_tattoos,
  DROP COLUMN IF EXISTS partner1_piercings,
  DROP COLUMN IF EXISTS partner1_cigarette_smoker,
  DROP COLUMN IF EXISTS partner1_alcohol_drinker,
  DROP COLUMN IF EXISTS partner1_marijuana_user,
  DROP COLUMN IF EXISTS partner2_height,
  DROP COLUMN IF EXISTS partner2_weight,
  DROP COLUMN IF EXISTS partner2_body_type,
  DROP COLUMN IF EXISTS partner2_hair_color,
  DROP COLUMN IF EXISTS partner2_eye_color,
  DROP COLUMN IF EXISTS partner2_facial_hair,
  DROP COLUMN IF EXISTS partner2_ethnicity,
  DROP COLUMN IF EXISTS partner2_tattoos,
  DROP COLUMN IF EXISTS partner2_piercings,
  DROP COLUMN IF EXISTS partner2_cigarette_smoker,
  DROP COLUMN IF EXISTS partner2_alcohol_drinker,
  DROP COLUMN IF EXISTS partner2_marijuana_user;

-- Drop indexes
DROP INDEX IF EXISTS idx_profiles_body_type;
DROP INDEX IF EXISTS idx_profiles_ethnicity;
DROP INDEX IF EXISTS idx_profiles_tattoos;
DROP INDEX IF EXISTS idx_profiles_piercings;
```

## Testing Recommendations

After migration, test:

1. ✅ Create new individual profile with physical stats
2. ✅ Create new couple profile with Partner 1 & 2 stats
3. ✅ Edit existing profile to add physical stats
4. ✅ View UserProfile page with new stats displayed
5. ✅ Filter/search by physical attributes (if implemented)
6. ✅ Verify data validation (try invalid values)

## Next Steps

1. Run the migration in your Supabase database
2. Test the EditProfileModal with the new fields
3. Verify UserProfile displays the data correctly
4. Consider adding search/filter functionality based on these new fields
5. Update any API documentation to include the new fields

## Support

If you encounter any issues:
- Check Supabase logs for error messages
- Verify column names match exactly (case-sensitive)
- Ensure CHECK constraints are compatible with your data
- Test with sample data before production deployment
