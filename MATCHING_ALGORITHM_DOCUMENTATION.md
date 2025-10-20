# Profile Matching Algorithm Documentation

## Overview
A sophisticated bidirectional matching algorithm that uses user preferences to find compatible profiles with mutual compatibility scoring. The system ensures both users match each other's preferences before showing them as potential matches.

---

## Architecture

### Database Components

#### 1. **swipe_actions Table**
Tracks all user swipe actions (like, pass, super_like)

```sql
CREATE TABLE swipe_actions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    target_user_id UUID REFERENCES auth.users(id),
    action TEXT CHECK (action IN ('like', 'pass', 'super_like')),
    created_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, target_user_id)
);
```

#### 2. **Location Coordinates**
Added to profiles table for distance-based matching:
- `latitude DECIMAL(10, 8)`
- `longitude DECIMAL(11, 8)`

---

## Core Functions

### 1. `calculate_distance(lat1, lon1, lat2, lon2)`
**Purpose:** Calculate distance between two points using Haversine formula

**Parameters:**
- `lat1, lon1` - First location coordinates
- `lat2, lon2` - Second location coordinates

**Returns:** Distance in miles (DECIMAL)

**Formula:** Uses spherical law of cosines for accurate Earth surface distance

---

### 2. `calculate_compatibility_score(user_profile, target_profile, user_preferences, target_preferences)`
**Purpose:** Calculate bidirectional compatibility score (0-100)

**Scoring Breakdown:**

| Category | Points | Description |
|----------|--------|-------------|
| **Age Range** | 40 | 20 points each direction for age match |
| **Gender** | 40 | 20 points each direction for gender match |
| **Sexuality** | 40 | 20 points each direction for orientation match |
| **Account Type** | 20 | 10 points each direction for individual/couple match |
| **Experience** | 10 | Both profiles match experience level |
| **Total** | 150 | Normalized to 0-100 scale |

**Example:**
```javascript
User A (age 30, Female, Bisexual, Individual, Moderate experience)
User B (age 28, Male, Straight, Individual, Advanced experience)

User A preferences: Ages 25-35, Male, Any sexuality
User B preferences: Ages 25-40, Female, Bisexual

Score calculation:
- Age match: 40/40 (both ages in range)
- Gender match: 40/40 (both genders match)
- Sexuality match: 40/40 (both match)
- Account type: 20/20 (both seeking individuals)
- Experience: 0/10 (different levels)
Final Score: 93% (Excellent Match)
```

---

### 3. `get_matched_profiles(p_user_id, p_limit, p_offset)`
**Purpose:** Main matching function - returns profiles that match user's preferences

**Filters Applied:**
1. ✅ Exclude self
2. ✅ Active and completed profiles only
3. ✅ Not already swiped on
4. ✅ Age range match
5. ✅ Gender preference match
6. ✅ Sexuality preference match
7. ✅ Account type match (Individual/Couple)
8. ✅ Distance within range
9. ✅ VIP only filter (if enabled)
10. ✅ Verified only filter (if enabled)
11. ✅ Experience level match
12. ✅ Minimum 40% compatibility score

**Returns:**
```typescript
{
  profile_id: UUID,
  display_name: TEXT,
  age: INTEGER,
  location: TEXT,
  bio: TEXT,
  photos: TEXT[],
  gender: TEXT,
  orientation: TEXT,
  interests: TEXT[],
  kinks: TEXT[],
  membership_tier: TEXT,
  is_verified: BOOLEAN,
  distance_miles: DECIMAL,
  compatibility_score: INTEGER,  // 0-100
  last_active_at: TIMESTAMP
}
```

**Ordering:**
1. Compatibility score (highest first)
2. Last active timestamp (most recent)

---

### 4. `record_swipe_action(p_user_id, p_target_user_id, p_action)`
**Purpose:** Record swipe action and check for mutual matches

**Process Flow:**
```
1. Validate action type (like/pass/super_like)
2. Insert/update swipe_actions table
3. If action is 'like':
   a. Check if target also liked user
   b. If YES (mutual like):
      - Create match in matches table
      - Set status to 'matched'
      - Return is_match: true
4. Return result with match status
```

**Returns:**
```json
{
  "success": true,
  "action": "like",
  "is_match": true,
  "match_id": "uuid-here"
}
```

---

## Matching Logic Examples

