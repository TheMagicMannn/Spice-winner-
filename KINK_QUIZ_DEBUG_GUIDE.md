# Kink Quiz Results Display - Debug Guide

## Issue Description
Quiz results are showing empty progress bars with missing percentage values (showing as "%" without numbers).

## Possible Causes

### 1. Data Not Saved Correctly
The quiz results might not be saving to the database properly.

### 2. Data Format Mismatch
The saved data format might not match what the component expects.

### 3. Type Conversion Issue
Percentage values might be stored as strings instead of numbers.

### 4. Missing Data in Profile
The `kinkQuizResults` field might be undefined or empty.

## Debugging Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and check for:

1. **Console Logs:**
   ```
   KinkQuiz - Calculated categories: {...}
   KinkQuiz - Sorted results: [...]
   KinkQuiz - Loading existing results: {...}
   KinkQuiz - Formatted results: [...]
   ProfilePage - Saving kink quiz results: {...}
   ```

2. **Error Messages:**
   - Look for any red error messages
   - Check Network tab for failed API calls

### Step 2: Check Database Directly

Run this query in Supabase SQL Editor:

```sql
-- Check if results are saved
SELECT 
    id,
    display_name,
    kink_quiz_results,
    kink_quiz_taken_at
FROM profiles
WHERE kink_quiz_results IS NOT NULL
LIMIT 5;
```

**Expected format:**
```json
{
  "Dominant": 89,
  "Sadist": 72,
  "Rigger": 65,
  ...
}
```

**Check for:**
- Are values numbers or strings? (Should be numbers)
- Are keys formatted correctly? (PascalCase like "Dominant")
- Is the JSONB valid?

### Step 3: Check Profile Data in React

Add this to your browser console when viewing results:

```javascript
// Get the profile from React state
const profile = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.getCurrentFiber()?.memoizedState;
console.log('Profile data:', profile);

// Or check localStorage/sessionStorage if used
console.log('All storage:', {
  localStorage: { ...localStorage },
  sessionStorage: { ...sessionStorage }
});
```

### Step 4: Inspect Component Props

In React DevTools:
1. Open Components tab
2. Find `KinkQuiz` component
3. Check props:
   - `existingResults` - Should be an object with role names and percentages
   - `viewResultsOnly` - Should be true if viewing saved results
   - `onSaveResults` - Should be a function

### Step 5: Check Network Requests

1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Take the quiz and watch for:
   - POST/PUT request to update profile
   - Check request payload - should include `kinkQuizResults`
   - Check response - should return updated profile

### Step 6: Manual Test of Calculation

Run this in browser console:

```javascript
// Sample test data
const testScores = Array(82).fill(7); // All "7" answers
const CATEGORIES = {
  Dominant: [3, 51, 69, 74],
  Submissive: [1, 7, 29, 47, 62],
  // ... etc
};

// Test calculation
const cats = {};
Object.keys(CATEGORIES).forEach(cat => {
  const stmts = CATEGORIES[cat];
  const pct = Math.round(
    stmts.reduce((s, i) => s + testScores[i - 1], 0) / (9 * stmts.length) * 100
  );
  cats[cat] = pct;
});

console.log('Test calculation:', cats);
// Should show percentages around 77-78% for all roles
```

## Common Issues & Fixes

### Issue 1: Results Saved as Strings

**Symptom:** Database shows `"89"` instead of `89`

**Fix:**
```typescript
// In handleSaveKinkQuizResults
const sanitizedResults = Object.fromEntries(
  Object.entries(results).map(([key, value]) => [
    key, 
    typeof value === 'string' ? parseInt(value, 10) : value
  ])
);
```

### Issue 2: Wrong Data Structure

**Symptom:** Results saved as array instead of object

**Current format (wrong):**
```json
[
  {"name": "Dominant", "pct": 89},
  {"name": "Sadist", "pct": 72}
]
```

**Expected format (correct):**
```json
{
  "Dominant": 89,
  "Sadist": 72
}
```

**Fix:** Ensure `onSaveResults` receives the `cats` object, not the `sorted` array.

### Issue 3: Missing Type Definitions

**Symptom:** TypeScript errors or undefined values

**Fix:** Add to `/app/src/types.ts`:
```typescript
export interface KinkQuizResults {
  [roleName: string]: number;
}

export interface Profile {
  // ... other fields
  kinkQuizResults?: KinkQuizResults;
  kinkQuizTakenAt?: string;
}
```

### Issue 4: Component Not Re-rendering

**Symptom:** Results don't appear after saving

**Fix:** Ensure profile state is updated:
```typescript
// In Profile.tsx
const savedProfile = await ProfileService.updateProfile(user.id, updatedProfile);
updateProfile(savedProfile); // This should trigger re-render
setIsKinkQuizOpen(false); // Close quiz
```

