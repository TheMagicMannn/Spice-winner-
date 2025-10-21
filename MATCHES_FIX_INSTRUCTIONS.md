# 🔧 Matches Fix Instructions

## Problem
Matches page and real-time user likes data are not showing up due to restrictive RLS (Row Level Security) policies.

## Root Cause
The original RLS policies only allowed users to see their **own** swipe actions. This prevented:
- Users from seeing who liked them (target_user_id visibility)
- The matches page from displaying mutual matches
- Profile data from being accessible in joined queries

---

## ✅ SOLUTION: Run This SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Run the Fix Script
Copy and paste the entire contents of `/app/FIX_MATCHES_RLS_POLICIES.sql` into the SQL editor and execute.

**Or run this command in your terminal if you have Supabase CLI:**
```bash
supabase db execute -f /app/FIX_MATCHES_RLS_POLICIES.sql
```

---

## 🔍 What The Fix Does

### 1. **Updates swipe_actions RLS Policies**
**Old Policy:**
```sql
-- Only allowed viewing own swipes
USING (auth.uid() = user_id)
```

**New Policy:**
```sql
-- Allows viewing swipes where user is EITHER the swiper OR the target
USING (auth.uid() = user_id OR auth.uid() = target_user_id)
```

**Result:** Now users can see:
- ✅ Profiles they liked (user_id = them)
- ✅ Profiles who liked them (target_user_id = them)

### 2. **Creates matches RLS Policies**
```sql
-- Users can view matches where they are either user1 or user2
USING (auth.uid() = user1_id OR auth.uid() = user2_id)
```

**Result:** Users can see their mutual matches

### 3. **Updates profiles RLS Policy**
```sql
-- Authenticated users can view active profiles
USING (auth.role() = 'authenticated' AND (is_active = true OR id = auth.uid()))
```

**Result:** Users can see matched users' full profile data

---

## 🧪 Testing After Fix

### Option A: Use the Debugging Script
Run `/app/TEST_MATCHES_DEBUGGING.sql` in Supabase SQL Editor to:
- Check if RLS policies are correctly applied
- View existing swipe data
- Identify mutual likes
- Test the queries that frontend uses

### Option B: Test in the App
1. **Create Test Data:**
   - User A likes User B → User B appears in User A's "Who I Like" tab
   - User B likes User A back → Match modal appears, both appear in "Matches" tab
   - User C likes User A → User C appears in User A's "Who Likes Me" tab

2. **Check Each Tab:**
   - Navigate to Matches page
   - Click through all three tabs
   - Data should now load

---

## 📊 Expected Behavior After Fix

| Tab | Shows | Data Source |
|-----|-------|-------------|
| **My Matches** | Users who mutually liked each other | `matches` table where status='matched' |
| **Who I Like** | Profiles current user has liked | `swipe_actions` where user_id=current + action='like' |
| **Who Likes Me** | Users who liked current user | `swipe_actions` where target_user_id=current + action='like' |

---

## 🔧 Code Changes Made

### 1. Updated `/app/src/services/matchingService.ts`
- Fixed `getLikedProfiles()` to use two-step query
- Fixed `getProfilesWhoLikeMe()` to use two-step query  
- Fixed `getMutualMatches()` to use two-step query

**Why:** Supabase foreign key syntax can be tricky. Two-step queries (get IDs, then get profiles) are more reliable.

### 2. Updated `/app/src/pages/Matches.tsx`
- Added real data fetching on component mount
- Added loading states
- Connected to MatchingService methods

### 3. Updated `/app/src/pages/Browse.tsx`
- Added navigation to Messages page on match
- Pass matched user data via router state

---

## ❓ Troubleshooting

### Still No Data Showing?

**1. Check if RLS policies were applied:**
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('swipe_actions', 'matches', 'profiles');
```

**2. Check if you have any swipe data:**
```sql
SELECT COUNT(*) FROM swipe_actions WHERE action = 'like';
SELECT COUNT(*) FROM matches WHERE status = 'matched';
```

**3. Check browser console for errors:**
- Open DevTools (F12)
- Go to Console tab
- Look for Supabase query errors

**4. Verify Supabase connection:**
- Check `/app/src/services/supabase.ts` has correct credentials
- Ensure user is authenticated

### Common Errors

**Error: "RLS policy violation"**
- Solution: Make sure you ran the fix script
- Verify with: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'swipe_actions';`

**Error: "relation does not exist"**
- Solution: Run `/app/profile_matching_algorithm.sql` first to create tables

**Error: "null value in column"**
- Solution: Check that profiles table has required fields

---

## 📝 Creating Test Data

If you need test data to verify functionality:

```sql
-- Get two user IDs from your auth.users table
SELECT id, email FROM auth.users LIMIT 2;

-- Create mutual like (replace USER_A_ID and USER_B_ID)
INSERT INTO swipe_actions (user_id, target_user_id, action)
VALUES 
  ('USER_A_ID', 'USER_B_ID', 'like'),
  ('USER_B_ID', 'USER_A_ID', 'like')
ON CONFLICT (user_id, target_user_id) DO NOTHING;

-- Manually trigger match creation by calling the function
SELECT record_swipe_action('USER_B_ID', 'USER_A_ID', 'like');

-- Verify match was created
SELECT * FROM matches WHERE status = 'matched';
```

---

## ✅ Verification Checklist

After running the fix:
- [ ] RLS policies updated on swipe_actions table
- [ ] RLS policies created on matches table  
- [ ] RLS policies updated on profiles table
- [ ] Frontend can fetch "Who I Like" data
- [ ] Frontend can fetch "Who Likes Me" data
- [ ] Frontend can fetch "Matches" data
- [ ] Match modal appears when mutual like occurs
- [ ] Navigation to Messages works from match modal

---

## 🆘 Need More Help?

If issues persist after running the fix:

1. **Share the output** of `TEST_MATCHES_DEBUGGING.sql`
2. **Check browser console** for specific error messages
3. **Verify Supabase project** is using the correct database
4. **Ensure profile data exists** for test users

---

## 📚 Files Reference

- **Fix Script:** `/app/FIX_MATCHES_RLS_POLICIES.sql`
- **Debug Script:** `/app/TEST_MATCHES_DEBUGGING.sql`
- **Service Updated:** `/app/src/services/matchingService.ts`
- **Page Updated:** `/app/src/pages/Matches.tsx`
- **Browse Updated:** `/app/src/pages/Browse.tsx`
