# ProfileSetup.tsx - Complete Workflow Documentation

## Account Types (2)
1. **Individual** (`individual`)
2. **Couple Shared** (`shared_couple`)

---

## Complete Step-by-Step Workflow

### **STEP 0: Account Type Selection**

**Applies To**: Both account types (selection step)

**UI Elements**:
- Page title: "How would you like to create your account?"
- Subtitle: "Choose the option that best fits your situation"
- 2 vertical card options

**Option 1: Individual Account** 👤
- Title: "Individual Account"
- Subtitle: "Single user, single login"
- Description: "I'm creating a profile for myself"
- Feature: "✓ Invite partners later to link and appear as a couple while keeping full independence"

**Option 2: Couple Shared Account** 👫
- Title: "Couple Shared Account"
- Subtitle: "One profile, two separate login emails"
- Description: "We want one shared profile that we both can access"
- Feature: "✓ Both partners can log in with their own email/password"

**Fields**:
```typescript
{
  accountType: 'individual' | 'shared_couple'
}
```

**Validation**: Must select one option

**Navigation**: Continue → button leads to Step 1

---

### **STEP 1: Relationship Status**

**Applies To**: Both account types (same UI)

**UI Elements**:
- Page title: "Relationship Status"
- Multi-select tags for status
- Conditional question for "exploring with"

**Field 1: Current Relationship Status**
- Component: TagMultiSelect
- Field: `relationshipStatus[]`
- Type: Multi-select array
- Required: Yes (at least 1)
- Options:
  ```
  'single'
  'in_relationship'
  'partnered'
  'open_relationship'
  'polyamorous'
  'swinger'
  'other'
  ```

**Field 2: Exploring With (Conditional)**
- Shows ONLY if: `relationshipStatus` includes `'in_relationship'`
- Component: 2 radio buttons
- Field: `exploringWith`
- Type: String
- Required: Yes (if shown)
- Options:
  - "With Partner"
  - "Solo"
- Maps to: `'partner'` or `'solo'`

**Conditional Logic**:
```typescript
if (relationshipStatus.includes('in_relationship')) {
  // Show exploring with question
}

// Triggers Step 2a if:
if (
  exploringWith === 'partner' ||
  relationshipStatus.includes('open_relationship') ||
  relationshipStatus.includes('polyamorous') ||
  relationshipStatus.includes('swinger')
) {
  // Enable Step 2a (Partner Linking)
}
```

**Fields**:
```typescript
{
  relationshipStatus: string[],
  exploringWith: 'partner' | 'solo' | 'n/a'
}
```

**Validation**: 
- `relationshipStatus.length > 0`
- If `in_relationship` selected, must set `exploringWith`

**Navigation**: 
- Back → Step 0
- Next → Step 2a (if conditions met) or Step 2

---

### **STEP 2a: Partner Linking (CONDITIONAL)**

**Applies To**: Both account types (if conditions met)

**Shows Only If**:
- `exploringWith === 'partner'`, OR
- `relationshipStatus` includes: `'open_relationship'`, `'polyamorous'`, or `'swinger'`

**UI Elements**:
- PartnerLinkInvite component
- Search existing SPICE users
- Send partner invite interface
- Skip option available

**Component**: `<PartnerLinkInvite />`

**Fields Within Component**:
1. Search input (email or username)
2. Partner selection from search results
3. Relationship type dropdown
4. Visibility preference dropdown

**Partner Link Data**:
```typescript
{
  partnerLinks: [
    {
      id: string,
      userId: string,
      partnerId: string,
      partnerName?: string,
      partnerEmail?: string,
      status: 'pending',
      relationshipType: 'primary' | 'secondary' | 'anchor' | 'casual',
      visibility: 'public' | 'matches_only' | 'private',
      createdAt: string
    }
  ]
}
```

**Actions**:
- Search for user
- Select partner
- Choose relationship type
- Set visibility
- Send invite
- OR Skip

