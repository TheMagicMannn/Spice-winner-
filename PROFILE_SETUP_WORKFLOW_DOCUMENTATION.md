# Profile Setup Workflow Documentation - ProfileSetup.tsx

## Overview
The ProfileSetup.tsx component manages the onboarding flow for new users with two distinct account types: **Individual** and **Couple**. Each type has a 7-step workflow (including Step 0 for account type selection).

---

## Step 0: Account Type Selection

### Purpose
Initial selection screen where users choose between Individual or Couple account.

### Input Fields
1. **Account Type Selection**
   - Type: Radio button selection
   - Options: 
     - `individual` - Individual Account (ð§)
     - `couple` - Couples Account (ð©ââ¤ï¸âð¨)
   - Required: Yes
   - Validation: Must select one before proceeding

### Progression
- **Next Step**: Step 1 (Basic Info)
- **Can Proceed**: Only if account type is selected

---

## INDIVIDUAL ACCOUNT WORKFLOW

### Step 1: Basic Information ("Tell us about yourself")

#### Input Fields

1. **Display Name**
   - Field: `displayName`
   - Type: Text input
   - Required: Yes
   - Validation: Must be non-empty

2. **Location**
   - Field: `location`
   - Type: Text input
   - Format: "City, State" (e.g., "Los Angeles, CA")
   - Required: Yes
   - Features:
     - Location verification button (for VIP members)
     - Shows verification status: verified â / may be inaccurate â 
   - Validation: Must be non-empty

3. **Gender**
   - Field: `gender`
   - Type: Dropdown select
   - Required: Yes
   - Options: ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Other']

4. **Sexuality**
   - Field: `orientation`
   - Type: Dropdown select
   - Required: Yes
   - Options: ['Straight', 'Bisexual', 'Gay', 'Pansexual', 'Queer', 'Asexual', 'Other']

5. **Date of Birth**
   - Field: `dateOfBirth`
   - Type: Text input with auto-formatting
   - Format: MM/DD/YYYY
   - Required: Yes
   - Validation: 
     - Must match regex: `/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/`
     - Valid date
     - Age must be 18-99 years old
   - Display: Shows calculated age when valid

6. **Current Relationship Status**
   - Field: `relationshipStatus`
   - Type: Dropdown select
   - Required: Yes
   - Options: ['Single', 'Partnered', 'Married', 'Complicated', 'Open Relationship', 'In a Relationship with a Vanilla Partner', 'In a Relationship with a SPICE User']

#### Progression
- **Can Proceed**: All required fields filled AND valid date of birth
- **Next Step**: Step 2 (Role Selection)

---

### Step 2: Role Selection & Kink Quiz ("Discover Your Role")

#### Input Fields

1. **Top Roles**
   - Field: `topRoles`
   - Type: Dropdown select
   - Required: At least 1 role OR quiz completed
   - Options: ['Ageplayer', 'Experimentalist', 'Pet', 'Rope bunny', 'Masochist', 'Degradee', 'Submissive', 'Exhibitionist', 'Primal (Prey)', 'Non-monogamist', 'Rigger', 'Switch', 'Daddy/Mommy', 'Voyeur', 'Sadist', 'Dominant', 'Master/Mistress', 'Brat tamer', 'Slave', 'Owner', 'Degrader', 'Little', 'Brat', 'Vanilla', 'Primal (Hunter)']
   - Features:
     - "Take Kink Quiz" button to get role suggestions
     - Shows quiz results with top 5 roles and percentages

2. **Kink Quiz Results** (if quiz taken)
   - Field: `kinkQuizResults`
   - Type: Object (Record<string, number>)
   - Required: No
   - Display: Top 5 roles with percentages

3. **Lifestyle Experience Level**
   - Field: `lifestyleExperience`
   - Type: Dropdown select
   - Required: No
   - Default: 'New'
   - Options: ['New', 'Beginner', 'Moderate', 'Advanced']

4. **Kinks You're Interested In**
   - Field: `interestedKinks`
   - Type: Multi-select checkbox grid
   - Max: 15 selections
   - Options: ['Threesomes', 'Spanking', 'Light bondage', 'Restraints', 'Blindfolds', 'Dirty talk / name-calling', 'Hair pulling', 'Biting / marking', 'Collar & leash', 'Role-play', 'Sex Toys', 'Pegging / strap-on play', 'Temperature play', 'Nipple clamps', 'Oral sex', 'Edging / orgasm control', 'Watching partner masturbate', 'Recording/Pictures During Play', 'Public play', 'Spitting', 'Slapping', 'Breeding', 'Gangbangs', 'Daddy/Mommy kink', 'Choking / breath play', 'Wax play', 'Degradation / praise', 'Shibari / decorative rope', 'Cuckolding or hotwife', 'Anal play', 'Pet play', 'CNC', 'Watersports']

5. **Soft Limits**
   - Field: `softLimits`
   - Type: Multi-select checkbox grid
   - Max: 10 selections
   - Options: ['Scat', 'Blood Play', 'Illegal Activities', 'Permanent Marks', 'Breath Play', 'Findom', 'Needles', 'Vomit', 'Hard Insults', 'Public Humiliation', 'Animals', 'Underage', 'Non-Consensual', 'Weapon Play', 'Fire Play', 'Edge Play', 'Race Play', 'Intercourse', 'Oral Sex', 'No Condoms', 'Overnights', 'Intoxication', 'Face Slapping', 'Choking', 'Gagging']

