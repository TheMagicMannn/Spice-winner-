# 🔧 RLS Infinite Recursion Fix Guide

## 🚨 Error You're Seeing

```
infinite recursion detected in policy for relation "conversation_participants"
```

## 🔍 Root Cause

The RLS policy for `conversation_participants` was querying itself, creating an infinite loop:

```sql
-- PROBLEMATIC POLICY (causes recursion)
CREATE POLICY "..." ON conversation_participants
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants  -- ❌ Querying self!
            WHERE user_id = auth.uid()
        )
    );
```

## ✅ Solution

Use a `SECURITY DEFINER` function that bypasses RLS when checking membership.

### Option 1: Apply Quick Fix (Recommended)

Run this single file in Supabase SQL Editor:

**File**: `/app/FIX_RLS_INFINITE_RECURSION.sql`

This will:
- ✅ Create helper function `user_is_in_conversation()`
- ✅ Drop and recreate all problematic policies
- ✅ Fix conversations, conversation_participants, messages, and typing_indicators policies

### Option 2: Use Updated Migration Script

If you haven't run the migration yet, use the updated version:

**File**: `/app/CHAT_SCHEMA_MIGRATION_FIX.sql` (now includes the fix)

This already includes the recursion fix built-in.

## 🛠️ What Gets Fixed

### Helper Function Created:
```sql
CREATE FUNCTION user_is_in_conversation(
    conversation_id_param UUID,
    user_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER  -- Bypasses RLS
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = conversation_id_param
        AND user_id = user_id_param
        AND is_active = TRUE
    );
$$;
```

### Policies Fixed:

1. **conversation_participants**:
```sql
CREATE POLICY "Users can view participants in their conversations"
    ON conversation_participants
    FOR SELECT
    USING (
        user_is_in_conversation(conversation_id, auth.uid())  -- ✅ No recursion
    );
```

2. **conversations**:
```sql
CREATE POLICY "Users can view their conversations"
    ON conversations
    FOR SELECT
    USING (
        user_is_in_conversation(id, auth.uid())  -- ✅ Uses helper
    );
```

3. **messages**:
```sql
CREATE POLICY "Users can view messages in their conversations"
    ON messages
    FOR SELECT
    USING (
        (conversation_id IS NOT NULL AND user_is_in_conversation(conversation_id, auth.uid()))
        OR
        (match_id IS NOT NULL AND ...)
    );
```

4. **typing_indicators**: Same pattern

## 📋 Steps to Apply

### If Messages/Chats Not Working:

1. **Open Supabase SQL Editor**
2. **Run this file**: `/app/FIX_RLS_INFINITE_RECURSION.sql`
3. **Wait for completion** (should take 2-3 seconds)
4. **Test**: Try creating a group chat or sending a message

### Verify the Fix:

Run this query to check if the helper function exists:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'user_is_in_conversation';
```

Should return:
```
user_is_in_conversation | FUNCTION
```

### Test Policies:

Try this query (should work without errors):

```sql
SELECT * FROM conversation_participants LIMIT 1;
```

If you see results (or no results but no error), the fix worked!

## 🎯 Why This Works

**SECURITY DEFINER** functions:
- Execute with the permissions of the function owner (not the caller)
- Bypass RLS policies when querying tables
- Break the recursion loop

When the policy calls `user_is_in_conversation()`:
1. Policy starts checking
2. Function runs with elevated privileges
3. Function queries `conversation_participants` **without triggering RLS**
4. Function returns true/false
5. Policy uses the result - no recursion!

## 🧪 Testing

After applying the fix, test these scenarios:

### Test 1: Create Direct Conversation
```sql
SELECT get_or_create_direct_conversation(
    'user-1-uuid'::uuid,
    'user-2-uuid'::uuid
);
```

Should return a conversation_id without errors.

### Test 2: Create Group Chat
```sql
SELECT create_group_conversation(
    'creator-uuid'::uuid,
    'Test Group',
    ARRAY['participant-1-uuid'::uuid, 'participant-2-uuid'::uuid]
);
```

Should return a conversation_id.

### Test 3: View Participants
```sql
SELECT * FROM conversation_participants
WHERE user_id = auth.uid();
```

Should show your participant records without recursion error.

### Test 4: Send Message (via app)
Try sending a message in the app. Should work without errors.

## 🚨 Troubleshooting

### Error: "function already exists"
**Solution**: The script uses `CREATE OR REPLACE`, so this should work. If not, manually drop:
```sql
DROP FUNCTION IF EXISTS user_is_in_conversation(UUID, UUID);
```
Then re-run the fix script.

### Error: "permission denied for function"
**Solution**: Grant execute permission:
```sql
GRANT EXECUTE ON FUNCTION user_is_in_conversation(UUID, UUID) TO authenticated;
```

### Still seeing recursion errors?
**Solution**: 
1. Check if the old policies are still there:
```sql
SELECT policyname FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'typing_indicators');
```

2. Drop all old policies and re-run the fix script.

### Messages work but groups don't?
**Solution**: Check if `conversation_participants` has the INSERT policy:
```sql
SELECT * FROM pg_policies
WHERE tablename = 'conversation_participants'
AND cmd = 'INSERT';
```

Should have a policy allowing INSERT. If not, run:
```sql
CREATE POLICY "System can insert participants" ON conversation_participants
    FOR INSERT
    WITH CHECK (true);
```

## ✅ Success Indicators

After the fix, you should be able to:
- ✅ Create direct messages
- ✅ Create group chats
- ✅ Send messages in both
- ✅ View conversation participants
- ✅ See typing indicators
- ✅ No "infinite recursion" errors in Supabase logs

## 📝 Summary

**Problem**: RLS policy querying the same table it's protecting → infinite recursion

**Solution**: Helper function with `SECURITY DEFINER` bypasses RLS → breaks the loop

**Files to Use**:
- Quick Fix: `/app/FIX_RLS_INFINITE_RECURSION.sql`
- Full Migration: `/app/CHAT_SCHEMA_MIGRATION_FIX.sql` (already includes fix)

Run either file in Supabase SQL Editor, and your chat functionality will work! 🎉
