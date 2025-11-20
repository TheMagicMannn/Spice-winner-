import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  User, 
  MapPin, 
  Heart, 
  Camera, 
  Save, 
  X, 
  Plus,
  Trash2,
  Upload,
  Lock,
  Play,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  FileVideo,
  AlertCircle
} from 'lucide-react';
import { Spinner } from './Spinner';
import { spiceTheme } from '../styles/theme';
import PrivateContentService, { PrivateContent } from '../services/privateContentService';
import { useAuth } from '../hooks/useAuth';

// Options arrays (from database schema)
const GENDER_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Transgender Male', 
  'Transgender Female', 'Genderqueer', 'Other'
];

const ORIENTATION_OPTIONS = [
  'Straight', 'Bisexual', 'Gay', 'Pansexual', 
  'Queer', 'Asexual', 'Other'
];

const RELATIONSHIP_STATUS_OPTIONS = [
  'Single', 'Married', 'Divorced', 'Widowed', 
  'In a Relationship', 'Open Relationship', 'It\'s Complicated'
];

const EXPERIENCE_LEVELS = ['New', 'Beginner', 'Moderate', 'Advanced'];

const SEEKING_OPTIONS = [
  'Men', 'Women', 'Couples', 'Trans Men', 'Trans Women', 
  'Non-binary', 'Everyone'
];

const RELATIONSHIP_TYPE_OPTIONS = [
  'Casual Dating', 'Serious Relationship', 'Friends with Benefits',
  'Hookups', 'Long-term', 'Short-term', 'Play Partners',
  'Friendship First', 'Open to Anything'
];

const INTERESTS_OPTIONS = [
  'Live Music', 'Wine Tasting', 'Craft Beer', 'Hiking', 'Art Galleries',
  'Dancing', 'Travel', 'Fine Dining', 'Fitness/Gym', 'Yoga/Meditation',
  'Photography', 'Gaming', 'Boating', 'Movies', 'Theater', 'Cooking',
  'Rooftop Bars', 'Speakeasies', 'Cigars', 'Whiskey', 'Fashion',
  'Charity Events', 'Sports', 'Reading', 'Beach Clubs'
];

const KINKS_OPTIONS = [
  'BDSM', 'Roleplay', 'Voyeurism', 'Exhibitionism', 'Swinging', 
  'Group Play', 'Tantric Sex', 'Food Play', 'Dominance', 'Submission',
  'Bondage', 'Impact Play', 'Sensory Deprivation', 'Age Play', 
  'Cuckolding', 'Foot Fetish', 'Leather/Latex', 'Uniforms', 
  'Medical Play', 'Pet Play', 'Praise', 'Degradation', 'Watersports', 
  'Anal Play', 'Public Play'
];

