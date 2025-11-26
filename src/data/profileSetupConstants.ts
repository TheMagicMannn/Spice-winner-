// src/data/profileSetupConstants.ts
// Comprehensive data constants for profile setup workflow

// =====================================================
// STEP 1: BASIC INFORMATION
// =====================================================

export const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-binary',
  'Transgender Male',
  'Transgender Female',
  'Genderqueer',
  'Gender Fluid',
  'Agender',
  'Two-Spirit',
  'Other'
];

export const SEXUAL_ORIENTATION_OPTIONS = [
  'Straight',
  'Bisexual',
  'Gay',
  'Lesbian',
  'Pansexual',
  'Queer',
  'Asexual',
  'Demisexual',
  'Sapiosexual',
  'Other'
];

// =====================================================
// STEP 2: EXPERIENCE LEVEL
// =====================================================

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'curious_newbie', label: 'Curious/Newbie (Just exploring, no experience)' },
  { value: 'exploring', label: 'Exploring (0-6 months)' },
  { value: 'beginner', label: 'Beginner (6 months - 1 year)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'experienced', label: 'Experienced (3-7 years)' },
  { value: 'veteran', label: 'Veteran (7+ years)' },
  { value: '24_7_lifestyle', label: '24/7 Lifestyle (Living it full-time)' }
];

export const CURRENTLY_ACTIVE_OPTIONS = [
  'Yes',
  'Taking a break',
  'Coming back after hiatus'
];

// =====================================================
// STEP 3: RELATIONSHIP CONTEXT
// =====================================================

export const RELATIONSHIP_CONTEXT_OPTIONS = [
  'Single (Not in any relationship)',
  'Single but Dating Casually',
  'In a Relationship (Monogamous)',
  'In an Open Relationship',
  'Married/Life Partner (Monogamous)',
  'Married/Life Partner (Open)',
  'Partnered in ENM Relationship',
  'Solo Polyamorous (Have connections)',
  'In a Polycule',
  'In a Primary/Secondary Dynamic',
  'In a D/s Relationship',
  'Owned/Collared',
  'Owner/Collar Holder',
  "It's Complicated"
];

// =====================================================
// STEP 4: LIFESTYLE COMMUNITY IDENTIFICATION
// =====================================================

export const LIFESTYLE_COMMUNITIES = [
  'BDSM/Kink',
  'Swinger',
  'ENM (Ethical Non-Monogamy)',
  'Polyamory',
  'Fetish',
  'Leather/Gear',
  'Rope/Shibari',
  'Impact Play',
  'Age Play',
  'Pet Play',
  'Primal',
  'Vanilla+ (Vanilla curious about kink)',
  'Exploring/Not Sure Yet',
  'Other'
];

// =====================================================
// STEP 5A: BDSM/KINK ROLES
// =====================================================

export const BDSM_ROLE_OPTIONS = [
  'Dominant',
  'Submissive',
  'Master/Mistress',
  'Slave',
  'Switch',
  'Top',
  'Bottom',
  'Daddy/Mommy',
  'Little/Middle',
  'Brat',
  'Brat Tamer',
  'Sadist',
  'Masochist',
  'Rigger',
  'Rope Bunny',
  'Owner',
  'Pet/Puppy/Kitten',
  'Primal (Hunter/Prey)',
  'Service Oriented',
  'Degrader',
  'Degradee',
  'Voyeur',
  'Exhibitionist',
  'Experimentalist',
  'Role Player',
  'Vanilla with Kink Interests',
  'Still Discovering'
];

export const POWER_EXCHANGE_LEVEL_OPTIONS = [
  { value: 'none', label: 'None (Kink for fun only)' },
  { value: 'bedroom_only', label: 'Bedroom Only (Scene-based)' },
  { value: 'lifestyle', label: 'Lifestyle (Outside bedroom too)' },
  { value: '24_7', label: '24/7 (Always in dynamic)' },
  { value: 'high_protocol', label: 'High Protocol (Formal rules and structure)' },
  { value: 'tpe', label: 'Total Power Exchange (TPE)' }
];

export const PROTOCOL_LEVEL_OPTIONS = [
  'None',
  'Low',
  'Medium',
  'High',
  'Very High'
];

