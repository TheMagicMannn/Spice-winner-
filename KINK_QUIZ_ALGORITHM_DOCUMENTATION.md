# Kink Quiz Algorithm Documentation

## Overview
The kink quiz consists of 82 statements that users rate on a scale of 1-9, where:
- **1-3**: Strongly Disagree (Deep Pink)
- **4-6**: Neutral (Hot Pink, with 5 marked as "N")
- **7-9**: Strongly Agree (Light Pink)

## Algorithm Explanation

### Step 1: Score Collection
- Users answer 82 statements with values 1-9
- Any unanswered questions default to 5 (neutral) during calculation

### Step 2: Category Mapping
Each BDSM/kink role is mapped to specific statement numbers. The statements are indexed from 1-82.

**Corrected Category Mappings:**

```typescript
const CATEGORIES = {
  Submissive: [1, 7, 29, 47, 64],      // Likes to be dominated, prefers partner to decide
  Masochist: [2, 65],                   // Enjoys receiving pain
  Dominant: [3, 69, 74],                // Likes to dominate and be in charge
  Degrader: [4, 28, 49, 67],            // Enjoys degrading partner
  Nonmonogamist: [5, 17, 37, 57],       // Open to multiple partners
  Exhibitionist: [6, 14, 45],           // Enjoys being watched
  Experimentalist: [8, 35, 53],         // Willing to try new things
  Rigger: [9, 28],                      // Enjoys tying up partners
  Ropebunny: [10, 18, 40],              // Enjoys being tied up
  Ageplayer: [11, 26, 44],              // Enjoys age play
  Pet: [12, 23, 41, 54, 68],            // Enjoys pet play
  Degradee: [13, 25, 63, 81],           // Enjoys being degraded
  Vanilla: [15, 20, 34],                // Prefers traditional sex, no specific fetishes
  Slave: [16, 21, 27, 47, 60, 78],      // Desires 24/7 submission and service
  PrimalPrey: [19, 37, 64],             // Enjoys being hunted/prey
  Sadist: [24, 43, 72, 77],             // Enjoys inflicting pain
  Brat: [48, 66],                       // Enjoys playful disobedience
  Little: [32, 62, 80],                 // Enjoys age regression
  Switch: [33, 51, 73],                 // Enjoys both dominant and submissive roles
  Owner: [34, 36, 52],                  // Desires to own slaves
  PrimalHunter: [38, 40, 58],           // Enjoys hunting/predator role
  Voyeur: [42, 60],                     // Enjoys watching others
  DaddyMommy: [41, 50, 59, 76],         // Nurturing parental role
  MasterMistress: [43, 61, 79],         // Seeks complete authority 24/7
  BratTamer: [64, 82]                   // Enjoys taming bratty behavior
}
```

### Step 3: Calculate Vanilla Percentage
First, calculate the vanilla percentage:

```typescript
vanillaPct = (sum of vanilla statement scores) / (9 * number of vanilla statements) * 100
```

For example:
- Vanilla statements: [15, 20, 34]
- If scores are [2, 3, 6]
- vanillaPct = (2 + 3 + 6) / (9 * 3) * 100 = 11 / 27 * 100 ≈ 41%

### Step 4: Calculate Each Role Percentage
For each role category:

```typescript
rolePct = (sum of role statement scores) / (9 * number of statements in category) * 100
```

### Step 5: Apply Vanilla Modifier
If vanilla percentage is > 80%, reduce all other (non-vanilla) role percentages by 10:

```typescript
if (vanillaPct > 80 && role !== 'Vanilla') {
  rolePct = Math.max(0, rolePct - 10);
}
```

This adjustment recognizes that highly vanilla individuals are less likely to identify strongly with kink roles.

### Step 6: Sort and Display
Results are sorted by percentage from highest to lowest and displayed to the user.

## Example Calculation

Let's say a user answered all 82 questions with these sample scores for relevant categories:

**Dominant statements [3, 69, 74]:** Scores = [8, 9, 7]
```
dominantPct = (8 + 9 + 7) / (9 * 3) * 100
            = 24 / 27 * 100
            = 88.89% ≈ 89%
```

**Submissive statements [1, 7, 29, 47, 64]:** Scores = [2, 1, 3, 2, 1]
```
submissivePct = (2 + 1 + 3 + 2 + 1) / (9 * 5) * 100
              = 9 / 45 * 100
              = 20%
```

**Vanilla statements [15, 20, 34]:** Scores = [3, 2, 4]
```
vanillaPct = (3 + 2 + 4) / (9 * 3) * 100
           = 9 / 27 * 100
           = 33.33% ≈ 33%
```

Since vanillaPct (33%) < 80%, no modifier is applied.

**Final Results (Top 3):**
1. Dominant: 89%
2. Submissive: 20%
3. Vanilla: 33%

## Important Notes

### Statement Indexing
- Statements in the STATEMENTS array are 0-indexed
- Category mappings use 1-indexed values (matching the original quiz design)
- The algorithm converts: `finalScores[statementNumber - 1]`

### Neutral Defaults
- Unanswered questions default to 5 (neutral/middle of scale)
- This prevents skewing results for partially completed quizzes

### Validation Checks
The quiz should validate:
1. All statement numbers in categories are between 1-82
2. No duplicate statement numbers across incompatible categories
3. Statement numbers map correctly to question content

### Storage Format
Results are stored as JSONB in the database:
```json
{
  "Dominant": 89,
  "Sadist": 72,
  "Rigger": 65,
  "Switch": 45,
  "Vanilla": 33,
  ...
}
```

## Algorithm Verification

To verify the algorithm is working correctly:

1. **Test with all 9s (Strongly Agree):**
   - All categories should show ~100%
   
2. **Test with all 1s (Strongly Disagree):**
   - All categories should show ~11%

3. **Test with all 5s (Neutral):**
   - All categories should show ~56%

4. **Test known patterns:**
   - Pure dominant responses should show high Dominant, low Submissive
   - Pure submissive responses should show high Submissive, low Dominant

## Quiz Updates

When updating the quiz:
1. Update STATEMENTS array
2. Update CATEGORIES mapping with correct statement numbers
3. Verify all statement numbers are valid (1-82 or adjusted range)
4. Test calculation with sample data
5. Update this documentation
