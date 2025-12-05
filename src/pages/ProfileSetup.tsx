// src/pages/ProfileSetup.tsx - REDESIGNED 10-Step Workflow
import React, { useState, useEffect, useMemo } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Label } from '../components/Label';
import { Spinner } from '../components/Spinner';
import { supabase } from '../services/supabase';
import backgroundImage from '../images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png';
import { KinkQuiz } from '../components/KinkQuiz';
import { PartnerLinkInvite } from '../components/PartnerLinkInvite';
import { PhotoVisibilitySelector } from '../components/PhotoVisibilitySelector';
import { VerificationUpload } from '../components/VerificationUpload';
import { ProfileSummaryReview } from '../components/ProfileSummaryReview';
import { SpiceProfile, PartnerLink, PhotoItem, Visibility, AccountType } from '../types/profile';

// ==============================================
// DATA CONSTANTS
// ==============================================

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

// Exploring With Options
const EXPLORING_WITH_OPTIONS = ['partner', 'solo', 'n/a'];

// Lifestyle Options
const LIFESTYLE_OPTIONS = ['ENM', 'BDSM', 'Poly', 'Swinger', 'Vanilla'];

// Enhanced Role Options
const ROLE_OPTIONS = [
  'Dominant', 'Submissive', 'Switch', 'Top', 'Bottom', 'Versatile',
  'Master/Mistress', 'Slave', 'Daddy/Mommy', 'Little', 'Brat', 'Brat Tamer',
  'Sadist', 'Masochist', 'Rigger', 'Rope Bunny', 'Pet', 'Owner', 'Handler',
  'Primal (Hunter)', 'Primal (Prey)', 'Voyeur', 'Exhibitionist',
  'Service Submissive', 'Service Dominant', 'Ageplayer', 'Degrader', 'Degradee',
  'Non-monogamist', 'Experimentalist', 'Vanilla'
];

// Kink Tags Options
const KINK_TAGS_OPTIONS = [
  'Threesomes', 'Spanking', 'Light bondage', 'Restraints', 'Blindfolds',
  'Dirty talk / name-calling', 'Hair pulling', 'Biting / marking', 'Collar & leash',
  'Role-play', 'Sex Toys', 'Pegging / strap-on play', 'Temperature play', 'Nipple clamps',
  'Oral sex', 'Edging / orgasm control', 'Watching partner masturbate',
  'Recording/Pictures During Play', 'Public play', 'Spitting', 'Slapping', 'Breeding',
  'Gangbangs', 'Daddy/Mommy kink', 'Choking / breath play', 'Wax play',
  'Degradation / praise', 'Shibari / decorative rope', 'Cuckolding or hotwife',
  'Anal play', 'Pet play', 'CNC', 'Watersports', 'BDSM', 'Voyeurism', 'Exhibitionism',
  'Swinging', 'Group Play', 'Tantric Sex', 'Food Play'
];

// Limits Options
const LIMITS_OPTIONS = [
  'Scat', 'Blood Play', 'Illegal Activities', 'Permanent Marks', 'Breath Play',
  'Findom', 'Needles', 'Vomit', 'Hard Insults', 'Public Humiliation', 'Animals',
  'Underage', 'Non-Consensual', 'Weapon Play', 'Fire Play', 'Edge Play', 'Race Play',
  'Intercourse', 'Oral Sex', 'No Condoms', 'Overnights', 'Intoxication',
  'Face Slapping', 'Choking', 'Gagging'
];

// Gender Options
const GENDER_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female',
  'Genderqueer', 'Gender Fluid', 'Agender', 'Two-Spirit', 'Other'
];

// Sexuality Options
const SEXUALITY_OPTIONS = [
  'Straight', 'Bisexual', 'Gay', 'Lesbian', 'Pansexual', 'Queer',
  'Asexual', 'Demisexual', 'Sapiosexual', 'Other'
];

// Pronouns Options
const PRONOUNS_OPTIONS = [
  'he/him', 'she/her', 'they/them', 'ze/zir', 'xe/xem',
  'any pronouns', 'other', 'prefer not to say'
];

