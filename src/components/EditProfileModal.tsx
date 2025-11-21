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
import PrivateContentViewer from './PrivateContentViewer';

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

// Physical Stats Options
const BODY_TYPE_OPTIONS = [
  'Slim', 'Average', 'Athletic', 'Muscular', 'Curvy', 'Dad Bod', 
  'Thick', 'BBW', 'Fit', 'Petite', 'Heavyset'
];

const HAIR_COLOR_OPTIONS = [
  'Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 
  'White', 'Salt and Pepper', 'Bald', 'Other'
];

const EYE_COLOR_OPTIONS = [
  'Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Other'
];

const FACIAL_HAIR_OPTIONS = [
  'Clean Shaven', 'Stubble', 'Goatee', 'Beard', 'Mustache', 
  'Full Beard', 'Doesn\'t Apply'
];

const ETHNICITY_OPTIONS = [
  'Asian', 'Black/African', 'Caucasian/White', 'Hispanic/Latino', 
  'Middle Eastern', 'Native American', 'Pacific Islander', 
  'Mixed/Multiracial', 'Other', 'Prefer not to say'
];

const BODY_HAIR_OPTIONS = [
  'None', 'Light', 'Moderate', 'Heavy', 'Trimmed', 'Natural'
];

const GROOMING_STYLE_OPTIONS = [
  'Natural', 'Trimmed', 'Shaved', 'Waxed', 'Prefer not to say'
];

const BIRTH_CONTROL_OPTIONS = [
  'Yes', 'No', 'Sometimes', 'Prefer not to say'
];

const YES_NO_OPTIONS = ['Yes', 'No'];

const YES_NO_POSSIBLY_OPTIONS = ['Yes', 'No', 'Possibly'];

