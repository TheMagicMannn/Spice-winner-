import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { Spinner } from './Spinner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setSubject('');
    setCategory('general');
    setMessage('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      await settingsService.sendFeedback({
        subject: subject.trim(),
        message: message.trim(),
        category
      });
      
      setSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('Feedback submission error:', err);
      setError('Failed to send feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 text-white border-pink-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-pink-400">
            <MessageSquare className="h-5 w-5 mr-2" />
            Send Feedback
          </DialogTitle>
          <DialogDescription className="text-white/60">
            We'd love to hear from you! Share your thoughts, suggestions, or report issues.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            <div className="text-white text-lg font-medium">
              Feedback Sent!
            </div>
            <div className="text-white/60 text-sm">
              Thank you for helping us improve SPICE.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-gray-800 border-pink-500/30 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-pink-500/30 text-white">
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-white">
                Subject <span className="text-red-400">*</span>
              </Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-gray-800 border-pink-500/30 text-white"
                placeholder="Brief summary of your feedback"
                disabled={isLoading}
                maxLength={100}
                data-testid="feedback-subject-input"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-white">
                Message <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-gray-800 border-pink-500/30 text-white min-h-[120px]"
                placeholder="Tell us more about your feedback..."
                disabled={isLoading}
                maxLength={1000}
                data-testid="feedback-message-textarea"
              />
              <p className="text-xs text-white/50">
                {message.length}/1000 characters
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="border-pink-500/30 text-white hover:bg-pink-500/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-pink-600 hover:bg-pink-700 text-white"
                data-testid="submit-feedback-button"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  'Send Feedback'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
