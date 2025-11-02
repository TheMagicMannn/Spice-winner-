# Message Interactions Troubleshooting Guide

## Issue: Reactions and Replies Not Working

### Root Causes Fixed:
1. ✅ Database columns were missing (reply_to_id, reactions)
2. ✅ transformMessage function wasn't including new fields
3. ✅ getMessages query wasn't fetching reply data
4. ✅ Reaction emoji picker state issue
5. ✅ Reaction click handler not working

## CRITICAL: Database Setup Required

**You MUST run this SQL before the features will work!**

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Copy and Run the SQL
Copy the ENTIRE contents of `/app/MESSAGE_INTERACTIONS_SCHEMA.sql` and paste it into the SQL editor, then click "Run".

**Expected Output:**
```
NOTICE: Added reply_to_id column
NOTICE: Added reactions column
NOTICE: ✅ SUCCESS: All columns created successfully!
NOTICE: ✅ reply_to_id column: EXISTS
NOTICE: ✅ reactions column: EXISTS
NOTICE: ✅ You can now use message interactions
```

### Step 3: Verify Columns Exist
Run this query to verify:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('reply_to_id', 'reactions');
```

**Should return:**
| column_name  | data_type |
|-------------|-----------|
| reply_to_id | uuid      |
| reactions   | jsonb     |

## Code Fixes Applied

### 1. Fixed messageService.ts

**transformMessage Function:**
- Added `replyToId`, `replyToMessage`, and `reactions` fields
- Ensures data is properly mapped from database

**getMessages Function:**
- Now fetches reply message data using join
- Returns complete message with reply context

**sendReplyMessage Function:**
- Fetches reply message data after insert
- Returns complete message object

### 2. Fixed ChatModal.tsx

**handleReactToMessage:**
- Fixed state management issue
- Now properly keeps messageId when showing emoji picker

**Reaction Click Handler:**
- Fixed inline handler in reaction buttons
- Now correctly toggles reactions when clicking existing reactions

## Testing the Fixes

### Test 1: Reactions
1. Long-press any message
2. Select "React"
3. Choose an emoji from picker
4. **Expected:** Emoji appears below message immediately ✅
5. Click the emoji again
6. **Expected:** Emoji disappears (toggle off) ✅

### Test 2: Multiple Reactions
1. React to a message with ❤️
2. Ask another user to react with ❤️ too
3. **Expected:** Shows "❤️ 2" ✅
4. React with different emoji 😂
5. **Expected:** Shows both "❤️ 2" and "😂 1" ✅

### Test 3: Reply
1. Long-press any message
2. Select "Reply"
3. **Expected:** Reply preview appears above input ✅
4. Type your message
5. **Expected:** Can type normally ✅
6. Send message
7. **Expected:** Message shows with quoted original ✅

### Test 4: View Reply
1. Send a reply message
2. **Expected:** Original message shows in gray box above reply ✅
3. Shows "Replying to" text
4. Shows truncated original message content

## Common Issues & Solutions

### Issue: "Cannot add or update a child row: foreign key constraint fails"

**Cause:** Database columns don't exist yet

**Solution:**
1. Make sure you ran the SQL from Step 1
2. Verify columns exist using Step 3 query
3. Restart your app/refresh browser

### Issue: Reactions appear but disappear after refresh

**Cause:** Real-time not updating properly

**Solution:**
1. Check Supabase realtime is enabled for messages table
2. Go to Database → Replication
3. Enable "messages" table
4. Refresh your app

### Issue: Reply preview doesn't show

**Cause:** replyToMessage data not fetched

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors

### Issue: Can't type when replying

**Cause:** This was a bug, now fixed!

**What was wrong:**
- Input field was getting disabled incorrectly
- State management issue

**What's fixed:**
- Removed input disable logic
- Input always enabled when not recording

### Issue: Clicking reaction emoji doesn't work

**Cause:** This was a bug, now fixed!

**What was wrong:**
- Click handler was calling wrong function
- MessageId wasn't being passed correctly

**What's fixed:**
- Inline async handler with correct messageId
- Direct call to toggleReaction
- Immediate state update

## Verification Checklist

Before considering this "working", verify:

- [ ] Ran SQL schema update in Supabase
- [ ] Verified columns exist in database
- [ ] Can add reactions to messages
- [ ] Reactions persist after refresh
- [ ] Can click reactions to toggle
- [ ] Reaction count increases with multiple users
- [ ] Can see reply preview when replying
- [ ] Can type message when replying
- [ ] Reply sends successfully
- [ ] Can see original message in reply
- [ ] Can copy message text
- [ ] Can unsend own messages

## Browser Console Debugging

If features still don't work, check console:

**Open DevTools:** Press F12

**Check for these errors:**

❌ **"Cannot add or update a child row"**
→ Database columns missing, run SQL

❌ **"column 'reply_to_id' does not exist"**
→ Database not updated, run SQL

❌ **"Cannot read property 'userId' of undefined"**
→ User not authenticated properly

❌ **"toggleReaction is not a function"**
→ Code not updated, hard refresh browser

✅ **No errors in console**
→ Everything working!

## Database Query for Manual Testing

Test reactions directly:
```sql
-- Add a test reaction
UPDATE messages 
SET reactions = '[{"userId": "your-user-id", "emoji": "❤️", "createdAt": "2025-01-01T00:00:00Z"}]'::jsonb
WHERE id = 'some-message-id';

-- View reactions
SELECT id, content, reactions 
FROM messages 
WHERE reactions != '[]'::jsonb 
LIMIT 10;
```

Test replies:
```sql
-- Create a reply
INSERT INTO messages (match_id, sender_id, content, message_type, reply_to_id)
VALUES ('match-id', 'user-id', 'This is a reply', 'text', 'original-message-id');

-- View replies with original messages
SELECT 
  m.id,
  m.content,
  m.reply_to_id,
  r.content as original_content
FROM messages m
LEFT JOIN messages r ON m.reply_to_id = r.id
WHERE m.reply_to_id IS NOT NULL;
```

## Still Not Working?

If you've done everything above and it still doesn't work:

1. **Check Supabase Logs:**
   - Dashboard → Logs
   - Look for database errors

2. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'messages';
   ```
   - Should include UPDATE policy for reactions

3. **Verify Data:**
   ```sql
   SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;
   ```
   - Check if reply_to_id and reactions columns show

4. **Clear Everything:**
   - Clear browser cache
   - Log out and log back in
   - Close all tabs
   - Open fresh tab

5. **Check Network Tab:**
   - F12 → Network tab
   - Try adding reaction
   - Look for failed requests
   - Check request/response data

## Success Indicators

You'll know everything is working when:

✅ Emoji picker appears when you click "React"
✅ Emoji appears below message immediately
✅ Emoji count shows correctly
✅ Reply preview shows above input
✅ Can type and send reply
✅ Reply shows with quoted original message
✅ All features persist after refresh
✅ No errors in browser console
✅ Features work for both users in conversation

## Summary of All Fixes

| Issue | Fix Applied |
|-------|------------|
| Reactions not saving | Added reactions column to database |
| Reactions not showing | Updated transformMessage to include reactions |
| Reactions not persisting | Added GIN index for JSONB |
| Reply not working | Added reply_to_id column |
| Reply message not showing | Updated getMessages with join query |
| Can't type when replying | Fixed state management in ChatModal |
| Emoji picker empty | No issue - 24 emojis hardcoded |
| Click reaction doesn't work | Fixed click handler with messageId |
| State not updating | Added local state updates after API calls |

Everything should now work perfectly! 🎉
