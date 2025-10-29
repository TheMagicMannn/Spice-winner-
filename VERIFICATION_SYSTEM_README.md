# SPICE Verification System - Setup & Usage Guide

## Overview
Complete user verification system for SPICE dating app with two verification methods (Selfie & FetLife), couple account support, and admin approval workflow.

---

## 🗄️ Database Setup

### Step 1: Run SQL File in Supabase

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Open the file: `/app/VERIFICATION_SYSTEM_SETUP.sql`
4. Copy all content and paste into SQL Editor
5. Click **Run** to execute

This will create:
- ✅ `verification_requests` table
- ✅ `verification_history` table  
- ✅ `verification-uploads` storage bucket (private)
- ✅ Admin role system (`is_admin` column in profiles)
- ✅ RLS policies for security
- ✅ Triggers for auto-updating verification status
- ✅ Helper views and functions

### Step 2: Make a User Admin

After running the SQL, update a user to admin status:

```sql
-- Replace 'USER_UUID_HERE' with actual user ID from auth.users table
UPDATE profiles 
SET is_admin = true 
WHERE id = 'USER_UUID_HERE';
```

To find a user's UUID:
```sql
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';
```

---

## 🎨 Frontend Components

### Files Created

1. **`/app/src/services/verificationService.ts`**
   - Service for all verification operations
   - Upload photos, submit requests, admin actions

2. **`/app/src/components/GetVerifiedModal.tsx`**
   - User-facing verification submission modal
   - Supports both selfie and FetLife methods
   - Handles individual and couple accounts

3. **`/app/src/pages/AdminVerification.tsx`**
   - Admin panel for reviewing verifications
   - View submissions, approve/reject with notes
   - Image viewer with signed URLs

4. **Updated: `/app/src/pages/Profile.tsx`**
   - Added "Get Verified" button functionality
   - Admin users see "Admin: Verification Panel" link

5. **Updated: `/app/src/App.tsx`**
   - Added route: `/admin/verification`

---

## 🚀 User Verification Flow

### For Individual Accounts

1. User clicks **"Get Verified"** on Profile page
2. Modal opens with two method options:
   - **Option 1: Selfie Verification**
     - Upload selfie holding paper with:
       - Date
       - Email address
       - Text: "SPICE VERIFICATION"
   - **Option 2: FetLife Verification**
     - Provide FetLife profile URL
     - Upload screenshot while logged in
     - Profile must be 90+ days old
     - Must have at least 1 clear face pic

3. Submit for review
4. Admin reviews and approves/rejects
5. User profile updated with verification badge

### For Couple Accounts

Same as individual, but:
- **Both partners** must provide verification
- One submission includes both partners
- Selfie method: 2 separate selfies
- FetLife method: 2 separate FetLife profiles with URLs

---

## 👨‍💼 Admin Verification Flow

### Accessing Admin Panel

1. Admin user logs in
2. Goes to Profile page
3. Sees "Admin: Verification Panel" in Quick Actions
4. Clicks to access `/admin/verification`

### Reviewing Verifications

1. **Dashboard shows:**
   - Pending count
   - Approved count
   - Rejected count

2. **Filter options:**
   - Pending Only
   - All Requests

3. **For each request, admin can:**
   - View user details (name, email, account type)
   - View uploaded photos (selfies, screenshots)
   - Open FetLife profile URLs
   - Add admin notes
   - **Approve** with optional notes
   - **Reject** with required reason

4. **On approval:**
   - Trigger automatically updates `profiles.is_verified = true`
   - Verification badge appears on user profile
   - User receives notification (if implemented)

5. **On rejection:**
   - User can submit new verification request
   - Rejection reason stored for reference

---

## 🔒 Security Features

### Row Level Security (RLS)

- **Users** can only view/edit their own verification requests
- **Admins** can view/edit all verification requests
- **Storage bucket** is private (only uploader and admins can view)

### Storage Policies

- Users can upload to their own folder: `{user_id}/`
- Admins can view all verification uploads
- Signed URLs expire after 1 hour

### Validation

- Couple accounts must provide data for both partners
- Selfie method requires photo + date
- FetLife method requires URL + screenshot
- Only one pending request per user at a time

---

## 📁 Database Schema Reference

