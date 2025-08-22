import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show "Back Online" message for 3 seconds
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial connection status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOfflineMessage) return null;

  return (
    <Card className={`fixed top-4 left-4 right-4 z-50 shadow-lg md:left-auto md:right-4 md:max-w-sm transition-colors ${
      isOnline ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
    }`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 rounded-full p-2 ${
            isOnline ? 'bg-green-500' : 'bg-orange-500'
          }`}>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-white" />
            ) : (
              <WifiOff className="h-4 w-4 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-medium text-sm ${
              isOnline ? 'text-green-900' : 'text-orange-900'
            }`}>
              {isOnline ? 'Back Online' : 'Offline Mode'}
            </h3>
            <p className={`text-xs mt-1 ${
              isOnline ? 'text-green-700' : 'text-orange-700'
            }`}>
              {isOnline 
                ? 'Connection restored. All features available.' 
                : 'Limited features. Cached data available.'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OfflineIndicator;