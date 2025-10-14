# 🏗️ System Architecture Overview

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION LAYER                             │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                    ProfileSetup.tsx (React)                       │     │
│  │                                                                   │     │
│  │  • Uses camelCase throughout                                     │     │
│  │  • Form state: { displayName, matchPreferences.sexualities }     │     │
│  │  • Clean, idiomatic JavaScript                                   │     │
│  └────────────────────────┬─────────────────────────────────────────┘     │
│                           │                                                │
│                           │ onClick="handleSubmit()"                       │
│                           ▼                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TRANSFORMATION LAYER                                   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │              useProfile.ts (React Hook)                           │     │
│  │                                                                   │     │
│  │  completeProfileSetup(profileData) {                             │     │
│  │    // Step 1: Transform camelCase → snake_case                   │     │
│  │    const dbData = profileToDatabase(profileData);                │     │
│  │                                                                   │     │
│  │    // Step 2: Validate required fields                           │     │
│  │    validateProfileForDatabase(dbData);                           │     │
│  │                                                                   │     │
│  │    // Step 3: Save to Supabase                                   │     │
│  │    supabase.from('profiles').upsert(dbData);                     │     │
│  │  }                                                                │     │
│  └────────────────────────┬─────────────────────────────────────────┘     │
│                           │                                                │
│                           │ profileToDatabase()                            │
│                           ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │           transformers.ts (Utility Functions)                     │     │
│  │                                                                   │     │
│  │  profileToDatabase() {                                           │     │
│  │    • displayName → display_name                                  │     │
│  │    • matchPreferences → match_preferences                        │     │
│  │    • sexualities → orientations                                  │     │
│  │    • seekingRelationshipType → seeking_relationship_type         │     │
│  │    • All keys: camelCase → snake_case                            │     │
│  │  }                                                                │     │
│  │                                                                   │     │
│  │  Result:                                                          │     │
│  │  {                                                                │     │
│  │    display_name: "John",                                          │     │
│  │    match_preferences: {                                           │     │
│  │      orientations: ["Straight"]  ← was "sexualities"             │     │
│  │    }                                                              │     │
│  │  }                                                                │     │
│  └────────────────────────┬─────────────────────────────────────────┘     │
│                           │                                                │
│                           │ Transformed Data (snake_case)                  │
│                           ▼                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST with JWT
                            │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE LAYER                                      │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                  Supabase Client (API)                            │     │
│  │                                                                   │     │
│  │  • Receives snake_case data                                      │     │
│  │  • Authenticates user via JWT                                    │     │
│  │  • Applies RLS policies                                          │     │
│  └────────────────────────┬─────────────────────────────────────────┘     │
│                           │                                                │
│                           │ Apply RLS                                      │
│                           ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │              Row Level Security (RLS)                             │     │
│  │                                                                   │     │
│  │  ✓ User can only update their own profile                        │     │
│  │  ✓ User ID matches auth.uid()                                    │     │
│  │  ✓ Required fields present                                       │     │
│  └────────────────────────┬─────────────────────────────────────────┘     │
│                           │                                                │
│                           │ Authorized ✓                                   │
│                           ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                PostgreSQL Database                                │     │
│  │                                                                   │     │
│  │  Table: profiles                                                  │     │
│  │  ┌──────────────────────────────────────────────────────┐        │     │
│  │  │ Column Name (snake_case)    │ Type        │ Value    │        │     │
│  │  ├──────────────────────────────────────────────────────┤        │     │
│  │  │ id                          │ UUID        │ abc-123  │        │     │
│  │  │ display_name                │ TEXT        │ "John"   │        │     │
│  │  │ display_name2               │ TEXT        │ NULL     │        │     │
│  │  │ location                    │ TEXT        │ "Miami"  │        │     │
│  │  │ age                         │ INTEGER     │ 28       │        │     │
│  │  │ gender                      │ TEXT        │ "Male"   │        │     │
│  │  │ orientation                 │ TEXT        │ "Straight"        │     │
│  │  │ match_preferences           │ JSONB       │ {        │        │     │
│  │  │                             │             │   orientations:[] │     │
│  │  │                             │             │ }        │        │     │
│  │  │ seeking                     │ TEXT[]      │ []       │        │     │
│  │  │ seeking_relationship_type   │ TEXT[]      │ []       │        │     │
│  │  │ interests                   │ TEXT[]      │ []       │        │     │
│  │  │ kinks                       │ TEXT[]      │ []       │        │     │
│  │  │ soft_limits                 │ TEXT[]      │ []       │        │     │
│  │  │ hard_limits                 │ TEXT[]      │ []       │        │     │
│  │  │ photos                      │ TEXT[]      │ []       │        │     │
│  │  │ membership_tier             │ TEXT        │ "basic"  │        │     │
│  │  │ profile_completed           │ BOOLEAN     │ true     │        │     │
│  │  │ created_at                  │ TIMESTAMPTZ │ NOW()    │        │     │
│  │  │ updated_at                  │ TIMESTAMPTZ │ NOW()    │        │     │
│  │  └──────────────────────────────────────────────────────┘        │     │
│  │                                                                   │     │
│  │  Triggers:                                                        │     │
│  │  • update_updated_at_column() - Auto-update timestamp            │     │
│  │  • handle_new_user() - Create profile on signup                  │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            │ Data persisted ✓
                            │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYER                                        │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │              Supabase Storage (profile-photos)                    │     │
