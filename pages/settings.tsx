import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { NavigationHeader } from "@/components/navigation-header";
import { useSubscription } from "@/hooks/useSubscription";
import { SUBSCRIPTION_TIERS } from "@shared/subscription-tiers";
import { 
  Settings as SettingsIcon, 
  Crown, 
  Zap, 
  Shield, 
  Bell,
  Volume2,
  Mic,
  Moon,
  Sun,
  User,
  CreditCard,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function Settings() {
  const { subscriptionStatus, getCurrentTier, isSubscriptionActive, needsRenewal } = useSubscription();
  const [settings, setSettings] = useState({
    notifications: true,
    voiceCommands: true,
    autoSave: true,
    darkMode: false,
    soundEffects: true,
  });

  const currentTier = getCurrentTier();

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleUpgrade = (tier: string) => {
    // Redirect to subscription page or payment flow
    window.location.href = `/subscribe?plan=${tier}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <NavigationHeader 
        title="Settings" 
        description="Manage your account and preferences"
        backHref="/"
      />
      
      <div className="container mx-auto p-4 max-w-4xl space-y-4">

      {/* Subscription Status Card */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Crown className="w-5 h-5 text-yellow-500" />
            Subscription Status
            {isSubscriptionActive ? (
              <Badge className="bg-green-500 text-white text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">{currentTier.name} Plan</h3>
                <Badge className="bg-orange-500 text-white text-xs">
                  ${currentTier.price}/month
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {subscriptionStatus?.subscriptionEnd && !subscriptionStatus?.isLifetime && (
                  <>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {isSubscriptionActive ? 'Renews' : 'Expired'} on {formatDate(subscriptionStatus.subscriptionEnd)}
                  </>
                )}
                {subscriptionStatus?.isLifetime && (
                  <>
                    <Zap className="w-3 h-3 inline mr-1" />
                    Lifetime access - no renewal required
                  </>
                )}
              </p>
            </div>
            <div className="text-right">
              {needsRenewal ? (
                <Button 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  onClick={() => handleUpgrade(currentTier.id)}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Renew Now
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 text-xs"
                  onClick={() => handleUpgrade('pro')}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>

          {/* Usage Information */}
          {subscriptionStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Today's Usage</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Voice Minutes:</span>
                    <span>{subscriptionStatus.usage.voiceMinutesUsed}/{currentTier.limits.voiceMinutesPerMonth === -1 ? '∞' : currentTier.limits.voiceMinutesPerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recipe Searches:</span>
                    <span>{subscriptionStatus.usage.recipesUsedToday}/{currentTier.limits.recipesPerDay === -1 ? '∞' : currentTier.limits.recipesPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nutrition Analysis:</span>
                    <span>{subscriptionStatus.usage.nutritionAnalysisUsedToday}/{currentTier.limits.nutritionAnalysisPerDay === -1 ? '∞' : currentTier.limits.nutritionAnalysisPerDay}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Plan Features</h4>
                <div className="space-y-1">
                  {currentTier.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Available Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
              <div
                key={tier.id}
                className={`p-4 rounded-lg border-2 ${
                  tier.id === currentTier.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                } transition-all cursor-pointer`}
                onClick={() => tier.id !== currentTier.id && handleUpgrade(tier.id)}
              >
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <div className="text-2xl font-bold text-orange-600">
                    ${tier.price}
                    {tier.id !== 'lifetime' && <span className="text-sm text-gray-500">/month</span>}
                  </div>
                  <div className="space-y-1">
                    {tier.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  {tier.id === currentTier.id ? (
                    <Badge className="bg-green-500 text-white w-full">Current Plan</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleUpgrade(tier.id)}
                    >
                      {tier.price > currentTier.price ? 'Upgrade' : 'Downgrade'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            App Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-600">Get notified about cooking reminders and tips</p>
              </div>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>

          <Separator />

          {/* Voice Commands */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium">Voice Commands</h4>
                <p className="text-sm text-gray-600">Enable hands-free voice control</p>
              </div>
            </div>
            <Switch
              checked={settings.voiceCommands}
              onCheckedChange={(checked) => updateSetting('voiceCommands', checked)}
            />
          </div>

          <Separator />

          {/* Sound Effects */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium">Sound Effects</h4>
                <p className="text-sm text-gray-600">Play sounds for timer and notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.soundEffects}
              onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
            />
          </div>

          <Separator />

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium">Auto Save</h4>
                <p className="text-sm text-gray-600">Automatically save your recipes and plans</p>
              </div>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting('autoSave', checked)}
            />
          </div>

          <Separator />

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <h4 className="font-medium">Dark Mode</h4>
                <p className="text-sm text-gray-600">Switch to dark theme</p>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1">
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="flex-1">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1">
              Export Data
            </Button>
            <Button variant="destructive" className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              Contact Support
            </Button>
            <Button variant="outline" className="justify-start">
              FAQ & Help
            </Button>
            <Button variant="outline" className="justify-start">
              Privacy Policy
            </Button>
            <Button variant="outline" className="justify-start">
              Terms of Service
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}