export const COLLAR_STATUS_OPTIONS = [
  'Not collared/owned',
  'Collared (owned)',
  'Owned (no collar)',
  'In collar consideration period',
  'Looking to be collared/owned',
  'Not interested in collar/ownership',
  'Collar holder/owner',
  'Looking for a submissive to collar'
];

export const NEGOTIATION_STYLE_OPTIONS = [
  'Detailed written contract',
  'Verbal discussion',
  'Ongoing negotiation',
  'Flexible',
  'Need guidance'
];

export const SAFE_WORD_SYSTEM_OPTIONS = [
  'Traffic light (Red/Yellow/Green)',
  'Single word',
  'Multiple words',
  'Non-verbal signals',
  'None (CNC)'
];

export const AFTERCARE_NEEDS_OPTIONS = [
  'Physical touch',
  'Quiet time',
  'Conversation',
  'Food/water',
  'Alone time',
  'Cuddling',
  'Reassurance',
  'Cleaning up together',
  'Other'
];

export const DUNGEON_EXPERIENCE_OPTIONS = [
  'None',
  'Curious',
  'Beginner',
  'Regular attendee',
  'Dungeon monitor',
  'Event organizer'
];

export const PUBLIC_PLAY_COMFORT_OPTIONS = [
  'Love it',
  'Open to it',
  'Prefer private',
  'Hard limit'
];

export const DEMO_PERFORMANCE_COMFORT_OPTIONS = [
  'Would love to',
  'Maybe',
  'Prefer to watch',
  'No thanks'
];

export const MUNCH_ATTENDANCE_OPTIONS = [
  'Regular',
  'Occasional',
  'Never been',
  'Interested'
];

export const SCENE_PREFERENCES_OPTIONS = [
  'Impact Play (Spanking, Flogging, Caning, etc.)',
  'Bondage (Rope, Restraints, Suspension)',
  'Sensory Play (Blindfolds, Sensation, Temperature)',
  'Humiliation/Degradation',
  'Praise/Worship',
  'Edge Play',
  'Medical Play',
  'Role Play Scenarios',
  'Psychological Play',
  'Protocol & Service',
  'Domestic Service',
  'Sexual Service',
  'Pet Play',
  'Age Play',
  'Primal Play',
  'Orgasm Control/Denial',
  'Breath Play',
  'Wax Play',
  'Electro Play',
  'Other'
];

export const HARD_LIMITS_OPTIONS = [
  'Blood Play',
  'Scat',
  'Permanent Marks/Scarification',
  'Needle Play',
  'Fire Play',
  'Race Play',
  'Intoxication Play',
  'Financial Domination',
  'Public Humiliation',
  'Non-Consensual',
  'Age Play (if not interested)',
  'Animal Play',
  'Knife Play',
  'Extreme Pain',
  'Vomit',
  'CNC (Consensual Non-Consent)',
  'Tickling',
  'Feet',
  'Bathroom Control',
  'Forced Feminization/Masculinization'
];

// =====================================================
// STEP 5B: SWINGER OPTIONS
// =====================================================

export const SWINGER_TYPE_OPTIONS = [
  'Full Swap (Full intercourse with others)',
  'Soft Swap (Everything but intercourse)',
  'Same Room (Play together with others present)',
  'Separate Room (Play separately)',
  'Voyeur (Love to watch)',
  'Exhibitionist (Love to be watched)',
  'Hotwife/Stag & Vixen',
  'Bull (Third for couples)',
  'Unicorn (Third for couples)',
  'Threesome Enthusiast',
  'Group Play Enthusiast',
  'Exploring (Still figuring it out)'
];

export const SWAP_PREFERENCES_OPTIONS = [
  'Full swap only',
  'Soft swap only',
  'Open to both',
  'Girl-Girl play',
  'Guy-Guy play',
  'Group play (3+)',
  'Orgies (5+)',
  'Watching only',
  'Being watched only',
  'Recording/Photos during play',
  'No recording/photos'
];

export const CLUB_EXPERIENCE_OPTIONS = [
  'Never',
  'Once or twice',
  'Regular',
  'VIP member',
  'Event host'
];

export const FAVORITE_CLUB_TYPES_OPTIONS = [
  'On-premise',
  'Off-premise',
  'House parties',
  'Hotel takeovers',
  'Cruises',
  'Resort trips'
];

