# Profile Setup Enhanced Workflow - Migration Instructions

## Overview
The ProfileSetup.tsx has been completely rewritten to implement the comprehensive workflow you specified with the following steps:

### New Workflow Steps (Individual Accounts):
- **Step 0**: Account Type Selection (Individual vs Couple)
- **Step 1**: Basic Info (Display Name, Location, Gender, Sexuality, Date of Birth)
- **Step 2**: Relationship Context (with dynamic routing for partner alignment/consent)
- **Step 3**: Lifestyle Identity Selection (Swinger, ENM, Poly, BDSM/Kink, Exploring)
- **Step 4**: Deep Relationship Structure (adaptive based on Step 3 selections)
  - ENM/Poly structures
  - Swinger structures
  - BDSM roles
- **Step 5**: Intent (What you're here for)
- **Step 6**: Boundaries (Comfort levels with meeting types and environments)
- **Step 7**: What You're Seeking (Detailed seeking preferences)
- **Step 8**: Who You Want to Meet (with conditional flows for:)
  - Singles (gender preferences)
  - Couples (couple type preferences, interaction style)
  - Groups (group types)
  - Polycules (polycule preferences - 12 options)
- **Step 9**: Role & Kink Preferences (existing enhanced)
- **Step 10**: About Me + Physical Stats
- **Step 11**: Photos (2-10 photos)
- **Step 12**: Match Preferences
- **Step 13**: Membership Selection

### Couples Account Support:
All steps adapted for couples with:
- Partner 1 and Partner 2 separate inputs
- Shared preferences where appropriate
- Individual role selections and preferences for each partner

## Database Migration Required

### IMPORTANT: Run this SQL migration in your Supabase database

Open your Supabase dashboard → SQL Editor → Run this file:

```
/app/ENHANCED_PROFILE_WORKFLOW_MIGRATION.sql
```

This adds the following new columns to the `profiles` table:
- `relationship_context` - User's relationship situation
- `partner_alignment` - Partner awareness/consent confirmations
- `consent_confirmed` - Consent checkbox for married solo users
- `lifestyle_identities` - Community identifications (array)
- `enm_poly_structure` - ENM/Poly relationship structures (array)
- `swinger_structure` - Swinger structures (array)
- `bdsm_roles` - BDSM role selections (array)
- `intent_here_for` - User intentions (array)
- `comfortable_meeting` - Meeting comfort levels (array)
- `comfort_environments` - Environment preferences (array)
- `negotiation_comfort` - BDSM negotiation comfort level
- `autonomy_level` - Poly autonomy level
- `seeking_detailed` - Detailed seeking preferences (array)
- `poly_role` - Preferred poly role if applicable
- `interested_in_genders` - Gender interests (array)
- `interested_in_types` - Types of connections sought (array)
- `couple_pref` - Couple type preferences (array)
- `couple_interaction` - How to interact with couples
- `couple_interaction_genders` - Genders for one-on-one couple interaction (array)
- `singles_genders` - Gender preferences for singles (array)
- `group_types` - Group type preferences (array)
- `polycule_preferences` - Polycule structure preferences (array)

Plus indexes for better query performance.

## What Changed

### Files Modified:
1. ✅ `/app/src/types.ts` - Added all new field types to Profile interface
2. ✅ `/app/src/pages/ProfileSetup.tsx` - Complete rewrite with new workflow
3. ✅ `/app/ENHANCED_PROFILE_WORKFLOW_MIGRATION.sql` - New database migration file

### Files Backed Up:
- `/app/src/pages/ProfileSetup_OLD_BACKUP.tsx` - Original ProfileSetup.tsx

## Testing Instructions

1. **Run the SQL migration first** (see above)
2. Navigate to the profile setup page
3. Test the workflow for both:
   - Individual account type
   - Couple account type
4. Verify all conditional flows work correctly:
   - Partner alignment shows for partnered users
   - Consent check shows for married solo users
   - Deep structure questions show based on lifestyle identity selections
   - "Who You Want to Meet" conditionals work (Singles, Couples, Groups, Polycules)

## Dynamic Routing Features

The workflow includes intelligent dynamic routing:
- **Step 2 (Relationship Context)**: Shows partner alignment questions OR consent check based on selection
- **Step 4 (Deep Structure)**: Only shows relevant structure questions based on Step 3 lifestyle identities
- **Step 6 (Boundaries)**: BDSM users see negotiation comfort, Poly users see autonomy level
- **Step 7 (Seeking)**: Shows poly role selection if "Poly expansion" selected
- **Step 8 (Who to Meet)**: 
  - Singles selection → asks for gender preferences
  - Couples selection → asks for couple types, interaction style, and conditional gender preferences
  - Groups selection → asks for group types
  - Polycules selection → shows 12 detailed polycule preference options

## Key Features

✅ Complete workflow as specified in requirements
✅ All 14 steps implemented (0-13)
✅ Separate flows for Individual and Couples accounts
✅ Dynamic/conditional routing based on user selections
✅ Proper validation at each step
✅ Progress indicator showing completion percentage
✅ Photo upload with preview (2-10 photos required)
✅ Match preferences configuration
✅ Membership tier selection
✅ All existing features preserved (Kink Quiz, Role Selection, Physical Stats, etc.)

## Next Steps

After running the migration and testing:
1. The old workflow file is backed up at `/app/src/pages/ProfileSetup_OLD_BACKUP.tsx`
2. You can delete it once you've confirmed the new workflow works correctly
3. Consider updating any backend API endpoints if they need to handle the new fields
4. Update any profile display pages to show the new rich profile data

## Questions or Issues?

If you encounter any issues:
1. Check the browser console for errors
2. Verify the SQL migration ran successfully
3. Ensure all new database columns were created
4. Test with fresh user accounts to see the complete workflow
