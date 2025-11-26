// src/pages/ProfileSetup.tsx - ENHANCED WORKFLOW VERSION
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

// Step 1: Basic Info
const GENDER_OPTIONS: string[] = ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Other'];
const SEXUALITY_OPTIONS: string[] = ['Straight', 'Bisexual', 'Gay', 'Pansexual', 'Queer', 'Asexual', 'Other'];

// Step 2: Relationship Context
const RELATIONSHIP_CONTEXT_OPTIONS: string[] = [
  'Single',
  'Single but in a Relationship',
  'Married but Using the App Solo',
  'Partnered (Using App Independently)',
  'Solo Poly (Has Partners)',
  'In a Polycule / Multi-Partner Network'
];

// Step 3: Lifestyle Identity
const LIFESTYLE_IDENTITY_OPTIONS: string[] = [
  'Swinger',
  'ENM',
  'Poly',
  'BDSM/Kink',
  'Exploring / Not Sure Yet'
];

// Step 4: Deep Relationship Structure
const ENM_POLY_STRUCTURE_OPTIONS: string[] = [
  'Open Relationship',
  'Hierarchical Poly',
  'Non-Hierarchical Poly',
  'Solo Poly',
  'Triad / Quad / V-Structure',
  'Relationship Anarchy'
];

const SWINGER_STRUCTURE_OPTIONS: string[] = [
  'Attached Single',
  'Couple-Friendly',
  'Solo Play Only',
  'Hotwife / Stag & Vixen',
  'Bull / Unicorn'
];

const BDSM_ROLE_OPTIONS: string[] = [
  'Dominant',
  'Submissive',
  'Switch',
  'D/s Dynamic (Partnered)',
  'Owned/Collared (Allowed to Play)',
  'Play-Only Roles (Top/Bottom/Rigger/Pet, etc.)'
];

// Step 5: Intent
const INTENT_OPTIONS: string[] = [
  'Dating',
  'Play partners',
  'Meeting couples',
  'Meeting singles',
  'Poly expansion',
  'Social / events',
  'Education',
  'Digital-only connections'
];

// Step 6: Boundaries
const COMFORTABLE_MEETING_OPTIONS: string[] = [
  'Singles',
  'Couples',
  'Groups / polycules'
];

const COMFORT_ENVIRONMENTS_OPTIONS: string[] = [
  'Public events',
  'Private gatherings',
  'Online-only'
];

// Step 7: What You're Seeking
const SEEKING_DETAILED_OPTIONS: string[] = [
  'Friendship',
  'Play partners',
  'Ongoing/regular play',
  'Poly relationships',
  'Triad exploration',
  'Quad exploration',
  'ENM exploration',
  'Poly expansion',
  'Mentorship',
  'Event companions',
  'Travel companions',
  'Kink/BDSM exploration',
  'D/s dynamics',
  'Service-oriented dynamics',
  'Sensual/tantric connection',
  'Group connection',
  'Community network',
  'Undecided'
];

const POLY_ROLE_OPTIONS: string[] = [
  'Building a new polycule',
  'Joining an existing polycule',
  'Expanding current polycule',
  'Dating multiple independently',
  'Other'
];

// Step 8: Who You Want to Meet
const INTERESTED_IN_TYPES_OPTIONS: string[] = [
  'Singles',
  'Couples',
  'Groups',
  'Polycules',
  'Event hosts'
];

const COUPLE_PREF_OPTIONS: string[] = [
  'M/F (female only or both)',
  'M/F (both partners)',
  'F/F (both or only one F partner)',
  'F/F (both)',
  'M/M (both or only one M partner)',
  'M/M (both)',
  'NB-inclusive',
  'Any'
];

const COUPLE_INTERACTION_OPTIONS: string[] = [
  'Only together (play with both)',
  'With one partner only',
  'Either (open to both together and 1 at a time)',
  'Not sure'
];

const GROUP_TYPES_OPTIONS: string[] = [
  'Other couples',
  'Multiple men',
  'Mixture of both'
];

const POLYCULE_PREFERENCES_OPTIONS: string[] = [
  'Open to joining an existing polycule',
  'Want to build a closed triad',
  'Want to build a closed quad',
  'Want a large, interconnected polycule',
  'Want kitchen-table poly (everyone hangs out)',
  'Want garden-party poly (occasional group hangs)',
  'Want parallel poly (partners don\'t meet)',
  'Want a nesting polycule (eventually live together)',
  'Want solo-poly with occasional group connection',
  'Want a comet / long-distance polycule',
  'Open to anything',
  'Not seeking a polycule'
];

// Existing constants from old version
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

const LIMITS_OPTIONS: string[] = ['Scat', 'Blood Play', 'Illegal Activities', 'Permanent Marks', 'Breath Play', 'Findom', 'Needles', 'Vomit', 'Hard Insults', 'Public Humiliation', 'Animals', 'Underage', 'Non-Consensual', 'Weapon Play', 'Fire Play', 'Edge Play', 'Race Play', 'Intercourse', 'Oral Sex', 'No Condoms', 'Overnights', 'Intoxication', 'Face Slapping', 'Choking', 'Gagging'];

const EXPERIENCE_LEVEL_OPTIONS = ['New', 'Beginner', 'Moderate', 'Advanced'];

// Physical stats constants
const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const feet = Math.floor((i + 48) / 12);
  const inches = (i + 48) % 12;
  return `${feet}'${inches}"`;
});

const WEIGHT_OPTIONS = Array.from({ length: 76 }, (_, i) => `${75 + i * 5} lbs`);
const BODY_TYPE_OPTIONS = ['Slim', 'Average', 'Dad Bod', 'Curvy', 'Fit', 'Thick', 'BBW'];
const HAIR_COLOR_OPTIONS = ['Bald', 'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Silver', 'Dyed - unnatural colors', 'Dyed - natural colors', 'Salt and Pepper'];
const EYE_COLOR_OPTIONS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet', 'Two different colors', 'Black'];
const FACIAL_HAIR_OPTIONS = ['Yes', 'No', "Doesn't Apply"];
const ETHNICITY_OPTIONS = ['White/Caucasian', 'Black/African American', 'Hispanic/Latino', 'Asian', 'Native American', 'Middle Eastern', 'South Asian', 'Pacific Islander', 'Mixed/Multiple', 'Other'];
const YES_NO_OPTIONS = ['Yes', 'No'];
const BODY_HAIR_OPTIONS = ['Smooth/shaved', 'Lightly trimmed', 'Natural', 'Hairy', 'Very hairy'];
const GROOMING_STYLE_OPTIONS = ['Fully shaved', 'Well-groomed', 'Natural', 'Casual', 'Wild/untamed'];
const BIRTH_CONTROL_OPTIONS = ['Not applicable', 'None', 'Condoms', 'Birth control pills', 'IUD', 'Implant', 'Shot', 'Vasectomy', 'Tubal ligation', 'Other'];
const CAN_HOST_OPTIONS = ['Yes', 'No', 'Possibly'];

