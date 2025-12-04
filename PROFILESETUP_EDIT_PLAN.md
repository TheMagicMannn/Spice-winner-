# ProfileSetup.tsx Edit Plan - Detailed Implementation Summary

## Executive Summary

Transform ProfileSetup.tsx from a **7-step** workflow (Individual/Couple) to a **10-step** comprehensive onboarding system with partner linking, dual-login couples, and enhanced privacy controls.

---

## Current State vs. Required State

### Current Implementation
- **Account Types**: 2 (`individual`, `couple`)
- **Total Steps**: 7 (Step 0-6)
- **Architecture**: Simple single-account or two-partner single-login couple
- **Data Model**: Basic Profile interface with partner1/partner2 fields
- **Features**: Basic matching, simple photo upload, basic preferences

### Required Implementation
- **Account Types**: 3 (`individual`, `individual_with_linking`, `shared_couple`)
- **Total Steps**: 10 (Step 0-9)
- **Architecture**: 
  - Individual with optional partner linking (invites existing users)
  - Shared couple with dual-login system (primaryUserId + secondaryUserId)
- **Data Model**: Enhanced SpiceProfile with PartnerLink, PhotoItem, Verification interfaces
- **Features**: Partner linking, lifestyle definitions, enhanced privacy, photo visibility, verification system

---

## Step-by-Step Transformation Plan

### Phase 1: Data Structure Updates

#### 1.1 Create New TypeScript Interfaces

**File**: `/app/src/types/profile.ts` (new file)

```typescript
export type AccountType = "individual" | "individual_with_linking" | "shared_couple";
export type Visibility = "public" | "matches_only" | "private";
export type PartnerLinkStatus = "pending" | "accepted" | "rejected";

export interface Location {
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface PhotoItem {
  id: string;
  url: string;
  visibility: Visibility;
  uploadedAt?: string;
  isBlurredUntilMatch?: boolean;
}

export interface PartnerLink {
  id: string;
  userId: string;
  partnerId: string;
  status: PartnerLinkStatus;
  relationshipType?: "primary" | "secondary" | "anchor" | "casual" | string;
  visibility?: Visibility;
  createdAt: string;
  updatedAt?: string;
}

export interface Verification {
  identityVerified?: boolean;
  identityVerifiedAt?: string | null;
  lifestyleVerified?: string[]; // e.g. ["BDSM","Poly"]
  partnerVerifiedIds?: string[]; // partner links verified
}

export interface MatchPreferences {
  ageRange?: [number, number];
  genders?: string[];
  sexualities?: string[];
  searchingFor?: ("individual" | "couple" | "both")[];
  distanceMiles?: number;
  vipOnly?: boolean;
  verifiedOnly?: boolean;
  experienceLevels?: ("New"|"Beginner"|"Moderate"|"Advanced")[];
}

export interface SpiceProfile {
  id: string;
  accountType: AccountType;
  createdAt: string;
  updatedAt?: string;

  // Common
  displayName?: string;
  bio?: string;
  location?: Location;
  profileVisibility?: "public" | "verified_only" | "matches_only" | "private";
  photos?: PhotoItem[];
  trustScore?: number;

  // Relationship & linking
  relationshipStatus?: ("single" | "in_relationship" | "partnered" | "open_relationship" | "polyamorous" | "swinger" | "other")[];
  exploringWith?: "partner" | "solo" | "n/a";
  partnerLinks?: PartnerLink[];
  linkedBy?: PartnerLink[];

  // Lifestyles & roles
  lifestyles?: ("ENM"|"BDSM"|"Poly"|"Swinger"|"Vanilla")[];
  roles?: string[];
  kinkTags?: string[];
  experienceLevel?: "New" | "Beginner" | "Moderate" | "Advanced";
  hardLimits?: string[];
  softLimits?: string[];
  safeword?: string | null;

  // Personal fields
  birthdate?: string | null;
  age?: number | null;
  genderIdentity?: string | null;
  pronouns?: string | null;
  sexualOrientation?: string[] | null;

  // Demographics
  height?: string;
  weight?: string;
  bodyType?: string;
  hairColor?: string;
  eyeColor?: string;
  tattoos?: boolean;
  piercings?: boolean;
  canHost?: "Yes"|"No"|"Possibly" | null;

  // Verification
  verification?: Verification;

  // Preferences
  matchPreferences?: MatchPreferences;

  // Couple-specific
  primaryUserId?: string;
  secondaryUserId?: string;
  coupleName?: string;
  coupleBio?: string;
  partnerQuickStats?: {
    partnerA?: { displayName?: string; age?: number; role?: string; };
    partnerB?: { displayName?: string; age?: number; role?: string; };
  };
}
```