**Validation**: Can always proceed (optional step)

**Navigation**:
- Back → Step 1
- Skip/Continue → Step 2

---

### **STEP 2: Lifestyle Definition**

**Applies To**: Both account types (same UI)

**UI Elements**:
- Page title: "Define Your Lifestyle"
- Subtitle: "Select all that resonate with you"
- Multi-select tag buttons

**Field: Lifestyles**
- Component: TagMultiSelect
- Field: `lifestyles[]`
- Type: Multi-select array
- Required: Yes (at least 1)
- Max: No limit
- Options:
  ```
  'ENM'
  'BDSM'
  'Poly'
  'Swinger'
  'Vanilla'
  ```

**Fields**:
```typescript
{
  lifestyles: string[]
}
```

**Validation**: `lifestyles.length > 0`

**Navigation**:
- Back → Step 2a (if shown) or Step 1
- Next → Step 3

---

### **STEP 3: Roles & Dynamics**

**Applies To**: Both account types (same UI)

**UI Elements**:
- Page title: "Roles & Dynamics"
- Multi-select tags for roles
- Kink Quiz button
- Experience level dropdown

**Field 1: Select Your Roles**
- Component: TagMultiSelect
- Field: `roles[]`
- Type: Multi-select array
- Required: Yes (at least 1)
- Options (32 roles):
  ```
  'Dominant', 'Submissive', 'Switch', 'Top', 'Bottom', 'Versatile',
  'Master/Mistress', 'Slave', 'Daddy/Mommy', 'Little', 'Brat', 'Brat Tamer',
  'Sadist', 'Masochist', 'Rigger', 'Rope Bunny', 'Pet', 'Owner', 'Handler',
  'Primal (Hunter)', 'Primal (Prey)', 'Voyeur', 'Exhibitionist',
  'Service Submissive', 'Service Dominant', 'Ageplayer', 'Degrader', 'Degradee',
  'Non-monogamist', 'Experimentalist', 'Vanilla'
  ```

**Field 2: Kink Quiz (Optional)**
- Component: Button opens modal
- Action: "🎯 Take Kink Quiz for Role Suggestions"
- Opens: `<KinkQuiz />` modal
- Returns: Top 5 role suggestions with percentages
- Auto-populates `roles[]` with quiz results

**Field 3: Experience Level**
- Component: Dropdown (Select)
- Field: `experienceLevel`
- Type: String
- Required: No
- Default: 'New'
- Options:
  ```
  'New'
  'Beginner'
  'Moderate'
  'Advanced'
  ```

**Fields**:
```typescript
{
  roles: string[],
  experienceLevel: 'New' | 'Beginner' | 'Moderate' | 'Advanced'
}
```

**Validation**: `roles.length > 0`

**Navigation**:
- Back → Step 2
- Next → Step 4

---

### **STEP 4: Kinks & Preferences**

**Applies To**: Both account types (same UI)

**UI Elements**:
- Page title: "Kinks & Preferences"
- Multiple checkbox grids
- Safeword text input

**Field 1: Kinks You're Interested In**
- Component: CheckboxGrid
- Field: `kinkTags[]`
- Type: Multi-select array
- Required: Yes (at least 1)
- Max: 15 selections
- Options (40+ kinks):
  ```
  'Threesomes', 'Spanking', 'Light bondage', 'Restraints', 'Blindfolds',
  'Dirty talk / name-calling', 'Hair pulling', 'Biting / marking', 'Collar & leash',
  'Role-play', 'Sex Toys', 'Pegging / strap-on play', 'Temperature play', 'Nipple clamps',
  'Oral sex', 'Edging / orgasm control', 'Watching partner masturbate',
  'Recording/Pictures During Play', 'Public play', 'Spitting', 'Slapping', 'Breeding',
  'Gangbangs', 'Daddy/Mommy kink', 'Choking / breath play', 'Wax play',
  'Degradation / praise', 'Shibari / decorative rope', 'Cuckolding or hotwife',
  'Anal play', 'Pet play', 'CNC', 'Watersports', 'BDSM', 'Voyeurism', 'Exhibitionism',
  'Swinging', 'Group Play', 'Tantric Sex', 'Food Play'
  ```

