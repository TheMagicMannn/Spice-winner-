// Profile Summary Review Component
import React from 'react';
import { Button } from './Button';
import { SpiceProfile } from '../types/profile';

interface ProfileSummaryReviewProps {
  profile: Partial<SpiceProfile>;
  onEdit: (step: number) => void;
}

export const ProfileSummaryReview: React.FC<ProfileSummaryReviewProps> = ({ profile, onEdit }) => {
  const SectionCard = ({
    title,
    step,
    children,
    isComplete,
  }: {
    title: string;
    step: number;
    children: React.ReactNode;
    isComplete: boolean;
  }) => (
    <div
      className={`p-4 rounded-lg border ${
        isComplete ? 'border-green-400/50 bg-green-400/5' : 'border-red-400/50 bg-red-400/5'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isComplete ? '✓' : '⚠️'}</span>
          <h4 className="font-semibold text-white">{title}</h4>
        </div>
        <Button onClick={() => onEdit(step)} variant="outline" className="py-1 px-3 text-sm">
          Edit
        </Button>
      </div>
      <div className="text-sm text-text-secondary space-y-1">{children}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Review Your Profile</h3>
        <p className="text-text-secondary">
          Make sure everything looks good before publishing
        </p>
      </div>

      {/* Account Type */}
      <SectionCard title="Account Type" step={0} isComplete={Boolean(profile.accountType)}>
        <p className="capitalize">{profile.accountType?.replace('_', ' ') || 'Not set'}</p>
      </SectionCard>

      {/* Relationship Status */}
      <SectionCard
        title="Relationship Status"
        step={1}
        isComplete={Boolean(profile.relationshipStatus && profile.relationshipStatus.length > 0)}
      >
        <p>{profile.relationshipStatus?.join(', ') || 'Not set'}</p>
        {profile.exploringWith && profile.exploringWith !== 'n/a' && (
          <p>Exploring: {profile.exploringWith}</p>
        )}
      </SectionCard>

      {/* Partner Links */}
      {profile.partnerLinks && profile.partnerLinks.length > 0 && (
        <SectionCard title="Partner Links" step={2} isComplete={true}>
          {profile.partnerLinks.map((link, idx) => (
            <p key={idx}>
              {link.partnerName || 'Partner'} - {link.status} ({link.relationshipType})
            </p>
          ))}
        </SectionCard>
      )}

      {/* Lifestyles */}
      <SectionCard
        title="Lifestyles"
        step={2}
        isComplete={Boolean(profile.lifestyles && profile.lifestyles.length > 0)}
      >
        <p>{profile.lifestyles?.join(', ') || 'Not set'}</p>
      </SectionCard>

      {/* Roles */}
      <SectionCard
        title="Roles & Dynamics"
        step={3}
        isComplete={Boolean(profile.roles && profile.roles.length > 0)}
      >
        <p>{profile.roles?.join(', ') || 'Not set'}</p>
        {profile.experienceLevel && <p>Experience: {profile.experienceLevel}</p>}
      </SectionCard>

      {/* Kinks & Preferences */}
      <SectionCard
        title="Kinks & Preferences"
        step={4}
        isComplete={Boolean(profile.kinkTags && profile.kinkTags.length > 0)}
      >
        <p>Kinks: {profile.kinkTags?.slice(0, 5).join(', ') || 'Not set'}</p>
        {profile.kinkTags && profile.kinkTags.length > 5 && (
          <p className="text-xs">...and {profile.kinkTags.length - 5} more</p>
        )}
        {profile.hardLimits && profile.hardLimits.length > 0 && (
          <p>Hard Limits: {profile.hardLimits.length} selected</p>
        )}
      </SectionCard>

      {/* Profile Details */}
      <SectionCard
        title="Profile Details"
        step={5}
        isComplete={Boolean(profile.displayName && profile.bio && profile.location)}
      >
        {profile.accountType === 'shared_couple' ? (
          <>
            <p>Couple Name: {profile.coupleName || 'Not set'}</p>
            <p>Bio: {profile.coupleBio ? `${profile.coupleBio.slice(0, 50)}...` : 'Not set'}</p>
          </>
        ) : (
          <>
            <p>Name: {profile.displayName || 'Not set'}</p>
            <p>Bio: {profile.bio ? `${profile.bio.slice(0, 50)}...` : 'Not set'}</p>
            <p>
              Location: {typeof profile.location === 'string' ? profile.location : 'Not set'}
            </p>
            <p>Gender: {profile.genderIdentity || 'Not set'}</p>
          </>
        )}
      </SectionCard>

      {/* Photos */}
      <SectionCard
        title="Photos"
        step={6}
        isComplete={Boolean(profile.photos && profile.photos.length >= 2)}
      >
        <p>
          {profile.photos?.length || 0} photo{profile.photos?.length !== 1 ? 's' : ''} uploaded
        </p>
        {profile.photos && profile.photos.length >= 2 && (
          <p className="text-green-400">✓ Minimum 2 photos met</p>
        )}
      </SectionCard>

      {/* Privacy Settings */}
      <SectionCard
        title="Privacy Settings"
        step={7}
        isComplete={Boolean(profile.profileVisibility)}
      >
        <p>Profile Visibility: {profile.profileVisibility || 'Not set'}</p>
        {profile.matchPreferences && (
          <p>
            Match Preferences: Age {profile.matchPreferences.ageRange?.[0]}-
            {profile.matchPreferences.ageRange?.[1]}, Distance{' '}
            {profile.matchPreferences.distanceMiles} miles
          </p>
        )}
      </SectionCard>

      {/* Verification */}
      <SectionCard title="Verification" step={8} isComplete={true}>
        <p>
          Identity Verified: {profile.verification?.identityVerified ? '✓ Yes' : '✗ No'}
        </p>
        {profile.verification?.lifestyleVerified &&
          profile.verification.lifestyleVerified.length > 0 && (
            <p>Lifestyle Verified: {profile.verification.lifestyleVerified.join(', ')}</p>
          )}
      </SectionCard>

      <div className="mt-6 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
        <p className="text-sm text-text-secondary text-center">
          By publishing your profile, you agree to SPICE's{' '}
          <a href="/terms" className="text-brand-secondary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-brand-secondary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};
