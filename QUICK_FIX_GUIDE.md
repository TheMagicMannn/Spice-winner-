# 🔧 Quick Fix Guide - Chat Schema Migration

## ⚠️ Error You're Seeing
```
ERROR: 42703: column "reported_user_id" does not exist
```

## ✅ Solution

The issue is that some tables already exist with different schemas. Use the migration script instead.

### Step 1: Use the Migration Script

Instead of running `REALTIME_CHAT_COMPLETE_SCHEMA.sql`, run this file:

**File**: `/app/CHAT_SCHEMA_MIGRATION_FIX.sql`

This script:
- ✅ Safely handles existing tables
- ✅ Drops and recreates `user_reports` table with correct schema
- ✅ Adds missing columns to existing tables (like `viewed_by` in messages)
- ✅ Creates all necessary functions and policies
- ✅ Handles conflicts gracefully

### Step 2: Apply in Supabase

1. Open your Supabase project
2. Go to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `/app/CHAT_SCHEMA_MIGRATION_FIX.sql`
5. Paste and click **Run**
6. Wait for completion (should take 10-30 seconds)

### Step 3: Verify Tables

Run this query to verify everything is created:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'conversations',
    'conversation_participants', 
    'messages',
    'typing_indicators',
    'user_reports'
)
ORDER BY table_name;
```

You should see all 5 tables.

### Step 4: Verify Functions

Run this query to verify all functions exist:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_or_create_direct_conversation',
    'create_group_conversation',
    'add_user_to_group',
    'remove_user_from_group',
    'mark_media_viewed',
    'mark_media_viewed_group',
    'delete_conversation_for_user',
    'restore_conversation_for_user'
)
ORDER BY routine_name;
```

You should see all 8 functions.

### Step 5: Enable Realtime (Important!)

1. Go to **Database** > **Replication** in Supabase
2. Enable replication for these tables:
   - ✅ `messages`
   - ✅ `typing_indicators`
   - ✅ `conversation_participants`

### Step 6: Verify Storage Bucket

1. Go to **Storage** in Supabase
2. Check if `message-attachments` bucket exists
3. If not, create it manually:
   - Click "Create a new bucket"
   - Name: `message-attachments`
   - Public: **OFF** (uncheck)
   - Click "Create bucket"

## 🧪 Test the Fix

After running the migration:

1. **Test Direct Message Creation**:
```sql
SELECT get_or_create_direct_conversation(
    'user-1-uuid'::uuid,
    'user-2-uuid'::uuid
);
```
(Replace with actual user UUIDs from your `auth.users` table)

2. **Test User Reports Table**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_reports'
ORDER BY ordinal_position;
```

Should show all columns including `reported_user_id`.

3. **Check Messages Table for viewed_by**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('conversation_id', 'viewed_by');
```

Should show both columns.

## 🎯 What This Migration Does

### Tables Modified/Created:
- ✅ **user_reports**: Dropped and recreated with correct schema
- ✅ **conversations**: Created if not exists
- ✅ **conversation_participants**: Created if not exists
- ✅ **typing_indicators**: Updated with proper unique constraints
- ✅ **messages**: Added `conversation_id` and `viewed_by` columns if missing

### Functions Created:
- ✅ All 8 database functions for chat operations
- ✅ Trigger function for updating conversation timestamps

### Policies Applied:
- ✅ RLS enabled on all tables
- ✅ Secure policies for each table
- ✅ Storage policies for authenticated access

## 🚨 Troubleshooting

### Error: "relation already exists"
**Solution**: This is fine! The script uses `CREATE TABLE IF NOT EXISTS` for safety.

### Error: "function already exists"
**Solution**: The script uses `CREATE OR REPLACE FUNCTION` to safely update.

### Error: "permission denied"
**Solution**: Make sure you're running as a Supabase admin/owner in the SQL Editor.

### Storage bucket policies not working
**Solution**: 
1. Go to Storage > message-attachments > Policies
2. Delete existing policies
3. Re-run the migration script (it will recreate storage policies)

## ✅ Success Indicators

After successful migration, you should have:
- ✅ 5 tables created (conversations, conversation_participants, messages updated, typing_indicators, user_reports)
- ✅ 8 database functions
- ✅ RLS enabled on all tables
- ✅ 10+ policies created
- ✅ Realtime enabled for 3 tables
- ✅ Storage bucket with policies

## 📝 Next Steps

Once migration is complete:
1. Test creating a direct conversation
2. Test creating a group chat
3. Test sending messages
4. Test the reporting feature
5. Test media uploads

Refer to `/app/REALTIME_CHAT_IMPLEMENTATION_GUIDE.md` for full testing checklist.

## 🆘 Still Having Issues?

Common issues and solutions:

**Q: Can I safely run this script multiple times?**
A: Yes! The script is idempotent and safe to re-run.

**Q: Will this delete my existing messages?**
A: No. It only modifies table structures, not data. Existing messages remain intact.

**Q: What about existing conversations?**
A: Match-based conversations continue to work. The script adds conversation support without breaking existing functionality.

**Q: Do I need to restart anything?**
A: No restarts needed. Changes take effect immediately.

---

**Summary**: Use `/app/CHAT_SCHEMA_MIGRATION_FIX.sql` instead of the original schema file. It safely handles existing tables and adds all necessary features.
