// Individual Step 9: Communication Preferences
import React from 'react';
import { Button } from '../../../Button';
import { SectionHeader, RadioGrid } from '../../FormComponents';
import { 
  TEXTING_FREQUENCY_OPTIONS,
  PHONE_CALL_OPTIONS,
  VIDEO_CHAT_OPTIONS,
  RESPONSE_TIME_OPTIONS,
  COMMUNICATION_STYLE_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step9_Communication: React.FC<Props> = ({ formData, onSelect, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Communication Preferences"
        subtitle="Help others understand how you like to communicate"
      />
      
      <RadioGrid
        title="Texting Frequency"
        options={TEXTING_FREQUENCY_OPTIONS}
        selected={formData.textingFrequencyPreference || ''}
        onSelect={(val) => onSelect('textingFrequencyPreference', val)}
      />
      
      <RadioGrid
        title="Phone Calls"
        options={PHONE_CALL_OPTIONS}
        selected={formData.phoneCallPreference || ''}
        onSelect={(val) => onSelect('phoneCallPreference', val)}
      />
      
      <RadioGrid
        title="Video Chats"
        options={VIDEO_CHAT_OPTIONS}
        selected={formData.videoChatComfort || ''}
        onSelect={(val) => onSelect('videoChatComfort', val)}
      />
      
      <RadioGrid
        title="Response Time Expectations"
        options={RESPONSE_TIME_OPTIONS}
        selected={formData.responseTimeExpectation || ''}
        onSelect={(val) => onSelect('responseTimeExpectation', val)}
      />
      
      <RadioGrid
        title="Communication Style"
        options={COMMUNICATION_STYLE_OPTIONS}
        selected={formData.communicationStyle || ''}
        onSelect={(val) => onSelect('communicationStyle', val)}
      />
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button onClick={onNext} className="flex-1">Next →</Button>
      </div>
    </div>
  );
};