6. **Hard Limits**
   - Field: `hardLimits`
   - Type: Multi-select checkbox grid
   - Max: 10 selections
   - Options: Same as Soft Limits

7. **Safety/Health Practices**
   - Field: `safetyPractices`
   - Type: Textarea
   - Required: No
   - Rows: 3

8. **Rules**
   - Field: `rules`
   - Type: Textarea
   - Required: No
   - Rows: 3

#### Progression
- **Can Proceed**: At least 1 role selected OR quiz completed
- **Next Step**: Step 3 (About Me)

---

### Step 3: About Me

#### Input Fields

1. **Bio**
   - Field: `bio`
   - Type: Textarea
   - Required: Yes
   - Min: 69 characters
   - Max: 1000 characters
   - Validation: Length between 69-1000 characters
   - Display: Character counter showing current/max

2. **Height**
   - Field: `height`
   - Type: Dropdown select
   - Required: No
   - Options: 4'0" to 7'0" in 1-inch increments (e.g., "4'0\"", "4'1\"", ... "7'0\"")

3. **Weight**
   - Field: `weight`
   - Type: Dropdown select
   - Required: No
   - Options: 75 to 450 lbs in 5-lb increments (e.g., "75 lbs", "80 lbs", ... "450 lbs")

4. **Body Type**
   - Field: `bodyType`
   - Type: Dropdown select
   - Required: No
   - Options: ['Slim', 'Average', 'Dad Bod', 'Curvy', 'Fit', 'Thick', 'BBW']

5. **Hair Color**
   - Field: `hairColor`
   - Type: Dropdown select
   - Required: No
   - Options: ['Bald', 'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Silver', 'Dyed - unnatural colors', 'Dyed - natural colors', 'Salt and Pepper']

6. **Eye Color**
   - Field: `eyeColor`
   - Type: Dropdown select
   - Required: No
   - Options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Two different colors', 'Black']

7. **Facial Hair**
   - Field: `facialHair`
   - Type: Dropdown select
   - Required: No
   - Options: ['Yes', 'No', "Doesn't Apply"]

8. **Ethnicity**
   - Field: `ethnicity`
   - Type: Dropdown select
   - Required: No
   - Options: ['White/Caucasian', 'Black/African American', 'Hispanic/Latino', 'Asian', 'Native American', 'Middle Eastern', 'South Asian', 'Pacific Islander', 'Mixed/Multiple', 'Other']

9. **Cigarette Smoker**
   - Field: `cigaretteSmoker`
   - Type: Dropdown select
   - Required: No
   - Options: ['Yes', 'No']

10. **Alcohol Drinker**
    - Field: `alcoholDrinker`
    - Type: Dropdown select
    - Required: No
    - Options: ['Yes', 'No']

11. **Marijuana User**
    - Field: `marijuanaUser`
    - Type: Dropdown select
    - Required: No
    - Options: ['Yes', 'No']

12. **Body Hair**
    - Field: `bodyHair`
    - Type: Dropdown select
    - Required: No
    - Options: ['Smooth/shaved', 'Lightly trimmed', 'Natural', 'Hairy', 'Very hairy']

13. **Grooming Style**
    - Field: `groomingStyle`
    - Type: Dropdown select
    - Required: No
    - Options: ['Fully shaved', 'Well-groomed', 'Natural', 'Casual', 'Wild/untamed']

14. **Birth Control**
    - Field: `birthControl`
    - Type: Dropdown select
    - Required: No
    - Options: ['Not applicable', 'None', 'Condoms', 'Birth control pills', 'IUD', 'Implant', 'Shot', 'Vasectomy', 'Tubal ligation', 'Other']

15. **Can Host?**
    - Field: `canHost`
    - Type: Dropdown select
    - Required: No
    - Options: ['Yes', 'No', 'Possibly']

16. **Tattoos**
    - Field: `tattoos`
    - Type: Checkbox/Toggle
    - Required: No
    - Default: false

17. **Piercings**
    - Field: `piercings`
    - Type: Checkbox/Toggle
    - Required: No
    - Default: false

18. **Latex Allergy**
    - Field: `latexAllergy`
    - Type: Checkbox/Toggle
    - Required: No
    - Default: false

19. **Last STI Test Date**
    - Field: `lastSTITestDate`
    - Type: Date input
    - Required: No

20. **STI Positive Results**
    - Field: `stiPositiveResults`
    - Type: Dropdown select
    - Required: No
    - Options: ['Yes', 'No']

#### Progression
- **Can Proceed**: Bio is 69-1000 characters
- **Next Step**: Step 4 (Photos)

---

### Step 4: Add Your Photos

#### Input Fields

