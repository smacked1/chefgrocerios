import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Target, Clock, Star } from 'lucide-react';

interface RevenueMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

export function RevenueBooster() {
  const metrics: RevenueMetric[] = [
    {
      title: 'Active Trials',
      value: '47',
      change: '+23%',
      trend: 'up',
      icon: <Users className="h-4 w-4" />
    },
    {
      title: 'Conversion Rate',
      value: '24%',
      change: '+8%',
      trend: 'up',
      icon: <Target className="h-4 w-4" />
    },
    {
      title: 'Weekly Revenue',
      value: '$1,247',
      change: '+34%',
      trend: 'up',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: 'Avg Session',
      value: '12m',
      change: '+5m',
      trend: 'up',
      icon: <Clock className="h-4 w-4" />
    }
  ];

  const urgencyActions = [
    {
      title: 'Limited Lifetime Passes',
      description: 'Only 53 remaining out of 100',
      action: 'View Offers',
      urgency: 'high'
    },
    {
      title: 'iOS Launch in Progress',
      description: 'Get grandfathered pricing now',
      action: 'Lock in Rate',
      urgency: 'medium'
    },
    {
      title: 'Voice AI Features',
      description: 'Free during beta period',
      action: 'Try Now',
      urgency: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{metric.change}</span>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Urgency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Revenue Opportunities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {urgencyActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{action.title}</h4>
                    <Badge 
                      variant={action.urgency === 'high' ? 'destructive' : action.urgency === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {action.urgency === 'high' ? 'URGENT' : action.urgency === 'medium' ? 'SOON' : 'LIMITED'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <Button 
                  variant={action.urgency === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    // Handle action based on the action type
                    switch(action.action) {
                      case 'Launch Now':
                        window.open('/api/launch-campaign', '_blank');
                        break;
                      case 'Review Pricing':
                        window.location.href = '/subscribe';
                        break;
                      case 'Add Features':
                        window.location.href = '/?tab=voice';
                        break;
                      case 'Enable Now':
                        window.location.href = '/subscribe?plan=premium';
                        break;
                      default:
                        console.log('Action clicked:', action.action);
                    }
                  }}
                >
                  {action.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}