const LIMITS_OPTIONS = [
  'Blood Play', 'Scat', 'Breath Play', 'Needle Play', 'Humiliation', 
  'Public Exposure', 'Pain', 'Rough Play', 'Anal', 'Oral', 
  'Choking', 'Hair Pulling', 'Spanking', 'Blindfolding', 'Recording'
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onSave: (updatedProfile: Profile) => Promise<void>;
  onUploadPhoto?: (file: File) => Promise<string>;
  onDeletePhoto?: (photoUrl: string) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onUploadPhoto,
  onDeletePhoto
}) => {
  const { user } = useAuth();
  const [editedProfile, setEditedProfile] = useState<Profile>(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Private content state
  const [privateContent, setPrivateContent] = useState<PrivateContent[]>([]);
  const [uploadingPrivateContent, setUploadingPrivateContent] = useState(false);
  const [loadingPrivateContent, setLoadingPrivateContent] = useState(false);
  const [privateContentDescriptions, setPrivateContentDescriptions] = useState<Record<string, string>>({});

  // Update profile state when prop changes
  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  // Load private content when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadPrivateContent();
    }
  }, [isOpen, user]);

  // Load user's private content
  const loadPrivateContent = async () => {
    if (!user) return;
    
    setLoadingPrivateContent(true);
    try {
      const content = await PrivateContentService.getUserPrivateContent(user.id);
      setPrivateContent(content);
      
      // Initialize descriptions
      const descriptions: Record<string, string> = {};
      content.forEach(item => {
        if (item.description) {
          descriptions[item.id] = item.description;
        }
      });
      setPrivateContentDescriptions(descriptions);
    } catch (error) {
      console.error('Error loading private content:', error);
    } finally {
      setLoadingPrivateContent(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof Profile, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes (interests, kinks, etc.)
  const handleArrayFieldChange = (field: keyof Profile, value: string, checked: boolean) => {
    setEditedProfile(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadPhoto) return;

    setUploadingPhoto(true);
    try {
      const photoUrl = await onUploadPhoto(file);
      const currentPhotos = editedProfile.photos || [];
      handleInputChange('photos', [...currentPhotos, photoUrl]);
    } catch (error) {
      console.error('Photo upload failed:', error);
      // TODO: Show error toast
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle photo deletion
  const handlePhotoDelete = async (photoUrl: string) => {
    if (onDeletePhoto) {
      try {
        await onDeletePhoto(photoUrl);
      } catch (error) {
        console.error('Photo deletion failed:', error);
      }
    }
    
    const currentPhotos = editedProfile.photos || [];
    handleInputChange('photos', currentPhotos.filter(url => url !== photoUrl));
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      console.log('EditProfileModal - Saving profile:', editedProfile);
      await onSave(editedProfile);
      onClose();
    } catch (error: any) {
      console.error('Save failed:', error);
      const errorMsg = error?.message || 'Failed to save profile. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation
  const isFormValid = () => {
    const required = [
      editedProfile.displayName?.trim(),
      editedProfile.age && editedProfile.age >= 18,
      editedProfile.location?.trim(),
      editedProfile.bio?.trim() && editedProfile.bio.trim().length >= 50,
      editedProfile.photos && editedProfile.photos.length >= 2
    ];

    // Additional validation for couples
    if (editedProfile.accountType === 'couple') {
      required.push(
        editedProfile.displayName2?.trim(),
        editedProfile.age2 && editedProfile.age2 >= 18
      );
    }

    return required.every(Boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-pink-400 text-2xl flex items-center">
            <User className="h-6 w-6 mr-2" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            {/* Account Type */}
            <div className="space-y-2">
              <Label className="text-white">Account Type</Label>
              <Select
                value={editedProfile.accountType}
                onValueChange={(value) => handleInputChange('accountType', value)}
              >
                <SelectTrigger className="bg-gray-900 border-pink-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="couple">Couple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Primary Person Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Display Name</Label>
                <Input
                  value={editedProfile.displayName || ''}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="bg-gray-900 border-pink-500/30 text-white"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Age</Label>
                <Input
                  type="number"
                  min="18"
                  max="100"
                  value={editedProfile.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || null)}
                  className="bg-gray-900 border-pink-500/30 text-white"
                />
              </div>
            </div>

            {/* Couple Second Person Details */}
            {editedProfile.accountType === 'couple' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-pink-500/30 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-white">Partner's Name</Label>
                  <Input
                    value={editedProfile.displayName2 || ''}
                    onChange={(e) => handleInputChange('displayName2', e.target.value)}
                    className="bg-gray-900 border-pink-500/30 text-white"
                    placeholder="Partner's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Partner's Age</Label>
                  <Input
                    type="number"
                    min="18"
                    max="100"
                    value={editedProfile.age2 || ''}
                    onChange={(e) => handleInputChange('age2', parseInt(e.target.value) || null)}
                    className="bg-gray-900 border-pink-500/30 text-white"
                  />
                </div>
              </div>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-white">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <Input
                  value={editedProfile.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-gray-900 border-pink-500/30 text-white pl-10"
                  placeholder="City, State"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label className="text-white">Bio</Label>
              <Textarea
                value={editedProfile.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="bg-gray-900 border-pink-500/30 text-white h-32"
                placeholder="Tell others about yourself... (minimum 50 characters)"
              />
              <div className="text-xs text-white/50">
                {editedProfile.bio?.length || 0} / 50 minimum characters
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Identity Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Gender</Label>
                <Select
                  value={editedProfile.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger className="bg-gray-900 border-pink-500/30 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(gender => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Orientation</Label>
                <Select
                  value={editedProfile.orientation}
                  onValueChange={(value) => handleInputChange('orientation', value)}
                >
                  <SelectTrigger className="bg-gray-900 border-pink-500/30 text-white">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIENTATION_OPTIONS.map(orientation => (
                      <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Couple Second Person Identity */}
            {editedProfile.accountType === 'couple' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-pink-500/30 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-white">Partner's Gender</Label>
                  <Select
                    value={editedProfile.gender2}
                    onValueChange={(value) => handleInputChange('gender2', value)}
                  >
                    <SelectTrigger className="bg-gray-900 border-pink-500/30 text-white">
                      <SelectValue placeholder="Select partner's gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map(gender => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Partner's Orientation</Label>
                  <Select
                    value={editedProfile.orientation2}
                    onValueChange={(value) => handleInputChange('orientation2', value)}
                  >
                    <SelectTrigger className="bg-gray-900 border-pink-500/30 text-white">
                      <SelectValue placeholder="Select partner's orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIENTATION_OPTIONS.map(orientation => (
                        <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Relationship Status */}
            <div className="space-y-2">
              <Label className="text-white">Relationship Status</Label>
              <Select
                value={editedProfile.relationshipStatus}
                onValueChange={(value) => handleInputChange('relationshipStatus', value)}
              >
                <SelectTrigger className="bg-gray-900 border-pink-500/30 text-white">
                  <SelectValue placeholder="Select relationship status" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_STATUS_OPTIONS.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lifestyle Experience */}
            <div className="space-y-2">
              <Label className="text-white">Lifestyle Experience</Label>
              <Select
                value={editedProfile.lifestyleExperience}
                onValueChange={(value) => handleInputChange('lifestyleExperience', value)}
              >
                <SelectTrigger className="bg-gray-900 border-pink-500/30 text-white">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seeking Relationship Type */}
            <div className="space-y-2">
              <Label className="text-white">Seeking Relationship Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {RELATIONSHIP_TYPE_OPTIONS.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`relationship-type-${option}`}
                      checked={(editedProfile.seekingRelationshipType || []).includes(option)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('seekingRelationshipType', option, !!checked)
                      }
                    />
                    <Label htmlFor={`relationship-type-${option}`} className="text-sm text-white">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Seeking (Demographics) */}
            <div className="space-y-2">
              <Label className="text-white">Seeking (Demographics)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SEEKING_OPTIONS.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`seeking-${option}`}
                      checked={(editedProfile.seeking || []).includes(option)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('seeking', option, !!checked)
                      }
                    />
                    <Label htmlFor={`seeking-${option}`} className="text-sm text-white">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Practices */}
            <div className="space-y-2">
              <Label className="text-white">Safety Practices</Label>
              <Textarea
                value={editedProfile.safetyPractices || ''}
                onChange={(e) => handleInputChange('safetyPractices', e.target.value)}
                className="bg-gray-900 border-pink-500/30 text-white"
                placeholder="Describe your safety practices..."
              />
            </div>

            {/* Rules */}
            <div className="space-y-2">
              <Label className="text-white">Rules & Boundaries</Label>
              <Textarea
                value={editedProfile.rules || ''}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                className="bg-gray-900 border-pink-500/30 text-white"
                placeholder="Your rules and boundaries..."
              />
            </div>
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-6 mt-6">
            {/* General Interests */}
            <div className="space-y-3">
              <Label className="text-white text-lg">General Interests</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTERESTS_OPTIONS.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`interest-${interest}`}
                      checked={(editedProfile.interests || []).includes(interest)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('interests', interest, !!checked)
                      }
                    />
                    <Label htmlFor={`interest-${interest}`} className="text-sm text-white">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Kinks */}
            <div className="space-y-3">
              <Label className="text-white text-lg">Kinks & Preferences</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {KINKS_OPTIONS.map(kink => (
                  <div key={kink} className="flex items-center space-x-2">
                    <Checkbox
                      id={`kink-${kink}`}
                      checked={(editedProfile.kinks || []).includes(kink)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('kinks', kink, !!checked)
                      }
                    />
                    <Label htmlFor={`kink-${kink}`} className="text-sm text-white">
                      {kink}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Limits */}
            <div className="space-y-3">
              <Label className="text-white text-lg">Soft Limits (might try)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LIMITS_OPTIONS.map(limit => (
                  <div key={limit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`soft-${limit}`}
                      checked={(editedProfile.softLimits || []).includes(limit)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('softLimits', limit, !!checked)
                      }
                    />
                    <Label htmlFor={`soft-${limit}`} className="text-sm text-white">
                      {limit}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Hard Limits */}
            <div className="space-y-3">
              <Label className="text-white text-lg">Hard Limits (absolute no's)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LIMITS_OPTIONS.map(limit => (
                  <div key={limit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`hard-${limit}`}
                      checked={(editedProfile.hardLimits || []).includes(limit)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('hardLimits', limit, !!checked)
                      }
                    />
                    <Label htmlFor={`hard-${limit}`} className="text-sm text-orange-300">
                      {limit}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6 mt-6">
            <div className="space-y-4">
              <Label className="text-white text-lg flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Profile Photos (minimum 2 required)
              </Label>
              
              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                  disabled={uploadingPhoto}
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  {uploadingPhoto ? (
                    <Spinner />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <span className="text-sm text-white/60">
                  {(editedProfile.photos || []).length} / 10 photos
                </span>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(editedProfile.photos || []).map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Profile photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handlePhotoDelete(photo)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 bg-pink-500 text-white text-xs">
                        Main
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Photo Guidelines */}
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Photo Guidelines</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Upload at least 2 photos (first one will be your main photo)</li>
                  <li>• Photos should clearly show your face</li>
                  <li>• No nudity or explicit content</li>
                  <li>• Photos must be of yourself/your couple</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-pink-500/30">
            <div className="text-sm text-white/60">
              {isFormValid() ? (
                <span className="text-green-400">Profile is complete ✓</span>
              ) : (
                <span className="text-orange-400">Please complete all required fields</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-500 text-gray-300 hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || !isFormValid()}
                className="bg-pink-600 hover:bg-pink-700 text-white"
                data-testid="save-profile-button"
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
