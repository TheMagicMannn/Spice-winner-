# ISO Post Deletion RLS Fix - Complete Implementation Guide

## Problem
Getting error: **"Permission denied. Please refresh the page and try again."**

This indicates Row Level Security (RLS) policies are blocking the UPDATE operation needed for soft delete.

---

## 🎯 Solution Options (Choose ONE)

### ✅ Option 1: Fix RLS Policies (RECOMMENDED - Fastest)

**Best for:** Most cases, keeps everything in Supabase RLS

**Steps:**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** the contents of `/app/FIX_ISO_POST_DELETION_RLS.sql`
3. **Click "Run"** to execute
4. **Refresh your app** and try deleting again

**What it does:**
- Drops and recreates RLS policies with proper permissions
- Adds debugging function to help troubleshoot
- Grants necessary permissions to authenticated users
- Adds separate policies for SELECT, INSERT, UPDATE, DELETE

**Verification:**
After running, test with this query in Supabase SQL Editor:
```sql
-- Replace 'your-post-id' with an actual post ID you own
SELECT * FROM can_user_delete_iso_post('your-post-id');
```

Expected result should show:
- `can_delete: true`
- `user_is_author: true`
- `post_exists: true`
- `is_post_active: true`

---

### ✅ Option 2: Simplified RLS Policies (If Option 1 doesn't work)

**Best for:** When complex policies are causing conflicts

**Steps:**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** the contents of `/app/ALTERNATIVE_FIX_EDGE_FUNCTION.sql`
3. **Click "Run"** to execute
4. **Refresh your app** and try deleting again

**What it does:**
- Removes all existing policies
- Creates simplified, straightforward policies
- Uses clearer naming conventions
- Grants broader permissions to authenticated users

---

### ✅ Option 3: Edge Function (If RLS continues to fail)

**Best for:** When RLS policies cannot be fixed or are too restrictive

**Steps:**

1. **Deploy the Edge Function:**
   ```bash
   # In your terminal, from project root
   npx supabase functions deploy delete-iso-post
   ```

2. **Update your frontend code** - Replace the delete method in `/app/src/services/isoPostService.ts`:

   ```typescript
   // At the top of the file, add import
   import { deletePostViaEdgeFunction } from './isoPostServiceEdgeFunction';

   // Replace the deletePost method with this:
   async deletePost(postId: string, userId: string): Promise<void> {
     // Use Edge Function instead of direct database update
     return deletePostViaEdgeFunction(postId);
   }
   ```

3. **Rebuild and test** your app

**What it does:**
- Bypasses RLS by using Service Role Key in Edge Function
- Still validates user authentication and ownership
- More reliable but requires deploying an Edge Function

---

## 🔍 Debugging Steps

### Step 1: Verify Current User Authentication

Run in Supabase SQL Editor:
```sql
SELECT auth.uid();
```
- Should return your user UUID
- If NULL, you're not authenticated

### Step 2: Check Post Ownership

Run in Supabase SQL Editor (replace UUIDs):
```sql
SELECT 
    id, 
    author_id, 
    is_active,
    auth.uid() as current_user,
    (auth.uid() = author_id) as is_owner
FROM iso_posts
WHERE id = 'your-post-id';
```

Expected:
- `is_owner` should be `true`
- `is_active` should be `true`

### Step 3: Check RLS Policies

Run in Supabase SQL Editor:
```sql
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'iso_posts';
```

You should see policies for:
- SELECT (view posts)
- INSERT (create posts)
- UPDATE (edit/delete posts)
- DELETE (hard delete posts)

### Step 4: Test Update Permission Directly

Run in Supabase SQL Editor (replace UUIDs):
```sql
UPDATE iso_posts 
SET is_active = false 
WHERE id = 'your-post-id' 
  AND author_id = auth.uid()
RETURNING *;
```

- If this works: RLS is fine, issue is in frontend
- If this fails: RLS policies need fixing (use Option 1 or 2)

