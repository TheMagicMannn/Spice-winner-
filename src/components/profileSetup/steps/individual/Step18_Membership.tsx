// Individual Step 18: Membership & Final Review
import React from 'react';
import { Button } from '../../../Button';
import { Spinner } from '../../../Spinner';
import { SectionHeader, InfoBox } from '../../FormComponents';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onSubmit: () => void;
  onPrev: () => void;
  loading: boolean;
}

export const Step18_Membership: React.FC<Props> = ({ formData, onSelect, onSubmit, onPrev, loading }) => {
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [confirmedAge, setConfirmedAge] = React.useState(false);
  const [confirmedTruthful, setConfirmedTruthful] = React.useState(false);
  
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Choose Your Membership"
        subtitle="Select the membership tier that's right for you"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => onSelect('membershipTier', 'basic')}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            formData.membershipTier === 'basic'
              ? 'border-brand-primary bg-brand-primary/10'
              : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
          }`}
        >
          <h3 className="text-xl font-bold text-white mb-3">Basic (Free)</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>✓ Create complete profile</li>
            <li>✓ Browse profiles</li>
            <li>✓ Send messages</li>
            <li>✓ Basic search</li>
            <li>✓ View public photos</li>
            <li>✓ Join community events</li>
          </ul>
        </button>
        
        <button
          type="button"
          onClick={() => onSelect('membershipTier', 'vip')}
          className={`p-6 rounded-xl border-2 transition-all text-left relative ${
            formData.membershipTier === 'vip'
              ? 'border-brand-primary bg-brand-primary/10'
              : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
          }`}
        >
          <div className="absolute -top-3 right-4 bg-brand-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
            POPULAR
          </div>
          <h3 className="text-xl font-bold text-white mb-1">VIP ($24.99/mo)</h3>
          <p className="text-xs text-brand-secondary mb-3">Cancel anytime</p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>✓ <strong className="text-white">Everything in Basic</strong></li>
            <li>✓ Advanced search filters</li>
            <li>✓ See who viewed you</li>
            <li>✓ See who liked you</li>
            <li>✓ Priority messaging</li>
            <li>✓ Unlimited photo uploads</li>
            <li>✓ Video profile</li>
            <li>✓ Event notifications</li>
            <li>✓ Priority support</li>
            <li>✓ Early access to features</li>
          </ul>
        </button>
      </div>
      
      <InfoBox type="info">
        <p className="text-sm font-semibold mb-2">Your Profile Summary</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-text-secondary">Experience:</span> <span className="text-white">{formData.experienceLevel || 'Not set'}</span>
          </div>
          <div>
            <span className="text-text-secondary">Communities:</span> <span className="text-white">{formData.lifestyleIdentities?.length || 0}</span>
          </div>
          <div>
            <span className="text-text-secondary">Seeking:</span> <span className="text-white">{formData.intentHereFor?.length || 0} types</span>
          </div>
          <div>
            <span className="text-text-secondary">Photos:</span> <span className="text-white">{formData.photos?.length || 0}</span>
          </div>
        </div>
      </InfoBox>
      
      <div className="p-6 border border-brand-primary/30 rounded-lg space-y-4">
        <p className="font-semibold text-white">Consent & Agreements</p>
        
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={confirmedAge}
            onChange={(e) => setConfirmedAge(e.target.checked)}
            className="w-5 h-5 mt-0.5"
            required
          />
          <span className="text-sm text-white">
            I confirm that I am 18 years or older <span className="text-red-400">*</span>
          </span>
        </label>
        
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 mt-0.5"
            required
          />
          <span className="text-sm text-white">
            I agree to the <a href="/terms" className="text-brand-secondary underline" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-brand-secondary underline" target="_blank">Privacy Policy</a> <span className="text-red-400">*</span>
          </span>
        </label>
        
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={confirmedTruthful}
            onChange={(e) => setConfirmedTruthful(e.target.checked)}
            className="w-5 h-5 mt-0.5"
            required
          />
          <span className="text-sm text-white">
            I confirm that all information provided is truthful and photos are of me <span className="text-red-400">*</span>
          </span>
        </label>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onSubmit} 
          disabled={loading || !agreedToTerms || !confirmedAge || !confirmedTruthful || !formData.membershipTier}
          className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary"
        >
          {loading ? <Spinner /> : 'Complete Profile Setup ✓'}
        </Button>
      </div>
    </div>
  );
};