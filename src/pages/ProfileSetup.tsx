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


// --- DATA CONSTANTS ---
const KINKS_OPTIONS: string[] = ['BDSM', 'Roleplay', 'Voyeurism', 'Exhibitionism', 'Swinging', 'Group Play', 'Tantric Sex', 'Food Play', 'Dominance', 'Submission', 'Bondage', 'Impact Play', 'Sensory Deprivation', 'Age Play', 'Cuckolding', 'Foot Fetish', 'Leather/Latex', 'Uniforms', 'Medical Play', 'Pet Play', 'Praise', 'Degradation', 'Watersports', 'Anal Play', 'Public Play'];

const INTERESTS_OPTIONS: string[] = ['Live Music', 'Wine Tasting', 'Craft Beer', 'Hiking', 'Art Galleries', 'Dancing', 'Travel', 'Fine Dining', 'Fitness/Gym', 'Yoga/Meditation', 'Photography', 'Gaming', 'Boating', 'Movies', 'Theater', 'Cooking', 'Rooftop Bars', 'Speakeasies', 'Cigars', 'Whiskey', 'Fashion', 'Charity Events', 'Sports', 'Reading', 'Beach Clubs'];

const LIMITS_OPTIONS: string[] = ['Scat', 'Blood Play', 'Illegal Activities', 'Permanent Marks', 'Breath Play', 'Findom', 'Needles', 'Vomit', 'Hard Insults', 'Public Humiliation', 'Animals', 'Underage', 'Non-Consensual', 'Weapon Play', 'Fire Play', 'Edge Play', 'Race Play', 'Intercourse', 'Oral Sex', 'No Condoms', 'Overnights', 'Intoxication', 'Face Slapping', 'Choking', 'Gagging'];

const GENDER_OPTIONS: string[] = ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Other'];

const SEXUALITY_OPTIONS: string[] = ['Straight', 'Bisexual', 'Gay', 'Pansexual', 'Queer', 'Asexual', 'Other'];

const RELATIONSHIP_STATUS_OPTIONS: string[] = ['Single', 'Married', 'Divorced', 'Widowed', 'In a Relationship', 'Open Relationship', 'It\'s Complicated'];
const SEEKING_OPTIONS = ['👫 Couple', '🙎‍♂️ Man', '🙍‍♀️ Woman', '👤 Other'];
const SEEKING_RELATIONSHIP_TYPE_OPTIONS = ['Casual NSA', 'FWB', 'Play Partners', 'Voyeur', 'Swingers Party Friends', 'Poly Relationship', 'Long-term', 'Short-term', 'Sugar Daddy/Baby'];
const EXPERIENCE_LEVEL_OPTIONS = ['New', 'Beginner', 'Moderate', 'Advanced'];

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