### `verification_requests` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| method | ENUM | 'selfie' or 'fetlife' |
| status | ENUM | 'pending', 'approved', 'rejected', 'under_review' |
| email | TEXT | User's email for verification |
| selfie_photo_url | TEXT | Uploaded selfie URL |
| verification_date | DATE | Date written on paper |
| fetlife_profile_url | TEXT | FetLife profile URL |
| fetlife_screenshot_url | TEXT | FetLife screenshot URL |
| partner2_email | TEXT | Partner 2 email (couples) |
| partner2_selfie_photo_url | TEXT | Partner 2 selfie |
| partner2_fetlife_profile_url | TEXT | Partner 2 FetLife URL |
| partner2_fetlife_screenshot_url | TEXT | Partner 2 FetLife screenshot |
| reviewed_by | UUID | Admin who reviewed |
| reviewed_at | TIMESTAMP | Review timestamp |
| admin_notes | TEXT | Admin's notes |
| rejection_reason | TEXT | Reason if rejected |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### `verification_history` Table

Tracks all status changes for audit purposes.

### Storage Bucket: `verification-uploads`

- **Private bucket** (public = false)
- File size limit: 10MB
- Allowed types: JPG, PNG, WEBP
- Folder structure: `{user_id}/{file_type}_{timestamp}.{ext}`

---

## 🎯 Testing Checklist

### User Flow Testing

- [ ] Individual user can submit selfie verification
- [ ] Individual user can submit FetLife verification
- [ ] Couple user can submit verification for both partners
- [ ] User sees error if missing required fields
- [ ] User sees success message after submission
- [ ] User cannot submit duplicate pending requests
- [ ] Verification badge appears after admin approval

### Admin Flow Testing

- [ ] Admin can access `/admin/verification` route
- [ ] Non-admin users are redirected
- [ ] Admin sees all pending verifications
- [ ] Admin can view uploaded images
- [ ] Admin can open FetLife URLs in new tab
- [ ] Admin can approve with notes
- [ ] Admin can reject with reason
- [ ] Approved verifications update profile badge
- [ ] Filter works (Pending / All)

### Security Testing

- [ ] Users cannot view other users' verification requests
- [ ] Users cannot view verification upload files directly
- [ ] Admins can view all verification uploads
- [ ] RLS policies prevent unauthorized access
- [ ] Signed URLs expire after 1 hour

---

## 🐛 Troubleshooting

### Issue: "infinite recursion detected in policy for relation verification_requests"
**Solution:** 
This occurs when RLS policies reference each other in a loop. Run the fix:

1. Go to Supabase SQL Editor
2. Run the file: `/app/VERIFICATION_RLS_FIX.sql`
3. This creates a `SECURITY DEFINER` function that bypasses RLS when checking admin status

**What the fix does:**
- Drops the problematic policies
- Creates `is_admin(user_id)` function with `SECURITY DEFINER`
- Recreates policies using the new function
- Prevents infinite recursion by bypassing RLS for admin checks

### Issue: "Failed to upload photo"
**Solution:** 
- Check storage bucket exists: `verification-uploads`
- Verify storage policies are applied
- Ensure file size < 10MB
- Check file type is JPG/PNG/WEBP

### Issue: "Not authorized to view image"
**Solution:**
- Ensure user is admin
- Check RLS policies on storage.objects
- Verify signed URL generation

### Issue: Admin panel shows "Access Denied"
**Solution:**
```sql
-- Verify user is admin
SELECT id, email, is_admin FROM profiles WHERE id = 'USER_ID';

-- Make user admin
UPDATE profiles SET is_admin = true WHERE id = 'USER_ID';
```

### Issue: Verification badge not showing after approval
**Solution:**
- Check trigger: `on_verification_status_change`
- Manually verify: `SELECT is_verified FROM profiles WHERE id = 'USER_ID'`
- If false, trigger may have failed - check logs

---

## 📝 Future Enhancements (Optional)

- Email notifications on approval/rejection
- Automatic FetLife profile age validation
- Bulk approval for admins
- Verification expiry (re-verify every N months)
- Analytics dashboard for admin
- User appeal system for rejections

---

## 🎉 Setup Complete!

Your verification system is now fully functional. Users can submit verifications, and admins can review and approve them. The verification badge will automatically appear on approved user profiles.

For any issues or questions, check the troubleshooting section or review the inline comments in the SQL file.
