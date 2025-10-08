import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Label } from '../components/Label';
import { RadioGroup, RadioGroupItem } from '../components/RadioGroup';
import { Spinner } from '../components/Spinner';

const INTERESTS = [
  'Wine Tasting', 'Yoga', 'Travel', 'Fine Dining', 'Art', 'Dancing',
  'Hiking', 'Photography', 'Music', 'Fitness', 'Cooking', 'Reading',
  'Movies', 'Theater', 'Sports', 'Gaming', 'Fashion', 'Meditation',
  'Nightlife', 'Beach'
];

export const ProfileSetupPage: React.FC = () => {
  const { user } = useAuth();
  const { completeProfileSetup, uploadPhoto } = useProfile();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    accountType: 'single' as 'single' | 'couple',
    displayName: '',
    age: '',
    bio: '',
    location: '',
    gender: '',
    orientation: '',
    interests: [] as string[],
    photos: [] as string[],
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  useEffect(() => {
    if (user?.profile) {
      setFormData(currentData => ({
        ...currentData,
        displayName: user.profile.displayName || '',
        age: user.profile.age?.toString() || '',
        accountType: user.profile.accountType || 'single',
      }));
    }
  }, [user]);
  
  const inputClasses = "bg-black/50 border-brand-primary/50 text-white placeholder:text-white/60 focus:border-brand-primary";

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 6) {
      setValidationError('You can upload a maximum of 6 photos');
      return;
    }
    setPhotoFiles([...photoFiles, ...files]);
    setValidationError(null);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    setValidationError(null);
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter((i) => i !== interest),
      });
    } else {
      if (formData.interests.length >= 10) {
        setValidationError('You can select up to 10 interests');
        return;
      }
      setFormData({
        ...formData,
        interests: [...formData.interests, interest],
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (photoFiles.length < 2) {
         throw new Error('Please upload at least 2 photos');
      }

      // Upload photos first
      const photoUrls: string[] = [];
      for (const file of photoFiles) {
        const { data, error } = await uploadPhoto(file);
        if (error || !data) throw new Error(error || 'Failed to upload photo.');
        if (data.publicUrl) photoUrls.push(data.publicUrl);
      }

      const { error: setupError } = await completeProfileSetup({
        ...formData,
        age: parseInt(formData.age),
        photos: photoUrls,
      });

      if (setupError) throw new Error(setupError);

      // On success, App.tsx will navigate to dashboard automatically
    } catch (err: any) {
      setError((err as Error).message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = formData.displayName && formData.age && parseInt(formData.age) >= 18;
  const canProceedStep2 = formData.bio && formData.location;
  const canProceedStep3 = formData.interests.length >= 3;
  const canSubmit = photoFiles.length >= 2;

  // FIX: Refactored ActionButton to accept isLoading and loadingText props to display a spinner during async operations.
  interface ActionButtonProps {
    onClick: () => unknown;
    disabled: boolean;
    isLoading?: boolean;
    loadingText?: string;
  }
  const ActionButton = ({ onClick, disabled, isLoading, loadingText, children }: React.PropsWithChildren<ActionButtonProps>) => (
    <button onClick={onClick} disabled={disabled || !!isLoading} className="w-full py-3 px-5 bg-gray-900 text-white font-bold text-lg rounded-full border-2 border-brand-primary/50 transition-all duration-300 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/50 animate-glow disabled:opacity-50 disabled:cursor-not-allowed">
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Spinner />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </span>
      ) : (
        children
      )}
    </button>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,20,147,0.15) 0%, rgba(16,16,16,1) 70%)',
          filter: 'blur(2px)',
          transform: 'scale(1.1)',
        }}
      />
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl mx-auto p-8 bg-black/70 rounded-2xl border-2 border-brand-primary/60 shadow-lg shadow-brand-primary/20 backdrop-blur-sm animate-fade-in">
          
          <div className="text-center mb-8">
            <h1 
              className="text-4xl font-bold mb-3"
              style={{ 
                background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(255, 20, 147, 0.5)',
              }}
            >
              SPICE
            </h1>
            <div 
              className="w-16 h-1 mx-auto rounded-full mb-4"
              style={{
                background: 'linear-gradient(90deg, #ff1493, #ff69b4)',
                boxShadow: '0 0 10px rgba(255, 20, 147, 0.8)'
              }}
            />
            <h2 className="text-xl font-semibold mb-2 text-white">Complete Your Profile</h2>
            <p className="text-sm text-text-secondary">Let's set up your presence on SPICE</p>
          </div>
          
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1 flex-1 max-w-[80px] rounded-full ${s <= step ? 'bg-brand-primary' : 'bg-white/20'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Basic Information</h2>
              <div className="space-y-2">
                <Label className="text-white">Profile Type</Label>
                <RadioGroup value={formData.accountType} onValueChange={(value: 'single' | 'couple') => setFormData({ ...formData, accountType: value })}>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="single" id="single" /><Label htmlFor="single" className="text-white mb-0">Single</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="couple" id="couple" /><Label htmlFor="couple" className="text-white mb-0">Couple</Label></div>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2"><Label htmlFor="displayName" className="text-white">Display Name</Label><Input id="displayName" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} placeholder="Enter your display name" className={inputClasses} /></div>
              <div className="space-y-2"><Label htmlFor="age" className="text-white">Age</Label><Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Must be 18+" min="18" className={inputClasses} /></div>
              <div className="space-y-2"><Label htmlFor="gender" className="text-white">Gender (Optional)</Label><Input id="gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} placeholder="e.g., Male, Female, Non-binary" className={inputClasses} /></div>
              <ActionButton onClick={() => setStep(2)} disabled={!canProceedStep1}>Continue</ActionButton>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">About You</h2>
              <div className="space-y-2"><Label htmlFor="bio" className="text-white">Bio</Label><Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." rows={4} className={inputClasses} /></div>
              <div className="space-y-2"><Label htmlFor="location" className="text-white">Location</Label><Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, State" className={inputClasses}/></div>
              <div className="space-y-2"><Label htmlFor="orientation" className="text-white">Orientation (Optional)</Label><Input id="orientation" value={formData.orientation} onChange={(e) => setFormData({ ...formData, orientation: e.target.value })} placeholder="e.g., Straight, Gay, Bisexual" className={inputClasses} /></div>
              <div className="flex gap-4"><Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button><div className="flex-1"><ActionButton onClick={() => setStep(3)} disabled={!canProceedStep2}>Continue</ActionButton></div></div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Your Interests</h2>
              <p className="text-text-secondary text-sm text-center">Select at least 3 interests. {validationError && <span className="text-red-400">{validationError}</span>}</p>
              <div className="flex flex-wrap gap-2 justify-center">{INTERESTS.map((interest) => (<button key={interest} onClick={() => toggleInterest(interest)} className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${formData.interests.includes(interest) ? 'bg-brand-primary text-white' : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'}`}>{interest}</button>))}</div>
              <div className="flex gap-4"><Button onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button><div className="flex-1"><ActionButton onClick={() => setStep(4)} disabled={!canProceedStep3}>Continue</ActionButton></div></div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Add Photos</h2>
              <p className="text-text-secondary text-sm text-center">Upload at least 2 photos (max 6). {validationError && <span className="text-red-400">{validationError}</span>}</p>
              <div className="grid grid-cols-3 gap-4">
                {photoFiles.map((file, index) => (<div key={index} className="relative aspect-square"><img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-lg" /><button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold">×</button></div>))}
                {photoFiles.length < 6 && (<label className="aspect-square border-2 border-dashed border-brand-primary/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors"><input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" /><span className="text-brand-primary text-4xl">+</span></label>)}
              </div>
              {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}
              <div className="flex gap-4">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1">Back</Button>
                <div className="flex-1">
                  <ActionButton onClick={handleSubmit} disabled={!canSubmit} isLoading={loading} loadingText="Creating Profile...">
                    Complete Profile
                  </ActionButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
       <style>{`
        .animate-glow {
          animation: glow 2.4s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255, 20, 147, 0.5);
            border-color: rgba(255, 20, 147, 0.5);
          }
          50% {
            box-shadow: 0 0 16px rgba(255, 20, 147, 1);
            border-color: rgba(255, 20, 147, 1);
          }
        }
      `}</style>
    </div>
  );
};