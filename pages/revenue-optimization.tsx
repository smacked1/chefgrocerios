import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationHeader } from '@/components/navigation-header';
import { RevenueBooster } from '@/components/revenue-booster';
import { PromotionalBanner } from '@/components/promotional-banner';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Clock, 
  Smartphone,
  Zap,
  Gift,
  Star,
  Timer,
  ChartBar
} from 'lucide-react';

export default function RevenueOptimization() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  
  const metrics = {
    week: {
      trials: 47,
      conversions: 12,
      revenue: 1247,
      avgSession: '12m',
      conversionRate: 25.5
    },
    month: {
      trials: 203,
      conversions: 58,
      revenue: 4891,
      avgSession: '15m',
      conversionRate: 28.6
    }
  };

  const currentMetrics = metrics[selectedTimeframe as keyof typeof metrics];

  const opportunities = [
    {
      title: 'iOS Launch Preparation',
      description: 'Apple Developer enrollment pending - maximize web revenue',
      action: 'Boost Web Conversions',
      impact: '$2,000-5,000',
      urgency: 'high',
      timeline: '1-2 weeks'
    },
    {
      title: 'Limited Lifetime Passes',
      description: '53 spots remaining out of 100 with LAUNCH50 code',
      action: 'Drive Urgency',
      impact: '$2,500+',
      urgency: 'high',
      timeline: 'This week'
    },
    {
      title: 'Voice AI Beta Features',
      description: 'Free Google Gemini integration during beta',
      action: 'Promote Premium Features',
      impact: '$1,500+',
      urgency: 'medium',
      timeline: '2-3 weeks'
    },
    {
      title: 'Pre-Launch Special',
      description: '25% off monthly plans with APPSTORE25',
      action: 'Convert Trial Users',
      impact: '$1,000+',
      urgency: 'medium',
      timeline: 'Ongoing'
    }
  ];

  const activeCoupons = [
    { code: 'LAUNCH50', usage: 12, limit: 100, discount: '50% off Lifetime', expires: 'Aug 31' },
    { code: 'APPSTORE25', usage: 28, limit: 500, discount: '25% off Monthly/Yearly', expires: 'Aug 31' },
    { code: 'FIRSTUSER', usage: 5, limit: 200, discount: '21-day trial', expires: 'Sep 4' },
    { code: 'ANNUAL25', usage: 8, limit: 500, discount: '25% off Yearly', expires: 'Oct 4' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Revenue Optimization" 
        description="Boost conversions and maximize revenue"
        backHref="/"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Optimization Banner */}
        <div className="mb-8">
          <PromotionalBanner onSubscribeClick={() => window.location.href = '/subscribe'} />
        </div>

        <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTimeframe} className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Trials</p>
                      <p className="text-2xl font-bold">{currentMetrics.trials}</p>
                      <p className="text-xs text-green-600">+23% vs last {selectedTimeframe}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversions</p>
                      <p className="text-2xl font-bold">{currentMetrics.conversions}</p>
                      <p className="text-xs text-green-600">+15% vs last {selectedTimeframe}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">${currentMetrics.revenue}</p>
                      <p className="text-xs text-green-600">+34% vs last {selectedTimeframe}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold">{currentMetrics.conversionRate}%</p>
                      <p className="text-xs text-green-600">+5.2% vs last {selectedTimeframe}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Session</p>
                      <p className="text-2xl font-bold">{currentMetrics.avgSession}</p>
                      <p className="text-xs text-green-600">+2m vs last {selectedTimeframe}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Revenue Opportunities (While Waiting for iOS Approval)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {opportunities.map((opportunity, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{opportunity.title}</h4>
                          <Badge 
                            variant={opportunity.urgency === 'high' ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {opportunity.urgency === 'high' ? 'URGENT' : 'PRIORITY'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <strong className="text-green-600">{opportunity.impact}</strong>
                            <span className="text-gray-500 ml-2">in {opportunity.timeline}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            {opportunity.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Coupon Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-green-500" />
                  <span>Active Promotional Campaigns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {activeCoupons.map((coupon, index) => (
                    <Card key={index} className="bg-gradient-to-r from-green-50 to-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {coupon.code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {coupon.expires}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-2">{coupon.discount}</p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{coupon.usage}/{coupon.limit} used</span>
                          <span>{Math.round((coupon.usage / coupon.limit) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(coupon.usage / coupon.limit) * 100}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Boosters Component */}
            <RevenueBooster />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}