**Field 2: Soft Limits**
- Component: CheckboxGrid
- Field: `softLimits[]`
- Type: Multi-select array
- Required: No
- Max: 10 selections
- Options (25+ limits):
  ```
  'Scat', 'Blood Play', 'Illegal Activities', 'Permanent Marks', 'Breath Play',
  'Findom', 'Needles', 'Vomit', 'Hard Insults', 'Public Humiliation', 'Animals',
  'Underage', 'Non-Consensual', 'Weapon Play', 'Fire Play', 'Edge Play', 'Race Play',
  'Intercourse', 'Oral Sex', 'No Condoms', 'Overnights', 'Intoxication',
  'Face Slapping', 'Choking', 'Gagging'
  ```

**Field 3: Hard Limits**
- Component: CheckboxGrid
- Field: `hardLimits[]`
- Type: Multi-select array
- Required: No
- Max: 10 selections
- Options: Same as Soft Limits

**Field 4: Safeword**
- Component: Text Input
- Field: `safeword`
- Type: String
- Required: No
- Placeholder: "Your safeword"

**Fields**:
```typescript
{
  kinkTags: string[],
  softLimits: string[],
  hardLimits: string[],
  safeword: string | null
}
```

**Validation**: `kinkTags.length > 0`

**Navigation**:
- Back → Step 3
- Next → Step 5

---

### **STEP 5: Profile Details**

**Applies To**: BOTH (Different UI per account type)

---

#### **STEP 5 - INDIVIDUAL ACCOUNT**

**UI Elements**:
- Page title: "Profile Details"
- Multiple input fields for personal information
- Physical stats section (optional)

**Field 1: Display Name**
- Component: Text Input
- Field: `displayName`
- Type: String
- Required: Yes
- Format: Free text

**Field 2: Bio**
- Component: Textarea
- Field: `bio`
- Type: String
- Required: Yes
- Min: 69 characters
- Max: 1000 characters
- Rows: 5
- Real-time character counter displayed

**Field 3: Location**
- Component: Text Input
- Field: `location`
- Type: String
- Required: Yes
- Format: "City, State" (e.g., "Los Angeles, CA")
- Placeholder: "e.g., Los Angeles, CA"

**Field 4: Date of Birth**
- Component: Text Input (auto-formatting)
- Field: `birthdate`
- Type: String
- Required: Yes
- Format: MM/DD/YYYY
- Auto-formats as user types
- Validates age (18-99)
- Displays calculated age when valid

**Field 5: Gender Identity**
- Component: Dropdown (Select)
- Field: `genderIdentity`
- Type: String
- Required: Yes
- Options:
  ```
  'Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female',
  'Genderqueer', 'Gender Fluid', 'Agender', 'Two-Spirit', 'Other'
  ```

**Field 6: Pronouns**
- Component: Dropdown (Select)
- Field: `pronouns`
- Type: String
- Required: No
- Options:
  ```
  'he/him', 'she/her', 'they/them', 'ze/zir', 'xe/xem',
  'any pronouns', 'other', 'prefer not to say'
  ```

**Field 7: Sexual Orientation**
- Component: TagMultiSelect
- Field: `sexualOrientation[]`
- Type: Multi-select array
- Required: Yes (at least 1)
- Options:
  ```
  'Straight', 'Bisexual', 'Gay', 'Lesbian', 'Pansexual', 'Queer',
  'Asexual', 'Demisexual', 'Sapiosexual', 'Other'
  ```

**Physical Stats Section (All Optional)**:

**Field 8: Height**
- Component: Dropdown
- Field: `height`
- Type: String
- Required: No
- Options: 4'0" to 7'0" (1" increments) - 37 options

**Field 9: Body Type**
- Component: Dropdown
- Field: `bodyType`
- Type: String
- Required: No
- Options:
  ```
  'Slim', 'Average', 'Athletic', 'Curvy', 'Fit', 'Thick', 'Plus-size', 'Dad Bod', 'BBW'
  ```

**Additional Optional Fields** (not shown in current UI but in data model):
- weight, hairColor, eyeColor, facialHair, ethnicity
- cigaretteSmoker, alcoholDrinker, marijuanaUser
- bodyHair, groomingStyle, birthControl
- canHost, tattoos, piercings, latexAllergy
- lastSTITestDate, stiPositiveResults

**Fields for Individual**:
```typescript
{
  displayName: string,
  bio: string,
  location: string,
  birthdate: string,
  age: number, // calculated
  genderIdentity: string,
  pronouns: string,
  sexualOrientation: string[],
  height?: string,
  bodyType?: string,
  // ... additional optional stats
}
```

**Validation for Individual**:
- displayName: required
- bio: 69-1000 characters
- location: required
- birthdate: valid date, age 18-99
- genderIdentity: required
- sexualOrientation: at least 1

**Navigation**:
- Back → Step 4
- Next → Step 6

---

#### **STEP 5 - COUPLE SHARED ACCOUNT**

**UI Elements**:
- Page title: "Couple Profile Details"
- Simplified couple-focused fields
- Partner quick stats (optional)

**Field 1: Couple Name**
- Component: Text Input
- Field: `coupleName`
- Type: String
- Required: Yes
- Format: Free text

**Field 2: Couple Bio**
- Component: Textarea
- Field: `coupleBio`
- Type: String
- Required: Yes
- Min: 69 characters
- Max: 1000 characters
- Rows: 5
- Description: "Tell others about you as a couple—what makes you special together."
- Real-time character counter displayed

**Field 3: Location**
- Component: Text Input
- Field: `location`
- Type: String
- Required: Yes
- Format: "City, State"

**Partner Quick Stats (Optional)**:

**Partner A**:
- Field: `partnerQuickStats.partnerA.displayName` (string)
- Field: `partnerQuickStats.partnerA.age` (number, 18-99)
- Field: `partnerQuickStats.partnerA.role` (string)

**Partner B**:
- Field: `partnerQuickStats.partnerB.displayName` (string)
- Field: `partnerQuickStats.partnerB.age` (number, 18-99)
- Field: `partnerQuickStats.partnerB.role` (string)

**Fields for Couple**:
```typescript
{
  coupleName: string,
  coupleBio: string,
  location: string,
  partnerQuickStats?: {
    partnerA?: { displayName?: string, age?: number, role?: string },
    partnerB?: { displayName?: string, age?: number, role?: string }
  }
}
```

**Validation for Couple**:
- coupleName: required
- coupleBio: 69-1000 characters
- location: required

**Navigation**:
- Back → Step 4
- Next → Step 6

---

### **STEP 6: Photos & Media**

**Applies To**: Both account types (same UI)

**UI Elements**:
- Page title: "Add Your Photos"
- Subtitle: "Upload 2-10 photos. Set visibility for each photo."
- Photo grid display
- Per-photo visibility controls
- Add more button (+)

