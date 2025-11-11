import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X, Plus, Loader2, Upload, Calendar, Clock, MapPin, Users, DollarSign, Image as ImageIcon } from 'lucide-react';
import { spiceTheme } from '@/styles/theme';
import { Event, EVENT_CATEGORY_OPTIONS } from '@/services/eventService';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    location: string;
    event_date: string;
    event_time: string;
    category: string;
    max_capacity: number;
    price: number;
    tags: string[];
    image?: File | null;
  }) => Promise<void>;
  initialData?: Event | null;
  mode?: 'create' | 'edit';
}

const SUGGESTED_TAGS = [
  'LGBTQ+ Friendly',
  'Couples Only',
  'Singles Welcome',
  'Newbie Friendly',
  'Experienced',
  'BYOB',
  '21+',
  '18+',
  'Dresscode',
  'No Dresscode',
  'Educational',
  'Social',
  'Play Party',
  'Networking'
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [category, setCategory] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('50');
  const [price, setPrice] = useState('0');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    location?: string;
    event_date?: string;
    event_time?: string;
    category?: string;
    max_capacity?: string;
    price?: string;
  }>({});

  // Load initial data when editing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setLocation(initialData.location);
      setEventDate(initialData.event_date);
      setEventTime(initialData.event_time);
      setCategory(initialData.category);
      setMaxCapacity(initialData.max_capacity.toString());
      setPrice(initialData.price.toString());
      setTags(initialData.tags || []);
      setImagePreview(initialData.image_url || null);
    } else {
      // Reset form for create mode
      resetForm();
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setEventDate('');
    setEventTime('');
    setCategory('');
    setMaxCapacity('50');
    setPrice('0');
    setTags([]);
    setCustomTag('');
    setImageFile(null);
    setImagePreview(null);
    setShowCategoryDropdown(false);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!eventDate) {
      newErrors.event_date = 'Event date is required';
    } else {
      const selectedDate = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.event_date = 'Event date must be in the future';
      }
    }

    if (!eventTime) {
      newErrors.event_time = 'Event time is required';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    const capacityNum = parseInt(maxCapacity);
    if (!maxCapacity || isNaN(capacityNum) || capacityNum <= 0) {
      newErrors.max_capacity = 'Capacity must be a positive number';
    }

    const priceNum = parseFloat(price);
    if (price === '' || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Price must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        event_date: eventDate,
        event_time: eventTime,
        category: category,
        max_capacity: parseInt(maxCapacity),
        price: parseFloat(price),
        tags,
        image: imageFile
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setErrors({});
    onClose();
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim()) && tags.length < 10) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  // Get min date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-pink-500/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={spiceTheme.components.text.gradient}>
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {mode === 'create' 
              ? 'Share your lifestyle event with the community'
              : 'Update your event details'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event Image */}
          <div>
            <Label className="text-white mb-2 flex items-center">
              <ImageIcon className="h-4 w-4 mr-2 text-pink-400" />
              Event Image
            </Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-2"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-pink-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500/50 transition-colors"
              >
                <Upload className="h-12 w-12 mx-auto mb-2 text-pink-400" />
                <p className="text-white/60 text-sm">Click to upload event image</p>
                <p className="text-white/40 text-xs mt-1">Max size: 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-white mb-2">
              Event Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Pool Party & Mixer"
              className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40"
              maxLength={200}
            />
            <div className="flex justify-between mt-1">
              {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
              <p className="text-white/40 text-xs ml-auto">{title.length}/200</p>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-white mb-2">Event Category *</Label>
            <div className="relative">
              <Button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full justify-between bg-white/5 border border-pink-500/30 text-white hover:bg-white/10"
              >
                {category || 'Select a category'}
                <Plus className={`h-4 w-4 transition-transform ${showCategoryDropdown ? 'rotate-45' : ''}`} />
              </Button>
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-pink-500/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {EVENT_CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-pink-500/20 transition-colors ${
                        category === cat ? 'bg-pink-500/30 text-pink-300' : 'text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date" className="text-white mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-pink-400" />
                Event Date *
              </Label>
              <Input
                id="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={getMinDate()}
                className="bg-white/5 border-pink-500/30 text-white"
              />
              {errors.event_date && <p className="text-red-400 text-xs mt-1">{errors.event_date}</p>}
            </div>
            <div>
              <Label htmlFor="event_time" className="text-white mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-pink-400" />
                Event Time *
              </Label>
              <Input
                id="event_time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="bg-white/5 border-pink-500/30 text-white"
              />
              {errors.event_time && <p className="text-red-400 text-xs mt-1">{errors.event_time}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-white mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-pink-400" />
              Location *
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Downtown Hotel, City, State"
              className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40"
            />
            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
          </div>

          {/* Capacity and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_capacity" className="text-white mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2 text-pink-400" />
                Max Capacity *
              </Label>
              <Input
                id="max_capacity"
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                min="1"
                className="bg-white/5 border-pink-500/30 text-white"
              />
              {errors.max_capacity && <p className="text-red-400 text-xs mt-1">{errors.max_capacity}</p>}
            </div>
            <div>
              <Label htmlFor="price" className="text-white mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-pink-400" />
                Price (USD)
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0 for free"
                className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-white mb-2">
              Description *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event, what to expect, dress code, rules, etc."
              rows={6}
              className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40 resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
              <p className="text-white/40 text-xs ml-auto">{description.length}/2000</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-white mb-2">Tags (Optional, max 10)</Label>
            
            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-pink-500/20 text-pink-300 border-pink-500/30 pl-3 pr-1 py-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:bg-pink-500/30 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_TAGS.filter(tag => !tags.includes(tag)).slice(0, 8).map((tag) => (
                <Badge
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="bg-white/5 text-white/70 border-white/20 cursor-pointer hover:bg-pink-500/20 hover:text-pink-300 hover:border-pink-500/30 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Custom Tag Input */}
            {tags.length < 10 && (
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  placeholder="Add custom tag"
                  className="bg-white/5 border-pink-500/30 text-white placeholder:text-white/40"
                />
                <Button
                  type="button"
                  onClick={addCustomTag}
                  className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-300"
                  disabled={!customTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-white hover:bg-white/10"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={spiceTheme.components.button.gradient}
            disabled={isSubmitting}
            data-testid="submit-event-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              mode === 'create' ? 'Create Event' : 'Update Event'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
