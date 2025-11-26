// src/pages/ProfileSetupComprehensive.tsx
// Main Orchestrator for Comprehensive Profile Setup
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Profile, AccountType } from '../types_comprehensive';
import { supabase } from '../services/supabase';
import backgroundImage from '../images/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png';

// Import step components
import { Step0_AccountType } from '../components/profileSetup/steps/Step0_AccountType';
import { Step1_BasicInfo } from '../components/profileSetup/steps/individual/Step1_BasicInfo';
import { Step2_Experience } from '../components/profileSetup/steps/individual/Step2_Experience';
import { Step3_RelationshipContext } from '../components/profileSetup/steps/individual/Step3_RelationshipContext';
import { Step4_CommunityID } from '../components/profileSetup/steps/individual/Step4_CommunityID';
import { Step5A_BDSMDeepDive } from '../components/profileSetup/steps/individual/Step5A_BDSMDeepDive';
import { Step5B_SwingerDeepDive } from '../components/profileSetup/steps/individual/Step5B_SwingerDeepDive';
import { Step5C_ENMPolyDeepDive } from '../components/profileSetup/steps/individual/Step5C_ENMPolyDeepDive';
import { Step6_Intent } from '../components/profileSetup/steps/individual/Step6_Intent';
import { Step7_WhoToMeet } from '../components/profileSetup/steps/individual/Step7_WhoToMeet';
import { Step8_Boundaries } from '../components/profileSetup/steps/individual/Step8_Boundaries';
import { Step9_Communication } from '../components/profileSetup/steps/individual/Step9_Communication';
import { Step10_SexualHealth } from '../components/profileSetup/steps/individual/Step10_SexualHealth';
import { Step11_Bio } from '../components/profileSetup/steps/individual/Step11_Bio';
import { Step12_Physical } from '../components/profileSetup/steps/individual/Step12_Physical';
import { Step13_Lifestyle } from '../components/profileSetup/steps/individual/Step13_Lifestyle';
import { Step14_Interests } from '../components/profileSetup/steps/individual/Step14_Interests';
import { Step15_Preferences } from '../components/profileSetup/steps/individual/Step15_Preferences';
import { Step16_Photos } from '../components/profileSetup/steps/individual/Step16_Photos';
import { Step17_Verification } from '../components/profileSetup/steps/individual/Step17_Verification';
import { Step18_Membership } from '../components/profileSetup/steps/individual/Step18_Membership';

// Helper functions
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
  const age = calculateAge(date);
  return age >= 18 && age <= 99;
};

