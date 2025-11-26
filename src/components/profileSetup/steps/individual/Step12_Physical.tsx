// Individual Step 12: Physical Stats & Appearance
import React from 'react';
import { Button } from '../../../Button';
import { Label } from '../../../Label';
import { SectionHeader, Select } from '../../FormComponents';
import { 
  HEIGHT_OPTIONS,
  WEIGHT_OPTIONS,
  BODY_TYPE_OPTIONS,
  ETHNICITY_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_LENGTH_OPTIONS,
  EYE_COLOR_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  TATTOO_OPTIONS,
  PIERCING_OPTIONS,
  BODY_HAIR_OPTIONS,
  GROOMING_STYLE_OPTIONS,
  FITNESS_LEVEL_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step12_Physical: React.FC<Props> = ({ formData, onSelect, onInputChange, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Physical Stats & Appearance"
        subtitle="Help others visualize you (optional but recommended)"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Height"
          value={formData.height || ''}
          onChange={onInputChange}
          name="height"
          options={HEIGHT_OPTIONS}
          placeholder="Select height..."
        />
        
        <Select
          label="Weight"
          value={formData.weight || ''}
          onChange={onInputChange}
          name="weight"
          options={[...WEIGHT_OPTIONS, 'Prefer not to say']}
          placeholder="Select weight..."
        />
        
        <Select
          label="Body Type"
          value={formData.bodyType || ''}
          onChange={onInputChange}
          name="bodyType"
          options={BODY_TYPE_OPTIONS}
          placeholder="Select body type..."
        />
        
        <Select
          label="Ethnicity"
          value={formData.ethnicity || ''}
          onChange={onInputChange}
          name="ethnicity"
          options={ETHNICITY_OPTIONS}
          placeholder="Select ethnicity..."
        />
        
        <Select
          label="Hair Color"
          value={formData.hairColor || ''}
          onChange={onInputChange}
          name="hairColor"
          options={HAIR_COLOR_OPTIONS}
          placeholder="Select hair color..."
        />
        
        <Select
          label="Hair Length"
          value={formData.hairLength || ''}
          onChange={onInputChange}
          name="hairLength"
          options={HAIR_LENGTH_OPTIONS}
          placeholder="Select hair length..."
        />
        
        <Select
          label="Eye Color"
          value={formData.eyeColor || ''}
          onChange={onInputChange}
          name="eyeColor"
          options={EYE_COLOR_OPTIONS}
          placeholder="Select eye color..."
        />
        
        <Select
          label="Facial Hair"
          value={formData.facialHair || ''}
          onChange={onInputChange}
          name="facialHair"
          options={FACIAL_HAIR_OPTIONS}
          placeholder="Select..."
        />
        
        <Select
          label="Tattoos"
          value={formData.tattoos ? 'A few' : 'None'}
          onChange={(e) => onSelect('tattoos', e.target.value !== 'None')}
          options={TATTOO_OPTIONS}
          placeholder="Select..."
        />
        
        <Select
          label="Piercings"
          value={formData.piercings ? 'A few' : 'None'}
          onChange={(e) => onSelect('piercings', e.target.value !== 'None')}
          options={PIERCING_OPTIONS}
          placeholder="Select..."
        />
        
        <Select
          label="Body Hair"
          value={formData.bodyHair || ''}
          onChange={onInputChange}
          name="bodyHair"
          options={BODY_HAIR_OPTIONS}
          placeholder="Select..."
        />
        
        <Select
          label="Grooming Style"
          value={formData.groomingStyle || ''}
          onChange={onInputChange}
          name="groomingStyle"
          options={GROOMING_STYLE_OPTIONS}
          placeholder="Select..."
        />
        
        <Select
          label="Physical Fitness Level"
          value={formData.fitnessLevel || ''}
          onChange={onInputChange}
          name="fitnessLevel"
          options={FITNESS_LEVEL_OPTIONS}
          placeholder="Select..."
        />
      </div>
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button onClick={onNext} className="flex-1">Next →</Button>
      </div>
    </div>
  );
};