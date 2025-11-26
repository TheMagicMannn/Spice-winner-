// Individual Step 3: Relationship Context & Current Situation
import React from 'react';
import { Button } from '../../../Button';
import { Label } from '../../../Label';
import { SectionHeader, RadioGrid, InfoBox } from '../../FormComponents';
import { RELATIONSHIP_CONTEXT_OPTIONS } from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onSelect: (field: string, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step3_RelationshipContext: React.FC<Props> = ({ formData, onSelect, onNext, onPrev }) => {
  const needsPartnerConsent = [
    'Married/Life Partner (Open)',
    'Married/Life Partner (Monogamous)',
    'Partnered in ENM Relationship',
    'In a D/s Relationship'
  ].includes(formData.relationshipContext || '');

  const needsOwnerConsent = ['Owned/Collared'].includes(formData.relationshipContext || '');
  
  const needsPolyculeAwareness = ['In a Polycule', 'Solo Polyamorous (Have connections)'].includes(formData.relationshipContext || '');

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Relationship Context"
        subtitle="What's your current relationship situation?"
      />
      
      <RadioGrid
        title="Select your current relationship status"
        options={RELATIONSHIP_CONTEXT_OPTIONS}
        selected={formData.relationshipContext || ''}
        onSelect={(val) => onSelect('relationshipContext', val)}
      />
      
      {needsPartnerConsent && (
        <InfoBox type="warning">
          <div className="space-y-3">
            <p className="font-semibold">Partner Awareness Check</p>
            <div className="space-y-2">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.partnerAlignment?.includes('partner_knows') || false}
                  onChange={(e) => {
                    const current = formData.partnerAlignment || [];
                    const updated = e.target.checked 
                      ? [...current, 'partner_knows']
                      : current.filter(x => x !== 'partner_knows');
                    onSelect('partnerAlignment', updated);
                  }}
                  className="w-4 h-4 mt-1"
                />
                <span className="text-sm">My partner knows I'm here</span>
              </label>
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.partnerAlignment?.includes('partner_consent') || false}
                  onChange={(e) => {
                    const current = formData.partnerAlignment || [];
                    const updated = e.target.checked 
                      ? [...current, 'partner_consent']
                      : current.filter(x => x !== 'partner_consent');
                    onSelect('partnerAlignment', updated);
                  }}
                  className="w-4 h-4 mt-1"
                  required
                />
                <span className="text-sm">I have permission/consent to be here <span className="text-red-400">*</span></span>
              </label>
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.partnerAlignment?.includes('partner_encouraged') || false}
                  onChange={(e) => {
                    const current = formData.partnerAlignment || [];
                    const updated = e.target.checked 
                      ? [...current, 'partner_encouraged']
                      : current.filter(x => x !== 'partner_encouraged');
                    onSelect('partnerAlignment', updated);
                  }}
                  className="w-4 h-4 mt-1"
                />
                <span className="text-sm">They encouraged me to join</span>
              </label>
            </div>
          </div>
        </InfoBox>
      )}
      
      {needsOwnerConsent && (
        <InfoBox type="warning">
          <div className="space-y-3">
            <p className="font-semibold">Owner/Collar Holder Awareness</p>
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={formData.consentConfirmed || false}
                onChange={(e) => onSelect('consentConfirmed', e.target.checked)}
                className="w-4 h-4 mt-1"
                required
              />
              <span className="text-sm">My Owner/Collar Holder knows and consents to me being here <span className="text-red-400">*</span></span>
            </label>
          </div>
        </InfoBox>
      )}
      
      {needsPolyculeAwareness && (
        <InfoBox type="info">
          <div className="space-y-3">
            <p className="font-semibold">Polycule Awareness</p>
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={formData.partnerAlignment?.includes('polycule_aware') || false}
                onChange={(e) => {
                  const current = formData.partnerAlignment || [];
                  const updated = e.target.checked 
                    ? [...current, 'polycule_aware']
                    : current.filter(x => x !== 'polycule_aware');
                  onSelect('partnerAlignment', updated);
                }}
                className="w-4 h-4 mt-1"
              />
              <span className="text-sm">My partners are aware I'm creating this profile</span>
            </label>
          </div>
        </InfoBox>
      )}
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.relationshipContext || 
            (needsPartnerConsent && !formData.partnerAlignment?.includes('partner_consent')) ||
            (needsOwnerConsent && !formData.consentConfirmed)
          }
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};