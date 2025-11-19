# Test Activity Logging - Step by Step

## Issue Summary
1. ✅ Only login activities showing - **NEED TO TEST OTHER ACTIVITIES**
2. ⚠️ IP addresses not captured - **FIXED in activityLogService.ts**
3. ⚠️ Overview stats empty - **NEED TO RUN SQL SCRIPT**

---

## Fix Steps (Do in Order)

### Step 1: Run SQL Script

**File:** `/app/FIX_ACTIVITY_TYPES_AND_STATS.sql`

1. Open Supabase SQL Editor
2. Copy entire file
3. Paste and click RUN

**This will:**
- ✅ Update activity type constraints to allow all types
- ✅ Generate daily reports for last 7 days
- ✅ Show you current activities breakdown
- ✅ Show IP capture rate
- ✅ Display sample activities with details

**Expected Output:**
```
✅ Activity type constraint updated!
📊 Current activities in database: [shows breakdown]
✅ Daily reports generated for last 7 days!
📈 Daily reports: [shows 7 days of data]
🌐 IP Address capture: [shows capture rate]
📋 Recent activities: [shows 5 recent with IP, user agent, etc.]
```

---

### Step 2: Clear Browser Cache & Reload App

Frontend code has been updated to capture IP addresses automatically.

**Do this:**
1. Close your app tab
2. Open new incognito/private window
3. Go to your app
4. Login

**Or hard refresh:**
- Chrome: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Safari: Cmd+Option+R

---

### Step 3: Test Each Activity Type

**A. Test Login** ✅ (Already working)
```
Action: Login to your app
Check: Admin Dashboard → Activity Log
Expected: Login activity with:
  - ✅ Email
  - ✅ Timestamp
  - ✅ IP address (new!)
  - ✅ User agent (new!)
  - ✅ URL (new!)
```

**B. Test Profile Update**
```
Action: 
1. Go to Profile/Settings
2. Update your bio or any field
3. Save changes

Check: Admin Dashboard → Activity Log
Expected: "profile_update" activity showing:
  - Updated fields list
  - IP address
  - Timestamp
```

**C. Test Photo Upload**
```
Action:
1. Go to Profile
2. Upload a new photo
3. Save

Check: Admin Dashboard → Activity Log
Expected: "photo_upload" activity
```

**D. Test Like/Swipe**
```
Action:
1. Go to Browse/Discover
2. Swipe right (like) on a profile

Check: Admin Dashboard → Activity Log
Expected: "like" activity with:
  - Target user ID
  - IP address
```

**E. Test Message**
```
Action:
1. Go to Messages
2. Send a message to a match

Check: Admin Dashboard → Activity Log
Expected: "message" activity with:
  - Recipient ID
  - Conversation ID
```

---

### Step 4: Verify Overview Stats

**After testing activities above:**

1. Go to Admin Dashboard → Overview tab
2. Should now see:
   - ✅ Today's signups count
   - ✅ Today's logins count
   - ✅ Today's messages count
   - ✅ Charts with 7 days of data
   - ✅ Activity distribution pie chart

**If still empty, run this:**
```sql
-- Generate report for today
SELECT generate_daily_report(CURRENT_DATE);

-- Check it worked
SELECT * FROM daily_activity_reports 
WHERE report_date = CURRENT_DATE;
```

---

## Troubleshooting

### Problem: Still only seeing logins

**Check constraint:**
```sql
-- See what's allowed
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.user_activity_log'::regclass
AND conname LIKE '%activity_type%';
```

**If "profile_update" not in list, run:**
```sql
ALTER TABLE user_activity_log 
DROP CONSTRAINT user_activity_log_activity_type_check;

ALTER TABLE user_activity_log 
ADD CONSTRAINT user_activity_log_activity_type_check 
CHECK (activity_type IN (
  'login', 'signup', 'profile_view', 'profile_update',
  'like', 'match', 'message', 'photo_upload',
  'payment', 'verification_requested', 'verification_completed'
));
```

---

### Problem: No IP addresses captured

**Check browser console:**
1. Open your app
2. Press F12
3. Login
4. Look for: `[ActivityLog] Logging activity: login`
5. Should show IP address

**If no IP showing:**
- Check if ipify.org is blocked (firewall/adblocker)
- IP will be null but activity still logs
- That's okay - not critical

---

### Problem: Overview still empty

**Manual fix:**
```sql
-- Delete old reports
DELETE FROM daily_activity_reports;

-- Regenerate for last 7 days
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 0..6 LOOP
        PERFORM generate_daily_report(CURRENT_DATE - i);
    END LOOP;
END $$;

-- Verify
SELECT * FROM daily_activity_reports ORDER BY report_date DESC;
```

---

## Expected Results After Fixes

### Activity Log Tab
```
📋 Recent Activities:

🟢 login - john@example.com
   IP: 192.168.1.1
   User Agent: Mozilla/5.0 (iPhone...)
   URL: https://yourapp.com/login
   2 minutes ago

🟡 profile_update - john@example.com
   Fields: bio, location
   IP: 192.168.1.1
   5 minutes ago

🔵 message - john@example.com → jane@example.com
   Conversation: abc-123
   IP: 192.168.1.1
   10 minutes ago

💗 like - john@example.com
   Liked: jane@example.com
   IP: 192.168.1.1
   15 minutes ago
```

### Overview Tab
```
📊 Today's Stats:
Signups: 5
Logins: 23
Messages: 47
Matches: 8

📈 7-Day Trend Chart:
[Shows line/area chart with data points]

🥧 Activity Distribution:
Logins: 40%
Messages: 35%
Likes: 15%
Profile Updates: 10%
```

---

## Verification Queries

**Run these to verify everything:**

```sql
-- 1. Check all activity types present
SELECT DISTINCT activity_type, COUNT(*) 
FROM user_activity_log 
GROUP BY activity_type;

-- 2. Check IP capture rate
SELECT 
    COUNT(*) as total,
    COUNT(ip_address) as with_ip,
    ROUND(100.0 * COUNT(ip_address) / COUNT(*), 1) || '%' as capture_rate
FROM user_activity_log;

-- 3. Check today's activities
SELECT activity_type, COUNT(*) 
FROM user_activity_log 
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY activity_type;

-- 4. Check daily reports exist
SELECT report_date, total_logins, total_messages, active_users
FROM daily_activity_reports 
ORDER BY report_date DESC;
```

---

## Summary

**What Was Fixed:**
1. ✅ Activity logging service now captures IP addresses automatically
2. ✅ Activity logging service enriches data with user agent, URL, timestamp
3. ✅ Activity type constraints updated to allow all activity types
4. ✅ SQL script to generate daily reports
5. ✅ Better console logging for debugging

**What You Need To Do:**
1. Run `/app/FIX_ACTIVITY_TYPES_AND_STATS.sql` in Supabase
2. Hard refresh your app (clear cache)
3. Test each activity type (profile update, message, like)
4. Check Admin Dashboard

**Files Modified:**
- `/app/src/services/activityLogService.ts` - Now captures IP + metadata
- Created: `/app/FIX_ACTIVITY_TYPES_AND_STATS.sql` - Fixes constraints & reports
- Created: `/app/TEST_ACTIVITY_LOGGING.md` - This testing guide

---

**Next Step:** Run the SQL script, then test your app!
