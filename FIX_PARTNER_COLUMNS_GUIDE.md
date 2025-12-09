# Fix: Missing Partner Columns Error

## Problem
Error: `Could not find the 'partner1_experience' column of 'profiles' in the schema cache`

This error occurs when trying to save a couple profile because the database is missing columns for partner-specific data.

---

## Solution

Run the SQL migration to add all missing partner columns to the profiles table.

### Quick Fix (Run This SQL)

**File**: `/app/ADD_ALL_MISSING_COUPLE_COLUMNS.sql`

**How to Apply**:

1. **Via Supabase Dashboard**:
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Copy the contents of `ADD_ALL_MISSING_COUPLE_COLUMNS.sql`
   - Paste and run the SQL

2. **Via Command Line** (if you have direct DB access):
   ```bash
   psql -h your-db-host -U your-user -d your-database -f ADD_ALL_MISSING_COUPLE_COLUMNS.sql
   ```

3. **Via Supabase CLI**:
   ```bash
   supabase db push
   ```

---

## What Gets Added

The migration adds **60+ columns** for couple profiles:

### Partner Experience & Roles
- `partner1_experience`, `partner2_experience`
- `partner1_role`, `partner2_role`
- `partner1_quiz_results`, `partner2_quiz_results` (JSONB)

### Partner Kinks & Limits
- `partner1_kinks[]`, `partner2_kinks[]`
- `partner1_soft_limits[]`, `partner2_soft_limits[]`
- `partner1_hard_limits[]`, `partner2_hard_limits[]`

### Partner Safety & Rules
- `partner1_safety_practices`, `partner2_safety_practices`
- `partner1_rules`, `partner2_rules`

### Partner 1 Physical Stats (19 fields)
- Height, weight, body type
- Hair color, eye color, facial hair
- Ethnicity, smoking, drinking habits
- Tattoos, piercings, body hair
- Grooming style, birth control
- STI test info, hosting capability
- Latex allergy

### Partner 2 Physical Stats (19 fields)
- Same as Partner 1 with `partner2_` prefix

---

## Verification

After running the migration, verify it worked:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE 'partner%'
ORDER BY column_name;
```

You should see 60+ partner columns listed.

---

## Why This Happened

The ProfileSetup.tsx sends comprehensive partner data for couple accounts, but the database schema was missing these columns. The original schema only had basic couple fields.

### What ProfileSetup.tsx Sends for Couples:
```typescript
{
  // Basic couple info
  displayName: "Partner 1 Name",
  displayName2: "Partner 2 Name",
  
  // Partner 1 detailed info
  partner1Role: "Dominant",
  partner1Experience: "Moderate",
  partner1Kinks: ["BDSM", "Roleplay", ...],
  partner1Height: "5'10\"",
  // ... 30+ more Partner 1 fields
  
  // Partner 2 detailed info  
  partner2Role: "Submissive",
  partner2Experience: "Beginner",
  partner2Kinks: ["Bondage", "Spanking", ...],
  partner2Height: "5'6\"",
  // ... 30+ more Partner 2 fields
}
```

### What Database Had:
- Basic profile fields (name, bio, location)
- Individual fields (height, weight, etc.)
- **Missing**: All partner1_* and partner2_* specific fields

---

## Alternative: Minimal Fix

If you only want to fix the immediate error without adding all columns:

```sql
-- Minimal fix - just add the two causing the error
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner1_experience TEXT DEFAULT 'New';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner2_experience TEXT DEFAULT 'New';
```

**Warning**: This will only fix the current error. You'll get more errors as users fill out other couple fields.

---

## Recommended: Full Fix

Run the complete migration (`ADD_ALL_MISSING_COUPLE_COLUMNS.sql`) to add all 60+ partner columns at once. This prevents future errors when users complete their couple profiles.

---

## After Applying Migration

1. ✅ Couple account creation will work
2. ✅ All Step 2 partner role/experience fields will save
3. ✅ All Step 3 partner physical stats will save
4. ✅ Partner kinks, limits, rules will save
5. ✅ No more "column not found" errors

---

## Testing

After applying the migration:

1. **Test Individual Account**: Should work as before
2. **Test Couple Account**: 
   - Create new couple account
   - Fill out Step 1 (both partners' basic info)
   - Fill out Step 2 (both partners' roles & kinks)
   - Fill out Step 3 (both partners' physical stats)
   - Submit profile
   - Should save successfully ✅

---

## Files Created

1. **ADD_PARTNER_EXPERIENCE_COLUMNS.sql** - Minimal fix (2 columns)
2. **ADD_ALL_MISSING_COUPLE_COLUMNS.sql** - Complete fix (60+ columns) ✅ RECOMMENDED
3. **FIX_PARTNER_COLUMNS_GUIDE.md** - This guide

---

## Summary

**Problem**: Database missing partner columns  
**Solution**: Run `ADD_ALL_MISSING_COUPLE_COLUMNS.sql`  
**Result**: Couple profiles work completely

Apply the migration and your couple account creation will work perfectly!
