# Matching Algorithm - Quick Setup Guide

## 🚀 Quick Start

### Step 1: Apply Database Migration
Run the SQL script in your **Supabase SQL Editor**:

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `/app/profile_matching_algorithm.sql`
3. Paste and execute
4. Wait for completion log

**Expected Output:**
```
=================================================
Profile Matching Algorithm Installation Complete
=================================================
✓ swipe_actions table created
✓ Location coordinates added
✓ Functions created
✓ RLS policies applied
✓ Indexes created
=================================================
```

---

### Step 2: Verify Installation

Run this query to verify:
```sql
-- Check if all functions exist
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'calculate_distance',
  'calculate_compatibility_score',
  'get_matched_profiles',
  'record_swipe_action'
)
AND routine_schema = 'public';

-- Should return 4 functions
```

---

### Step 3: Test the Matching Function

```sql
-- Replace 'your-user-id' with an actual user UUID from your auth.users table
SELECT 
  display_name,
  age,
  location,
  compatibility_score,
  distance_miles
FROM get_matched_profiles('your-user-id', 10, 0)
ORDER BY compatibility_score DESC;
```

---

### Step 4: Update User Locations (Optional but Recommended)

For distance-based matching to work, you need location coordinates:

#### Option A: Use Browser Geolocation (Automatic)
The Browse page automatically requests location permission when loaded.

#### Option B: Manual Geocoding
If you have city/state data, use a geocoding service:

```typescript
// Example: Update location manually
await MatchingService.updateLocation(
  userId,
  40.7128,  // New York latitude
  -74.0060  // New York longitude
);
```

#### Option C: Batch Update from Location Field
```sql
-- Example: Set approximate coordinates based on location text
-- This is a simplified example - use a proper geocoding service in production

UPDATE profiles
SET 
  latitude = 40.7128,
  longitude = -74.0060
WHERE location ILIKE '%New York%' OR location ILIKE '%NYC%';

UPDATE profiles
SET 
  latitude = 34.0522,
  longitude = -118.2437
WHERE location ILIKE '%Los Angeles%' OR location ILIKE '%LA%';

-- Add more cities as needed
```

---

### Step 5: Test Swipe Actions

```sql
-- User A likes User B
SELECT record_swipe_action(
  'user-a-uuid',
  'user-b-uuid',
  'like'
);

-- Returns:
-- {"success": true, "action": "like", "is_match": false}

-- User B likes User A (creates a match!)
SELECT record_swipe_action(
  'user-b-uuid',
  'user-a-uuid',
  'like'
);

-- Returns:
-- {"success": true, "action": "like", "is_match": true, "match_id": "new-uuid"}
```

---

### Step 6: Test in Browse Page

1. Login to your app
2. Navigate to Browse page
3. You should see matched profiles based on your preferences
4. Swipe left (pass) or right (like)
5. If mutual like, see match modal

---

## 🔍 Debugging

### Issue: No profiles showing

**Check 1: Do you have match preferences?**
```sql
SELECT match_preferences FROM profiles WHERE id = 'your-user-id';
```

If NULL, the algorithm uses defaults. Better to set preferences via Match Preferences modal.

**Check 2: Are there active profiles?**
```sql
SELECT COUNT(*) 
FROM profiles 
WHERE is_active = TRUE 
  AND profile_completed = TRUE 
  AND id != 'your-user-id';
```

**Check 3: Have you already swiped on everyone?**
```sql
SELECT COUNT(*) FROM swipe_actions WHERE user_id = 'your-user-id';
```

---

### Issue: Compatibility scores are low

**Solution:** Adjust match preferences to be less restrictive:
- Widen age range (e.g., 21-55 instead of 25-30)
- Remove gender filters (leave empty for "any")
- Increase distance range
- Remove experience level filters

---

### Issue: Distance filtering not working

**Cause:** Location coordinates not set

**Solution:**
```sql
-- Check if coordinates exist
SELECT id, location, latitude, longitude 
FROM profiles 
WHERE latitude IS NOT NULL 
LIMIT 10;

-- If empty, update locations (see Step 4)
```

---

## 📊 Useful Queries

### View Your Match Preferences
```sql
SELECT 
  id,
  display_name,
  match_preferences
FROM profiles
WHERE id = 'your-user-id';
```

