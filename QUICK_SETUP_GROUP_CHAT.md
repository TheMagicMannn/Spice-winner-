# Quick Setup Guide - Group Chat & Enhanced Messaging

## ⚠️ IMPORTANT: You're seeing a 500 error because the database hasn't been set up yet!

The "New Message" feature and group chat require database changes. Here's how to fix it:

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **cbefwjwqworwfctadogk**
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

## Step 2: Run the Database Schema

1. Open the file `/app/GROUP_CHAT_SCHEMA.sql` in this project
2. Copy the **ENTIRE contents** of that file
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

✅ You should see: "Success. No rows returned"

## Step 3: Test the Feature

1. Go back to your app
2. Click the **"New"** button on the messages page
3. It should now work! 🎉

---

## What This Does:

✅ Creates `conversations` table (for both direct & group chats)
✅ Creates `conversation_participants` table (manages group members)
✅ Creates helper functions for conversation management
✅ Sets up security policies (RLS)
✅ Adds support for group chats with unlimited participants

---

## Current Status (Before Running Schema):

⚠️ "New Message" button exists but will show error when creating groups
✅ Direct messages to existing matches still work via fallback
⚠️ Group chat features won't work until schema is run

---

## After Running Schema:

✅ "New Message" button fully functional
✅ Can create direct conversations with any mutual match
✅ Can create group chats with multiple users
✅ Can add/remove members from groups
✅ All features operational

---

## Optional: Migrate Existing Messages

If you want to convert your existing match-based messages to the new conversation system:

1. After running the main schema, run this in SQL Editor:
```sql
SELECT migrate_matches_to_conversations();
```

This will:
- Keep all existing messages
- Convert matches to conversations
- Link messages to conversations
- Preserve all data

**Note:** This is optional - the system works with both old and new messages!

---

## Troubleshooting

### Error: "relation 'conversations' does not exist"
**Solution:** You haven't run the schema yet. Follow Step 2 above.

### Error: "function get_or_create_direct_conversation does not exist"
**Solution:** Same as above - run the GROUP_CHAT_SCHEMA.sql file.

### Error: "No match found between these users"
**Solution:** You can only message users you've matched with. Make sure you have an active match.

---

## Need Help?

If you see any errors after running the schema:
1. Check the Supabase logs for specific error messages
2. Make sure the entire schema was executed (it's a long file!)
3. Verify that RLS policies were created successfully
4. Check that all functions show up in Database > Functions

---

## Files Reference

- **Database Schema:** `/app/GROUP_CHAT_SCHEMA.sql` (Run this!)
- **Service Layer:** `/app/src/services/conversationService.ts`
- **New Message Modal:** `/app/src/components/NewMessageModal.tsx`
- **Full Guide:** `/app/GROUP_CHAT_IMPLEMENTATION_GUIDE.md`

---

**The code is already deployed and ready to use - you just need to run the database schema! Takes less than 1 minute.** ⚡
