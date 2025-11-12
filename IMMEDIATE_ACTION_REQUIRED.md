# 🚨 IMMEDIATE ACTION REQUIRED - App is Down

## Current Status
❌ **ALL messaging is broken** (500 errors)  
❌ **Cannot send or view messages** (1-on-1 or group)  
❌ **Cause**: RLS policies were updated but database schema wasn't

---

## 🔴 STEP 1: EMERGENCY FIX (Do This Right Now!)

### Run This Script IMMEDIATELY:
📄 `/app/EMERGENCY_ROLLBACK.sql`

**How to run:**
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy ALL content from `/app/EMERGENCY_ROLLBACK.sql`
3. Paste and click **"Run"**
4. ✅ Wait for success message

**What it does:**
- Removes broken RLS policies (that reference non-existent tables)
- Restores old policies (match_id only)
- **Gets 1-on-1 messaging working immediately**

**Result:**
✅ 1-on-1 chats will work  
❌ Group chats won't work yet (need full migration)

---

## 🟡 STEP 2: Verify It's Working

After running the rollback:
1. **Refresh your app** (hard refresh: Ctrl+Shift+R)
2. **Open a 1-on-1 chat**
3. **Send a test message**
4. ✅ **Should work now!**

If it works, proceed to Step 3 for full group chat support.  
If it doesn't work, check Supabase logs and let me know the error.

---

## 🟢 STEP 3: Enable Group Chat (Optional - Do Later)

Once 1-on-1 messaging is working, you can add group chat support:

### A. Add Database Schema
📄 Run `/app/STEP_1_SETUP_DATABASE_SCHEMA.sql`
- Creates conversations and conversation_participants tables
- Adds conversation_id column to messages
- Sets up helper functions

### B. Update RLS Policies
📄 Run `/app/STEP_2_FIX_RLS_POLICIES.sql`
- Updates policies to support BOTH match_id and conversation_id
- Enables group chat messaging

### C. Test Both Types
- Test 1-on-1 chat still works ✓
- Test group chat works ✓

---

## What Went Wrong?

**Timeline:**
1. ✅ Frontend code updated (ChatPage, GroupAvatar, etc.)
2. ✅ RLS policy script created (STEP_2)
3. ❌ RLS policies were applied WITHOUT running schema setup first
4. ❌ Policies reference tables/columns that don't exist → 500 errors

**The Fix:**
- Rollback restores old policies → messaging works
- Then do proper migration: Schema first, then RLS policies

---

## Current Files

### Emergency (Run Now!)
- ✅ `/app/EMERGENCY_ROLLBACK.sql` - **RUN THIS FIRST**

### Full Migration (Run Later)
- `/app/STEP_1_SETUP_DATABASE_SCHEMA.sql` - Run first
- `/app/STEP_2_FIX_RLS_POLICIES.sql` - Run second

### Documentation
- `/app/FIX_INSTRUCTIONS.md` - Full migration guide
- `/app/IMMEDIATE_ACTION_REQUIRED.md` - This file

---

## FAQ

### "Why is everything broken?"
The new RLS policies reference `conversation_participants` table and `messages.conversation_id` column that don't exist yet. Database can't evaluate the policies → 500 error.

### "Will I lose data?"
No! The rollback only changes security policies, not data. All messages are safe.

### "Can I just skip group chat?"
Yes! After running the rollback, your app will work perfectly for 1-on-1 chats. Group chat is optional.

### "When should I run the full migration?"
Only when you're ready to enable group chat. For now, just get basic messaging working with the rollback.

### "How do I check if it worked?"
1. Check Supabase logs - should see no more 500 errors
2. Send a message in a 1-on-1 chat - should work
3. Look at browser console - no errors

---

## Summary

| Action | Priority | File | Status |
|--------|----------|------|--------|
| **Run rollback** | 🔴 URGENT | EMERGENCY_ROLLBACK.sql | ⏳ Waiting |
| Test 1-on-1 chat | 🔴 URGENT | - | ⏳ Waiting |
| Add schema | 🟡 Optional | STEP_1_SETUP_DATABASE_SCHEMA.sql | Later |
| Update policies | 🟡 Optional | STEP_2_FIX_RLS_POLICIES.sql | Later |

---

## Next Steps

1. **Right now:** Run `/app/EMERGENCY_ROLLBACK.sql`
2. **In 1 minute:** Test that messaging works
3. **Later (optional):** Run full migration for group chat

🎯 **Goal:** Get your app working again ASAP. Group chat can wait!