#### 1.2 Update FormData State in ProfileSetup.tsx

Replace existing formData state initialization with new structure:

```typescript
const [formData, setFormData] = useState<Partial<SpiceProfile>>({
  accountType: null,
  relationshipStatus: [],
  exploringWith: 'n/a',
  partnerLinks: [],
  lifestyles: [],
  roles: [],
  kinkTags: [],
  hardLimits: [],
  softLimits: [],
  photos: [],
  profileVisibility: 'public',
  matchPreferences: {
    ageRange: [18, 55],
    genders: [],
    sexualities: [],
    searchingFor: [],
    distanceMiles: 50,
    vipOnly: false,
    verifiedOnly: true,
    experienceLevels: [],
  },
  verification: {
    identityVerified: false,
    lifestyleVerified: [],
    partnerVerifiedIds: [],
  },
});
```

---

### Phase 2: Update Data Constants

#### 2.1 New Constants Required

Add to ProfileSetup.tsx after existing constants:

```typescript
// Relationship Status Options (updated)
const RELATIONSHIP_STATUS_OPTIONS = [
  'single',
  'in_relationship',
  'partnered',
  'open_relationship',
  'polyamorous',
  'swinger',
  'other'
];

// Exploring With Options (new)
const EXPLORING_WITH_OPTIONS = ['partner', 'solo', 'n/a'];

// Lifestyle Options (new)
const LIFESTYLE_OPTIONS = ['ENM', 'BDSM', 'Poly', 'Swinger', 'Vanilla'];

// Enhanced Role Options (expanded)
const ROLE_OPTIONS = [
  'Dominant', 'Submissive', 'Switch', 'Top', 'Bottom', 'Versatile',
  'Master/Mistress', 'Slave', 'Daddy/Mommy', 'Little', 'Brat', 'Brat Tamer',
  'Sadist', 'Masochist', 'Rigger', 'Rope Bunny', 'Pet', 'Owner', 'Handler',
  'Primal (Hunter)', 'Primal (Prey)', 'Voyeur', 'Exhibitionist',
  'Service Submissive', 'Service Dominant', 'Ageplayer', 'Degrader', 'Degradee',
  'Non-monogamist', 'Experimentalist', 'Vanilla'
];

// Partner Relationship Types (new)
const PARTNER_RELATIONSHIP_TYPES = ['primary', 'secondary', 'anchor', 'casual'];

// Visibility Options (new)
const VISIBILITY_OPTIONS = ['public', 'matches_only', 'private'];

// Profile Visibility Options (new)
const PROFILE_VISIBILITY_OPTIONS = [
  'public',
  'verified_only',
  'matches_only',
  'private'
];

// Pronouns Options (new)
const PRONOUNS_OPTIONS = [
  'he/him', 'she/her', 'they/them', 'ze/zir', 'xe/xem', 'other', 'prefer not to say'
];

// Verification Types (new)
const VERIFICATION_TYPES = ['identity', 'lifestyle', 'partner'];
```

---

### Phase 3: Restructure Step Flow (0-9)

#### Current Steps (0-6):
0. Account Type Selection
1. Basic Info
2. Role Selection & Kink Quiz
3. About Me/About Us
4. Photos
5. Match Preferences
6. Membership

#### New Steps (0-9):

**Step 0: Account Type Selection**
- **Changes**: Add `individual_with_linking` option
- **Fields**: `accountType`
- **Options**: 
  - Individual (no partner linking)
  - Individual with Partner Linking
  - Shared Couple (dual login)

