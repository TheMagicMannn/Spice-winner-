# ProfileSetup.tsx - Complete Steps & Fields List

## Account Types (3)
1. **Individual** - Solo account
2. **Individual with Partner Linking** - Solo account with ability to link partners
3. **Shared Couple** - Dual-login couple account

---

## Step-by-Step Breakdown

### **Step 0: Account Type Selection**

**All Account Types**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `accountType` | Radio Selection | Yes | `individual`, `individual_with_linking`, `shared_couple` |

**Next Step**: Step 1

---

### **Step 1: Relationship Status & Exploration**

**All Account Types**

| Field | Type | Required | Options/Format |
|-------|------|----------|----------------|
| `relationshipStatus[]` | Multi-select tags | Yes | `single`, `in_relationship`, `partnered`, `open_relationship`, `polyamorous`, `swinger`, `other` |
| `exploringWith` | Radio buttons | Conditional* | `partner`, `solo`, `n/a` |

*Only shown if `relationshipStatus` includes `in_relationship`

**Conditional Logic:**
- If `exploringWith === 'partner'` OR any of these statuses: `open_relationship`, `polyamorous`, `swinger` → Show Step 2a

**Next Step**: Step 2a (conditional) or Step 2

---

### **Step 2a: Partner Linking (CONDITIONAL)**

**Only shown for:**
- `individual_with_linking` account type
- OR if exploring with partner
- OR if polyamorous/open/swinger status

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Search Input | Text | No | Search for existing SPICE user by email/username |
| `partnerLinks[].partnerId` | UUID | No | Selected partner user ID |
| `partnerLinks[].relationshipType` | Dropdown | No | `primary`, `secondary`, `anchor`, `casual` |
| `partnerLinks[].visibility` | Dropdown | No | `public`, `matches_only`, `private` |
| `partnerLinks[].status` | Auto-set | N/A | `pending` (set automatically) |

**Features:**
- User search functionality
- Can skip this step
- Can add multiple partners

**Next Step**: Step 2

---

### **Step 2: Lifestyle Definition**

**All Account Types**

| Field | Type | Required | Max | Options |
|-------|------|----------|-----|---------|
| `lifestyles[]` | Multi-select tags | Yes | No limit | `ENM`, `BDSM`, `Poly`, `Swinger`, `Vanilla` |

**Next Step**: Step 3

---

### **Step 3: Roles & Dynamics**

**All Account Types**

| Field | Type | Required | Options/Details |
|-------|------|----------|-----------------|
| `roles[]` | Multi-select tags | Yes | 32 role options (see full list below) |
| `experienceLevel` | Dropdown | No | `New`, `Beginner`, `Moderate`, `Advanced` |
| Kink Quiz | Button | No | Optional quiz for role suggestions |

**Role Options (32):**
- Dominant, Submissive, Switch, Top, Bottom, Versatile
- Master/Mistress, Slave, Daddy/Mommy, Little, Brat, Brat Tamer
- Sadist, Masochist, Rigger, Rope Bunny, Pet, Owner, Handler
- Primal (Hunter), Primal (Prey), Voyeur, Exhibitionist
- Service Submissive, Service Dominant, Ageplayer
- Degrader, Degradee, Non-monogamist, Experimentalist, Vanilla

**Next Step**: Step 4

---

### **Step 4: Kinks & Preferences**

**All Account Types**

| Field | Type | Required | Max | Options |
|-------|------|----------|-----|---------|
| `kinkTags[]` | Multi-select grid | Yes | 15 | 40+ kink options (see below) |
| `softLimits[]` | Multi-select grid | No | 10 | 25+ limit options (see below) |
| `hardLimits[]` | Multi-select grid | No | 10 | 25+ limit options (see below) |
| `safeword` | Text input | No | N/A | Free text |

