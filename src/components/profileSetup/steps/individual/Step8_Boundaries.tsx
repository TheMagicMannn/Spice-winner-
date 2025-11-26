// Individual Step 8: Boundaries & Comfort Levels
import React from 'react';
import { Button } from '../../../Button';
import { SectionHeader, CheckboxGrid, RadioGrid, Select } from '../../FormComponents';
import { 
  MEETING_LOCATION_OPTIONS,
  PLAY_ENVIRONMENT_OPTIONS,
  FIRST_MEETING_PREFERENCE_OPTIONS,
  TIMELINE_TO_MEET_OPTIONS,
  PHOTO_VIDEO_CONSENT_OPTIONS,
  SOCIAL_MEDIA_BOUNDARIES_OPTIONS
} from '../../../../data/profileSetupConstants';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  onToggle: (field: keyof Profile, value: string) => void;
  onSelect: (field: string, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step8_Boundaries: React.FC<Props> = ({ formData, onToggle, onSelect, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Boundaries & Comfort Levels"
        subtitle="Help us understand your comfort zones and boundaries"
      />
      
      <CheckboxGrid
        title="Meeting Locations You're Comfortable With"
        options={MEETING_LOCATION_OPTIONS}
        selected={formData.comfortableMeeting || []}
        onToggle={(val) => onToggle('comfortableMeeting', val)}
      />
      
      <CheckboxGrid
        title="Play Environments You're Comfortable With"
        options={PLAY_ENVIRONMENT_OPTIONS}
        selected={formData.comfortEnvironments || []}
        onToggle={(val) => onToggle('comfortEnvironments', val)}
      />
      
      <RadioGrid
        title="First Meeting Preference"
        options={FIRST_MEETING_PREFERENCE_OPTIONS}
        selected={formData.firstMeetingPreference || ''}
        onSelect={(val) => onSelect('firstMeetingPreference', val)}
      />
      
      <RadioGrid
        title="Timeline to Meet in Person"
        options={TIMELINE_TO_MEET_OPTIONS}
        selected={formData.howSoonToMeet || ''}
        onSelect={(val) => onSelect('howSoonToMeet', val)}
      />
      
      <CheckboxGrid
        title="Photo/Video Consent (Select all that apply)"
        options={PHOTO_VIDEO_CONSENT_OPTIONS}
        selected={formData.photoVideoConsent ? [formData.photoVideoConsent] : []}
        onToggle={(val) => onSelect('photoVideoConsent', val)}
      />
      
      <RadioGrid
        title="Social Media Boundaries"
        options={SOCIAL_MEDIA_BOUNDARIES_OPTIONS}
        selected={formData.socialMediaBoundaries || ''}
        onSelect={(val) => onSelect('socialMediaBoundaries', val)}
      />
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.comfortableMeeting || formData.comfortableMeeting.length === 0}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};