export const PARTY_SIZE_PREFERENCE_OPTIONS = [
  'Intimate (4-10)',
  'Medium (10-30)',
  'Large (30+)',
  'Massive (100+)',
  'Any'
];

export const GROUP_PLAY_MAX_SIZE_OPTIONS = [
  { value: 3, label: '3 people' },
  { value: 4, label: '4 people' },
  { value: 5, label: '5-7 people' },
  { value: 8, label: '8-10 people' },
  { value: 10, label: '10+ people' },
  { value: 999, label: 'No limit' }
];

export const GROUP_PLAY_PREFERENCE_OPTIONS = [
  'MFM',
  'FMF',
  'MFMF',
  'Any combination'
];

export const SAME_ROOM_PREFERENCE_OPTIONS = [
  'Always',
  'Preferred',
  'Sometimes',
  "Doesn't matter"
];

export const UNICORN_BULL_FREQUENCY_OPTIONS = [
  'Once',
  'Few times',
  'Regularly',
  'Frequently'
];

export const HOSTING_OPTIONS = [
  'Yes',
  'No',
  'Sometimes',
  'Hotel only'
];

export const TRAVEL_FOR_PLAY_OPTIONS = [
  'Locally only',
  'Within state',
  'Regional',
  'National',
  'International'
];

export const SWINGER_BOUNDARIES_OPTIONS = {
  kissing: ['Yes', 'No', 'Ask first'],
  oralSex: ['Yes', 'No', 'Safe oral only'],
  analPlay: ['Yes', 'No', 'Discuss first'],
  barrierProtection: ['Always', 'Usually', 'Sometimes', 'Fluid bonded only'],
  watchingPartner: ['Love it', "It's hot", 'Neutral', 'Difficult', 'Hard limit']
};

// =====================================================
// STEP 5C: ENM/POLY OPTIONS
// =====================================================

export const ENM_POLY_STRUCTURE_OPTIONS = [
  'Open Relationship',
  'Polyamory - Hierarchical (Primary/Secondary)',
  'Polyamory - Non-Hierarchical',
  'Solo Polyamory',
  'Relationship Anarchy',
  'Monogamish',
  "Don't Ask Don't Tell (DADT)",
  'Unicorn Hunting (seeking a third)',
  'Triad (closed three-person relationship)',
  'Quad (closed four-person relationship)',
  'V-Structure (one person with two partners)',
  'W-Structure',
  'Kitchen Table Poly (everyone hangs out)',
  'Parallel Poly (partners don\'t meet)',
  'Garden Party Poly (occasional group hangs)',
  'Still figuring it out'
];

export const POLY_STATUS_OPTIONS = [
  'Single and poly',
  'Have one partner',
  'Have multiple partners',
  'In a polycule',
  'In a closed poly relationship',
  'Open to new connections',
  'Poly-saturated (at capacity)',
  'Taking a break from dating'
];

export const HIERARCHY_OPTIONS = [
  'Very important',
  'Somewhat',
  'Fluid',
  "Don't believe in hierarchy"
];

export const NESTING_OPTIONS = [
  'Live with partner(s)',
  "Don't live with partners",
  'Planning to nest'
];

export const POLY_SATURATION_OPTIONS = [
  'One more partner',
  'Multiple new partners',
  'Just casual dates',
  'Not looking',
  'Unsure'
];

export const TIME_AVAILABLE_OPTIONS = [
  'Lots',
  'Moderate',
  'Limited',
  'Very limited'
];

export const ENERGY_LEVEL_OPTIONS = [
  'High',
  'Medium',
  'Low',
  'Depends'
];

export const METAMOUR_PREFERENCE_OPTIONS = [
  'Want to be friends',
  'Cordial acquaintances',
  "Parallel (don't need to meet)",
  'Flexible',
  'No preference'
];

export const METAMOUR_RELATIONSHIP_OPTIONS = [
  'Great',
  'Good',
  'Neutral',
  'Complicated',
  "Don't interact"
];

export const VETO_POWER_OPTIONS = [
  'Yes',
  'No',
  'Mutual',
  "Don't believe in it"
];

export const CHECK_IN_OPTIONS = [
  'Before dates',
  'After dates',
  'Regular updates',
  'As needed',
  'None'
];

export const TRANSPARENCY_LEVEL_OPTIONS = [
  'Full disclosure',
  'Need-to-know',
  'DADT',
  'Somewhere in between'
];