**Kink Tag Options (40+):**
- Threesomes, Spanking, Light bondage, Restraints, Blindfolds
- Dirty talk / name-calling, Hair pulling, Biting / marking, Collar & leash
- Role-play, Sex Toys, Pegging / strap-on play, Temperature play
- Nipple clamps, Oral sex, Edging / orgasm control
- Watching partner masturbate, Recording/Pictures During Play
- Public play, Spitting, Slapping, Breeding, Gangbangs
- Daddy/Mommy kink, Choking / breath play, Wax play
- Degradation / praise, Shibari / decorative rope
- Cuckolding or hotwife, Anal play, Pet play, CNC, Watersports
- BDSM, Voyeurism, Exhibitionism, Swinging, Group Play
- Tantric Sex, Food Play

**Limit Options (25+):**
- Scat, Blood Play, Illegal Activities, Permanent Marks
- Breath Play, Findom, Needles, Vomit, Hard Insults
- Public Humiliation, Animals, Underage, Non-Consensual
- Weapon Play, Fire Play, Edge Play, Race Play
- Intercourse, Oral Sex, No Condoms, Overnights
- Intoxication, Face Slapping, Choking, Gagging

**Next Step**: Step 5

---

### **Step 5: Profile Details**

#### **For Individual & Individual with Linking:**

| Field | Type | Required | Format/Options |
|-------|------|----------|----------------|
| `displayName` | Text input | Yes | Free text |
| `bio` | Textarea | Yes | 69-1000 characters |
| `location` | Text input | Yes | "City, State" format |
| `birthdate` | Text input | Yes | MM/DD/YYYY (auto-formatted) |
| `genderIdentity` | Dropdown | Yes | Male, Female, Non-binary, Transgender Male, Transgender Female, Genderqueer, Gender Fluid, Agender, Two-Spirit, Other |
| `pronouns` | Dropdown | No | he/him, she/her, they/them, ze/zir, xe/xem, any pronouns, other, prefer not to say |
| `sexualOrientation[]` | Multi-select tags | Yes | Straight, Bisexual, Gay, Lesbian, Pansexual, Queer, Asexual, Demisexual, Sapiosexual, Other |

**Physical Stats (Optional):**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `height` | Dropdown | No | 4'0" to 7'0" (1" increments) |
| `weight` | Dropdown | No | 75-450 lbs (5 lb increments) |
| `bodyType` | Dropdown | No | Slim, Average, Athletic, Curvy, Fit, Thick, Plus-size, Dad Bod, BBW |
| `hairColor` | Dropdown | No | Bald, Black, Brown, Blonde, Red, Auburn, Gray, White, Silver, Dyed - unnatural colors, Dyed - natural colors, Salt and Pepper |
| `eyeColor` | Dropdown | No | Brown, Blue, Green, Hazel, Gray, Amber, Violet, Two different colors, Black |
| `facialHair` | Dropdown | No | Yes, No, Doesn't Apply |
| `ethnicity` | Dropdown | No | White/Caucasian, Black/African American, Hispanic/Latino, Asian, Native American, Middle Eastern, South Asian, Pacific Islander, Mixed/Multiple, Other |
| `cigaretteSmoker` | Dropdown | No | Yes, No |
| `alcoholDrinker` | Dropdown | No | Yes, No |
| `marijuanaUser` | Dropdown | No | Yes, No |
| `bodyHair` | Dropdown | No | Smooth/shaved, Lightly trimmed, Natural, Hairy, Very hairy |
| `groomingStyle` | Dropdown | No | Fully shaved, Well-groomed, Natural, Casual, Wild/untamed |
| `birthControl` | Dropdown | No | Not applicable, None, Condoms, Birth control pills, IUD, Implant, Shot, Vasectomy, Tubal ligation, Other |
| `canHost` | Dropdown | No | Yes, No, Possibly |
| `tattoos` | Toggle | No | true/false |
| `piercings` | Toggle | No | true/false |
| `latexAllergy` | Toggle | No | true/false |
| `lastSTITestDate` | Date input | No | Date picker |
| `stiPositiveResults` | Dropdown | No | Yes, No |

#### **For Shared Couple:**