### Example 1: Basic Match
**User A Preferences:**
- Age: 25-35
- Gender: Female
- Distance: 50 miles

**User B Profile:**
- Age: 28 ✅
- Gender: Female ✅
- Distance: 30 miles ✅
- Compatibility: 85%

**Result:** Profile shown, HIGH compatibility

---

### Example 2: Failed Match (One-way)
**User A Preferences:**
- Age: 25-35
- Gender: Female

**User B Preferences:**
- Age: 40-50 ❌ (User A is 30)

**Result:** Profile NOT shown (mutual compatibility required)

---

### Example 3: Distance Filter
**User A:**
- Location: New York (40.7128° N, 74.0060° W)
- Distance preference: 25 miles

**User B:**
- Location: Philadelphia (39.9526° N, 75.1652° W)
- Distance: ~95 miles ❌

**Result:** Profile NOT shown (exceeds distance)

---

## Frontend Integration

### MatchingService Class

```typescript
// Get matched profiles
const profiles = await MatchingService.getMatchedProfiles(userId, 20, 0);

// Record a like
const result = await MatchingService.recordSwipe(userId, targetId, 'like');
if (result.isMatch) {
  showMatchModal();
}

// Update location
await MatchingService.updateLocationFromBrowser(userId);
```

---

## Performance Optimizations

### Indexes Created:
```sql
-- Swipe actions
idx_swipe_actions_user_id
idx_swipe_actions_target_user_id
idx_swipe_actions_action

-- Profiles matching
idx_profiles_location (latitude, longitude)
idx_profiles_matching_filters (is_active, profile_completed, age)
idx_profiles_membership_verified (membership_tier, is_verified)
idx_profiles_last_active (last_active_at DESC)
idx_profiles_match_preferences (GIN index on JSONB)
```

### Query Optimization:
- GIN index on match_preferences JSONB for fast filtering
- Composite indexes on commonly filtered fields
- Spatial index on latitude/longitude for distance queries
- Limit result sets with pagination

---

## Security & Privacy

### Row Level Security (RLS):
```sql
-- Users can only view their own swipes
CREATE POLICY "Users can view their own swipes"
  ON swipe_actions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create their own swipes
CREATE POLICY "Users can create swipes"
  ON swipe_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Swipes cannot be deleted (maintain history)
-- No DELETE policy
```

### Data Protection:
- ✅ Users only see profiles matching their preferences
- ✅ Swipe history is private
- ✅ Location coordinates are approximate
- ✅ No personal data exposed in compatibility scores

---

## Compatibility Score Breakdown

### Score Ranges:
- **90-100**: Excellent Match 🔥
- **75-89**: Great Match ⭐
- **60-74**: Good Match 💫
- **40-59**: Potential Match 💖
- **0-39**: Low Match (not shown)

### Factors Affecting Score:

1. **Age Compatibility (40 points)**
   - Both users' ages fall within each other's preferred range
   - Bidirectional: A matches B's range AND B matches A's range

2. **Gender Match (40 points)**
   - Both users' genders match each other's preferences
   - Empty preferences = match all

3. **Sexuality Match (40 points)**
   - Both users' orientations match preferences
   - Ensures mutual attraction compatibility

4. **Account Type (20 points)**
   - Individual seeking Individual
   - Couple seeking Couple
   - "Both" option matches either

5. **Experience Level (10 points)**
   - Lifestyle experience alignment
   - New, Beginner, Moderate, Advanced

---

## Algorithm Flow Diagram

```
User Opens Browse Page
        ↓
Update User Location (optional)
        ↓
Call get_matched_profiles()
        ↓
Database Filters:
  ├─ Active profiles only
  ├─ Not already swiped
  ├─ Age range match
  ├─ Gender match
  ├─ Sexuality match
  ├─ Distance match
  ├─ VIP/Verified filters
  └─ Min 40% compatibility
        ↓
Calculate Compatibility Scores
        ↓
Order by Score (DESC) + Last Active
        ↓
Return Top N Profiles
        ↓
Display to User
        ↓
User Swipes → record_swipe_action()
        ↓
Check for Mutual Like
        ↓
Create Match (if mutual)
        ↓
Show Match Modal
```

---

## Database Setup Instructions

### 1. Apply SQL Migration
```bash
# Run in Supabase SQL Editor
cat profile_matching_algorithm.sql
# Copy and paste, then execute
```