// Experience Level Options
const EXPERIENCE_LEVEL_OPTIONS = ['New', 'Beginner', 'Moderate', 'Advanced'];

// Profile Visibility Options
const PROFILE_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public - Visible to everyone' },
  { value: 'verified_only', label: 'Verified Only - Only verified users' },
  { value: 'matches_only', label: 'Matches Only - Only your matches' },
  { value: 'private', label: 'Private - Hidden from browse' }
];

// Physical Stats Options
const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const feet = Math.floor((i + 48) / 12);
  const inches = (i + 48) % 12;
  return `${feet}'${inches}"`;
});

const WEIGHT_OPTIONS = Array.from({ length: 76 }, (_, i) => `${75 + i * 5} lbs`);

const BODY_TYPE_OPTIONS = ['Slim', 'Average', 'Athletic', 'Curvy', 'Fit', 'Thick', 'Plus-size', 'Dad Bod', 'BBW'];

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

const CAN_HOST_OPTIONS = ['Yes', 'No', 'Possibly'];

// ==============================================
// HELPER COMPONENTS
// ==============================================

const CheckboxGrid = ({ title, options, selected, onToggle, max, error }: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  max: number;
  error?: string;
}) => (
  <div className="space-y-2">
    <Label>{title} (Max {max})</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`py-2 px-3 text-sm rounded-lg text-left transition-all ${
            selected.includes(option)
              ? 'bg-brand-primary text-white font-semibold'
              : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const TagMultiSelect = ({ title, options, selected, onToggle, error }: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  error?: string;
}) => (
  <div className="space-y-2">
    <Label>{title}</Label>
    {error && <p className="text-red-400 text-sm -mt-1">{error}</p>}
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
            selected.includes(option)
              ? 'bg-brand-primary text-white'
              : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const Select = ({ label, value, onChange, options, placeholder, required, name }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[] | { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  name?: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <select
      value={value}
      onChange={onChange}
      name={name}
      required={required}
      className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => {
        const isObj = typeof opt === 'object' && opt !== null;
        const optValue = isObj ? (opt as any).value : opt;
        const optLabel = isObj ? (opt as any).label : opt;
        return <option key={optValue} value={optValue}>{optLabel}</option>;
      })}
    </select>
  </div>
);

// Date of Birth validation
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

// ==============================================
// MAIN COMPONENT
// ==============================================

export const ProfileSetupPage: React.FC = () => {
  const { user } = useAuth();
  const { completeProfileSetup, uploadPhoto } = useProfile();

  const [step, setStep] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data state
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
    safeword: null,
    photos: [],
    profileVisibility: 'public',
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
    verification: {
      identityVerified: false,
      lifestyleVerified: [],
      partnerVerifiedIds: [],
    },
    membershipTier: 'basic',
  });

  // Additional state
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPartnerLinking, setShowPartnerLinking] = useState(false);

  // Determine if partner linking step should be shown
  useEffect(() => {
    const shouldShow =
      formData.accountType === 'individual_with_linking' ||
      formData.exploringWith === 'partner' ||
      formData.relationshipStatus?.includes('open_relationship') ||
      formData.relationshipStatus?.includes('polyamorous') ||
      formData.relationshipStatus?.includes('swinger');

    setShowPartnerLinking(Boolean(shouldShow));
  }, [formData.accountType, formData.exploringWith, formData.relationshipStatus]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle multi-select toggles
  const handleToggle = (field: keyof SpiceProfile, value: string, max?: number) => {
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

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 10) {
      setValidationErrors(prev => ({ ...prev, photos: 'You can upload a maximum of 10 photos' }));
      return;
    }

    // Create PhotoItem objects
    const newPhotos: PhotoItem[] = files.map(file => ({
      id: `temp_${Date.now()}_${Math.random()}`,
      url: URL.createObjectURL(file),
      visibility: 'public',
      uploadedAt: new Date().toISOString(),
    }));

    setPhotoFiles(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), ...newPhotos]
    }));
    setValidationErrors(prev => ({ ...prev, photos: '' }));
  };

  // Remove photo handler
  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index)
    }));
  };

  // Photo visibility change handler
  const handlePhotoVisibilityChange = (photoId: string, visibility: Visibility) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.map(photo =>
        photo.id === photoId ? { ...photo, visibility } : photo
      )
    }));
  };

  // Photo blur toggle handler
  const handlePhotoBlurToggle = (photoId: string, isBlurred: boolean) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.map(photo =>
        photo.id === photoId ? { ...photo, isBlurredUntilMatch: isBlurred } : photo
      )
    }));
  };

  // Partner link invite handler
  const handlePartnerInviteSent = (link: PartnerLink) => {
    setFormData(prev => ({
      ...prev,
      partnerLinks: [...(prev.partnerLinks || []), link]
    }));
  };

  // Verification upload complete handler
  const handleVerificationComplete = (result: any) => {
    if (result.type === 'identity') {
      setFormData(prev => ({
        ...prev,
        verification: {
          ...prev.verification,
          identityVerified: true,
          identityVerifiedAt: result.uploadedAt,
        }
      }));
    } else if (result.type === 'lifestyle') {
      setFormData(prev => ({
        ...prev,
        verification: {
          ...prev.verification,
          lifestyleVerified: result.lifestyles,
        }
      }));
    }
  };

  // Quiz complete handler
  const handleQuizComplete = (results: Record<string, number>) => {
    const topRoles = Object.entries(results)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 5)
      .map(([role]) => role);

    setFormData(prev => ({
      ...prev,
      roles: topRoles,
    }));
    setShowQuiz(false);
  };

  // Navigation handlers
  const nextStep = () => {
    if (step === 1 && !showPartnerLinking) {
      setStep(2);
    } else if (step === '2a') {
      setStep(2);
    } else if (typeof step === 'number') {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step === 2 && showPartnerLinking) {
      setStep('2a');
    } else if (step === 2 && !showPartnerLinking) {
      setStep(1);
    } else if (step === '2a') {
      setStep(1);
    } else if (typeof step === 'number' && step > 0) {
      setStep(step - 1);
    }
  };

  const goToStep = (targetStep: number) => {
    setStep(targetStep);
  };

  // Can proceed logic
  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(formData.accountType);
      
      case 1:
        return Boolean(
          formData.relationshipStatus && 
          formData.relationshipStatus.length > 0 &&
          (formData.exploringWith || !formData.relationshipStatus.includes('in_relationship'))
        );
      
      case '2a':
        return true; // Can skip
      
      case 2:
        return Boolean(formData.lifestyles && formData.lifestyles.length > 0);
      
      case 3:
        return Boolean(formData.roles && formData.roles.length > 0);
      
      case 4:
        return Boolean(formData.kinkTags && formData.kinkTags.length > 0);
      
      case 5:
        if (formData.accountType === 'shared_couple') {
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
            validateDateOfBirth(String(formData.birthdate)) &&
            formData.genderIdentity &&
            formData.sexualOrientation &&
            formData.sexualOrientation.length > 0
          );
        }
      
      case 6:
        return Boolean(formData.photos && formData.photos.length >= 2);
      
      case 7:
        return Boolean(formData.profileVisibility);
      
      case 8:
        return true; // Verification optional
      
      case 9:
        return true; // Review step
      
      default:
        return false;
    }
  }, [step, formData]);

  // Final submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!formData.accountType) throw new Error('Account type not selected');

      // Upload photos to storage
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
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

      // Update photo URLs
      const updatedPhotos: PhotoItem[] = (formData.photos || []).map((photo, index) => ({
        ...photo,
        url: uploadedUrls[index] || photo.url
      }));

      const finalProfile: any = {
        ...formData,
        photos: updatedPhotos,
        age: formData.birthdate ? calculateAge(formData.birthdate) : null,
      };

      const response = await completeProfileSetup(finalProfile);

      if (response.error) {
        throw new Error(response.error);
      }

      // Success - profile created
    } catch (err: any) {
      console.error('Profile submit failed:', err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  // Progress calculation
  const progress = useMemo(() => {
    if (step === 0) return 0;
    const totalSteps = 10;
    const currentStepNum = step === '2a' ? 2.5 : Number(step);
    return (currentStepNum / totalSteps) * 100;
  }, [step]);

  // Step labels
  const STEP_LABELS: Record<number | string, string> = {
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

  // ==============================================
  // STEP RENDERING
  // ==============================================

  const renderStepContent = () => {
    const isIndividual = formData.accountType !== 'shared_couple';

    switch (step) {
      case 0: // Account Type Selection
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">How would you like to create your account?</h2>
              <p className="text-text-secondary">Choose the option that best fits your situation</p>
            </div>
            
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Individual Account */}
              <button
                onClick={() => setFormData(prev => ({ ...prev, accountType: 'individual' }))}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  formData.accountType === 'individual'
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
                onClick={() => setFormData(prev => ({ ...prev, accountType: 'shared_couple' }))}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  formData.accountType === 'shared_couple'
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

              {/* Individual with Partner Links */}
              <button
                onClick={() => setFormData(prev => ({ ...prev, accountType: 'individual_with_linking' }))}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                  formData.accountType === 'individual_with_linking'
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-brand-primary/30 hover:border-brand-primary/60 bg-black/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">💑</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Individual with Partner Links</h3>
                    <p className="text-sm text-gray-400 mb-2">Setup partner relationships during account creation</p>
                    <p className="text-sm text-gray-300 mb-3">I want to link my partner(s) right away to appear as a couple</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-brand-secondary">
                        <span className="text-brand-primary">✓</span>
                        <span>Pulls data from both profiles to create a discoverable couple view</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-secondary">
                        <span className="text-brand-primary">✓</span>
                        <span>Both maintain separate accounts with read-only linked partner dashboard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center mt-8">
              <Button 
                onClick={nextStep} 
                disabled={!canProceed}
                className="min-w-[200px]"
              >
                Continue →
              </Button>
            </div>
          </div>
        );

      case 1: // Relationship Status
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Relationship Status
            </h2>

            <div className="space-y-4">
              <TagMultiSelect
                title="Current Relationship Status (select all that apply)"
                options={RELATIONSHIP_STATUS_OPTIONS}
                selected={formData.relationshipStatus || []}
                onToggle={(val) => handleToggle('relationshipStatus', val)}
              />

              {formData.relationshipStatus?.includes('in_relationship') && (
                <div className="space-y-2 p-4 border border-brand-primary/30 rounded-lg">
                  <Label>Are you exploring with your partner or solo?</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {EXPLORING_WITH_OPTIONS.slice(0, 2).map(option => (
                      <button
                        key={option}
                        onClick={() => setFormData(prev => ({ ...prev, exploringWith: option as any }))}
                        className={`py-3 px-4 rounded-lg font-medium transition-all ${
                          formData.exploringWith === option
                            ? 'bg-brand-primary text-white'
                            : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                        }`}
                      >
                        {option === 'partner' ? 'With Partner' : 'Solo'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
        );

      case '2a': // Partner Linking (Conditional)
        return (
          <div className="space-y-6">
            <PartnerLinkInvite
              onInviteSent={handlePartnerInviteSent}
              onSkip={() => nextStep()}
            />
            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
            </div>
          </div>
        );

      case 2: // Lifestyle Definition
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Define Your Lifestyle
            </h2>
            <p className="text-text-secondary text-center text-sm">
              Select all that resonate with you
            </p>

            <TagMultiSelect
              title="Lifestyles"
              options={LIFESTYLE_OPTIONS}
              selected={formData.lifestyles || []}
              onToggle={(val) => handleToggle('lifestyles', val)}
            />

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
        );

      case 3: // Roles & Dynamics
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Roles & Dynamics
            </h2>

            <div className="space-y-4">
              <TagMultiSelect
                title="Select Your Roles"
                options={ROLE_OPTIONS}
                selected={formData.roles || []}
                onToggle={(val) => handleToggle('roles', val)}
              />

              <Button
                type="button"
                onClick={() => setShowQuiz(true)}
                variant="outline"
                className="w-full"
              >
                🎯 Take Kink Quiz for Role Suggestions
              </Button>

              <Select
                label="Experience Level"
                value={formData.experienceLevel || 'New'}
                onChange={handleInputChange}
                name="experienceLevel"
                options={EXPERIENCE_LEVEL_OPTIONS}
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
        );

      case 4: // Kinks & Preferences
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Kinks & Preferences
            </h2>

            <CheckboxGrid
              title="Kinks You're Interested In"
              options={KINK_TAGS_OPTIONS}
              selected={formData.kinkTags || []}
              onToggle={(val) => handleToggle('kinkTags', val, 15)}
              max={15}
              error={validationErrors.kinkTags}
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
              <Label>Safeword (Optional)</Label>
              <Input
                name="safeword"
                value={formData.safeword || ''}
                onChange={handleInputChange}
                placeholder="Your safeword"
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
        );

      case 5: // Profile Details
        const bioLength = String(formData.bio || formData.coupleBio || '').length;
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              {isIndividual ? 'Profile Details' : 'Couple Profile Details'}
            </h2>

            {isIndividual ? (
              <>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    name="displayName"
                    value={formData.displayName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bio (69-1000 characters)</Label>
                  <Textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows={5}
                    minLength={69}
                    maxLength={1000}
                    required
                  />
                  <p className={`text-sm ${bioLength < 69 || bioLength > 1000 ? 'text-red-400' : 'text-text-secondary'}`}>
                    {bioLength} / 1000
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Location (City, State)</Label>
                  <Input
                    name="location"
                    value={typeof formData.location === 'string' ? formData.location : ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Los Angeles, CA"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth (MM/DD/YYYY)</Label>
                    <Input
                      name="birthdate"
                      value={formData.birthdate || ''}
                      onChange={(e) => {
                        let digits = e.target.value.replace(/\D/g, '');
                        if (digits.length >= 2) {
                          digits = digits.slice(0, 2) + '/' + digits.slice(2);
                        }
                        if (digits.length >= 5) {
                          digits = digits.slice(0, 5) + '/' + digits.slice(5, 9);
                        }
                        setFormData(prev => ({ ...prev, birthdate: digits }));
                      }}
                      placeholder="MM/DD/YYYY"
                      maxLength={10}
                      required
                    />
                    {formData.birthdate && validateDateOfBirth(formData.birthdate) && (
                      <p className="text-green-400 text-sm">Age: {calculateAge(formData.birthdate)}</p>
                    )}
                  </div>

                  <Select
                    label="Gender Identity"
                    value={formData.genderIdentity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, genderIdentity: e.target.value }))}
                    options={GENDER_OPTIONS}
                    placeholder="Select..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Pronouns"
                    value={formData.pronouns || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, pronouns: e.target.value }))}
                    options={PRONOUNS_OPTIONS}
                    placeholder="Select..."
                  />

                  <TagMultiSelect
                    title="Sexual Orientation"
                    options={SEXUALITY_OPTIONS}
                    selected={formData.sexualOrientation || []}
                    onToggle={(val) => {
                      const current = formData.sexualOrientation || [];
                      setFormData(prev => ({
                        ...prev,
                        sexualOrientation: current.includes(val)
                          ? current.filter(s => s !== val)
                          : [...current, val]
                      }));
                    }}
                  />
                </div>

                {/* Physical Stats */}
                <div className="p-4 border border-brand-primary/30 rounded-lg">
                  <h4 className="font-semibold text-white mb-4">Physical Stats (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Height"
                      value={formData.height || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      options={HEIGHT_OPTIONS}
                      placeholder="Select..."
                    />
                    <Select
                      label="Body Type"
                      value={formData.bodyType || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bodyType: e.target.value }))}
                      options={BODY_TYPE_OPTIONS}
                      placeholder="Select..."
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Couple Name</Label>
                  <Input
                    name="coupleName"
                    value={formData.coupleName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Couple Bio (69-1000 characters)</Label>
                  <Textarea
                    name="coupleBio"
                    value={formData.coupleBio || ''}
                    onChange={handleInputChange}
                    rows={5}
                    minLength={69}
                    maxLength={1000}
                    required
                  />
                  <p className={`text-sm ${bioLength < 69 || bioLength > 1000 ? 'text-red-400' : 'text-text-secondary'}`}>
                    {bioLength} / 1000
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
        );

      case 6: // Photos & Media
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Add Your Photos
            </h2>
            <p className="text-text-secondary text-center text-sm">
              Upload 2-10 photos. Set visibility for each photo.
            </p>

            <div>
              <Label>Upload Photos (Min 2, Max 10)</Label>
              {validationErrors.photos && (
                <p className="text-red-400 text-sm">{validationErrors.photos}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {formData.photos?.map((photo, index) => (
                  <div key={photo.id} className="relative">
                    <div className="aspect-square">
                      <img
                        src={photo.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-2">
                      <PhotoVisibilitySelector
                        photo={photo}
                        onVisibilityChange={handlePhotoVisibilityChange}
                        onBlurToggle={handlePhotoBlurToggle}
                      />
                    </div>
                  </div>
                ))}

                {(formData.photos?.length || 0) < 10 && (
                  <label className="aspect-square border-2 border-dashed border-brand-primary/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <span className="text-brand-primary text-4xl">+</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} disabled={!canProceed} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
        );

      case 7: // Privacy Settings
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Privacy Settings
            </h2>

            <div className="space-y-4">
              <Select
                label="Profile Visibility"
                value={formData.profileVisibility || 'public'}
                onChange={(e) => setFormData(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                options={PROFILE_VISIBILITY_OPTIONS}
              />

              {/* Match Preferences */}
              <div className="p-4 border border-brand-primary/30 rounded-lg space-y-4">
                <h4 className="font-semibold text-white">Match Preferences</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="mb-0">Age Range</Label>
                    <span className="text-brand-secondary font-semibold">
                      {formData.matchPreferences?.ageRange?.[0]} - {formData.matchPreferences?.ageRange?.[1]}
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-sm">Min:</span>
                    <input
                      type="range"
                      min={18}
                      max={99}
                      value={formData.matchPreferences?.ageRange?.[0] || 18}
                      onChange={(e) =>
                        setFormData(p => ({
                          ...p,
                          matchPreferences: {
                            ...p.matchPreferences!,
                            ageRange: [
                              Number(e.target.value),
                              Math.max(Number(e.target.value), p.matchPreferences!.ageRange![1])
                            ]
                          }
                        }))
                      }
                      className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-sm">Max:</span>
                    <input
                      type="range"
                      min={18}
                      max={99}
                      value={formData.matchPreferences?.ageRange?.[1] || 55}
                      onChange={(e) =>
                        setFormData(p => ({
                          ...p,
                          matchPreferences: {
                            ...p.matchPreferences!,
                            ageRange: [
                              Math.min(Number(e.target.value), p.matchPreferences!.ageRange![0]),
                              Number(e.target.value)
                            ]
                          }
                        }))
                      }
                      className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="mb-0">Distance</Label>
                    <span className="text-brand-secondary font-semibold">
                      {formData.matchPreferences?.distance} miles
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={formData.matchPreferences?.distance || 50}
                    onChange={(e) =>
                      setFormData(p => ({
                        ...p,
                        matchPreferences: {
                          ...p.matchPreferences!,
                          distance: Number(e.target.value)
                        }
                      }))
                    }
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-thumb"
                  />
                </div>

                <div className="flex justify-between items-center bg-black/50 p-3 rounded-lg">
                  <Label className="mb-0">Verified Profiles Only</Label>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={formData.matchPreferences?.verifiedOnly || false}
                    onChange={(e) =>
                      setFormData(p => ({
                        ...p,
                        matchPreferences: {
                          ...p.matchPreferences!,
                          verifiedOnly: e.target.checked
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
        );

      case 8: // Verification
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Verification (Optional)
            </h2>
            <p className="text-text-secondary text-center text-sm">
              Verified profiles get more visibility and trust
            </p>

            <VerificationUpload
              verificationType="identity"
              onUploadComplete={handleVerificationComplete}
            />

            <VerificationUpload
              verificationType="lifestyle"
              onUploadComplete={handleVerificationComplete}
            />

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Next →
              </Button>
            </div>
          </div>
        );

      case 9: // Review & Publish
        return (
          <div className="space-y-6">
            <ProfileSummaryReview profile={formData} onEdit={goToStep} />

            {/* Membership Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white text-center">Choose Your Membership</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`p-6 rounded-lg border-2 ${
                    formData.membershipTier === 'basic'
                      ? 'border-brand-primary'
                      : 'border-base-300'
                  }`}
                >
                  <h4 className="text-xl font-bold">Freemium - Basic</h4>
                  <ul className="list-disc list-inside my-4 space-y-2 text-text-secondary">
                    <li>✓ Basic features</li>
                    <li className="line-through">✗ Limited visibility</li>
                    <li className="line-through">✗ No priority matching</li>
                  </ul>
                  <Button
                    onClick={() => setFormData(p => ({ ...p, membershipTier: 'basic' }))}
                    variant={formData.membershipTier === 'basic' ? 'primary' : 'outline'}
                  >
                    Stay Basic
                  </Button>
                </div>

                <div
                  className={`p-6 rounded-lg border-2 ${
                    formData.membershipTier === 'vip'
                      ? 'border-brand-primary'
                      : 'border-base-300'
                  }`}
                >
                  <h4 className="text-xl font-bold text-brand-secondary">🌟 VIP Membership</h4>
                  <ul className="list-disc list-inside my-4 space-y-2 text-text-primary">
                    <li>🌟 All features unlocked</li>
                    <li>🎯 Priority match visibility</li>
                    <li>💬 Unlimited messages</li>
                    <li>🎉 Access to VIP-only events</li>
                  </ul>
                  <p className="text-center font-bold text-2xl my-4">$24.99 / month</p>
                  <Button
                    onClick={() => setFormData(p => ({ ...p, membershipTier: 'vip' }))}
                    variant={formData.membershipTier === 'vip' ? 'primary' : 'outline'}
                  >
                    Upgrade to VIP
                  </Button>
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex gap-4">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} isLoading={loading} className="flex-1">
                {loading ? 'Publishing...' : 'Publish Profile 🚀'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ==============================================
  // RENDER
  // ==============================================

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
      
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'blur(2px)',
          transform: 'scale(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-black/80" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto p-8 bg-black/70 rounded-2xl border-2 border-brand-primary/60 shadow-lg shadow-brand-primary/20 backdrop-blur-sm animate-fade-in">
          
          <div className="text-center mb-6">
            <h1
              className="text-4xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(255, 20, 147, 0.5)'
              }}
            >
              SPICE
            </h1>
            {(typeof step === 'number' && step > 0) || step === '2a' && (
              <p className="text-sm text-text-secondary mt-2">
                Step {typeof step === 'number' ? step : '2a'} of 9: {STEP_LABELS[step]}
              </p>
            )}
          </div>

          {((typeof step === 'number' && step > 0) || step === '2a') && (
            <div className="mb-8">
              <div className="w-full bg-base-300 rounded-full h-2.5">
                <div
                  className="bg-brand-primary h-2.5 rounded-full"
                  style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
                ></div>
              </div>
            </div>
          )}

          <div className="animate-fade-in">{renderStepContent()}</div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
        <KinkQuiz
          onClose={() => setShowQuiz(false)}
          onSaveResults={handleQuizComplete}
          existingResults={{}}
        />
      )}
    </div>
  );
};