**Photo Upload**:
- Component: File input (multiple)
- Field: `photos[]`
- Type: Array of PhotoItem objects
- Required: Yes
- Min: 2 photos
- Max: 10 photos
- Accept: image/*

**Photo Structure**:
```typescript
PhotoItem {
  id: string,           // Generated
  url: string,          // URL after upload or blob URL
  visibility: 'public' | 'matches_only' | 'private',
  uploadedAt: string,   // ISO timestamp
  isBlurredUntilMatch?: boolean  // Only for matches_only
}
```

**Per-Photo Controls**:
1. **Visibility Dropdown** (for each photo):
   - 🌐 Public - Visible to everyone
   - 🔒 Matches Only - Only your matches can see
   - 👁️ Private - Only you can see

2. **Blur Until Match Toggle** (conditional):
   - Only shows if visibility is "matches_only"
   - Checkbox: "Blur until match"

3. **Remove Button**:
   - × button on each photo to remove

**Features**:
- Grid display (2-3 columns)
- Drag & drop support (via file input)
- Visual visibility indicators (icons)
- Add more button when < 10 photos

**Fields**:
```typescript
{
  photos: PhotoItem[]
}
```

**Validation**: 
- `photos.length >= 2` (minimum)
- `photos.length <= 10` (maximum)

**Navigation**:
- Back → Step 5
- Next → Step 7

---

### **STEP 7: Privacy Settings**

**Applies To**: Both account types (same UI)

**UI Elements**:
- Page title: "Privacy Settings"
- Profile visibility dropdown
- Match preferences section with sliders and toggles

**Section 1: Profile Visibility**

**Field 1: Profile Visibility**
- Component: Dropdown (Select)
- Field: `profileVisibility`
- Type: String
- Required: Yes
- Default: 'public'
- Options:
  ```
  'public' - Public - Visible to everyone
  'verified_only' - Verified Only - Only verified users
  'matches_only' - Matches Only - Only your matches
  'private' - Private - Hidden from browse
  ```

**Section 2: Match Preferences**

**Field 2: Age Range**
- Component: Dual range sliders
- Field: `matchPreferences.ageRange`
- Type: [number, number]
- Required: No
- Range: 18-99
- Default: [18, 55]
- Display: Shows min-max values above sliders

**Field 3: Distance**
- Component: Range slider
- Field: `matchPreferences.distance`
- Type: Number
- Required: No
- Range: 0-200 miles
- Default: 50
- Display: Shows value (e.g., "50 miles")

**Field 4: Verified Profiles Only**
- Component: Toggle switch
- Field: `matchPreferences.verifiedOnly`
- Type: Boolean
- Required: No
- Default: true

**Hidden/Optional Match Preference Fields** (in data model but not shown):
- `matchPreferences.genders[]`
- `matchPreferences.sexualities[]`
- `matchPreferences.searchingFor[]`
- `matchPreferences.vipOnly`
- `matchPreferences.experienceLevels[]`

**Fields**:
```typescript
{
  profileVisibility: 'public' | 'verified_only' | 'matches_only' | 'private',
  matchPreferences: {
    ageRange: [number, number],
    distance: number,
    verifiedOnly: boolean,
    genders?: string[],
    sexualities?: string[],
    searchingFor?: string[],
    vipOnly?: boolean,
    experienceLevels?: string[]
  }
}
```

**Validation**: `profileVisibility` must be set

**Navigation**:
- Back → Step 6
- Next → Step 8

---

### **STEP 8: Verification (Optional)**

**Applies To**: Both account types (same UI)

**UI Elements**:
- Page title: "Verification (Optional)"
- Subtitle: "Verified profiles get more visibility and trust"
- Multiple verification options

**Section 1: Identity Verification**

**Component**: `<VerificationUpload verificationType="identity" />`

**Actions**:
1. Select document (file input)
2. Upload document (image/PDF)
3. Submit for review

**Display**:
- Upload interface
- Status indicator (idle/success/error)
- Success message: "Document Uploaded Successfully"
- Info: "Your verification will be reviewed within 24-48 hours."

**Section 2: Lifestyle Verification**

**Component**: `<VerificationUpload verificationType="lifestyle" />`

**Actions**:
1. Select lifestyles to verify (multi-select)
2. Submit for verification

**Options**: ENM, BDSM, Poly, Swinger, Vanilla

**Display**:
- Tag selection interface
- Submit button
- Success confirmation

**Section 3: Partner Verification**

**Component**: `<VerificationUpload verificationType="partner" />`

**Display**:
- Placeholder: "No pending partner verifications"
- Shows linked partners awaiting verification

**Verification Data Structure**:
```typescript
{
  verification: {
    identityVerified: boolean,
    identityVerifiedAt: string | null,
    lifestyleVerified: string[],
    partnerVerifiedIds: string[]
  }
}
```

**Fields**:
```typescript
{
  verification: {
    identityVerified: false,
    identityVerifiedAt: null,
    lifestyleVerified: [],
    partnerVerifiedIds: []
  }
}
```

**Validation**: Always can proceed (all optional)

**Navigation**:
- Back → Step 7
- Next → Step 9

---

### **STEP 9: Review & Publish**

**Applies To**: Both account types (same UI with conditional content)

**UI Elements**:
- Page title: "Review Your Profile"
- Profile summary sections with edit buttons
- Membership selection
- Terms acceptance
- Publish button

**Section 1: Profile Summary Review**

**Component**: `<ProfileSummaryReview profile={formData} onEdit={goToStep} />`

**Summary Sections** (each with Edit button):
1. Account Type → Edit leads to Step 0
2. Relationship Status → Edit leads to Step 1
3. Partner Links (if any) → Edit leads to Step 2a
4. Lifestyles → Edit leads to Step 2
5. Roles & Dynamics → Edit leads to Step 3
6. Kinks & Preferences → Edit leads to Step 4
7. Profile Details → Edit leads to Step 5
8. Photos → Edit leads to Step 6
9. Privacy Settings → Edit leads to Step 7
10. Verification → Edit leads to Step 8

**Display for Each Section**:
- Section title
- Completion indicator (✓ green = complete, ⚠️ = incomplete)
- Summary of entered data
- Edit button

**Section 2: Membership Selection**

**Field: Membership Tier**
- Component: Radio selection (card-based)
- Field: `membershipTier`
- Type: String
- Required: Yes
- Default: 'basic'

**Option 1: Freemium - Basic**
- Price: Free
- Features:
  - ✓ Basic features
  - ✗ Limited visibility
  - ✗ No priority matching
- Button: "Stay Basic"

**Option 2: 🌟 VIP Membership**
- Price: $24.99 / month
- Features:
  - 🌟 All features unlocked
  - 🎯 Priority match visibility
  - 💬 Unlimited messages
  - 🎉 Access to VIP-only events
- Button: "Upgrade to VIP"

**Section 3: Terms & Conditions**
- Display: "By publishing your profile, you agree to SPICE's Terms of Service and Privacy Policy."
- Links to: /terms and /privacy

**Section 4: Final Publish**
- Button: "Publish Profile 🚀" (Individual) or "Publish Our Profile 🚀" (Couple)
- Loading state while submitting
- Error display if submission fails

**Fields**:
```typescript
{
  membershipTier: 'basic' | 'vip'
}
```

**Validation**: All previous steps must be valid

**Final Submission Actions**:
1. Uploads all photos to Supabase Storage
2. Replaces local blob URLs with uploaded URLs
3. Calculates age from birthdate
4. Submits complete profile to backend
5. Redirects to dashboard on success

**Navigation**:
- Back → Step 8
- Publish → Submits profile and redirects

---

## Summary Tables

### Steps Overview

| Step | Name | Individual | Couple Shared | Conditional |
|------|------|-----------|---------------|-------------|
| 0 | Account Type | ✓ | ✓ | No |
| 1 | Relationship Status | ✓ | ✓ | No |
| 2a | Partner Linking | ✓ | ✓ | Yes* |
| 2 | Lifestyle | ✓ | ✓ | No |
| 3 | Roles & Dynamics | ✓ | ✓ | No |
| 4 | Kinks & Preferences | ✓ | ✓ | No |
| 5 | Profile Details | ✓ (detailed) | ✓ (simplified) | No |
| 6 | Photos | ✓ | ✓ | No |
| 7 | Privacy | ✓ | ✓ | No |
| 8 | Verification | ✓ | ✓ | No |
| 9 | Review & Publish | ✓ | ✓ | No |

*Step 2a shows if: exploringWith='partner' OR status includes open/poly/swinger

### Field Count by Step

| Step | Individual Fields | Couple Fields |
|------|------------------|---------------|
| 0 | 1 | 1 |
| 1 | 2 | 2 |
| 2a | 4 (if shown) | 4 (if shown) |
| 2 | 1 | 1 |
| 3 | 2 | 2 |
| 4 | 4 | 4 |
| 5 | 7 required + 20+ optional | 3 required + 6 optional |
| 6 | 2+ (photos) | 2+ (photos) |
| 7 | 4 | 4 |
| 8 | 3 (optional) | 3 (optional) |
| 9 | 1 | 1 |
| **Total** | **60+ fields** | **35+ fields** |

### Required vs Optional Fields

**Individual Account**:
- Required: 14 fields
- Optional: 46+ fields

**Couple Shared Account**:
- Required: 11 fields
- Optional: 24+ fields

---

## Data Constants Reference

### All Available Options

**Relationship Status** (7):
- single, in_relationship, partnered, open_relationship, polyamorous, swinger, other

**Lifestyles** (5):
- ENM, BDSM, Poly, Swinger, Vanilla

**Roles** (32):
- Dominant, Submissive, Switch, Top, Bottom, Versatile, Master/Mistress, Slave, Daddy/Mommy, Little, Brat, Brat Tamer, Sadist, Masochist, Rigger, Rope Bunny, Pet, Owner, Handler, Primal (Hunter), Primal (Prey), Voyeur, Exhibitionist, Service Submissive, Service Dominant, Ageplayer, Degrader, Degradee, Non-monogamist, Experimentalist, Vanilla

**Kink Tags** (40+):
- Too many to list - see KINK_TAGS_OPTIONS in code

**Limits** (25):
- Scat, Blood Play, Illegal Activities, Permanent Marks, Breath Play, Findom, Needles, Vomit, Hard Insults, Public Humiliation, Animals, Underage, Non-Consensual, Weapon Play, Fire Play, Edge Play, Race Play, Intercourse, Oral Sex, No Condoms, Overnights, Intoxication, Face Slapping, Choking, Gagging

**Gender Options** (10):
- Male, Female, Non-binary, Transgender Male, Transgender Female, Genderqueer, Gender Fluid, Agender, Two-Spirit, Other

**Sexuality Options** (10):
- Straight, Bisexual, Gay, Lesbian, Pansexual, Queer, Asexual, Demisexual, Sapiosexual, Other

**Pronouns** (8):
- he/him, she/her, they/them, ze/zir, xe/xem, any pronouns, other, prefer not to say

**Experience Levels** (4):
- New, Beginner, Moderate, Advanced

**Profile Visibility** (4):
- public, verified_only, matches_only, private

**Photo Visibility** (3):
- public, matches_only, private

---

## Navigation Flow Diagram

```
Step 0 (Account Type)
    ↓
Step 1 (Relationship Status)
    ↓
    ├─→ Step 2a (Partner Linking) [if conditions met]
    │       ↓
    └─→ Step 2 (Lifestyle)
            ↓
        Step 3 (Roles & Dynamics)
            ↓
        Step 4 (Kinks & Preferences)
            ↓
        Step 5 (Profile Details)
            ↓
        Step 6 (Photos)
            ↓
        Step 7 (Privacy)
            ↓
        Step 8 (Verification)
            ↓
        Step 9 (Review & Publish)
```

---

**End of Complete Workflow Documentation**

This document provides the full step-by-step workflow for both account types in ProfileSetup.tsx, including all fields, options, validations, and conditional logic.
