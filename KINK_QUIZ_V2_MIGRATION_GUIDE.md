# Kink Quiz V2 Migration Guide

## Overview
This guide covers migrating from the original quiz (V1) to the corrected quiz (V2) with accurate category mappings.

---

## What Changed?

### V1 (Original) Issues:
- ❌ 18 out of 25 categories had incorrect statement mappings
- ❌ Dominant statements in submissive categories (and vice versa)
- ❌ Unrelated statements inflating certain scores
- ❌ Inaccurate personality profiles

### V2 (Corrected) Improvements:
- ✅ All 25 categories have logically correct statement mappings
- ✅ Dominant and submissive roles properly separated
- ✅ Each statement matches its category content
- ✅ Accurate, meaningful personality profiles

---

## Migration Steps

### Step 1: Backup Current Data (AUTOMATIC)
The migration script automatically backs up all existing results.

**Run in Supabase SQL Editor:**
```bash
# Open file: /app/KINK_QUIZ_MIGRATION_V2.sql
# Copy entire contents
# Paste into Supabase SQL Editor
# Click RUN
```

**What it does:**
1. Creates `kink_quiz_results_v1_backup` table
2. Backs up all existing quiz results
3. Archives results in `kink_quiz_history` table
4. Adds version tracking columns

---

### Step 2: Update Frontend Code (COMPLETED ✅)
The KinkQuiz.tsx component has been updated with corrected categories.

**Changes made:**
- ✅ `/app/src/components/KinkQuiz.tsx` - Updated CATEGORIES mapping
- ✅ `/app/src/components/KinkQuizUpdateNotice.tsx` - Created notification component

---

### Step 3: Run Migration SQL (REQUIRED)

**Execute the migration:**
```sql
-- In Supabase SQL Editor, run:
/app/KINK_QUIZ_MIGRATION_V2.sql
```

**Expected output:**
```
✓ Backed up [N] V1 results
✓ Cleared [N] user results for retake
✓ Version tracking enabled
✓ Updated save functions
✓ Created comparison functions
```

---

### Step 4: Verify Migration

**Check migration status:**
```sql
SELECT * FROM get_quiz_migration_report();
```

**Expected results:**
| Metric | Count |
|--------|-------|
| Total Users with Old Results (V1) | X |
| Users Cleared for Retake | X |
| Users Completed V2 Quiz | 0 |
| Total History Records | X |

---

### Step 5: User Communication (OPTIONAL)

You can optionally notify users about the update:

**Option A: Automatic Notice (Recommended)**
The `KinkQuizUpdateNotice` component can be shown to users with V1 results.

**Option B: Email/Announcement**
Send an announcement explaining:
- Quiz has been improved
- Previous results backed up
- Retake for more accurate results

---

## Technical Details

### Database Changes

#### New Tables:
```sql
-- Backup table for V1 results
kink_quiz_results_v1_backup (
    id UUID PRIMARY KEY,
    user_id UUID,
    profile_id UUID,
    old_results JSONB,
    backed_up_at TIMESTAMP
)
```

#### New Columns:
```sql
-- Version tracking
profiles.kink_quiz_version INTEGER DEFAULT 2
kink_quiz_history.quiz_version INTEGER DEFAULT 1
```

#### Updated Functions:
```sql
-- Now includes version parameter
save_kink_quiz_results(user_id UUID, results JSONB, version INTEGER DEFAULT 2)

-- New comparison function
compare_quiz_versions(user_id UUID)

-- New reporting function
get_quiz_migration_report()
```

---

## Category Mapping Changes

### Example: Submissive Category

**V1 (WRONG):**
```typescript
Submissive: [1, 7, 29, 44, 55]
// Statement 55: "I enjoy keeping my partner as a pet..."
// ❌ This is DOMINANT behavior!
```

**V2 (CORRECT):**
```typescript
Submissive: [1, 7, 10, 29, 48, 63]
// All statements about being dominated, helpless, partner in charge
// ✅ Logically consistent
```

### Example: Voyeur Category

**V1 (WRONG):**
```typescript
Voyeur: [42, 6]
// Statement 6: "I enjoy when people watch me..."
// ❌ This is EXHIBITIONIST (being watched)!
```

**V2 (CORRECT):**
```typescript
Voyeur: [42, 61]
// Statement 42: "I enjoy watching other people..."
// Statement 61: "I enjoy watching other people..."
// ✅ Both about WATCHING (voyeurism)
```

---

## User Experience Changes

### Before Taking V2 Quiz:

**Users with V1 Results:**
1. See "Take Kink Quiz" button
2. May see update notice (if implemented)
3. Click to retake
4. Complete 64 questions
5. Get V2 results (more accurate)

**New Users:**
1. Take quiz normally
2. Get V2 results automatically

### After Taking V2 Quiz:

**All users get:**
- ✅ More accurate category percentages
- ✅ Logically consistent role profiles
- ✅ Better matching potential based on results

---

## Comparison Feature (OPTIONAL)

Users can compare their V1 vs V2 results:

```sql
-- View differences for a user
SELECT * FROM compare_quiz_versions('user-uuid-here');
```

**Example output:**
| Category | V1 % | V2 % | Difference |
|----------|------|------|------------|
| Dominant | 45 | 78 | +33 |
| Submissive | 72 | 48 | -24 |
| Voyeur | 60 | 35 | -25 |

