// Verification Upload Component
import React, { useState } from 'react';
import { Button } from './Button';
import { Label } from './Label';

interface VerificationUploadProps {
  verificationType: 'identity' | 'lifestyle' | 'partner';
  onUploadComplete: (result: any) => void;
}

const LIFESTYLE_OPTIONS = ['ENM', 'BDSM', 'Poly', 'Swinger', 'Vanilla'];

export const VerificationUpload: React.FC<VerificationUploadProps> = ({
  verificationType,
  onUploadComplete,
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleIdentityUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus('idle');

    // Simulate upload - replace with actual Supabase upload
    setTimeout(() => {
      setUploading(false);
      setUploadStatus('success');
      onUploadComplete({
        type: 'identity',
        file: selectedFile.name,
        uploadedAt: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleLifestyleSubmit = () => {
    if (selectedLifestyles.length === 0) return;

    setUploadStatus('success');
    onUploadComplete({
      type: 'lifestyle',
      lifestyles: selectedLifestyles,
      submittedAt: new Date().toISOString(),
    });
  };

  const toggleLifestyle = (lifestyle: string) => {
    setSelectedLifestyles((prev) =>
      prev.includes(lifestyle) ? prev.filter((l) => l !== lifestyle) : [...prev, lifestyle]
    );
  };

  if (verificationType === 'identity') {
    return (
      <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
        <div>
          <h4 className="font-semibold text-white mb-2">Identity Verification</h4>
          <p className="text-sm text-text-secondary">
            Upload a government-issued ID to verify your identity. Your personal information will be
            kept secure and private.
          </p>
        </div>

        {uploadStatus === 'idle' && (
          <>
            <div className="space-y-2">
              <Label>Select Document</Label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-primary/80"
              />
              {selectedFile && (
                <p className="text-sm text-green-400">Selected: {selectedFile.name}</p>
              )}
            </div>

            <Button
              onClick={handleIdentityUpload}
              disabled={!selectedFile || uploading}
              isLoading={uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </>
        )}

        {uploadStatus === 'success' && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-green-400 font-semibold">Document Uploaded Successfully</p>
            <p className="text-sm text-text-secondary mt-2">
              Your verification will be reviewed within 24-48 hours.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (verificationType === 'lifestyle') {
    return (
      <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
        <div>
          <h4 className="font-semibold text-white mb-2">Lifestyle Verification</h4>
          <p className="text-sm text-text-secondary">
            Select the lifestyles you'd like to be verified for. This helps build trust in the
            community.
          </p>
        </div>

        {uploadStatus === 'idle' && (
          <>
            <div className="space-y-2">
              <Label>Select Lifestyles to Verify</Label>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_OPTIONS.map((lifestyle) => (
                  <button
                    key={lifestyle}
                    onClick={() => toggleLifestyle(lifestyle)}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                      selectedLifestyles.includes(lifestyle)
                        ? 'bg-brand-primary text-white'
                        : 'bg-black/50 text-text-secondary hover:bg-brand-primary/20'
                    }`}
                  >
                    {lifestyle}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleLifestyleSubmit}
              disabled={selectedLifestyles.length === 0}
              className="w-full"
            >
              Submit for Verification
            </Button>
          </>
        )}

        {uploadStatus === 'success' && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-green-400 font-semibold">Verification Request Submitted</p>
            <p className="text-sm text-text-secondary mt-2">
              Selected lifestyles: {selectedLifestyles.join(', ')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Partner verification placeholder
  return (
    <div className="space-y-4 p-4 border border-brand-primary/30 rounded-lg">
      <div>
        <h4 className="font-semibold text-white mb-2">Partner Verification</h4>
        <p className="text-sm text-text-secondary">
          Once your partners accept your link invitation, you can verify your relationship here.
        </p>
      </div>
      <div className="text-center py-8 text-text-secondary">
        <p>No pending partner verifications</p>
      </div>
    </div>
  );
};
