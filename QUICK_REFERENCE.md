# 📝 Quick Reference Card

## 🎯 Most Important Facts

### Database Schema
```
profiles table PRIMARY KEY: id (UUID)
NOT user_id! Just id!
```

### Key Transformation
```typescript
Frontend: sexualities  →  Database: orientations
Frontend: camelCase    →  Database: snake_case
```

### Required Fields
**Individual:**
- display_name, location, age (≥18), gender, orientation

**Couple:**
- All individual + display_name2, age2 (≥18), gender2, orientation2

---

## 💻 Code Snippets

### ✅ Save Profile (CORRECT)
```typescript
import { useProfile } from '../hooks/useProfile';

const { completeProfileSetup } = useProfile();

await completeProfileSetup({
  accountType: 'individual',
  displayName: 'John',
  location: 'Miami, FL',
  age: 28,
  gender: 'Male',
  orientation: 'Straight',
  matchPreferences: {
    sexualities: ['Straight']  // ← Auto-converts to 'orientations'
  }
});
```

### ✅ Upload Photo (CORRECT)
```typescript
const filePath = `${user.id}/${Date.now()}_${file.name}`;

const { error } = await supabase.storage
  .from('profile-photos')
  .upload(filePath, file, { upsert: true });
```

### ✅ Fetch Profile (CORRECT)
```typescript
const { getProfile } = useProfile();
const { data, error } = await getProfile(userId);

console.log(data.displayName);  // ← camelCase
console.log(data.matchPreferences.sexualities);  // ← Works!
```

---

## 🚫 Common Mistakes

### ❌ DON'T use user_id
```typescript
// ❌ WRONG
await supabase.from('profiles').upsert({
  user_id: user.id,  // ← Column doesn't exist!
  display_name: 'John'
});

// ✅ CORRECT
await supabase.from('profiles').upsert({
  id: user.id,  // ← Use 'id'
  display_name: 'John'
});
```

### ❌ DON'T call Supabase directly
```typescript
// ❌ WRONG - Bypasses transformation
await supabase.from('profiles').upsert(profileData);

// ✅ CORRECT - Uses transformation
await completeProfileSetup(profileData);
```

### ❌ DON'T use wrong file path
```typescript
// ❌ WRONG - RLS will reject
const path = `photo.jpg`;

// ✅ CORRECT - Must include user ID folder
const path = `${user.id}/photo.jpg`;
```

---

## 📊 Field Mapping Cheat Sheet

| Frontend           | Database                   |
|--------------------|----------------------------|
| displayName        | display_name               |
| displayName2       | display_name2              |
| matchPreferences   | match_preferences          |
| ↳ sexualities      | ↳ orientations            |
| seekingRelationshipType | seeking_relationship_type |
| lifestyleExperience | lifestyle_experience      |
| softLimits         | soft_limits                |
| hardLimits         | hard_limits                |
| safetyPractices    | safety_practices           |
| membershipTier     | membership_tier            |
| profileCompleted   | profile_completed          |

---

## 🔐 RLS Quick Check

```typescript
// Can I do this?
const operation = {
  view_own_profile: true,        // ✅ Yes
  edit_own_profile: true,        // ✅ Yes
  view_others_profile: true,     // ✅ Yes (if active & completed)
  edit_others_profile: false,    // ❌ No
  upload_to_own_folder: true,    // ✅ Yes
  upload_to_others_folder: false // ❌ No
};
```

---

## 🐛 Quick Debug Commands

```bash
# Compile TypeScript
cd /app && yarn tsc --noEmit

# Check for specific errors
grep -r "user_id" /app/src

# View logs
# Supabase Dashboard → Logs → API
```

---

## 📦 Files You Need

| File | Purpose |
|------|---------|
| `/SUPABASE_COMPLETE_SETUP.sql` | Run this in Supabase SQL Editor |
| `/src/utils/transformers.ts` | Handles camelCase ↔ snake_case |
| `/src/hooks/useProfile.ts` | Use this for all profile operations |
| `/TROUBLESHOOTING.md` | If you get errors |

---

## 🚀 Deployment Checklist

- [ ] Run SQL setup script in Supabase
- [ ] Verify 7 tables created
- [ ] Verify 3 storage buckets created
- [ ] Test profile creation
- [ ] Test photo upload
- [ ] Check browser console for transformation logs

---

## 📞 When Things Break

1. ✅ Check browser console
2. ✅ Check Supabase logs (Dashboard → Logs)
3. ✅ Verify schema is deployed
4. ✅ Read `/TROUBLESHOOTING.md`
5. ✅ Check you're using `useProfile` hook

---

## 💡 Remember

- **Profiles table uses `id` not `user_id`**
- **Always use the `useProfile` hook**
- **Frontend = camelCase, Database = snake_case**
- **`sexualities` auto-converts to `orientations`**
- **Photo paths must include user ID folder**

---

## 🎉 You're Ready!

With this reference, you can quickly resolve most common issues. For detailed explanations, see the full documentation files.
