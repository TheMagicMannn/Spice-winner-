// Individual Step 5C: ENM/Poly Deep Dive
import React from 'react';
import { Button } from '../../../Button';
import { Input } from '../../../Input';
import { Label } from '../../../Label';
import { SectionHeader, SubsectionHeader, CheckboxGrid, RadioGrid, Select } from '../../FormComponents';
import { 
  ENM_POLY_STRUCTURE_OPTIONS,
  POLY_STATUS_OPTIONS,
  HIERARCHY_OPTIONS,
  NESTING_OPTIONS,
  POLY_SATURATION_OPTIONS,
  TIME_AVAILABLE_OPTIONS,
  ENERGY_LEVEL_OPTIONS,
  METAMOUR_PREFERENCE_OPTIONS,
  METAMOUR_RELATIONSHIP_OPTIONS,
  VETO_POWER_OPTIONS,
  CHECK_IN_OPTIONS,
  TRANSPARENCY_LEVEL_OPTIONS,
  OVERNIGHT_OPTIONS,
  SCHEDULING_STYLE_OPTIONS,
  DATING_FREQUENCY_OPTIONS,
  PARALLEL_DATING_COMFORT_OPTIONS,
  RELATIONSHIP_ESCALATOR_OPTIONS,
  ESCALATOR_INTEREST_OPTIONS
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

export const Step5C_ENMPolyDeepDive: React.FC<Props> = ({ 
  formData, 
  onSelect, 
  onToggle,
  onInputChange,
  onNext, 
  onPrev,
  onSkip 
}) => {
  const hasMultiplePartners = formData.polyculeSize && formData.polyculeSize > 1;
  const hasMetamours = formData.polyculeSize && formData.polyculeSize > 2;
  
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="ENM/Poly Deep Dive"
        subtitle="Help us understand your polyamorous/ENM structure and preferences"
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
      
      {/* Structure */}
      <RadioGrid
        title="What's your ENM/Poly structure?"
        options={ENM_POLY_STRUCTURE_OPTIONS}
        selected={formData.polyStructureDetailed || ''}
        onSelect={(val) => onSelect('polyStructureDetailed', val)}
      />
      
      {/* Current Status */}
      <RadioGrid
        title="Current Poly Status"
        options={POLY_STATUS_OPTIONS}
        selected={formData.soloPolyStatus ? 'Single and poly' : ''}
        onSelect={(val) => onSelect('soloPolyStatus', val === 'Single and poly')}
      />
      
      {hasMultiplePartners && (
        <div className="space-y-2">
          <Label>How many people in your polycule?</Label>
          <input
            type="number"
            name="polyculeSize"
            min="1"
            max="20"
            value={formData.polyculeSize || ''}
            onChange={onInputChange}
            className="w-full bg-black/50 border border-brand-primary/50 text-white rounded-lg py-2 px-3"
            placeholder="Number of people"
          />
        </div>
      )}
      
      {/* Hierarchy & Nesting */}
      <SubsectionHeader title="Hierarchy & Nesting" />
      
      <div className="space-y-2">
        <Label>Do you have a primary partner?</Label>
        <div className="flex gap-4">
          {['Yes', 'No', "Don't use that term"].map(option => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect('hierarchyLevel', option)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm ${
                formData.hierarchyLevel === option
                  ? 'bg-brand-primary text-white'
                  : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <Select
        label="Nesting Partner Status"
        value={formData.nestingPartnerStatus || ''}
        onChange={(e) => onSelect('nestingPartnerStatus', e.target.value)}
        options={NESTING_OPTIONS}
        placeholder="Select nesting status..."
      />
      
      <Select
        label="Hierarchy Importance"
        value={formData.hierarchyLevel || ''}
        onChange={(e) => onSelect('hierarchyLevel', e.target.value)}
        options={HIERARCHY_OPTIONS}
        placeholder="How important is hierarchy?"
      />
      
      {/* Poly Saturation */}
      <SubsectionHeader title="Capacity & Availability" />
      
      <Select
        label="Poly Saturation - Room for:"
        value={formData.polySaturationLevel || ''}
        onChange={(e) => onSelect('polySaturationLevel', e.target.value)}
        options={POLY_SATURATION_OPTIONS}
        placeholder="How much capacity do you have?"
      />
      
      <Select
        label="Time Available for New Connections"
        value={formData.availabilityTimes?.[0] || ''}
        onChange={(e) => onSelect('availabilityTimes', [e.target.value])}
        options={TIME_AVAILABLE_OPTIONS}
        placeholder="Select time availability..."
      />
      
      <Select
        label="Energy Level for New Relationships"
        value={formData.energyLevel || ''}
        onChange={(e) => onSelect('energyLevel', e.target.value)}
        options={ENERGY_LEVEL_OPTIONS}
        placeholder="Select energy level..."
      />
      
      {/* Metamour Relationships */}
      {hasMetamours && (
        <div className="space-y-4">
          <SubsectionHeader title="Metamour Relationships" />
          
          <Select
            label="Metamour Preference"
            value={formData.metamourRelationshipPreference || ''}
            onChange={(e) => onSelect('metamourRelationshipPreference', e.target.value)}
            options={METAMOUR_PREFERENCE_OPTIONS}
            placeholder="How do you prefer to relate to metamours?"
          />
          
          <div className="space-y-2">
            <Label>Currently have metamours?</Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onSelect('hasMetamours', true)}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  formData.hasMetamours
                    ? 'bg-brand-primary text-white'
                    : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onSelect('hasMetamours', false)}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  formData.hasMetamours === false
                    ? 'bg-brand-primary text-white'
                    : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                }`}
              >
                No
              </button>
            </div>
          </div>
          
          {formData.hasMetamours && (
            <Select
              label="Relationship with metamours"
              value={formData.metamourRelationship || ''}
              onChange={(e) => onSelect('metamourRelationship', e.target.value)}
              options={METAMOUR_RELATIONSHIP_OPTIONS}
              placeholder="How's your relationship with them?"
            />
          )}
        </div>
      )}
      
      {/* Agreements & Boundaries */}
      <SubsectionHeader title="Poly Agreements & Boundaries" />
      
      <Select
        label="Veto Power in Relationships?"
        value={formData.vetoPowerExists ? 'Yes' : 'No'}
        onChange={(e) => onSelect('vetoPowerExists', e.target.value === 'Yes')}
        options={VETO_POWER_OPTIONS}
        placeholder="Select veto power status..."
      />
      
      <CheckboxGrid
        title="Required Check-ins with Partner(s)"
        options={CHECK_IN_OPTIONS}
        selected={formData.checkInFrequency ? [formData.checkInFrequency] : []}
        onToggle={(val) => onSelect('checkInFrequency', val)}
      />
      
      <Select
        label="Transparency Level"
        value={formData.transparencyLevel || ''}
        onChange={(e) => onSelect('transparencyLevel', e.target.value)}
        options={TRANSPARENCY_LEVEL_OPTIONS}
        placeholder="Select transparency level..."
      />
      
      <Select
        label="Overnights with New Partners"
        value={formData.overnightStaysAllowed ? 'Allowed' : 'Not yet'}
        onChange={(e) => onSelect('overnightStaysAllowed', e.target.value === 'Allowed')}
        options={OVERNIGHT_OPTIONS}
        placeholder="Select overnight policy..."
      />
      
      {/* Scheduling & Dating */}
      <SubsectionHeader title="Scheduling & Time Management" />
      
      <Select
        label="Scheduling Style"
        value={formData.schedulingStyle || ''}
        onChange={(e) => onSelect('schedulingStyle', e.target.value)}
        options={SCHEDULING_STYLE_OPTIONS}
        placeholder="How do you manage scheduling?"
      />
      
      <Select
        label="Dating Frequency Comfortable With"
        value={formData.datingPace || ''}
        onChange={(e) => onSelect('datingPace', e.target.value)}
        options={DATING_FREQUENCY_OPTIONS}
        placeholder="Select dating frequency..."
      />
      
      <Select
        label="Parallel Dating Comfort"
        value={formData.parallelDating || ''}
        onChange={(e) => onSelect('parallelDating', e.target.value)}
        options={PARALLEL_DATING_COMFORT_OPTIONS}
        placeholder="Can you date multiple people?"
      />
      
      {/* Relationship Escalator */}
      <SubsectionHeader title="Relationship Escalator Views" />
      
      <Select
        label="Do you follow the relationship escalator?"
        value={formData.relationshipEscalatorViews || ''}
        onChange={(e) => onSelect('relationshipEscalatorViews', e.target.value)}
        options={RELATIONSHIP_ESCALATOR_OPTIONS}
        placeholder="Select your views..."
      />
      
      <CheckboxGrid
        title="Interest In (Select all that apply)"
        options={ESCALATOR_INTEREST_OPTIONS}
        selected={formData.escalatorInterests || []}
        onToggle={(val) => onToggle('escalatorInterests', val)}
      />
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.polyStructureDetailed}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};