**Step 1: Relationship Status & Exploration**
- **New Step** - replaces old "Basic Info" partially
- **Fields**: 
  - `relationshipStatus` (multi-select)
  - `exploringWith` (conditional - only if "in_relationship" selected)
- **Conditional Logic**:
  ```typescript
  if (relationshipStatus.includes('in_relationship')) {
    // Show "Exploring with partner or solo?" question
    // Set exploringWith: 'partner' | 'solo'
  }
  if (exploringWith === 'partner' || 
      relationshipStatus.includes('open_relationship') ||
      relationshipStatus.includes('polyamorous') ||
      relationshipStatus.includes('swinger')) {
    // Enable Step 2a (Partner Linking)
  }
  ```

**Step 2a: Partner Linking (Conditional)**
- **New Step** - only shown if conditions met
- **Purpose**: Send invite to existing SPICE user
- **Fields**:
  - Partner email/username input
  - Search for existing user
  - Send invite button
  - `partnerLinks` array update
- **Features**:
  - Relationship type selection (primary/secondary/anchor/casual)
  - Visibility preference (public/matches_only/private)
  - Skip option
- **Backend Integration**: Create partner_links table entry with status='pending'

**Step 2: Lifestyle Definition**
- **New Step**
- **Fields**: `lifestyles` (multi-select)
- **Options**: ENM, BDSM, Poly, Swinger, Vanilla
- **UI**: Tag-based multi-select

**Step 3: Roles & Dynamics**
- **Replaces old Step 2** partially
- **Fields**: 
  - `roles` (multi-select from expanded list)
  - Option to take Kink Quiz for suggestions
  - `experienceLevel`
- **Keep**: Kink Quiz integration

**Step 4: Kinks & Preferences**
- **Enhanced from old Step 2**
- **Fields**:
  - `kinkTags` (multi-select, max 15)
  - `hardLimits` (multi-select, max 10)
  - `softLimits` (multi-select, max 10)
  - `safeword` (text input, optional)
- **Remove**: Safety practices, rules (moved to profile bio)

**Step 5: Profile Details**
- **Enhanced from old Step 1 & 3**
- **For Individual**:
  - `displayName`
  - `bio` (69-1000 chars)
  - `location` (city, state)
  - `birthdate` (MM/DD/YYYY)
  - `genderIdentity`
  - `pronouns` (new)
  - `sexualOrientation` (multi-select)
  - Physical stats (height, weight, bodyType, etc.)
- **For Shared Couple**:
  - `coupleName`
  - `coupleBio`
  - `location` (shared)
  - Partner A quick stats
  - Partner B quick stats

**Step 6: Photos & Media**
- **Enhanced from old Step 4**
- **Fields**: `photos` (array of PhotoItem)
- **New Features**:
  - Per-photo visibility selection (public/matches_only/private)
  - Option to blur photos until match
  - Separate public and private albums
  - Min 2 photos still required
- **UI Changes**:
  - Each photo gets visibility dropdown
  - Visual indicator of photo visibility level
  - Private album section

**Step 7: Privacy Settings**
- **New Step**
- **Fields**:
  - `profileVisibility` (public/verified_only/matches_only/private)
  - Hide distance option
  - Show/hide linked partners
  - Match preferences (moved from old Step 5)
- **Enhanced Match Preferences**:
  - All existing fields from old Step 5
  - Plus: verification requirements

**Step 8: Verification**
- **New Step**
- **Purpose**: Identity and lifestyle verification
- **Fields**: `verification`
- **Features**:
  - Identity verification upload
  - Lifestyle verification (select verified lifestyles)
  - Partner verification status display
  - Verification badge explanation
- **UI**: Upload interface, verification status indicators

**Step 9: Summary & Publish**
- **New Step** - combines old Step 6 + final review
- **Purpose**: 
  - Review all entered data
  - Select membership tier (moved from old Step 6)
  - Final publish action
- **Display**:
  - Summary cards for each section
  - Edit buttons to go back to specific steps
  - Membership selection UI
  - Terms & conditions checkbox
  - "Publish Profile" button