| Field | Type | Required | Format |
|-------|------|----------|--------|
| `coupleName` | Text input | Yes | Free text |
| `coupleBio` | Textarea | Yes | 69-1000 characters |
| `location` | Text input | Yes | "City, State" format |
| `partnerQuickStats.partnerA.displayName` | Text input | No | Free text |
| `partnerQuickStats.partnerA.age` | Number input | No | 18-99 |
| `partnerQuickStats.partnerA.role` | Text input | No | Free text |
| `partnerQuickStats.partnerB.displayName` | Text input | No | Free text |
| `partnerQuickStats.partnerB.age` | Number input | No | 18-99 |
| `partnerQuickStats.partnerB.role` | Text input | No | Free text |

**Next Step**: Step 6

---

### **Step 6: Photos & Media**

**All Account Types**

| Field | Type | Required | Details |
|-------|------|----------|---------|
| `photos[]` | File upload | Yes | Min 2, Max 10 photos |
| `photos[].url` | String | Auto | Photo URL after upload |
| `photos[].visibility` | Dropdown per photo | Yes | `public`, `matches_only`, `private` |
| `photos[].isBlurredUntilMatch` | Toggle per photo | No | Only for `matches_only` photos |
| `photos[].id` | UUID | Auto | Generated automatically |
| `photos[].uploadedAt` | Timestamp | Auto | Upload timestamp |

**Features:**
- Upload via file picker
- Drag & drop support
- Per-photo visibility control with icons:
  - 🌐 Public
  - 🔒 Matches Only
  - 👁️ Private
- Option to blur photos until match (for matches_only)
- Remove photo button (×) on each photo
- Visual grid display

**Next Step**: Step 7

---

### **Step 7: Privacy Settings**

**All Account Types**

| Field | Type | Required | Options/Range |
|-------|------|----------|---------------|
| `profileVisibility` | Dropdown | Yes | `public`, `verified_only`, `matches_only`, `private` |

**Match Preferences:**

| Field | Type | Required | Range/Options |
|-------|------|----------|---------------|
| `matchPreferences.ageRange[0]` | Range slider | No | 18-99 (min) |
| `matchPreferences.ageRange[1]` | Range slider | No | 18-99 (max) |
| `matchPreferences.genders[]` | Multi-select | No | Same as gender options |
| `matchPreferences.sexualities[]` | Multi-select | No | Same as sexuality options |
| `matchPreferences.searchingFor[]` | Multi-select | No | `individual`, `couple`, `both` |
| `matchPreferences.distance` | Range slider | No | 0-200 miles |
| `matchPreferences.vipOnly` | Toggle | No | true/false (hidden in UI) |
| `matchPreferences.verifiedOnly` | Toggle | No | true/false |
| `matchPreferences.experienceLevels[]` | Multi-select | No | New, Beginner, Moderate, Advanced |

**Next Step**: Step 8

---

### **Step 8: Verification (Optional)**

**All Account Types**

| Field | Type | Required | Details |
|-------|------|----------|---------|
| `verification.identityVerified` | Boolean | No | Set after document upload |
| `verification.identityVerifiedAt` | Timestamp | Auto | Verification timestamp |
| Identity Document Upload | File upload | No | Government-issued ID |
| `verification.lifestyleVerified[]` | Multi-select | No | ENM, BDSM, Poly, Swinger, Vanilla |
| `verification.partnerVerifiedIds[]` | UUID Array | Auto | List of verified partner links |

**Features:**
- Identity verification: Upload document (image/PDF)
- Lifestyle verification: Select lifestyles to verify
- Partner verification: Shows linked partners status
- Verification badges displayed after approval

**Next Step**: Step 9

---

### **Step 9: Review & Publish**

**All Account Types**

**Review Sections:**
- Account Type Summary (with edit button → Step 0)
- Relationship Status Summary (with edit button → Step 1)
- Partner Links Summary (with edit button → Step 2a) *if applicable*
- Lifestyles Summary (with edit button → Step 2)
- Roles & Dynamics Summary (with edit button → Step 3)
- Kinks & Preferences Summary (with edit button → Step 4)
- Profile Details Summary (with edit button → Step 5)
- Photos Summary (with edit button → Step 6)
- Privacy Settings Summary (with edit button → Step 7)
- Verification Summary (with edit button → Step 8)

**Membership Selection:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `membershipTier` | Radio selection | Yes | `basic` (Free), `vip` ($24.99/month) |

