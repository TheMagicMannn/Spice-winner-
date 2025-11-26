// Individual Step 2: Experience Level & Current Status
import React from 'react';
import { Button } from '../../../Button';
import { Label } from '../../../Label';
import { SectionHeader, RadioGrid, InfoBox } from '../../FormComponents';
import { EXPERIENCE_LEVEL_OPTIONS, CURRENTLY_ACTIVE_OPTIONS } from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2_Experience: React.FC<Props> = ({ formData, onSelect, onInputChange, onNext, onPrev }) => {
  const isExperienced = formData.experienceLevel && 
    ['experienced', 'veteran', '24_7_lifestyle'].includes(formData.experienceLevel);

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Your Experience Level"
        subtitle="Help us understand where you are in your journey"
      />
      
      <RadioGrid
        title="What's your experience level in alternative lifestyles?"
        options={EXPERIENCE_LEVEL_OPTIONS}
        selected={formData.experienceLevel || ''}
        onSelect={(val) => onSelect('experienceLevel', val)}
      />
      
      {formData.experienceLevel && formData.experienceLevel !== 'curious_newbie' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>How many years active in the lifestyle?</Label>
            <input
              type="number"
              name="yearsInLifestyle"
              min="0"
              max="50"
              value={formData.yearsInLifestyle || ''}
              onChange={onInputChange}
              className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3"
              placeholder="Years"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Are you currently active?</Label>
            <div className="grid grid-cols-1 gap-2">
              {CURRENTLY_ACTIVE_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect('currentlyActive', option === 'Yes')}
                  className={`py-3 px-4 rounded-lg text-left transition-all ${
                    (formData.currentlyActive && option === 'Yes') || 
                    (!formData.currentlyActive && option !== 'Yes')
                      ? 'bg-brand-primary text-white'
                      : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {isExperienced && (
            <>
              <div className="space-y-2">
                <Label>Have you attended events/munches/parties?</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => onSelect('localEventsAttend', true)}
                    className={`flex-1 py-3 px-4 rounded-lg ${
                      formData.localEventsAttend
                        ? 'bg-brand-primary text-white'
                        : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect('localEventsAttend', false)}
                    className={`flex-1 py-3 px-4 rounded-lg ${
                      formData.localEventsAttend === false
                        ? 'bg-brand-primary text-white'
                        : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Are you part of any local communities?</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => onSelect('onlineCommunitiesActive', true)}
                    className={`flex-1 py-3 px-4 rounded-lg ${
                      formData.onlineCommunitiesActive
                        ? 'bg-brand-primary text-white'
                        : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect('onlineCommunitiesActive', false)}
                    className={`flex-1 py-3 px-4 rounded-lg ${
                      formData.onlineCommunitiesActive === false
                        ? 'bg-brand-primary text-white'
                        : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {formData.experienceLevel === 'curious_newbie' && (
        <InfoBox type="info">
          <p className="text-sm">Welcome! We'll guide you through the process and provide helpful explanations along the way.</p>
        </InfoBox>
      )}
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.experienceLevel} 
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};