export const OVERNIGHT_OPTIONS = [
  'Allowed',
  'Need permission',
  'Not yet',
  'Case-by-case'
];

export const SCHEDULING_STYLE_OPTIONS = [
  'Calendar coordinated',
  'Flexible',
  'Spontaneous',
  'Structured'
];

export const DATING_FREQUENCY_OPTIONS = [
  'Multiple dates per week',
  'Once a week',
  'Few times a month',
  'Once a month',
  'Less'
];

export const PARALLEL_DATING_COMFORT_OPTIONS = [
  'Can juggle multiple',
  'One at a time',
  'Slow and steady'
];

export const RELATIONSHIP_ESCALATOR_OPTIONS = [
  'Yes',
  'No',
  'Partially',
  "What's that?"
];

export const ESCALATOR_INTEREST_OPTIONS = [
  'Living together',
  'Marriage',
  'Having children',
  'Life partnership',
  'Flexible',
  'None of the above',
  'Some of the above'
];

// =====================================================
// STEP 6: INTENT & SEEKING
// =====================================================

export const INTENT_OPTIONS = [
  'Casual Dating',
  'Serious Dating/Relationship',
  'Play Partners (Sexual)',
  'Kink/Scene Partners',
  'D/s Dynamic',
  'Long-term Power Exchange',
  'Finding a collar/ownership situation',
  'Polyamorous Relationship',
  'Joining a Polycule',
  'Building a Triad/Quad',
  'Friends with Benefits',
  'Casual Encounters',
  'Group Play Opportunities',
  'Event Companions',
  'Munch/Community Friends',
  'Travel Companions',
  'Mentorship (Learning)',
  'Mentorship (Teaching)',
  'Networking',
  'Education/Workshops',
  'Online Only',
  'Just Browsing/Curious',
  'Unsure/Exploring'
];

// =====================================================
// STEP 7: WHO YOU WANT TO MEET
// =====================================================

export const INTERESTED_IN_TYPES_OPTIONS = [
  'Men',
  'Women',
  'Non-binary individuals',
  'Transgender individuals',
  'Couples (any configuration)',
  'Specifically M/F Couples',
  'Specifically F/F Couples',
  'Specifically M/M Couples',
  'Groups (3+)',
  'Polycules',
  'Anyone/Everyone',
  'Still figuring it out'
];

export const COUPLE_INTERACTION_PREFERENCE_OPTIONS = [
  'Play with both (together)',
  'Play with one at a time',
  'Either/flexible',
  'Depends on chemistry',
  'Woman only (in M/F couple)',
  'Man only (in M/F couple)'
];

export const COUPLE_TYPE_PREFERENCES_OPTIONS = [
  'Both bisexual',
  'One bi/one straight',
  'Both straight',
  'Any configuration',
  'No preference'
];

export const GROUP_TYPE_PREFERENCES_OPTIONS = [
  'Small groups (3-4)',
  'Medium groups (5-7)',
  'Large groups (8+)',
  'Couples only',
  'Mixed singles and couples',
  'All men',
  'All women',
  'Mixed genders',
  'Any configuration'
];

export const POLYCULE_INTEREST_OPTIONS = [
  'Joining existing polycule',
  'Building new polycule',
  'Dating someone in a polycule',
  'Adding to our polycule',
  'Any of the above'
];

// =====================================================
// STEP 8: BOUNDARIES & COMFORT
// =====================================================

export const MEETING_LOCATION_OPTIONS = [
  'Public coffee/dinner',
  'Public events/munches',
  'Private homes',
  'Clubs/venues',
  'Hotels',
  'Lifestyle resorts',
  'Online only (initially)',
  'Flexible'
];

export const PLAY_ENVIRONMENT_OPTIONS = [
  'Private (homes)',
  'Semi-private (club rooms)',
  'Public (club common areas)',
  'Outdoors',
  'Events/parties',
  'No preference'
];

export const FIRST_MEETING_PREFERENCE_OPTIONS = [
  'Coffee/drinks',
  'Dinner',
  'Munch/event',
  'Casual activity',
  "Skip the date, let's play (experienced only)",
  'Video chat first',
  'Long texting period first'
];

export const TIMELINE_TO_MEET_OPTIONS = [
  'Chat for weeks first',
  'Chat for days first',
  'Meet within a week',
  'Meet ASAP if chemistry',
  'Flexible/depends on connection'
];

export const PHOTO_VIDEO_CONSENT_OPTIONS = [
  'Okay with photos (face)',
  'Okay with photos (no face)',
  'No photos',
  'Ask every time',
  'Video okay (face)',
  'Video okay (no face)',
  'No video',
  'Recordings okay for personal use',
  'Never okay with recordings'
];

export const SOCIAL_MEDIA_BOUNDARIES_OPTIONS = [
  'Can mention me (no details)',
  'Prefer not to be mentioned',
  'Tags okay',
  'No tags',
  'Public about lifestyle',
  'Private about lifestyle',
  'Depends on platform'
];

// =====================================================
// STEP 9: COMMUNICATION PREFERENCES
// =====================================================

export const TEXTING_FREQUENCY_OPTIONS = [
  'Constant communication',
  'Daily check-ins',
  'Every few days',
  'When something to say',
  'Sporadic',
  'Not a big texter'
];

export const PHONE_CALL_OPTIONS = [
  'Love them',
  'Okay occasionally',
  'Rather text',
  'Only for planning',
  'After we\'ve met',
  "Don't call me"
];

export const VIDEO_CHAT_OPTIONS = [
  'Love them',
  'Open to it',
  'Prefer meeting in person',
  'After meeting first',
  'Not comfortable'
];

export const RESPONSE_TIME_OPTIONS = [
  'Within hours',
  'Within a day',
  'Few days okay',
  'No expectations',
  'When available',
  'Depends on connection level'
];

export const COMMUNICATION_STYLE_OPTIONS = [
  'Direct/Blunt',
  'Diplomatic',
  'Playful/Flirty',
  'Serious',
  'Mix of all',
  'Depends on situation'
];

// =====================================================
// STEP 10: SEXUAL HEALTH & SAFETY
// =====================================================

export const STI_TESTING_FREQUENCY_OPTIONS = [
  'Every 3 months',
  'Every 6 months',
  'Annually',
  'When starting new partnerships',
  "Haven't been tested",
  'Will get tested before playing'
];

export const TESTING_REQUIREMENT_OPTIONS = [
  'Yes, must see recent results',
  'Yes, but trust honor system',
  'Prefer but not required',
  'No, but discuss status',
  'No requirement'
];

export const BARRIER_METHOD_OPTIONS = [
  'Always required',
  'Required until fluid bonded',
  'Prefer but negotiate',
  "Don't use",
  'Depends on activity'
];

export const FLUID_BONDING_STATUS_OPTIONS = [
  'Not fluid bonded with anyone',
  'Fluid bonded with 1 partner',
  'Fluid bonded with 2+ partners',
  'Open to fluid bonding',
  'Not interested in fluid bonding'
];

export const BIRTH_CONTROL_OPTIONS = [
  'Pills',
  'IUD',
  'Implant',
  'Condoms only',
  'Vasectomy',
  'Tubal ligation',
  'Not applicable',
  'Prefer not to say',
  'Other'
];

export const RISK_PROFILE_OPTIONS = [
  'Very cautious (testing + barriers always)',
  'Cautious (testing + selective barriers)',
  'Moderate (discuss and decide)',
  'Open (trust and communicate)',
  'Fluid bonded partners only'
];

// =====================================================
// STEP 11: PERSONALITY & TRAITS
// =====================================================

export const PERSONALITY_TRAITS_OPTIONS = [
  'Adventurous',
  'Affectionate',
  'Analytical',
  'Artistic',
  'Assertive',
  'Caring',
  'Confident',
  'Creative',
  'Curious',
  'Dependable',
  'Easy-going',
  'Empathetic',
  'Energetic',
  'Funny',
  'Genuine',
  'Introverted',
  'Extroverted',
  'Kinky',
  'Laid-back',
  'Loyal',
  'Nerdy',
  'Open-minded',
  'Passionate',
  'Patient',
  'Playful',
  'Respectful',
  'Romantic',
  'Sensual',
  'Serious',
  'Spontaneous',
  'Thoughtful',
  'Transparent'
];

export const LOVE_LANGUAGES_OPTIONS = [
  'Words of Affirmation',
  'Acts of Service',
  'Receiving Gifts',
  'Quality Time',
  'Physical Touch'
];

