import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Eye,
  Clock,
  Target,
  Zap
} from "lucide-react";

interface AnalyticsData {
  period: string;
  users: number;
  conversions: number;
  revenue: number;
  engagement: number;
}

interface ConversionFunnel {
  stage: string;
  users: number;
  conversionRate: number;
}

interface FeatureUsage {
  feature: string;
  usage: number;
  revenue: number;
  color: string;
}

export function UsageAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock analytics data - in production, this would come from analytics APIs
  const analyticsData: AnalyticsData[] = [
    { period: 'Mon', users: 245, conversions: 12, revenue: 149.88, engagement: 78 },
    { period: 'Tue', users: 312, conversions: 18, revenue: 239.82, engagement: 82 },
    { period: 'Wed', users: 189, conversions: 8, revenue: 119.92, engagement: 65 },
    { period: 'Thu', users: 398, conversions: 24, revenue: 359.76, engagement: 89 },
    { period: 'Fri', users: 456, conversions: 31, revenue: 454.69, engagement: 94 },
    { period: 'Sat', users: 523, conversions: 38, revenue: 569.62, engagement: 91 },
    { period: 'Sun', users: 387, conversions: 22, revenue: 329.78, engagement: 85 }
  ];

  const conversionFunnel: ConversionFunnel[] = [
    { stage: 'Visitors', users: 2510, conversionRate: 100 },
    { stage: 'App Opens', users: 1879, conversionRate: 74.9 },
    { stage: 'Recipe Views', users: 1456, conversionRate: 58.0 },
    { stage: 'Feature Usage', users: 892, conversionRate: 35.5 },
    { stage: 'Trial Starts', users: 234, conversionRate: 9.3 },
    { stage: 'Paid Conversions', users: 153, conversionRate: 6.1 }
  ];

  const featureUsage: FeatureUsage[] = [
    { feature: 'Voice Search', usage: 387, revenue: 1240.30, color: '#8884d8' },
    { feature: 'AI Meal Plans', usage: 294, revenue: 980.50, color: '#82ca9d' },
    { feature: 'Recipe Search', usage: 623, revenue: 450.20, color: '#ffc658' },
    { feature: 'Grocery Lists', usage: 445, revenue: 320.15, color: '#ff7300' },
    { feature: 'Nutrition Tracking', usage: 178, revenue: 890.75, color: '#00ff88' }
  ];

  const keyMetrics = {
    totalUsers: 2510,
    conversionRate: 6.1,
    avgRevenue: 15.24,
    engagementScore: 84,
    churnRate: 3.2,
    ltv: 127.50
  };

  const revenueStreams = [
    { name: 'Subscriptions', value: 2840.50, percentage: 68.2 },
    { name: 'Affiliate Sales', value: 890.25, percentage: 21.4 },
    { name: 'Premium Content', value: 320.75, percentage: 7.7 },
    { name: 'Restaurant Partners', value: 115.00, percentage: 2.7 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Track user behavior and revenue optimization</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === '7d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('7d')}
            size="sm"
          >
            7 Days
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30d')}
            size="sm"
          >
            30 Days
          </Button>
          <Button 
            variant={timeRange === '90d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('90d')}
            size="sm"
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{keyMetrics.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12.5% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{keyMetrics.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+2.1% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Revenue</p>
                <p className="text-2xl font-bold">${keyMetrics.avgRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+8.3% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold">{keyMetrics.engagementScore}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+5.7% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold">{keyMetrics.churnRate}%</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-red-500 mr-1 rotate-180" />
              <span className="text-xs text-red-500">-1.2% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lifetime Value</p>
                <p className="text-2xl font-bold">${keyMetrics.ltv}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+15.4% vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Streams</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends (Last 7 Days)</CardTitle>
              <CardDescription>
                Track key metrics over time to identify patterns and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>
                Identify where users drop off in the conversion process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{stage.stage}</h4>
                          <p className="text-sm text-gray-600">{stage.users.toLocaleString()} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{stage.conversionRate}%</div>
                        <Badge 
                          variant={stage.conversionRate > 50 ? "default" : stage.conversionRate > 20 ? "secondary" : "destructive"}
                        >
                          {index === 0 ? "Entry" : `${(stage.conversionRate - (conversionFunnel[index-1]?.conversionRate || 0)).toFixed(1)}% drop`}
                        </Badge>
                      </div>
                    </div>
                    {index < conversionFunnel.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="w-0.5 h-4 bg-gray-300"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage & Revenue Impact</CardTitle>
              <CardDescription>
                See which features drive the most engagement and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>
                  Breakdown of revenue sources this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueStreams}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percentage}) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueStreams.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Streams Detail</CardTitle>
                <CardDescription>
                  Detailed breakdown with growth metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStreams.map((stream, index) => (
                    <div key={stream.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <h4 className="font-medium">{stream.name}</h4>
                          <p className="text-sm text-gray-600">{stream.percentage}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${stream.value.toFixed(2)}</div>
                        <div className="text-xs text-green-600">+12.5%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Opportunities</CardTitle>
          <CardDescription>
            Data-driven recommendations to improve conversion and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h4 className="font-medium text-orange-800 mb-2">Improve Recipe Views → Trial</h4>
              <p className="text-sm text-orange-700">
                Only 16% of recipe viewers start trials. Add more compelling CTAs.
              </p>
            </div>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">Voice Search Revenue</h4>
              <p className="text-sm text-green-700">
                Voice search users have 3x higher LTV. Promote this feature more.
              </p>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Weekend Engagement</h4>
              <p className="text-sm text-blue-700">
                Weekends show highest usage. Schedule more content releases then.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}