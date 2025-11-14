import React, { useState } from 'react';
import { X, AlertTriangle, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/Textarea';
import { Checkbox } from '@/components/Checkbox';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, additionalContext: string, shouldBlock: boolean, shouldHide: boolean) => Promise<void>;
  reportType: 'user' | 'message' | 'conversation';
  targetName?: string;
}

const REPORT_REASONS = {
  user: [
    'Harassment or bullying',
    'Inappropriate content',
    'Spam or scam',
    'Fake profile',
    'Hate speech',
    'Violence or threats',
    'Other'
  ],
  message: [
    'Harassment or bullying',
    'Inappropriate content',
    'Spam',
    'Hate speech',
    'Violence or threats',
    'Other'
  ],
  conversation: [
    'Inappropriate group behavior',
    'Spam',
    'Harassment',
    'Other'
  ]
};

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  reportType,
  targetName = 'this user'
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [shouldBlock, setShouldBlock] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      alert('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason, additionalContext, shouldBlock, shouldHide);
      setShowConfirmation(true);
      
      // Auto-close after showing confirmation
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setAdditionalContext('');
    setShouldBlock(false);
    setShouldHide(false);
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6 border border-pink-500/30 text-center">
          <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Flag className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
          <p className="text-white/70 text-sm">
            Thank you for helping keep our community safe. We'll review your report shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-pink-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">
              Report {reportType === 'user' ? 'User' : reportType === 'message' ? 'Message' : 'Conversation'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-white/70 text-sm">
            Please help us understand what's wrong with {reportType === 'user' ? targetName : 'this content'}.
          </p>

          {/* Reason Selection */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Reason for reporting *
            </label>
            <div className="space-y-2">
              {REPORT_REASONS[reportType].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedReason === reason
                      ? 'bg-pink-500/30 border-2 border-pink-500'
                      : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
                  }`}
                >
                  <span className="text-white">{reason}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Context */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Additional details (optional)
            </label>
            <Textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Provide any additional information that might help us review this report..."
              rows={4}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Actions for User Reports */}
          {reportType === 'user' && (
            <div className="space-y-3 pt-2 border-t border-gray-800">
              <p className="text-sm font-semibold text-white">
                Would you also like to:
              </p>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={shouldBlock}
                  onCheckedChange={(checked) => setShouldBlock(checked as boolean)}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-medium">Block this user</p>
                  <p className="text-white/60 text-sm">
                    They won't be able to contact you anymore
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={shouldHide}
                  onCheckedChange={(checked) => setShouldHide(checked as boolean)}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-medium">Hide conversation</p>
                  <p className="text-white/60 text-sm">
                    Move this conversation to deleted
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Actions for Conversation Reports */}
          {reportType === 'conversation' && (
            <div className="space-y-3 pt-2 border-t border-gray-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={shouldHide}
                  onCheckedChange={(checked) => setShouldHide(checked as boolean)}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-medium">Hide this conversation</p>
                  <p className="text-white/60 text-sm">
                    Move to deleted folder after reporting
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-gray-700 text-white hover:bg-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  );
};