---

### Phase 4: Component Updates

#### 4.1 New Components to Create

**File**: `/app/src/components/PartnerLinkInvite.tsx`
```typescript
interface PartnerLinkInviteProps {
  onInviteSent: (link: PartnerLink) => void;
  onSkip: () => void;
}

export const PartnerLinkInvite: React.FC<PartnerLinkInviteProps> = ({ 
  onInviteSent, 
  onSkip 
}) => {
  // Component implementation
  // - Email/username input
  // - Search existing users
  // - Relationship type selection
  // - Visibility preference
  // - Send invite API call
  return (/* JSX */);
};
```

**File**: `/app/src/components/PhotoVisibilitySelector.tsx`
```typescript
interface PhotoVisibilitySelectorProps {
  photo: PhotoItem;
  onVisibilityChange: (photoId: string, visibility: Visibility) => void;
}

export const PhotoVisibilitySelector: React.FC<PhotoVisibilitySelectorProps> = ({
  photo,
  onVisibilityChange
}) => {
  // Dropdown for photo visibility
  // Visual indicator (icon + color)
  return (/* JSX */);
};
```

**File**: `/app/src/components/VerificationUpload.tsx`
```typescript
interface VerificationUploadProps {
  verificationType: 'identity' | 'lifestyle' | 'partner';
  onUploadComplete: (result: any) => void;
}

export const VerificationUpload: React.FC<VerificationUploadProps> = ({
  verificationType,
  onUploadComplete
}) => {
  // Upload interface for verification documents
  // Status display
  return (/* JSX */);
};
```

**File**: `/app/src/components/ProfileSummaryReview.tsx`
```typescript
interface ProfileSummaryReviewProps {
  profile: Partial<SpiceProfile>;
  onEdit: (step: number) => void;
}

export const ProfileSummaryReview: React.FC<ProfileSummaryReviewProps> = ({
  profile,
  onEdit
}) => {
  // Display all profile sections
  // Edit buttons for each section
  // Visual confirmation of completed sections
  return (/* JSX */);
};
```

#### 4.2 Modified Components

**Update**: `/app/src/components/KinkQuiz.tsx`
- No major changes, but ensure it can be used for both individual and shared couple contexts

---

### Phase 5: State Management Updates

#### 5.1 Additional State Variables Required

```typescript
// Partner linking state
const [partnerInvites, setPartnerInvites] = useState<PartnerLink[]>([]);
const [showPartnerLinking, setShowPartnerLinking] = useState(false);

// Verification state
const [verificationUploads, setVerificationUploads] = useState<{
  identity?: File;
  lifestyle?: string[];
}>({});

// Photo visibility state (per photo)
const [photoVisibilityMap, setPhotoVisibilityMap] = useState<Record<string, Visibility>>({});

// Dual login state (for shared couple)
const [primaryUserEmail, setPrimaryUserEmail] = useState('');
const [secondaryUserEmail, setSecondaryUserEmail] = useState('');
const [coupleInviteStatus, setCoupleInviteStatus] = useState<'pending' | 'accepted' | null>(null);

// Step visibility control
const [stepVisibility, setStepVisibility] = useState<Record<number, boolean>>({
  0: true,
  1: true,
  '2a': false, // conditional
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false,
  9: false,
});
```

#### 5.2 Update canProceed Logic

