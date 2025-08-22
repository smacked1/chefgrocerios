import { useEffect } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Zap } from 'lucide-react';

interface SubscriptionGateProps {
  feature: string;
  title: string;
  description: string;
  children: React.ReactNode;
  fallbackContent?: React.ReactNode;
}

export function SubscriptionGate({
  feature,
  title,
  description,
  children,
  fallbackContent
}: SubscriptionGateProps) {
  const { checkFeatureAccess } = useFeatureAccess();

  useEffect(() => {
    const verifyAccess = async () => {
      const accessCheck = await checkFeatureAccess(feature);
      
      if (!accessCheck.access) {
        // Auto-redirect to subscription page for premium features
        if (feature.includes('premium') || feature.includes('voice')) {
          const params = new URLSearchParams({
            feature: feature,
            upgrade: 'true',
            reason: accessCheck.reason || 'premium_required'
          });
          window.location.href = `/subscription?${params.toString()}`;
        }
      }
    };

    verifyAccess();
  }, [feature, checkFeatureAccess]);

  return (
    <div className="relative">
      {/* Premium Feature Overlay */}
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              {description}
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  Premium Feature
                </span>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                This feature requires an active subscription to prevent free abuse and unexpected billing.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  const params = new URLSearchParams({
                    feature: feature,
                    upgrade: 'true',
                    plan: 'premium'
                  });
                  window.location.href = `/subscription?${params.toString()}`;
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Premium ($4.99/month)
              </Button>
              
              <Button
                onClick={() => {
                  const params = new URLSearchParams({
                    feature: feature,
                    upgrade: 'true',
                    plan: 'pro'
                  });
                  window.location.href = `/subscription?${params.toString()}`;
                }}
                variant="outline"
                className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro ($9.99/month)
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Grace period available for pending payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Blurred content behind overlay */}
      <div className="opacity-30 pointer-events-none blur-sm">
        {fallbackContent || children}
      </div>
    </div>
  );
}

// Feature Usage Indicator Component
export function FeatureUsageIndicator({ 
  feature, 
  current = 0, 
  limit = 100, 
  unit = 'minutes' 
}: { 
  feature: string; 
  current?: number; 
  limit?: number; 
  unit?: string;
}) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage > 80;
  
  return (
    <div className={`p-3 rounded-lg ${isNearLimit ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Usage
        </span>
        <span className={`text-xs font-medium ${isNearLimit ? 'text-red-600' : 'text-orange-600'}`}>
          {current}/{limit} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isNearLimit ? 'bg-red-500' : 'bg-orange-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isNearLimit && (
        <p className="text-xs text-red-600 mt-1">
          Usage near limit. Consider upgrading to continue using this feature.
        </p>
      )}
    </div>
  );
}