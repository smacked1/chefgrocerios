import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FeatureAccessResult {
  access: boolean;
  tier: string;
  isActive: boolean;
  reason?: string;
  message?: string;
  usage?: any;
  limits?: any;
  upgradeRequired?: boolean;
}

export function useFeatureAccess() {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkFeatureAccess = useCallback(async (feature: string, userId?: string): Promise<FeatureAccessResult> => {
    setIsChecking(true);
    try {
      // Check if we're offline
      if (!navigator.onLine) {
        // For offline mode, provide basic access to essential features
        const offlineFeatures = ['voice', 'recipe_search', 'nutrition_analysis'];
        const hasOfflineAccess = offlineFeatures.includes(feature);
        
        return {
          access: hasOfflineAccess,
          tier: 'offline',
          isActive: hasOfflineAccess,
          reason: hasOfflineAccess ? 'offline_mode' : 'offline_unavailable',
          message: hasOfflineAccess 
            ? 'Feature available in offline mode with cached data' 
            : 'This feature requires an internet connection',
          upgradeRequired: false
        };
      }

      const response = await apiRequest('POST', '/api/subscription/check-access', {
        feature,
        userId
      });
      
      return response;
    } catch (error) {
      console.error('Error checking feature access:', error);
      
      // If network error, treat as offline mode
      if (error.message.includes('fetch')) {
        const offlineFeatures = ['voice', 'recipe_search', 'nutrition_analysis'];
        const hasOfflineAccess = offlineFeatures.includes(feature);
        
        return {
          access: hasOfflineAccess,
          tier: 'offline',
          isActive: hasOfflineAccess,
          reason: 'network_error',
          message: hasOfflineAccess 
            ? 'Using offline mode - limited functionality available' 
            : 'Network unavailable for this feature',
          upgradeRequired: false
        };
      }
      
      return {
        access: false,
        tier: 'free',
        isActive: false,
        reason: 'error',
        message: 'Unable to verify access. Please try again.',
        upgradeRequired: true
      };
    } finally {
      setIsChecking(false);
    }
  }, []);

  const incrementUsage = useCallback(async (feature: string, amount: number = 1) => {
    try {
      await apiRequest('POST', '/api/subscription/increment-usage', {
        feature,
        amount
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }, []);

  const checkAndUseFeature = useCallback(async (
    feature: string,
    onAccessGranted: () => void | Promise<void>,
    userId?: string,
    usageAmount?: number
  ) => {
    const accessResult = await checkFeatureAccess(feature, userId);
    
    if (accessResult.access) {
      // Access granted - execute the feature
      await onAccessGranted();
      
      // Increment usage after successful feature use
      if (usageAmount) {
        await incrementUsage(feature, usageAmount);
      }
      
      return true;
    } else {
      // Access denied - show upgrade message
      toast({
        title: "Access Restricted",
        description: accessResult.message || "This feature requires a subscription upgrade.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [checkFeatureAccess, incrementUsage, toast]);

  return {
    checkFeatureAccess,
    incrementUsage,
    checkAndUseFeature,
    isChecking
  };
}