### 2. Verify Installation
```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'calculate_distance',
  'calculate_compatibility_score',
  'get_matched_profiles',
  'record_swipe_action'
);

-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'swipe_actions';
```

### 3. Update User Locations
```typescript
// In your app, request location permission
await MatchingService.updateLocationFromBrowser(userId);
```

---

## Testing Scenarios

### Test 1: Basic Matching
```sql
-- Insert test profiles
-- User A: age 30, Female, Bisexual
-- User B: age 28, Male, Straight
-- Both with compatible preferences

-- Expected: Both profiles match (high score)
SELECT * FROM get_matched_profiles('user-a-id', 10, 0);
```

### Test 2: Distance Filtering
```sql
-- User A: New York
-- User B: Los Angeles (2,800 miles away)
-- User A preference: 50 miles

-- Expected: User B not shown
```

### Test 3: Mutual Like Detection
```sql
-- User A likes User B
SELECT record_swipe_action('user-a-id', 'user-b-id', 'like');
-- Result: is_match = false

-- User B likes User A
SELECT record_swipe_action('user-b-id', 'user-a-id', 'like');
-- Result: is_match = true, match_id = 'new-match-id'
```

---

## Analytics & Insights

### Useful Queries:

**1. Top matched profiles by compatibility:**
```sql
SELECT * FROM get_matched_profiles('user-id', 100, 0)
ORDER BY compatibility_score DESC
LIMIT 10;
```

**2. Swipe statistics:**
```sql
SELECT 
  action,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM swipe_actions
WHERE user_id = 'user-id'
GROUP BY action;
```

**3. Mutual likes (potential matches):**
```sql
SELECT * FROM mutual_likes;
```

---

## Troubleshooting

### Issue: No profiles showing

**Possible causes:**
1. User hasn't set match preferences
2. No profiles match criteria
3. All available profiles already swiped
4. Distance filter too restrictive

**Solution:**
```sql
-- Check user preferences
SELECT match_preferences FROM profiles WHERE id = 'user-id';

-- Check available profiles
SELECT COUNT(*) FROM profiles 
WHERE is_active = TRUE 
  AND profile_completed = TRUE 
  AND id != 'user-id';
```

### Issue: Low compatibility scores

**Possible causes:**
1. Preferences too restrictive
2. Mismatched demographics
3. One-way compatibility

**Solution:**
- Broaden age range
- Remove gender/sexuality filters
- Increase distance range

---

## Future Enhancements

### Planned Features:
1. **AI-powered compatibility** - Machine learning for better matches
2. **Boost feature** - Temporarily increase visibility
3. **Rewind** - Undo last swipe
4. **Super like** - Express strong interest
5. **Smart recommendations** - Suggest preference adjustments
6. **Match explanations** - Show why profiles matched
7. **Compatibility insights** - Detailed breakdown of score

### Performance Improvements:
1. Cache compatibility scores
2. Pre-compute matches nightly
3. Geographic clustering for distance queries
4. Elasticsearch integration for advanced filters

---

## API Reference

### Frontend Service

```typescript
class MatchingService {
  // Get matched profiles
  static async getMatchedProfiles(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<MatchedProfile[]>
  
  // Record swipe action
  static async recordSwipe(
    userId: string,
    targetUserId: string,
    action: 'like' | 'pass' | 'super_like'
  ): Promise<SwipeResult>
  
  // Update user location
  static async updateLocation(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<void>
  
  // Get compatibility level
  static getCompatibilityLevel(score: number): {
    label: string;
    color: string;
    emoji: string;
  }
  
  // Format distance text
  static formatDistance(miles?: number): string
}
```

---

## Summary

✅ **Implemented:**
- Bidirectional matching algorithm
- Compatibility scoring (0-100)
- Distance-based filtering
- Swipe action tracking
- Automatic match creation
- Comprehensive RLS policies
- Performance optimizations
- Frontend service integration

✅ **Database Tables:**
- swipe_actions (new)
- profiles (enhanced with lat/long)

✅ **Functions:**
- calculate_distance()
- calculate_compatibility_score()
- get_matched_profiles()
- record_swipe_action()

✅ **Security:**
- RLS policies on all tables
- User data protection
- Private swipe history

The matching algorithm is production-ready and fully integrated with the Browse page!
