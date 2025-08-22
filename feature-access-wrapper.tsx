import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap, Star } from 'lucide-react';

interface FeatureAccessWrapperProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

interface AccessCheck {
  access: boolean;
  tier: string;
  isActive: boolean;
  reason?: string;
  message: string;
  usage: {
    voiceMinutesUsed: number;
    recipesUsedToday: number;
    nutritionAnalysisUsedToday: number;
    storeSearchesUsedToday: number;
    aiRequestsUsedToday: number;
  };
  limits: {
    id: string;
    name: string;
    price: number;
    features: string[];
    limits: {
      voiceMinutesPerMonth: number;
      recipesPerDay: number;
      nutritionAnalysisPerDay: number;
      storeSearchesPerDay: number;
      aiRequestsPerDay: number;
    };
  };
  upgradeRequired: boolean;
}

export const FeatureAccessWrapper: React.FC<FeatureAccessWrapperProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Backend validation - always check server for feature access
  const { data: accessCheck, isLoading, error } = useQuery<AccessCheck>({
    queryKey: ['/api/subscription/check-access', feature],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/check-access', { feature });
      return response;
    },
    refetchInterval: 30000, // Recheck every 30 seconds to catch expiration
    staleTime: 0, // Always fetch fresh data for security
  });

  // Handle feature access denial
  useEffect(() => {
    if (accessCheck && !accessCheck.access && showUpgradePrompt) {
      setShowUpgradeModal(true);
    }
  }, [accessCheck, showUpgradePrompt]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Checking access...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center">
          <Lock className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700 dark:text-red-400">
            Unable to verify access. Please try again.
          </span>
        </div>
      </div>
    );
  }

  // Feature blocked - show upgrade prompt
  if (!accessCheck?.access) {
    return (
      <>
        {fallback || (
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="text-center">
              <Crown className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Premium Feature Locked
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {accessCheck?.message || 'This feature requires a premium subscription.'}
              </p>
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          accessCheck={accessCheck}
          feature={feature}
        />
      </>
    );
  }

  // Access granted - render children
  return <>{children}</>;
};

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessCheck: AccessCheck | null;
  feature: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, accessCheck, feature }) => {
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'voice':
      case 'premium_voice':
        return <Zap className="w-5 h-5" />;
      case 'ai_requests':
        return <Crown className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'voice':
        return 'Voice Commands';
      case 'premium_voice':
        return 'Premium Voice Features';
      case 'ai_requests':
        return 'AI Recipe Assistant';
      case 'recipe_search':
        return 'Advanced Recipe Search';
      case 'nutrition_analysis':
        return 'Nutrition Analysis';
      case 'store_search':
        return 'Store Finder';
      default:
        return 'Premium Feature';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {getFeatureIcon(feature)}
            <span className="ml-2">Upgrade Required</span>
          </DialogTitle>
          <DialogDescription>
            {getFeatureName(feature)} requires a premium subscription to unlock advanced features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {accessCheck?.reason === 'daily_limit_exceeded' ? (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You've reached your daily limit. Upgrade for unlimited access.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {accessCheck?.message}
              </p>
            </div>
          )}

          {/* Usage Statistics */}
          {accessCheck?.usage && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Voice:</span> {accessCheck.usage.voiceMinutesUsed}min
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Recipes:</span> {accessCheck.usage.recipesUsedToday}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Nutrition:</span> {accessCheck.usage.nutritionAnalysisUsedToday}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">AI Requests:</span> {accessCheck.usage.aiRequestsUsedToday}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => {
                // TODO: Navigate to subscription page or open payment modal
                window.location.href = '/subscription';
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Later
            </Button>
          </div>

          {accessCheck?.tier && (
            <div className="text-center">
              <Badge variant="secondary">
                Current: {accessCheck.tier === 'free' ? 'Free' : accessCheck.tier.charAt(0).toUpperCase() + accessCheck.tier.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureAccessWrapper;