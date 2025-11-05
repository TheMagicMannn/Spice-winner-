# Kink Quiz Implementation Guide

## Overview
This guide covers the complete implementation of the enhanced Kink Quiz feature with:
- ✅ Result persistence in Supabase
- ✅ Retake functionality with overwrite confirmation
- ✅ Role descriptions and external links
- ✅ Quiz history tracking
- ✅ Corrected calculation algorithm

## Files Modified/Created

### 1. Database Schema
**File:** `/app/KINK_QUIZ_SYSTEM.sql`

**What it does:**
- Adds `kink_quiz_results` (JSONB) column to profiles table
- Adds `kink_quiz_taken_at` (TIMESTAMP) column to profiles table
- Creates `kink_quiz_history` table for tracking retakes
- Sets up RLS policies for secure access
- Creates helper functions for saving/retrieving results
- Implements triggers for automatic timestamp updates

**To apply:**
```bash
# Run in Supabase SQL Editor
psql -f /app/KINK_QUIZ_SYSTEM.sql
```

Or copy the contents into Supabase Dashboard → SQL Editor → Run

### 2. Role Descriptions Data
**File:** `/app/src/data/kinkRoleDescriptions.ts`

**What it does:**
- Provides short descriptions for each BDSM/kink role
- Includes external links to detailed information (bdsmwiki.info)
- Helper functions for formatting role names
- Fallback handling for unknown roles

**Key exports:**
```typescript
- KINK_ROLE_INFO: Record<string, RoleInfo>
- getRoleInfo(roleName: string): RoleInfo
- formatRoleName(role: string): string
```

### 3. Updated KinkQuiz Component
**File:** `/app/src/components/KinkQuiz.tsx`

**Changes made:**
1. **Fixed CATEGORIES mapping** - Corrected statement number mappings for accurate results
2. **Added role descriptions** - Results now show description below each role
3. **Added external links** - Each role has a "Learn more" link icon
4. **Improved UI** - Enhanced results display with expandable descriptions

**Key features:**
- Proper role percentage calculation
- Vanilla modifier (reduces other scores if vanilla > 80%)
- Neutral defaults (unanswered = 5)
- Formatted role names with proper spacing

### 4. KinkQuizPrompt Component
**File:** `/app/src/components/KinkQuizPrompt.tsx`

**Already exists** - No changes needed. This component:
- Shows when user has existing results
- Offers "View Results" or "Retake Quiz" options
- Warns that retaking will overwrite previous results

### 5. Algorithm Documentation
**File:** `/app/KINK_QUIZ_ALGORITHM_DOCUMENTATION.md`

Complete documentation of:
- How the algorithm works
- Category mappings explained
- Calculation steps with examples
- Validation checks
- Testing recommendations

## How It Works

### User Flow

#### First Time Taking Quiz:
1. User clicks "Take Kink Quiz" on profile page
2. Quiz opens (82 questions, 9-point scale)
3. User answers questions page by page
4. Results calculated and displayed with descriptions
5. Results saved to `profiles.kink_quiz_results`
6. Timestamp saved to `profiles.kink_quiz_taken_at`

#### Retaking Quiz:
1. User clicks "Take Kink Quiz" (already has results)
2. **Prompt appears:** "You've Already Taken the Quiz"
3. User chooses:
   - **"View My Results"** → Shows previous results (read-only)
   - **"Retake Quiz"** → Opens quiz for new answers
   - **"Cancel"** → Closes prompt
4. If retake:
   - Old results archived in `kink_quiz_history` table
   - New results saved to profile
   - Timestamp updated

### Database Structure

#### profiles table (updated)
```sql
id UUID PRIMARY KEY
...
kink_quiz_results JSONB         -- Current quiz results
kink_quiz_taken_at TIMESTAMP    -- When last taken
...
```

Example data:
```json
{
  "Dominant": 89,
  "Sadist": 72,
  "Rigger": 65,
  "Switch": 45,
  "Submissive": 20,
  ...
}
```

#### kink_quiz_history table (new)
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
quiz_results JSONB
taken_at TIMESTAMP
```

Stores all previous results when user retakes quiz.

### Quiz Algorithm (Corrected)

#### Calculation Steps:

1. **Collect Scores:**
   - 82 statements rated 1-9
   - Unanswered = 5 (neutral)

2. **Calculate Vanilla %:**
   ```
   vanillaPct = (sum of vanilla scores) / (9 * vanilla_count) * 100
   ```

3. **Calculate Each Role %:**
   ```
   rolePct = (sum of role scores) / (9 * role_count) * 100
   ```

4. **Apply Vanilla Modifier:**
   ```
   if (vanillaPct > 80% && role != 'Vanilla'):
       rolePct = max(0, rolePct - 10%)
   ```

5. **Sort & Display:**
   - Sorted highest to lowest
   - With descriptions and links

#### Fixed Category Mappings:

Key fixes made:
- **Submissive:** Added statement 47 (likes being forced into submission)
- **Masochist:** Added statements 65, 70 (pain-related)
- **Dominant:** Added statements 51, 74 (dominance-related)
- **Degrader:** Fixed mapping to degradation statements
- **Vanilla:** Added statement 34 (relationship focus over kink)
- **Slave:** Corrected 24/7 submission statements
- **Little:** Added age regression statements
- **BratTamer:** Fixed to statements 64, 82

## Testing the Implementation

### 1. Database Setup Test
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('kink_quiz_results', 'kink_quiz_taken_at');

-- Check history table exists
SELECT * FROM kink_quiz_history LIMIT 1;

-- Check functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%kink_quiz%';
```

### 2. Frontend Test Scenarios

