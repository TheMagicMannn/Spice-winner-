import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Loader2, X, Sparkles, Shield, Eye, Heart, Zap, Users, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';

interface VIPUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VIPUpgradeModal: React.FC<VIPUpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = {
    monthly: {
      tier: 'vip',
      name: 'VIP Monthly',
      price: 16.99,
      priceCents: 1699,
      periodMonths: 1,
      interval: 'month',
      savings: null
    },
    yearly: {
      tier: 'vip',
      name: 'VIP Annual',
      price: 149.99,
      priceCents: 14999,
      periodMonths: 12,
      interval: 'year',
      savings: '26%',
      monthlyEquivalent: 12.49
    }
  };

  const freeFeatures = [
    'Create solo or couple profiles',
    'Browse & discover profiles',
    '20-50 daily likes',
    'Unlimited messaging with matches',
    'Add desires & interests (200+ options)',
    'Basic AI compatibility matching',
    'Human verification & badges',
    'Group chats & community access'
  ];

  const vipFeatures = [
    { icon: Heart, text: 'Unlimited likes - no daily limit' },
    { icon: Eye, text: 'See who liked you - instant visibility' },
    { icon: Star, text: 'Hyper-Match™ AI Engine - full compatibility scoring (0-100)' },
    { icon: Sparkles, text: 'Hidden Gems - AI surfaces highly compatible matches daily' },
    { icon: Shield, text: 'Advanced filters - exact preferences, dynamics & aesthetics' },
    { icon: Eye, text: 'Incognito Mode - browse privately' },
    { icon: Shield, text: 'Private Photos & Videos - grant/revoke access' },
    { icon: Zap, text: 'Travel Mode - connect anywhere' },
    { icon: Zap, text: '10× profile boost - increased visibility' },
    { icon: Calendar, text: 'Events access - discover, RSVP, host' },
    { icon: Users, text: 'Couple profiles - link & activity logs' }
  ];

  const handleCheckout = async () => {
    if (!user?.id) {
      setError('Please log in to upgrade');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Call Supabase Edge Function for Stripe checkout
      const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId: user.id,
          tier: plans[selectedPlan].tier,
          periodMonths: plans[selectedPlan].periodMonths,
          amountCents: plans[selectedPlan].priceCents,
          priceId: selectedPlan === 'monthly' ? 'price_monthly_vip' : 'price_yearly_vip',
          successUrl: `${window.location.origin}/#/profile?upgrade=success`,
          cancelUrl: `${window.location.origin}/#/profile?upgrade=cancelled`
        }
      });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  // Mock checkout for demo purposes (remove in production)
  const handleMockUpgrade = async () => {
    if (!user?.id) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Update user's membership tier in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          membership_tier: 'vip',
          vip_expires_at: selectedPlan === 'yearly' 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plans[selectedPlan].id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: selectedPlan === 'yearly'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (subError) throw subError;

      // Success!
      onSuccess?.();
      onClose();
      window.location.reload(); // Reload to update UI
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError(err.message || 'Failed to upgrade. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-gray-900 to-black text-white border-2 border-yellow-500/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            <Crown className="h-8 w-8 text-yellow-400 mr-3 animate-pulse" />
            Upgrade to VIP
          </DialogTitle>
        </DialogHeader>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-2 gap-4 my-6">
          {/* Monthly Plan */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedPlan === 'monthly'
                ? 'border-yellow-500 bg-yellow-500/10 scale-105'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            data-testid="monthly-plan"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Monthly</h3>
              <div className="text-4xl font-bold text-yellow-400 mb-1">
                $16.99
              </div>
              <div className="text-gray-400 text-sm">per month</div>
            </div>
            {selectedPlan === 'monthly' && (
              <div className="absolute top-3 right-3">
                <Check className="h-6 w-6 text-yellow-400" />
              </div>
            )}
          </button>

          {/* Yearly Plan */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedPlan === 'yearly'
                ? 'border-yellow-500 bg-yellow-500/10 scale-105'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            data-testid="yearly-plan"
          >
            <Badge className="absolute top-3 right-3 bg-green-500 text-white animate-pulse">
              Save 26%
            </Badge>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Annual</h3>
              <div className="text-4xl font-bold text-yellow-400 mb-1">
                $149.99
              </div>
              <div className="text-gray-400 text-sm">per year</div>
              <div className="text-green-400 text-sm mt-2">
                Only $12.49/month
              </div>
            </div>
            {selectedPlan === 'yearly' && (
              <div className="absolute top-3 left-3">
                <Check className="h-6 w-6 text-yellow-400" />
              </div>
            )}
          </button>
        </div>

        {/* Features Comparison */}
        <div className="grid md:grid-cols-2 gap-6 my-6">
          {/* Free Features */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-300">Free Membership</h3>
            <div className="space-y-3">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start text-sm text-gray-400">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VIP Features */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border-2 border-yellow-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-yellow-400">VIP Membership</h3>
              <Badge className="bg-yellow-500 text-black font-bold">
                MOST POPULAR
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mb-4">Everything in Free, plus:</p>
            <div className="space-y-3">
              {vipFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start text-sm text-white">
                    <Icon className="h-4 w-4 mr-2 mt-0.5 text-yellow-400 flex-shrink-0" />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            data-testid="cancel-upgrade"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleMockUpgrade}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
            data-testid="confirm-upgrade"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to VIP - ${plans[selectedPlan].price}
                {selectedPlan === 'yearly' ? '/year' : '/month'}
              </>
            )}
          </Button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By upgrading, you agree to our Terms of Service. Cancel anytime from Settings.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default VIPUpgradeModal;
