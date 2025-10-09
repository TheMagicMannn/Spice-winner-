import React, { useState, useMemo } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Label } from '../components/Label';
import { Profile } from '../types';

// --- DATA CONSTANTS ---
const KINKS_OPTIONS = [/* ... same as before ... */];
const INTERESTS_OPTIONS = [/* ... same as before ... */];
const LIMITS_OPTIONS = [/* ... same as before ... */];
const GENDER_OPTIONS = [/* ... same as before ... */];
const SEXUALITY_OPTIONS = [/* ... same as before ... */];
const RELATIONSHIP_STATUS_OPTIONS = [/* ... same as before ... */];
const SEEKING_OPTIONS = [/* ... same as before ... */];
const SEEKING_RELATIONSHIP_TYPE_OPTIONS = [/* ... same as before ... */];
const EXPERIENCE_LEVEL_OPTIONS = [/* ... same as before ... */];

// --- HELPER COMPONENTS ---
const CheckboxGrid = ({ title, options, selected, onToggle, max, error }: { title: string; options: string[]; selected: string[]; onToggle: (option: string) => void; max: number; error?: string }) => (
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

const Select = ({ label, value, onChange, options, placeholder, required, name }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; placeholder?: string; required?: boolean; name?: string }) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <select value={value} onChange={onChange} name={name} required={required} className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors">
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

