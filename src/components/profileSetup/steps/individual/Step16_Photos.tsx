// Individual Step 16: Photos
import React from 'react';
import { Button } from '../../../Button';
import { SectionHeader, InfoBox } from '../../FormComponents';
import { Profile } from '../../../../types_comprehensive';

interface Props {
  formData: Partial<Profile>;
  photoFiles: File[];
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step16_Photos: React.FC<Props> = ({ 
  formData, 
  photoFiles,
  onPhotoUpload, 
  onRemovePhoto,
  onNext, 
  onPrev 
}) => {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Add Your Photos"
        subtitle="Upload 2-10 photos (at least one clear face photo required)"
      />
      
      <InfoBox type="info">
        <p className="text-sm">
          <strong>Tips for great photos:</strong>
        </p>
        <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
          <li>At least one clear, recent face photo</li>
          <li>Well-lit photos work best</li>
          <li>Variety of photos (face, body, lifestyle) gets more interest</li>
          <li>Be yourself - authenticity attracts the right connections</li>
        </ul>
      </InfoBox>
      
      <div className="border-2 border-dashed border-brand-primary/50 rounded-lg p-8 text-center">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onPhotoUpload}
          className="hidden"
          id="photo-upload"
          disabled={photoFiles.length >= 10}
        />
        <label 
          htmlFor="photo-upload" 
          className={`cursor-pointer block ${photoFiles.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-brand-secondary text-5xl mb-3">📷</div>
          <p className="text-white font-semibold mb-1">
            {photoFiles.length >= 10 ? 'Maximum 10 photos reached' : 'Click to upload photos'}
          </p>
          <p className="text-sm text-text-secondary">PNG, JPG up to 10MB each</p>
        </label>
      </div>
      
      {photoFiles.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary text-center">
            {photoFiles.length} / 10 photos uploaded
            {photoFiles.length < 2 && <span className="text-red-400"> (minimum 2 required)</span>}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photoFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-brand-primary text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">← Back</Button>
        <Button 
          onClick={onNext} 
          disabled={photoFiles.length < 2}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  );
};