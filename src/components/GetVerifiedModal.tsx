// src/components/GetVerifiedModal.tsx
import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { verificationService, VerificationMethod } from '@/services/verificationService';
import { Profile } from '@/types';

interface GetVerifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  profile: Profile;
}

export const GetVerifiedModal: React.FC<GetVerifiedModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  profile
}) => {
  const [step, setStep] = useState<'method' | 'selfie' | 'fetlife' | 'submitting' | 'success' | 'error'>('method');
  const [method, setMethod] = useState<VerificationMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selfie method state
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [verificationDate, setVerificationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Partner 2 selfie state (for couples)
  const [partner2SelfieFile, setPartner2SelfieFile] = useState<File | null>(null);
  const [partner2SelfiePreview, setPartner2SelfiePreview] = useState<string | null>(null);
  const [partner2Email, setPartner2Email] = useState<string>('');

  // FetLife method state
  const [fetlifeUrl, setFetlifeUrl] = useState<string>('');
  const [fetlifeScreenshot, setFetlifeScreenshot] = useState<File | null>(null);
  const [fetlifeScreenshotPreview, setFetlifeScreenshotPreview] = useState<string | null>(null);
  
  // Partner 2 FetLife state (for couples)
  const [partner2FetlifeUrl, setPartner2FetlifeUrl] = useState<string>('');
  const [partner2FetlifeScreenshot, setPartner2FetlifeScreenshot] = useState<File | null>(null);
  const [partner2FetlifeScreenshotPreview, setPartner2FetlifeScreenshotPreview] = useState<string | null>(null);

  const isCouple = profile.accountType === 'couple';

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset all state
    setStep('method');
    setMethod(null);
    setError(null);
    setSelfieFile(null);
    setSelfiePreview(null);
    setPartner2SelfieFile(null);
    setPartner2SelfiePreview(null);
    setPartner2Email('');
    setFetlifeUrl('');
    setFetlifeScreenshot(null);
    setFetlifeScreenshotPreview(null);
    setPartner2FetlifeUrl('');
    setPartner2FetlifeScreenshot(null);
    setPartner2FetlifeScreenshotPreview(null);
    onClose();
  };

  const handleFileSelect = (
    file: File,
    setFile: (file: File) => void,
    setPreview: (preview: string) => void
  ) => {
    if (file && file.type.startsWith('image/')) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMethodSelect = (selectedMethod: VerificationMethod) => {
    setMethod(selectedMethod);
    setStep(selectedMethod);
  };

  const validateSelfieSubmission = (): boolean => {
    if (!selfieFile) {
      setError('Please upload your selfie photo');
      return false;
    }
    if (!verificationDate) {
      setError('Please select the verification date');
      return false;
    }
    if (isCouple) {
      if (!partner2Email) {
        setError('Please provide partner 2 email address');
        return false;
      }
      if (!partner2SelfieFile) {
        setError('Please upload partner 2 selfie photo');
        return false;
      }
    }
    return true;
  };

  const validateFetlifeSubmission = (): boolean => {
    if (!fetlifeUrl) {
      setError('Please provide your FetLife profile URL');
      return false;
    }
    if (!fetlifeScreenshot) {
      setError('Please upload a screenshot of your logged-in FetLife profile');
      return false;
    }
    if (isCouple) {
      if (!partner2Email) {
        setError('Please provide partner 2 email address');
        return false;
      }
      if (!partner2FetlifeUrl) {
        setError('Please provide partner 2 FetLife profile URL');
        return false;
      }
      if (!partner2FetlifeScreenshot) {
        setError('Please upload partner 2 FetLife screenshot');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (method === 'selfie') {
        if (!validateSelfieSubmission()) {
          setIsSubmitting(false);
          return;
        }

        await verificationService.submitVerification(userId, {
          method: 'selfie',
          email: userEmail,
          selfieFile: selfieFile!,
          verificationDate,
          partner2Email: isCouple ? partner2Email : undefined,
          partner2SelfieFile: isCouple ? partner2SelfieFile! : undefined
        });
      } else if (method === 'fetlife') {
        if (!validateFetlifeSubmission()) {
          setIsSubmitting(false);
          return;
        }

        await verificationService.submitVerification(userId, {
          method: 'fetlife',
          email: userEmail,
          fetlifeProfileUrl: fetlifeUrl,
          fetlifeScreenshotFile: fetlifeScreenshot!,
          partner2Email: isCouple ? partner2Email : undefined,
          partner2FetlifeProfileUrl: isCouple ? partner2FetlifeUrl : undefined,
          partner2FetlifeScreenshotFile: isCouple ? partner2FetlifeScreenshot! : undefined
        });
      }

      setStep('success');
    } catch (err: any) {
      console.error('Verification submission error:', err);
      setError(err.message || 'Failed to submit verification request');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-pink-500/30">
        <CardHeader className="border-b border-pink-500/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-blue-400" />
              Get Verified
            </CardTitle>
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors"
              data-testid="close-verification-modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Method Selection Step */}
          {step === 'method' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Choose Verification Method</h3>
                <p className="text-white/70 text-sm">
                  Select how you'd like to verify your identity
                  {isCouple && ' (both partners must be verified)'}
                </p>
              </div>

              {/* Option 1: Selfie Method */}
              <button
                onClick={() => handleMethodSelect('selfie')}
                className="w-full p-6 bg-gray-800 border-2 border-pink-500/30 rounded-lg hover:border-pink-500 transition-all group"
                data-testid="verification-method-selfie"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors">
                    <Upload className="h-6 w-6 text-pink-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-lg font-semibold text-white mb-2">Option 1: Selfie Verification</h4>
                    <p className="text-white/70 text-sm mb-3">
                      Upload a selfie while holding a paper with:
                    </p>
                    <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
                      <li>Today's date</li>
                      <li>Your email address ({userEmail})</li>
                      <li>The text "SPICE VERIFICATION"</li>
                    </ul>
                    {isCouple && (
                      <p className="text-blue-400 text-sm mt-3 font-medium">
                        Both partners must provide separate selfies
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {/* Option 2: FetLife Method */}
              <button
                onClick={() => handleMethodSelect('fetlife')}
                className="w-full p-6 bg-gray-800 border-2 border-pink-500/30 rounded-lg hover:border-pink-500 transition-all group"
                data-testid="verification-method-fetlife"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors">
                    <CheckCircle className="h-6 w-6 text-pink-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-lg font-semibold text-white mb-2">Option 2: FetLife Verification</h4>
                    <p className="text-white/70 text-sm mb-3">
                      Verify using your FetLife profile:
                    </p>
                    <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
                      <li>Provide your FetLife profile URL</li>
                      <li>Upload screenshot while logged in</li>
                      <li>Profile must be at least 90 days old</li>
                      <li>Must have at least one clear face picture</li>
                    </ul>
                    {isCouple && (
                      <p className="text-blue-400 text-sm mt-3 font-medium">
                        Both partners must have separate FetLife profiles
                      </p>
                    )}
                  </div>
                </div>
              </button>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium mb-1">Verification Process</p>
                    <p>Your submission will be reviewed by our admin team. This typically takes 24-48 hours. You'll be notified once your verification is approved.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selfie Method Step */}
          {step === 'selfie' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Selfie Verification</h3>
                <p className="text-white/70 text-sm">
                  Upload your selfie with verification information
                </p>
              </div>

              {/* User 1 / Main User */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">
                  {isCouple ? `${profile.displayName || 'Partner 1'} Verification` : 'Your Verification'}
                </h4>

                {/* Verification Date */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Verification Date
                  </label>
                  <input
                    type="date"
                    value={verificationDate}
                    onChange={(e) => setVerificationDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-gray-800 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500"
                    data-testid="verification-date-input"
                  />
                  <p className="text-xs text-white/60 mt-1">
                    Write this date on your paper
                  </p>
                </div>

                {/* Selfie Upload */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Upload Selfie Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, setSelfieFile, setSelfiePreview);
                    }}
                    className="hidden"
                    id="selfie-upload"
                    data-testid="selfie-upload-input"
                  />
                  <label
                    htmlFor="selfie-upload"
                    className="block w-full p-6 border-2 border-dashed border-pink-500/30 rounded-lg hover:border-pink-500 transition-colors cursor-pointer"
                  >
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="Selfie preview" className="max-h-64 mx-auto rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto text-pink-400 mb-3" />
                        <p className="text-white/70">Click to upload selfie</p>
                        <p className="text-white/50 text-sm mt-1">JPG, PNG, or WEBP (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Partner 2 for Couples */}
              {isCouple && (
                <>
                  <Separator className="bg-pink-500/30" />
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">
                      {profile.displayName2 || 'Partner 2'} Verification
                    </h4>

                    {/* Partner 2 Email */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Partner 2 Email Address
                      </label>
                      <input
                        type="email"
                        value={partner2Email}
                        onChange={(e) => setPartner2Email(e.target.value)}
                        placeholder="partner2@example.com"
                        className="w-full px-4 py-2 bg-gray-800 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500"
                        data-testid="partner2-email-input"
                      />
                    </div>

                    {/* Partner 2 Selfie Upload */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Partner 2 Selfie Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file, setPartner2SelfieFile, setPartner2SelfiePreview);
                        }}
                        className="hidden"
                        id="partner2-selfie-upload"
                        data-testid="partner2-selfie-upload-input"
                      />
                      <label
                        htmlFor="partner2-selfie-upload"
                        className="block w-full p-6 border-2 border-dashed border-pink-500/30 rounded-lg hover:border-pink-500 transition-colors cursor-pointer"
                      >
                        {partner2SelfiePreview ? (
                          <img src={partner2SelfiePreview} alt="Partner 2 selfie preview" className="max-h-64 mx-auto rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto text-pink-400 mb-3" />
                            <p className="text-white/70">Click to upload partner 2 selfie</p>
                            <p className="text-white/50 text-sm mt-1">JPG, PNG, or WEBP (max 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={() => setStep('method')}
                  variant="outline"
                  className="flex-1 bg-gray-800 border-pink-500/30 text-white hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
                  data-testid="submit-verification-button"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </div>
          )}

          {/* FetLife Method Step */}
          {step === 'fetlife' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">FetLife Verification</h3>
                <p className="text-white/70 text-sm">
                  Verify using your FetLife profile
                </p>
              </div>

              {/* User 1 / Main User */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">
                  {isCouple ? `${profile.displayName || 'Partner 1'} Verification` : 'Your Verification'}
                </h4>

                {/* FetLife URL */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    FetLife Profile URL
                  </label>
                  <input
                    type="url"
                    value={fetlifeUrl}
                    onChange={(e) => setFetlifeUrl(e.target.value)}
                    placeholder="https://fetlife.com/users/..."
                    className="w-full px-4 py-2 bg-gray-800 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500"
                    data-testid="fetlife-url-input"
                  />
                </div>

                {/* FetLife Screenshot */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Screenshot While Logged In
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, setFetlifeScreenshot, setFetlifeScreenshotPreview);
                    }}
                    className="hidden"
                    id="fetlife-screenshot-upload"
                    data-testid="fetlife-screenshot-upload-input"
                  />
                  <label
                    htmlFor="fetlife-screenshot-upload"
                    className="block w-full p-6 border-2 border-dashed border-pink-500/30 rounded-lg hover:border-pink-500 transition-colors cursor-pointer"
                  >
                    {fetlifeScreenshotPreview ? (
                      <img src={fetlifeScreenshotPreview} alt="FetLife screenshot preview" className="max-h-64 mx-auto rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto text-pink-400 mb-3" />
                        <p className="text-white/70">Click to upload screenshot</p>
                        <p className="text-white/50 text-sm mt-1">JPG, PNG, or WEBP (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Partner 2 for Couples */}
              {isCouple && (
                <>
                  <Separator className="bg-pink-500/30" />
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">
                      {profile.displayName2 || 'Partner 2'} Verification
                    </h4>

                    {/* Partner 2 Email */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Partner 2 Email Address
                      </label>
                      <input
                        type="email"
                        value={partner2Email}
                        onChange={(e) => setPartner2Email(e.target.value)}
                        placeholder="partner2@example.com"
                        className="w-full px-4 py-2 bg-gray-800 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500"
                        data-testid="partner2-email-input-fetlife"
                      />
                    </div>

                    {/* Partner 2 FetLife URL */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Partner 2 FetLife Profile URL
                      </label>
                      <input
                        type="url"
                        value={partner2FetlifeUrl}
                        onChange={(e) => setPartner2FetlifeUrl(e.target.value)}
                        placeholder="https://fetlife.com/users/..."
                        className="w-full px-4 py-2 bg-gray-800 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500"
                        data-testid="partner2-fetlife-url-input"
                      />
                    </div>

                    {/* Partner 2 FetLife Screenshot */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Partner 2 Screenshot
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file, setPartner2FetlifeScreenshot, setPartner2FetlifeScreenshotPreview);
                        }}
                        className="hidden"
                        id="partner2-fetlife-screenshot-upload"
                        data-testid="partner2-fetlife-screenshot-upload-input"
                      />
                      <label
                        htmlFor="partner2-fetlife-screenshot-upload"
                        className="block w-full p-6 border-2 border-dashed border-pink-500/30 rounded-lg hover:border-pink-500 transition-colors cursor-pointer"
                      >
                        {partner2FetlifeScreenshotPreview ? (
                          <img src={partner2FetlifeScreenshotPreview} alt="Partner 2 FetLife screenshot preview" className="max-h-64 mx-auto rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto text-pink-400 mb-3" />
                            <p className="text-white/70">Click to upload partner 2 screenshot</p>
                            <p className="text-white/50 text-sm mt-1">JPG, PNG, or WEBP (max 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/80">
                    <p className="font-medium mb-1">FetLife Requirements</p>
                    <ul className="list-disc list-inside space-y-1 text-white/70">
                      <li>Profile must be at least 90 days old</li>
                      <li>Must have at least one clear face picture</li>
                      <li>Screenshot must show you're logged in</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={() => setStep('method')}
                  variant="outline"
                  className="flex-1 bg-gray-800 border-pink-500/30 text-white hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
                  data-testid="submit-verification-button"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">Verification Submitted!</h3>
                <p className="text-white/70">
                  Your verification request has been submitted successfully.
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Our admin team will review your submission within 24-48 hours. You'll be notified once your verification is approved.
                </p>
              </div>
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700"
                data-testid="close-success-button"
              >
                Done
              </Button>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="text-center space-y-6 py-8">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">Submission Failed</h3>
                <p className="text-red-400">{error}</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setStep('method')}
                  variant="outline"
                  className="flex-1 bg-gray-800 border-pink-500/30 text-white hover:bg-gray-700"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gray-800 text-white hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