**VIP Features:**
- ✅ All features unlocked
- ✅ Priority match visibility
- ✅ Unlimited messages
- ✅ Access to VIP-only events

**Basic Features:**
- ✓ Basic features
- ✗ Limited visibility
- ✗ No priority matching

**Final Action:**
- Terms & Conditions acceptance (implied)
- "Publish Profile 🚀" button

---

## Validation Summary

### Step-by-Step Validation

| Step | Can Proceed When |
|------|------------------|
| **0** | `accountType` is selected |
| **1** | `relationshipStatus.length > 0` AND (`exploringWith` set if `in_relationship`) |
| **2a** | Always (optional step, can skip) |
| **2** | `lifestyles.length > 0` |
| **3** | `roles.length > 0` |
| **4** | `kinkTags.length > 0` |
| **5 (Individual)** | `displayName` AND `bio` (69-1000 chars) AND `location` AND valid `birthdate` (age 18-99) AND `genderIdentity` AND `sexualOrientation.length > 0` |
| **5 (Couple)** | `coupleName` AND `coupleBio` (69-1000 chars) AND `location` |
| **6** | `photos.length >= 2` AND `photos.length <= 10` |
| **7** | `profileVisibility` is set |
| **8** | Always (verification is optional) |
| **9** | All previous steps valid AND `membershipTier` selected |

---

## Data Model Summary

### Individual Account
- Core fields: ~30
- Optional fields: ~25
- Partner links: 0-∞
- Photos: 2-10
- Total configurable: ~60 fields

### Shared Couple Account
- Core fields: ~15
- Partner stats: ~12
- Partner links: 0-∞
- Photos: 2-10
- Total configurable: ~35 fields

---

## Special Features

### Conditional Step Logic
```
Step 2a shows IF:
  - accountType === 'individual_with_linking' OR
  - exploringWith === 'partner' OR
  - relationshipStatus includes ['open_relationship', 'polyamorous', 'swinger']
```

### Auto-formatting
- **Date of Birth**: Automatically formats as MM/DD/YYYY
- **Age Calculation**: Displays calculated age in real-time
- **Character Counter**: Shows bio character count with color coding

### Visual Indicators
- ✓ Green checkmark - Complete/Verified
- ⚠️ Warning - Incomplete
- 🌐 Public visibility
- 🔒 Matches only visibility
- 👁️ Private visibility
- 🎯 Kink quiz available

### Progress Tracking
- Progress bar shows (currentStep / 10) * 100%
- Step labels shown at top
- Can navigate backward
- Cannot skip ahead without completing current step

---

## Total Fields by Account Type

### Individual Account
- **Required**: 12 fields (Step 0-6)
- **Optional**: 48+ fields (physical stats, verification, preferences)
- **Total**: 60+ fields

### Shared Couple Account
- **Required**: 8 fields (Step 0-6)
- **Optional**: 27+ fields (partner stats, verification, preferences)
- **Total**: 35+ fields

---

## File Structure

```typescript
interface SpiceProfile {
  // Step 0
  accountType: AccountType;
  
  // Step 1
  relationshipStatus: string[];
  exploringWith: string;
  
  // Step 2a
  partnerLinks: PartnerLink[];
  
  // Step 2
  lifestyles: string[];
  
  // Step 3
  roles: string[];
  experienceLevel: string;
  
  // Step 4
  kinkTags: string[];
  softLimits: string[];
  hardLimits: string[];
  safeword: string | null;
  
  // Step 5 (Individual)
  displayName: string;
  bio: string;
  location: Location | string;
  birthdate: string;
  age: number;
  genderIdentity: string;
  pronouns: string;
  sexualOrientation: string[];
  // ... physical stats
  
  // Step 5 (Couple)
  coupleName: string;
  coupleBio: string;
  partnerQuickStats: object;
  
  // Step 6
  photos: PhotoItem[];
  
  // Step 7
  profileVisibility: ProfileVisibility;
  matchPreferences: MatchPreferences;
  
  // Step 8
  verification: Verification;
  
  // Step 9
  membershipTier: 'basic' | 'vip';
}
```

---

**End of ProfileSetup.tsx Steps & Fields Documentation**
