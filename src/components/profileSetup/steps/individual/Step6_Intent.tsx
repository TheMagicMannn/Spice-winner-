// Individual Step 6: Intent & What You're Seeking
import React from 'react';
import { Button } from '../../../Button';
import { Input } from '../../../Input';
import { SectionHeader, CheckboxGrid, Select } from '../../FormComponents';
import { INTENT_OPTIONS, POLY_ROLE_OPTIONS } from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onToggle: (field: keyof Profile, value: string) => void;
  onSelect: (field: string, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step6_Intent: React.FC<Props> = ({ formData, onToggle, onSelect, onNext, onPrev }) => {
  const hasDsDynamic = formData.intentHereFor?.includes('D/s Dynamic');
  const hasCollarOwnership = formData.intentHereFor?.includes('Finding a collar/ownership situation');
  const hasPolyExpansion = formData.intentHereFor?.includes('Polyamorous Relationship') || 
                          formData.intentHereFor?.includes('Joining a Polycule') ||
                          formData.intentHereFor?.includes('Building a Triad/Quad');

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="What Are You Here For?"
        subtitle="Select up to 5 primary intentions"
      />
      
      <CheckboxGrid
        title="Your Intentions (Select up to 5)"
        options={INTENT_OPTIONS}
        selected={formData.intentHereFor || []}
        onToggle={(val) => onToggle('intentHereFor', val)}
        max={5}
      />
      
      {hasDsDynamic && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-3">
          <p className="font-semibold text-brand-secondary">D/s Dynamic Preference</p>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="dsPreference"
                checked={formData.bdsmRolePrimary?.includes('Dominant')}
                onChange={() => onSelect('dsPreference', 'dominant')}
                className="w-4 h-4"
              />
              <span className="text-sm">Looking to be Dominant/Top</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="dsPreference"
                checked={formData.bdsmRolePrimary?.includes('Submissive')}
                onChange={() => onSelect('dsPreference', 'submissive')}
                className="w-4 h-4"
              />
              <span className="text-sm">Looking to be Submissive/Bottom</span>
            </label>
          </div>
        </div>
      )}
      
      {hasCollarOwnership && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-3">
          <p className="font-semibold text-brand-secondary">Collar/Ownership</p>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="collarPreference"
                checked={formData.lookingForCollarOwnership}
                onChange={() => onSelect('lookingForCollarOwnership', true)}
                className="w-4 h-4"
              />
              <span className="text-sm">Looking to be owned/collared</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="collarPreference"
                checked={!formData.lookingForCollarOwnership}
                onChange={() => onSelect('lookingForCollarOwnership', false)}
                className="w-4 h-4"
              />
              <span className="text-sm">Looking to own/collar someone</span>
            </label>
          </div>
        </div>
      )}
      
      {hasPolyExpansion && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-3">
          <Select
            label="Preferred Poly Role/Structure"
            value={formData.polyRole || ''}
            onChange={(e) => onSelect('polyRole', e.target.value)}
            options={POLY_ROLE_OPTIONS}
            placeholder="Select your preferred poly role..."
          />
        </div>
      )}
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.intentHereFor || formData.intentHereFor.length === 0}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};