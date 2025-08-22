import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Zap, Gift, Star } from 'lucide-react';

interface PromotionalBannerProps {
  onSubscribeClick?: () => void;
}

export function PromotionalBanner({ onSubscribeClick }: PromotionalBannerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date('2025-08-31T23:59:59');
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Expired');
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-5 w-5" />
              <Badge variant="secondary" className="bg-white text-orange-600 font-bold">
                LIMITED TIME
              </Badge>
              <Badge variant="outline" className="border-white text-white">
                <Timer className="h-3 w-3 mr-1" />
                {timeLeft}
              </Badge>
            </div>
            <h3 className="text-lg font-bold mb-1">
              🎯 Pre-Launch Special: Save up to 50% while we prepare for iOS!
            </h3>
            <p className="text-sm opacity-90 mb-3">
              Get lifetime access to ChefGrocer's AI cooking assistant before our App Store launch
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Gift className="h-4 w-4 mr-1" />
                <span>Use code: <strong>LAUNCH50</strong></span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                <span>Limited to first 100 users</span>
              </div>
            </div>
          </div>
          <div className="ml-6">
            <Button 
              onClick={onSubscribeClick}
              variant="secondary" 
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8"
            >
              Claim Offer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}