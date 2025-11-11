# Profile Setup Enhanced Implementation Guide

## 📋 Overview

This guide provides complete implementation instructions for the enhanced profile setup workflow with integrated verification system for your swingers/relationship/BDSM/kink/poly dating app.

---

## 🎯 What's Included

### 1. **Database Schema** (`PROFILE_SETUP_ENHANCED_SCHEMA.sql`)
- Enhanced profiles table with 50+ new fields
- Verification system tables
- Photo management tables
- Progress tracking tables
- Storage bucket configurations
- RLS policies for security
- Automated triggers
- Admin functions

### 2. **Key Features Implemented**

#### **Singles (Individual) Workflow - 7 Steps:**
1. **Identity & Basics**: Name, location, gender, orientation, pronouns, DOB
2. **Lifestyle Identity**: Roles, kink quiz, experience, limits, safety
3. **About Me**: Bio, 3 things about me, ideal experience, turn-ons, deal breakers
4. **Physical Profile**: Height, weight, body stats, health info
5. **Photos**: Upload with categories, privacy levels, primary selection
6. **Match Preferences**: Age, gender, location, compatibility filters
7. **Verification & Launch**: Verification options, membership selection, profile preview

#### **Couples Workflow - 8 Steps:**
1. **Couple Identity**: Both partners' info, relationship type, time together
2. **Both Partners' Roles**: Separate role selection and kink quizzes
3. **About Us**: Couple story, how you met, what makes you unique
4. **Partner 1 Physical Profile**: Complete stats
5. **Partner 2 Physical Profile**: Complete stats
6. **Couple Photos**: Tagged photos, primary selection, privacy
7. **Match Preferences**: Couple-specific filtering
8. **Verification & Launch**: Both partners verify, membership

---

## 🚀 Implementation Steps

### **Step 1: Run Database Schema**

```bash
# In Supabase SQL Editor, run:
# PROFILE_SETUP_ENHANCED_SCHEMA.sql
```

This will:
- ✅ Add 50+ new columns to profiles table
- ✅ Create verification_requests table
- ✅ Create verified_users table
- ✅ Create profile_photos table
- ✅ Create profile_setup_progress table
- ✅ Set up storage buckets (profile-photos, verification-photos)
- ✅ Configure RLS policies
- ✅ Create triggers for automation
- ✅ Add admin functions

### **Step 2: Verification System Setup**

The verification system is already implemented in your `GetVerifiedModal.tsx`. Integration points:

**In ProfileSetup.tsx Step 7 (Verification & Launch):**

```typescript
import { GetVerifiedModal } from '@/components/GetVerifiedModal';

// Add state
const [showVerificationModal, setShowVerificationModal] = useState(false);

// In render (Step 7):
<div className="space-y-6">
  <h2>Get Verified (Optional but Recommended)</h2>
  <Button onClick={() => setShowVerificationModal(true)}>
    Start Verification Process
  </Button>
</div>

{showVerificationModal && (
  <GetVerifiedModal
    isOpen={showVerificationModal}
    onClose={() => setShowVerificationModal(false)}
    userId={user.id}
    userEmail={user.email}
    profile={formData}
  />
)}
```

### **Step 3: Photo Management Enhancements**

**Enhanced photo upload with categories and privacy:**

```typescript
// Photo state
const [photoFiles, setPhotoFiles] = useState<{
  file: File;
  category: 'face' | 'body' | 'lifestyle' | 'kink' | 'couple';
  privacyLevel: 'public' | 'members' | 'private' | 'face_blurred';
  isPrimary: boolean;
}[]>([]);

// Photo upload with metadata
const handlePhotoUpload = (
  file: File, 
  category: string, 
  privacyLevel: string
) => {
  // Upload to Supabase Storage
  const filePath = `${user.id}/${Date.now()}_${file.name}`;
  
  await supabase.storage
    .from('profile-photos')
    .upload(filePath, file);
  
  // Save metadata to profile_photos table
  await supabase
    .from('profile_photos')
    .insert({
      user_id: user.id,
      photo_url: publicUrl,
      storage_path: filePath,
      category: category,
      privacy_level: privacyLevel,
      is_primary: photoFiles.length === 0
    });
};
```

### **Step 4: Profile Completion Tracking**

```typescript
// Track progress
const saveProgress = async (step: number) => {
  await supabase
    .from('profile_setup_progress')
    .upsert({
      user_id: user.id,
      current_step: step,
      steps_completed: stepsCompleted,
      draft_data: formData,
      last_updated_at: new Date().toISOString()
    });
};

// Auto-save every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (formData.displayName) { // Only if there's data
      saveProgress(step);
    }
  }, 30000);
  
  return () => clearInterval(interval);
}, [step, formData]);
```

