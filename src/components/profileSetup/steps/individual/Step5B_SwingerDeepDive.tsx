// Individual Step 5B: Swinger Deep Dive
import React from 'react';
import { Button } from '../../../Button';
import { Input } from '../../../Input';
import { Label } from '../../../Label';
import { SectionHeader, SubsectionHeader, CheckboxGrid, RadioGrid, Select } from '../../FormComponents';
import { 
  SWINGER_TYPE_OPTIONS,
  SWAP_PREFERENCES_OPTIONS,
  CLUB_EXPERIENCE_OPTIONS,
  FAVORITE_CLUB_TYPES_OPTIONS,
  PARTY_SIZE_PREFERENCE_OPTIONS,
  GROUP_PLAY_MAX_SIZE_OPTIONS,
  GROUP_PLAY_PREFERENCE_OPTIONS,
  SAME_ROOM_PREFERENCE_OPTIONS,
  UNICORN_BULL_FREQUENCY_OPTIONS,
  HOSTING_OPTIONS,
  TRAVEL_FOR_PLAY_OPTIONS,
  SWINGER_BOUNDARIES_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onToggle: (field: keyof Profile, value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export const Step5B_SwingerDeepDive: React.FC<Props> = ({ 
  formData, 
  onSelect, 
  onToggle,
  onInputChange,
  onNext, 
  onPrev,
  onSkip 
}) => {
  const hasClubExperience = formData.clubExperience;
  const hasUnicornBullExp = formData.unicornBullExperience;
  
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Swinger Deep Dive"
        subtitle="Tell us about your swinging preferences and experience"
      />
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-text-secondary hover:text-white"
        >
          Skip this section →
        </button>
      </div>
      
      {/* Swinger Type */}
      <RadioGrid
        title="What type of swinger are you?"
        options={SWINGER_TYPE_OPTIONS}
        selected={formData.swingerType || ''}
        onSelect={(val) => onSelect('swingerType', val)}
      />
      
      {/* Swap Preferences */}
      <CheckboxGrid
        title="Swap Preferences (Select all that apply)"
        options={SWAP_PREFERENCES_OPTIONS}
        selected={formData.swapPreferences || []}
        onToggle={(val) => onToggle('swapPreferences', val)}
      />
      
      {/* Party & Event Experience */}
      <SubsectionHeader title="Party & Event Experience" />
      
      <Select
        label="Club Experience"
        value={formData.clubExperience ? 'Regular' : 'Never'}
        onChange={(e) => onSelect('clubExperience', e.target.value !== 'Never')}
        options={CLUB_EXPERIENCE_OPTIONS}
        placeholder="Your club experience level..."
      />
      
      {hasClubExperience && (
        <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
          <CheckboxGrid
            title="Favorite Club Types"
            options={FAVORITE_CLUB_TYPES_OPTIONS}
            selected={formData.partyEventPreferences || []}
            onToggle={(val) => onToggle('partyEventPreferences', val)}
          />
          
          <div className="space-y-2">
            <Label>Favorite Clubs/Events (Optional)</Label>
            <Input
              placeholder="List your favorite clubs or events..."
              value={formData.favoriteClubs?.join(', ') || ''}
              onChange={(e) => onSelect('favoriteClubs', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>
        </div>
      )}
      
      <Select
        label="Preferred Party Size"
        value={formData.groupPlayMaxSize?.toString() || ''}
        onChange={(e) => onSelect('groupPlayMaxSize', parseInt(e.target.value))}
        options={PARTY_SIZE_PREFERENCE_OPTIONS}
        placeholder="Select preferred party size..."
      />
      
      {/* Group Play Preferences */}
      <SubsectionHeader title="Group Play Preferences" />
      
      <Select
        label="Maximum Group Size Comfortable With"
        value={formData.groupPlayMaxSize?.toString() || ''}
        onChange={(e) => onSelect('groupPlayMaxSize', parseInt(e.target.value))}
        options={GROUP_PLAY_MAX_SIZE_OPTIONS}
        placeholder="Select max group size..."
      />
      
      <CheckboxGrid
        title="Preferred Group Configurations"
        options={GROUP_PLAY_PREFERENCE_OPTIONS}
        selected={formData.groupTypes || []}
        onToggle={(val) => onToggle('groupTypes', val)}
      />
      
      <Select
        label="Same Room as Partner Required?"
        value={formData.couplePlayStyle || ''}
        onChange={(e) => onSelect('couplePlayStyle', e.target.value)}
        options={SAME_ROOM_PREFERENCE_OPTIONS}
        placeholder="Select preference..."
      />
      
      {/* Unicorn/Bull Experience */}
      <SubsectionHeader title="Third-Person Experience" />
      
      <div className="space-y-2">
        <Label>Have you been a third for couples?</Label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onSelect('unicornBullExperience', true)}
            className={`flex-1 py-2 px-4 rounded-lg ${
              formData.unicornBullExperience
                ? 'bg-brand-primary text-white'
                : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onSelect('unicornBullExperience', false)}
            className={`flex-1 py-2 px-4 rounded-lg ${
              formData.unicornBullExperience === false
                ? 'bg-brand-primary text-white'
                : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
            }`}
          >
            No
          </button>
        </div>
      </div>
      
      {hasUnicornBullExp && (
        <Select
          label="How many times?"
          value={formData.yearsInLifestyle?.toString() || ''}
          onChange={(e) => onSelect('yearsInLifestyle', parseInt(e.target.value))}
          options={UNICORN_BULL_FREQUENCY_OPTIONS}
          placeholder="Select frequency..."
        />
      )}
      
      {/* Hosting & Travel */}
      <SubsectionHeader title="Hosting & Travel" />
      
      <Select
        label="Can you host?"
        value={formData.canHost || ''}
        onChange={(e) => onSelect('canHost', e.target.value)}
        options={HOSTING_OPTIONS}
        placeholder="Select hosting capability..."
      />
      
      <Select
        label="Travel for play?"
        value={formData.travelDistanceWilling?.toString() || ''}
        onChange={(e) => onSelect('travelDistanceWilling', parseInt(e.target.value))}
        options={TRAVEL_FOR_PLAY_OPTIONS}
        placeholder="How far will you travel?"
      />
      
      <div className="space-y-2">
        <Label>Attend lifestyle resorts/cruises?</Label>
        <div className="flex gap-4">
          {['Yes', 'Interested', 'Maybe', 'No'].map(option => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect('kinkConventionsAttend', option === 'Yes')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm ${
                (formData.kinkConventionsAttend && option === 'Yes') ||
                (!formData.kinkConventionsAttend && option !== 'Yes')
                  ? 'bg-brand-primary text-white'
                  : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {/* Boundaries in Swinging */}
      <SubsectionHeader title="Boundaries & Comfort Levels" />
      
      {Object.entries(SWINGER_BOUNDARIES_OPTIONS).map(([key, options]) => (
        <div key={key} className="space-y-2">
          <Label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}?</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(key, option)}
                className={`py-2 px-3 text-sm rounded-lg ${
                  formData[key as keyof Profile] === option
                    ? 'bg-brand-primary text-white'
                    : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.swingerType}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};