export const ProfileSetupComprehensive: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({
    matchPreferences: {
      ageRange: [18, 55],
      genders: [],
      sexualities: [],
      searchingFor: [],
      distance: 50,
      vipOnly: false,
      verifiedOnly: false,
      experienceLevels: []
    }
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let finalValue: any = value;
    
    if (type === 'number') {
      finalValue = parseInt(value, 10);
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // Handle select field
  const handleSelect = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle toggle (for multi-select)
  const handleToggle = (field: keyof Profile, value: string) => {
    const currentValues = (formData[field] as string[] || []);
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    setFormData(prev => ({ ...prev, [field]: newValues }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 10) {
      setError('You can upload a maximum of 10 photos');
      return;
    }
    setPhotoFiles(prev => [...prev, ...files]);
    setError(null);
  };

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Navigation
  const handleNext = () => {
    // Handle community deep dive routing
    if (step === 4) {
      // After community selection, route to appropriate deep dive
      const hasBDSM = formData.lifestyleIdentities?.includes('BDSM/Kink');
      const hasSwinger = formData.lifestyleIdentities?.includes('Swinger');
      const hasPoly = formData.lifestyleIdentities?.includes('ENM (Ethical Non-Monogamy)') || 
                      formData.lifestyleIdentities?.includes('Polyamory');
      
      // For now, show BDSM if selected, otherwise continue
      if (hasBDSM) {
        setStep(5); // Go to Step 5A (BDSM)
      } else if (hasSwinger) {
        setStep(51); // Go to Step 5B (Swinger) - we'll use 51 as marker
      } else if (hasPoly) {
        setStep(52); // Go to Step 5C (Poly) - we'll use 52 as marker
      } else {
        setStep(6); // Skip deep dives
      }
    } else if (step === 5 || step === 51 || step === 52) {
      // After any deep dive, go to step 6
      setStep(6);
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (step === 6) {
      // Coming back from step 6, go to appropriate deep dive or step 4
      const hasBDSM = formData.lifestyleIdentities?.includes('BDSM/Kink');
      const hasSwinger = formData.lifestyleIdentities?.includes('Swinger');
      const hasPoly = formData.lifestyleIdentities?.includes('ENM (Ethical Non-Monogamy)') || 
                      formData.lifestyleIdentities?.includes('Polyamory');
      
      if (hasPoly) {
        setStep(52);
      } else if (hasSwinger) {
        setStep(51);
      } else if (hasBDSM) {
        setStep(5);
      } else {
        setStep(4);
      }
    } else if (step === 5 || step === 51 || step === 52) {
      setStep(4);
    } else {
      setStep(s => Math.max(0, s - 1));
    }
  };

  const handleSkipDeepDive = () => {
    setStep(6);
  };

  // Validation for proceeding
  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return accountType !== null;
      case 1:
        return Boolean(
          formData.displayName &&
          formData.location &&
          formData.gender &&
          formData.orientation &&
          formData.dateOfBirth &&
          validateDateOfBirth(formData.dateOfBirth)
        );
      case 2:
        return Boolean(formData.experienceLevel);
      case 3:
        const needsPartnerConsent = [
          'Married/Life Partner (Open)',
          'Married/Life Partner (Monogamous)',
          'Partnered in ENM Relationship',
          'In a D/s Relationship'
        ].includes(formData.relationshipContext || '');
        const needsOwnerConsent = formData.relationshipContext === 'Owned/Collared';
        
        return Boolean(
          formData.relationshipContext &&
          (!needsPartnerConsent || formData.partnerAlignment?.includes('partner_consent')) &&
          (!needsOwnerConsent || formData.consentConfirmed)
        );
      case 4:
        return Boolean(formData.lifestyleIdentities && formData.lifestyleIdentities.length > 0);
      case 16:
        return photoFiles.length >= 2;
      default:
        return true;
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('User not authenticated');
      if (photoFiles.length < 2) throw new Error('Please upload at least 2 photos');

      // Upload photos to Supabase storage
      const uploadedUrls: string[] = [];
      for (const file of photoFiles) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) throw new Error('Failed to get photo URL');
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // Calculate age from DOB
      const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 18;

      // Prepare profile data
      const profileData = {
        ...formData,
        id: user.id,
        age,
        photos: uploadedUrls,
        account_type: accountType,
        profile_completed: true,
        created_at: new Date().toISOString()
      };

      // Convert to snake_case for database
      const dbData: any = {
        id: user.id,
        display_name: profileData.displayName,
        location: profileData.location,
        date_of_birth: profileData.dateOfBirth,
        age: profileData.age,
        gender: profileData.gender,
        orientation: profileData.orientation,
        bio: profileData.bio,
        photos: profileData.photos,
        account_type: accountType,
        
        // Experience
        experience_level: profileData.experienceLevel,
        years_in_lifestyle: profileData.yearsInLifestyle,
        currently_active: profileData.currentlyActive,
        
        // Relationship context
        relationship_context: profileData.relationshipContext,
        partner_alignment: profileData.partnerAlignment,
        consent_confirmed: profileData.consentConfirmed,
        
        // Communities
        lifestyle_identities: profileData.lifestyleIdentities,
        
        // BDSM
        bdsm_role_primary: profileData.bdsmRolePrimary,
        bdsm_role_secondary: profileData.bdsmRoleSecondary,
        power_exchange_level: profileData.powerExchangeLevel,
        protocol_level: profileData.protocolLevel,
        collared_owned: profileData.collaredOwned,
        collar_ownership_status: profileData.collarOwnershipStatus,
        looking_for_collar_ownership: profileData.lookingForCollarOwnership,
        negotiation_style: profileData.negotiationStyle,
        safe_words: profileData.safeWords,
        aftercare_needs: profileData.aftercareNeeds,
        dungeon_etiquette_knowledge: profileData.dungeonEtiquetteKnowledge,
        public_play_comfort: profileData.publicPlayComfort,
        demo_performance_comfort: profileData.demoPerformanceComfort,
        interested_kinks: profileData.interestedKinks,
        hard_limits: profileData.hardLimits,
        soft_limits_detailed: profileData.softLimitsDetailed,
        
        // Swinger
        swinger_type: profileData.swingerType,
        swap_preferences: profileData.swapPreferences,
        club_experience: profileData.clubExperience,
        party_event_preferences: profileData.partyEventPreferences,
        favorite_clubs: profileData.favoriteClubs,
        group_play_max_size: profileData.groupPlayMaxSize,
        unicorn_bull_experience: profileData.unicornBullExperience,
        hosting_capability: profileData.canHost,
        travel_for_play: profileData.travelForPlay,
        
        // ENM/Poly
        poly_structure_detailed: profileData.polyStructureDetailed,
        solo_poly_status: profileData.soloPolyStatus,
        hierarchy_level: profileData.hierarchyLevel,
        nesting_partner_status: profileData.nestingPartnerStatus,
        polycule_size: profileData.polyculeSize,
        poly_saturation_level: profileData.polySaturationLevel,
        veto_power_exists: profileData.vetoPowerExists,
        check_in_frequency: profileData.checkInFrequency,
        transparency_level: profileData.transparencyLevel,
        overnight_stays_allowed: profileData.overnightStaysAllowed,
        scheduling_style: profileData.schedulingStyle,
        metamour_relationship_preference: profileData.metamourRelationshipPreference,
        relationship_escalator_views: profileData.relationshipEscalatorViews,
        
        // Intent & Seeking
        intent_here_for: profileData.intentHereFor,
        seeking_detailed: profileData.seekingDetailed,
        poly_role: profileData.polyRole,
        
        // Who to meet
        interested_in_types: profileData.interestedInTypes,
        interested_in_genders: profileData.interestedInGenders,
        singles_genders: profileData.singlesGenders,
        couple_pref: profileData.couplePref,
        couple_interaction: profileData.coupleInteraction,
        couple_interaction_genders: profileData.coupleInteractionGenders,
        group_types: profileData.groupTypes,
        polycule_preferences: profileData.polyculePreferences,
        
        // Boundaries
        comfortable_meeting: profileData.comfortableMeeting,
        comfort_environments: profileData.comfortEnvironments,
        first_meeting_preference: profileData.firstMeetingPreference,
        how_soon_to_meet: profileData.howSoonToMeet,
        photo_video_consent: profileData.photoVideoConsent,
        social_media_boundaries: profileData.socialMediaBoundaries,
        
        // Communication
        texting_frequency_preference: profileData.textingFrequencyPreference,
        phone_call_preference: profileData.phoneCallPreference,
        video_chat_comfort: profileData.videoChatComfort,
        response_time_expectation: profileData.responseTimeExpectation,
        communication_style: profileData.communicationStyle,
        
        // Sexual Health
        sti_testing_frequency: profileData.stiTestingFrequency,
        last_sti_test_date: profileData.lastSTITestDate,
        testing_required_before_play: profileData.testingRequiredBeforePlay,
        barrier_method_required: profileData.barrierMethodRequired,
        fluid_bonding_status: profileData.fluidBondingStatus,
        birth_control: profileData.birthControl,
        risk_profile: profileData.riskProfile,
        
        // Bio & personality
        love_languages: profileData.loveLanguages,
        attachment_style: profileData.attachmentStyle,
        
        // Physical
        height: profileData.height,
        weight: profileData.weight,
        body_type: profileData.bodyType,
        ethnicity: profileData.ethnicity,
        hair_color: profileData.hairColor,
        eye_color: profileData.eyeColor,
        facial_hair: profileData.facialHair,
        tattoos: profileData.tattoos,
        piercings: profileData.piercings,
        body_hair: profileData.bodyHair,
        grooming_style: profileData.groomingStyle,
        
        // Lifestyle
        work_schedule_type: profileData.workScheduleType,
        availability_times: profileData.availabilityTimes,
        has_children: profileData.hasChildren,
        children_live_with: profileData.childrenLiveWith,
        parenting_schedule: profileData.parentingSchedule,
        discretion_needs: profileData.discretionNeeds,
        out_to_family: profileData.outToFamily,
        out_to_vanilla_friends: profileData.outToVanillaFriends,
        out_at_work: profileData.outAtWork,
        
        // Interests
        interests: profileData.interests,
        local_events_attend: profileData.localEventsAttend,
        munches_attend: profileData.munchesAttend,
        workshops_classes_interest: profileData.workshopsClassesInterest,
        kink_conventions_attend: profileData.kinkConventionsAttend,
        online_communities_active: profileData.onlineCommunitiesActive,
        
        // Preferences
        deal_breakers_absolute: profileData.dealBreakersAbsolute,
        must_haves_list: profileData.mustHavesList,
        nice_to_haves_list: profileData.niceToHavesList,
        travel_distance_willing: profileData.travelDistanceWilling,
        
        // Verification
        references_available: profileData.referencesAvailable,
        reference_contacts: profileData.referenceContacts,
        background_check_completed: profileData.backgroundCheckCompleted,
        std_test_share_willingness: profileData.stdTestShareWillingness,
        
        // Membership
        membership_tier: profileData.membershipTier,
        
        // Match preferences
        match_preferences: profileData.matchPreferences,
        
        // Meta
        profile_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert into database
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert(dbData);

      if (dbError) throw dbError;

      // Success! Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('Profile submission error:', err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total steps for progress
  const totalSteps = accountType === 'individual' ? 19 : 1; // 19 for individual (0-18)
  const progressPercentage = Math.round(((step + 1) / totalSteps) * 100);

  // Render current step
  const renderStep = () => {
    // Step 0: Account Type
    if (step === 0) {
      return (
        <Step0_AccountType
          accountType={accountType}
          onSelect={setAccountType}
          onNext={handleNext}
        />
      );
    }

    // Only Individual account for now
    if (accountType !== 'individual') {
      return (
        <div className="text-center text-white p-8">
          <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-text-secondary">
            Couple accounts are currently under development. Please select Individual account for now.
          </p>
          <button
            onClick={() => {
              setAccountType(null);
              setStep(0);
            }}
            className="mt-6 px-6 py-2 bg-brand-primary rounded-lg hover:bg-brand-primary/80"
          >
            Go Back
          </button>
        </div>
      );
    }

    // Individual account steps
    switch (step) {
      case 1:
        return (
          <Step1_BasicInfo
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
            canProceed={canProceed()}
          />
        );
      case 2:
        return (
          <Step2_Experience
            formData={formData}
            onSelect={handleSelect}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <Step3_RelationshipContext
            formData={formData}
            onSelect={handleSelect}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 4:
        return (
          <Step4_CommunityID
            formData={formData}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 5:
        return (
          <Step5A_BDSMDeepDive
            formData={formData}
            onSelect={handleSelect}
            onToggle={handleToggle}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkipDeepDive}
          />
        );
      case 51:
        return (
          <Step5B_SwingerDeepDive
            formData={formData}
            onSelect={handleSelect}
            onToggle={handleToggle}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkipDeepDive}
          />
        );
      case 52:
        return (
          <Step5C_ENMPolyDeepDive
            formData={formData}
            onSelect={handleSelect}
            onToggle={handleToggle}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleSkipDeepDive}
          />
        );
      case 6:
        return (
          <Step6_Intent
            formData={formData}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 7:
        return (
          <Step7_WhoToMeet
            formData={formData}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 8:
        return (
          <Step8_Boundaries
            formData={formData}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 9:
        return (
          <Step9_Communication
            formData={formData}
            onSelect={handleSelect}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 10:
        return (
          <Step10_SexualHealth
            formData={formData}
            onSelect={handleSelect}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 11:
        return (
          <Step11_Bio
            formData={formData}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 12:
        return (
          <Step12_Physical
            formData={formData}
            onSelect={handleSelect}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 13:
        return (
          <Step13_Lifestyle
            formData={formData}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 14:
        return (
          <Step14_Interests
            formData={formData}
            onToggle={handleToggle}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 15:
        return (
          <Step15_Preferences
            formData={formData}
            onToggle={handleToggle}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 16:
        return (
          <Step16_Photos
            formData={formData}
            photoFiles={photoFiles}
            onPhotoUpload={handlePhotoUpload}
            onRemovePhoto={handleRemovePhoto}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 17:
        return (
          <Step17_Verification
            formData={formData}
            onSelect={handleSelect}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 18:
        return (
          <Step18_Membership
            formData={formData}
            onSelect={handleSelect}
            onSubmit={handleSubmit}
            onPrev={handlePrev}
            loading={loading}
          />
        );
      default:
        return <div className=\"text-white\">Unknown step</div>;
    }
  };

  return (
    <div
      className=\"min-h-screen py-8 px-4\"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className=\"max-w-4xl mx-auto\">
        <div className=\"bg-base-100/95 backdrop-blur-sm rounded-xl shadow-2xl p-8\">
          {/* Progress Bar */}
          {step > 0 && (
            <div className=\"mb-8\">
              <div className=\"flex justify-between items-center mb-2\">
                <span className=\"text-sm text-text-secondary\">
                  Step {step > 4 && step < 6 ? '5' : step > 50 ? '5' : step} of 18
                </span>
                <span className=\"text-sm text-brand-secondary font-semibold\">
                  {progressPercentage}%
                </span>
              </div>
              <div className=\"w-full bg-base-300 rounded-full h-2\">
                <div
                  className=\"bg-gradient-to-r from-brand-primary to-brand-secondary h-2 rounded-full transition-all duration-300\"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className=\"mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400\">
              {error}
            </div>
          )}

          {/* Current Step Content */}
          {renderStep()}
        </div>
      </div>
    </div>
  );
};
