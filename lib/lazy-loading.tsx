import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components for better initial page load
export const LazyUSDAFoodSearch = lazy(() => import('@/components/usda-food-search'));
export const LazyFoodDatabaseSearch = lazy(() => import('@/components/food-database-search'));
export const LazyDeliveryServices = lazy(() => import('@/components/delivery-services'));
export const LazyPaymentUpgrade = lazy(() => import('@/components/payment-upgrade'));

// Loading fallback components
export const ComponentSkeleton = ({ className }: { className?: string }) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SearchSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends Record<string, any>>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<T>>,
  fallback: React.ReactNode = <ComponentSkeleton />
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}