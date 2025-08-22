import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { revenueCat } from '@/services/revenuecat';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionButtonProps {
  onSubscriptionSuccess?: () => void;
}

export const SubscriptionButton = ({ 
  onSubscriptionSuccess 
}: SubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [isRevenueCatInitialized, setIsRevenueCatInitialized] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize RevenueCat on mobile platforms
    const initRevenueCat = async () => {
      if (Capacitor.isNativePlatform() && user?.email) {
        try {
          // Use the production API key for RevenueCat - user needs to provide this
          const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || 'appl_YOUR_API_KEY_HERE';
          
          const initialized = await revenueCat.initialize({
            apiKey: REVENUECAT_API_KEY,
            appUserId: user?.email || undefined, // Use email as RevenueCat user ID
          });
          
          setIsRevenueCatInitialized(initialized);
          
          if (initialized && user?.email) {
            // Set user ID for cross-platform syncing
            await revenueCat.setUserId(user.email);
            
            // Check existing premium status
            const hasPremium = await revenueCat.checkPremiumStatus();
            if (hasPremium) {
              toast({
                title: "Premium Access Active",
                description: "Your premium features are already unlocked!"
              });
              onSubscriptionSuccess?.();
            }
          }
        } catch (error) {
          console.error('RevenueCat initialization failed:', error);
          setIsRevenueCatInitialized(false);
        }
      }
    };

    initRevenueCat();
  }, [user, toast, onSubscriptionSuccess]);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      if (Capacitor.isNativePlatform() && isRevenueCatInitialized) {
        // Use RevenueCat for iOS in-app purchases
        const success = await revenueCat.purchasePremium();
        
        if (success) {
          toast({
            title: "Subscription Successful!",
            description: "Welcome to Premium! Enjoy unlimited access to all features.",
          });
          onSubscriptionSuccess?.();
        } else {
          toast({
            title: "Purchase Cancelled",
            description: "No worries! You can subscribe anytime.",
            variant: "destructive",
          });
        }
      } else {
        // Fallback to web Stripe checkout for non-iOS platforms
        toast({
          title: "Redirecting to Checkout",
          description: "Opening web payment page...",
        });
        
        // Redirect to web Stripe checkout - implement this based on existing Stripe setup
        window.location.href = '/checkout';
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (!Capacitor.isNativePlatform() || !isRevenueCatInitialized) {
      toast({
        title: "Restore Not Available",
        description: "Purchase restoration is only available in the mobile app.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const restored = await revenueCat.restorePurchases();
      
      if (restored) {
        toast({
          title: "Purchases Restored!",
          description: "Your premium access has been restored.",
        });
        onSubscriptionSuccess?.();
      } else {
        toast({
          title: "No Purchases Found",
          description: "We couldn't find any previous purchases to restore.",
        });
      }
    } catch (error) {
      console.error('Restore purchases error:', error);
      toast({
        title: "Restore Failed",
        description: "Unable to restore purchases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button disabled>
        Sign in to Subscribe
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-orange-600 hover:bg-orange-700 text-white"
      >
        {loading ? "Processing..." : "Subscribe to Premium"}
      </Button>
      
      {Capacitor.isNativePlatform() && (
        <Button
          variant="outline"
          onClick={handleRestorePurchases}
          disabled={loading || !isRevenueCatInitialized}
          className="text-sm"
        >
          Restore Purchases
        </Button>
      )}
      
      <div className="text-xs text-muted-foreground text-center">
        {Capacitor.isNativePlatform() 
          ? "Secure payment via Apple App Store"
          : "Secure payment via Stripe"
        }
      </div>
    </div>
  );
};