// --- HELPER COMPONENTS ---
const CheckboxGrid = ({ title, options, selected, onToggle, max, error }: { title: string; options: string[]; selected: string[]; onToggle: (option: string) => void; max?: number, error?: string }) => (
  <div className="space-y-2">
    <Label>{title} {max && `(Max ${max})`}</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {options.map((option) => (
        <button 
          key={option} 
          type="button" 
          onClick={() => onToggle(option)} 
          disabled={Boolean(max && !selected.includes(option) && selected.length >= max)}
          className={`py-2 px-3 text-sm rounded-lg text-left transition-all ${
            selected.includes(option) 
              ? 'bg-brand-primary text-white font-semibold' 
              : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
          } ${max && !selected.includes(option) && selected.length >= max ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {option}
        </button>
      ))}
    </div>
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

const Select = ({ label, value, onChange, options, placeholder, required, name }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[], placeholder?: string, required?: boolean, name?: string }) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <select value={value} onChange={onChange} name={name} required={required} className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors">
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

// --- HELPER FUNCTIONS ---
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

  const [formData, setFormData] = useState<Partial<Profile>>({
    accountType: accountType || 'individual',
    displayName: '',
    location: '',
    dateOfBirth: '',
    bio: '',
    photos: [],
    gender: '',
    orientation: '',
    
    // New enhanced workflow fields
    relationshipContext: '',
    partnerAlignment: [],
    consentConfirmed: false,
    lifestyleIdentities: [],
    enmPolyStructure: [],
    swingerStructure: [],
    bdsmRoles: [],
    intentHereFor: [],
    comfortableMeeting: [],
    comfortEnvironments: [],
    negotiationComfort: '',
    autonomyLevel: '',
    seekingDetailed: [],
    polyRole: '',
    interestedInGenders: [],
    interestedInTypes: [],
    couplePref: [],
    coupleInteraction: '',
    coupleInteractionGenders: [],
    singlesGenders: [],
    groupTypes: [],
    polyculePreferences: [],
    
    // Existing fields for role/kink steps
    topRoles: [],
    lifestyleExperience: 'New',
    interestedKinks: [],
    kinkQuizResults: {},
    softLimits: [],
    hardLimits: [],
    safetyPractices: '',
    rules: '',
    
    // Couples fields
    displayName2: '',
    gender2: '',
    orientation2: '',
    age2: 18,
    partner1Role: '',
    partner1QuizResults: {},
    partner1Experience: 'New',
    partner1Kinks: [],
    partner1SoftLimits: [],
    partner1HardLimits: [],
    partner1SafetyPractices: '',
    partner1Rules: '',
    partner2Role: '',
    partner2QuizResults: {},
    partner2Experience: 'New',
    partner2Kinks: [],
    partner2SoftLimits: [],
    partner2HardLimits: [],
    partner2SafetyPractices: '',
    partner2Rules: '',
    
    // Physical stats
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
    
    // Partner stats
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

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<string, number>>({});
  const [currentQuizPartner, setCurrentQuizPartner] = useState<'individual' | 'partner1' | 'partner2'>('individual');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let finalValue: any = value;
    
    if (name === 'dateOfBirth') {
      let digits = value.replace(/\D/g, '');
      if (digits.length >= 2) {
        digits = digits.slice(0, 2) + '/' + digits.slice(2);
      }
      if (digits.length >= 5) {
        digits = digits.slice(0, 5) + '/' + digits.slice(5, 9);
      }
      finalValue = digits;
    } else if (type === 'number') {
      finalValue = parseInt(value as string, 10);
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handlePartnerChange = (partner: 'partner1' | 'partner2', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const fieldMapping: any = {
        partner1: { displayName: 'displayName', gender: 'gender', sexuality: 'orientation', age: 'age' },
        partner2: { displayName: 'displayName2', gender: 'gender2', sexuality: 'orientation2', age: 'age2' },
    };
    const mapped = fieldMapping[partner]?.[name];
    if (!mapped) {
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

  const handlePartnerStatsChange = (partner: 'partner1' | 'partner2', field: string, value: string | boolean) => {
    const fieldName = `${partner}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Profile;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 10) {
      setValidationErrors(prev => ({ ...prev, photos: 'You can upload a maximum of 10 photos' }));
      return;
    }
    setPhotoFiles(prev => [...prev, ...files]);
    setValidationErrors(prev => ({ ...prev, photos: '' }));
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuizComplete = (results: Record<string, number>) => {
    if (currentQuizPartner === 'individual') {
      setFormData(prev => ({ ...prev, kinkQuizResults: results }));
      setQuizResults(results);
    } else if (currentQuizPartner === 'partner1') {
      setFormData(prev => ({ ...prev, partner1QuizResults: results }));
    } else if (currentQuizPartner === 'partner2') {
      setFormData(prev => ({ ...prev, partner2QuizResults: results }));
    }
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!accountType) throw new Error('Account type not selected');

      if (!formData.displayName || !formData.location) {
        throw new Error('Please fill out display name and location');
      }

      if (photoFiles.length < 2) {
          throw new Error('Please upload at least 2 photos');
      }

      const uploadedUrls: string[] = [];

      for (const file of photoFiles) {
        const filePath = `${user?.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);
        if (!publicUrlData?.publicUrl) throw new Error('Failed to get uploaded photo URL');

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setPhotoUrls(uploadedUrls);

      const safeMatchPreferences = {
        ageRange: formData.matchPreferences?.ageRange || [18, 55],
        genders: formData.matchPreferences?.genders || [],
        sexualities: formData.matchPreferences?.sexualities || [],
        searchingFor: formData.matchPreferences?.searchingFor || [],
        distance: typeof formData.matchPreferences?.distance === 'number' ? formData.matchPreferences!.distance : 50,
        vipOnly: !!formData.matchPreferences?.vipOnly,
        verifiedOnly: !!formData.matchPreferences?.verifiedOnly,
        experienceLevels: formData.matchPreferences?.experienceLevels || [],
      };

      const finalProfileData: Profile = {
          displayName: String(formData.displayName || ''),
          displayName2: String(formData.displayName2 || ''),
          location: String(formData.location || ''),
          age: formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : Number(formData.age || 18),
          age2: Number(formData.age2 || 18),
          dateOfBirth: String(formData.dateOfBirth || ''),
          bio: String(formData.bio || ''),
          photos: uploadedUrls,
          gender: String(formData.gender || ''),
          gender2: String(formData.gender2 || ''),
          orientation: String(formData.orientation || ''),
          orientation2: String(formData.orientation2 || ''),
          matchPreferences: safeMatchPreferences,
          membershipTier: String(formData.membershipTier || 'basic'),
          accountType: accountType || 'individual',
          
          // New enhanced workflow fields
          relationshipContext: String(formData.relationshipContext || ''),
          partnerAlignment: formData.partnerAlignment || [],
          consentConfirmed: Boolean(formData.consentConfirmed),
          lifestyleIdentities: formData.lifestyleIdentities || [],
          enmPolyStructure: formData.enmPolyStructure || [],
          swingerStructure: formData.swingerStructure || [],
          bdsmRoles: formData.bdsmRoles || [],
          intentHereFor: formData.intentHereFor || [],
          comfortableMeeting: formData.comfortableMeeting || [],
          comfortEnvironments: formData.comfortEnvironments || [],
          negotiationComfort: String(formData.negotiationComfort || ''),
          autonomyLevel: String(formData.autonomyLevel || ''),
          seekingDetailed: formData.seekingDetailed || [],
          polyRole: String(formData.polyRole || ''),
          interestedInGenders: formData.interestedInGenders || [],
          interestedInTypes: formData.interestedInTypes || [],
          couplePref: formData.couplePref || [],
          coupleInteraction: String(formData.coupleInteraction || ''),
          coupleInteractionGenders: formData.coupleInteractionGenders || [],
          singlesGenders: formData.singlesGenders || [],
          groupTypes: formData.groupTypes || [],
          polyculePreferences: formData.polyculePreferences || [],
          
          // Existing fields
          topRoles: formData.topRoles || [],
          lifestyleExperience: String(formData.lifestyleExperience || 'New'),
          interestedKinks: formData.interestedKinks || [],
          kinkQuizResults: formData.kinkQuizResults || {},
          softLimits: formData.softLimits || [],
          hardLimits: formData.hardLimits || [],
          safetyPractices: String(formData.safetyPractices || ''),
          rules: String(formData.rules || ''),
          
          // Couples fields
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
          
          // Physical stats
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
          
          // Partner stats
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

      const response = await completeProfileSetup(finalProfileData);
      if (response.error) {
        throw new Error(response.error);
      }

    } catch (err: any) {
      console.error('Profile submit failed:', err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Determine if we need to show certain conditional steps based on selections
  const shouldShowPartnerAlignment = useMemo(() => {
    return formData.relationshipContext && [
      'Partnered (Using App Independently)',
      'Solo Poly (Has Partners)',
      'In a Polycule / Multi-Partner Network'
    ].includes(formData.relationshipContext);
  }, [formData.relationshipContext]);

  const shouldShowConsentCheck = useMemo(() => {
    return formData.relationshipContext === 'Married but Using the App Solo';
  }, [formData.relationshipContext]);

  // Dynamic routing for Step 4
  const needsEnmPolyStructure = useMemo(() => {
    return formData.lifestyleIdentities?.includes('ENM') || formData.lifestyleIdentities?.includes('Poly');
  }, [formData.lifestyleIdentities]);

  const needsSwingerStructure = useMemo(() => {
    return formData.lifestyleIdentities?.includes('Swinger');
  }, [formData.lifestyleIdentities]);

  const needsBdsmStructure = useMemo(() => {
    return formData.lifestyleIdentities?.includes('BDSM/Kink');
  }, [formData.lifestyleIdentities]);

  const canProceed = useMemo(() => {
    const isIndividual = accountType === 'individual';
    
    switch (step) {
      case 0: // Account type selection
        return accountType !== null;
        
      case 1: // Basic Info
        if (isIndividual) {
          return Boolean(
            formData.displayName &&
            formData.location &&
            formData.gender &&
            formData.orientation &&
            formData.dateOfBirth &&
            validateDateOfBirth(String(formData.dateOfBirth))
          );
        } else {
          return Boolean(
            formData.displayName &&
            formData.displayName2 &&
            formData.location &&
            formData.gender &&
            formData.gender2 &&
            formData.orientation &&
            formData.orientation2 &&
            Number(formData.age) >= 18 &&
            Number(formData.age2) >= 18
          );
        }
        
      case 2: // Relationship Context
        if (!formData.relationshipContext) return false;
        if (shouldShowPartnerAlignment && (!formData.partnerAlignment || formData.partnerAlignment.length === 0)) return false;
        if (shouldShowConsentCheck && !formData.consentConfirmed) return false;
        return true;
        
      case 3: // Lifestyle Identity
        return Boolean(formData.lifestyleIdentities && formData.lifestyleIdentities.length > 0);
        
      case 4: // Deep Relationship Structure
        if (needsEnmPolyStructure && (!formData.enmPolyStructure || formData.enmPolyStructure.length === 0)) return false;
        if (needsSwingerStructure && (!formData.swingerStructure || formData.swingerStructure.length === 0)) return false;
        if (needsBdsmStructure && (!formData.bdsmRoles || formData.bdsmRoles.length === 0)) return false;
        return true;
        
      case 5: // Intent
        return Boolean(formData.intentHereFor && formData.intentHereFor.length > 0);
        
      case 6: // Boundaries
        return Boolean(
          formData.comfortableMeeting && formData.comfortableMeeting.length > 0 &&
          formData.comfortEnvironments && formData.comfortEnvironments.length > 0
        );
        
      case 7: // What You're Seeking
        return Boolean(formData.seekingDetailed && formData.seekingDetailed.length > 0);
        
      case 8: // Who You Want to Meet
        if (!formData.interestedInTypes || formData.interestedInTypes.length === 0) return false;
        // Add conditional validations based on selections
        if (formData.interestedInTypes.includes('Couples')) {
          if (!formData.couplePref || formData.couplePref.length === 0) return false;
          if (!formData.coupleInteraction) return false;
          if (formData.coupleInteraction === 'With one partner only' && (!formData.coupleInteractionGenders || formData.coupleInteractionGenders.length === 0)) return false;
        }
        if (formData.interestedInTypes.includes('Singles')) {
          if (!formData.singlesGenders || formData.singlesGenders.length === 0) return false;
        }
        if (formData.interestedInTypes.includes('Groups')) {
          if (!formData.groupTypes || formData.groupTypes.length === 0) return false;
        }
        if (formData.interestedInTypes.includes('Polycules')) {
          if (!formData.polyculePreferences || formData.polyculePreferences.length === 0) return false;
        }
        return true;
        
      case 9: // Role & Kink Preferences
        if (isIndividual) {
          return Boolean((formData.topRoles && formData.topRoles.length >= 1) || Object.keys(formData.kinkQuizResults || {}).length > 0);
        } else {
          return Boolean(formData.partner1Role && formData.partner2Role);
        }
        
      case 10: // About Me/Us + Physical Stats
        return Boolean(formData.bio) && (String(formData.bio).length >= 69 && String(formData.bio).length <= 1000);
        
      case 11: // Photos
        return photoFiles.length >= 2;
        
      case 12: // Match Preferences
        return true; // Optional
        
      case 13: // Membership
        return true;
        
      default:
        return false;
    }
  }, [step, formData, photoFiles, accountType, shouldShowPartnerAlignment, shouldShowConsentCheck, needsEnmPolyStructure, needsSwingerStructure, needsBdsmStructure]);

  const renderStepContent = () => {
    const isIndividual = accountType === 'individual';

    // STEP 0: Account Type Selection
    if (step === 0) {
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Choose Your Account Type</h2>
          <p className="text-text-secondary text-center mb-8">Select the option that best describes you</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => {
                setAccountType('individual');
                setFormData(prev => ({ ...prev, accountType: 'individual' }));
              }}
              className={`p-8 rounded-xl border-2 transition-all text-left ${
                accountType === 'individual'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
              }`}
            >
              <h3 className="text-2xl font-bold text-white mb-2">👤 Individual</h3>
              <p className="text-text-secondary">I'm creating a profile for myself</p>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setAccountType('couple');
                setFormData(prev => ({ ...prev, accountType: 'couple' }));
              }}
              className={`p-8 rounded-xl border-2 transition-all text-left ${
                accountType === 'couple'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
              }`}
            >
              <h3 className="text-2xl font-bold text-white mb-2">👫 Couple</h3>
              <p className="text-text-secondary">We're creating a profile together</p>
            </button>
          </div>
          
          <Button onClick={nextStep} disabled={!canProceed} className="w-full mt-8">
            Continue →
          </Button>
        </div>
      );
    }

    // STEP 1: Basic Info
    if (step === 1) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            {isIndividual ? 'Tell us about yourself' : 'Meet the Two of You!'}
          </h2>
          
          {isIndividual ? (
            <>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input name="displayName" value={formData.displayName} onChange={handleInputChange} required />
              </div>
              
              <div className="space-y-2">
                <Label>Location (City, State)</Label>
                <Input 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Los Angeles, CA" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                  label="Gender" 
                  name="gender" 
                  value={String(formData.gender || '')} 
                  onChange={handleInputChange} 
                  options={GENDER_OPTIONS} 
                  placeholder="Select..." 
                  required 
                />
                <Select 
                  label="Sexuality" 
                  name="orientation" 
                  value={String(formData.orientation || '')} 
                  onChange={handleInputChange} 
                  options={SEXUALITY_OPTIONS} 
                  placeholder="Select..." 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Date of Birth (MM/DD/YYYY)</Label>
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
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Location (City, State)</Label>
                <Input name="location" value={formData.location} onChange={handleInputChange} required />
              </div>
              
              <div className="p-4 border border-brand-primary/30 rounded-lg">
                <h3 className="font-semibold text-lg text-brand-secondary mb-2">Partner 1</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input name="displayName" value={formData.displayName} onChange={(e) => handlePartnerChange('partner1', e)} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select 
                      label="Gender" 
                      name="gender" 
                      value={String(formData.gender || '')} 
                      onChange={(e) => handlePartnerChange('partner1', e)} 
                      options={GENDER_OPTIONS} 
                      placeholder="Select..." 
                      required 
                    />
                    <Select 
                      label="Sexuality" 
                      name="sexuality" 
                      value={String(formData.orientation || '')} 
                      onChange={(e) => handlePartnerChange('partner1', e)} 
                      options={SEXUALITY_OPTIONS} 
                      placeholder="Select..." 
                      required 
                    />
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input name="age" type="number" min="18" max="99" value={formData.age} onChange={(e) => handlePartnerChange('partner1', e)} required />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-brand-primary/30 rounded-lg">
                <h3 className="font-semibold text-lg text-brand-secondary mb-2">Partner 2</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input name="displayName2" value={formData.displayName2} onChange={(e) => handlePartnerChange('partner2', e)} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select 
                      label="Gender" 
                      name="gender" 
                      value={String(formData.gender2 || '')} 
                      onChange={(e) => handlePartnerChange('partner2', e)} 
                      options={GENDER_OPTIONS} 
                      placeholder="Select..." 
                      required 
                    />
                    <Select 
                      label="Sexuality" 
                      name="sexuality" 
                      value={String(formData.orientation2 || '')} 
                      onChange={(e) => handlePartnerChange('partner2', e)} 
                      options={SEXUALITY_OPTIONS} 
                      placeholder="Select..." 
                      required 
                    />
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input name="age" type="number" min="18" max="99" value={formData.age2} onChange={(e) => handlePartnerChange('partner2', e)} required />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 2: Relationship Context
    if (step === 2) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Relationship Context</h2>
          <p className="text-text-secondary text-center mb-4">Which describes your real-life relationship situation?</p>
          
          <TagMultiSelect
            title="Select Your Relationship Context"
            options={RELATIONSHIP_CONTEXT_OPTIONS}
            selected={formData.relationshipContext ? [formData.relationshipContext] : []}
            onToggle={(val) => setFormData(prev => ({ ...prev, relationshipContext: val }))}
          />
          
          {shouldShowPartnerAlignment && (
            <div className="p-4 border border-brand-primary/30 rounded-lg mt-4">
              <h3 className="text-brand-secondary font-semibold mb-2">Partner Alignment</h3>
              <p className="text-sm text-text-secondary mb-3">
                Please confirm alignment questions with your partner(s):
              </p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.partnerAlignment?.includes('aware_of_profile') || false}
                    onChange={(e) => {
                      const current = formData.partnerAlignment || [];
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, partnerAlignment: [...current, 'aware_of_profile'] }));
                      } else {
                        setFormData(prev => ({ ...prev, partnerAlignment: current.filter(x => x !== 'aware_of_profile') }));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-white">My partner(s) are aware of this profile</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.partnerAlignment?.includes('consent_given') || false}
                    onChange={(e) => {
                      const current = formData.partnerAlignment || [];
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, partnerAlignment: [...current, 'consent_given'] }));
                      } else {
                        setFormData(prev => ({ ...prev, partnerAlignment: current.filter(x => x !== 'consent_given') }));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-white">I have consent to use this app</span>
                </label>
              </div>
            </div>
          )}
          
          {shouldShowConsentCheck && (
            <div className="p-4 border border-yellow-400/50 rounded-lg mt-4 bg-yellow-400/10">
              <h3 className="text-yellow-400 font-semibold mb-2">Consent Check</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.consentConfirmed || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, consentConfirmed: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-white">I confirm that I have discussed this with my spouse and have their consent</span>
              </label>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 3: Lifestyle Identity Selection
    if (step === 3) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Lifestyle Identity</h2>
          <p className="text-text-secondary text-center mb-4">Which communities best represent you?</p>
          <p className="text-sm text-text-secondary text-center mb-6">(You can select multiple)</p>
          
          <CheckboxGrid
            title="Select All That Apply"
            options={LIFESTYLE_IDENTITY_OPTIONS}
            selected={formData.lifestyleIdentities || []}
            onToggle={(val) => handleToggle('lifestyleIdentities', val)}
          />
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 4: Deep Relationship Structure (Adaptive)
    if (step === 4) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Relationship Structure</h2>
          <p className="text-text-secondary text-center mb-4">Tell us more about your relationship preferences</p>
          
          {needsEnmPolyStructure && (
            <CheckboxGrid
              title="ENM / Poly Structure"
              options={ENM_POLY_STRUCTURE_OPTIONS}
              selected={formData.enmPolyStructure || []}
              onToggle={(val) => handleToggle('enmPolyStructure', val)}
            />
          )}
          
          {needsSwingerStructure && (
            <CheckboxGrid
              title="Swinger Structure"
              options={SWINGER_STRUCTURE_OPTIONS}
              selected={formData.swingerStructure || []}
              onToggle={(val) => handleToggle('swingerStructure', val)}
            />
          )}
          
          {needsBdsmStructure && (
            <CheckboxGrid
              title="BDSM Roles"
              options={BDSM_ROLE_OPTIONS}
              selected={formData.bdsmRoles || []}
              onToggle={(val) => handleToggle('bdsmRoles', val)}
            />
          )}
          
          {!needsEnmPolyStructure && !needsSwingerStructure && !needsBdsmStructure && (
            <p className="text-center text-text-secondary">No additional structure questions needed. Click Next to continue.</p>
          )}
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 5: Intent
    if (step === 5) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">What Are You Here For?</h2>
          <p className="text-text-secondary text-center mb-4">Select all that apply</p>
          
          <CheckboxGrid
            title="Your Intentions"
            options={INTENT_OPTIONS}
            selected={formData.intentHereFor || []}
            onToggle={(val) => handleToggle('intentHereFor', val)}
          />
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 6: Boundaries
    if (step === 6) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Boundaries & Comfort</h2>
          <p className="text-text-secondary text-center mb-4">Help us understand your comfort levels</p>
          
          <CheckboxGrid
            title="Comfortable Meeting"
            options={COMFORTABLE_MEETING_OPTIONS}
            selected={formData.comfortableMeeting || []}
            onToggle={(val) => handleToggle('comfortableMeeting', val)}
          />
          
          <CheckboxGrid
            title="Comfort with Environments"
            options={COMFORT_ENVIRONMENTS_OPTIONS}
            selected={formData.comfortEnvironments || []}
            onToggle={(val) => handleToggle('comfortEnvironments', val)}
          />
          
          {needsBdsmStructure && (
            <div className="space-y-2">
              <Label>Negotiation Comfort Level</Label>
              <select
                name="negotiationComfort"
                value={formData.negotiationComfort || ''}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3"
              >
                <option value="">Select...</option>
                <option value="beginner">Beginner - Need guidance</option>
                <option value="comfortable">Comfortable - Can negotiate clearly</option>
                <option value="experienced">Experienced - Confident in negotiations</option>
              </select>
            </div>
          )}
          
          {(needsEnmPolyStructure) && (
            <div className="space-y-2">
              <Label>Autonomy Level</Label>
              <select
                name="autonomyLevel"
                value={formData.autonomyLevel || ''}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3"
              >
                <option value="">Select...</option>
                <option value="full">Full autonomy in all decisions</option>
                <option value="discuss">Discuss major decisions with partners</option>
                <option value="veto">Partners have veto power</option>
                <option value="varies">Varies by situation</option>
              </select>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 7: What You're Seeking
    if (step === 7) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">What You're Seeking</h2>
          <p className="text-text-secondary text-center mb-4">Select all that interest you</p>
          
          <CheckboxGrid
            title="I'm Looking For"
            options={SEEKING_DETAILED_OPTIONS}
            selected={formData.seekingDetailed || []}
            onToggle={(val) => handleToggle('seekingDetailed', val)}
          />
          
          {formData.seekingDetailed?.includes('Poly expansion') && (
            <div className="p-4 border border-brand-primary/30 rounded-lg mt-4">
              <Label>Preferred Poly Role</Label>
              <select
                name="polyRole"
                value={formData.polyRole || ''}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3 mt-2"
              >
                <option value="">Select...</option>
                {POLY_ROLE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 8: Who You Want to Meet
    if (step === 8) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Who You Want to Meet</h2>
          <p className="text-text-secondary text-center mb-4">Tell us about your preferences</p>
          
          <CheckboxGrid
            title="Interested In"
            options={INTERESTED_IN_TYPES_OPTIONS}
            selected={formData.interestedInTypes || []}
            onToggle={(val) => handleToggle('interestedInTypes', val)}
          />
          
          {/* Conditional: If interested in Singles */}
          {formData.interestedInTypes?.includes('Singles') && (
            <div className="p-4 border border-brand-primary/30 rounded-lg">
              <h3 className="text-brand-secondary font-semibold mb-3">Singles Preferences</h3>
              <CheckboxGrid
                title="Genders Interested In"
                options={GENDER_OPTIONS}
                selected={formData.singlesGenders || []}
                onToggle={(val) => handleToggle('singlesGenders', val)}
              />
            </div>
          )}
          
          {/* Conditional: If interested in Couples */}
          {formData.interestedInTypes?.includes('Couples') && (
            <div className="p-4 border border-brand-primary/30 rounded-lg">
              <h3 className="text-brand-secondary font-semibold mb-3">Couples Preferences</h3>
              
              <CheckboxGrid
                title="Preferred Couple Types"
                options={COUPLE_PREF_OPTIONS}
                selected={formData.couplePref || []}
                onToggle={(val) => handleToggle('couplePref', val)}
              />
              
              <div className="mt-4">
                <Label>How do you prefer to interact with couples?</Label>
                <select
                  name="coupleInteraction"
                  value={formData.coupleInteraction || ''}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3 mt-2"
                >
                  <option value="">Select...</option>
                  {COUPLE_INTERACTION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              
              {formData.coupleInteraction === 'With one partner only' && (
                <div className="mt-4">
                  <CheckboxGrid
                    title="Which Genders?"
                    options={GENDER_OPTIONS}
                    selected={formData.coupleInteractionGenders || []}
                    onToggle={(val) => handleToggle('coupleInteractionGenders', val)}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Conditional: If interested in Groups */}
          {formData.interestedInTypes?.includes('Groups') && (
            <div className="p-4 border border-brand-primary/30 rounded-lg">
              <h3 className="text-brand-secondary font-semibold mb-3">Group Preferences</h3>
              <CheckboxGrid
                title="Group Types"
                options={GROUP_TYPES_OPTIONS}
                selected={formData.groupTypes || []}
                onToggle={(val) => handleToggle('groupTypes', val)}
              />
            </div>
          )}
          
          {/* Conditional: If interested in Polycules */}
          {formData.interestedInTypes?.includes('Polycules') && (
            <div className="p-4 border border-brand-primary/30 rounded-lg">
              <h3 className="text-brand-secondary font-semibold mb-3">Polycule Preferences</h3>
              <CheckboxGrid
                title="What are you looking for?"
                options={POLYCULE_PREFERENCES_OPTIONS}
                selected={formData.polyculePreferences || []}
                onToggle={(val) => handleToggle('polyculePreferences', val)}
              />
            </div>
          )}
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 9: Role & Kink Preferences (existing code adapted)
    if (step === 9) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            {isIndividual ? 'Discover Your Role' : 'Discover Your Roles'}
          </h2>
          
          {isIndividual ? (
            <>
              <div className="space-y-4">
                <Select 
                  label="Select Your Primary Role"
                  name="role"
                  value={formData.topRoles && formData.topRoles[0] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, topRoles: [e.target.value] }))}
                  options={ROLE_OPTIONS}
                  placeholder="Select a role..."
                />
                
                <Button
                  type="button"
                  onClick={() => openQuiz('individual')}
                  variant="outline"
                  className="w-full"
                >
                  🎯 Take Kink Quiz for Role Suggestions
                </Button>
                
                <Select 
                  label="Lifestyle Experience Level" 
                  name="lifestyleExperience" 
                  value={String(formData.lifestyleExperience || 'New')} 
                  onChange={handleInputChange} 
                  options={EXPERIENCE_LEVEL_OPTIONS} 
                />
                
                <CheckboxGrid 
                  title="Kinks You're Interested In" 
                  options={KINKS_INTERESTED_OPTIONS} 
                  selected={formData.interestedKinks || []} 
                  onToggle={(val) => handleToggle('interestedKinks', val, 15)} 
                  max={15} 
                  error={validationErrors.interestedKinks} 
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
              <div className="p-4 border border-brand-primary/30 rounded-lg">
                <h3 className="font-semibold text-lg text-brand-secondary mb-4">{formData.displayName}'s Role</h3>
                
                <Select 
                  label="Select Role"
                  name="partner1Role"
                  value={formData.partner1Role || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, partner1Role: e.target.value }))}
                  options={ROLE_OPTIONS}
                  placeholder="Select a role..."
                />
                
                <Button
                  type="button"
                  onClick={() => openQuiz('partner1')}
                  variant="outline"
                  className="w-full mt-4"
                >
                  🎯 Take Kink Quiz
                </Button>
                
                <div className="mt-4">
                  <Select 
                    label="Experience Level" 
                    name="partner1Experience" 
                    value={String(formData.partner1Experience || 'New')} 
                    onChange={(e) => handlePartnerTextChange('partner1', 'experience', e.target.value)} 
                    options={EXPERIENCE_LEVEL_OPTIONS} 
                  />
                </div>
                
                <div className="mt-4">
                  <CheckboxGrid 
                    title="Kinks Interested In" 
                    options={KINKS_INTERESTED_OPTIONS} 
                    selected={formData.partner1Kinks || []} 
                    onToggle={(val) => handlePartnerToggle('partner1', 'kinks', val, 15)} 
                    max={15} 
                  />
                </div>
                
                <div className="mt-4">
                  <CheckboxGrid 
                    title="Soft Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.partner1SoftLimits || []} 
                    onToggle={(val) => handlePartnerToggle('partner1', 'softLimits', val, 10)} 
                    max={10} 
                  />
                </div>
                
                <div className="mt-4">
                  <CheckboxGrid 
                    title="Hard Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.partner1HardLimits || []} 
                    onToggle={(val) => handlePartnerToggle('partner1', 'hardLimits', val, 10)} 
                    max={10} 
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label>Safety/Health Practices</Label>
                  <Textarea 
                    value={String(formData.partner1SafetyPractices || '')} 
                    onChange={(e) => handlePartnerTextChange('partner1', 'safetyPractices', e.target.value)} 
                    rows={3} 
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label>Rules (Optional)</Label>
                  <Textarea 
                    value={String(formData.partner1Rules || '')} 
                    onChange={(e) => handlePartnerTextChange('partner1', 'rules', e.target.value)} 
                    rows={3} 
                  />
                </div>
              </div>

              {/* Partner 2 */}
              <div className="p-4 border border-brand-primary/30 rounded-lg">
                <h3 className="font-semibold text-lg text-brand-secondary mb-4">{formData.displayName2}'s Role</h3>
                
                <Select 
                  label="Select Role"
                  name="partner2Role"
                  value={formData.partner2Role || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, partner2Role: e.target.value }))}
                  options={ROLE_OPTIONS}
                  placeholder="Select a role..."
                />
                
                <Button
                  type="button"
                  onClick={() => openQuiz('partner2')}
                  variant="outline"
                  className="w-full mt-4"
                >
                  🎯 Take Kink Quiz
                </Button>
                
                <div className="mt-4">
                  <Select 
                    label="Experience Level" 
                    name="partner2Experience" 
                    value={String(formData.partner2Experience || 'New')} 
                    onChange={(e) => handlePartnerTextChange('partner2', 'experience', e.target.value)} 
                    options={EXPERIENCE_LEVEL_OPTIONS} 
                  />
                </div>
                
                <div className="mt-4">
                  <CheckboxGrid 
                    title="Kinks Interested In" 
                    options={KINKS_INTERESTED_OPTIONS} 
                    selected={formData.partner2Kinks || []} 
                    onToggle={(val) => handlePartnerToggle('partner2', 'kinks', val, 15)} 
                    max={15} 
                  />
                </div>
                
                <div className="mt-4">
                  <CheckboxGrid 
                    title="Soft Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.partner2SoftLimits || []} 
                    onToggle={(val) => handlePartnerToggle('partner2', 'softLimits', val, 10)} 
                    max={10} 
                  />
                </div>
                
                <div className="mt-4">
                  <CheckboxGrid 
                    title="Hard Limits" 
                    options={LIMITS_OPTIONS} 
                    selected={formData.partner2HardLimits || []} 
                    onToggle={(val) => handlePartnerToggle('partner2', 'hardLimits', val, 10)} 
                    max={10} 
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label>Safety/Health Practices</Label>
                  <Textarea 
                    value={String(formData.partner2SafetyPractices || '')} 
                    onChange={(e) => handlePartnerTextChange('partner2', 'safetyPractices', e.target.value)} 
                    rows={3} 
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label>Rules (Optional)</Label>
                  <Textarea 
                    value={String(formData.partner2Rules || '')} 
                    onChange={(e) => handlePartnerTextChange('partner2', 'rules', e.target.value)} 
                    rows={3} 
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 10: About Me/Us + Physical Stats
    if (step === 10) {
      const bioLength = String(formData.bio || '').length;
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            {isIndividual ? 'About Me' : 'About Us'}
          </h2>
          
          <div>
            <Label htmlFor="bio">
              {isIndividual ? 'Bio' : 'Shared Bio'} (69-1000 characters)
            </Label>
            <p className="text-xs text-text-secondary mb-2">
              {isIndividual 
                ? "Show your personality—your vibe attracts your tribe." 
                : "Tell others about you as a couple—what makes you special together."
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
                    name="tattoos"
                    checked={Boolean(formData.tattoos)}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="tattoos">Tattoos</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="piercings"
                    name="piercings"
                    checked={Boolean(formData.piercings)}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="piercings">Piercings</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="latex-allergy"
                    name="latexAllergy"
                    checked={Boolean(formData.latexAllergy)}
                    onChange={handleInputChange}
                    className="w-4 h-4"
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
                    value={String(formData.lastSTITestDate || '')}
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
          ) : (
            <>
              {/* Partner 1 Stats */}
              <div className="p-4 border border-brand-primary/30 rounded-lg">
                <h3 className="font-semibold text-lg text-brand-secondary mb-4">{formData.displayName}'s Stats</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Height"
                    value={String(formData.partner1Height || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'height', e.target.value)}
                    options={HEIGHT_OPTIONS}
                    placeholder="Select height..."
                  />
                  
                  <Select
                    label="Weight"
                    value={String(formData.partner1Weight || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'weight', e.target.value)}
                    options={WEIGHT_OPTIONS}
                    placeholder="Select weight..."
                  />
                  
                  <Select
                    label="Body Type"
                    value={String(formData.partner1BodyType || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'bodyType', e.target.value)}
                    options={BODY_TYPE_OPTIONS}
                    placeholder="Select body type..."
                  />
                  
                  <Select
                    label="Hair Color"
                    value={String(formData.partner1HairColor || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'hairColor', e.target.value)}
                    options={HAIR_COLOR_OPTIONS}
                    placeholder="Select hair color..."
                  />
                  
                  <Select
                    label="Eye Color"
                    value={String(formData.partner1EyeColor || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'eyeColor', e.target.value)}
                    options={EYE_COLOR_OPTIONS}
                    placeholder="Select eye color..."
                  />
                  
                  <Select
                    label="Facial Hair"
                    value={String(formData.partner1FacialHair || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'facialHair', e.target.value)}
                    options={FACIAL_HAIR_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Ethnicity"
                    value={String(formData.partner1Ethnicity || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'ethnicity', e.target.value)}
                    options={ETHNICITY_OPTIONS}
                    placeholder="Select ethnicity..."
                  />
                  
                  <Select
                    label="Cigarette Smoker"
                    value={String(formData.partner1CigaretteSmoker || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'cigaretteSmoker', e.target.value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Alcohol Drinker"
                    value={String(formData.partner1AlcoholDrinker || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'alcoholDrinker', e.target.value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Marijuana User"
                    value={String(formData.partner1MarijuanaUser || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'marijuanaUser', e.target.value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Body Hair"
                    value={String(formData.partner1BodyHair || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'bodyHair', e.target.value)}
                    options={BODY_HAIR_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Grooming Style"
                    value={String(formData.partner1GroomingStyle || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'groomingStyle', e.target.value)}
                    options={GROOMING_STYLE_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Birth Control"
                    value={String(formData.partner1BirthControl || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'birthControl', e.target.value)}
                    options={BIRTH_CONTROL_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Can Host?"
                    value={String(formData.partner1CanHost || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'canHost', e.target.value)}
                    options={CAN_HOST_OPTIONS}
                    placeholder="Select..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partner1-tattoos"
                      checked={Boolean(formData.partner1Tattoos)}
                      onChange={(e) => handlePartnerStatsChange('partner1', 'tattoos', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="partner1-tattoos">Tattoos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partner1-piercings"
                      checked={Boolean(formData.partner1Piercings)}
                      onChange={(e) => handlePartnerStatsChange('partner1', 'piercings', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="partner1-piercings">Piercings</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partner1-latex-allergy"
                      checked={Boolean(formData.partner1LatexAllergy)}
                      onChange={(e) => handlePartnerStatsChange('partner1', 'latexAllergy', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="partner1-latex-allergy">Latex Allergy</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Last STI Test Date</Label>
                    <Input
                      type="date"
                      value={String(formData.partner1LastSTITestDate || '')}
                      onChange={(e) => handlePartnerStatsChange('partner1', 'lastSTITestDate', e.target.value)}
                    />
                  </div>
                  
                  <Select
                    label="STI Positive Results"
                    value={String(formData.partner1StiPositiveResults || '')}
                    onChange={(e) => handlePartnerStatsChange('partner1', 'stiPositiveResults', e.target.value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Select..."
                  />
                </div>
              </div>

              {/* Partner 2 Stats */}
              <div className="p-4 border border-brand-primary/30 rounded-lg">
                <h3 className="font-semibold text-lg text-brand-secondary mb-4">{formData.displayName2}'s Stats</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Height"
                    value={String(formData.partner2Height || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'height', e.target.value)}
                    options={HEIGHT_OPTIONS}
                    placeholder="Select height..."
                  />
                  
                  <Select
                    label="Weight"
                    value={String(formData.partner2Weight || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'weight', e.target.value)}
                    options={WEIGHT_OPTIONS}
                    placeholder="Select weight..."
                  />
                  
                  <Select
                    label="Body Type"
                    value={String(formData.partner2BodyType || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'bodyType', e.target.value)}
                    options={BODY_TYPE_OPTIONS}
                    placeholder="Select body type..."
                  />
                  
                  <Select
                    label="Hair Color"
                    value={String(formData.partner2HairColor || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'hairColor', e.target.value)}
                    options={HAIR_COLOR_OPTIONS}
                    placeholder="Select hair color..."
                  />
                  
                  <Select
                    label="Eye Color"
                    value={String(formData.partner2EyeColor || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'eyeColor', e.target.value)}
                    options={EYE_COLOR_OPTIONS}
                    placeholder="Select eye color..."
                  />
                  
                  <Select
                    label="Facial Hair"
                    value={String(formData.partner2FacialHair || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'facialHair', e.target.value)}
                    options={FACIAL_HAIR_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Ethnicity"
                    value={String(formData.partner2Ethnicity || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'ethnicity', e.target.value)}
                    options={ETHNICITY_OPTIONS}
                    placeholder="Select ethnicity..."
                  />
                  
                  <Select
                    label="Cigarette Smoker"
                    value={String(formData.partner2CigaretteSmoker || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'cigaretteSmoker', e.target.value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Alcohol Drinker"
                    value={String(formData.partner2AlcoholDrinker || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'alcoholDrinker', e.target.value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Marijuana User"
                    value={String(formData.partner2MarijuanaUser || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'marijuanaUser', e.target.value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Body Hair"
                    value={String(formData.partner2BodyHair || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'bodyHair', e.target.value)}
                    options={BODY_HAIR_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Grooming Style"
                    value={String(formData.partner2GroomingStyle || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'groomingStyle', e.target.value)}
                    options={GROOMING_STYLE_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Birth Control"
                    value={String(formData.partner2BirthControl || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'birthControl', e.target.value)}
                    options={BIRTH_CONTROL_OPTIONS}
                    placeholder="Select..."
                  />
                  
                  <Select
                    label="Can Host?"
                    value={String(formData.partner2CanHost || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'canHost', e.target.value)}
                    options={CAN_HOST_OPTIONS}
                    placeholder="Select..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partner2-tattoos"
                      checked={Boolean(formData.partner2Tattoos)}
                      onChange={(e) => handlePartnerStatsChange('partner2', 'tattoos', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="partner2-tattoos">Tattoos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partner2-piercings"
                      checked={Boolean(formData.partner2Piercings)}
                      onChange={(e) => handlePartnerStatsChange('partner2', 'piercings', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="partner2-piercings">Piercings</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partner2-latex-allergy"
                      checked={Boolean(formData.partner2LatexAllergy)}
                      onChange={(e) => handlePartnerStatsChange('partner2', 'latexAllergy', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="partner2-latex-allergy">Latex Allergy</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Last STI Test Date</Label>
                    <Input
                      type="date"
                      value={String(formData.partner2LastSTITestDate || '')}
                      onChange={(e) => handlePartnerStatsChange('partner2', 'lastSTITestDate', e.target.value)}
                    />
                  </div>
                  
                  <Select
                    label="STI Positive Results"
                    value={String(formData.partner2StiPositiveResults || '')}
                    onChange={(e) => handlePartnerStatsChange('partner2', 'stiPositiveResults', e.target.value)}
                    options={YES_NO_OPTIONS}
                    placeholder="Select..."
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 11: Photos
    if (step === 11) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Add Your Photos</h2>
          <p className="text-text-secondary text-center mb-4">Upload at least 2 photos (maximum 10)</p>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-brand-primary/50 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="text-brand-secondary text-4xl mb-2">📷</div>
                <p className="text-white font-semibold mb-1">Click to upload photos</p>
                <p className="text-sm text-text-secondary">PNG, JPG up to 10MB each</p>
              </label>
            </div>
            
            {validationErrors.photos && (
              <p className="text-red-400 text-sm">{validationErrors.photos}</p>
            )}
            
            {photoFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photoFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm text-text-secondary text-center">
              {photoFiles.length} / 10 photos uploaded
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 12: Match Preferences
    if (step === 12) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Match Preferences</h2>
          <p className="text-text-secondary text-center mb-4">Set your matching preferences (optional)</p>
          
          <div className="space-y-6">
            <div>
              <Label>Age Range: {formData.matchPreferences?.ageRange?.[0]} - {formData.matchPreferences?.ageRange?.[1]}</Label>
              <div className="flex gap-4 items-center mt-2">
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={formData.matchPreferences?.ageRange?.[0] || 18}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    matchPreferences: {
                      ...prev.matchPreferences!,
                      ageRange: [parseInt(e.target.value), prev.matchPreferences?.ageRange?.[1] || 55]
                    }
                  }))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={formData.matchPreferences?.ageRange?.[1] || 55}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    matchPreferences: {
                      ...prev.matchPreferences!,
                      ageRange: [prev.matchPreferences?.ageRange?.[0] || 18, parseInt(e.target.value)]
                    }
                  }))}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Distance: {formData.matchPreferences?.distance || 50} miles</Label>
              <input
                type="range"
                min="0"
                max="200"
                value={formData.matchPreferences?.distance || 50}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  matchPreferences: {
                    ...prev.matchPreferences!,
                    distance: parseInt(e.target.value)
                  }
                }))}
                className="w-full mt-2"
              />
            </div>
            
            <CheckboxGrid
              title="Preferred Genders"
              options={GENDER_OPTIONS}
              selected={formData.matchPreferences?.genders || []}
              onToggle={(val) => {
                const current = formData.matchPreferences?.genders || [];
                const newGenders = current.includes(val) ? current.filter(g => g !== val) : [...current, val];
                setFormData(prev => ({
                  ...prev,
                  matchPreferences: {
                    ...prev.matchPreferences!,
                    genders: newGenders
                  }
                }));
              }}
            />
            
            <CheckboxGrid
              title="Preferred Sexualities"
              options={SEXUALITY_OPTIONS}
              selected={formData.matchPreferences?.sexualities || []}
              onToggle={(val) => {
                const current = formData.matchPreferences?.sexualities || [];
                const newSexualities = current.includes(val) ? current.filter(s => s !== val) : [...current, val];
                setFormData(prev => ({
                  ...prev,
                  matchPreferences: {
                    ...prev.matchPreferences!,
                    sexualities: newSexualities
                  }
                }));
              }}
            />
            
            <CheckboxGrid
              title="Experience Level Preference"
              options={EXPERIENCE_LEVEL_OPTIONS}
              selected={formData.matchPreferences?.experienceLevels || []}
              onToggle={(val) => {
                const current = formData.matchPreferences?.experienceLevels || [];
                const newLevels = current.includes(val) ? current.filter(l => l !== val) : [...current, val];
                setFormData(prev => ({
                  ...prev,
                  matchPreferences: {
                    ...prev.matchPreferences!,
                    experienceLevels: newLevels
                  }
                }));
              }}
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified-only"
                checked={formData.matchPreferences?.verifiedOnly || false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  matchPreferences: {
                    ...prev.matchPreferences!,
                    verifiedOnly: e.target.checked
                  }
                }))}
                className="w-4 h-4"
              />
              <Label htmlFor="verified-only">Verified Profiles Only</Label>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next →</Button>
          </div>
        </div>
      );
    }

    // STEP 13: Membership
    if (step === 13) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Choose Your Membership</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, membershipTier: 'basic' }))}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData.membershipTier === 'basic'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
              }`}
            >
              <h3 className="text-xl font-bold text-white mb-2">Basic (Free)</h3>
              <ul className="text-sm text-text-secondary space-y-1 text-left">
                <li>• View profiles</li>
                <li>• Send messages</li>
                <li>• Basic matching</li>
              </ul>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, membershipTier: 'vip' }))}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData.membershipTier === 'vip'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
              }`}
            >
              <h3 className="text-xl font-bold text-white mb-2">VIP ($24.99/mo)</h3>
              <ul className="text-sm text-text-secondary space-y-1 text-left">
                <li>• Everything in Basic</li>
                <li>• Advanced filters</li>
                <li>• See who viewed you</li>
                <li>• Priority support</li>
              </ul>
            </button>
          </div>
          
          <div className="flex gap-4 mt-8">
            <Button onClick={prevStep} variant="outline" className="flex-1">← Back</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !canProceed} 
              className="flex-1"
            >
              {loading ? <Spinner /> : 'Complete Profile Setup ✓'}
            </Button>
          </div>
        </div>
      );
    }

    return <div>Step {step} - Unknown</div>;
  };

  if (showQuiz) {
    return (
      <div 
        className="min-h-screen py-8 px-4"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <KinkQuiz onSaveResults={handleQuizComplete} onClose={() => setShowQuiz(false)} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-base-100/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-secondary">Step {step + 1} of 14</span>
              <span className="text-sm text-brand-secondary font-semibold">{Math.round(((step + 1) / 14) * 100)}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2">
              <div 
                className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / 14) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};
