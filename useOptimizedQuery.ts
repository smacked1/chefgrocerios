import { useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  params?: Record<string, any>;
  cacheTime?: number;
  staleTime?: number;
}

export function useOptimizedQuery<T>({
  endpoint,
  params = {},
  cacheTime = 10 * 60 * 1000, // 10 minutes default
  staleTime = 5 * 60 * 1000,  // 5 minutes default
  ...options
}: OptimizedQueryOptions<T>) {
  
  const queryKey = useMemo(() => {
    const key = [endpoint];
    if (Object.keys(params).length > 0) {
      key.push(params);
    }
    return key;
  }, [endpoint, params]);

  const queryFn = useCallback(async (): Promise<T> => {
    const url = new URL(endpoint, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }, [endpoint, params]);

  return useQuery<T>({
    queryKey,
    queryFn,
    cacheTime,
    staleTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    ...options
  });
}

// Hook for background prefetching
export function usePrefetchQuery() {
  const queryClient = useQueryClient();
  
  const prefetch = useCallback((endpoint: string, params?: Record<string, any>) => {
    const queryKey = params ? [endpoint, params] : [endpoint];
    
    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const url = new URL(endpoint, window.location.origin);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, String(value));
            }
          });
        }
        const response = await fetch(url.toString());
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  return { prefetch };
}