// --- MAIN COMPONENT ---
export const ProfileSetupPage: React.FC = () => {
  const { user } = useAuth();
  const { completeProfileSetup, uploadPhoto } = useProfile();

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<'individual' | 'couple' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- DEFAULT SAFE INITIAL STATE TO AVOID undefined ---- (<<< FIX: avoids runtime undefined)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let finalValue: any = value;
    if (type === 'number') finalValue = parseInt(value as string, 10);
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
      // unknown partner field — fallback to setting raw name (defensive)
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

const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (files.length + photoFiles.length > 10) {
    setValidationErrors(prev => ({ ...prev, photos: 'You can upload a maximum of 10 photos' }));
    return;
  }

  const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
  if (!user) {
    setValidationErrors(prev => ({ ...prev, photos: 'You must be logged in to upload photos' }));
    return;
  }

  const uploadedFiles: string[] = [];

  for (const file of files) {
    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    // 1️⃣ Upload the file first
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      setValidationErrors(prev => ({ ...prev, photos: 'Failed to upload file' }));
      return;
    }

    // 2️⃣ Get a signed URL *after* upload
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('profile-photos')
      .createSignedUrl(filePath, 60 * 60); // 1 hour

    if (urlError) {
      console.error('URL signing failed:', urlError);
      setValidationErrors(prev => ({ ...prev, photos: 'Failed to create photo URL' }));
      return;
    }

    uploadedFiles.push(signedUrlData.signedUrl);
  }

  setPhotoFiles(prev => [...prev, ...uploadedFiles]);
  setValidationErrors(prev => ({ ...prev, photos: '' }));
};

  // <<< FIX: More defensive submit with clearer error reporting + attach userId if present
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

        if (photoFiles.length < 2) {
            throw new Error('Please upload at least 2 photos');
        }

        // Upload photos one-by-one and collect urls. Provide better error context.
        const photoUrls: string[] = [];
        for (let i = 0; i < photoFiles.length; i++) {
            const file = photoFiles[i];
            try {
                const res = await uploadPhoto(file);
         // res type: { data: { publicUrl: string } | null, error: string | null }
if (!res) throw new Error('Upload failed');
if (res.error) throw new Error(res.error);
if (!res.data?.publicUrl) throw new Error('No URL returned');
const publicUrl = res.data.publicUrl;
photoUrls.push(publicUrl);
            } catch (fileErr: any) {
                console.error('Photo upload failed for file', file.name, fileErr);
                throw new Error(`Failed to upload photo "${file.name}": ${fileErr?.message || String(fileErr)}`);
            }
        }

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
        const finalProfileData: Profile & { userId?: string } = {
            // cast only safe fields — prevents runtime undefined from being sent
            displayName: String(formData.displayName || ''),
            displayName2: String(formData.displayName2 || ''),
            location: String(formData.location || ''),
            age: Number(formData.age || 18),
            age2: Number(formData.age2 || 18),
            bio: String(formData.bio || ''),
            photos: photoUrls,
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
            accountType: accountType,
        } as Profile & { userId?: string };

        // attach user id if available (many backends expect this)
        if (user?.id) (finalProfileData as any).userId = user.id;

        // Call the hook to persist. Provide clearer error message if it fails.
        const response = await completeProfileSetup(finalProfileData);
        // Response shape may vary; handle common shapes
        if (response.error) {
  throw new Error(response.error);
}

        // Optionally you could route or show success (not included — preserve existing routing)
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
            case 1: return Boolean(formData.displayName && formData.location && formData.gender && formData.orientation && Number(formData.age) >= 18 && formData.relationshipStatus);
            case 2: return photoFiles.length >= 2 && Boolean(formData.bio) && (String(formData.bio).length >= 69 && String(formData.bio).length <= 1000);
            case 3: return true; // Preferences are optional
            default: return false;
        }
    }
    if (accountType === 'couple') {
        switch (step) {
            case 1: return Boolean(formData.displayName && formData.displayName2 && formData.location && formData.gender && formData.gender2 && formData.orientation && formData.orientation2 && Number(formData.age) >= 18 && Number(formData.age2) >= 18 && formData.relationshipStatus);
            case 2: return photoFiles.length >= 2 && Boolean(formData.bio) && (String(formData.bio).length >= 69 && String(formData.bio).length <= 1000);
            case 3: return true;
            default: return false;
        }
    }
    return false;
  }, [step, formData, photoFiles, accountType]);

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
                <div className="space-y-2"><Label>Location (City, State)</Label><Input name="location" value={formData.location} onChange={handleInputChange} required /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Gender" name="gender" value={String(formData.gender || '')} onChange={handleInputChange} options={GENDER_OPTIONS} placeholder="Select..." required />
                    <Select label="Sexuality" name="orientation" value={String(formData.orientation || '')} onChange={handleInputChange} options={SEXUALITY_OPTIONS} placeholder="Select..." required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Age (18-99)</Label><Input name="age" type="number" min="18" max="99" value={formData.age} onChange={handleInputChange} required /></div>
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
                        <div className="space-y-2"><Label>Display Name</Label><Input name="displayName" value={formData.displayName2} onChange={(e) => handlePartnerChange('partner2', e)} required /></div>
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
             <TagMultiSelect title="Seeking" options={SEEKING_OPTIONS} selected={formData.seeking || []} onToggle={(val) => handleToggle('seeking', val)} />
             <TagMultiSelect title="Seeking Relationship Type" options={SEEKING_RELATIONSHIP_TYPE_OPTIONS} selected={formData.seekingRelationshipType || []} onToggle={(val) => handleToggle('seekingRelationshipType', val)} />
             <Select label="Lifestyle Experience Level" name="lifestyleExperience" value={String(formData.lifestyleExperience || 'New')} onChange={handleInputChange} options={EXPERIENCE_LEVEL_OPTIONS} />
            <Button onClick={nextStep} disabled={!canProceed}>Next &rarr;</Button>
          </div>
        );
      case 2: // About You
        const bioLength = String(formData.bio || '').length;
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Build Your Profile</h2>
             {/* Photo Upload */}
            <div>
              <Label>Upload Profile Photos (Min 2, Max 10)</Label>
              {validationErrors.photos && <p className="text-red-400 text-sm">{validationErrors.photos}</p>}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                {photoFiles.map((file, index) => (<div key={index} className="relative aspect-square"><img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-lg" /><button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold">×</button></div>))}
                {photoFiles.length < 10 && (<label className="aspect-square border-2 border-dashed border-brand-primary/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors"><input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" /><span className="text-brand-primary text-4xl">+</span></label>)}
              </div>
            </div>
             {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio (69-1000 characters)</Label>
              <p className="text-xs text-text-secondary mb-2">Show your personality—your vibe attracts your tribe.</p>
              <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={5} minLength={69} maxLength={1000} required />
              <p className={`text-sm mt-1 ${bioLength < 69 || bioLength > 1000 ? 'text-red-400' : 'text-text-secondary'}`}>{bioLength} / 1000</p>
            </div>
            <CheckboxGrid title={isIndividual ? "My Kinks/Fetishes" : "Our Kinks/Fetishes"} options={KINKS_OPTIONS} selected={formData.kinks || []} onToggle={(val) => handleToggle('kinks', val, 10)} max={10} error={validationErrors.kinks} />
            <CheckboxGrid title="Seeking Matches With These Interests" options={INTERESTS_OPTIONS} selected={formData.interests || []} onToggle={(val) => handleToggle('interests', val, 10)} max={10} error={validationErrors.interests} />
            <CheckboxGrid title={isIndividual ? "My Soft Limits" : "Our Soft Limits"} options={LIMITS_OPTIONS} selected={formData.softLimits || []} onToggle={(val) => handleToggle('softLimits', val, 10)} max={10} error={validationErrors.softLimits} />
            <CheckboxGrid title={isIndividual ? "My Hard Limits" : "Our Hard Limits"} options={LIMITS_OPTIONS} selected={formData.hardLimits || []} onToggle={(val) => handleToggle('hardLimits', val, 10)} max={10} error={validationErrors.hardLimits} />
            <div className="space-y-2"><Label>{isIndividual ? "My Safety/Health Practices" : "Our Safety/Health Practices"}</Label><Textarea name="safetyPractices" value={formData.safetyPractices} onChange={handleInputChange} rows={3} /></div>
            <div className="space-y-2"><Label>{isIndividual ? "My Rules (Optional)" : "Our Rules (Optional)"}</Label><Textarea name="rules" value={formData.rules} onChange={handleInputChange} rows={3} /></div>
            <div className="flex gap-4"><Button onClick={prevStep} variant="outline" className="flex-1">Back</Button><Button onClick={nextStep} disabled={!canProceed} className="flex-1">Next &rarr;</Button></div>
          </div>
        );
      case 3: // Match Preferences
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

            <div className="flex gap-4"><Button onClick={prevStep} variant="outline" className="flex-1">Back</Button><Button onClick={nextStep} className="flex-1">Continue &rarr;</Button></div>
          </div>
        );
      case 4: // Membership
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Choose Your Membership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-lg border-2 ${formData.membershipTier === 'basic' ? 'border-brand-primary' : 'border-base-300'}`}>
                    <h3 className="text-xl font-bold">Freemium - Basic</h3>
                    <ul className="list-disc list-inside my-4 space-y-2 text-text-secondary">
                        <li>✔ Basic features</li>
                        <li className="line-through">✖ Limited visibility</li>
                        <li className="line-through">✖ No priority matching</li>
                    </ul>
                    <Button 
  onClick={() => setFormData(p => ({...p, membershipTier: 'basic'}))} 
  variant={formData.membershipTier === 'basic' ? 'primary' : 'outline'}
>
  Stay Basic
</Button>
                </div>
                 <div className={`p-6 rounded-lg border-2 ${formData.membershipTier === 'vip' ? 'border-brand-primary' : 'border-base-300'}`}>
                    <h3 className="text-xl font-bold text-brand-secondary">🌟 VIP Membership</h3>
                    <ul className="list-disc list-inside my-4 space-y-2 text-text-primary">
                        <li>🌟 All features unlocked</li>
                        <li>🔍 Priority match visibility</li>
                        <li>💬 Unlimited messages</li>
                        <li>💖 Access to VIP-only events</li>
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
            <Button onClick={handleSubmit} isLoading={loading} className="w-full">{loading ? 'Saving...' : `Complete ${isIndividual ? 'My' : 'Our'} Profile 🎉`}</Button>
          </div>
        );
      default: return null;
    }
  }

  const progress = useMemo(() => {
    if (step === 0) return 0;
    return (step / 4) * 100;
  }, [step]);

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
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ background: 'radial-gradient(ellipse at center, rgba(255,20,147,0.15) 0%, rgba(16,16,16,1) 70%)', filter: 'blur(2px)', transform: 'scale(1.1)' }} />
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-3xl mx-auto p-8 bg-black/70 rounded-2xl border-2 border-brand-primary/60 shadow-lg shadow-brand-primary/20 backdrop-blur-sm animate-fade-in">

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
            <div className="space-y-8 animate-fade-in text-center">
                <h2 className="text-3xl font-bold text-white">Let’s Get You Started!</h2>
                <p className="text-text-secondary">Where open-minded connections begin.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => setAccountType('individual')} className={`p-8 rounded-lg border-2 transition-all ${accountType === 'individual' ? 'border-brand-primary bg-brand-primary/10' : 'border-base-300 hover:border-brand-primary/50'}`}>
                        <span className="text-5xl">🧍</span>
                        <h3 className="text-xl font-bold mt-4">Individual Account</h3>
                    </button>
                    <button onClick={() => setAccountType('couple')} className={`p-8 rounded-lg border-2 transition-all ${accountType === 'couple' ? 'border-brand-primary bg-brand-primary/10' : 'border-base-300 hover:border-brand-primary/50'}`}>
                        <span className="text-5xl">👩‍❤️‍👨</span>
                        <h3 className="text-xl font-bold mt-4">Couples Account</h3>
                    </button>
                </div>
                <Button onClick={nextStep} disabled={!accountType}>Continue &rarr;</Button>
            </div>
          )}

          {step > 0 && <div className="animate-fade-in">{renderStepContent()}</div>}

        </div>
      </div>
    </div>
  );
};
