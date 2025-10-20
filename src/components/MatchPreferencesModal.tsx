import React, { useState, useEffect } from 'react';
import { Profile, MatchPreferences } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Save, X, Sliders } from 'lucide-react';
import { Spinner } from './Spinner';
import { spiceTheme } from '../styles/theme';

// Options arrays matching ProfileSetup.tsx
const GENDER_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Transgender Male', 
  'Transgender Female', 'Genderqueer', 'Other'
];

const SEXUALITY_OPTIONS = [
  'Straight', 'Bisexual', 'Gay', 'Pansexual', 
  'Queer', 'Asexual', 'Other'
];

const EXPERIENCE_LEVEL_OPTIONS = ['New', 'Beginner', 'Moderate', 'Advanced'];

const SEARCHING_FOR_OPTIONS = ['Individual', 'Couple', 'Both'];

interface MatchPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: MatchPreferences;
  onSave: (updatedPreferences: MatchPreferences) => Promise<void>;
}

export const MatchPreferencesModal: React.FC<MatchPreferencesModalProps> = ({
  isOpen,
  onClose,
  currentPreferences,
  onSave
}) => {
  const [preferences, setPreferences] = useState<MatchPreferences>(currentPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update preferences state when prop changes
  useEffect(() => {
    setPreferences(currentPreferences);
  }, [currentPreferences]);

  // Handle array field changes (genders, sexualities, etc.)
  const handleArrayToggle = (field: keyof MatchPreferences, value: string) => {
    setPreferences(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      }
    });
  };

  // Handle age range change
  const handleAgeRangeChange = (index: 0 | 1, value: number) => {
    setPreferences(prev => {
      const newRange: [number, number] = [...prev.ageRange] as [number, number];
      newRange[index] = value;
      
      // Ensure min doesn't exceed max
      if (index === 0 && newRange[0] > newRange[1]) {
        newRange[1] = newRange[0];
      }
      // Ensure max doesn't go below min
      if (index === 1 && newRange[1] < newRange[0]) {
        newRange[0] = newRange[1];
      }
      
      return {
        ...prev,
        ageRange: newRange
      };
    });
  };

  // Handle distance change
  const handleDistanceChange = (value: number) => {
    setPreferences(prev => ({
      ...prev,
      distance: value
    }));
  };

  // Handle boolean toggle
  const handleBooleanToggle = (field: 'vipOnly' | 'verifiedOnly', value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      console.log('MatchPreferencesModal - Saving preferences:', preferences);
      await onSave(preferences);
      onClose();
    } catch (error: any) {
      console.error('Failed to save match preferences:', error);
      const errorMsg = error?.message || 'Failed to save match preferences. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-pink-400 text-2xl flex items-center">
            <Sliders className="h-6 w-6 mr-2" />
            Match Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Age Range */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-white text-lg">Preferred Age Range</Label>
              <span className="text-pink-400 font-semibold">
                {preferences.ageRange[0]} - {preferences.ageRange[1]} years
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Label className="w-16 text-white/70">Min:</Label>
                <input
                  type="range"
                  min={18}
                  max={99}
                  value={preferences.ageRange[0]}
                  onChange={(e) => handleAgeRangeChange(0, Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                  data-testid="age-range-min"
                />
                <span className="w-12 text-right text-white/70">{preferences.ageRange[0]}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Label className="w-16 text-white/70">Max:</Label>
                <input
                  type="range"
                  min={18}
                  max={99}
                  value={preferences.ageRange[1]}
                  onChange={(e) => handleAgeRangeChange(1, Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                  data-testid="age-range-max"
                />
                <span className="w-12 text-right text-white/70">{preferences.ageRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Preferred Genders */}
          <div className="space-y-3">
            <Label className="text-white text-lg">Preferred Genders</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GENDER_OPTIONS.map(gender => (
                <div key={gender} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-pref-${gender}`}
                    checked={preferences.genders.includes(gender)}
                    onCheckedChange={(checked) => handleArrayToggle('genders', gender)}
                    className="border-pink-500/50"
                    data-testid={`gender-${gender}`}
                  />
                  <Label htmlFor={`gender-pref-${gender}`} className="text-sm text-white cursor-pointer">
                    {gender}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preferred Sexualities */}
          <div className="space-y-3">
            <Label className="text-white text-lg">Preferred Sexualities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SEXUALITY_OPTIONS.map(sexuality => (
                <div key={sexuality} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sexuality-pref-${sexuality}`}
                    checked={preferences.sexualities.includes(sexuality)}
                    onCheckedChange={(checked) => handleArrayToggle('sexualities', sexuality)}
                    className="border-pink-500/50"
                    data-testid={`sexuality-${sexuality}`}
                  />
                  <Label htmlFor={`sexuality-pref-${sexuality}`} className="text-sm text-white cursor-pointer">
                    {sexuality}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Searching For */}
          <div className="space-y-3">
            <Label className="text-white text-lg">Searching For</Label>
            <div className="flex flex-wrap gap-3">
              {SEARCHING_FOR_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() => handleArrayToggle('searchingFor', option)}
                  className={`py-2 px-6 rounded-full font-medium transition-all ${
                    preferences.searchingFor.includes(option)
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-800 text-white/70 hover:bg-gray-700'
                  }`}
                  data-testid={`searching-${option}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Preference */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-white text-lg">Distance Preference</Label>
              <span className="text-pink-400 font-semibold">
                {preferences.distance} miles
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={200}
                value={preferences.distance}
                onChange={(e) => handleDistanceChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                data-testid="distance-slider"
              />
            </div>
          </div>

          {/* Experience Level Preference */}
          <div className="space-y-3">
            <Label className="text-white text-lg">Experience Level Preference</Label>
            <div className="flex flex-wrap gap-3">
              {EXPERIENCE_LEVEL_OPTIONS.map(level => (
                <button
                  key={level}
                  onClick={() => handleArrayToggle('experienceLevels', level)}
                  className={`py-2 px-6 rounded-full font-medium transition-all ${
                    preferences.experienceLevels.includes(level)
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-800 text-white/70 hover:bg-gray-700'
                  }`}
                  data-testid={`experience-${level}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Profiles Only */}
          <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg">
            <div>
              <Label className="text-white text-base">Verified Profiles Only</Label>
              <p className="text-xs text-white/60 mt-1">Only show profiles with verified badges</p>
            </div>
            <Switch
              checked={preferences.verifiedOnly}
              onCheckedChange={(checked) => handleBooleanToggle('verifiedOnly', checked)}
              className="data-[state=checked]:bg-pink-500"
              data-testid="verified-only-toggle"
            />
          </div>

          {/* VIP Only */}
          <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg">
            <div>
              <Label className="text-white text-base">VIP Members Only</Label>
              <p className="text-xs text-white/60 mt-1">Only show VIP members in matches</p>
            </div>
            <Switch
              checked={preferences.vipOnly}
              onCheckedChange={(checked) => handleBooleanToggle('vipOnly', checked)}
              className="data-[state=checked]:bg-pink-500"
              data-testid="vip-only-toggle"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4 mt-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-pink-500/30">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-500 text-gray-300 hover:bg-gray-800"
              data-testid="cancel-button"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700 text-white"
              data-testid="save-preferences-button"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Custom Styles for Range Sliders */}
        <style>{`
          .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #ec4899;
            cursor: pointer;
            border-radius: 50%;
          }
          .range-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #ec4899;
            cursor: pointer;
            border-radius: 50%;
            border: none;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default MatchPreferencesModal;
