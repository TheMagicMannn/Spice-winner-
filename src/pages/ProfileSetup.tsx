// src/pages/ProfileSetup.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Label } from '../components/Label';
import { Spinner } from '../components/Spinner';
import { Profile } from '../types';
import { supabase } from '../services/supabase';
import backgroundImage from '../images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png';
import { KinkQuiz } from '../components/KinkQuiz';


// --- DATA CONSTANTS ---
const KINKS_OPTIONS: string[] = ['BDSM', 'Roleplay', 'Voyeurism', 'Exhibitionism', 'Swinging', 'Group Play', 'Tantric Sex', 'Food Play', 'Dominance', 'Submission', 'Bondage', 'Impact Play', 'Sensory Deprivation', 'Age Play', 'Cuckolding', 'Foot Fetish', 'Leather/Latex', 'Uniforms', 'Medical Play', 'Pet Play', 'Praise', 'Degradation', 'Watersports', 'Anal Play', 'Public Play'];

const INTERESTS_OPTIONS: string[] = ['Live Music', 'Wine Tasting', 'Craft Beer', 'Hiking', 'Art Galleries', 'Dancing', 'Travel', 'Fine Dining', 'Fitness/Gym', 'Yoga/Meditation', 'Photography', 'Gaming', 'Boating', 'Movies', 'Theater', 'Cooking', 'Rooftop Bars', 'Speakeasies', 'Cigars', 'Whiskey', 'Fashion', 'Charity Events', 'Sports', 'Reading', 'Beach Clubs'];

const LIMITS_OPTIONS: string[] = ['Scat', 'Blood Play', 'Illegal Activities', 'Permanent Marks', 'Breath Play', 'Findom', 'Needles', 'Vomit', 'Hard Insults', 'Public Humiliation', 'Animals', 'Underage', 'Non-Consensual', 'Weapon Play', 'Fire Play', 'Edge Play', 'Race Play', 'Intercourse', 'Oral Sex', 'No Condoms', 'Overnights', 'Intoxication', 'Face Slapping', 'Choking', 'Gagging'];

const GENDER_OPTIONS: string[] = ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Other'];

const SEXUALITY_OPTIONS: string[] = ['Straight', 'Bisexual', 'Gay', 'Pansexual', 'Queer', 'Asexual', 'Other'];

const RELATIONSHIP_STATUS_OPTIONS: string[] = ['Single', 'Partnered', 'Married', 'Complicated', 'Open Relationship', 'In a Relationship with a Vanilla Partner', 'In a Relationship with a SPICE User'];
const SEEKING_OPTIONS = ['ð« Couple', 'ðââï¸ Man', 'ðââï¸ Woman', 'ð¶ Other'];
const SEEKING_RELATIONSHIP_TYPE_OPTIONS = ['Casual NSA', 'FWB', 'Play Partners', 'Voyeur', 'Swingers Party Friends', 'Poly Relationship', 'Long-term', 'Short-term', 'Sugar Daddy/Baby'];
const EXPERIENCE_LEVEL_OPTIONS = ['New', 'Beginner', 'Moderate', 'Advanced'];

const ROLE_OPTIONS = [
  'Ageplayer', 'Experimentalist', 'Pet', 'Rope bunny', 'Masochist', 'Degradee', 'Submissive',
  'Exhibitionist', 'Primal (Prey)', 'Non-monogamist', 'Rigger', 'Switch', 'Daddy/Mommy',
  'Voyeur', 'Sadist', 'Dominant', 'Master/Mistress', 'Brat tamer', 'Slave', 'Owner',
  'Degrader', 'Little', 'Brat', 'Vanilla', 'Primal (Hunter)'
];

const KINKS_INTERESTED_OPTIONS = [
  'Threesomes', 'Spanking', 'Light bondage', 'Restraints', 'Blindfolds',
  'Dirty talk / name-calling', 'Hair pulling', 'Biting / marking', 'Collar & leash',
  'Role-play', 'Sex Toys', 'Pegging / strap-on play', 'Temperature play', 'Nipple clamps',
  'Oral sex', 'Edging / orgasm control', 'Watching partner masturbate',
  'Recording/Pictures During Play', 'Public play', 'Spitting', 'Slapping', 'Breeding',
  'Gangbangs', 'Daddy/Mommy kink', 'Choking / breath play', 'Wax play',
  'Degradation / praise', 'Shibari / decorative rope', 'Cuckolding or hotwife',
  'Anal play', 'Pet play', 'CNC', 'Watersports'
];

const SEEKING_PREFERENCES_OPTIONS = [
  'Only Fun & Play Sexual Activities', 'A Partner Dynamic', 'A Relationship', 'Undecided'
];

// --- ABOUT ME/ABOUT US STEP DATA CONSTANTS ---

// Height options: 4'0" to 7'0" in 1-inch increments
const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const feet = Math.floor((i + 48) / 12);
  const inches = (i + 48) % 12;
  return `${feet}'${inches}"`;
}); // 4'0" to 7'0"

// Weight options: 75 to 450 lbs in 5-lb increments
const WEIGHT_OPTIONS = Array.from({ length: 76 }, (_, i) => `${75 + i * 5} lbs`);

const BODY_TYPE_OPTIONS = ['Slim', 'Average', 'Dad Bod', 'Curvy', 'Fit', 'Thick', 'BBW'];

const HAIR_COLOR_OPTIONS = [
  'Bald', 'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 
  'Silver', 'Dyed - unnatural colors', 'Dyed - natural colors', 'Salt and Pepper'
];

const EYE_COLOR_OPTIONS = [
  'Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 
  'Two different colors', 'Black'
];

const FACIAL_HAIR_OPTIONS = ['Yes', 'No', "Doesn't Apply"];

const ETHNICITY_OPTIONS = [
  'White/Caucasian', 'Black/African American', 'Hispanic/Latino', 'Asian', 
  'Native American', 'Middle Eastern', 'South Asian', 'Pacific Islander',
  'Mixed/Multiple', 'Other'
];

const YES_NO_OPTIONS = ['Yes', 'No'];

const BODY_HAIR_OPTIONS = [
  'Smooth/shaved', 'Lightly trimmed', 'Natural', 'Hairy', 'Very hairy'
];

const GROOMING_STYLE_OPTIONS = [
  'Fully shaved', 'Well-groomed', 'Natural', 'Casual', 'Wild/untamed'
];

const BIRTH_CONTROL_OPTIONS = [
  'Not applicable', 'None', 'Condoms', 'Birth control pills', 
  'IUD', 'Implant', 'Shot', 'Vasectomy', 'Tubal ligation', 'Other'
];

const CAN_HOST_OPTIONS = ['Yes', 'No', 'Possibly'];

// --- HELPER COMPONENTS ---
const CheckboxGrid = ({ title, options, selected, onToggle, max, error }: { title: string; options: string[]; selected: string[]; onToggle: (option: string) => void; max: number, error?: string }) => (
  <div className="space-y-2">
    <Label>{title} (Max {max})</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onToggle(option)} className={`py-2 px-3 text-sm rounded-lg text-left transition-all ${selected.includes(option) ? 'bg-brand-primary text-white font-semibold' : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'}`}>
          {option}
        </button>
      ))}
    </div>
  </div>
);

const Slider = ({ label, value, onChange, min, max, unit }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; unit: string; }) => (
    <div className='space-y-2'>
        <div className="flex justify-between items-center">
            <Label className='mb-0'>{label}</Label>
            <span className="text-brand-secondary font-semibold">{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={onChange} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-thumb" />
    </div>
);

const TagMultiSelect = ({ title, options, selected, onToggle, error }: { title: string; options: string[]; selected: string[]; onToggle: (option: string) => void; error?: string }) => (
  <div className="space-y-2">
    <Label>{title}</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onToggle(option)} className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${selected.includes(option) ? 'bg-brand-primary text-white' : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'}`}>{option}</button>
      ))}
    </div>
  </div>
);

// FIX: Added `name` prop to the Select component to pass it to the underlying select element, which is required by the `onChange` handlers.
const Select = ({ label, value, onChange, options, placeholder, required, name }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[], placeholder?: string, required?: boolean, name?: string }) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <select value={value} onChange={onChange} name={name} required={required} className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors">
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

