// Individual Step 14: Interests & Activities
import React from 'react';
import { Button } from '../../../Button';
import { Textarea } from '../../../Textarea';
import { Label } from '../../../Label';
import { SectionHeader, CheckboxGrid } from '../../FormComponents';
import { 
  VANILLA_INTERESTS_OPTIONS,
  LIFESTYLE_ACTIVITIES_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onToggle: (field: keyof Profile, value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step14_Interests: React.FC<Props> = ({ formData, onToggle, onInputChange, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Interests & Activities"
        subtitle="What do you enjoy doing in your free time?"
      />
      
      <CheckboxGrid
        title="Vanilla Interests (Select all that apply)"
        options={VANILLA_INTERESTS_OPTIONS}
        selected={formData.interests || []}
        onToggle={(val) => onToggle('interests', val)}
        columns={3}
      />
      
      <CheckboxGrid
        title="Kink/Lifestyle Activities"
        options={LIFESTYLE_ACTIVITIES_OPTIONS}
        selected={formData.lifestyleActivities || []}
        onToggle={(val) => onToggle('lifestyleActivities', val)}
      />
      
      <div className="space-y-2">
        <Label>Activities You'd Like to Try (Optional)</Label>
        <Textarea
          name="tryingInterests"
          value={formData.tryingInterests || ''}
          onChange={onInputChange}
          rows={3}
          placeholder="List activities or experiences you're curious about..."
        />
      </div>
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button onClick={onNext} className="flex-1">Next →</Button>
      </div>
    </div>
  );
};