1. **Profile Photos**
   - Field: `photos` (stored as URLs after upload)
   - Type: File upload (images)
   - Required: Yes
   - Min: 2 photos
   - Max: 10 photos
   - Accept: image/*
   - Features:
     - Grid display of uploaded photos
     - Remove button (×) for each photo
     - Add more button (+) when less than 10 photos

2. **My Kinks/Fetishes**
   - Field: `kinks`
   - Type: Multi-select checkbox grid
   - Max: 10 selections
   - Options: ['BDSM', 'Roleplay', 'Voyeurism', 'Exhibitionism', 'Swinging', 'Group Play', 'Tantric Sex', 'Food Play', 'Dominance', 'Submission', 'Bondage', 'Impact Play', 'Sensory Deprivation', 'Age Play', 'Cuckolding', 'Foot Fetish', 'Leather/Latex', 'Uniforms', 'Medical Play', 'Pet Play', 'Praise', 'Degradation', 'Watersports', 'Anal Play', 'Public Play']

3. **Seeking Matches With These Interests**
   - Field: `interests`
   - Type: Multi-select checkbox grid
   - Max: 10 selections
   - Options: ['Live Music', 'Wine Tasting', 'Craft Beer', 'Hiking', 'Art Galleries', 'Dancing', 'Travel', 'Fine Dining', 'Fitness/Gym', 'Yoga/Meditation', 'Photography', 'Gaming', 'Boating', 'Movies', 'Theater', 'Cooking', 'Rooftop Bars', 'Speakeasies', 'Cigars', 'Whiskey', 'Fashion', 'Charity Events', 'Sports', 'Reading', 'Beach Clubs']

4. **My Soft Limits** (duplicate from Step 2 for easy access)
   - Field: `softLimits`
   - Type: Multi-select checkbox grid
   - Max: 10 selections
   - Options: Same as Step 2

5. **My Hard Limits** (duplicate from Step 2)
   - Field: `hardLimits`
   - Type: Multi-select checkbox grid
   - Max: 10 selections
   - Options: Same as Step 2

6. **My Safety/Health Practices** (duplicate from Step 2)
   - Field: `safetyPractices`
   - Type: Textarea
   - Rows: 3

7. **My Rules** (duplicate from Step 2)
   - Field: `rules`
   - Type: Textarea
   - Rows: 3

8. **Seeking**
   - Field: `seeking`
   - Type: Multi-select tag buttons
   - Options: ['ð« Couple', 'ðââï¸ Man', 'ðââï¸ Woman', 'ð¶ Other']

9. **Seeking Relationship Type**
   - Field: `seekingRelationshipType`
   - Type: Multi-select tag buttons
   - Options: ['Casual NSA', 'FWB', 'Play Partners', 'Voyeur', 'Swingers Party Friends', 'Poly Relationship', 'Long-term', 'Short-term', 'Sugar Daddy/Baby']

10. **Lifestyle Experience Level**
    - Field: `lifestyleExperience`
    - Type: Dropdown select
    - Default: 'New'
    - Options: ['New', 'Beginner', 'Moderate', 'Advanced']

#### Progression
- **Can Proceed**: Minimum 2 photos uploaded
- **Next Step**: Step 5 (Match Preferences)

---

### Step 5: Fine-tune Your Match Preferences

#### Input Fields

1. **Preferred Age Range**
   - Field: `matchPreferences.ageRange`
   - Type: Dual range slider [min, max]
   - Range: 18-99
   - Default: [18, 55]
   - Display: Shows min-max values

2. **Preferred Genders**
   - Field: `matchPreferences.genders`
   - Type: Multi-select tag buttons
   - Options: ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Other']

3. **Preferred Sexualities**
   - Field: `matchPreferences.sexualities`
   - Type: Multi-select tag buttons
   - Options: ['Straight', 'Bisexual', 'Gay', 'Pansexual', 'Queer', 'Asexual', 'Other']

4. **Searching For**
   - Field: `matchPreferences.searchingFor`
   - Type: Multi-select tag buttons
   - Options: ['Individual', 'Couple', 'Both']

5. **Distance Preference**
   - Field: `matchPreferences.distance`
   - Type: Range slider
   - Range: 0-200 miles
   - Default: 50
   - Unit: miles

6. **Experience Level Preference**
   - Field: `matchPreferences.experienceLevels`
   - Type: Multi-select tag buttons
   - Options: ['New', 'Beginner', 'Moderate', 'Advanced']

7. **Verified Profiles Only**
   - Field: `matchPreferences.verifiedOnly`
   - Type: Checkbox/Toggle
   - Default: true

8. **VIP Only** (hidden but in data structure)
   - Field: `matchPreferences.vipOnly`
   - Type: Boolean
   - Default: false

#### Progression
- **Can Proceed**: Always (all fields optional)
- **Next Step**: Step 6 (Membership)

---

### Step 6: Choose Your Membership

#### Input Fields

1. **Membership Tier**
   - Field: `membershipTier`
   - Type: Radio selection (card-based)
   - Required: Yes
   - Options:
     - **basic** (Freemium - Basic):
       - â Basic features
       - â Limited visibility
       - â No priority matching
     - **vip** (ð VIP Membership):
       - ð All features unlocked
       - ð Priority match visibility
       - ð¬ Unlimited messages
       - ð Access to VIP-only events
       - Price: $24.99 / month
   - Default: 'basic'

#### Final Submission
- **Button**: "Complete My Profile ð"
- **Action**: Validates all data and creates profile
- **Validation**:
  - Account type must be set
  - Display name and location required
  - Gender and sexuality required
  - Minimum 2 photos required
  - Location verification for basic members
  - All step-specific validations passed

---

## COUPLE ACCOUNT WORKFLOW

### Step 1: Basic Information ("Meet the Two of You!")

#### Input Fields

1. **Location** (Shared)
   - Field: `location`
   - Type: Text input
   - Format: "City, State"
   - Required: Yes

#### Partner 1 Section

2. **Partner 1 Display Name**
   - Field: `displayName`
   - Type: Text input
   - Required: Yes

3. **Partner 1 Gender**
   - Field: `gender`
   - Type: Dropdown select
   - Required: Yes
   - Options: ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Other']

4. **Partner 1 Sexuality**
   - Field: `orientation`
   - Type: Dropdown select
   - Required: Yes
   - Options: ['Straight', 'Bisexual', 'Gay', 'Pansexual', 'Queer', 'Asexual', 'Other']

5. **Partner 1 Age**
   - Field: `age`
   - Type: Number input
   - Required: Yes
   - Min: 18
   - Max: 99

#### Partner 2 Section

6. **Partner 2 Display Name**
   - Field: `displayName2`
   - Type: Text input
   - Required: Yes

7. **Partner 2 Gender**
   - Field: `gender2`
   - Type: Dropdown select
   - Required: Yes
   - Options: ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Other']

8. **Partner 2 Sexuality**
   - Field: `orientation2`
   - Type: Dropdown select
   - Required: Yes
   - Options: ['Straight', 'Bisexual', 'Gay', 'Pansexual', 'Queer', 'Asexual', 'Other']

9. **Partner 2 Age**
   - Field: `age2`
   - Type: Number input
   - Required: Yes
   - Min: 18
   - Max: 99

#### Shared

10. **Current Relationship Status**
    - Field: `relationshipStatus`
    - Type: Dropdown select
    - Required: Yes
    - Options: ['Single', 'Partnered', 'Married', 'Complicated', 'Open Relationship', 'In a Relationship with a Vanilla Partner', 'In a Relationship with a SPICE User']

#### Progression
- **Can Proceed**: All fields filled AND both ages >= 18
- **Next Step**: Step 2 (Role Selection)

---

### Step 2: Role Selection & Kink Quiz ("Discover Your Roles")

#### Partner 1 Section

1. **Partner 1 Role**
   - Field: `partner1Role`
   - Type: Dropdown select
   - Required: Yes
   - Options: ['Ageplayer', 'Experimentalist', 'Pet', 'Rope bunny', 'Masochist', 'Degradee', 'Submissive', 'Exhibitionist', 'Primal (Prey)', 'Non-monogamist', 'Rigger', 'Switch', 'Daddy/Mommy', 'Voyeur', 'Sadist', 'Dominant', 'Master/Mistress', 'Brat tamer', 'Slave', 'Owner', 'Degrader', 'Little', 'Brat', 'Vanilla', 'Primal (Hunter)']
   - Features: "ð Take Kink Quiz" button for role suggestions

2. **Partner 1 Quiz Results** (if quiz taken)
   - Field: `partner1QuizResults`
   - Type: Object (Record<string, number>)
   - Required: No
   - Display: Top 5 roles with percentages

3. **Partner 1 Lifestyle Experience Level**
   - Field: `partner1Experience`
   - Type: Dropdown select
   - Default: 'New'
   - Options: ['New', 'Beginner', 'Moderate', 'Advanced']

4. **Partner 1 Kinks Interested In**
   - Field: `partner1Kinks`
   - Type: Multi-select checkbox grid
   - Max: 15 selections
   - Options: ['Threesomes', 'Spanking', 'Light bondage', 'Restraints', 'Blindfolds', 'Dirty talk / name-calling', 'Hair pulling', 'Biting / marking', 'Collar & leash', 'Role-play', 'Sex Toys', 'Pegging / strap-on play', 'Temperature play', 'Nipple clamps', 'Oral sex', 'Edging / orgasm control', 'Watching partner masturbate', 'Recording/Pictures During Play', 'Public play', 'Spitting', 'Slapping', 'Breeding', 'Gangbangs', 'Daddy/Mommy kink', 'Choking / breath play', 'Wax play', 'Degradation / praise', 'Shibari / decorative rope', 'Cuckolding or hotwife', 'Anal play', 'Pet play', 'CNC', 'Watersports']

5. **Partner 1 Soft Limits**
   - Field: `partner1SoftLimits`
   - Type: Multi-select checkbox grid
   - Max: 10 selections
   - Options: ['Scat', 'Blood Play', 'Illegal Activities', 'Permanent Marks', 'Breath Play', 'Findom', 'Needles', 'Vomit', 'Hard Insults', 'Public Humiliation', 'Animals', 'Underage', 'Non-Consensual', 'Weapon Play', 'Fire Play', 'Edge Play', 'Race Play', 'Intercourse', 'Oral Sex', 'No Condoms', 'Overnights', 'Intoxication', 'Face Slapping', 'Choking', 'Gagging']

6. **Partner 1 Hard Limits**
   - Field: `partner1HardLimits`
   - Type: Multi-select checkbox grid
   - Max: 10 selections
   - Options: Same as Soft Limits

7. **Partner 1 Safety/Health Practices**
   - Field: `partner1SafetyPractices`
   - Type: Textarea
   - Rows: 3

8. **Partner 1 Rules**
   - Field: `partner1Rules`
   - Type: Textarea
   - Rows: 3

#### Partner 2 Section

9. **Partner 2 Role**
   - Field: `partner2Role`
   - Type: Dropdown select
   - Required: Yes
   - Options: Same as Partner 1

10. **Partner 2 Quiz Results** (if quiz taken)
    - Field: `partner2QuizResults`
    - Type: Object (Record<string, number>)
    - Required: No

11. **Partner 2 Lifestyle Experience Level**
    - Field: `partner2Experience`
    - Type: Dropdown select
    - Default: 'New'
    - Options: ['New', 'Beginner', 'Moderate', 'Advanced']

12. **Partner 2 Kinks Interested In**
    - Field: `partner2Kinks`
    - Type: Multi-select checkbox grid
    - Max: 15 selections
    - Options: Same as Partner 1

13. **Partner 2 Soft Limits**
    - Field: `partner2SoftLimits`
    - Type: Multi-select checkbox grid
    - Max: 10 selections
    - Options: Same as Partner 1

14. **Partner 2 Hard Limits**
    - Field: `partner2HardLimits`
    - Type: Multi-select checkbox grid
    - Max: 10 selections
    - Options: Same as Partner 1

15. **Partner 2 Safety/Health Practices**
    - Field: `partner2SafetyPractices`
    - Type: Textarea
    - Rows: 3

16. **Partner 2 Rules**
    - Field: `partner2Rules`
    - Type: Textarea
    - Rows: 3

#### Shared Seeking Preferences

17. **Seeking**
    - Field: `seeking`
    - Type: Multi-select tag buttons
    - Options: ['ð« Couple', 'ðââï¸ Man', 'ðââï¸ Woman', 'ð¶ Other']

18. **Seeking Relationship Type**
    - Field: `seekingRelationshipType`
    - Type: Multi-select tag buttons
    - Options: ['Casual NSA', 'FWB', 'Play Partners', 'Voyeur', 'Swingers Party Friends', 'Poly Relationship', 'Long-term', 'Short-term', 'Sugar Daddy/Baby']

#### Progression
- **Can Proceed**: Both partner1Role AND partner2Role are set
- **Next Step**: Step 3 (About Us)

---

### Step 3: About Us

#### Input Fields

1. **Shared Bio**
   - Field: `bio`
   - Type: Textarea
   - Required: Yes
   - Min: 69 characters
   - Max: 1000 characters
   - Description: "Tell others about you as a coupleâwhat makes you special together."
   - Display: Character counter

#### Partner 1 Stats

2. **Partner 1 Height**
   - Field: `partner1Height`
   - Type: Dropdown select
   - Options: 4'0" to 7'0" in 1-inch increments

3. **Partner 1 Weight**
   - Field: `partner1Weight`
   - Type: Dropdown select
   - Options: 75 to 450 lbs in 5-lb increments

4. **Partner 1 Body Type**
   - Field: `partner1BodyType`
   - Type: Dropdown select
   - Options: ['Slim', 'Average', 'Dad Bod', 'Curvy', 'Fit', 'Thick', 'BBW']

5. **Partner 1 Hair Color**
   - Field: `partner1HairColor`
   - Type: Dropdown select
   - Options: ['Bald', 'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Silver', 'Dyed - unnatural colors', 'Dyed - natural colors', 'Salt and Pepper']

6. **Partner 1 Eye Color**
   - Field: `partner1EyeColor`
   - Type: Dropdown select
   - Options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Two different colors', 'Black']

7. **Partner 1 Facial Hair**
   - Field: `partner1FacialHair`
   - Type: Dropdown select
   - Options: ['Yes', 'No', "Doesn't Apply"]

8. **Partner 1 Ethnicity**
   - Field: `partner1Ethnicity`
   - Type: Dropdown select
   - Options: ['White/Caucasian', 'Black/African American', 'Hispanic/Latino', 'Asian', 'Native American', 'Middle Eastern', 'South Asian', 'Pacific Islander', 'Mixed/Multiple', 'Other']

9. **Partner 1 Cigarette Smoker**
   - Field: `partner1CigaretteSmoker`
   - Type: Dropdown select
   - Options: ['Yes', 'No']

10. **Partner 1 Alcohol Drinker**
    - Field: `partner1AlcoholDrinker`
    - Type: Dropdown select
    - Options: ['Yes', 'No']

11. **Partner 1 Marijuana User**
    - Field: `partner1MarijuanaUser`
    - Type: Dropdown select
    - Options: ['Yes', 'No']

12. **Partner 1 Body Hair**
    - Field: `partner1BodyHair`
    - Type: Dropdown select
    - Options: ['Smooth/shaved', 'Lightly trimmed', 'Natural', 'Hairy', 'Very hairy']

13. **Partner 1 Grooming Style**
    - Field: `partner1GroomingStyle`
    - Type: Dropdown select
    - Options: ['Fully shaved', 'Well-groomed', 'Natural', 'Casual', 'Wild/untamed']

14. **Partner 1 Birth Control**
    - Field: `partner1BirthControl`
    - Type: Dropdown select
    - Options: ['Not applicable', 'None', 'Condoms', 'Birth control pills', 'IUD', 'Implant', 'Shot', 'Vasectomy', 'Tubal ligation', 'Other']

15. **Partner 1 Can Host?**
    - Field: `partner1CanHost`
    - Type: Dropdown select
    - Options: ['Yes', 'No', 'Possibly']

16. **Partner 1 Tattoos**
    - Field: `partner1Tattoos`
    - Type: Checkbox/Toggle
    - Default: false

17. **Partner 1 Piercings**
    - Field: `partner1Piercings`
    - Type: Checkbox/Toggle
    - Default: false

18. **Partner 1 Latex Allergy**
    - Field: `partner1LatexAllergy`
    - Type: Checkbox/Toggle
    - Default: false

19. **Partner 1 Last STI Test Date**
    - Field: `partner1LastSTITestDate`
    - Type: Date input

20. **Partner 1 STI Positive Results**
    - Field: `partner1StiPositiveResults`
    - Type: Dropdown select
    - Options: ['Yes', 'No']

#### Partner 2 Stats (Fields 21-38)

All Partner 2 stats mirror Partner 1 stats with `partner2` prefix:
- partner2Height
- partner2Weight
- partner2BodyType
- partner2HairColor
- partner2EyeColor
- partner2FacialHair
- partner2Ethnicity
- partner2CigaretteSmoker
- partner2AlcoholDrinker
- partner2MarijuanaUser
- partner2BodyHair
- partner2GroomingStyle
- partner2BirthControl
- partner2CanHost
- partner2Tattoos
- partner2Piercings
- partner2LatexAllergy
- partner2LastSTITestDate
- partner2StiPositiveResults

#### Progression
- **Can Proceed**: Bio is 69-1000 characters
- **Next Step**: Step 4 (Photos)

---

### Step 4: Add Your Photos

#### Input Fields

1. **Profile Photos**
   - Field: `photos` (stored as URLs after upload)
   - Type: File upload (images)
   - Required: Yes
   - Min: 2 photos
   - Max: 10 photos
   - Accept: image/*
   - Features: Same as Individual - grid display with remove buttons

**Note**: For couples, this step typically only includes photo upload. Kinks, interests, and preferences were handled in previous steps per-partner.

#### Progression
- **Can Proceed**: Minimum 2 photos uploaded
- **Next Step**: Step 5 (Match Preferences)

---

### Step 5: Fine-tune Your Match Preferences

Same as Individual Step 5 - all fields identical.

#### Input Fields
1. Preferred Age Range (`matchPreferences.ageRange`)
2. Preferred Genders (`matchPreferences.genders`)
3. Preferred Sexualities (`matchPreferences.sexualities`)
4. Searching For (`matchPreferences.searchingFor`)
5. Distance Preference (`matchPreferences.distance`)
6. Experience Level Preference (`matchPreferences.experienceLevels`)
7. Verified Profiles Only (`matchPreferences.verifiedOnly`)

#### Progression
- **Can Proceed**: Always (all optional)
- **Next Step**: Step 6 (Membership)

---

### Step 6: Choose Your Membership

Same as Individual Step 6 - identical membership options.

#### Input Fields
1. **Membership Tier** (`membershipTier`)
   - basic (Freemium)
   - vip ($24.99/month)

#### Final Submission
- **Button**: "Complete Our Profile ð"
- **Action**: Validates all data and creates couple profile
- **Validation**: Same as Individual with couple-specific requirements

---

## Data Constants Reference

### Dropdown Options Arrays

```javascript
GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Other']

SEXUALITY_OPTIONS = ['Straight', 'Bisexual', 'Gay', 'Pansexual', 'Queer', 'Asexual', 'Other']

RELATIONSHIP_STATUS_OPTIONS = ['Single', 'Partnered', 'Married', 'Complicated', 'Open Relationship', 'In a Relationship with a Vanilla Partner', 'In a Relationship with a SPICE User']

SEEKING_OPTIONS = ['ð« Couple', 'ðââï¸ Man', 'ðââï¸ Woman', 'ð¶ Other']

SEEKING_RELATIONSHIP_TYPE_OPTIONS = ['Casual NSA', 'FWB', 'Play Partners', 'Voyeur', 'Swingers Party Friends', 'Poly Relationship', 'Long-term', 'Short-term', 'Sugar Daddy/Baby']

EXPERIENCE_LEVEL_OPTIONS = ['New', 'Beginner', 'Moderate', 'Advanced']

ROLE_OPTIONS = ['Ageplayer', 'Experimentalist', 'Pet', 'Rope bunny', 'Masochist', 'Degradee', 'Submissive', 'Exhibitionist', 'Primal (Prey)', 'Non-monogamist', 'Rigger', 'Switch', 'Daddy/Mommy', 'Voyeur', 'Sadist', 'Dominant', 'Master/Mistress', 'Brat tamer', 'Slave', 'Owner', 'Degrader', 'Little', 'Brat', 'Vanilla', 'Primal (Hunter)']

KINKS_INTERESTED_OPTIONS = ['Threesomes', 'Spanking', 'Light bondage', 'Restraints', 'Blindfolds', 'Dirty talk / name-calling', 'Hair pulling', 'Biting / marking', 'Collar & leash', 'Role-play', 'Sex Toys', 'Pegging / strap-on play', 'Temperature play', 'Nipple clamps', 'Oral sex', 'Edging / orgasm control', 'Watching partner masturbate', 'Recording/Pictures During Play', 'Public play', 'Spitting', 'Slapping', 'Breeding', 'Gangbangs', 'Daddy/Mommy kink', 'Choking / breath play', 'Wax play', 'Degradation / praise', 'Shibari / decorative rope', 'Cuckolding or hotwife', 'Anal play', 'Pet play', 'CNC', 'Watersports']

KINKS_OPTIONS = ['BDSM', 'Roleplay', 'Voyeurism', 'Exhibitionism', 'Swinging', 'Group Play', 'Tantric Sex', 'Food Play', 'Dominance', 'Submission', 'Bondage', 'Impact Play', 'Sensory Deprivation', 'Age Play', 'Cuckolding', 'Foot Fetish', 'Leather/Latex', 'Uniforms', 'Medical Play', 'Pet Play', 'Praise', 'Degradation', 'Watersports', 'Anal Play', 'Public Play']

INTERESTS_OPTIONS = ['Live Music', 'Wine Tasting', 'Craft Beer', 'Hiking', 'Art Galleries', 'Dancing', 'Travel', 'Fine Dining', 'Fitness/Gym', 'Yoga/Meditation', 'Photography', 'Gaming', 'Boating', 'Movies', 'Theater', 'Cooking', 'Rooftop Bars', 'Speakeasies', 'Cigars', 'Whiskey', 'Fashion', 'Charity Events', 'Sports', 'Reading', 'Beach Clubs']

LIMITS_OPTIONS = ['Scat', 'Blood Play', 'Illegal Activities', 'Permanent Marks', 'Breath Play', 'Findom', 'Needles', 'Vomit', 'Hard Insults', 'Public Humiliation', 'Animals', 'Underage', 'Non-Consensual', 'Weapon Play', 'Fire Play', 'Edge Play', 'Race Play', 'Intercourse', 'Oral Sex', 'No Condoms', 'Overnights', 'Intoxication', 'Face Slapping', 'Choking', 'Gagging']

HEIGHT_OPTIONS = ['4\'0"', '4\'1"', ..., '7\'0"'] // 37 options

WEIGHT_OPTIONS = ['75 lbs', '80 lbs', ..., '450 lbs'] // 76 options

BODY_TYPE_OPTIONS = ['Slim', 'Average', 'Dad Bod', 'Curvy', 'Fit', 'Thick', 'BBW']

HAIR_COLOR_OPTIONS = ['Bald', 'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Silver', 'Dyed - unnatural colors', 'Dyed - natural colors', 'Salt and Pepper']

EYE_COLOR_OPTIONS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Two different colors', 'Black']

FACIAL_HAIR_OPTIONS = ['Yes', 'No', "Doesn't Apply"]

ETHNICITY_OPTIONS = ['White/Caucasian', 'Black/African American', 'Hispanic/Latino', 'Asian', 'Native American', 'Middle Eastern', 'South Asian', 'Pacific Islander', 'Mixed/Multiple', 'Other']

YES_NO_OPTIONS = ['Yes', 'No']

BODY_HAIR_OPTIONS = ['Smooth/shaved', 'Lightly trimmed', 'Natural', 'Hairy', 'Very hairy']

GROOMING_STYLE_OPTIONS = ['Fully shaved', 'Well-groomed', 'Natural', 'Casual', 'Wild/untamed']

BIRTH_CONTROL_OPTIONS = ['Not applicable', 'None', 'Condoms', 'Birth control pills', 'IUD', 'Implant', 'Shot', 'Vasectomy', 'Tubal ligation', 'Other']

CAN_HOST_OPTIONS = ['Yes', 'No', 'Possibly']
```

---

## Key Features & Functions

### Location Verification
- **Function**: `verifyLocation(inputLocation, membershipTier)`
- **Purpose**: Verifies user location using geolocation (VIP only)
- **States**:
  - isVerifying: boolean
  - isAccurate: boolean | null
  - deviceLocation: { city, state } | null
  - errorMessage: string | null

### Date of Birth Validation
- **Function**: `validateDateOfBirth(date: string): boolean`
- **Format**: MM/DD/YYYY
- **Rules**:
  - Must match regex pattern
  - Must be valid date
  - Age must be 18-99 years old
- **Helper**: `calculateAge(dateOfBirth: string): number`

### Kink Quiz
- **Component**: `<KinkQuiz />`
- **Modal**: Opens as overlay
- **Results**: Record<string, number> (role name → percentage)
- **Purpose**: Suggests compatible roles based on quiz responses
- **Display**: Shows top 5 roles with percentages

### Photo Upload
- **Storage**: Supabase Storage bucket 'profile-photos'
- **Path Format**: `${userId}/${timestamp}_${fileName}`
- **Process**:
  1. Upload file to storage
  2. Get public URL
  3. Store URL in profile
- **Display**: Grid with remove buttons

### Progress Tracking
- **Steps**: 0-6 for both account types
- **Progress Bar**: Shows completion percentage
- **Formula**: `(currentStep / totalSteps) * 100`

---

## Validation Rules Summary

### Step Progression Rules

| Account Type | Step | Required Fields | Can Proceed When |
|--------------|------|-----------------|------------------|
| Individual | 0 | accountType | Account type selected |
| Individual | 1 | displayName, location, gender, orientation, dateOfBirth, relationshipStatus | All required filled + valid DOB |
| Individual | 2 | topRoles (min 1) | At least 1 role OR quiz completed |
| Individual | 3 | bio (69-1000 chars) | Bio length valid |
| Individual | 4 | photos (min 2) | At least 2 photos uploaded |
| Individual | 5 | (all optional) | Always |
| Individual | 6 | membershipTier | Always (has default) |
| Couple | 0 | accountType | Account type selected |
| Couple | 1 | location, displayName, displayName2, gender, gender2, orientation, orientation2, age (>=18), age2 (>=18), relationshipStatus | All required filled + valid ages |
| Couple | 2 | partner1Role, partner2Role | Both roles selected |
| Couple | 3 | bio (69-1000 chars) | Bio length valid |
| Couple | 4 | photos (min 2) | At least 2 photos uploaded |
| Couple | 5 | (all optional) | Always |
| Couple | 6 | membershipTier | Always (has default) |

### Final Submission Validation

Both account types require:
1. Account type set
2. Display name(s) and location filled
3. Gender(s) and sexuality/sexualities filled
4. Minimum 2 photos
5. For Individual basic members: Location verification passed
6. All step-specific validations passed

---

## Data Structure (Profile Interface)

```typescript
interface Profile {
  // Common fields
  accountType: 'individual' | 'couple';
  displayName: string;
  location: string;
  bio: string;
  photos: string[];
  relationshipStatus: string;
  membershipTier: 'basic' | 'vip';
  
  // Individual fields
  dateOfBirth?: string;
  age?: number;
  gender: string;
  orientation: string;
  topRoles?: string[];
  kinkQuizResults?: Record<string, number>;
  lifestyleExperience?: string;
  interestedKinks?: string[];
  kinks?: string[];
  interests?: string[];
  softLimits?: string[];
  hardLimits?: string[];
  safetyPractices?: string;
  rules?: string;
  seeking?: string[];
  seekingRelationshipType?: string[];
  seekingPreferences?: string[];
  
  // Individual stats
  height?: string;
  weight?: string;
  bodyType?: string;
  hairColor?: string;
  eyeColor?: string;
  facialHair?: string;
  ethnicity?: string;
  cigaretteSmoker?: string;
  alcoholDrinker?: string;
  marijuanaUser?: string;
  tattoos?: boolean;
  piercings?: boolean;
  bodyHair?: string;
  groomingStyle?: string;
  birthControl?: string;
  latexAllergy?: boolean;
  lastSTITestDate?: string;
  stiPositiveResults?: string;
  canHost?: string;
  
  // Couple fields
  displayName2?: string;
  age2?: number;
  gender2?: string;
  orientation2?: string;
  
  // Partner 1 (couple)
  partner1Role?: string;
  partner1QuizResults?: Record<string, number>;
  partner1Experience?: string;
  partner1Kinks?: string[];
  partner1SoftLimits?: string[];
  partner1HardLimits?: string[];
  partner1SafetyPractices?: string;
  partner1Rules?: string;
  partner1Height?: string;
  partner1Weight?: string;
  partner1BodyType?: string;
  partner1HairColor?: string;
  partner1EyeColor?: string;
  partner1FacialHair?: string;
  partner1Ethnicity?: string;
  partner1CigaretteSmoker?: string;
  partner1AlcoholDrinker?: string;
  partner1MarijuanaUser?: string;
  partner1Tattoos?: boolean;
  partner1Piercings?: boolean;
  partner1BodyHair?: string;
  partner1GroomingStyle?: string;
  partner1BirthControl?: string;
  partner1LatexAllergy?: boolean;
  partner1LastSTITestDate?: string;
  partner1StiPositiveResults?: string;
  partner1CanHost?: string;
  
  // Partner 2 (couple) - mirrors partner1 fields with partner2 prefix
  partner2Role?: string;
  partner2QuizResults?: Record<string, number>;
  partner2Experience?: string;
  partner2Kinks?: string[];
  partner2SoftLimits?: string[];
  partner2HardLimits?: string[];
  partner2SafetyPractices?: string;
  partner2Rules?: string;
  partner2Height?: string;
  partner2Weight?: string;
  partner2BodyType?: string;
  partner2HairColor?: string;
  partner2EyeColor?: string;
  partner2FacialHair?: string;
  partner2Ethnicity?: string;
  partner2CigaretteSmoker?: string;
  partner2AlcoholDrinker?: string;
  partner2MarijuanaUser?: string;
  partner2Tattoos?: boolean;
  partner2Piercings?: boolean;
  partner2BodyHair?: string;
  partner2GroomingStyle?: string;
  partner2BirthControl?: string;
  partner2LatexAllergy?: boolean;
  partner2LastSTITestDate?: string;
  partner2StiPositiveResults?: string;
  partner2CanHost?: string;
  
  // Match preferences (both account types)
  matchPreferences: {
    ageRange: [number, number];
    genders: string[];
    sexualities: string[];
    searchingFor: string[];
    distance: number;
    vipOnly: boolean;
    verifiedOnly: boolean;
    experienceLevels: string[];
  };
}
```

---

## Summary

### Individual Account: 7 Steps Total
- **Step 0**: Account Type Selection
- **Step 1**: Basic Info (6 fields)
- **Step 2**: Role Selection & Preferences (8 fields)
- **Step 3**: About Me (20 fields - bio + stats)
- **Step 4**: Photos & Additional Details (10 fields)
- **Step 5**: Match Preferences (7 fields)
- **Step 6**: Membership Selection (1 field)

### Couple Account: 7 Steps Total
- **Step 0**: Account Type Selection
- **Step 1**: Basic Info (10 fields - shared location + 2 partners)
- **Step 2**: Role Selection & Preferences (18 fields - both partners + shared)
- **Step 3**: About Us (39 fields - bio + both partner stats)
- **Step 4**: Photos (1 field)
- **Step 5**: Match Preferences (7 fields)
- **Step 6**: Membership Selection (1 field)

---

## Notes

1. **Photo Storage**: Uses Supabase Storage bucket 'profile-photos'
2. **Kink Quiz**: Optional modal that provides role suggestions
3. **Location Verification**: VIP feature using browser geolocation
4. **Progress Bar**: Visual indicator of completion status
5. **Validation**: Real-time validation with error messages
6. **Navigation**: Can go back to previous steps, cannot skip ahead
7. **Default Values**: Many fields have sensible defaults (e.g., lifestyleExperience: 'New')
8. **Max Selections**: Many multi-select fields have maximum selection limits
9. **Character Limits**: Bio has strict 69-1000 character requirement
10. **Age Requirements**: All users must be 18+ years old

---

**Document Generated**: Based on /app/src/pages/ProfileSetup.tsx analysis
**Total Steps Per Account**: 7 (including Step 0)
**Total Unique Fields**: Individual: ~60 | Couple: ~110
