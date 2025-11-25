import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CreditCard, AlertCircle, X, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { Spinner } from './Spinner';

interface Subscription {
  id: string;
  tier: string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  current_period_start: string;
  current_period_end: string;
  amount_cents: number;
  currency: string;
}

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadSubscription();
    }
  }, [isOpen, user?.id]);

  const loadSubscription = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use RPC function to get subscription
      const { data, error: fetchError } = await supabase
        .rpc('get_user_subscription', { user_id_param: user.id });

      if (fetchError) throw fetchError;
      
      // RPC returns an array, get first item or convert single object to expected format
      const subscriptionData = Array.isArray(data) ? data[0] : data;
      setSubscription(subscriptionData);
    } catch (err: any) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id || !subscription) return;

    if (!confirm('Are you sure you want to cancel your VIP subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      // Use RPC function to cancel subscription
      const { data, error: cancelError } = await supabase
        .rpc('cancel_vip_subscription', { user_id_param: user.id });

      if (cancelError) throw cancelError;
      if (!data) throw new Error('Failed to cancel subscription');

      setSuccess('Subscription cancelled. You\'ll retain VIP access until ' + 
        new Date(subscription.current_period_end).toLocaleDateString());
      
      await loadSubscription();
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!user?.id || !subscription) return;

    setIsCancelling(true);
    setError(null);

    try {
      // Use RPC function to reactivate subscription
      const { data, error: reactivateError } = await supabase
        .rpc('reactivate_vip_subscription', { user_id_param: user.id });

      if (reactivateError) throw reactivateError;
      if (!data) throw new Error('Failed to reactivate subscription');

      setSuccess('Subscription reactivated! Your VIP benefits will continue.');
      await loadSubscription();
    } catch (err: any) {
      console.error('Error reactivating subscription:', err);
      setError('Failed to reactivate subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getPlanName = (amountCents: number) => {
    if (amountCents >= 14999) return 'VIP Annual';
    if (amountCents >= 1699) return 'VIP Monthly';
    return 'VIP Plan';
  };

  const getPlanPrice = (amountCents: number, currency: string = 'USD') => {
    const amount = (amountCents / 100).toFixed(2);
    if (amountCents >= 14999) return `$${amount}/year`;
    if (amountCents >= 1699) return `$${amount}/month`;
    return `$${amount}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-yellow-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl text-yellow-400">
            <Crown className="h-6 w-6 mr-2" />
            Manage VIP Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : !subscription ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No active subscription found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subscription Status */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Status</span>
                  <Badge className={
                    subscription.status === 'canceled'
                      ? 'bg-orange-500 text-white'
                      : subscription.status === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }>
                    {subscription.status === 'canceled' ? 'Cancelled' : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Plan</span>
                  <span className="text-white font-medium">
                    {getPlanName(subscription.amount_cents)}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="text-white font-medium">
                    {getPlanPrice(subscription.amount_cents, subscription.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {subscription.status === 'canceled' ? 'Access Until' : 'Renews On'}
                  </span>
                  <span className="text-white font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Cancellation Warning */}
              {subscription.status === 'canceled' && (
                <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-orange-400 text-sm font-medium mb-1">
                        Subscription Scheduled for Cancellation
                      </p>
                      <p className="text-orange-300/80 text-xs">
                        You'll retain VIP access until {new Date(subscription.current_period_end).toLocaleDateString()}. 
                        After that, your account will revert to Free membership.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-700">
                {subscription.status === 'active' ? (
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    variant="outline"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                    data-testid="cancel-subscription"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleReactivateSubscription}
                    disabled={isCancelling}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    data-testid="reactivate-subscription"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate Subscription
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full text-gray-400 hover:bg-gray-800"
                  data-testid="close-manage-subscription"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageSubscriptionModal;