### Issue 5: CSS Animation Issue

**Symptom:** Progress bars exist but are invisible

**Fix:** Check CSS:
```css
/* Progress bar should be visible */
.bg-gradient-to-r.from-pink-600.to-pink-400 {
  background: linear-gradient(to right, #db2777, #f472b6);
  min-height: 0.75rem; /* 3 in Tailwind */
}
```

## Testing Procedure

### Test 1: Fresh Quiz
1. Clear quiz results:
   ```sql
   UPDATE profiles 
   SET kink_quiz_results = NULL, kink_quiz_taken_at = NULL 
   WHERE id = 'your-user-id';
   ```
2. Take quiz completely
3. Check console logs during calculation
4. Verify results display with percentages
5. Close and reopen - should show prompt
6. Click "View Results" - should show same percentages

### Test 2: Database Query
```sql
-- Get your results
SELECT 
    display_name,
    jsonb_pretty(kink_quiz_results) as formatted_results,
    kink_quiz_taken_at
FROM profiles 
WHERE id = 'your-user-id';

-- Validate data types
SELECT 
    jsonb_typeof(kink_quiz_results) as type,
    jsonb_typeof(kink_quiz_results->'Dominant') as value_type
FROM profiles 
WHERE id = 'your-user-id';
-- Both should return 'object' and 'number'
```

### Test 3: Component Isolation
Create a test component to verify display:

```tsx
// Test component
const TestResults = () => {
  const testResults = [
    { name: "Dominant", pct: 89 },
    { name: "Sadist", pct: 72 },
    { name: "Submissive", pct: 20 }
  ];

  return (
    <div>
      {testResults.map((r, i) => (
        <div key={i}>
          <span>{r.pct}%</span>
          <div style={{ width: `${r.pct}%`, background: 'pink', height: '12px' }} />
          <span>{r.name}</span>
        </div>
      ))}
    </div>
  );
};
```

## Quick Fixes to Try

### Fix 1: Force Number Conversion
In `KinkQuiz.tsx`, update results mapping:

```typescript
.map(([k, v]) => ({ 
  name: k.replace(/([A-Z])/g, ' $1').trim(), 
  pct: Number(v) || 0  // Force to number
}));
```

### Fix 2: Add Default Values
```typescript
const percentage = r?.pct ?? 0;
const safePct = typeof percentage === 'number' ? percentage : parseInt(percentage, 10) || 0;
```

### Fix 3: Verify Data Flow
Add this temporary debug component:

```tsx
// Add above results display
{results && results.length > 0 && (
  <div className="p-4 bg-yellow-500 text-black">
    DEBUG: {JSON.stringify(results.slice(0, 3), null, 2)}
  </div>
)}
```

## Expected Console Output

### When Taking Quiz:
```
KinkQuiz - Calculated categories: {
  Dominant: 89,
  Sadist: 72,
  Submissive: 20,
  ...
}

KinkQuiz - Sorted results: [
  { name: "Dominant", pct: 89 },
  { name: "Sadist", pct: 72 },
  ...
]

ProfilePage - Saving kink quiz results: {
  Dominant: 89,
  Sadist: 72,
  ...
}
```

### When Viewing Results:
```
KinkQuiz - Loading existing results: {
  Dominant: 89,
  Sadist: 72,
  ...
}

KinkQuiz - Formatted results: [
  { name: "Dominant", pct: 89 },
  { name: "Sadist", pct: 72 },
  ...
]
```

## If Issue Persists

### 1. Check for Hidden Characters
Database values might have invisible characters:
```sql
SELECT 
    length(kink_quiz_results::text) as text_length,
    octet_length(kink_quiz_results::text) as byte_length
FROM profiles 
WHERE id = 'your-user-id';
```

### 2. Re-save Results
Manually fix one user's data:
```sql
UPDATE profiles
SET kink_quiz_results = '{
  "Dominant": 89,
  "Sadist": 72,
  "Submissive": 20,
  "Rigger": 65,
  "Switch": 45
}'::jsonb
WHERE id = 'your-user-id';
```

### 3. Check Supabase Client Version
```bash
cd /app/src
grep -r "@supabase/supabase-js" ../package.json
```

Ensure version is compatible (should be ^2.x).

### 4. Clear Browser Cache
Sometimes cached components cause issues:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear site data in DevTools → Application → Clear storage

## Contact Support

If issue persists after all debugging steps, provide:
1. Console logs (all messages)
2. Network tab screenshot (profile update request/response)
3. Database query results
4. React DevTools component props screenshot
5. Browser and version

---

**Last Updated:** Based on v1.0 of enhanced Kink Quiz system