```typescript
const canProceed = useMemo(() => {
  const accountType = formData.accountType;
  
  switch (step) {
    case 0:
      return Boolean(accountType);
    
    case 1:
      return Boolean(
        formData.relationshipStatus && 
        formData.relationshipStatus.length > 0 &&
        (formData.exploringWith || !formData.relationshipStatus.includes('in_relationship'))
      );
    
    case '2a': // Partner linking (conditional)
      return true; // Can always skip
    
    case 2:
      return Boolean(formData.lifestyles && formData.lifestyles.length > 0);
    
    case 3:
      return Boolean(formData.roles && formData.roles.length > 0);
    
    case 4:
      return Boolean(
        formData.kinkTags && 
        formData.kinkTags.length > 0
      );
    
    case 5:
      if (accountType === 'shared_couple') {
        return Boolean(
          formData.coupleName &&
          formData.coupleBio &&
          formData.coupleBio.length >= 69 &&
          formData.coupleBio.length <= 1000
        );
      } else {
        return Boolean(
          formData.displayName &&
          formData.bio &&
          formData.bio.length >= 69 &&
          formData.bio.length <= 1000 &&
          formData.location &&
          formData.birthdate &&
          validateDateOfBirth(formData.birthdate) &&
          formData.genderIdentity &&
          formData.sexualOrientation &&
          formData.sexualOrientation.length > 0
        );
      }
    
    case 6:
      return Boolean(
        formData.photos && 
        formData.photos.length >= 2
      );
    
    case 7:
      return Boolean(formData.profileVisibility);
    
    case 8:
      return true; // Verification is optional
    
    case 9:
      return true; // Review step
    
    default:
      return false;
  }
}, [step, formData]);
```

---

### Phase 6: Conditional Step Logic

#### 6.1 Step 2a Conditional Display

```typescript
useEffect(() => {
  const shouldShowPartnerLinking = 
    formData.accountType === 'individual_with_linking' ||
    formData.exploringWith === 'partner' ||
    formData.relationshipStatus?.includes('open_relationship') ||
    formData.relationshipStatus?.includes('polyamorous') ||
    formData.relationshipStatus?.includes('swinger');
  
  setStepVisibility(prev => ({
    ...prev,
    '2a': shouldShowPartnerLinking
  }));
  
  setShowPartnerLinking(shouldShowPartnerLinking);
}, [formData.accountType, formData.exploringWith, formData.relationshipStatus]);
```

#### 6.2 Step Navigation Updates

```typescript
const nextStep = () => {
  if (step === 1 && !showPartnerLinking) {
    // Skip Step 2a
    setStep(2);
  } else if (step === '2a') {
    setStep(2);
  } else {
    setStep(s => s + 1);
  }
};

const prevStep = () => {
  if (step === 2 && !showPartnerLinking) {
    // Skip Step 2a backwards
    setStep(1);
  } else if (step === 2 && showPartnerLinking) {
    setStep('2a');
  } else {
    setStep(s => s - 1);
  }
};
```

---

### Phase 7: API Integration Requirements

#### 7.1 New API Endpoints Needed

**Partner Linking**:
- `POST /api/partner-links/invite` - Send partner invite
- `GET /api/partner-links/search` - Search for existing user
- `PUT /api/partner-links/:id/accept` - Accept invite
- `PUT /api/partner-links/:id/reject` - Reject invite
- `DELETE /api/partner-links/:id` - Unlink partner

**Verification**:
- `POST /api/verification/identity` - Upload identity verification
- `POST /api/verification/lifestyle` - Submit lifestyle verification
- `GET /api/verification/status` - Get verification status

**Shared Couple**:
- `POST /api/couple/invite` - Invite secondary user for couple profile
- `PUT /api/couple/:id/accept` - Accept couple invite
- `GET /api/couple/:id/status` - Check couple setup status

**Photos with Visibility**:
- `POST /api/photos/upload` - Upload with visibility parameter
- `PUT /api/photos/:id/visibility` - Update photo visibility

#### 7.2 Service Functions to Create

**File**: `/app/src/services/partnerLinkService.ts`
```typescript
export const partnerLinkService = {
  searchUser: async (emailOrUsername: string) => { /* ... */ },
  sendInvite: async (partnerId: string, relationshipType: string, visibility: Visibility) => { /* ... */ },
  acceptInvite: async (linkId: string) => { /* ... */ },
  rejectInvite: async (linkId: string) => { /* ... */ },
  getMyLinks: async () => { /* ... */ },
  unlinkPartner: async (linkId: string) => { /* ... */ },
};
```

**File**: `/app/src/services/verificationService.ts` (update existing)
```typescript
export const verificationService = {
  uploadIdentity: async (file: File) => { /* ... */ },
  submitLifestyleVerification: async (lifestyles: string[]) => { /* ... */ },
  getVerificationStatus: async () => { /* ... */ },
  // ... existing functions
};
```