│  │                                                                   │     │
│  │  Bucket Structure:                                                │     │
│  │  profile-photos/                                                  │     │
│  │    ├── {user_id_1}/                                               │     │
│  │    │   ├── 1234567890_photo1.jpg                                  │     │
│  │    │   └── 1234567891_photo2.jpg                                  │     │
│  │    ├── {user_id_2}/                                               │     │
│  │    │   └── 1234567892_photo1.jpg                                  │     │
│  │                                                                   │     │
│  │  RLS Policies:                                                    │     │
│  │  • Users can upload to their own folder                           │     │
│  │  • Public can view all photos                                     │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                            │
                            │ Photos stored ✓
                            │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EDGE FUNCTIONS LAYER (Optional)                        │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │          get-potential-matches (Deno Edge Function)               │     │
│  │                                                                   │     │
│  │  Algorithm:                                                       │     │
│  │  1. Get user's match_preferences                                 │     │
│  │  2. Query profiles matching criteria                             │     │
│  │  3. Calculate compatibility scores                               │     │
│  │  4. Sort by score, return top 50                                 │     │
│  │                                                                   │     │
│  │  Scoring:                                                         │     │
│  │  • Shared interests: +10 each                                    │     │
│  │  • Shared kinks: +15 each                                        │     │
│  │  • VIP member: +5                                                │     │
│  │  • Verified: +10                                                 │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │     cleanup-expired-memberships (Scheduled Cron Job)              │     │
│  │                                                                   │     │
│  │  Runs: Daily at midnight                                         │     │
│  │  1. Find expired VIP memberships                                 │     │
│  │  2. Downgrade to basic tier                                      │     │
│  │  3. Update subscription status                                   │     │
│  │  4. Log results                                                  │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Transformation Examples

### Example 1: Individual Profile

**Frontend Input (camelCase):**
```typescript
{
  accountType: 'individual',
  displayName: 'John Doe',
  location: 'Miami, FL',
  age: 28,
  gender: 'Male',
  orientation: 'Straight',
  matchPreferences: {
    ageRange: [21, 40],
    genders: ['Female'],
    sexualities: ['Straight', 'Bisexual'],  // ← Frontend field
    distance: 50
  }
}
```

**After Transformation (snake_case):**
```typescript
{
  account_type: 'individual',
  display_name: 'John Doe',
  location: 'Miami, FL',
  age: 28,
  gender: 'Male',
  orientation: 'Straight',
  match_preferences: {
    ageRange: [21, 40],
    genders: ['Female'],
    orientations: ['Straight', 'Bisexual'],  // ← Database field
    distance: 50
  }
}
```

**Database Storage:**
```sql
INSERT INTO profiles (
  id,
  account_type,
  display_name,
  location,
  age,
  gender,
  orientation,
  match_preferences
) VALUES (
  'uuid-123',
  'individual',
  'John Doe',
  'Miami, FL',
  28,
  'Male',
  'Straight',
  '{"ageRange": [21, 40], "genders": ["Female"], "orientations": ["Straight", "Bisexual"], "distance": 50}'::jsonb
);
```

---

### Example 2: Couple Profile

**Frontend Input:**
```typescript
{
  accountType: 'couple',
  displayName: 'Alex',
  displayName2: 'Sam',
  age: 32,
  age2: 29,
  gender: 'Male',
  gender2: 'Female',
  orientation: 'Straight',
  orientation2: 'Bisexual'
}
```

**Database Storage:**
```sql
account_type: 'couple'
display_name: 'Alex'
display_name2: 'Sam'
age: 32
age2: 29
gender: 'Male'
gender2: 'Female'
orientation: 'Straight'
orientation2: 'Bisexual'
```

---

