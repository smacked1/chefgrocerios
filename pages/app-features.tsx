import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PushNotificationSetup from '@/components/push-notification-setup';
import GroceryOrdering from '@/components/grocery-ordering';
import OfflineRecipeManager from '@/components/offline-recipe-manager';
import { 
  Bell, 
  ShoppingCart, 
  Download, 
  Smartphone, 
  Heart,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

export default function AppFeatures() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-orange-600">App Store Features</h1>
          <p className="text-lg text-gray-600">
            Premium features ready for iOS App Store launch
          </p>
          <div className="flex justify-center gap-2">
            <Badge className="bg-green-100 text-green-700">
              <Smartphone className="w-3 h-3 mr-1" />
              iOS Ready
            </Badge>
            <Badge className="bg-blue-100 text-blue-700">
              <Shield className="w-3 h-3 mr-1" />
              Production Ready
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              <Globe className="w-3 h-3 mr-1" />
              Enterprise Grade
            </Badge>
          </div>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="text-center">
              <Bell className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-orange-800">Push Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Cooking timer alerts</li>
                <li>• Meal reminders</li>
                <li>• Recipe updates</li>
                <li>• Subscription notifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <ShoppingCart className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-800">Grocery Ordering</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Multi-provider API integration</li>
                <li>• Recipe-to-cart conversion</li>
                <li>• Real-time delivery tracking</li>
                <li>• Store selection & pricing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <Download className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-800">Offline Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Recipe offline storage</li>
                <li>• Voice instructions cached</li>
                <li>• Nutrition data sync</li>
                <li>• Meal plan downloads</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Feature Implementation Details */}
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Push Notifications
            </TabsTrigger>
            <TabsTrigger value="grocery" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Grocery Ordering
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Offline Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <PushNotificationSetup />
            
            {/* Technical Implementation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Technical Implementation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">iOS Implementation</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Capacitor Push Notifications plugin</li>
                      <li>• Apple Push Notification Service (APNs)</li>
                      <li>• Local notifications for timers</li>
                      <li>• Background app refresh support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Web Implementation</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Firebase Cloud Messaging (FCM)</li>
                      <li>• Service Worker for background handling</li>
                      <li>• Web Push Protocol</li>
                      <li>• Notification permission management</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grocery" className="space-y-6">
            <GroceryOrdering />
            
            {/* API Integration Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  API Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Primary Providers</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Instacart API for grocery delivery</li>
                      <li>• Walmart Grocery API integration</li>
                      <li>• Kroger API for store locations</li>
                      <li>• DoorDash integration ready</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Real-time inventory checking</li>
                      <li>• Multi-store price comparison</li>
                      <li>• Delivery time estimation</li>
                      <li>• Order tracking & updates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offline" className="space-y-6">
            <OfflineRecipeManager />
            
            {/* Storage Implementation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Storage Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Client Storage</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• IndexedDB via Dexie.js</li>
                      <li>• Capacitor Preferences for metadata</li>
                      <li>• Service Worker caching</li>
                      <li>• Workbox for asset management</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Data Types</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Complete recipe data & instructions</li>
                      <li>• Voice guidance audio files</li>
                      <li>• Nutrition information</li>
                      <li>• Meal plans & schedules</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Development Status */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Development Status: Complete ✅
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-2">Backend APIs</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>✅ Firebase notifications service</li>
                  <li>✅ Grocery ordering endpoints</li>
                  <li>✅ Recipe download APIs</li>
                  <li>✅ Error handling & validation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">Frontend Components</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>✅ Push notification setup UI</li>
                  <li>✅ Grocery ordering interface</li>
                  <li>✅ Offline recipe manager</li>
                  <li>✅ Status indicators & feedback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">Mobile Integration</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>✅ Capacitor plugins configured</li>
                  <li>✅ iOS-specific optimizations</li>
                  <li>✅ Apple HealthKit integration</li>
                  <li>✅ App Store submission ready</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}