#### Test 1: First Time User
1. Log in as new user
2. Go to Profile page
3. Click "Take Kink Quiz"
4. Should open quiz directly (no prompt)
5. Answer questions
6. Verify results display with descriptions and links
7. Close quiz
8. Check profile - should see checkmark next to "Take Kink Quiz"

#### Test 2: Retake Prompt
1. Log in as user who completed quiz
2. Go to Profile page
3. Click "Take Kink Quiz"
4. Should see prompt: "You've Already Taken the Quiz"
5. Click "View My Results" - should show previous results
6. Close and click again
7. Click "Retake Quiz" - should open fresh quiz

#### Test 3: Result Saving
1. Complete quiz
2. Open browser DevTools → Network tab
3. Watch for API call to update profile
4. Verify `kink_quiz_results` is saved
5. Refresh page - results should persist
6. Check Supabase directly:
   ```sql
   SELECT kink_quiz_results, kink_quiz_taken_at 
   FROM profiles 
   WHERE id = 'user-id';
   ```

#### Test 4: Quiz Algorithm
```javascript
// Test in browser console
// All 9s should give ~100% for all roles
// All 1s should give ~11% for all roles
// All 5s should give ~56% for all roles
```

### 3. Role Description Test
1. Complete quiz
2. View results
3. Verify each role shows:
   - Percentage bar
   - Role name
   - Description text
   - External link icon (clickable)
4. Click external link - should open bdsmwiki.info in new tab

## Troubleshooting

### Issue: Quiz results not saving
**Check:**
1. Network tab for API errors
2. Supabase logs for RLS policy errors
3. Console for JavaScript errors
4. Database permissions

**Fix:**
```sql
-- Grant permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;
```

### Issue: Prompt not showing for users with results
**Check:**
1. `profile.kinkQuizResults` is populated
2. `handleOpenKinkQuiz` function logic
3. State management in Profile.tsx

**Debug:**
```javascript
console.log('Has results:', profile.kinkQuizResults);
console.log('Keys:', Object.keys(profile.kinkQuizResults || {}));
```

### Issue: Incorrect percentages
**Check:**
1. CATEGORIES mapping matches statements
2. Statement numbers are 1-indexed
3. Calculation formula is correct

**Verify:**
```javascript
// In calculate() function, add:
console.log('Final scores:', finalScores);
console.log('Category results:', cats);
```

### Issue: Role descriptions not showing
**Check:**
1. Import statement for `getRoleInfo`
2. File path to `kinkRoleDescriptions.ts`
3. Role name formatting

**Fix:**
Ensure import:
```javascript
import { getRoleInfo, formatRoleName } from '@/data/kinkRoleDescriptions';
```

## API Functions Available

### 1. Save Quiz Results
```sql
SELECT save_kink_quiz_results(
  'user-uuid',
  '{"Dominant": 89, "Submissive": 20, ...}'::jsonb
);
```

### 2. Get Quiz History
```sql
SELECT * FROM get_kink_quiz_history('user-uuid', 10);
```

### 3. Clear Quiz Results
```sql
SELECT clear_kink_quiz_results('user-uuid');
```

### 4. Get Top Roles
```sql
SELECT * FROM get_top_kink_roles(
  '{"Dominant": 89, "Submissive": 20, ...}'::jsonb,
  5
);
```

## Future Enhancements

Potential improvements:
1. **Comparison View:** Compare current vs previous results
2. **Role Explanations:** In-app detailed role descriptions
3. **Matching Integration:** Use quiz results for better matches
4. **Quiz Versioning:** Track which quiz version was taken
5. **Partial Save:** Save progress and resume later
6. **Export Results:** Download results as PDF
7. **Anonymous Sharing:** Share results without revealing identity
8. **Role Recommendations:** Suggest compatible roles based on results

## Security Considerations

1. **RLS Policies:** Only users can see/edit their own results
2. **History Privacy:** Quiz history is user-private
3. **External Links:** Open in new tab with `rel="noopener noreferrer"`
4. **Input Validation:** Scores validated to be 1-9
5. **JSONB Validation:** Results must be valid JSON object

## Performance Notes

1. **Indexes:** GIN index on `kink_quiz_results` for fast queries
2. **History Limits:** Consider pruning old history (>1 year)
3. **Caching:** Results cached in React state
4. **Lazy Loading:** Descriptions loaded on-demand

## Deployment Checklist

- [ ] Run KINK_QUIZ_SYSTEM.sql in Supabase
- [ ] Verify database columns added
- [ ] Verify functions created
- [ ] Test RLS policies
- [ ] Deploy frontend changes
- [ ] Test first-time quiz flow
- [ ] Test retake quiz flow
- [ ] Verify role descriptions display
- [ ] Verify external links work
- [ ] Test on mobile devices
- [ ] Monitor for errors in production

## Support & Resources

- **BDSM Wiki:** https://www.bdsmwiki.info/
- **Quiz Algorithm:** See KINK_QUIZ_ALGORITHM_DOCUMENTATION.md
- **Database Schema:** See KINK_QUIZ_SYSTEM.sql
- **Component Code:** See src/components/KinkQuiz.tsx

## Questions?

Common questions:

**Q: Can users delete their quiz results?**
A: Yes, use `clear_kink_quiz_results()` function or set to NULL.

**Q: How many times can someone retake?**
A: Unlimited. All previous results are archived in history table.

**Q: Are results visible to other users?**
A: No, results are private by default (RLS policies).

**Q: Can results be used for matching?**
A: Yes, `kink_quiz_results` JSONB can be queried for compatibility.

**Q: What if someone partially completes the quiz?**
A: Unanswered questions default to 5 (neutral), won't skew results significantly.

---

**Implementation Complete!** 🎉

The kink quiz system is now fully functional with result persistence, retake functionality, role descriptions, and accurate calculations.
