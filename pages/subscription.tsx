import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Zap, Star, Smartphone, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  features: string[];
  limits: {
    voiceMinutesPerMonth: number;
    recipesPerDay: number;
    nutritionAnalysisPerDay: number;
    storeSearchesPerDay: number;
    aiRequestsPerDay: number;
  };
}

const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic recipe search',
      'Limited voice commands',
      'Basic nutrition info',
      'Standard support'
    ],
    limits: {
      voiceMinutesPerMonth: 10,
      recipesPerDay: 5,
      nutritionAnalysisPerDay: 3,
      storeSearchesPerDay: 5,
      aiRequestsPerDay: 10
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 4.99,
    yearlyPrice: 49.99,
    features: [
      'Unlimited recipe search',
      'Advanced voice commands (60 min/month)',
      'Detailed nutrition analysis',
      'Store finder with pricing',
      'Meal planning',
      'Shopping list optimization'
    ],
    limits: {
      voiceMinutesPerMonth: 60,
      recipesPerDay: 100,
      nutritionAnalysisPerDay: 50,
      storeSearchesPerDay: 25,
      aiRequestsPerDay: 100
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    yearlyPrice: 99.99,
    features: [
      'Everything in Premium',
      'Unlimited voice commands',
      'Professional nutrition tracking',
      'Bulk meal planning',
      'Advanced AI cooking assistant',
      'Priority support',
      'Early access to new features'
    ],
    limits: {
      voiceMinutesPerMonth: -1,
      recipesPerDay: -1,
      nutritionAnalysisPerDay: -1,
      storeSearchesPerDay: -1,
      aiRequestsPerDay: -1
    }
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    price: 99.99,
    features: [
      'All Pro features forever',
      'Unlimited everything',
      'Lifetime updates',
      'Premium support',
      'No monthly fees'
    ],
    limits: {
      voiceMinutesPerMonth: -1,
      recipesPerDay: -1,
      nutritionAnalysisPerDay: -1,
      storeSearchesPerDay: -1,
      aiRequestsPerDay: -1
    }
  }
};

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Get current subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/subscription/status'],
  });
  
  // Type-safe subscription status with defaults
  const currentSubscription = subscriptionStatus || { tier: 'free', isActive: false };

  // Detect platform for payment routing
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isCapacitor = !!(window as any).Capacitor;
  const shouldUseAppleIAP = isIOS && isCapacitor;

  // Stripe Checkout mutation
  const createStripeCheckout = useMutation({
    mutationFn: async ({ planId, billingPeriod }: { planId: string; billingPeriod: string }) => {
      const response = await apiRequest('POST', '/api/subscription/create-stripe-checkout', {
        planId,
        billingPeriod,
        successUrl: `${window.location.origin}/subscription?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Apple IAP mutation
  const initiateAppleIAP = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      // This would integrate with Capacitor Purchases plugin
      if ((window as any).Capacitor && (window as any).Purchases) {
        const purchases = (window as any).Purchases;
        
        // Get available offerings
        const offerings = await purchases.getOfferings();
        const productId = getAppleProductId(planId);
        
        if (offerings.current && offerings.current.availablePackages) {
          const availablePackage = offerings.current.availablePackages.find((p: any) => 
            p.product.identifier === productId
          );
          
          if (availablePackage) {
            const purchaseResult = await purchases.purchasePackage(availablePackage);
            return purchaseResult;
          }
        }
        throw new Error('Product not found');
      }
      throw new Error('Apple IAP not available');
    },
    onSuccess: async (purchaseResult) => {
      // Validate receipt with backend
      const receiptData = purchaseResult.receipt; // Base64 encoded receipt
      const userId = 'current-user'; // Get from auth context
      
      try {
        await apiRequest('POST', '/api/subscription/validate-apple-receipt', {
          receiptData,
          userId
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
        
        toast({
          title: "Subscription Activated",
          description: "Your premium features are now unlocked!",
        });
      } catch (error) {
        toast({
          title: "Receipt Validation Failed",
          description: "Please contact support if this issue persists.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: "Apple purchase could not be completed.",
        variant: "destructive",
      });
    }
  });

  const handleUpgrade = async (planId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (shouldUseAppleIAP) {
        // Route to Apple In-App Purchase
        await initiateAppleIAP.mutateAsync({ planId });
      } else {
        // Route to Stripe Checkout
        await createStripeCheckout.mutateAsync({ planId, billingPeriod });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getAppleProductId = (planId: string): string => {
    const mapping: Record<string, string> = {
      premium: billingPeriod === 'yearly' ? 'premium_yearly' : 'premium_monthly',
      pro: billingPeriod === 'yearly' ? 'pro_yearly' : 'pro_monthly',
      lifetime: 'lifetime_pass'
    };
    return mapping[planId] || 'premium_monthly';
  };

  const getPrice = (tier: SubscriptionTier) => {
    if (tier.id === 'free') return 'Free';
    if (tier.id === 'lifetime') return `$${tier.price}`;
    
    if (billingPeriod === 'yearly' && tier.yearlyPrice) {
      const monthlyEquivalent = (tier.yearlyPrice / 12).toFixed(2);
      return (
        <div>
          <span className="text-2xl font-bold">${monthlyEquivalent}</span>
          <span className="text-sm" style={{color: '#4a4a4a'}}>/month</span>
          <div className="text-xs" style={{color: '#22c55e'}}>Billed yearly (${tier.yearlyPrice})</div>
        </div>
      );
    }
    
    return (
      <div>
        <span className="text-2xl font-bold">${tier.price}</span>
        <span className="text-sm" style={{color: '#4a4a4a'}}>/month</span>
      </div>
    );
  };

  const isCurrentPlan = (tierId: string) => {
    return (currentSubscription as any)?.tier === tierId && (currentSubscription as any)?.isActive;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="mb-6" style={{color: '#4a4a4a'}}>
          Unlock the full potential of ChefGrocer with premium features
        </p>
        
        {/* Billing Period Toggle */}
        {!shouldUseAppleIAP && (
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Yearly
                <Badge variant="secondary" className="ml-2">Save 17%</Badge>
              </button>
            </div>
          </div>
        )}

        {/* Platform Indicator */}
        <div className="flex items-center justify-center mb-6">
          {shouldUseAppleIAP ? (
            <div className="flex items-center text-sm" style={{color: '#4a4a4a'}}>
              <Smartphone className="w-4 h-4 mr-2" />
              Purchases will be processed through the App Store
            </div>
          ) : (
            <div className="flex items-center text-sm" style={{color: '#4a4a4a'}}>
              <CreditCard className="w-4 h-4 mr-2" />
              Secure payments powered by Stripe
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative ${
              tier.id === 'pro' ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-20' : ''
            } ${
              isCurrentPlan(tier.id) ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''
            }`}
          >
            {tier.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white">Most Popular</Badge>
              </div>
            )}
            
            {tier.id === 'lifetime' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
                  🔥 First 100 Users Only
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="mb-2">
                {tier.id === 'free' && <Star className="w-8 h-8 mx-auto text-gray-500" />}
                {tier.id === 'premium' && <Zap className="w-8 h-8 mx-auto text-blue-500" />}
                {tier.id === 'pro' && <Crown className="w-8 h-8 mx-auto text-orange-500" />}
                {tier.id === 'lifetime' && <Crown className="w-8 h-8 mx-auto text-purple-500" />}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <CardDescription className="text-lg">
                {getPrice(tier)}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Usage Limits */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium mb-2">Usage Limits</h4>
                <div className="space-y-1 text-xs" style={{color: '#4a4a4a'}}>
                  <div>Voice: {tier.limits.voiceMinutesPerMonth === -1 ? 'Unlimited' : `${tier.limits.voiceMinutesPerMonth} min/month`}</div>
                  <div>Recipes: {tier.limits.recipesPerDay === -1 ? 'Unlimited' : `${tier.limits.recipesPerDay}/day`}</div>
                  <div>AI Requests: {tier.limits.aiRequestsPerDay === -1 ? 'Unlimited' : `${tier.limits.aiRequestsPerDay}/day`}</div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              {isCurrentPlan(tier.id) ? (
                <Button disabled className="w-full">
                  <Check className="w-4 h-4 mr-2" />
                  Current Plan
                </Button>
              ) : tier.id === 'free' ? (
                <Button variant="outline" disabled className="w-full">
                  Free Forever
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isProcessing}
                  className={`w-full ${
                    tier.id === 'pro' ? 'bg-orange-500 hover:bg-orange-600' : ''
                  }`}
                >
                  {isProcessing ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : shouldUseAppleIAP ? (
                    <Smartphone className="w-4 h-4 mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {tier.id === 'lifetime' ? 'Buy Lifetime' : 'Upgrade Now'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-center">All plans include:</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            Recipe management and search
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            Basic nutrition information
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            Meal planning tools
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            Shopping list generation
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            Cross-platform sync
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            Regular updates
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          All payments are secure and encrypted. 
          {shouldUseAppleIAP 
            ? " Your subscription will be managed through your Apple ID." 
            : " You can cancel or modify your subscription at any time."
          }
        </p>
      </div>
    </div>
  );
}