### **Step 5: Verification Badge Display**

```typescript
// Check verification status
const { data: verificationStatus } = await supabase
  .from('verified_users')
  .select('*')
  .eq('user_id', userId)
  .single();

// Display badge
{verificationStatus && (
  <div className="flex items-center gap-2">
    <CheckCircle className="h-5 w-5 text-blue-400" />
    <span className="text-sm text-blue-400">Verified</span>
  </div>
)}
```

---

## 📦 New Database Tables

### **1. verification_requests**
Stores all verification submissions for admin review.

**Key Fields:**
- `user_id`: User requesting verification
- `method`: 'selfie' or 'fetlife'
- `status`: 'pending', 'approved', 'rejected'
- `selfie_photo_url`: Selfie verification photo
- `fetlife_profile_url`: FetLife profile link
- `partner2_*`: Partner 2 fields for couples

### **2. verified_users**
Tracks all verified users (created automatically on approval).

**Key Fields:**
- `user_id`: Verified user
- `verification_method`: How they verified
- `verified_at`: Timestamp
- `verification_badge_level`: 'verified' or 'premium_verified'

### **3. profile_photos**
Enhanced photo management with metadata.

**Key Fields:**
- `user_id`: Photo owner
- `photo_url`: Public URL
- `category`: 'face', 'body', 'lifestyle', 'kink', 'couple'
- `privacy_level`: 'public', 'members', 'private', 'face_blurred'
- `is_primary`: Primary photo flag
- `display_order`: Sort order

### **4. profile_setup_progress**
Tracks user progress through setup.

**Key Fields:**
- `user_id`: User
- `current_step`: Current step number
- `steps_completed`: Array of completed steps
- `draft_data`: Auto-saved form data
- `completed_at`: When profile was completed

---

## 🔐 Storage Buckets

### **1. profile-photos**
- **Public**: Yes (photos are public by default)
- **Size Limit**: 10MB per file
- **Allowed Types**: JPEG, PNG, WEBP, HEIC
- **RLS**: Users can upload/manage their own photos

### **2. verification-photos**
- **Public**: No (admin-only access)
- **Size Limit**: 10MB per file
- **Allowed Types**: JPEG, PNG, WEBP
- **RLS**: Users can upload, only admins can view all

---

## 🛡️ RLS Policies Summary

### **Profiles Table**
- Users can view their own profile
- Public profiles viewable by all members
- Users can update only their own profile

### **Verification Requests**
- Users can view/create/update their own requests
- Admins can view and update all requests

### **Verified Users**
- Anyone can view (to see verification badges)
- Only system can insert (via trigger)

### **Profile Photos**
- Users can manage their own photos
- Privacy levels control visibility:
  - Public: Anyone can view
  - Members: Only authenticated users
  - Private: Only owner and approved connections
  - Face Blurred: Automatic blur applied

### **Storage Objects**
- Users can upload to their own folder only
- Path structure: `{user_id}/{timestamp}_{filename}`
- Verification photos only viewable by user and admins

---

## ⚙️ Automated Triggers

### **1. update_updated_at_column()**
Automatically updates `updated_at` timestamp on record changes.

### **2. create_verified_user_on_approval()**
When verification request is approved:
- Creates/updates entry in `verified_users` table
- Sets `verified_at` timestamp
- Links to verification request

### **3. ensure_single_primary_photo()**
Ensures only one photo is marked as primary per user.

### **4. calculate_profile_completion()**
Automatically calculates profile completion percentage:
- Counts required fields
- Updates `profile_completion_percentage` column
- Different calculation for individuals vs couples

---

## 👨‍💼 Admin Functions

### **1. Approve Verification**
```sql
SELECT approve_verification(
    request_id, 
    admin_user_id, 
    'Approved - all requirements met'
);
```

### **2. Reject Verification**
```sql
SELECT reject_verification(
    request_id,
    admin_user_id,
    'Photo does not show required information',
    'Additional notes here'
);
```

### **3. Get Verification Status**
```sql
SELECT * FROM get_user_verification_status(user_id);
```

### **4. Get Profile Completion Details**
```sql
SELECT * FROM get_profile_completion_details(user_id);
```

---

## 🎨 UI/UX Recommendations

### **Progress Indicators**
```typescript
// Show progress bar
<div className="w-full bg-gray-700 rounded-full h-2">
  <div 
    className="bg-pink-500 h-2 rounded-full transition-all"
    style={{ width: `${(step / totalSteps) * 100}%` }}
  />
</div>
<p className="text-sm text-white/60 mt-2">
  Step {step} of {totalSteps}
</p>
```

### **Auto-save Indicator**
```typescript
{isSaving ? (
  <div className="flex items-center gap-2 text-sm text-green-400">
    <Spinner className="h-4 w-4" />
    Saving...
  </div>
) : lastSaved && (
  <div className="text-sm text-white/60">
    Saved {formatDistanceToNow(lastSaved)} ago
  </div>
)}
```

### **Verification Badge**
```typescript
{isVerified && (
  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
    <CheckCircle className="h-4 w-4 text-blue-400" />
    <span className="text-xs font-medium text-blue-400">Verified</span>
  </div>
)}
```

---

## 🧪 Testing Checklist

### **Database Setup**
- [ ] Run PROFILE_SETUP_ENHANCED_SCHEMA.sql
- [ ] Verify all tables created
- [ ] Check storage buckets exist
- [ ] Test RLS policies

### **Profile Setup Flow**
- [ ] Individual account: Complete all 7 steps
- [ ] Couple account: Complete all 8 steps
- [ ] Auto-save works
- [ ] Form validation works
- [ ] Photos upload successfully
- [ ] Primary photo selection works
- [ ] Privacy levels apply correctly

### **Verification System**
- [ ] Selfie verification submission works
- [ ] FetLife verification submission works
- [ ] Couple verification (both partners) works
- [ ] Files upload to verification-photos bucket
- [ ] Admin can view pending verifications
- [ ] Approval creates verified_users entry
- [ ] Rejection stores reason
- [ ] Verification badge displays correctly

### **Photo Management**
- [ ] Photos upload to correct category
- [ ] Privacy levels save correctly
- [ ] Primary photo sets properly
- [ ] Photo order can be changed
- [ ] Photo deletion works
- [ ] Face blur option works (if implemented)

### **Progress Tracking**
- [ ] Progress saves automatically
- [ ] User can resume incomplete setup
- [ ] Completion percentage calculates correctly
- [ ] Required fields tracked properly

---

## 🔧 Configuration Variables

Add to your `.env` file:

```env
# Supabase
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Storage
REACT_APP_PROFILE_PHOTOS_BUCKET=profile-photos
REACT_APP_VERIFICATION_PHOTOS_BUCKET=verification-photos

# Limits
REACT_APP_MAX_PHOTOS=10
REACT_APP_MAX_PHOTO_SIZE_MB=10
REACT_APP_MIN_BIO_LENGTH=69
REACT_APP_MAX_BIO_LENGTH=1000

# Verification
REACT_APP_VERIFICATION_REVIEW_TIME=48 # hours
```

---

## 📚 Additional Resources

### **Verification Service** (`verificationService.ts`)
Located at: `/app/src/services/verificationService.ts`

Already implements:
- Photo upload to verification bucket
- Metadata submission
- Partner 2 handling for couples

### **Photo Upload Service**
```typescript
// services/photoService.ts
export const uploadProfilePhoto = async (
  userId: string,
  file: File,
  metadata: {
    category: string;
    privacyLevel: string;
    isPrimary: boolean;
  }
) => {
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath);
  
  const { data, error } = await supabase
    .from('profile_photos')
    .insert({
      user_id: userId,
      photo_url: publicUrl,
      storage_path: filePath,
      ...metadata
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
```

---

## 🚨 Important Notes

### **Privacy Considerations**
1. Verification photos are NOT public
2. Only admins can access verification submissions
3. Users can set privacy levels per photo
4. Face blur feature available (requires implementation)
5. Location data should be generalized (city/state only)

### **Data Retention**
1. Rejected verification photos should be kept for 30 days
2. Approved verification photos kept for audit trail
3. Profile photos owned by user, deleted when account deleted
4. Draft data auto-deleted after 90 days if profile not completed

### **Performance**
1. Index frequently queried fields (location, age, gender)
2. Cache verification status client-side
3. Lazy load photos below the fold
4. Compress images on upload
5. Use CDN for photo delivery (Supabase does this automatically)

### **Security**
1. Validate file types server-side (Storage handles this)
2. Scan uploaded files for malware (add if needed)
3. Rate limit verification submissions
4. Require email verification before profile setup
5. Implement IP logging for verification submissions

---

## 🎯 Next Steps

1. **Run the SQL schema** in Supabase SQL Editor
2. **Test the verification flow** with GetVerifiedModal
3. **Implement photo management enhancements** in ProfileSetup.tsx
4. **Add progress tracking and auto-save**
5. **Test complete workflow** for both account types
6. **Set up admin dashboard** for verification review
7. **Add email notifications** for verification status updates
8. **Implement analytics** to track drop-off points

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs for database errors
2. Check browser console for frontend errors
3. Verify RLS policies allow your operations
4. Test with SQL queries directly in Supabase
5. Check storage bucket policies

---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Compatible With:** React + TypeScript + Supabase
