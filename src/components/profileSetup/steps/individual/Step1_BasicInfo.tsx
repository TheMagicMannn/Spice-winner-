// Individual Step 1: Basic Information
import React from 'react';
import { Button } from '../../../Button';
import { Input } from '../../../Input';
import { Label } from '../../../Label';
import { SectionHeader, Select } from '../../FormComponents';
import { GENDER_OPTIONS, SEXUAL_ORIENTATION_OPTIONS } from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
}

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const validateDateOfBirth = (date: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(date)) return false;
  const parts = date.split('/');
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const dateObj = new Date(year, month - 1, day);
  const age = calculateAge(date);
  return dateObj.getDate() === day && 
         dateObj.getMonth() === month - 1 && 
         dateObj.getFullYear() === year &&
         age >= 18;
};

export const Step1_BasicInfo: React.FC<Props> = ({ formData, onInputChange, onNext, onPrev, canProceed }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.length >= 2) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    if (digits.length >= 5) {
      digits = digits.slice(0, 5) + '/' + digits.slice(5, 9);
    }
    const syntheticEvent = {
      target: {
        name: 'dateOfBirth',
        value: digits
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(syntheticEvent);
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Tell us about yourself"
        subtitle="Let's start with the basics"
      />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input 
            name="displayName" 
            value={formData.displayName || ''} 
            onChange={onInputChange} 
            placeholder="How should others see your name?"
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Location (City, State)</Label>
          <Input 
            name="location" 
            value={formData.location || ''} 
            onChange={onInputChange} 
            placeholder="e.g., Los Angeles, CA" 
            required 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label="Gender" 
            name="gender" 
            value={formData.gender || ''} 
            onChange={onInputChange} 
            options={GENDER_OPTIONS} 
            placeholder="Select..." 
            required 
          />
          <Select 
            label="Sexual Orientation" 
            name="orientation" 
            value={formData.orientation || ''} 
            onChange={onInputChange} 
            options={SEXUAL_ORIENTATION_OPTIONS} 
            placeholder="Select..." 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Date of Birth (MM/DD/YYYY)</Label>
          <Input 
            name="dateOfBirth" 
            value={formData.dateOfBirth || ''} 
            onChange={handleDateChange} 
            placeholder="MM/DD/YYYY" 
            maxLength={10}
            required 
          />
          {formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth) && (
            <p className="text-red-400 text-sm">Please enter a valid date in MM/DD/YYYY format (must be 18+)</p>
          )}
          {formData.dateOfBirth && validateDateOfBirth(formData.dateOfBirth) && (
            <p className="text-green-400 text-sm">Age: {calculateAge(formData.dateOfBirth)} years old</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-1">Next →</Button>
      </div>
    </div>
  );
};