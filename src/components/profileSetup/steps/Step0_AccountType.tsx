// Step 0: Account Type Selection
import React from 'react';
import { Button } from '../../Button';
import { SectionHeader } from '../FormComponents';
import { AccountType } from '../../../types_comprehensive';

interface Props {
  accountType: AccountType | null;
  onSelect: (type: AccountType) => void;
  onNext: () => void;
}

export const Step0_AccountType: React.FC<Props> = ({ accountType, onSelect, onNext }) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="How would you like to create your account?"
        subtitle="Choose the option that best fits your situation"
      />
      
      <div className="grid grid-cols-1 gap-4">
        <button
          type="button"
          onClick={() => onSelect('individual')}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            accountType === 'individual'
              ? 'border-brand-primary bg-brand-primary/10'
              : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
          }`}
        >
          <h3 className="text-xl font-bold text-white mb-2">👤 Individual Account</h3>
          <p className="text-text-secondary mb-2">Single user, single login</p>
          <p className="text-sm text-text-secondary">I'm creating a profile for myself</p>
        </button>
        
        <button
          type="button"
          onClick={() => onSelect('couple_shared')}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            accountType === 'couple_shared'
              ? 'border-brand-primary bg-brand-primary/10'
              : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
          }`}
        >
          <h3 className="text-xl font-bold text-white mb-2">👫 Couple Shared Account</h3>
          <p className="text-text-secondary mb-2">One profile, two separate login emails</p>
          <p className="text-sm text-text-secondary">We want one shared profile that we both can access</p>
          <p className="text-xs text-brand-secondary mt-2">✓ Both partners can log in with their own email/password</p>
        </button>
        
        <button
          type="button"
          onClick={() => onSelect('couple_shell')}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            accountType === 'couple_shell'
              ? 'border-brand-primary bg-brand-primary/10'
              : 'border-brand-primary/30 bg-black/30 hover:border-brand-primary/50'
          }`}
        >
          <h3 className="text-xl font-bold text-white mb-2">💑 Couple Shell Account</h3>
          <p className="text-text-secondary mb-2">Two individual profiles that link together</p>
          <p className="text-sm text-text-secondary">We want our own individual profiles that connect together</p>
          <p className="text-xs text-brand-secondary mt-2">✓ Each maintains full independence</p>
          <p className="text-xs text-brand-secondary">✓ Creates a combined "couple shell" view</p>
        </button>
      </div>
      
      <Button 
        onClick={onNext} 
        disabled={!accountType} 
        className="w-full mt-8"
      >
        Continue →
      </Button>
    </div>
  );
};