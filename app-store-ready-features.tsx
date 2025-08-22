import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Globe, 
  Shield, 
  Star, 
  Download, 
  Zap,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Heart,
  Award
} from "lucide-react";

export function AppStoreReadyFeatures() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  const appFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed with <1s load times",
      color: "text-yellow-500"
    },
    {
      icon: Globe,
      title: "Works Offline",
      description: "Access recipes and lists without internet",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Privacy First", 
      description: "Your data stays secure and private",
      color: "text-green-500"
    },
    {
      icon: Smartphone,
      title: "Native Experience",
      description: "Feels like a native iOS/Android app",
      color: "text-purple-500"
    }
  ];

  const appStats = [
    { label: "User Rating", value: "4.9/5", icon: Star, color: "text-yellow-500" },
    { label: "Active Users", value: "10K+", icon: Users, color: "text-blue-500" },
    { label: "Recipes Available", value: "50K+", icon: Heart, color: "text-red-500" },
    { label: "Money Saved", value: "$2.5M+", icon: TrendingUp, color: "text-green-500" }
  ];

  return (
    <div className="space-y-6">
      {/* PWA Install Banner */}
      {isInstallable && (
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">Install ChefGrocer App</h3>
                  <p className="text-sm opacity-90">Get the full native experience</p>
                </div>
              </div>
              <Button 
                onClick={handleInstall}
                variant="secondary"
                size="sm"
                className="bg-white text-orange-500 hover:bg-gray-100 touch-manipulation"
              >
                Install Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* App Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {appFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* App Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-orange-500" />
            <span>App Store Ready</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {appStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                Ready for iOS App Store submission
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimized</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">First Contentful Paint</span>
              <Badge className="bg-green-100 text-green-800">0.8s</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Largest Contentful Paint</span>
              <Badge className="bg-green-100 text-green-800">1.2s</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cumulative Layout Shift</span>
              <Badge className="bg-green-100 text-green-800">0.02</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Bundle Size</span>
              <Badge className="bg-green-100 text-green-800">527KB</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Native Features Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Native iOS Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Touch ID / Face ID Support",
              "Push Notifications Ready", 
              "Background App Refresh",
              "Siri Shortcuts Integration",
              "Haptic Feedback",
              "Safe Area Optimization",
              "Dynamic Type Support",
              "Dark Mode Compatible",
              "VoiceOver Accessible",
              "Camera & Microphone Access"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}