// Role Selection Component
const RoleSelection = ({ 
  partnerName, 
  roles, 
  onRoleChange, 
  onQuizOpen, 
  quizResults 
}: { 
  partnerName: string; 
  roles: string[]; 
  onRoleChange: (role: string) => void; 
  onQuizOpen: () => void; 
  quizResults?: Record<string, number> 
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    onRoleChange(role);
  };

  return (
    <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
      <h3 className="font-semibold text-lg text-brand-secondary">{partnerName}'s Role Selection</h3>
      
      <div className="space-y-2">
        <Select
          label="Select Role (or take quiz for suggestions)"
          value={selectedRole}
          onChange={(e) => handleRoleSelect(e.target.value)}
          options={ROLE_OPTIONS}
          placeholder="Select a role..."
        />
      </div>

      <Button
        type="button"
        onClick={onQuizOpen}
        variant="outline"
        className="w-full"
      >
        ð Take Kink Quiz for Role Suggestions
      </Button>

      {quizResults && Object.keys(quizResults).length > 0 && (
        <div className="mt-4 p-3 bg-brand-primary/10 rounded-lg">
          <p className="text-sm text-text-secondary mb-2">Quiz Results - Top Roles:</p>
          <div className="space-y-1">
            {Object.entries(quizResults)
              .sort(([,a], [,b]) => (b || 0) - (a || 0))
              .slice(0, 5)
              .map(([role, percentage], index) => (
                <div key={role} className="flex items-center justify-between text-sm">
                  <span className="text-white">{index + 1}. {role}</span>
                  <span className="text-brand-secondary font-semibold">{percentage}%</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER FUNCTIONS ---
// Date of Birth validation and age calculation
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const validateDateOfBirth = (date: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(date)) return false;
  
  const parts = date.split('/');
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  const dateObj = new Date(year, month - 1, day);
  const age = calculateAge(date);
  
  return dateObj.getDate() === day && 
         dateObj.getMonth() === month - 1 && 
         dateObj.getFullYear() === year &&
         age >= 18 && age <= 99;
};

// --- MAIN COMPONENT ---
export const ProfileSetupPage: React.FC = () => {
  const { user } = useAuth();
  const { completeProfileSetup, uploadPhoto } = useProfile();

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<'individual' | 'couple' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationVerification, setLocationVerification] = useState<{
    isVerifying: boolean;
    isAccurate: boolean | null;
    deviceLocation: { city: string; state: string } | null;
    errorMessage: string | null;
  }>({
    isVerifying: false,
    isAccurate: null,
    deviceLocation: null,
    errorMessage: null,
  });

  // --- DEFAULT SAFE INITIAL STATE TO AVOID undefined ---- (<<< FIX: avoids runtime undefined)
  const [formData, setFormData] = useState<Partial<Profile>>({
    accountType: accountType || 'individual', // 
    displayName: '',
    location: '',
    dateOfBirth: '',
    bio: '',
    photos: [],
    relationshipStatus: '',
    seeking: [],
    seekingRelationshipType: [],
    lifestyleExperience: 'New',
    interests: [],
    kinks: [],
    // New Step 2 fields - Individual
    topRoles: [],
    seekingPreferences: [],
    kinkQuizResults: {},
    softLimits: [],
    hardLimits: [],
    safetyPractices: '',
    rules: '',
    gender: '',
    orientation: '',
    displayName2: '',
    gender2: '',
    orientation2: '',
    age2: 18,
    // Couples Step 2 - Partner 1
    partner1Role: '',
    partner1QuizResults: {},
    partner1Experience: 'New',
    partner1Kinks: [],
    partner1SoftLimits: [],
    partner1HardLimits: [],
    partner1SafetyPractices: '',
    partner1Rules: '',
    // Couples Step 2 - Partner 2
    partner2Role: '',
    partner2QuizResults: {},
    partner2Experience: 'New',
    partner2Kinks: [],
    partner2SoftLimits: [],
    partner2HardLimits: [],
    partner2SafetyPractices: '',
    partner2Rules: '',
    // === ABOUT ME/ABOUT US STEP FIELDS - INDIVIDUAL ===
    height: '',
    weight: '',
    bodyType: '',
    hairColor: '',
    eyeColor: '',
    facialHair: '',
    ethnicity: '',
    cigaretteSmoker: '',
    alcoholDrinker: '',
    marijuanaUser: '',
    tattoos: false,
    piercings: false,
    bodyHair: '',
    groomingStyle: '',
    birthControl: '',
    latexAllergy: false,
    lastSTITestDate: '',
    stiPositiveResults: '',
    canHost: '',
    // === COUPLES - PARTNER 1 STATS ===
    partner1Height: '',
    partner1Weight: '',
    partner1BodyType: '',
    partner1HairColor: '',
    partner1EyeColor: '',
    partner1FacialHair: '',
    partner1Ethnicity: '',
    partner1CigaretteSmoker: '',
    partner1AlcoholDrinker: '',
    partner1MarijuanaUser: '',
    partner1Tattoos: false,
    partner1Piercings: false,
    partner1BodyHair: '',
    partner1GroomingStyle: '',
    partner1BirthControl: '',
    partner1LatexAllergy: false,
    partner1LastSTITestDate: '',
    partner1StiPositiveResults: '',
    partner1CanHost: '',
    // === COUPLES - PARTNER 2 STATS ===
    partner2Height: '',
    partner2Weight: '',
    partner2BodyType: '',
    partner2HairColor: '',
    partner2EyeColor: '',
    partner2FacialHair: '',
    partner2Ethnicity: '',
    partner2CigaretteSmoker: '',
    partner2AlcoholDrinker: '',
    partner2MarijuanaUser: '',
    partner2Tattoos: false,
    partner2Piercings: false,
    partner2BodyHair: '',
    partner2GroomingStyle: '',
    partner2BirthControl: '',
    partner2LatexAllergy: false,
    partner2LastSTITestDate: '',
    partner2StiPositiveResults: '',
    partner2CanHost: '',
    matchPreferences: {
        ageRange: [18, 55],
        genders: [],
        sexualities: [],
        searchingFor: [],
        distance: 50,
        vipOnly: false,
        verifiedOnly: true,
        experienceLevels: [],
    },
    membershipTier: 'basic',
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Quiz state for Step 2
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<string, number>>({});
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuizPartner, setCurrentQuizPartner] = useState<'individual' | 'partner1' | 'partner2'>('individual');

  // --- LOCATION VERIFICATION FUNCTION ---
  const verifyLocation = async (inputLocation: string, membershipTier: string): Promise<void> => {
    setLocationVerification(prev => ({ ...prev, isVerifying: true, errorMessage: null }));
    
    try {
      // Check if user is VIP
      if (membershipTier !== 'vip') {
        setLocationVerification({
          isVerifying: false,
          isAccurate: false,
          deviceLocation: null,
          errorMessage: null // Remove error message for basic users
        });
        return;
      }

      // Get device location
      if (!navigator.geolocation) {
        setLocationVerification({
          isVerifying: false,
          isAccurate: false,
          deviceLocation: null,
          errorMessage: 'Geolocation is not supported by your browser.'
        });
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      // Here you would typically reverse geocode the coordinates to get city/state
      // For now, we'll simulate this with a basic check
      const deviceCity = 'Device Detected City'; // Replace with actual reverse geocoding
      const deviceState = 'Device Detected State'; // Replace with actual reverse geocoding
      
      setLocationVerification({
        isVerifying: false,
        isAccurate: true, // In real implementation, this would compare with input
        deviceLocation: { city: deviceCity, state: deviceState },
        errorMessage: null
      });

    } catch (error) {
      setLocationVerification({
        isVerifying: false,
        isAccurate: false,
        deviceLocation: null,
        errorMessage: 'Unable to verify location. Please ensure location services are enabled.'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let finalValue: any = value;
    
    // Handle date of birth formatting
    if (name === 'dateOfBirth') {
      // Remove any non-digit characters
      let digits = value.replace(/\D/g, '');
      // Format as MM/DD/YYYY
      if (digits.length >= 2) {
        digits = digits.slice(0, 2) + '/' + digits.slice(2);
      }
      if (digits.length >= 5) {
        digits = digits.slice(0, 5) + '/' + digits.slice(5, 9);
      }
      finalValue = digits;
    } else if (type === 'number') {
      finalValue = parseInt(value as string, 10);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handlePartnerChange = (partner: 'partner1' | 'partner2', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const fieldMapping: any = {
        partner1: { displayName: 'displayName', gender: 'gender', sexuality: 'orientation', age: 'age' },
        partner2: { displayName: 'displayName2', gender: 'gender2', sexuality: 'orientation2', age: 'age2' },
    };
    // ensure mapping exists for this input name
    const mapped = fieldMapping[partner]?.[name];
    if (!mapped) {
      // unknown partner field â fallback to setting raw name (defensive)
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(String(value), 10) : value }));
      return;
    }
    let finalValue: any = value;
    if (type === 'number') finalValue = parseInt(value as string, 10);
    setFormData(prev => ({ ...prev, [mapped]: finalValue }));
  };

  const handleToggle = (field: keyof Profile, value: string, max?: number) => {
    const currentValues = (formData[field] as string[] || []);
    let newValues;
    if (currentValues.includes(value)) {
        newValues = currentValues.filter(item => item !== value);
    } else {
        if (max && currentValues.length >= max) {
            setValidationErrors(prev => ({ ...prev, [field]: `You can select a maximum of ${max} options.` }));
            return;
        }
        newValues = [...currentValues, value];
    }
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
    setFormData(prev => ({ ...prev, [field]: newValues }));
  };

  // Partner-specific toggle handlers for couples
  const handlePartnerToggle = (partner: 'partner1' | 'partner2', field: string, value: string, max?: number) => {
    const fieldName = `${partner}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Profile;
    const currentValues = (formData[fieldName] as string[] || []);
    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(item => item !== value);
    } else {
      if (max && currentValues.length >= max) {
        setValidationErrors(prev => ({ ...prev, [fieldName]: `You can select a maximum of ${max} options.` }));
        return;
      }
      newValues = [...currentValues, value];
    }
    setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));
    setFormData(prev => ({ ...prev, [fieldName]: newValues }));
  };

  const handlePartnerTextChange = (partner: 'partner1' | 'partner2', field: string, value: string) => {
    const fieldName = `${partner}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Profile;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Partner-specific stats handlers
  const handlePartnerStatsChange = (partner: 'partner1' | 'partner2', field: string, value: string | boolean) => {
    const fieldName = `${partner}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Profile;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Stats component for displaying partner stats
  const PartnerStats = ({ 
    partner, 
    partnerName, 
    prefix = '' 
  }: { 
    partner: 'partner1' | 'partner2'; 
    partnerName: string; 
    prefix?: string; 
  }) => {
    return (
      <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
        <h3 className="font-semibold text-lg text-brand-secondary">{partnerName}'s Stats</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Height"
            value={String(formData[`${partner}${prefix}Height` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'height', e.target.value)}
            options={HEIGHT_OPTIONS}
            placeholder="Select height..."
          />
          
          <Select
            label="Weight"
            value={String(formData[`${partner}${prefix}Weight` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'weight', e.target.value)}
            options={WEIGHT_OPTIONS}
            placeholder="Select weight..."
          />
          
          <Select
            label="Body Type"
            value={String(formData[`${partner}${prefix}BodyType` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'bodyType', e.target.value)}
            options={BODY_TYPE_OPTIONS}
            placeholder="Select body type..."
          />
          
          <Select
            label="Hair Color"
            value={String(formData[`${partner}${prefix}HairColor` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'hairColor', e.target.value)}
            options={HAIR_COLOR_OPTIONS}
            placeholder="Select hair color..."
          />
          
          <Select
            label="Eye Color"
            value={String(formData[`${partner}${prefix}EyeColor` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'eyeColor', e.target.value)}
            options={EYE_COLOR_OPTIONS}
            placeholder="Select eye color..."
          />
          
          <Select
            label="Facial Hair"
            value={String(formData[`${partner}${prefix}FacialHair` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'facialHair', e.target.value)}
            options={FACIAL_HAIR_OPTIONS}
            placeholder="Select facial hair..."
          />
          
          <Select
            label="Ethnicity"
            value={String(formData[`${partner}${prefix}Ethnicity` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'ethnicity', e.target.value)}
            options={ETHNICITY_OPTIONS}
            placeholder="Select ethnicity..."
          />
          
          <Select
            label="Cigarette Smoker"
            value={String(formData[`${partner}${prefix}CigaretteSmoker` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'cigaretteSmoker', e.target.value)}
            options={YES_NO_OPTIONS}
            placeholder="Select..."
          />
          
          <Select
            label="Alcohol Drinker"
            value={String(formData[`${partner}${prefix}AlcoholDrinker` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'alcoholDrinker', e.target.value)}
            options={YES_NO_OPTIONS}
            placeholder="Select..."
          />
          
          <Select
            label="Marijuana User"
            value={String(formData[`${partner}${prefix}MarijuanaUser` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'marijuanaUser', e.target.value)}
            options={YES_NO_OPTIONS}
            placeholder="Select..."
          />
          
          <Select
            label="Body Hair"
            value={String(formData[`${partner}${prefix}BodyHair` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'bodyHair', e.target.value)}
            options={BODY_HAIR_OPTIONS}
            placeholder="Select..."
          />
          
          <Select
            label="Grooming Style"
            value={String(formData[`${partner}${prefix}GroomingStyle` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'groomingStyle', e.target.value)}
            options={GROOMING_STYLE_OPTIONS}
            placeholder="Select..."
          />
          
          <Select
            label="Birth Control"
            value={String(formData[`${partner}${prefix}BirthControl` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'birthControl', e.target.value)}
            options={BIRTH_CONTROL_OPTIONS}
            placeholder="Select..."
          />
          
          <Select
            label="Can Host?"
            value={String(formData[`${partner}${prefix}CanHost` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'canHost', e.target.value)}
            options={CAN_HOST_OPTIONS}
            placeholder="Select..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${partner}-tattoos`}
              checked={Boolean(formData[`${partner}${prefix}Tattoos` as keyof Profile])}
              onChange={(e) => handlePartnerStatsChange(partner, 'tattoos', e.target.checked)}
              className="toggle"
            />
            <Label htmlFor={`${partner}-tattoos`}>Tattoos</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${partner}-piercings`}
              checked={Boolean(formData[`${partner}${prefix}Piercings` as keyof Profile])}
              onChange={(e) => handlePartnerStatsChange(partner, 'piercings', e.target.checked)}
              className="toggle"
            />
            <Label htmlFor={`${partner}-piercings`}>Piercings</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${partner}-latex-allergy`}
              checked={Boolean(formData[`${partner}${prefix}LatexAllergy` as keyof Profile])}
              onChange={(e) => handlePartnerStatsChange(partner, 'latexAllergy', e.target.checked)}
              className="toggle"
            />
            <Label htmlFor={`${partner}-latex-allergy`}>Latex Allergy</Label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Last STI Test Date</Label>
            <Input
              type="date"
              value={String(formData[`${partner}${prefix}LastSTITestDate` as keyof Profile] || '')}
              onChange={(e) => handlePartnerStatsChange(partner, 'lastSTITestDate', e.target.value)}
            />
          </div>
          
          <Select
            label="STI Positive Results"
            value={String(formData[`${partner}${prefix}StiPositiveResults` as keyof Profile] || '')}
            onChange={(e) => handlePartnerStatsChange(partner, 'stiPositiveResults', e.target.value)}
            options={YES_NO_OPTIONS}
            placeholder="Select..."
          />
        </div>
      </div>
    );
  };

  // --- State ---
  // photoFiles & photoUrls already declared above

  // --- Upload handler ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 10) {
      setValidationErrors(prev => ({ ...prev, photos: 'You can upload a maximum of 10 photos' }));
      return;
    }

    // Append new files to the array
    setPhotoFiles(prev => [...prev, ...files]);
    setValidationErrors(prev => ({ ...prev, photos: '' }));
  };

  // --- Remove handler ---
  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index)); // keep URLs in sync
  };

  // Quiz handlers
  const handleQuizComplete = (results: Record<string, number>) => {
    if (currentQuizPartner === 'individual') {
      setFormData(prev => ({ ...prev, kinkQuizResults: results }));
      setQuizResults(results);
    } else if (currentQuizPartner === 'partner1') {
      setFormData(prev => ({ ...prev, partner1QuizResults: results }));
    } else if (currentQuizPartner === 'partner2') {
      setFormData(prev => ({ ...prev, partner2QuizResults: results }));
    }
    setQuizCompleted(true);
    setShowQuiz(false);
  };

  const openQuiz = (partner: 'individual' | 'partner1' | 'partner2') => {
    setCurrentQuizPartner(partner);
    setShowQuiz(true);
  };

  const handleRoleChange = (partner: 'individual' | 'partner1' | 'partner2', role: string) => {
    if (partner === 'individual') {
      setFormData(prev => ({ ...prev, topRoles: [role] }));
    } else if (partner === 'partner1') {
      setFormData(prev => ({ ...prev, partner1Role: role }));
    } else if (partner === 'partner2') {
      setFormData(prev => ({ ...prev, partner2Role: role }));
    }
  };

  // --- Submission snippet (use uploaded URLs) ---
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Guard: account type must be set
      if (!accountType) throw new Error('Account type not selected');

      // Basic validation
      if (!formData.displayName || !formData.location) {
        throw new Error('Please fill out display name and location');
      }
      if (!formData.gender || !formData.orientation) {
        throw new Error('Please select gender and sexuality');
      }

      // Location validation for profile completion
      if (accountType === 'individual' && locationVerification.isAccurate === false && formData.membershipTier === 'basic') {
        throw new Error('Please correct selected City and state with your correct city and state location to complete profile setup or select VIP membership to use a different location in your profile.');
      }

      if (photoFiles.length < 2) {
          throw new Error('Please upload at least 2 photos');
      }

      const uploadedUrls: string[] = [];

      for (const file of photoFiles) {
        const filePath = `${user?.id}/${Date.now()}_${file.name}`;

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);
        if (!publicUrlData?.publicUrl) throw new Error('Failed to get uploaded photo URL');

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setPhotoUrls(uploadedUrls);

      // Ensure matchPreferences exists
      const safeMatchPreferences = {
        ageRange: formData.matchPreferences?.ageRange || [21, 55],
        genders: formData.matchPreferences?.genders || [],
        sexualities: formData.matchPreferences?.sexualities || [],
        searchingFor: formData.matchPreferences?.searchingFor || [],
        distance: typeof formData.matchPreferences?.distance === 'number' ? formData.matchPreferences!.distance : 50,
        vipOnly: !!formData.matchPreferences?.vipOnly,
        verifiedOnly: !!formData.matchPreferences?.verifiedOnly,
        experienceLevels: formData.matchPreferences?.experienceLevels || [],
      };

      // Build final profile payload in a deterministic shape
      const finalProfileData: Profile = {
          // cast only safe fields â prevents runtime undefined from being sent
          displayName: String(formData.displayName || ''),
          displayName2: String(formData.displayName2 || ''),
          location: String(formData.location || ''),
          age: Number(formData.age || 18),
          age2: Number(formData.age2 || 18),
          bio: String(formData.bio || ''),
          photos: uploadedUrls,
          relationshipStatus: String(formData.relationshipStatus || ''),
          seeking: formData.seeking || [],
          seekingRelationshipType: formData.seekingRelationshipType || [],
          lifestyleExperience: String(formData.lifestyleExperience || 'New'),
          interests: formData.interests || [],
          kinks: formData.kinks || [],
          softLimits: formData.softLimits || [],
          hardLimits: formData.hardLimits || [],
          safetyPractices: String(formData.safetyPractices || ''),
          rules: String(formData.rules || ''),
          gender: String(formData.gender || ''),
          gender2: String(formData.gender2 || ''),
          orientation: String(formData.orientation || ''),
          orientation2: String(formData.orientation2 || ''),
          matchPreferences: safeMatchPreferences,
          membershipTier: String(formData.membershipTier || 'basic'),
          accountType: accountType || 'individual',
          // Step 2 fields for individual
          topRoles: formData.topRoles || [],
          seekingPreferences: formData.seekingPreferences || [],
          kinkQuizResults: formData.kinkQuizResults || {},
          // Step 2 fields for couples
          partner1Role: formData.partner1Role || '',
          partner1QuizResults: formData.partner1QuizResults || {},
          partner1Experience: formData.partner1Experience || 'New',
          partner1Kinks: formData.partner1Kinks || [],
          partner1SoftLimits: formData.partner1SoftLimits || [],
          partner1HardLimits: formData.partner1HardLimits || [],
          partner1SafetyPractices: formData.partner1SafetyPractices || '',
          partner1Rules: formData.partner1Rules || '',
          partner2Role: formData.partner2Role || '',
          partner2QuizResults: formData.partner2QuizResults || {},
          partner2Experience: formData.partner2Experience || 'New',
          partner2Kinks: formData.partner2Kinks || [],
          partner2SoftLimits: formData.partner2SoftLimits || [],
          partner2HardLimits: formData.partner2HardLimits || [],
          partner2SafetyPractices: formData.partner2SafetyPractices || '',
          partner2Rules: formData.partner2Rules || '',
          // === ABOUT ME/ABOUT US STEP FIELDS - INDIVIDUAL ===
          height: formData.height || '',
          weight: formData.weight || '',
          bodyType: formData.bodyType || '',
          hairColor: formData.hairColor || '',
          eyeColor: formData.eyeColor || '',
          facialHair: formData.facialHair || '',
          ethnicity: formData.ethnicity || '',
          cigaretteSmoker: formData.cigaretteSmoker || '',
          alcoholDrinker: formData.alcoholDrinker || '',
          marijuanaUser: formData.marijuanaUser || '',
          tattoos: Boolean(formData.tattoos),
          piercings: Boolean(formData.piercings),
          bodyHair: formData.bodyHair || '',
          groomingStyle: formData.groomingStyle || '',
          birthControl: formData.birthControl || '',
          latexAllergy: Boolean(formData.latexAllergy),
          lastSTITestDate: formData.lastSTITestDate || '',
          stiPositiveResults: formData.stiPositiveResults || '',
          canHost: formData.canHost || '',
          // === COUPLES - PARTNER 1 STATS ===
          partner1Height: formData.partner1Height || '',
          partner1Weight: formData.partner1Weight || '',
          partner1BodyType: formData.partner1BodyType || '',
          partner1HairColor: formData.partner1HairColor || '',
          partner1EyeColor: formData.partner1EyeColor || '',
          partner1FacialHair: formData.partner1FacialHair || '',
          partner1Ethnicity: formData.partner1Ethnicity || '',
          partner1CigaretteSmoker: formData.partner1CigaretteSmoker || '',
          partner1AlcoholDrinker: formData.partner1AlcoholDrinker || '',
          partner1MarijuanaUser: formData.partner1MarijuanaUser || '',
          partner1Tattoos: Boolean(formData.partner1Tattoos),
          partner1Piercings: Boolean(formData.partner1Piercings),
          partner1BodyHair: formData.partner1BodyHair || '',
          partner1GroomingStyle: formData.partner1GroomingStyle || '',
          partner1BirthControl: formData.partner1BirthControl || '',
          partner1LatexAllergy: Boolean(formData.partner1LatexAllergy),
          partner1LastSTITestDate: formData.partner1LastSTITestDate || '',
          partner1StiPositiveResults: formData.partner1StiPositiveResults || '',
          partner1CanHost: formData.partner1CanHost || '',
          // === COUPLES - PARTNER 2 STATS ===
          partner2Height: formData.partner2Height || '',
          partner2Weight: formData.partner2Weight || '',
          partner2BodyType: formData.partner2BodyType || '',
          partner2HairColor: formData.partner2HairColor || '',
          partner2EyeColor: formData.partner2EyeColor || '',
          partner2FacialHair: formData.partner2FacialHair || '',
          partner2Ethnicity: formData.partner2Ethnicity || '',
          partner2CigaretteSmoker: formData.partner2CigaretteSmoker || '',
          partner2AlcoholDrinker: formData.partner2AlcoholDrinker || '',
          partner2MarijuanaUser: formData.partner2MarijuanaUser || '',
          partner2Tattoos: Boolean(formData.partner2Tattoos),
          partner2Piercings: Boolean(formData.partner2Piercings),
          partner2BodyHair: formData.partner2BodyHair || '',
          partner2GroomingStyle: formData.partner2GroomingStyle || '',
          partner2BirthControl: formData.partner2BirthControl || '',
          partner2LatexAllergy: Boolean(formData.partner2LatexAllergy),
          partner2LastSTITestDate: formData.partner2LastSTITestDate || '',
          partner2StiPositiveResults: formData.partner2StiPositiveResults || '',
          partner2CanHost: formData.partner2CanHost || '',
      } as Profile;

      // Note: No need to attach userId - the profiles table uses 'id' column which is set in useProfile hook

      // Call the hook to persist. Provide clearer error message if it fails.
      const response = await completeProfileSetup(finalProfileData);
      // Response shape may vary; handle common shapes
      if (response.error) {
        throw new Error(response.error);
      }

      // success path - you can route or show a message here
    } catch (err: any) {
      console.error('Profile submit failed:', err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const canProceed = useMemo(() => {
    if (accountType === 'individual') {
        switch (step) {
            case 1: return Boolean(
              formData.displayName && 
              formData.location && 
              formData.gender && 
              formData.orientation && 
              formData.dateOfBirth && 
              validateDateOfBirth(String(formData.dateOfBirth)) && 
              formData.relationshipStatus &&
              true // Allow all users to proceed regardless of location verification
            );
            case 2: return Boolean(
              (formData.topRoles && formData.topRoles.length >= 1) || quizCompleted
            );
            case 3: return Boolean(formData.bio) && (String(formData.bio).length >= 69 && String(formData.bio).length <= 1000); // About Me step - bio moved here
            case 4: return photoFiles.length >= 2; // Photos step (previously step 3)
            case 5: return true; // Preferences are optional (previously step 4)
            case 6: return true; // Membership selection (previously step 5)
            default: return false;
        }
    }
    if (accountType === 'couple') {
        switch (step) {
            case 1: return Boolean(formData.displayName && formData.displayName2 && formData.location && formData.gender && formData.gender2 && formData.orientation && formData.orientation2 && Number(formData.age) >= 18 && Number(formData.age2) >= 18 && formData.relationshipStatus);
            case 2: return Boolean(formData.partner1Role && formData.partner2Role);
            case 3: return Boolean(formData.bio) && (String(formData.bio).length >= 69 && String(formData.bio).length <= 1000); // About Us step
            case 4: return photoFiles.length >= 2; // Photos step (previously step 3)
            case 5: return true; // Preferences are optional (previously step 4)
            case 6: return true; // Membership (previously step 5)
            default: return false;
        }
    }
    return false;
  }, [step, formData, photoFiles, accountType, quizCompleted]);

  const renderStepContent = () => {
    const isIndividual = accountType === 'individual';
    switch (step) {
      case 1: // Basic Info
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">{isIndividual ? 'Tell us about yourself' : 'Meet the Two of You!'}</h2>
            {isIndividual ? (
              <>
                <div className="space-y-2"><Label>Display Name</Label><Input name="displayName" value={formData.displayName} onChange={handleInputChange} required /></div>
                <div className="space-y-2">
                  <Label>Location (City, State)</Label>
                  <Input 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Los Angeles, CA" 
                    required 
                  />
                  {formData.location && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => verifyLocation(String(formData.location), String(formData.membershipTier))}
                        disabled={locationVerification.isVerifying}
                        className="text-sm bg-brand-primary/20 hover:bg-brand-primary/30 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {locationVerification.isVerifying ? 'Verifying...' : 'Verify Location'}
                      </button>
                      {locationVerification.errorMessage && (
                        <p className="text-red-400 text-sm mt-1">{locationVerification.errorMessage}</p>
                      )}
                      {locationVerification.isAccurate && (
                        <p className="text-green-400 text-sm mt-1">â Location verified</p>
                      )}
                      {locationVerification.isAccurate === false && !locationVerification.errorMessage && (
                        <p className="text-yellow-400 text-sm mt-1">â  Location may be inaccurate. Please provide accurate location.</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Gender" name="gender" value={String(formData.gender || '')} onChange={handleInputChange} options={GENDER_OPTIONS} placeholder="Select..." required />
                    <Select label="Sexuality" name="orientation" value={String(formData.orientation || '')} onChange={handleInputChange} options={SEXUALITY_OPTIONS} placeholder="Select..." required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Date of Birth (MM/DD/YYYY)</Label>
                         <Input 
                           name="dateOfBirth" 
                           value={formData.dateOfBirth} 
                           onChange={handleInputChange} 
                           placeholder="MM/DD/YYYY" 
                           maxLength={10}
                           required 
                         />
                         {formData.dateOfBirth && !validateDateOfBirth(String(formData.dateOfBirth)) && (
                           <p className="text-red-400 text-sm">Please enter a valid date in MM/DD/YYYY format (must be 18-99 years old)</p>
                         )}
                         {formData.dateOfBirth && validateDateOfBirth(String(formData.dateOfBirth)) && (
                           <p className="text-green-400 text-sm">Age: {calculateAge(String(formData.dateOfBirth))} years old</p>
                         )}</div>
                    <Select label="Current Relationship Status" name="relationshipStatus" value={String(formData.relationshipStatus || '')} onChange={handleInputChange} options={RELATIONSHIP_STATUS_OPTIONS} placeholder="Select..." required />
                </div>
              </>
            ) : (
             <>
                <div className="space-y-2"><Label>Location (City, State)</Label><Input name="location" value={formData.location} onChange={handleInputChange} required /></div>
                <div className="p-4 border border-brand-primary/30 rounded-lg">
                    <h3 className="font-semibold text-lg text-brand-secondary mb-2">Partner 1</h3>
                    <div className="space-y-4">
                        <div className="space-y-2"><Label>Display Name</Label><Input name="displayName" value={formData.displayName} onChange={(e) => handlePartnerChange('partner1', e)} required /></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <Select label="Gender" name="gender" value={String(formData.gender || '')} onChange={(e) => handlePartnerChange('partner1', e)} options={GENDER_OPTIONS} placeholder="Select..." required />
                             <Select label="Sexuality" name="sexuality" value={String(formData.orientation || '')} onChange={(e) => handlePartnerChange('partner1', e)} options={SEXUALITY_OPTIONS} placeholder="Select..." required />
                            <div className="space-y-2"><Label>Age</Label><Input name="age" type="number" min="18" max="99" value={formData.age} onChange={(e) => handlePartnerChange('partner1', e)} required /></div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 border border-brand-primary/30 rounded-lg">
                    <h3 className="font-semibold text-lg text-brand-secondary mb-2">Partner 2</h3>
                    <div className="space-y-4">
                        <div className="space-y-2"><Label>Display Name</Label><Input name="displayName2" value={formData.displayName2} onChange={(e) => handlePartnerChange('partner2', e)} required /></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <Select label="Gender" name="gender" value={String(formData.gender2 || '')} onChange={(e) => handlePartnerChange('partner2', e)} options={GENDER_OPTIONS} placeholder="Select..." required />
                             <Select label="Sexuality" name="sexuality" value={String(formData.orientation2 || '')} onChange={(e) => handlePartnerChange('partner2', e)} options={SEXUALITY_OPTIONS} placeholder="Select..." required />
                            <div className="space-y-2"><Label>Age</Label><Input name="age" type="number" min="18" max="99" value={formData.age2} onChange={(e) => handlePartnerChange('partner2', e)} required /></div>
                        </div>
                    </div>
                </div>
                <Select label="Current Relationship Status" name="relationshipStatus" value={String(formData.relationshipStatus || '')} onChange={handleInputChange} options={RELATIONSHIP_STATUS_OPTIONS} placeholder="Select..." required />
             </>
            )}
             <Button onClick={nextStep} disabled={!canProceed}>Next â</Button>
          </div>
        );
      case 2: // Role Selection & Kink Quiz (Updated for Individual and Couples)
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              {isIndividual ? 'Discover Your Role' : 'Discover Your Roles'}
            </h2>
            
            {isIndividual ? (
              <>
                <RoleSelection
                  partnerName="Your"
                  roles={formData.topRoles || []}
                  onRoleChange={(role) => handleRoleChange('individual', role)}
                  onQuizOpen={() => openQuiz('individual')}
                  quizResults={formData.kinkQuizResults}
                />
                
                {/* Individual fields */}
                <div className="space-y-4">
                  <Select 
                    label="Lifestyle Experience Level" 
                    name="lifestyleExperience" 
                    value={String(formData.lifestyleExperience || 'New')} 
                    onChange={handleInputChange} 
                    options={EXPERIENCE_LEVEL_OPTIONS} 
                  />
                  
                  <CheckboxGrid 
                    title="Kinks" 
                    options={KINKS_INTERESTED_OPTIONS} 
                    selected={formData.kinks || []} 
                    onToggle={(val) => handleToggle('kinks', val, 15)} 
                    max={15} 
                    error={validationErrors.kinks} 
                  />
                  
                  <CheckboxGrid 
                    title="Soft Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.softLimits || []} 
                    onToggle={(val) => handleToggle('softLimits', val, 10)} 
                    max={10} 
                    error={validationErrors.softLimits} 
                  />
                  
                  <CheckboxGrid 
                    title="Hard Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.hardLimits || []} 
                    onToggle={(val) => handleToggle('hardLimits', val, 10)} 
                    max={10} 
                    error={validationErrors.hardLimits} 
                  />
                  
                  <div className="space-y-2">
                    <Label>Safety/Health Practices</Label>
                    <Textarea name="safetyPractices" value={formData.safetyPractices} onChange={handleInputChange} rows={3} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rules (Optional)</Label>
                    <Textarea name="rules" value={formData.rules} onChange={handleInputChange} rows={3} />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Partner 1 */}
                <RoleSelection
                  partnerName={String(formData.displayName || 'Partner 1')}
                  roles={formData.partner1Role ? [formData.partner1Role] : []}
                  onRoleChange={(role) => handleRoleChange('partner1', role)}
                  onQuizOpen={() => openQuiz('partner1')}
                  quizResults={formData.partner1QuizResults}
                />
                
                <div className="space-y-4 p-4 border border-brand-primary/20 rounded-lg">
                  <h4 className="font-semibold text-brand-secondary">{formData.displayName}'s Preferences</h4>
                  
                  <Select 
                    label="Lifestyle Experience Level" 
                    name="partner1Experience" 
                    value={String(formData.partner1Experience || 'New')} 
                    onChange={(e) => handlePartnerTextChange('partner1', 'experience', e.target.value)} 
                    options={EXPERIENCE_LEVEL_OPTIONS} 
                  />
                  
                  <CheckboxGrid 
                    title="Kinks You're Interested In" 
                    options={KINKS_INTERESTED_OPTIONS} 
                    selected={formData.partner1Kinks || []} 
                    onToggle={(val) => handlePartnerToggle('partner1', 'kinks', val, 15)} 
                    max={15} 
                    error={validationErrors.partner1Kinks} 
                  />
                  
                  <CheckboxGrid 
                    title="Soft Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.partner1SoftLimits || []} 
                    onToggle={(val) => handlePartnerToggle('partner1', 'softLimits', val, 10)} 
                    max={10} 
                    error={validationErrors.partner1SoftLimits} 
                  />
                  
                  <CheckboxGrid 
                    title="Hard Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.partner1HardLimits || []} 
                    onToggle={(val) => handlePartnerToggle('partner1', 'hardLimits', val, 10)} 
                    max={10} 
                    error={validationErrors.partner1HardLimits} 
                  />
                  
                  <div className="space-y-2">
                    <Label>Safety/Health Practices</Label>
                    <Textarea 
                      value={String(formData.partner1SafetyPractices || '')} 
                      onChange={(e) => handlePartnerTextChange('partner1', 'safetyPractices', e.target.value)} 
                      rows={3} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rules (Optional)</Label>
                    <Textarea 
                      value={String(formData.partner1Rules || '')} 
                      onChange={(e) => handlePartnerTextChange('partner1', 'rules', e.target.value)} 
                      rows={3} 
                    />
                  </div>
                </div>

                {/* Partner 2 */}
                <RoleSelection
                  partnerName={String(formData.displayName2 || 'Partner 2')}
                  roles={formData.partner2Role ? [formData.partner2Role] : []}
                  onRoleChange={(role) => handleRoleChange('partner2', role)}
                  onQuizOpen={() => openQuiz('partner2')}
                  quizResults={formData.partner2QuizResults}
                />
                
                <div className="space-y-4 p-4 border border-brand-primary/20 rounded-lg">
                  <h4 className="font-semibold text-brand-secondary">{formData.displayName2}'s Preferences</h4>
                  
                  <Select 
                    label="Lifestyle Experience Level" 
                    name="partner2Experience" 
                    value={String(formData.partner2Experience || 'New')} 
                    onChange={(e) => handlePartnerTextChange('partner2', 'experience', e.target.value)} 
                    options={EXPERIENCE_LEVEL_OPTIONS} 
                  />
                  
                  <CheckboxGrid 
                    title="Kinks You're Interested In" 
                    options={KINKS_INTERESTED_OPTIONS} 
                    selected={formData.partner2Kinks || []} 
                    onToggle={(val) => handlePartnerToggle('partner2', 'kinks', val, 15)} 
                    max={15} 
                    error={validationErrors.partner2Kinks} 
                  />
                  
                  <CheckboxGrid 
                    title="Soft Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.partner2SoftLimits || []} 
                    onToggle={(val) => handlePartnerToggle('partner2', 'softLimits', val, 10)} 
                    max={10} 
                    error={validationErrors.partner2SoftLimits} 
                  />
                  
                  <CheckboxGrid 
                    title="Hard Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.partner2HardLimits || []} 
                    onToggle={(val) => handlePartnerToggle('partner2', 'hardLimits', val, 10)} 
                    max={10} 
                    error={validationErrors.partner2HardLimits} 
                  />
                  
                  <div className="space-y-2">
                    <Label>Safety/Health Practices</Label>
                    <Textarea 
                      value={String(formData.partner2SafetyPractices || '')} 
                      onChange={(e) => handlePartnerTextChange('partner2', 'safetyPractices', e.target.value)} 
                      rows={3} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rules (Optional)</Label>
                    <Textarea 
                      value={String(formData.partner2Rules || '')} 
                      onChange={(e) => handlePartnerTextChange('partner2', 'rules', e.target.value)} 
                      rows={3} 
                    />
                  </div>
                </div>

                {/* Shared seeking preferences for couples */}
                <div className="space-y-4 p-4 border border-brand-primary/40 rounded-lg">
                  <h4 className="font-semibold text-brand-secondary">Shared Seeking Preferences</h4>
                  <TagMultiSelect title="Seeking" options={SEEKING_OPTIONS} selected={formData.seeking || []} onToggle={(val) => handleToggle('seeking', val)} />
                  <TagMultiSelect title="Seeking Relationship Type" options={SEEKING_RELATIONSHIP_TYPE_OPTIONS} selected={formData.seekingRelationshipType || []} onToggle={(val) => handleToggle('seekingRelationshipType', val)} />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">Back</Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next â</Button>
            </div>
          </div>
        );
      case 3: // About Me / About Us
        const bioLength = String(formData.bio || '').length;
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              {isIndividual ? 'About Me' : 'About Us'}
            </h2>
            
            {/* Bio Section */}
            <div>
              <Label htmlFor="bio">
                {isIndividual ? 'Bio' : 'Shared Bio'} (69-1000 characters)
              </Label>
              <p className="text-xs text-text-secondary mb-2">
                {isIndividual 
                  ? "Show your personalityâyour vibe attracts your tribe." 
                  : "Tell others about you as a coupleâwhat makes you special together."
                }
              </p>
              <Textarea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange} 
                rows={5} 
                minLength={69} 
                maxLength={1000} 
                required 
              />
              <p className={`text-sm mt-1 ${bioLength < 69 || bioLength > 1000 ? 'text-red-400' : 'text-text-secondary'}`}>
                {bioLength} / 1000
              </p>
            </div>

            {isIndividual ? (
              <>
                {/* Individual Stats */}
                <div className="p-4 border border-brand-primary/30 rounded-lg">
                  <h3 className="font-semibold text-lg text-brand-secondary mb-4">My Stats</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Height"
                      value={String(formData.height || '')}
                      onChange={handleInputChange}
                      name="height"
                      options={HEIGHT_OPTIONS}
                      placeholder="Select height..."
                    />
                    
                    <Select
                      label="Weight"
                      value={String(formData.weight || '')}
                      onChange={handleInputChange}
                      name="weight"
                      options={WEIGHT_OPTIONS}
                      placeholder="Select weight..."
                    />
                    
                    <Select
                      label="Body Type"
                      value={String(formData.bodyType || '')}
                      onChange={handleInputChange}
                      name="bodyType"
                      options={BODY_TYPE_OPTIONS}
                      placeholder="Select body type..."
                    />
                    
                    <Select
                      label="Hair Color"
                      value={String(formData.hairColor || '')}
                      onChange={handleInputChange}
                      name="hairColor"
                      options={HAIR_COLOR_OPTIONS}
                      placeholder="Select hair color..."
                    />
                    
                    <Select
                      label="Eye Color"
                      value={String(formData.eyeColor || '')}
                      onChange={handleInputChange}
                      name="eyeColor"
                      options={EYE_COLOR_OPTIONS}
                      placeholder="Select eye color..."
                    />
                    
                    <Select
                      label="Facial Hair"
                      value={String(formData.facialHair || '')}
                      onChange={handleInputChange}
                      name="facialHair"
                      options={FACIAL_HAIR_OPTIONS}
                      placeholder="Select..."
                    />
                    
                    <Select
                      label="Ethnicity"
                      value={String(formData.ethnicity || '')}
                      onChange={handleInputChange}
                      name="ethnicity"
                      options={ETHNICITY_OPTIONS}
                      placeholder="Select ethnicity..."
                    />
                    
                    <Select
                      label="Cigarette Smoker"
                      value={String(formData.cigaretteSmoker || '')}
                      onChange={handleInputChange}
                      name="cigaretteSmoker"
                      options={YES_NO_OPTIONS}
                      placeholder="Select..."
                    />
                    
                    <Select
                      label="Alcohol Drinker"
                      value={String(formData.alcoholDrinker || '')}
                      onChange={handleInputChange}
                      name="alcoholDrinker"
                      options={YES_NO_OPTIONS}
                      placeholder="Select..."
                    />
                    
                    <Select
                      label="Marijuana User"
                      value={String(formData.marijuanaUser || '')}
                      onChange={handleInputChange}
                      name="marijuanaUser"
                      options={YES_NO_OPTIONS}
                      placeholder="Select..."
                    />
                    
                    <Select
                      label="Body Hair"
                      value={String(formData.bodyHair || '')}
                      onChange={handleInputChange}
                      name="bodyHair"
                      options={BODY_HAIR_OPTIONS}
                      placeholder="Select..."
                    />
                    
                    <Select
                      label="Grooming Style"
                      value={String(formData.groomingStyle || '')}
                      onChange={handleInputChange}
                      name="groomingStyle"
                      options={GROOMING_STYLE_OPTIONS}
                      placeholder="Select..."
                    />
                    
                    <Select
                      label="Birth Control"
                      value={String(formData.birthControl || '')}
                      onChange={handleInputChange}
                      name="birthControl"
                      options={BIRTH_CONTROL_OPTIONS}
                      placeholder="Select..."
                    />
                    
                    <Select
                      label="Can Host?"
                      value={String(formData.canHost || '')}
                      onChange={handleInputChange}
                      name="canHost"
                      options={CAN_HOST_OPTIONS}
                      placeholder="Select..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="tattoos"
                        checked={Boolean(formData.tattoos)}
                        onChange={(e) => setFormData(prev => ({ ...prev, tattoos: e.target.checked }))}
                        className="toggle"
                      />
                      <Label htmlFor="tattoos">Tattoos</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="piercings"
                        checked={Boolean(formData.piercings)}
                        onChange={(e) => setFormData(prev => ({ ...prev, piercings: e.target.checked }))}
                        className="toggle"
                      />
                      <Label htmlFor="piercings">Piercings</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="latex-allergy"
                        checked={Boolean(formData.latexAllergy)}
                        onChange={(e) => setFormData(prev => ({ ...prev, latexAllergy: e.target.checked }))}
                        className="toggle"
                      />
                      <Label htmlFor="latex-allergy">Latex Allergy</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Last STI Test Date</Label>
                      <Input
                        type="date"
                        name="lastSTITestDate"
                        value={formData.lastSTITestDate || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <Select
                      label="STI Positive Results"
                      value={String(formData.stiPositiveResults || '')}
                      onChange={handleInputChange}
                      name="stiPositiveResults"
                      options={YES_NO_OPTIONS}
                      placeholder="Select..."
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Couples Stats - Both Partners */}
                <PartnerStats 
                  partner="partner1" 
                  partnerName={String(formData.displayName || 'Partner 1')} 
                />
                
                <PartnerStats 
                  partner="partner2" 
                  partnerName={String(formData.displayName2 || 'Partner 2')} 
                />
              </>
            )}

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">Back</Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next â</Button>
            </div>
          </div>
        );
      case 4: // Profile Content (Photos, etc.)
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Add Your Photos</h2>
             {/* Photo Upload */}
            <div>
              <Label>Upload Profile Photos (Min 2, Max 10)</Label>
              {validationErrors.photos && <p className="text-red-400 text-sm">{validationErrors.photos}</p>}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                {photoFiles.map((file, index) => (<div key={index} className="relative aspect-square"><img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-lg" /><button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold">Ã</button></div>))}
                {photoFiles.length < 10 && (<label className="aspect-square border-2 border-dashed border-brand-primary/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors"><input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" /><span className="text-brand-primary text-4xl">+</span></label>)}
              </div>
            </div>
            
            {/* Only show kinks/interests/limits for individual accounts or shared preferences for couples */}
            {isIndividual && (
              <>
                <CheckboxGrid title="My Kinks/Fetishes" options={KINKS_OPTIONS} selected={formData.kinks || []} onToggle={(val) => handleToggle('kinks', val, 10)} max={10} error={validationErrors.kinks} />
                <CheckboxGrid title="Seeking Matches With These Interests" options={INTERESTS_OPTIONS} selected={formData.interests || []} onToggle={(val) => handleToggle('interests', val, 10)} max={10} error={validationErrors.interests} />
                <CheckboxGrid title="My Soft Limits" options={LIMITS_OPTIONS} selected={formData.softLimits || []} onToggle={(val) => handleToggle('softLimits', val, 10)} max={10} error={validationErrors.softLimits} />
                <CheckboxGrid title="My Hard Limits" options={LIMITS_OPTIONS} selected={formData.hardLimits || []} onToggle={(val) => handleToggle('hardLimits', val, 10)} max={10} error={validationErrors.hardLimits} />
                <div className="space-y-2"><Label>My Safety/Health Practices</Label><Textarea name="safetyPractices" value={formData.safetyPractices} onChange={handleInputChange} rows={3} /></div>
                <div className="space-y-2"><Label>My Rules (Optional)</Label><Textarea name="rules" value={formData.rules} onChange={handleInputChange} rows={3} /></div>
                
                {/* Seeking Preferences - moved from Step 1 */}
                <TagMultiSelect title="Seeking" options={SEEKING_OPTIONS} selected={formData.seeking || []} onToggle={(val) => handleToggle('seeking', val)} />
                <TagMultiSelect title="Seeking Relationship Type" options={SEEKING_RELATIONSHIP_TYPE_OPTIONS} selected={formData.seekingRelationshipType || []} onToggle={(val) => handleToggle('seekingRelationshipType', val)} />
                <Select label="Lifestyle Experience Level" name="lifestyleExperience" value={String(formData.lifestyleExperience || 'New')} onChange={handleInputChange} options={EXPERIENCE_LEVEL_OPTIONS} />
              </>
            )}

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">Back</Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next â</Button>
            </div>
          </div>
        );
      case 5: // Match Preferences
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Fine-tune Your Match Preferences</h2>
            <div className='space-y-2'>
                <div className="flex justify-between items-center">
                    <Label className='mb-0'>Preferred Age Range</Label>
                    <span className="text-brand-secondary font-semibold">{formData.matchPreferences!.ageRange[0]} - {formData.matchPreferences!.ageRange[1]}</span>
                </div>
                <div className='flex gap-4 items-center'>
                    <span>Min:</span>
                    <input type="range" min={18} max={99} value={formData.matchPreferences!.ageRange[0]} onChange={(e) => setFormData(p => ({...p, matchPreferences: {...p.matchPreferences!, ageRange: [Number(e.target.value), Math.max(Number(e.target.value), p.matchPreferences!.ageRange[1])]}}))} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-thumb" />
                </div>
                 <div className='flex gap-4 items-center'>
                    <span>Max:</span>
                    <input type="range" min={18} max={99} value={formData.matchPreferences!.ageRange[1]} onChange={(e) => setFormData(p => ({...p, matchPreferences: {...p.matchPreferences!, ageRange: [Math.min(Number(e.target.value), p.matchPreferences!.ageRange[0]), Number(e.target.value)]}}))} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-thumb" />
                </div>
            </div>
            <TagMultiSelect title="Preferred Genders" options={GENDER_OPTIONS} selected={formData.matchPreferences!.genders} onToggle={(val) => setFormData(p => ({...p, matchPreferences: {...p.matchPreferences!, genders: p.matchPreferences!.genders.includes(val) ? p.matchPreferences!.genders.filter(v=>v!==val) : [...p.matchPreferences!.genders, val]}}))} />
            <TagMultiSelect title="Preferred Sexualities" options={SEXUALITY_OPTIONS} selected={formData.matchPreferences!.sexualities} onToggle={(val) => setFormData(p => ({...p, matchPreferences: {...p.matchPreferences!, sexualities: p.matchPreferences!.sexualities.includes(val) ? p.matchPreferences!.sexualities.filter(v=>v!==val) : [...p.matchPreferences!.sexualities, val]}}))} />
            <TagMultiSelect title="Searching For" options={['Individual', 'Couple', 'Both']} selected={formData.matchPreferences!.searchingFor} onToggle={(val) => setFormData(p => ({...p, matchPreferences: {...p.matchPreferences!, searchingFor: p.matchPreferences!.searchingFor.includes(val) ? p.matchPreferences!.searchingFor.filter(v=>v!==val) : [...p.matchPreferences!.searchingFor, val]}}))} />
            <Slider label="Distance Preference" min={0} max={200} unit=" miles" value={formData.matchPreferences!.distance} onChange={(e) => setFormData(p => ({...p, matchPreferences: {...p.matchPreferences!, distance: Number(e.target.value)}}))} />
            <TagMultiSelect title="Experience Level Preference" options={EXPERIENCE_LEVEL_OPTIONS} selected={formData.matchPreferences!.experienceLevels} onToggle={(val) => setFormData(p => ({...p, matchPreferences: {...p.matchPreferences!, experienceLevels: p.matchPreferences!.experienceLevels.includes(val) ? p.matchPreferences!.experienceLevels.filter(v=>v!==val) : [...p.matchPreferences!.experienceLevels, val]}}))} />

            <div className="flex justify-between items-center bg-black/50 p-3 rounded-lg"><Label className='mb-0'>Verified Profiles Only</Label><input type="checkbox" className="toggle" checked={formData.matchPreferences!.verifiedOnly} onChange={(e) => setFormData(p => ({...p, matchPreferences: {...p.matchPreferences!, verifiedOnly: e.target.checked}}))} /></div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">Back</Button>
              <Button onClick={nextStep} className="flex-1">Continue â</Button>
            </div>
          </div>
        );
      case 6: // Membership
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Choose Your Membership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-lg border-2 ${formData.membershipTier === 'basic' ? 'border-brand-primary' : 'border-base-300'}`}>
                    <h3 className="text-xl font-bold">Freemium - Basic</h3>
                    <ul className="list-disc list-inside my-4 space-y-2 text-text-secondary">
                        <li>â Basic features</li>
                        <li className="line-through">â Limited visibility</li>
                        <li className="line-through">â No priority matching</li>
                    </ul>
                    <Button 
  onClick={() => setFormData(p => ({...p, membershipTier: 'basic'}))} 
  variant={formData.membershipTier === 'basic' ? 'primary' : 'outline'}
>
  Stay Basic
</Button>
                </div>
                 <div className={`p-6 rounded-lg border-2 ${formData.membershipTier === 'vip' ? 'border-brand-primary' : 'border-base-300'}`}>
                    <h3 className="text-xl font-bold text-brand-secondary">ð VIP Membership</h3>
                    <ul className="list-disc list-inside my-4 space-y-2 text-text-primary">
                        <li>ð All features unlocked</li>
                        <li>ð Priority match visibility</li>
                        <li>ð¬ Unlimited messages</li>
                        <li>ð Access to VIP-only events</li>
                    </ul>
                    <p className="text-center font-bold text-2xl my-4">$24.99 / month</p>
                    <Button 
  onClick={() => setFormData(p => ({...p, membershipTier: 'vip'}))} 
  variant={formData.membershipTier === 'vip' ? 'primary' : 'outline'}
>
  Upgrade to VIP
</Button>
                </div>
            </div>
            <p className="text-center text-text-secondary text-sm">You can upgrade anytime in Settings.</p>
            {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}
            <Button onClick={handleSubmit} isLoading={loading} className="w-full">{loading ? 'Saving...' : `Complete ${isIndividual ? 'My' : 'Our'} Profile ð`}</Button>
          </div>
        );
      default: return null;
    }
  }

  const progress = useMemo(() => {
    if (step === 0) return 0;
    const totalSteps = accountType === 'individual' ? 6 : 6; // Both have 6 steps now with About Me/About Us
    return (step / totalSteps) * 100;
  }, [step, accountType]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100">
      <style>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #ff1493;
          cursor: pointer;
          border-radius: 50%;
        }
        .range-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #ff1493;
          cursor: pointer;
          border-radius: 50%;
        }
        .toggle {
          appearance: none;
          width: 40px;
          height: 22px;
          background: #2d2d2d;
          border-radius: 9999px;
          position: relative;
          transition: background-color 0.2s;
        }
        .toggle:checked {
          background: #ff1493;
        }
        .toggle::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .toggle:checked::before {
          transform: translateX(18px);
        }
      `}</style>
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})`, filter: 'blur(2px)', transform: 'scale(1.1)' }} />
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto p-8 bg-black/70 rounded-2xl border-2 border-brand-primary/60 shadow-lg shadow-brand-primary/20 backdrop-blur-sm animate-fade-in">

          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold" style={{ background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(255, 20, 147, 0.5)' }}>SPICE</h1>
          </div>

          {step > 0 && (
              <div className="mb-8">
                  <div className="w-full bg-base-300 rounded-full h-2.5">
                      <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                  </div>
              </div>
            )}


          {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-white">How would you like to create your account?</h2>
                  <p className="text-text-secondary">Choose the option that best fits your situation</p>
                </div>
                
                <div className="space-y-4 max-w-3xl mx-auto">
                  {/* Individual Account */}
                  <button
                    onClick={() => setAccountType('individual')}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      accountType === 'individual'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-brand-primary/30 hover:border-brand-primary/60 bg-black/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">👤</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Individual Account</h3>
                        <p className="text-sm text-gray-400 mb-2">Single user, single login</p>
                        <p className="text-sm text-gray-300 mb-3">I'm creating a profile for myself</p>
                        <div className="flex items-center gap-2 text-sm text-brand-secondary">
                          <span className="text-brand-primary">✓</span>
                          <span>Invite partners later to link and appear as a couple while keeping full independence</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Couple Shared Account */}
                  <button
                    onClick={() => setAccountType('couple')}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      accountType === 'couple'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-brand-primary/30 hover:border-brand-primary/60 bg-black/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">👫</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Couple Shared Account</h3>
                        <p className="text-sm text-gray-400 mb-2">One profile, two separate login emails</p>
                        <p className="text-sm text-gray-300 mb-3">We want one shared profile that we both can access</p>
                        <div className="flex items-center gap-2 text-sm text-brand-secondary">
                          <span className="text-brand-primary">✓</span>
                          <span>Both partners can log in with their own email/password</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="text-center mt-8">
                  <Button onClick={nextStep} disabled={!accountType} className="min-w-[200px]">
                    Continue →
                  </Button>
                </div>
              </div>
            )}
          {step > 0 && <div className="animate-fade-in">{renderStepContent()}</div>}

        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
        <KinkQuiz
          onClose={() => setShowQuiz(false)}
          onSaveResults={handleQuizComplete}
          existingResults={currentQuizPartner === 'individual' ? formData.kinkQuizResults : 
                          currentQuizPartner === 'partner1' ? formData.partner1QuizResults : 
                          formData.partner2QuizResults}
        />
      )}
    </div>
  );
};