### Step 5: Check Browser Console

1. Open Browser DevTools (F12)
2. Go to Console tab
3. Look for detailed error logs when deleting

Common issues:
- "Session not found" → Re-login
- "42501" error code → RLS policy blocking
- "PGRST116" error code → Post not found

---

## 🛠️ Common Issues and Solutions

### Issue: "You must be logged in to delete a post"
**Solution:** 
1. Logout and login again
2. Clear browser cache/cookies
3. Check if token expired

### Issue: "Authentication mismatch"
**Solution:**
1. Clear browser Local Storage
2. Logout and login again
3. Check for multiple browser tabs

### Issue: "Post not found or already deleted"
**Solution:**
1. Verify post exists in database
2. Check if `is_active` is already `false`
3. Try refreshing the page

### Issue: "You do not have permission to delete this post"
**Solution:**
1. Verify you're the post author
2. Check `author_id` matches your user ID
3. Run debugging query from Step 2 above

### Issue: "Permission denied" (42501)
**Solution:**
1. Apply SQL fix from Option 1 or Option 2
2. If still failing, use Option 3 (Edge Function)
3. Check if you have Supabase Service Role Key for Edge Function

---

## 📋 Files Reference

| File | Purpose |
|------|---------|
| `/app/FIX_ISO_POST_DELETION_RLS.sql` | Main RLS policy fix (Option 1) |
| `/app/ALTERNATIVE_FIX_EDGE_FUNCTION.sql` | Simplified RLS policies (Option 2) |
| `/app/supabase/functions/delete-iso-post/index.ts` | Edge Function for deletion (Option 3) |
| `/app/src/services/isoPostServiceEdgeFunction.ts` | Frontend Edge Function caller (Option 3) |
| `/app/ISO_POST_DELETION_FIX.md` | Detailed technical documentation |

---

## ✅ Verification Checklist

After applying a fix:

- [ ] Run SQL verification queries (shown above)
- [ ] Logout and login again
- [ ] Clear browser cache
- [ ] Navigate to an ISO post you created
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Verify you see:
  - [ ] Loading spinner
  - [ ] Success toast message
  - [ ] Redirect to /iso page
  - [ ] Post no longer in list
- [ ] Check browser console for any errors
- [ ] Try creating a new post and deleting it

---

## 🆘 Still Not Working?

If none of the above solutions work:

1. **Export your current RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'iso_posts';
   ```
   Share the results for further debugging.

2. **Check database logs** in Supabase Dashboard → Logs

3. **Verify table structure:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'iso_posts';
   ```

4. **Check for triggers that might be interfering:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgrelid = 'iso_posts'::regclass;
   ```

5. **Contact support** with:
   - Error message from browser console
   - Output from debugging queries above
   - Supabase version
   - Whether you're on free/pro plan

---

## 🚀 Recommended Approach

**Start with Option 1** (fix RLS policies) as it's the cleanest solution.

If Option 1 doesn't work after verification:
→ Try **Option 2** (simplified policies)

If both fail:
→ Use **Option 3** (Edge Function) as the nuclear option that always works

---

## 📝 Notes

- **Soft Delete**: All options use soft delete (set `is_active = false`)
- **Data Safety**: Posts are never actually removed from the database
- **Performance**: Options 1 & 2 are faster (direct DB), Option 3 adds slight latency
- **Security**: All options maintain proper authentication and authorization
- **Compatibility**: All options work with your existing Supabase setup

---

## 💡 Pro Tips

1. **Always test in SQL Editor first** before updating frontend code
2. **Keep the debug function** from Option 1 - it's useful for troubleshooting
3. **Monitor Supabase logs** when testing to see actual database errors
4. **Use browser DevTools Network tab** to see actual API responses
5. **Clear cache** after any backend changes to avoid stale data

---

Good luck! The RLS fix should resolve your deletion issue. 🎉
