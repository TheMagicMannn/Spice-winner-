# 🔧 LOGIN FIX & ADMIN DASHBOARD ACCESS GUIDE

## 🚨 IMMEDIATE FIX NEEDED - Login is Currently Broken!

**Error:** `ERROR: record "new" has no field "last_sign_in_ip"`

### Why Login is Failing:
Your database has a trigger (`track_user_login`) that tries to access a field `last_sign_in_ip` that doesn't exist in Supabase's `auth.users` table. This was likely added in the admin dashboard setup but uses an outdated field reference.

---

## ✅ STEP 1: Fix the Database Trigger (REQUIRED)

### Go to Supabase Dashboard:
1. Open https://supabase.com/dashboard
2. Select your project: **cbefwjwqworwfctadogk**
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query**

### Run This SQL:
Copy and paste the entire contents of `/app/FIX_LOGIN_TRIGGER.sql` into the SQL editor and click **RUN**.

**Or copy this:**

```sql
-- Drop the broken trigger
DROP TRIGGER IF EXISTS trigger_track_login ON auth.users;

-- Fix the function
CREATE OR REPLACE FUNCTION track_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_sign_in_at > OLD.last_sign_in_at OR OLD.last_sign_in_at IS NULL THEN
        PERFORM log_user_activity(
            NEW.id,
            'user_login',
            jsonb_build_object(
                'email', NEW.email,
                'timestamp', NEW.last_sign_in_at
            ),
            NULL,
            NULL
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER trigger_track_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION track_user_login();
```

### Verify the Fix:
Run this query to confirm:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'trigger_track_login';
```

You should see one row returned. ✅

---

## 🔐 STEP 2: Login to Your App

### Your Login Credentials:
- **URL:** https://spice-winner.vercel.app/
- **Email:** kwitter1982@gmail.com
- **Password:** [Your password]

### After Login:
You'll be redirected to the main dashboard/community page.

---

## 🛡️ STEP 3: Access the Admin Dashboard

### Admin Dashboard URL:
```
https://spice-winner.vercel.app/#/admin/dashboard
```

**OR** Navigate from the app:
1. Login to the app
2. Go to your Profile page
3. If you're an admin, you'll see an "Admin Dashboard" link/button

### Admin Dashboard Features:
The new admin dashboard includes 6 tabs:

1. **Overview** - Daily stats (signups, logins, messages, revenue)
2. **Verification** - Link to user verification panel
3. **Users** - Search/manage users, reset passwords, update memberships
4. **Activity Log** - View all user activities with filters
5. **Memberships** - Manage Premium/VIP/Platinum memberships
6. **Reports** - Review user reports and generate activity reports

---

## 🚩 STEP 4: User Reporting System

### For Regular Users (In Chat):
1. Open any chat conversation
2. Click the **⋮** (three dots) menu in the top-right
3. Select **"Report User"**
4. Choose report category:
   - Harassment or bullying
   - Inappropriate content
   - Spam or scam
   - Fake profile
   - Hate speech
   - Violence or threats
   - Other
5. Add details (optional)
6. Choose actions:
   - ✅ Block this user
   - ✅ Hide conversation

### For Admins (Review Reports):
1. Go to Admin Dashboard → **Reports** tab
2. View all reports with status filters:
   - 🟡 Pending
   - 🔵 Reviewed
   - 🟢 Resolved
   - ⚪ Dismissed
3. Click **"Review"** on any pending report
4. Add admin notes
5. Take action: **Mark Reviewed**, **Resolve**, or **Dismiss**

---

## 🔍 How to Check if You're an Admin

### Method 1: Supabase Dashboard
1. Go to Supabase → Table Editor
2. Open `profiles` table
3. Find your user by email: `kwitter1982@gmail.com`
4. Check the `is_admin` column - it should be `true`

### Method 2: SQL Query
```sql
SELECT id, display_name, email, is_admin 
FROM profiles 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'kwitter1982@gmail.com'
);
```

### Make Yourself Admin (if needed):
```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'kwitter1982@gmail.com'
);
```

---

## 📊 Vercel Deployment Status

### ✅ Build Fixed!
The Vercel build error has been resolved. All missing admin components are now created:
- ✅ `UsersManagementTab.tsx`
- ✅ `ActivityLogTab.tsx`
- ✅ `MembershipsTab.tsx`
- ✅ `ReportsTab.tsx`

### Redeploy to Vercel:
Your latest commit should now build successfully!

---

## 🐛 Troubleshooting

### Still Can't Login?
1. **Clear browser cache** and try again
2. Check Supabase logs for errors
3. Verify the trigger fix was applied correctly
4. Try password reset: https://spice-winner.vercel.app/#/forgot-password

### Can't See Admin Dashboard?
1. Verify `is_admin = true` in your profile
2. Clear browser cache
3. Try direct URL: `/#/admin/dashboard`

### Reports Not Showing?
1. Check `user_reports` table exists in Supabase
2. Verify RLS policies allow admins to view reports
3. Check browser console for errors

---

## 📝 Summary of Changes Made

1. **Fixed Vercel Build Error** - Created 4 missing admin tab components
2. **Added User Reporting** - Users can report others in chat
3. **Admin Report Review** - Admins can review and manage reports
4. **Fixed Login Trigger** - Removed reference to non-existent `last_sign_in_ip` field
5. **Added Admin Dashboard Route** - Accessible at `/#/admin/dashboard`

---

## 🆘 Need Help?

If you're still having issues:
1. Check Supabase logs: Dashboard → Logs → Auth
2. Check browser console for errors (F12)
3. Verify database schema matches the SQL files
4. Ensure admin permissions are set correctly

---

## 🎉 All Done!

Once you run the SQL fix in Step 1, you should be able to:
- ✅ Login successfully
- ✅ Access the admin dashboard
- ✅ Review user reports
- ✅ Manage users and memberships

**Your admin dashboard is ready at:** `https://spice-winner.vercel.app/#/admin/dashboard`
