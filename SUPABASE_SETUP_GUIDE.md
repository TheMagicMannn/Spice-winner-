# 🚀 Supabase Database Setup Guide

## Quick Start - 5 Minutes to Full Setup

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Setup Script
1. Open the file: `/app/SUPABASE_COMPLETE_SETUP.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

⏱️ **Expected time**: 10-15 seconds

### Step 3: Verify Installation
After running the script, you should see:
```
✅ SPICE Dating App Database Setup Complete!

📊 Tables Created:
  - profiles (with snake_case columns)
  - subscriptions
  - matches
  - messages
  - events
  - event_attendees
  - user_reports

🔒 RLS Policies: Enabled for all tables
⚡ Triggers: Created for automation
📦 Storage Buckets: profile-photos, event-photos, message-attachments

🎯 Schema is compatible with transformation layer!
   Frontend: camelCase → Transformer → Database: snake_case

🚀 Ready to use with your React + Supabase app!
```

### Step 4: Verify Tables
1. Go to **Table Editor** in the left sidebar
2. You should see all 7 tables listed
3. Click on **profiles** table to inspect the schema

### Step 5: Verify Storage Buckets
1. Go to **Storage** in the left sidebar
2. You should see 3 buckets:
   - `profile-photos` (public)
   - `event-photos` (public)
   - `message-attachments` (private)

---

## 🎯 What This Setup Includes

### ✅ Database Tables
All tables use **snake_case** column names to match SQL conventions:

#### 1. **profiles**
Core user profile data with:
- Individual profile fields: `display_name`, `age`, `gender`, `orientation`
- Couple profile fields: `display_name2`, `age2`, `gender2`, `orientation2`
- Arrays: `seeking`, `interests`, `kinks`, `soft_limits`, `hard_limits`
- JSONB: `match_preferences` (stores `orientations` field)
- Status flags: `is_verified`, `is_active`, `profile_completed`

#### 2. **subscriptions**
Manages VIP memberships and Stripe integration

#### 3. **matches**
Tracks likes, matches, and rejections between users

#### 4. **messages**
Stores chat messages between matched users

#### 5. **events**
VIP-only lifestyle events

#### 6. **event_attendees**
Event registration and attendance tracking

#### 7. **user_reports**
User reporting system for safety

---

### 🔒 Row Level Security (RLS) Policies

All tables have comprehensive RLS policies that:

✅ **Profiles**
- Users can view/edit their own profile
- Users can view other completed, active profiles (for matching)
- Sensitive data is protected

✅ **Matches & Messages**
- Users can only access their own matches/messages
- Only matched users can message each other
- Blocked users cannot interact

✅ **Events**
- All users can view public events
- Only VIP members can view VIP-only events
- Users can register/cancel for events

✅ **Storage**
- Users can only upload to their own folder (`user_id/`)
- Public can view profile photos
- Message attachments are private to conversation participants

---

### ⚡ Automatic Triggers

The setup includes smart triggers that:

1. **Auto-create profile on signup** - New users get a basic profile automatically
2. **Update timestamps** - `updated_at` is automatically set on any change
3. **Sync membership tier** - Profile updates when subscription changes
4. **Match ordering** - Ensures consistent `user1_id < user2_id` ordering
5. **Mutual match detection** - Automatically updates status when both users like each other
6. **Event attendee counting** - Updates `current_attendees` when users register/cancel

---

### 📦 Storage Buckets

#### 1. **profile-photos** (Public)
- Users upload photos to: `{user_id}/{timestamp}_{filename}`
- Photos are publicly accessible
- Users can only manage their own photos

#### 2. **event-photos** (Public)
- Event images visible to authenticated users
- Used for event listings

#### 3. **message-attachments** (Private)
- Image/gif messages in chats
- Only visible to conversation participants

---

## 🔄 How It Works With Your Frontend

### Transformation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (ProfileSetup.tsx)                                │
│  Uses camelCase:                                            │
│  {                                                          │
│    displayName: "John",                                     │
│    matchPreferences: {                                      │
│      sexualities: ["Straight"]                              │
│    }                                                        │
│  }                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Transformation Layer (transformers.ts)                     │
│  Converts to snake_case:                                    │
│  - displayName → display_name                               │
│  - matchPreferences → match_preferences                     │
│  - sexualities → orientations                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Database (Supabase)                                        │
│  Stores in snake_case:                                      │
│  {                                                          │
│    display_name: "John",                                    │
│    match_preferences: {                                     │
│      orientations: ["Straight"]                             │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

**Key Point**: Your frontend code stays clean with camelCase. The transformation happens automatically in `useProfile.ts`.

---

## 🧪 Testing Your Setup

### Test 1: Create a Profile
```typescript
// This should now work without errors
const profile = {
  accountType: 'individual',
  displayName: 'John Doe',
  location: 'Miami, FL',
  age: 28,
  gender: 'Male',
  orientation: 'Straight',
  // ... rest of profile
};