// --- MAIN COMPONENT ---
export const ProfileSetupPage: React.FC = () => {
  const { user } = useAuth();
  const { completeProfileSetup, uploadPhoto } = useProfile();
  
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<'individual' | 'couple' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Profile>>({
    displayName: '',
    location: '',
    age: 18,
    bio: '',
    photos: [],
    relationshipStatus: '',
    seeking: [],
    seekingRelationshipType: [],
    lifestyleExperience: 'New',
    interests: [],
    kinks: [],
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
    matchPreferences: {
        ageRange: [21, 55],
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'number') finalValue = parseInt(value, 10);
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handlePartnerChange = (partner: 'partner1' | 'partner2', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldMapping = {
        partner1: { displayName: 'displayName', gender: 'gender', sexuality: 'orientation', age: 'age' },
        partner2: { displayName: 'displayName2', gender: 'gender2', sexuality: 'orientation2', age: 'age2' },
    };
    const key = fieldMapping[partner][name as keyof typeof fieldMapping.partner1] as keyof Profile;
    let finalValue: any = value;
    if (type === 'number') finalValue = parseInt(value, 10);
    setFormData(prev => ({ ...prev, [key]: finalValue }));
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
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 10) {
        setValidationErrors(prev => ({ ...prev, photos: 'You can upload a maximum of 10 photos' }));
        return;
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const result = await uploadPhoto(file);
      if (result.error) {
        setValidationErrors(prev => ({ ...prev, photos: result.error! }));
        continue;
      }
      uploadedUrls.push(result.data!.publicUrl);
    }

    setPhotoFiles([...photoFiles, ...files]);
    setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), ...uploadedUrls] }));
    setValidationErrors(prev => ({ ...prev, photos: '' }));
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index),
    }));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (photoFiles.length < 2) throw new Error('Please upload at least 2 photos');

      const finalProfileData: Profile = {
        ...formData,
        accountType: accountType!,
        age: Number(formData.age),
        age2: Number(formData.age2),
      } as Profile;

      const { error: setupError } = await completeProfileSetup(finalProfileData);
      if (setupError) throw new Error(setupError);

    } catch (err: any) {
      setError(err.message ?? 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  // --- Step Navigation ---
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const canProceed = useMemo(() => {
    if (accountType === 'individual') {
        switch (step) {
            case 1: return !!formData.displayName && !!formData.location && !!formData.gender && !!formData.orientation && formData.age! >= 18 && !!formData.relationshipStatus;
            case 2: return photoFiles.length >= 2 && formData.bio && formData.bio.length >= 69 && formData.bio.length <= 1000;
            case 3: return true; // Preferences optional
            default: return false;
        }
    }
    if (accountType === 'couple') {
        switch (step) {
            case 1: return !!formData.displayName && !!formData.displayName2 && !!formData.location && !!formData.gender && !!formData.gender2 && !!formData.orientation && !!formData.orientation2 && formData.age! >= 18 && formData.age2! >= 18 && !!formData.relationshipStatus;
            case 2: return photoFiles.length >= 2 && formData.bio && formData.bio.length >= 69 && formData.bio.length <= 1000;
            case 3: return true; // Preferences optional
            default: return false;
        }
    }
    return false;
  }, [step, accountType, formData, photoFiles]);

  // --- RENDER ---
  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Complete Your Profile</h1>
      
      {error && <p className="text-red-500 text-center">{error}</p>}

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Button onClick={() => setAccountType('individual')} selected={accountType === 'individual'}>Individual</Button>
          <Button onClick={() => setAccountType('couple')} selected={accountType === 'couple'}>Couple</Button>
          {accountType && <Button onClick={nextStep}>Next</Button>}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Input name="displayName" label="Display Name" value={formData.displayName || ''} onChange={handleInputChange} />
          {accountType === 'couple' && <Input name="displayName2" label="Partner Display Name" value={formData.displayName2 || ''} onChange={handleInputChange} />}
          <Select label="Gender" value={formData.gender || ''} onChange={handleInputChange} options={GENDER_OPTIONS} name="gender" required />
          {accountType === 'couple' && <Select label="Partner Gender" value={formData.gender2 || ''} onChange={handleInputChange} options={GENDER_OPTIONS} name="gender2" required />}
          <Select label="Sexuality" value={formData.orientation || ''} onChange={handleInputChange} options={SEXUALITY_OPTIONS} name="orientation" required />
          {accountType === 'couple' && <Select label="Partner Sexuality" value={formData.orientation2 || ''} onChange={handleInputChange} options={SEXUALITY_OPTIONS} name="orientation2" required />}
          <Input type="number" name="age" label="Age" value={formData.age || 18} onChange={handleInputChange} min={18} />
          {accountType === 'couple' && <Input type="number" name="age2" label="Partner Age" value={formData.age2 || 18} onChange={handleInputChange} min={18} />}
          <Select label="Relationship Status" value={formData.relationshipStatus || ''} onChange={handleInputChange} options={RELATIONSHIP_STATUS_OPTIONS} name="relationshipStatus" required />
          <Button onClick={prevStep}>Back</Button>
          <Button disabled={!canProceed} onClick={nextStep}>Next</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Label>Profile Photos (min 2)</Label>
          {validationErrors.photos && <p className="text-red-400">{validationErrors.photos}</p>}
          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
          <div className="flex gap-2 flex-wrap">
            {formData.photos?.map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} alt={`Photo ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                <button type="button" onClick={() => removePhoto(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">x</button>
              </div>
            ))}
          </div>
          <Label>Bio</Label>
          <Textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} minLength={69} maxLength={1000} />
          <Button onClick={prevStep}>Back</Button>
          <Button disabled={!canProceed} onClick={nextStep}>Next</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <CheckboxGrid title="Kinks" options={KINKS_OPTIONS} selected={formData.kinks || []} onToggle={(v) => handleToggle('kinks', v, 10)} max={10} error={validationErrors.kinks} />
          <TagMultiSelect title="Interests" options={INTERESTS_OPTIONS} selected={formData.interests || []} onToggle={(v) => handleToggle('interests', v, 10)} error={validationErrors.interests} />
          <CheckboxGrid title="Soft Limits" options={LIMITS_OPTIONS} selected={formData.softLimits || []} onToggle={(v) => handleToggle('softLimits', v, 10)} max={10} error={validationErrors.softLimits} />
          <CheckboxGrid title="Hard Limits" options={LIMITS_OPTIONS} selected={formData.hardLimits || []} onToggle={(v) => handleToggle('hardLimits', v, 10)} max={10} error={validationErrors.hardLimits} />
          <Slider label="Age Range Minimum" value={formData.matchPreferences?.ageRange?.[0] || 21} onChange={(e) => setFormData(prev => ({ ...prev, matchPreferences: { ...prev.matchPreferences, ageRange: [parseInt(e.target.value), prev.matchPreferences?.ageRange[1] || 55] }}))} min={18} max={100} unit="y" />
          <Slider label="Age Range Maximum" value={formData.matchPreferences?.ageRange?.[1] || 55} onChange={(e) => setFormData(prev => ({ ...prev, matchPreferences: { ...prev.matchPreferences, ageRange: [prev.matchPreferences?.ageRange[0] || 21, parseInt(e.target.value)] }}))} min={18} max={100} unit="y" />
          <Button onClick={prevStep}>Back</Button>
          <Button disabled={loading} onClick={handleSubmit}>{loading ? 'Saving...' : 'Complete Profile'}</Button>
        </div>
      )}
    </div>
  );
};
