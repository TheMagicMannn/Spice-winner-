// Individual Step 10: Sexual Health & Safety
import React from 'react';
import { Button } from '../../../Button';
import { Input } from '../../../Input';
import { Label } from '../../../Label';
import { SectionHeader, RadioGrid, Select, InfoBox } from '../../FormComponents';
import { 
  STI_TESTING_FREQUENCY_OPTIONS,
  TESTING_REQUIREMENT_OPTIONS,
  BIRTH_CONTROL_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step10_SexualHealth: React.FC<Props> = ({ formData, onSelect, onInputChange, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Sexual Health & Safety"
        subtitle="Your health and safety matter to us and your connections"
      />
      
      <InfoBox type="info">
        <p className="text-sm">
          Being transparent about sexual health helps build trust and ensures everyone's safety. 
          All information is private and only shared with your consent.
        </p>
      </InfoBox>
      
      <RadioGrid
        title="STI Testing Frequency"
        options={STI_TESTING_FREQUENCY_OPTIONS}
        selected={formData.stiTestingFrequency || ''}
        onSelect={(val) => onSelect('stiTestingFrequency', val)}
      />
      
      <div className="space-y-2">
        <Label>Last STI Test Date</Label>
        <Input
          type="date"
          name="lastSTITestDate"
          value={formData.lastSTITestDate || ''}
          onChange={onInputChange}
        />
      </div>
      
      <RadioGrid
        title="Do you require testing before play?"
        options={TESTING_REQUIREMENT_OPTIONS}
        selected={formData.testingRequiredBeforePlay ? 'Yes, must see recent results' : ''}
        onSelect={(val) => onSelect('testingRequiredBeforePlay', val.startsWith('Yes'))}
      />
      
      <Select
        label="Birth Control (if applicable)"
        value={formData.birthControl || ''}
        onChange={(e) => onSelect('birthControl', e.target.value)}
        options={BIRTH_CONTROL_OPTIONS}
        placeholder="Select birth control method..."
      />
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button onClick={onNext} className="flex-1">Next →</Button>
      </div>
    </div>
  );
};