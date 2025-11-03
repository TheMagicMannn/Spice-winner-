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
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './Spinner';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose
}) => {
  const { logout } = useAuth();
  const [step, setStep] = useState<'confirm' | 'reason' | 'final' | 'success'>('confirm');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setStep('confirm');
    setReason('');
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await settingsService.deleteAccountImmediately();
      setStep('success');
      
      // Logout and redirect after showing success
      setTimeout(async () => {
        await logout();
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 text-white border-red-500/30 max-w-md">
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl text-red-400">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Delete Account?
              </DialogTitle>
              <DialogDescription className="text-white/60">
                This action cannot be undone. Are you sure you want to permanently delete your account?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="text-red-400 font-semibold mb-2">What will be deleted:</h4>
                <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
                  <li>Your profile and all photos</li>
                  <li>All your matches and conversations</li>
                  <li>Your likes and preferences</li>
                  <li>All account data and settings</li>
                  <li>Your verification status</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Note:</strong> This is permanent and immediate. Your account will be deleted right away.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-pink-500/30 text-white hover:bg-pink-500/10"
                data-testid="cancel-delete-button"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('reason')}
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="proceed-delete-button"
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'reason' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-red-400">
                Help us improve
              </DialogTitle>
              <DialogDescription className="text-white/60">
                We're sorry to see you go. Could you tell us why you're leaving? (Optional)
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Reason for leaving</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Your feedback helps us improve SPICE..."
                  className="bg-gray-800 border-pink-500/30 text-white min-h-[100px]"
                  maxLength={500}
                  data-testid="delete-reason-textarea"
                />
                <p className="text-xs text-white/50">
                  {reason.length}/500 characters
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep('confirm')}
                className="border-pink-500/30 text-white hover:bg-pink-500/10"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('final')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Next
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'final' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl text-red-400">
                <Trash2 className="h-5 w-5 mr-2" />
                Final Confirmation
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Last chance to cancel. Click "Delete My Account" to permanently remove all your data.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="py-4">
              <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-2">
                  This action is PERMANENT and IMMEDIATE
                </p>
                <p className="text-white/70 text-sm">
                  All your data will be deleted right now and cannot be recovered.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep('reason')}
                disabled={isLoading}
                className="border-pink-500/30 text-white hover:bg-pink-500/10"
              >
                Go Back
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="confirm-delete-account-button"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Deleting...</span>
                  </>
                ) : (
                  'Delete My Account'
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            <div className="text-white text-lg font-medium">
              Account Deleted
            </div>
            <div className="text-white/60 text-sm">
              Your account and all data have been permanently removed.
            </div>
            <div className="text-white/40 text-xs">
              Redirecting...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