export const ATTACHMENT_STYLE_OPTIONS = [
  'Secure',
  'Anxious',
  'Avoidant',
  'Anxious-Avoidant',
  'Not sure'
];

// =====================================================
// STEP 12: PHYSICAL STATS
// =====================================================

export const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const feet = Math.floor((i + 48) / 12);
  const inches = (i + 48) % 12;
  return `${feet}'${inches}"`;
});

export const WEIGHT_OPTIONS = Array.from({ length: 76 }, (_, i) => `${75 + i * 5} lbs`);

export const BODY_TYPE_OPTIONS = [
  'Slim/Slender',
  'Toned/Athletic',
  'Average',
  'A few extra pounds',
  'Curvy',
  'Full-figured/BBW',
  'Dad bod',
  'Stocky',
  'Muscular/Bodybuilder',
  'Prefer not to say'
];

export const ETHNICITY_OPTIONS = [
  'White/Caucasian',
  'Black/African American',
  'Hispanic/Latino',
  'Asian',
  'Native American',
  'Middle Eastern',
  'South Asian',
  'Pacific Islander',
  'Mixed/Multiple',
  'Other',
  'Prefer not to say'
];

export const HAIR_COLOR_OPTIONS = [
  'Bald/Shaved',
  'Black',
  'Brown',
  'Blonde',
  'Red',
  'Auburn',
  'Gray',
  'White',
  'Silver',
  'Dyed - unnatural colors',
  'Dyed - natural colors',
  'Salt and Pepper'
];

export const HAIR_LENGTH_OPTIONS = [
  'Bald/Shaved',
  'Short',
  'Medium',
  'Long',
  'Very long',
  'Varies'
];

export const EYE_COLOR_OPTIONS = [
  'Brown',
  'Blue',
  'Green',
  'Hazel',
  'Gray',
  'Amber',
  'Violet',
  'Two different colors',
  'Black'
];

export const FACIAL_HAIR_OPTIONS = [
  'Yes',
  'No',
  'Sometimes',
  "Doesn't apply"
];

export const TATTOO_OPTIONS = [
  'None',
  'A few',
  'Many',
  'Covered'
];

export const PIERCING_OPTIONS = [
  'None',
  'A few',
  'Many'
];

export const BODY_HAIR_OPTIONS = [
  'Smooth',
  'Trimmed',
  'Natural',
  'Hairy',
  'Prefer not to say'
];

export const GROOMING_STYLE_OPTIONS = [
  'Clean-shaven',
  'Well-groomed',
  'Natural',
  'Casual',
  'Prefer not to say'
];

export const FITNESS_LEVEL_OPTIONS = [
  'Very active/athletic',
  'Moderately active',
  'Somewhat active',
  'Not very active',
  'Prefer not to say'
];

// =====================================================
// STEP 13: LIFESTYLE & AVAILABILITY
// =====================================================

export const WORK_SCHEDULE_OPTIONS = [
  '9-5 weekdays',
  'Nights/weekends',
  'Shift work',
  'Flexible/self-employed',
  'Retired',
  'Student',
  'Variable'
];

export const AVAILABILITY_OPTIONS = [
  'Weekday evenings',
  'Weekday days',
  'Weekend days',
  'Weekend evenings',
  'Anytime',
  'Varies by week',
  'Need advance planning'
];

export const CHILDREN_OPTIONS = [
  'No children',
  "Have children (don't live with me)",
  'Have children (live with me full-time)',
  'Have children (part-time custody)',
  'Prefer not to say'
];

export const DISCRETION_OPTIONS = [
  'Very out (lifestyle is known)',
  'Selectively out',
  'Private (very few know)',
  'Closeted (no one knows)',
  'Depends on context'
];

// =====================================================
// STEP 14: INTERESTS & ACTIVITIES
// =====================================================

export const VANILLA_INTERESTS_OPTIONS = [
  'Live music/concerts',
  'Art/museums',
  'Dancing/clubbing',
  'Hiking/outdoors',
  'Fitness/gym',
  'Sports (playing)',
  'Sports (watching)',
  'Travel',
  'Cooking',
  'Food/dining out',
  'Wine/beer tasting',
  'Gaming (video)',
  'Gaming (board/card)',
  'Reading',
  'Movies/TV',
  'Theater/performing arts',
  'Crafts/DIY',
  'Photography',
  'Writing',
  'Technology',
  'Cars/motorcycles',
  'Pets/animals',
  'Yoga/meditation',
  'Fashion/style',
  'Music (playing)',
  'Other'
];

