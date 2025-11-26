// Individual Step 4: Lifestyle Community Identification
import React from 'react';
import { Button } from '../../../Button';
import { Input } from '../../../Input';
import { SectionHeader, CheckboxGrid, RadioGrid } from '../../FormComponents';
import { LIFESTYLE_COMMUNITIES } from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onToggle: (field: keyof Profile, value: string) => void;
  onSelect: (field: string, value: any) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step4_CommunityID: React.FC<Props> = ({ 
  formData, 
  onToggle, 
  onSelect,
  onInputChange,
  onNext, 
  onPrev 
}) => {
  const [otherCommunity, setOtherCommunity] = React.useState('');
  
  const communitiesWithOther = formData.lifestyleIdentities?.includes('Other') && otherCommunity
    ? [...(formData.lifestyleIdentities.filter(c => c !== 'Other')), otherCommunity]
    : formData.lifestyleIdentities || [];

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Lifestyle Community Identification"
        subtitle="Which communities do you identify with? (Select all that apply)"
      />
      
      <CheckboxGrid
        title="Select All Communities That Represent You"
        options={LIFESTYLE_COMMUNITIES}
        selected={formData.lifestyleIdentities || []}
        onToggle={(val) => onToggle('lifestyleIdentities', val)}
      />
      
      {formData.lifestyleIdentities?.includes('Other') && (
        <div className="space-y-2">
          <Input
            placeholder="Please specify other community..."
            value={otherCommunity}
            onChange={(e) => setOtherCommunity(e.target.value)}
          />
        </div>
      )}
      
      {formData.lifestyleIdentities && formData.lifestyleIdentities.length > 0 && (
        <div className="space-y-2">
          <RadioGrid
            title="Which community BEST represents your primary identity?"
            options={communitiesWithOther.filter(c => c !== 'Other')}
            selected={formData.relationshipStatus || ''}
            onSelect={(val) => onSelect('relationshipStatus', val)}
          />
        </div>
      )}
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.lifestyleIdentities || formData.lifestyleIdentities.length === 0}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};