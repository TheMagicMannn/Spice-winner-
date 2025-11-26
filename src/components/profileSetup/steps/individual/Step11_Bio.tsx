// Individual Step 11: Bio & Personality
import React from 'react';
import { Button } from '../../../Button';
import { Textarea } from '../../../Textarea';
import { Label } from '../../../Label';
import { SectionHeader, CheckboxGrid, RadioGrid } from '../../FormComponents';
import { 
  PERSONALITY_TRAITS_OPTIONS,
  LOVE_LANGUAGES_OPTIONS,
  ATTACHMENT_STYLE_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onToggle: (field: keyof Profile, value: string) => void;
  onSelect: (field: string, value: any) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step11_Bio: React.FC<Props> = ({ formData, onToggle, onSelect, onInputChange, onNext, onPrev }) => {
  const bioLength = (formData.bio || '').length;
  
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="About Me"
        subtitle="Show your personality - your vibe attracts your tribe!"
      />
      
      <div className="space-y-2">
        <Label>Your Bio (300-2000 characters)</Label>
        <p className="text-sm text-text-secondary">
          Tell us about yourself. What makes you unique? What are you passionate about? What's your vibe?
        </p>
        <Textarea
          name="bio"
          value={formData.bio || ''}
          onChange={onInputChange}
          rows={8}
          minLength={300}
          maxLength={2000}
          placeholder="Share your story, interests, what you're looking for, and what makes you YOU..."
          required
        />
        <p className={`text-sm ${bioLength < 300 || bioLength > 2000 ? 'text-red-400' : 'text-text-secondary'}`}>
          {bioLength} / 2000 characters {bioLength < 300 && `(${300 - bioLength} more needed)`}
        </p>
      </div>
      
      <CheckboxGrid
        title="Personality Traits (Select up to 8)"
        options={PERSONALITY_TRAITS_OPTIONS}
        selected={formData.personalityTraits || []}
        onToggle={(val) => onToggle('personalityTraits', val)}
        max={8}
        columns={3}
      />
      
      <CheckboxGrid
        title="Love Languages (Select top 3)"
        options={LOVE_LANGUAGES_OPTIONS}
        selected={formData.loveLanguages || []}
        onToggle={(val) => onToggle('loveLanguages', val)}
        max={3}
      />
      
      <RadioGrid
        title="Attachment Style"
        options={ATTACHMENT_STYLE_OPTIONS}
        selected={formData.attachmentStyle || ''}
        onSelect={(val) => onSelect('attachmentStyle', val)}
      />
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={bioLength < 300 || bioLength > 2000}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};