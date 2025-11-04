import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X, Plus, Loader2, CheckCircle } from 'lucide-react';
import { spiceTheme } from '@/styles/theme';
import { ISOPost, SEEKING_TYPE_OPTIONS } from '@/services/isoPostService';

interface CreateISOPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    location: string;
    tags: string[];
    seeking_type: string[];
  }) => Promise<void>;
  initialData?: ISOPost | null;
  mode?: 'create' | 'edit';
}

const SUGGESTED_TAGS = [
  'Couples',
  'Singles',
  'Social',
  'Travel',
  'Events',
  'Parties',
  'New',
  'Experienced',
  'Casual',
  'FWB',
  'Poly',
  'Discreet',
  'Long-term',
  'Short-term',
  'Adventure',
  'Lifestyle'
];

export const CreateISOPostModal: React.FC<CreateISOPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create'
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [seekingTypes, setSeekingTypes] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSeekingDropdown, setShowSeekingDropdown] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    location?: string;
    seeking_type?: string;
  }>({});

  // Load initial data when editing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setTitle(initialData.title);
      setContent(initialData.content);
      setLocation(initialData.location);
      setTags(initialData.tags || []);
      setSeekingTypes(initialData.seeking_type || []);
    } else {
      // Reset form for create mode
      setTitle('');
      setContent('');
      setLocation('');
      setTags([]);
      setSeekingTypes([]);
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    } else if (content.length > 2000) {
      newErrors.content = 'Content must be less than 2000 characters';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (seekingTypes.length === 0) {
      newErrors.seeking_type = 'Please select at least one seeking type';
    } else if (seekingTypes.length > 3) {
      newErrors.seeking_type = 'Maximum 3 seeking types allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        location: location.trim(),
        tags,
        seeking_type: seekingTypes
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting ISO post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setLocation('');
    setTags([]);
    setSeekingTypes([]);
    setCustomTag('');
    setShowSeekingDropdown(false);
    setErrors({});
    onClose();
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 8) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 8) {
      setTags([...tags, trimmedTag]);
      setCustomTag('');
    }
  };

  const toggleSeekingType = (type: string) => {
    if (seekingTypes.includes(type)) {
      setSeekingTypes(seekingTypes.filter(t => t !== type));
    } else if (seekingTypes.length < 3) {
      setSeekingTypes([...seekingTypes, type]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-pink-400">
            {mode === 'edit' ? 'Edit ISO Post' : 'Create ISO Post'}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Share what or who you're looking for with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-white mb-2 block">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Seeking adventurous couple for weekend getaway"
              className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40"
              maxLength={200}
              data-testid="iso-post-title-input"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && (
                <span className="text-red-400 text-sm">{errors.title}</span>
              )}
              <span className="text-white/50 text-xs ml-auto">
                {title.length}/200
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-white mb-2 block">
              Location <span className="text-red-400">*</span>
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="E.g., Manhattan, NY"
              className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40"
              data-testid="iso-post-location-input"
            />
            {errors.location && (
              <span className="text-red-400 text-sm mt-1 block">{errors.location}</span>
            )}
          </div>

          {/* Seeking Type */}
          <div>
            <Label className="text-white mb-2 block">
              What are you seeking? <span className="text-red-400">*</span>
              <span className="text-white/50 text-xs ml-2">(Select 1-3 options)</span>
            </Label>
            
            {/* Selected Seeking Types */}
            {seekingTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {seekingTypes.map((type) => (
                  <Badge
                    key={type}
                    className="bg-pink-500/20 text-pink-400 border-pink-500/30 cursor-pointer hover:bg-pink-500/30"
                    onClick={() => toggleSeekingType(type)}
                  >
                    {type}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Dropdown Toggle */}
            <Button
              type="button"
              onClick={() => setShowSeekingDropdown(!showSeekingDropdown)}
              className="w-full justify-between bg-white/5 border border-pink-500/30 text-white hover:bg-white/10"
              variant="outline"
            >
              <span>{seekingTypes.length === 0 ? 'Select seeking type...' : `${seekingTypes.length} selected`}</span>
              <span className="text-xs">{showSeekingDropdown ? '▲' : '▼'}</span>
            </Button>

            {/* Dropdown Options */}
            {showSeekingDropdown && (
              <div className="mt-2 max-h-60 overflow-y-auto bg-black border border-pink-500/30 rounded-lg">
                {SEEKING_TYPE_OPTIONS.map((option) => {
                  const isSelected = seekingTypes.includes(option);
                  const isDisabled = !isSelected && seekingTypes.length >= 3;
                  
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => !isDisabled && toggleSeekingType(option)}
                      disabled={isDisabled}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <span className="text-white text-sm">{option}</span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-pink-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {errors.seeking_type && (
              <span className="text-red-400 text-sm mt-2 block">{errors.seeking_type}</span>
            )}
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="text-white mb-2 block">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe what you're looking for in detail..."
              className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40 min-h-[150px]"
              maxLength={2000}
              data-testid="iso-post-content-input"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.content && (
                <span className="text-red-400 text-sm">{errors.content}</span>
              )}
              <span className="text-white/50 text-xs ml-auto">
                {content.length}/2000
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-white mb-2 block">
              Tags (Optional - Select up to 8)
            </Label>
            
            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-pink-500/20 text-pink-400 border-pink-500/30 cursor-pointer hover:bg-pink-500/30"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_TAGS.filter(tag => !tags.includes(tag)).map((tag) => (
                <Badge
                  key={tag}
                  className="bg-white/5 text-white/70 border-white/20 cursor-pointer hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-500/30"
                  onClick={() => addTag(tag)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Custom Tag Input */}
            {tags.length < 8 && (
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  placeholder="Add custom tag"
                  className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40"
                  maxLength={20}
                />
                <Button
                  onClick={addCustomTag}
                  className={spiceTheme.components.button.secondary}
                  disabled={!customTag.trim()}
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/5"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className={`flex-1 ${spiceTheme.components.button.gradient}`}
              disabled={isSubmitting}
              data-testid="submit-iso-post-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                mode === 'edit' ? 'Update Post' : 'Create Post'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
