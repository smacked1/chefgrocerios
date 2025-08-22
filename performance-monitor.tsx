import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Performance monitoring
    const startTime = performance.now();
    
    // Monitor page load
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    });

    // Monitor memory usage if available
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({ 
        ...prev, 
        memoryUsage: memoryInfo.usedJSHeapSize / 1048576 // Convert to MB
      }));
    }

    // Monitor render time
    const renderTime = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-white border-white">
          Performance
        </Badge>
      </div>
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div>Render: {metrics.renderTime.toFixed(0)}ms</div>
      {metrics.memoryUsage > 0 && (
        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      )}
    </div>
  );
}