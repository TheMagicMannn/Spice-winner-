// Individual Step 13: Lifestyle & Availability
import React from 'react';
import { Button } from '../../../Button';
import { Input } from '../../../Input';
import { Textarea } from '../../../Textarea';
import { Label } from '../../../Label';
import { SectionHeader, CheckboxGrid, RadioGrid, Select } from '../../FormComponents';
import { 
  WORK_SCHEDULE_OPTIONS,
  AVAILABILITY_OPTIONS,
  CHILDREN_OPTIONS,
  DISCRETION_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onToggle: (field: keyof Profile, value: string) => void;
  onSelect: (field: string, value: any) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step13_Lifestyle: React.FC<Props> = ({ formData, onToggle, onSelect, onInputChange, onNext, onPrev }) => {
  const hasChildren = formData.hasChildren;
  
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Lifestyle & Availability"
        subtitle="Help others understand your schedule and lifestyle"
      />
      
      <Select
        label="Work Schedule"
        value={formData.workScheduleType || ''}
        onChange={(e) => onSelect('workScheduleType', e.target.value)}
        options={WORK_SCHEDULE_OPTIONS}
        placeholder="Select your work schedule..."
      />
      
      <CheckboxGrid
        title="Available for Dates/Play"
        options={AVAILABILITY_OPTIONS}
        selected={formData.availabilityTimes || []}
        onToggle={(val) => onToggle('availabilityTimes', val)}
      />
      
      <RadioGrid
        title="Children"
        options={CHILDREN_OPTIONS}
        selected={hasChildren ? 'Have children (live with me full-time)' : 'No children'}
        onSelect={(val) => onSelect('hasChildren', val !== 'No children')}
      />
      
      {hasChildren && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-4">
          <div className="space-y-2">
            <Label>Do your children live with you?</Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onSelect('childrenLiveWith', true)}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  formData.childrenLiveWith
                    ? 'bg-brand-primary text-white'
                    : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onSelect('childrenLiveWith', false)}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  formData.childrenLiveWith === false
                    ? 'bg-brand-primary text-white'
                    : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                }`}
              >
                No
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Parenting Schedule (if applicable)</Label>
            <Textarea
              name="parentingSchedule"
              value={formData.parentingSchedule || ''}
              onChange={onInputChange}
              rows={2}
              placeholder="e.g., Every other weekend, 50/50 custody, etc."
            />
          </div>
        </div>
      )}
      
      <RadioGrid
        title="Discretion Needs"
        options={DISCRETION_OPTIONS}
        selected={formData.discretionNeeds || ''}
        onSelect={(val) => onSelect('discretionNeeds', val)}
      />
      
      <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
        <p className="font-semibold text-brand-secondary">Who knows about your lifestyle?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Family</Label>
            <div className="flex gap-2">
              {['Yes', 'No', 'Some'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect('outToFamily', option === 'Yes')}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg ${
                    (formData.outToFamily && option === 'Yes') ||
                    (!formData.outToFamily && option !== 'Yes')
                      ? 'bg-brand-primary text-white'
                      : 'bg-black/50 text-text-secondary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Friends</Label>
            <div className="flex gap-2">
              {['Yes', 'No', 'Some'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect('outToVanillaFriends', option === 'Yes')}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg ${
                    (formData.outToVanillaFriends && option === 'Yes') ||
                    (!formData.outToVanillaFriends && option !== 'Yes')
                      ? 'bg-brand-primary text-white'
                      : 'bg-black/50 text-text-secondary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Work</Label>
            <div className="flex gap-2">
              {['Yes', 'No'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect('outAtWork', option === 'Yes')}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg ${
                    (formData.outAtWork && option === 'Yes') ||
                    (!formData.outAtWork && option !== 'Yes')
                      ? 'bg-brand-primary text-white'
                      : 'bg-black/50 text-text-secondary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button onClick={onNext} className="flex-1">Next →</Button>
      </div>
    </div>
  );
};