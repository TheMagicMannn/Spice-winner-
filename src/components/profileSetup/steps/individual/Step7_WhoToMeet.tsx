// Individual Step 7: Who You Want to Meet
import React from 'react';
import { Button } from '../../../Button';
import { SectionHeader, SubsectionHeader, CheckboxGrid, RadioGrid, Select } from '../../FormComponents';
import { 
  INTERESTED_IN_TYPES_OPTIONS,
  GENDER_OPTIONS,
  COUPLE_INTERACTION_PREFERENCE_OPTIONS,
  COUPLE_TYPE_PREFERENCES_OPTIONS,
  GROUP_TYPE_PREFERENCES_OPTIONS,
  POLYCULE_INTEREST_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onToggle: (field: keyof Profile, value: string) => void;
  onSelect: (field: string, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step7_WhoToMeet: React.FC<Props> = ({ formData, onToggle, onSelect, onNext, onPrev }) => {
  const interestedInSingles = formData.interestedInTypes?.includes('Men') || 
                             formData.interestedInTypes?.includes('Women') ||
                             formData.interestedInTypes?.includes('Non-binary individuals') ||
                             formData.interestedInTypes?.includes('Transgender individuals');
                             
  const interestedInCouples = formData.interestedInTypes?.some(type => type.includes('Couples'));
  const interestedInGroups = formData.interestedInTypes?.includes('Groups (3+)');
  const interestedInPolycules = formData.interestedInTypes?.includes('Polycules');
  
  const needsCoupleInteractionGenders = formData.coupleInteraction === 'With one partner only';

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Who You Want to Meet"
        subtitle="Tell us who you're interested in connecting with"
      />
      
      <CheckboxGrid
        title="I'm Interested In (Select all that apply)"
        options={INTERESTED_IN_TYPES_OPTIONS}
        selected={formData.interestedInTypes || []}
        onToggle={(val) => onToggle('interestedInTypes', val)}
      />
      
      {/* Singles Preferences */}
      {interestedInSingles && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-4">
          <SubsectionHeader title="Singles Preferences" />
          <CheckboxGrid
            title="Which genders are you interested in?"
            options={GENDER_OPTIONS}
            selected={formData.singlesGenders || []}
            onToggle={(val) => onToggle('singlesGenders', val)}
          />
        </div>
      )}
      
      {/* Couples Preferences */}
      {interestedInCouples && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-4">
          <SubsectionHeader title="Couples Preferences" />
          
          <CheckboxGrid
            title="Preferred Couple Types"
            options={COUPLE_TYPE_PREFERENCES_OPTIONS}
            selected={formData.couplePref || []}
            onToggle={(val) => onToggle('couplePref', val)}
          />
          
          <Select
            label="How do you prefer to interact with couples?"
            value={formData.coupleInteraction || ''}
            onChange={(e) => onSelect('coupleInteraction', e.target.value)}
            options={COUPLE_INTERACTION_PREFERENCE_OPTIONS}
            placeholder="Select interaction preference..."
          />
          
          {needsCoupleInteractionGenders && (
            <CheckboxGrid
              title="Which genders for one-on-one play?"
              options={GENDER_OPTIONS}
              selected={formData.coupleInteractionGenders || []}
              onToggle={(val) => onToggle('coupleInteractionGenders', val)}
            />
          )}
        </div>
      )}
      
      {/* Groups Preferences */}
      {interestedInGroups && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-4">
          <SubsectionHeader title="Group Play Preferences" />
          <CheckboxGrid
            title="Preferred Group Types"
            options={GROUP_TYPE_PREFERENCES_OPTIONS}
            selected={formData.groupTypes || []}
            onToggle={(val) => onToggle('groupTypes', val)}
          />
        </div>
      )}
      
      {/* Polycules Preferences */}
      {interestedInPolycules && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-4">
          <SubsectionHeader title="Polycule Preferences" />
          <CheckboxGrid
            title="What are you looking for with polycules?"
            options={POLYCULE_INTEREST_OPTIONS}
            selected={formData.polyculePreferences || []}
            onToggle={(val) => onToggle('polyculePreferences', val)}
          />
        </div>
      )}
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.interestedInTypes || formData.interestedInTypes.length === 0}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};