---

### Phase 8: UI/UX Enhancements

#### 8.1 Progress Indicator Update

Change from 6 steps to 10 steps:
```typescript
const progress = useMemo(() => {
  if (step === 0) return 0;
  const totalSteps = 10;
  const currentStepNum = step === '2a' ? 2.5 : step;
  return (currentStepNum / totalSteps) * 100;
}, [step]);
```

#### 8.2 Step Labels

Add step indicators:
```typescript
const STEP_LABELS = {
  0: 'Account Type',
  1: 'Relationship Status',
  '2a': 'Partner Linking',
  2: 'Lifestyle',
  3: 'Roles & Dynamics',
  4: 'Kinks & Preferences',
  5: 'Profile Details',
  6: 'Photos',
  7: 'Privacy',
  8: 'Verification',
  9: 'Review & Publish'
};
```

#### 8.3 Visual Indicators

- **Partner Link Status**: Pending (yellow), Accepted (green), Rejected (red)
- **Photo Visibility**: Public (🌐), Matches Only (🔒), Private (👁️)
- **Verification Status**: Verified (✓ green badge), Pending (⏳), Not Started (-)
- **Step Completion**: Checkmarks on completed steps in progress bar

---

### Phase 9: Database Schema Updates Required

#### 9.1 New Tables

**partner_links**:
```sql
CREATE TABLE partner_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  relationship_type TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'matches_only', 'private')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, partner_id)
);
```