### See Who You've Liked
```sql
SELECT 
  sa.action,
  sa.created_at,
  p.display_name,
  p.age,
  p.location
FROM swipe_actions sa
JOIN profiles p ON sa.target_user_id = p.id
WHERE sa.user_id = 'your-user-id'
  AND sa.action = 'like'
ORDER BY sa.created_at DESC;
```

### Find Mutual Likes
```sql
SELECT * FROM mutual_likes;
```

### Top Compatible Profiles
```sql
SELECT 
  display_name,
  age,
  location,
  compatibility_score,
  distance_miles
FROM get_matched_profiles('your-user-id', 50, 0)
WHERE compatibility_score >= 80
ORDER BY compatibility_score DESC;
```

---

## 🎯 Testing Checklist

- [ ] SQL migration applied successfully
- [ ] All 4 functions exist in database
- [ ] swipe_actions table created
- [ ] latitude/longitude columns added to profiles
- [ ] User locations updated (at least for test users)
- [ ] Match preferences set for test users
- [ ] Browse page loads without errors
- [ ] Profiles show with compatibility scores
- [ ] Like action records in swipe_actions table
- [ ] Pass action records in swipe_actions table
- [ ] Mutual like creates match
- [ ] Match modal appears on mutual like
- [ ] Distance filtering works (if coordinates set)
- [ ] VIP/Verified filters work

---

## 🔐 Security Verification

Run these queries to verify RLS policies:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('swipe_actions', 'profiles');
-- Both should show rowsecurity = true

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'swipe_actions';
-- Should show at least 3 policies
```

---

## 🚨 Common Errors

### Error: "function get_matched_profiles does not exist"
**Solution:** Re-run the SQL migration script

### Error: "permission denied for function"
**Solution:** Grant permissions:
```sql
GRANT EXECUTE ON FUNCTION get_matched_profiles(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_swipe_action(UUID, UUID, TEXT) TO authenticated;
```

### Error: "column latitude does not exist"
**Solution:** Add location columns:
```sql
ALTER TABLE profiles ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE profiles ADD COLUMN longitude DECIMAL(11, 8);
```

---

## 📈 Performance Tips

1. **Add more indexes** if queries are slow:
```sql
CREATE INDEX idx_profiles_compatibility 
ON profiles(age, gender, orientation, is_active, profile_completed);
```

2. **Limit result sets** - Use pagination:
```typescript
// Load in batches
getMatchedProfiles(userId, 20, 0);  // First 20
getMatchedProfiles(userId, 20, 20); // Next 20
```

3. **Cache results** on frontend:
```typescript
// Store profiles in state, only reload when needed
const [profiles, setProfiles] = useState<MatchedProfile[]>([]);
```

---

## 🎨 UI Customization

### Adjust compatibility score labels:
Edit `/app/src/services/matchingService.ts`:
```typescript
static getCompatibilityLevel(score: number) {
  if (score >= 95) return { label: 'Perfect Match', ... };
  if (score >= 85) return { label: 'Excellent Match', ... };
  // ... customize as needed
}
```

### Change distance units to kilometers:
Edit `calculate_distance` function in SQL:
```sql
DECLARE
    r DECIMAL := 6371; -- Earth's radius in kilometers
```

And update the formatter:
```typescript
static formatDistance(km?: number): string {
  return `${km} km away`;
}
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

✅ Browse page loads profiles automatically
✅ Compatibility scores display (40-100%)
✅ Distance shows (if coordinates set)
✅ Swipe actions work smoothly
✅ Match modal appears on mutual likes
✅ Profile count decreases as you swipe
✅ Console logs show no errors
✅ Database has swipe_actions records

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs in Dashboard
3. Verify RLS policies are applied
4. Test SQL functions directly in SQL Editor
5. Review `/app/MATCHING_ALGORITHM_DOCUMENTATION.md` for detailed info

---

## 🎉 You're All Set!

The matching algorithm is now active and integrated with your Browse page. Users will see profiles that match their preferences with compatibility scores!

**Next Steps:**
- Test with real users
- Monitor compatibility scores
- Adjust algorithm weights if needed
- Add more features (super likes, rewind, etc.)