await completeProfileSetup(profile);
```

### Test 2: Check Database
1. Go to **Table Editor** → **profiles**
2. You should see the new profile with snake_case columns:
   - `display_name`: "John Doe"
   - `match_preferences`: JSONB with `orientations` field

### Test 3: Upload Photos
```typescript
// Upload should work to: {user_id}/{timestamp}_{filename}
const { data, error } = await supabase.storage
  .from('profile-photos')
  .upload(`${userId}/photo.jpg`, file);
```

---

## 🔧 Troubleshooting

### Issue: "relation already exists"
**Solution**: The script includes DROP statements at the beginning. If you see this error, it means you're re-running the script. This is safe - it will recreate everything fresh.

### Issue: "permission denied for schema auth"
**Solution**: Make sure you're running this in your project's SQL Editor, not in a local database. Supabase handles the `auth` schema automatically.

### Issue: Profile not saving
**Check**:
1. Browser console for transformation logs
2. Supabase Dashboard → Logs → API for errors
3. Make sure RLS policies are enabled (they are by default)

### Issue: Can't upload photos
**Check**:
1. Storage bucket exists: Dashboard → Storage
2. File path matches pattern: `{user_id}/{filename}`
3. User is authenticated

---

## 📋 Field Reference

### Frontend → Database Mapping

| Frontend (camelCase) | Database (snake_case) |
|---------------------|----------------------|
| `displayName` | `display_name` |
| `displayName2` | `display_name2` |
| `matchPreferences` | `match_preferences` |
| `matchPreferences.sexualities` | `match_preferences.orientations` ⚠️ |
| `seekingRelationshipType` | `seeking_relationship_type` |
| `lifestyleExperience` | `lifestyle_experience` |
| `softLimits` | `soft_limits` |
| `hardLimits` | `hard_limits` |
| `safetyPractices` | `safety_practices` |
| `membershipTier` | `membership_tier` |

⚠️ **Special Case**: `sexualities` ↔ `orientations` is handled by the transformation layer

---

## 🎉 Next Steps

1. ✅ Run the SQL script (you just did this!)
2. ✅ Verify tables and storage buckets exist
3. 🚀 Test profile creation from your app
4. 📸 Test photo uploads
5. 🧪 Test matching functionality

---

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for transformation logs
2. Check Supabase Dashboard → Logs → API
3. Verify your transformation layer is working: `/src/utils/transformers.ts`
4. Review the complete documentation: `/SCHEMA_FIX_DOCUMENTATION.md`

---

## 🔐 Security Notes

✅ **All tables have RLS enabled** - Users can only access their own data and public profiles
✅ **Storage is protected** - Users can only upload to their own folders
✅ **Service role access** - Reserved for server-side operations (webhooks)
✅ **Automatic profile creation** - New users get a profile stub automatically
✅ **Data validation** - CHECK constraints enforce data integrity

Your database is production-ready and secure! 🎊
