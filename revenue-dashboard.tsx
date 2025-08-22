import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, DollarSign, Target, Calendar, Star } from 'lucide-react';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  subscribers: {
    total: number;
    free: number;
    premium: number;
    pro: number;
    lifetime: number;
  };
  conversionRate: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  trialConversions: number;
  growthRate: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  subscriberCount: number;
  revenue: number;
}

export function RevenueDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<RevenueMetrics>({
    queryKey: ["/api/revenue-metrics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/revenue-metrics");
      return response.json();
    },
  });

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-analytics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subscription-analytics");
      return response.json();
    },
  });

  if (metricsLoading || plansLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`;
  const formatPercent = (rate: number) => `${rate.toFixed(1)}%`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <TrendingUp className="h-4 w-4 mr-1" />
          {metrics ? formatPercent(metrics.growthRate) : '0%'} Growth
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? formatCurrency(metrics.monthlyRecurringRevenue) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              MRR from all subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? metrics.subscribers.total.toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics ? metrics.subscribers.premium + metrics.subscribers.pro + metrics.subscribers.lifetime : 0} paying users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? formatPercent(metrics.conversionRate) : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Free to paid conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? formatCurrency(metrics.averageRevenuePerUser) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              ARPU this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plan Performance</TabsTrigger>
          <TabsTrigger value="goals">Revenue Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
                <CardDescription>Users by plan type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Free Users</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metrics.subscribers.free}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-400 h-2 rounded-full" 
                            style={{ width: `${(metrics.subscribers.free / metrics.subscribers.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium ($4.99/mo)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metrics.subscribers.premium}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(metrics.subscribers.premium / metrics.subscribers.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pro ($9.99/mo)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metrics.subscribers.pro}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(metrics.subscribers.pro / metrics.subscribers.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lifetime ($99.99)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{metrics.subscribers.lifetime}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${(metrics.subscribers.lifetime / metrics.subscribers.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Critical business metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Churn Rate</span>
                  <Badge variant={metrics && metrics.churnRate < 5 ? "default" : "destructive"}>
                    {metrics ? formatPercent(metrics.churnRate) : '0%'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trial Conversions</span>
                  <Badge variant="outline">
                    {metrics ? metrics.trialConversions : 0} this month
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customer Lifetime Value</span>
                  <Badge variant="secondary">
                    {metrics ? formatCurrency(metrics.lifetimeValue) : '$0.00'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Revenue</span>
                  <Badge variant="default">
                    {metrics ? formatCurrency(metrics.totalRevenue) : '$0.00'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans?.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    <Badge variant="outline">{formatCurrency(plan.price)}/{plan.interval}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {plan.subscriberCount} subscribers generating {formatCurrency(plan.revenue)}/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span>{plan.subscriberCount} users</span>
                    </div>
                    <Progress 
                      value={(plan.revenue / (plans.reduce((sum, p) => sum + p.revenue, 0))) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {((plan.revenue / (plans.reduce((sum, p) => sum + p.revenue, 0))) * 100).toFixed(1)}% of total revenue
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Goals Progress</CardTitle>
              <CardDescription>Track progress toward monthly and yearly targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Monthly Goal: $5,000</span>
                  <span className="text-sm font-medium">
                    {metrics ? formatCurrency(metrics.monthlyRecurringRevenue) : '$0.00'}
                  </span>
                </div>
                <Progress 
                  value={metrics ? Math.min((metrics.monthlyRecurringRevenue / 5000) * 100, 100) : 0} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics ? ((metrics.monthlyRecurringRevenue / 5000) * 100).toFixed(1) : '0'}% complete
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Subscriber Goal: 1,000</span>
                  <span className="text-sm font-medium">
                    {metrics ? metrics.subscribers.total : 0}
                  </span>
                </div>
                <Progress 
                  value={metrics ? Math.min((metrics.subscribers.total / 1000) * 100, 100) : 0} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics ? ((metrics.subscribers.total / 1000) * 100).toFixed(1) : '0'}% complete
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Conversion Goal: 15%</span>
                  <span className="text-sm font-medium">
                    {metrics ? formatPercent(metrics.conversionRate) : '0%'}
                  </span>
                </div>
                <Progress 
                  value={metrics ? Math.min((metrics.conversionRate / 15) * 100, 100) : 0} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: 15% free-to-paid conversion
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RevenueDashboard;