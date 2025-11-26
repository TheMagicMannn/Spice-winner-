// Individual Step 15: Preferences & Deal Breakers
import React from 'react';
import { Button } from '../../../Button';
import { Label } from '../../../Label';
import { SectionHeader, CheckboxGrid } from '../../FormComponents';
import { 
  DEAL_BREAKERS_OPTIONS,
  MUST_HAVES_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onToggle: (field: keyof Profile, value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step15_Preferences: React.FC<Props> = ({ formData, onToggle, onInputChange, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Match Preferences & Deal Breakers"
        subtitle="Help us find your ideal connections"
      />
      
      <CheckboxGrid
        title="Deal Breakers (Select up to 10)"
        options={DEAL_BREAKERS_OPTIONS}
        selected={formData.dealBreakersAbsolute || []}
        onToggle={(val) => onToggle('dealBreakersAbsolute', val)}
        max={10}
        columns={2}
      />
      
      <CheckboxGrid
        title="Must Haves (Select up to 10)"
        options={MUST_HAVES_OPTIONS}
        selected={formData.mustHavesList || []}
        onToggle={(val) => onToggle('mustHavesList', val)}
        max={10}
        columns={2}
      />
      
      <CheckboxGrid
        title="Nice to Haves (Select up to 10)"
        options={MUST_HAVES_OPTIONS}
        selected={formData.niceToHavesList || []}
        onToggle={(val) => onToggle('niceToHavesList', val)}
        max={10}
        columns={2}
      />
      
      <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
        <p className="font-semibold text-brand-secondary">Age Preference</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minimum Age: {formData.matchPreferences?.ageRange?.[0] || 18}</Label>
            <input
              type="range"
              min="18"
              max="99"
              value={formData.matchPreferences?.ageRange?.[0] || 18}
              onChange={(e) => {
                const newMin = parseInt(e.target.value);
                const currentMax = formData.matchPreferences?.ageRange?.[1] || 55;
                onInputChange({
                  target: {
                    name: 'matchPreferences.ageRange',
                    value: JSON.stringify([newMin, currentMax])
                  }
                } as any);
              }}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Maximum Age: {formData.matchPreferences?.ageRange?.[1] || 55}</Label>
            <input
              type="range"
              min="18"
              max="99"
              value={formData.matchPreferences?.ageRange?.[1] || 55}
              onChange={(e) => {
                const currentMin = formData.matchPreferences?.ageRange?.[0] || 18;
                const newMax = parseInt(e.target.value);
                onInputChange({
                  target: {
                    name: 'matchPreferences.ageRange',
                    value: JSON.stringify([currentMin, newMax])
                  }
                } as any);
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2 p-4 border border-brand-primary/30 rounded-lg">
        <Label>Distance Willing to Travel: {formData.travelDistanceWilling || 50} miles</Label>
        <input
          type="range"
          min="0"
          max="200"
          step="10"
          value={formData.travelDistanceWilling || 50}
          onChange={(e) => onInputChange({
            target: {
              name: 'travelDistanceWilling',
              value: e.target.value
            }
          } as any)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-text-secondary">
          <span>0 mi</span>
          <span>50 mi</span>
          <span>100 mi</span>
          <span>150 mi</span>
          <span>200+ mi</span>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button onClick={onNext} className="flex-1">Next →</Button>
      </div>
    </div>
  );
};