**profile_verifications**:
```sql
CREATE TABLE profile_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  identity_verified BOOLEAN DEFAULT FALSE,
  identity_verified_at TIMESTAMP,
  lifestyle_verified TEXT[],
  partner_verified_ids UUID[],
  verification_documents JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 9.2 Update profiles Table

Add new columns:
```sql
ALTER TABLE profiles
ADD COLUMN account_type TEXT CHECK (account_type IN ('individual', 'individual_with_linking', 'shared_couple')),
ADD COLUMN exploring_with TEXT CHECK (exploring_with IN ('partner', 'solo', 'n/a')),
ADD COLUMN lifestyles TEXT[],
ADD COLUMN roles TEXT[],
ADD COLUMN kink_tags TEXT[],
ADD COLUMN safeword TEXT,
ADD COLUMN pronouns TEXT,
ADD COLUMN profile_visibility TEXT CHECK (profile_visibility IN ('public', 'verified_only', 'matches_only', 'private')),
ADD COLUMN primary_user_id UUID REFERENCES auth.users(id),
ADD COLUMN secondary_user_id UUID REFERENCES auth.users(id),
ADD COLUMN couple_name TEXT,
ADD COLUMN couple_bio TEXT,
ADD COLUMN partner_quick_stats JSONB,
ADD COLUMN trust_score INTEGER DEFAULT 0;
```

**Update photos table**:
```sql
ALTER TABLE photos
ADD COLUMN visibility TEXT CHECK (visibility IN ('public', 'matches_only', 'private')) DEFAULT 'public',
ADD COLUMN is_blurred_until_match BOOLEAN DEFAULT FALSE;
```

---

### Phase 10: Validation & Error Handling

#### 10.1 Enhanced Validation Rules

```typescript
const validateStep = (currentStep: number | string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  switch (currentStep) {
    case 0:
      if (!formData.accountType) {
        errors.push('Please select an account type');
      }
      break;
    
    case 1:
      if (!formData.relationshipStatus || formData.relationshipStatus.length === 0) {
        errors.push('Please select your relationship status');
      }
      if (formData.relationshipStatus?.includes('in_relationship') && !formData.exploringWith) {
        errors.push('Please specify if you\'re exploring with partner or solo');
      }
      break;
    
    case '2a':
      // Optional step - no validation errors
      break;
    
    case 2:
      if (!formData.lifestyles || formData.lifestyles.length === 0) {
        errors.push('Please select at least one lifestyle');
      }
      break;
    
    case 3:
      if (!formData.roles || formData.roles.length === 0) {
        errors.push('Please select at least one role');
      }
      break;
    
    case 4:
      if (!formData.kinkTags || formData.kinkTags.length === 0) {
        errors.push('Please select at least one kink or preference');
      }
      if (formData.hardLimits && formData.softLimits) {
        const overlap = formData.hardLimits.filter(limit => 
          formData.softLimits?.includes(limit)
        );
        if (overlap.length > 0) {
          errors.push('Hard limits and soft limits cannot overlap');
        }
      }
      break;
    
    case 5:
      if (formData.accountType === 'shared_couple') {
        if (!formData.coupleName) errors.push('Couple name is required');
        if (!formData.coupleBio) errors.push('Couple bio is required');
        if (formData.coupleBio && (formData.coupleBio.length < 69 || formData.coupleBio.length > 1000)) {
          errors.push('Couple bio must be between 69 and 1000 characters');
        }
      } else {
        if (!formData.displayName) errors.push('Display name is required');
        if (!formData.bio) errors.push('Bio is required');
        if (formData.bio && (formData.bio.length < 69 || formData.bio.length > 1000)) {
          errors.push('Bio must be between 69 and 1000 characters');
        }
        if (!formData.location) errors.push('Location is required');
        if (!formData.birthdate) errors.push('Birth date is required');
        if (formData.birthdate && !validateDateOfBirth(formData.birthdate)) {
          errors.push('Invalid birth date or age must be 18-99');
        }
        if (!formData.genderIdentity) errors.push('Gender identity is required');
        if (!formData.sexualOrientation || formData.sexualOrientation.length === 0) {
          errors.push('Sexual orientation is required');
        }
      }
      break;
    
    case 6:
      if (!formData.photos || formData.photos.length < 2) {
        errors.push('Please upload at least 2 photos');
      }
      if (formData.photos && formData.photos.length > 10) {
        errors.push('Maximum 10 photos allowed');
      }
      break;
    
    case 7:
      if (!formData.profileVisibility) {
        errors.push('Please select profile visibility preference');
      }
      break;
    
    case 8:
      // Verification is optional - no errors
      break;
    
    case 9:
      // Final review - check all previous validations
      for (let i = 0; i <= 8; i++) {
        const stepValidation = validateStep(i);
        if (!stepValidation.isValid) {
          errors.push(`Step ${i} has incomplete information`);
        }
      }
      break;
  }
  
  return { isValid: errors.length === 0, errors };
};
```

---

### Phase 11: Testing Requirements

#### 11.1 Unit Tests to Create

**File**: `/app/src/pages/__tests__/ProfileSetup.test.tsx`

Test cases:
1. Account type selection
2. Conditional partner linking display
3. Step navigation (forward/backward/skip)
4. Form validation per step
5. Photo upload with visibility
6. Partner invite flow
7. Couple dual-login setup
8. Verification upload
9. Final submission

#### 11.2 Integration Tests

1. End-to-end individual account creation
2. End-to-end couple account creation
3. Partner linking acceptance/rejection flow
4. Photo visibility permissions
5. Verification workflow

---

### Phase 12: Migration Strategy

#### 12.1 Backward Compatibility

For existing profiles:
```typescript
const migrateOldProfile = (oldProfile: OldProfile): SpiceProfile => {
  return {
    ...oldProfile,
    accountType: oldProfile.accountType === 'couple' ? 'shared_couple' : 'individual',
    relationshipStatus: [oldProfile.relationshipStatus || 'single'],
    exploringWith: 'n/a',
    lifestyles: [],
    roles: oldProfile.topRoles || [],
    kinkTags: oldProfile.kinks || [],
    photos: oldProfile.photos?.map(url => ({
      id: uuid(),
      url,
      visibility: 'public',
      uploadedAt: new Date().toISOString()
    })) || [],
    profileVisibility: 'public',
    verification: {
      identityVerified: false,
      lifestyleVerified: [],
      partnerVerifiedIds: []
    },
    // ... map other fields
  };
};
```

#### 12.2 Deployment Steps

1. **Phase 1**: Deploy database schema updates
2. **Phase 2**: Deploy migration scripts for existing profiles
3. **Phase 3**: Deploy backend API endpoints
4. **Phase 4**: Deploy frontend with feature flag (old flow still accessible)
5. **Phase 5**: Test new flow in staging
6. **Phase 6**: Enable new flow for new users only
7. **Phase 7**: Migrate existing users with notification
8. **Phase 8**: Deprecate old flow

---

## Summary of Changes

### Files to Create (New)
1. `/app/src/types/profile.ts` - New type definitions
2. `/app/src/components/PartnerLinkInvite.tsx` - Partner invite component
3. `/app/src/components/PhotoVisibilitySelector.tsx` - Photo visibility control
4. `/app/src/components/VerificationUpload.tsx` - Verification upload UI
5. `/app/src/components/ProfileSummaryReview.tsx` - Final review component
6. `/app/src/services/partnerLinkService.ts` - Partner link API calls
7. `/app/src/pages/__tests__/ProfileSetup.test.tsx` - Unit tests

### Files to Modify (Existing)
1. `/app/src/pages/ProfileSetup.tsx` - Major rewrite (10 steps)
2. `/app/src/services/verificationService.ts` - Add new verification methods
3. `/app/src/services/profileService.ts` - Update profile creation
4. `/app/src/types/index.ts` - Import new profile types
5. `/app/src/hooks/useProfile.ts` - Update profile hook

### Database Changes
1. Create `partner_links` table
2. Create `profile_verifications` table
3. Alter `profiles` table (add new columns)
4. Alter `photos` table (add visibility columns)

### Key Metrics
- **Lines of Code**: ~3000+ lines (ProfileSetup.tsx will grow significantly)
- **New Components**: 4
- **New Services**: 1 (+ updates to 2 existing)
- **New Database Tables**: 2
- **Estimated Development Time**: 2-3 weeks for full implementation
- **Testing Time**: 1 week
- **Migration Time**: 1-2 days

---

## Implementation Priority

### Phase 1 (Week 1): Foundation
- Create new type definitions
- Update database schema
- Create basic 10-step flow structure
- Implement Steps 0-2 (without partner linking)

### Phase 2 (Week 2): Core Features
- Implement Steps 3-6
- Add photo visibility system
- Create partner linking UI (Step 2a)
- Implement conditional step logic

### Phase 3 (Week 3): Advanced Features
- Implement Steps 7-9
- Add verification system
- Create review & publish flow
- Build dual-login couple setup

### Phase 4 (Week 4): Polish & Testing
- Unit tests
- Integration tests
- UI/UX refinements
- Bug fixes
- Migration scripts

---

## Risk Mitigation

### High Risk Areas
1. **Partner Linking Complexity**: Multiple edge cases (pending, accepted, rejected, unlink)
2. **Dual Login Couples**: Session management, permission checks
3. **Photo Visibility**: Privacy implications, access control
4. **Data Migration**: Converting old profiles to new structure

### Mitigation Strategies
1. Extensive testing of partner link states
2. Clear documentation of couple permission model
3. Strict RLS policies for photos
4. Gradual rollout with feature flags
5. Backup plan to revert to old flow if critical issues arise

---

## Success Criteria

✅ All 10 steps functional for individual accounts
✅ All 10 steps functional for shared couple accounts
✅ Partner linking flow complete (invite/accept/reject)
✅ Photo visibility controls working
✅ Verification system operational
✅ Backward compatibility with existing profiles
✅ All unit tests passing (>90% coverage)
✅ No breaking changes to existing user profiles
✅ Performance: Profile creation completes in <5 seconds
✅ Mobile responsive for all steps

---

## Open Questions

1. Should partner linking be synchronous (wait for acceptance) or async (continue setup)?
2. What happens if partner rejects invite after profile is published?
3. Should verification be required for VIP members?
4. Maximum number of partner links allowed per user?
5. Can couple profiles unlink and convert to individual?
6. Should there be a "draft" state for profiles?

---

**End of Implementation Plan**
**Document Version**: 1.0
**Last Updated**: [Current Date]
**Prepared By**: E1 Agent
**Status**: Ready for Review & Implementation