const STI_TEST_OPTIONS = ['Negative', 'Positive', 'Prefer not to say'];

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
  const [privateContentUrls, setPrivateContentUrls] = useState<Record<string, string>>({});
  
  // Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

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
      
      // Generate signed URLs for all content
      if (content.length > 0) {
        const paths = content.map(item => item.storage_path);
        const urls = await PrivateContentService.getPrivateContentUrls(paths);
        setPrivateContentUrls(urls);
      }
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

  // Handle private content upload
  const handlePrivateContentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setErrorMessage('File size must be under 50MB');
      return;
    }

    // Check max items limit
    if (privateContent.length >= 20) {
      setErrorMessage('Maximum 20 private content items allowed');
      return;
    }

    // Determine content type
    const contentType = file.type.startsWith('video/') ? 'video' : 'photo';

    setUploadingPrivateContent(true);
    setErrorMessage(null);
    try {
      const uploadedContent = await PrivateContentService.uploadPrivateContent(
        user.id,
        file,
        contentType,
        '' // Description can be added later
      );
      
      setPrivateContent(prev => [...prev, uploadedContent]);
    } catch (error) {
      console.error('Private content upload failed:', error);
      setErrorMessage('Failed to upload private content. Please try again.');
    } finally {
      setUploadingPrivateContent(false);
      // Reset input
      event.target.value = '';
    }
  };

  // Handle private content deletion
  const handlePrivateContentDelete = async (contentId: string) => {
    try {
      await PrivateContentService.deletePrivateContent(contentId);
      setPrivateContent(prev => prev.filter(item => item.id !== contentId));
      
      // Remove description
      setPrivateContentDescriptions(prev => {
        const updated = { ...prev };
        delete updated[contentId];
        return updated;
      });
    } catch (error) {
      console.error('Private content deletion failed:', error);
      setErrorMessage('Failed to delete private content. Please try again.');
    }
  };

  // Handle private content reorder
  const movePrivateContent = (index: number, direction: 'up' | 'down') => {
    const newContent = [...privateContent];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newContent.length) return;
    
    // Swap items
    [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
    setPrivateContent(newContent);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Open viewer
  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  // Navigate viewer
  const navigateViewer = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1);
    } else if (direction === 'next' && viewerIndex < privateContent.length - 1) {
      setViewerIndex(viewerIndex + 1);
    }
  };

  // Get viewer content
  const getViewerContent = () => {
    return privateContent.map(content => ({
      url: privateContentUrls[content.storage_path] || '',
      type: content.content_type,
      description: content.description
    }));
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
          <TabsList className="grid w-full grid-cols-6 bg-gray-900">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="physical">Physical Stats</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="private-content">
              <Lock className="h-4 w-4 mr-1" />
              Private
            </TabsTrigger>
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

          {/* Private Content Tab */}
          <TabsContent value="private-content" className="space-y-6 mt-6">
            <div className="space-y-4">
              <Label className="text-white text-lg flex items-center">
                <Lock className="h-5 w-5 mr-2 text-purple-400" />
                Private Content (Photos & Videos)
              </Label>
              
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-200">
                    <p className="font-medium mb-1">Private Content Guidelines:</p>
                    <ul className="space-y-1 text-purple-300">
                      <li>• Only visible to users you grant access to</li>
                      <li>• Maximum 20 items allowed</li>
                      <li>• File size limit: 50MB per file</li>
                      <li>• Supported formats: Images (JPG, PNG, GIF) and Videos (MP4, MOV, AVI)</li>
                      <li>• You can reorder items using the arrows</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  disabled={uploadingPrivateContent || privateContent.length >= 20}
                  onClick={() => document.getElementById('private-content-upload')?.click()}
                  data-testid="upload-private-content-button"
                >
                  {uploadingPrivateContent ? (
                    <Spinner />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Private Content
                    </>
                  )}
                </Button>
                <input
                  id="private-content-upload"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handlePrivateContentUpload}
                />
                <span className="text-sm text-white/60">
                  {privateContent.length} / 20 items
                </span>
              </div>

              {/* Loading State */}
              {loadingPrivateContent && (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              )}

              {/* Private Content Grid */}
              {!loadingPrivateContent && privateContent.length > 0 && (
                <div className="space-y-3">
                  {privateContent.map((content, index) => (
                    <div 
                      key={content.id} 
                      className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4"
                      data-testid={`private-content-item-${index}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div 
                          className="relative w-24 h-24 flex-shrink-0 bg-black rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openViewer(index)}
                          data-testid={`open-viewer-${index}`}
                        >
                          {content.content_type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Play className="h-8 w-8 text-purple-400" />
                            </div>
                          ) : privateContentUrls[content.storage_path] ? (
                            <img
                              src={privateContentUrls[content.storage_path]}
                              alt="Private content"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Spinner />
                            </div>
                          )}
                          <Badge 
                            className={`absolute top-1 right-1 text-xs ${
                              content.content_type === 'video' 
                                ? 'bg-purple-500/90 text-white' 
                                : 'bg-pink-500/90 text-white'
                            }`}
                          >
                            {content.content_type === 'video' ? (
                              <FileVideo className="h-3 w-3 mr-1" />
                            ) : (
                              <ImageIcon className="h-3 w-3 mr-1" />
                            )}
                            {content.content_type}
                          </Badge>
                        </div>

                        {/* Content Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-white/50">
                              Uploaded {new Date(content.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <Textarea
                            value={privateContentDescriptions[content.id] || content.description || ''}
                            onChange={(e) => {
                              setPrivateContentDescriptions(prev => ({
                                ...prev,
                                [content.id]: e.target.value
                              }));
                            }}
                            placeholder="Add a description (optional)"
                            className="bg-gray-900 border-purple-500/30 text-white text-sm h-16 mb-2"
                          />

                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <span className="capitalize">{content.content_type}</span>
                            <span>•</span>
                            <span>ID: {content.id.slice(0, 8)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {/* Reorder buttons */}
                          <div className="flex flex-col">
                            <button
                              onClick={() => movePrivateContent(index, 'up')}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0 
                                  ? 'text-white/20 cursor-not-allowed' 
                                  : 'text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                              title="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => movePrivateContent(index, 'down')}
                              disabled={index === privateContent.length - 1}
                              className={`p-1 rounded ${
                                index === privateContent.length - 1
                                  ? 'text-white/20 cursor-not-allowed' 
                                  : 'text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                              title="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => handlePrivateContentDelete(content.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                            title="Delete"
                            data-testid={`delete-private-content-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loadingPrivateContent && privateContent.length === 0 && (
                <div className="text-center py-12 bg-gray-900/30 rounded-lg border border-purple-500/20">
                  <Lock className="h-12 w-12 mx-auto text-purple-400/50 mb-3" />
                  <p className="text-white/70 mb-2">No private content uploaded yet</p>
                  <p className="text-sm text-white/50">
                    Upload private photos and videos to share with specific users
                  </p>
                </div>
              )}
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

      {/* Private Content Viewer */}
      {viewerOpen && privateContent[viewerIndex] && privateContentUrls[privateContent[viewerIndex].storage_path] && (
        <PrivateContentViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          contentUrl={privateContentUrls[privateContent[viewerIndex].storage_path]}
          contentType={privateContent[viewerIndex].content_type}
          ownerName={editedProfile.displayName || 'User'}
          description={privateContent[viewerIndex].description}
          allContent={getViewerContent()}
          currentIndex={viewerIndex}
          onNavigate={navigateViewer}
        />
      )}
    </Dialog>
  );
};

export default EditProfileModal;
