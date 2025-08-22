import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RestaurantPartnerPortal } from "@/components/restaurant-partner-portal";
import { AffiliateTracker } from "@/components/affiliate-tracker";
import { PremiumContentMarketplace } from "@/components/premium-content-marketplace";
import { UsageAnalyticsDashboard } from "@/components/usage-analytics-dashboard";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  ChefHat,
  ShoppingCart,
  Crown,
  BarChart3
} from "lucide-react";

export default function RevenueDashboard() {
  // Mock revenue data - in production, this would come from analytics
  const revenueMetrics = {
    totalRevenue: 4166.47,
    monthlyGrowth: 23.5,
    activeSubscribers: 153,
    conversionRate: 6.1,
    avgRevenuePerUser: 15.24,
    churnRate: 3.2
  };

  const revenueStreams = [
    {
      name: "Premium Subscriptions",
      revenue: 2840.50,
      growth: 18.2,
      icon: <Crown className="h-5 w-5" />,
      color: "text-yellow-600"
    },
    {
      name: "Restaurant Partnerships",
      revenue: 890.25,
      growth: 45.7,
      icon: <ChefHat className="h-5 w-5" />,
      color: "text-orange-600"
    },
    {
      name: "Affiliate Commissions",
      revenue: 320.75,
      growth: 12.3,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "text-green-600"
    },
    {
      name: "Premium Content",
      revenue: 114.97,
      growth: 67.8,
      icon: <Target className="h-5 w-5" />,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Revenue Optimization Dashboard</h1>
        <p className="text-xl text-gray-600 mb-6">
          Track and optimize all revenue streams for ChefGrocer
        </p>
        
        {/* Key Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">${revenueMetrics.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-green-600 mt-1">+{revenueMetrics.monthlyGrowth}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{revenueMetrics.monthlyGrowth}%</div>
              <div className="text-sm text-gray-600">Monthly Growth</div>
              <div className="text-xs text-green-600 mt-1">Above target</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{revenueMetrics.activeSubscribers}</div>
              <div className="text-sm text-gray-600">Paid Users</div>
              <div className="text-xs text-green-600 mt-1">+12 this week</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{revenueMetrics.conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
              <div className="text-xs text-green-600 mt-1">+0.8% vs last month</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">${revenueMetrics.avgRevenuePerUser}</div>
              <div className="text-sm text-gray-600">ARPU</div>
              <div className="text-xs text-green-600 mt-1">+5.2% vs last month</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{revenueMetrics.churnRate}%</div>
              <div className="text-sm text-gray-600">Churn Rate</div>
              <div className="text-xs text-red-600 mt-1">-1.1% vs last month</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Streams Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {revenueStreams.map((stream) => (
            <Card key={stream.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stream.color}`}>{stream.icon}</div>
                  <Badge variant="secondary">+{stream.growth}%</Badge>
                </div>
                <h3 className="font-medium text-sm mb-1">{stream.name}</h3>
                <div className="text-2xl font-bold">${stream.revenue.toFixed(2)}</div>
                <div className="text-xs text-gray-600">This month</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Optimization Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="partnerships">Restaurant Partners</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Revenue</TabsTrigger>
          <TabsTrigger value="premium">Premium Content</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <UsageAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="partnerships">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Partnership Program</CardTitle>
                <CardDescription>
                  Generate revenue through restaurant partnerships and featured recipe placements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">23</div>
                    <div className="text-sm text-gray-600">Active Partners</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$890.25</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">$387</div>
                    <div className="text-sm text-gray-600">Avg per Partner</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <RestaurantPartnerPortal />
          </div>
        </TabsContent>

        <TabsContent value="affiliates">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Revenue Tracking</CardTitle>
                <CardDescription>
                  Earn commissions from grocery delivery, kitchen equipment, and specialty ingredients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$320.75</div>
                    <div className="text-sm text-gray-600">Total Commissions</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">5-25%</div>
                    <div className="text-sm text-gray-600">Commission Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">847</div>
                    <div className="text-sm text-gray-600">Clicks This Month</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">12.3%</div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <AffiliateTracker />
          </div>
        </TabsContent>

        <TabsContent value="premium">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Premium Content Sales</CardTitle>
                <CardDescription>
                  Generate revenue through exclusive meal plans, recipes, and cooking courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">$114.97</div>
                    <div className="text-sm text-gray-600">Content Sales</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">67.8%</div>
                    <div className="text-sm text-gray-600">Growth Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">$24.99</div>
                    <div className="text-sm text-gray-600">Avg Sale Price</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.8%</div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <PremiumContentMarketplace />
          </div>
        </TabsContent>
      </Tabs>

      {/* Weekly Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Week 1 Priority Actions - Revenue Optimization</CardTitle>
          <CardDescription>
            Immediate actions to implement the business scaling strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">✅ Pricing Optimized</h4>
              <p className="text-sm text-green-700">
                Updated subscription pricing to market-tested $4.99/month rates
              </p>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">✅ Analytics Dashboard</h4>
              <p className="text-sm text-blue-700">
                Comprehensive usage tracking and conversion funnel analysis
              </p>
            </div>
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h4 className="font-medium text-orange-800 mb-2">✅ Restaurant Portal</h4>
              <p className="text-sm text-orange-700">
                Self-service partnership portal for restaurant revenue
              </p>
            </div>
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h4 className="font-medium text-purple-800 mb-2">✅ Affiliate Tracking</h4>
              <p className="text-sm text-purple-700">
                Commission tracking for grocery and equipment sales
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <h4 className="font-medium text-yellow-800 mb-2">🚀 Revenue Projection</h4>
            <p className="text-sm text-yellow-700 mb-2">
              Based on proven models from DoorDash, PlateJoy, and Yummly:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Month 1:</strong> $2,000-5,000<br/>
                500 users → 50 premium subscribers
              </div>
              <div>
                <strong>Month 3:</strong> $10,000-15,000<br/>
                2,000 users → 200 subscribers + partnerships
              </div>
              <div>
                <strong>Month 6:</strong> $25,000-40,000<br/>
                5,000 users → 500 subscribers + enterprise
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}