## 🔒 Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                         │
└────────────────────────────────────────────────────────────┘

Layer 1: Authentication (JWT)
├─ Supabase Auth validates JWT token
├─ User identity confirmed
└─ Invalid tokens rejected

Layer 2: Row Level Security (RLS)
├─ Profiles: auth.uid() = id
├─ Matches: user involved in match
├─ Messages: user in matched conversation
└─ Storage: user owns folder

Layer 3: Database Constraints
├─ Age >= 18
├─ Bio length 69-1000 chars
├─ Photos max 10
└─ CHECK constraints enforced

Layer 4: Validation (Frontend)
├─ transformers.ts validates fields
├─ Required fields checked
└─ Type validation

Layer 5: Storage Policies
├─ Users upload to own folder only
├─ Public photos accessible
└─ Private attachments restricted
```

---

## ⚡ Performance Optimizations

### Database Indexes
```sql
-- Fast profile lookups
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Fast matching queries
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Fast message queries
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### Caching Strategy
- Profile photos: CDN cached (public bucket)
- User profiles: Client-side state management
- Match results: Server-side edge function caching
- Static assets: Browser caching

---

## 📊 Key Relationships

```
┌──────────────┐
│   auth.users │
│              │
│ - id (UUID)  │
│ - email      │
└──────┬───────┘
       │
       │ 1:1 (auto-created on signup)
       │
       ▼
┌──────────────────┐
│    profiles      │
│                  │
│ - id (FK)        │
│ - display_name   │
│ - match_prefs    │
└──────┬───────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────────┐        ┌──────────────────┐
│     matches      │◄──────►│     messages     │
│                  │   N:N  │                  │
│ - user1_id (FK)  │        │ - match_id (FK)  │
│ - user2_id (FK)  │        │ - sender_id (FK) │
│ - status         │        │ - content        │
└──────────────────┘        └──────────────────┘
```

---

## 🎯 Key Features

### ✅ Automatic Transformations
- Frontend code stays clean (camelCase)
- Database follows SQL conventions (snake_case)
- No manual field name conversion needed

### ✅ Type Safety
- TypeScript validates frontend types
- Database constraints validate data
- Transformation layer bridges both

### ✅ Security
- RLS prevents unauthorized access
- Storage policies protect user data
- JWT authentication required

### ✅ Scalability
- Indexed queries for fast lookups
- Edge functions for complex operations
- Caching for performance

### ✅ Maintainability
- Clear separation of concerns
- Single source of truth (database schema)
- Comprehensive documentation

---

## 🚀 Deployment Flow

```
1. Developer writes code
   ├─ Uses camelCase (JavaScript standard)
   └─ Follows React best practices

2. Transformation layer
   ├─ Converts to snake_case
   ├─ Maps special fields (sexualities → orientations)
   └─ Validates data

3. Supabase receives data
   ├─ Authenticates user
   ├─ Applies RLS policies
   └─ Validates constraints

4. PostgreSQL stores data
   ├─ Enforces schema
   ├─ Triggers fire (timestamps, etc.)
   └─ Returns success

5. User sees confirmation
   └─ Profile saved successfully! ✓
```

---

## 📚 File Structure

```
/app/
├── src/
│   ├── pages/
│   │   └── ProfileSetup.tsx       (Frontend UI - camelCase)
│   ├── hooks/
│   │   └── useProfile.ts          (API layer with transformation)
│   ├── utils/
│   │   └── transformers.ts        (Transformation functions)
│   ├── types.ts                   (TypeScript types)
│   └── config.ts                  (Supabase config)
│
├── supabase/
│   └── functions/
│       ├── get-potential-matches/ (Edge function)
│       └── cleanup-expired-memberships/ (Cron job)
│
├── SUPABASE_COMPLETE_SETUP.sql   (Database schema)
├── SUPABASE_SETUP_GUIDE.md       (Setup instructions)
├── SCHEMA_FIX_DOCUMENTATION.md   (Technical docs)
├── SCHEMA_FIX_SUMMARY.md         (Quick reference)
└── DEPLOYMENT_CHECKLIST.md       (Launch checklist)
```

---

## 🎉 Summary

Your system is built on a solid architecture with:

1. **Clean Frontend** - Idiomatic JavaScript (camelCase)
2. **Automatic Transformation** - Seamless conversion layer
3. **Standard Database** - SQL conventions (snake_case)
4. **Comprehensive Security** - Multi-layer protection
5. **Optimal Performance** - Indexed, cached, optimized
6. **Full Documentation** - Every component explained

Everything works together seamlessly! 🚀
