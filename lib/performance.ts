// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration && duration > 1000) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getMetrics(label: string): { avg: number; min: number; max: number; count: number } | null {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return null;

    return {
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      count: times.length
    };
  }

  clearMetrics(label?: string): void {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}

// Web Vitals monitoring
export function trackWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Simplified performance tracking without Core Web Vitals observer
  try {
    // Track basic navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation && process.env.NODE_ENV === 'development') {
        console.log(`Page load time: ${navigation.loadEventEnd - navigation.fetchStart}ms`);
      }
    });
  } catch (e) {
    // Silently fail if performance API is not available
  }
}

// Component performance wrapper
export function withPerformanceTracking<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return function WrappedComponent(props: T) {
    const monitor = PerformanceMonitor.getInstance();
    const endTiming = monitor.startTiming(`Component:${componentName}`);
    
    React.useEffect(() => {
      return endTiming;
    });
    
    return React.createElement(Component, props);
  };
}

// Add React import for the component wrapper
import React from 'react';