export const LIFESTYLE_ACTIVITIES_OPTIONS = [
  'Munches',
  'Educational workshops',
  'Play parties',
  'Lifestyle events',
  'Conventions',
  'Club nights',
  'Private parties',
  'Online communities',
  'Content creation',
  'Mentoring',
  'Volunteering (kink community)',
  'None yet (curious)'
];

// =====================================================
// STEP 15: PREFERENCES & DEAL BREAKERS
// =====================================================

export const DEAL_BREAKERS_OPTIONS = [
  'Smoking',
  'Drug use',
  'Heavy drinking',
  'Dishonesty',
  'Lack of communication',
  'Not STI tested',
  'Not respecting boundaries',
  'Drama/chaos',
  'Jealousy/possessiveness',
  'Control issues',
  'No chemistry',
  'Different kink interests',
  'Different relationship style',
  'Long distance',
  'No availability',
  'Different life goals',
  'Not emotionally available',
  'Married/partnered without disclosure',
  'Unethical non-monogamy',
  'No sense of humor',
  'Poor hygiene',
  'Other'
];

export const MUST_HAVES_OPTIONS = [
  'Good communication',
  'Honesty',
  'Respect for boundaries',
  'Emotional intelligence',
  'Sense of humor',
  'Physical chemistry',
  'Sexual chemistry',
  'Shared kink interests',
  'Similar experience level',
  'Availability',
  'Local/nearby',
  'Willing to travel',
  'Tested regularly',
  'Practices safe play',
  'Experienced in lifestyle',
  'Open to new experiences',
  'Good hygiene',
  'Attractive to me',
  'Intelligent conversation',
  'Similar life goals',
  'Other'
];

// =====================================================
// STEP 17: VERIFICATION & TRUST
// =====================================================

export const REFERENCE_WILLINGNESS_OPTIONS = [
  'Yes, willing to provide',
  'Maybe, depends on connection',
  'Prefer not to',
  'No references available'
];

export const BACKGROUND_CHECK_OPTIONS = [
  'Willing to undergo',
  'Already completed',
  'Maybe, depends',
  'Prefer not to'
];

export const STI_SHARING_OPTIONS = [
  'Always',
  'With serious connections',
  'Never',
  'After discussion'
];

// =====================================================
// COUPLES SPECIFIC OPTIONS
// =====================================================

export const RELATIONSHIP_TYPE_OPTIONS = [
  'Married',
  'Life Partners',
  'Domestic Partners',
  'Dating (Long-term)',
  'Dating (Casual)',
  'Engaged',
  'Complicated'
];

export const RELATIONSHIP_LENGTH_OPTIONS = [
  'Less than 6 months',
  '6 months - 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
];

export const COUPLE_DYNAMIC_OPTIONS = [
  'D/s Couple (one Dom, one sub)',
  'Switch Couple (both switch)',
  'Both Dominant',
  'Both Submissive',
  'Service-oriented couple',
  'Master/slave couple',
  'Daddy/little couple',
  'No power exchange',
  'Still exploring',
  'Other'
];

export const COUPLE_PLAY_STYLE_OPTIONS = [
  'Always together in same room',
  'Sometimes separate rooms',
  'Sometimes separate partners',
  'Completely open/separate',
  'Varies by situation'
];

export const DECISION_MAKING_OPTIONS = [
  'Equal partners (all decisions joint)',
  'One leads, one follows',
  'Depends on the area',
  'Democracy/voting',
  'Consensus required',
  'Power exchange based'
];

export const JEALOUSY_MANAGEMENT_OPTIONS = [
  'Both experience compersion easily',
  'Working through jealousy',
  'One more jealous than other',
  'No jealousy issues',
  'Jealousy is hard for us',
  'Still learning'
];

export const ACCOUNT_MANAGEMENT_OPTIONS = [
  'Both of us jointly',
  'Primarily Partner 1',
  'Primarily Partner 2',
  'We take turns',
  'Whoever is online'
];

export const COMMUNICATION_PREFERENCE_OPTIONS = [
  'As a couple (joint messages)',
  'Individual messages okay',
  'Either way',
  'Group chats preferred'
];
