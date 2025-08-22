import { useQuery } from "@tanstack/react-query";
import { SubscriptionStatus, isFeatureUnlocked, getSubscriptionMessage, SUBSCRIPTION_TIERS } from "@shared/subscription-tiers";

export function useSubscription() {
  const { data: subscriptionStatus, isLoading, error } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    retry: false,
  });

  const checkFeatureAccess = (feature: keyof typeof SUBSCRIPTION_TIERS.free.limits) => {
    if (!subscriptionStatus) {
      return {
        hasAccess: false,
        message: "Loading subscription status...",
        isLoading: true
      };
    }

    const hasAccess = isFeatureUnlocked(subscriptionStatus, feature);
    const message = getSubscriptionMessage(subscriptionStatus, feature);

    return {
      hasAccess,
      message,
      isLoading: false
    };
  };

  const getCurrentTier = () => {
    if (!subscriptionStatus) return SUBSCRIPTION_TIERS.free;
    return SUBSCRIPTION_TIERS[subscriptionStatus.tier] || SUBSCRIPTION_TIERS.free;
  };

  const isSubscriptionActive = () => {
    if (!subscriptionStatus) return false;
    
    // Lifetime subscriptions are always active
    if (subscriptionStatus.isLifetime) return true;
    
    // Check if subscription is active and not expired
    if (!subscriptionStatus.isActive) return false;
    
    if (subscriptionStatus.subscriptionEnd) {
      return new Date() <= subscriptionStatus.subscriptionEnd;
    }
    
    return subscriptionStatus.isActive;
  };

  const needsRenewal = () => {
    if (!subscriptionStatus) return false;
    if (subscriptionStatus.isLifetime) return false;
    return !isSubscriptionActive();
  };

  return {
    subscriptionStatus,
    isLoading,
    error,
    checkFeatureAccess,
    getCurrentTier,
    isSubscriptionActive: isSubscriptionActive(),
    needsRenewal: needsRenewal(),
  };
}