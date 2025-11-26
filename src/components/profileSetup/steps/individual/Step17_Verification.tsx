// Individual Step 17: Verification & Trust
import React from 'react';
import { Button } from '../../../Button';
import { Textarea } from '../../../Textarea';
import { Label } from '../../../Label';
import { SectionHeader, RadioGrid, InfoBox } from '../../FormComponents';
import { 
  REFERENCE_WILLINGNESS_OPTIONS,
  BACKGROUND_CHECK_OPTIONS,
  STI_SHARING_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step17_Verification: React.FC<Props> = ({ formData, onSelect, onInputChange, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Verification & Trust"
        subtitle="Optional ways to build trust with your connections"
      />
      
      <InfoBox type="info">
        <p className="text-sm">
          These options are completely optional but can help build trust and credibility 
          in the community. All information is kept private.
        </p>
      </InfoBox>
      
      <div className="space-y-2">
        <Label>Have lifestyle references?</Label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onSelect('referencesAvailable', true)}
            className={`flex-1 py-2 px-4 rounded-lg ${
              formData.referencesAvailable
                ? 'bg-brand-primary text-white'
                : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onSelect('referencesAvailable', false)}
            className={`flex-1 py-2 px-4 rounded-lg ${
              formData.referencesAvailable === false
                ? 'bg-brand-primary text-white'
                : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
            }`}
          >
            No
          </button>
        </div>
      </div>
      
      {formData.referencesAvailable && (
        <div className="p-4 border border-brand-primary/30 rounded-lg space-y-4">
          <RadioGrid
            title="Willing to provide references?"
            options={REFERENCE_WILLINGNESS_OPTIONS}
            selected={formData.referenceWillingness || ''}
            onSelect={(val) => onSelect('referenceWillingness', val)}
          />
          
          <div className="space-y-2">
            <Label>Reference Contacts (Optional - Kept Private)</Label>
            <Textarea
              name="referenceContacts"
              value={formData.referenceContacts?.join('\n') || ''}
              onChange={(e) => onSelect('referenceContacts', e.target.value.split('\n'))}
              rows={3}
              placeholder="List names or contacts of references (one per line)\nThese will remain private until you choose to share"
            />
          </div>
        </div>
      )}
      
      <RadioGrid
        title="Background Check"
        options={BACKGROUND_CHECK_OPTIONS}
        selected={formData.backgroundCheckCompleted ? 'Already completed' : ''}
        onSelect={(val) => onSelect('backgroundCheckCompleted', val === 'Already completed')}
      />
      
      <RadioGrid
        title="STI Test Sharing Willingness"
        options={STI_SHARING_OPTIONS}
        selected={formData.stdTestShareWillingness || ''}
        onSelect={(val) => onSelect('stdTestShareWillingness', val)}
      />
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button onClick={onNext} className="flex-1">Next →</Button>
      </div>
    </div>
  );
};