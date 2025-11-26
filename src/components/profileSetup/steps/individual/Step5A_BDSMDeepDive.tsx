// Individual Step 5A: BDSM/Kink Deep Dive
import React from 'react';
import { Button } from '../../../Button';
import { Textarea } from '../../../Textarea';
import { Label } from '../../../Label';
import { SectionHeader, SubsectionHeader, CheckboxGrid, RadioGrid, Select, InfoBox } from '../../FormComponents';
import { 
  BDSM_ROLE_OPTIONS,
  POWER_EXCHANGE_LEVEL_OPTIONS,
  PROTOCOL_LEVEL_OPTIONS,
  COLLAR_STATUS_OPTIONS,
  NEGOTIATION_STYLE_OPTIONS,
  SAFE_WORD_SYSTEM_OPTIONS,
  AFTERCARE_NEEDS_OPTIONS,
  DUNGEON_EXPERIENCE_OPTIONS,
  PUBLIC_PLAY_COMFORT_OPTIONS,
  DEMO_PERFORMANCE_COMFORT_OPTIONS,
  MUNCH_ATTENDANCE_OPTIONS,
  SCENE_PREFERENCES_OPTIONS,
  HARD_LIMITS_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onToggle: (field: keyof Profile, value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export const Step5A_BDSMDeepDive: React.FC<Props> = ({ 
  formData, 
  onSelect, 
  onToggle,
  onInputChange,
  onNext, 
  onPrev,
  onSkip 
}) => {
  const is247 = ['24_7', 'high_protocol', 'tpe'].includes(formData.powerExchangeLevel || '');
  
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="BDSM/Kink Deep Dive"
        subtitle="Help us understand your kink preferences and experience"
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
      
      {/* Primary Role */}
      <div className="space-y-2">
        <Select
          label="Primary Role"
          value={formData.bdsmRolePrimary || ''}
          onChange={(e) => onSelect('bdsmRolePrimary', e.target.value)}
          options={BDSM_ROLE_OPTIONS}
          placeholder="Select your primary role..."
        />
      </div>
      
      {/* Secondary Roles */}
      <CheckboxGrid
        title="Secondary Roles (Optional - Select up to 3)"
        options={BDSM_ROLE_OPTIONS.filter(r => r !== formData.bdsmRolePrimary)}
        selected={formData.bdsmRoleSecondary || []}
        onToggle={(val) => onToggle('bdsmRoleSecondary', val)}
        max={3}
      />
      
      {/* Power Exchange Level */}
      <RadioGrid
        title="Power Exchange Level"
        options={POWER_EXCHANGE_LEVEL_OPTIONS}
        selected={formData.powerExchangeLevel || ''}
        onSelect={(val) => onSelect('powerExchangeLevel', val)}
      />
      
      {/* 24/7 / High Protocol Questions */}
      {is247 && (
        <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
          <SubsectionHeader title="24/7 / High Protocol Details" />
          
          <Select
            label="Protocol Level"
            value={formData.protocolLevel || ''}
            onChange={(e) => onSelect('protocolLevel', e.target.value)}
            options={PROTOCOL_LEVEL_OPTIONS}
            placeholder="Select protocol level..."
          />
          
          <div className="space-y-2">
            <Label>Do you live with your D/s partner?</Label>
            <div className="flex gap-4">
              {['Yes', 'No', 'Planning to'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect('nestingPartnerStatus', option)}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    formData.nestingPartnerStatus === option
                      ? 'bg-brand-primary text-white'
                      : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Are you out as 24/7 to vanilla friends?</Label>
            <div className="flex gap-4">
              {['Yes', 'No', 'Selectively'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect('outToVanillaFriends', option === 'Yes')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    (formData.outToVanillaFriends && option === 'Yes') ||
                    (!formData.outToVanillaFriends && option !== 'Yes')
                      ? 'bg-brand-primary text-white'
                      : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Collar Status */}
      <RadioGrid
        title="Collar/Ownership Status"
        options={COLLAR_STATUS_OPTIONS}
        selected={formData.collarOwnershipStatus || ''}
        onSelect={(val) => onSelect('collarOwnershipStatus', val)}
      />
      
      {/* Negotiation & Scene Preferences */}
      <SubsectionHeader title="Negotiation & Scene Preferences" />
      
      <Select
        label="Negotiation Style"
        value={formData.negotiationStyle || ''}
        onChange={(e) => onSelect('negotiationStyle', e.target.value)}
        options={NEGOTIATION_STYLE_OPTIONS}
        placeholder="How do you prefer to negotiate?"
      />
      
      <Select
        label="Safe Word System"
        value={formData.safeWords?.[0] || ''}
        onChange={(e) => onSelect('safeWords', [e.target.value])}
        options={SAFE_WORD_SYSTEM_OPTIONS}
        placeholder="Select your safe word system..."
      />
      
      <CheckboxGrid
        title="Aftercare Needs (Select all that apply)"
        options={AFTERCARE_NEEDS_OPTIONS}
        selected={formData.aftercareNeeds || []}
        onToggle={(val) => onToggle('aftercareNeeds', val)}
      />
      
      {/* Public Play & Community */}
      <SubsectionHeader title="Public Play & Community" />
      
      <Select
        label="Dungeon Experience"
        value={formData.dungeonEtiquetteKnowledge || ''}
        onChange={(e) => onSelect('dungeonEtiquetteKnowledge', e.target.value)}
        options={DUNGEON_EXPERIENCE_OPTIONS}
        placeholder="Your dungeon experience level..."
      />
      
      <Select
        label="Public Play Comfort"
        value={formData.publicPlayComfort || ''}
        onChange={(e) => onSelect('publicPlayComfort', e.target.value)}
        options={PUBLIC_PLAY_COMFORT_OPTIONS}
        placeholder="How comfortable are you with public play?"
      />
      
      <Select
        label="Demo/Performance Comfort"
        value={formData.demoPerformanceComfort || ''}
        onChange={(e) => onSelect('demoPerformanceComfort', e.target.value)}
        options={DEMO_PERFORMANCE_COMFORT_OPTIONS}
        placeholder="Would you perform/demo at events?"
      />
      
      <Select
        label="Munch Attendance"
        value={formData.munchesAttend ? 'Regular' : 'Never been'}
        onChange={(e) => onSelect('munchesAttend', e.target.value === 'Regular')}
        options={MUNCH_ATTENDANCE_OPTIONS}
        placeholder="How often do you attend munches?"
      />
      
      {/* Scene Preferences */}
      <CheckboxGrid
        title="Scene Preferences (Select all activities you enjoy)"
        options={SCENE_PREFERENCES_OPTIONS}
        selected={formData.interestedKinks || []}
        onToggle={(val) => onToggle('interestedKinks', val)}
        columns={2}
      />
      
      {/* Hard Limits */}
      <CheckboxGrid
        title="Hard Limits (Select all that apply)"
        options={HARD_LIMITS_OPTIONS}
        selected={formData.hardLimits || []}
        onToggle={(val) => onToggle('hardLimits', val)}
        columns={2}
      />
      
      {/* Soft Limits */}
      <div className="space-y-2">
        <Label>Soft Limits (Things you're unsure about or need discussion)</Label>
        <Textarea
          name="softLimitsDetailed"
          value={typeof formData.softLimitsDetailed === 'string' ? formData.softLimitsDetailed : ''}
          onChange={onInputChange}
          rows={3}
          placeholder="List any soft limits or things you'd like to discuss..."
        />
      </div>
      
      <InfoBox type="info">
        <p className="text-sm">
          <strong>Remember:</strong> Consent, communication, and negotiation are the foundations of BDSM. 
          Your limits and boundaries should always be respected.
        </p>
      </InfoBox>
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.bdsmRolePrimary || !formData.powerExchangeLevel}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};