**Interpretation:**
- Large positive difference: More accurate representation in V2
- Large negative difference: V1 was inflated by wrong statements
- Small difference: Relatively consistent between versions

---

## Rollback Procedure (IF NEEDED)

If you need to rollback to V1:

```sql
-- Restore V1 results from backup
UPDATE profiles p
SET 
    kink_quiz_results = b.old_results,
    kink_quiz_version = 1,
    updated_at = NOW()
FROM kink_quiz_results_v1_backup b
WHERE p.id = b.profile_id;

-- Verify rollback
SELECT COUNT(*) FROM profiles WHERE kink_quiz_version = 1;
```

Then revert the code changes in `KinkQuiz.tsx` using git:
```bash
cd /app
git checkout HEAD~1 src/components/KinkQuiz.tsx
```

---

## Testing Checklist

### Post-Migration Tests:

- [ ] SQL migration runs without errors
- [ ] Backup table contains V1 results
- [ ] All users have `kink_quiz_version = 2`
- [ ] All users have `kink_quiz_results = NULL` (cleared for retake)
- [ ] New quiz submissions save with version 2
- [ ] Results display correctly with descriptions
- [ ] Role percentages make logical sense

### Test Scenarios:

#### Test 1: Pure Dominant User
Answer 9 for statements: 3, 4, 22, 62, 70, 75
**Expected V2 Result:**
- Dominant: 100%
- Owner: High
- Rigger: Moderate
- Submissive: Low

#### Test 2: Pure Submissive User
Answer 9 for statements: 1, 7, 10, 29, 48, 63
**Expected V2 Result:**
- Submissive: 100%
- Slave: High
- Ropebunny: Moderate
- Dominant: Low

#### Test 3: Switch User
Answer 9 for: 33, 52, 74 (switch statements)
**Expected V2 Result:**
- Switch: 100%
- Both dominant and submissive categories moderate

---

## Frequently Asked Questions

### Q: Will users lose their quiz results?
**A:** V1 results are backed up in two places:
1. `kink_quiz_results_v1_backup` table
2. `kink_quiz_history` table

Users can retake the quiz to get V2 results.

### Q: Can users compare V1 vs V2 results?
**A:** Yes, using the `compare_quiz_versions()` function.

### Q: What if users don't want to retake?
**A:** They can continue without quiz results, or retake later. The backup remains.

### Q: Will matching still work?
**A:** Matching will work better with V2 because results are more accurate.

### Q: How long does migration take?
**A:** SQL execution: ~5-30 seconds depending on user count.

### Q: Can we run migration in stages?
**A:** Yes, you can backup first, then clear results in batches if needed.

---

## Monitoring

### Check Migration Progress:

```sql
-- Overall status
SELECT * FROM get_quiz_migration_report();

-- Users who haven't retaken yet
SELECT COUNT(*) 
FROM profiles 
WHERE kink_quiz_version = 2 
AND kink_quiz_results IS NULL;

-- Users who completed V2
SELECT COUNT(*) 
FROM profiles 
WHERE kink_quiz_version = 2 
AND kink_quiz_results IS NOT NULL;

-- Average time to retake (after migration)
SELECT 
    AVG(EXTRACT(EPOCH FROM (kink_quiz_taken_at - updated_at))) / 3600 as avg_hours_to_retake
FROM profiles
WHERE kink_quiz_version = 2 
AND kink_quiz_results IS NOT NULL;
```

---

## Support Issues

### Issue: Migration script fails
**Solution:**
1. Check if KINK_QUIZ_SYSTEM.sql was run first
2. Ensure user has proper permissions
3. Run sections individually to find failing part

### Issue: Old results not backed up
**Solution:**
```sql
-- Manual backup
INSERT INTO kink_quiz_results_v1_backup (user_id, profile_id, old_results)
SELECT auth_users.id, profiles.id, profiles.kink_quiz_results
FROM profiles
LEFT JOIN auth.users auth_users ON profiles.id = auth_users.id
WHERE profiles.kink_quiz_results IS NOT NULL;
```

### Issue: Users report very different results
**Solution:**
- This is expected! V2 is more accurate.
- Use `compare_quiz_versions()` to show what changed and why
- Explain that V1 had mapping errors

---

## Success Metrics

Track these after migration:

1. **Retake Rate:** % of users who retake quiz
2. **Result Consistency:** Compare V1 vs V2 differences
3. **User Satisfaction:** Feedback on accuracy
4. **Matching Quality:** Improved matches with accurate profiles

---

## Timeline

**Recommended Migration Schedule:**

| Step | Duration | When |
|------|----------|------|
| 1. Code Review | 1 hour | Before migration |
| 2. Run SQL Migration | 5-30 seconds | During migration |
| 3. Verify Results | 30 minutes | Immediately after |
| 4. Monitor Retakes | 1-2 weeks | After migration |
| 5. Analysis | 1 week | 2 weeks after |

---

## Conclusion

The V2 migration improves quiz accuracy significantly. While it requires users to retake the quiz, the improved results will provide:
- ✅ More accurate personality profiles
- ✅ Better self-understanding
- ✅ Improved matching quality
- ✅ Logical consistency

All V1 data is safely backed up and can be compared with V2 results.

---

**Ready to migrate? Run the SQL script and monitor the results!**
