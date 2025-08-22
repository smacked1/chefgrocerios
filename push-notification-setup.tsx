import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, Clock, Calendar, CreditCard, Check } from 'lucide-react';

export interface NotificationSettings {
  timerAlerts: boolean;
  mealReminders: boolean;
  subscriptionReminders: boolean;
  recipeUpdates: boolean;
}

export function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    timerAlerts: true,
    mealReminders: true,
    subscriptionReminders: true,
    recipeUpdates: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationSupport();
    loadNotificationSettings();
  }, []);

  const checkNotificationSupport = async () => {
    if (Capacitor.isNativePlatform()) {
      setIsSupported(true);
      
      // Check permission status
      const status = await PushNotifications.checkPermissions();
      setIsEnabled(status.receive === 'granted');
    } else {
      // Web push notifications
      setIsSupported('Notification' in window);
      setIsEnabled(Notification.permission === 'granted');
    }
  };

  const loadNotificationSettings = () => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveNotificationSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const requestPermissions = async () => {
    setLoading(true);
    
    try {
      if (Capacitor.isNativePlatform()) {
        // Native app permissions
        const permission = await PushNotifications.requestPermissions();
        
        if (permission.receive === 'granted') {
          await setupPushNotifications();
          setIsEnabled(true);
          toast({
            title: "Notifications Enabled",
            description: "You'll now receive cooking alerts and reminders",
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your device settings",
            variant: "destructive",
          });
        }
      } else {
        // Web notifications
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          await setupWebNotifications();
          setIsEnabled(true);
          toast({
            title: "Notifications Enabled",
            description: "You'll now receive cooking alerts in your browser",
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please allow notifications in your browser settings",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Setup Error",
        description: "Failed to set up notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupPushNotifications = async () => {
    try {
      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ', token.value);
        
        // Send token to server
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token.value,
            platform: Capacitor.getPlatform(),
          }),
        });
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ', error);
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
        
        // Handle notification based on type
        handlePushNotification(notification);
      });

      // Listen for notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        
        // Handle notification tap
        handleNotificationAction(notification);
      });

      // Setup local notifications for timers
      await LocalNotifications.requestPermissions();
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      throw error;
    }
  };

  const setupWebNotifications = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Setup web push
        if ('PushManager' in window) {
          // Subscribe to push notifications
          // This would typically involve VAPID keys and server setup
          console.log('Web push notifications supported');
        }
      }
    } catch (error) {
      console.error('Error setting up web notifications:', error);
      throw error;
    }
  };

  const handlePushNotification = (notification: any) => {
    const { title, body, data } = notification;
    
    // Show in-app notification if app is open
    toast({
      title: title || 'ChefGrocer',
      description: body,
      duration: 5000,
    });

    // Handle specific notification types
    if (data?.type === 'timer_finished') {
      // Play sound or vibration
      if (Capacitor.isNativePlatform()) {
        // Native haptic feedback
        import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
          Haptics.impact({ style: ImpactStyle.Heavy });
        });
      }
    }
  };

  const handleNotificationAction = (notification: any) => {
    const { data } = notification.notification;
    
    // Navigate based on notification type
    if (data?.type === 'meal_reminder') {
      // Navigate to recipes or meal plan
      window.location.hash = '#/recipes';
    } else if (data?.type === 'subscription_reminder') {
      // Navigate to subscription page
      window.location.hash = '#/subscription';
    }
  };

  const disableNotifications = async () => {
    setLoading(true);
    
    try {
      if (Capacitor.isNativePlatform()) {
        // Remove all listeners
        await PushNotifications.removeAllListeners();
      }
      
      setIsEnabled(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications anymore",
      });
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to disable notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "Test Notification",
              body: "ChefGrocer notifications are working! 🍳",
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 2000) }, // 2 seconds from now
            }
          ]
        });
      } else {
        // Web notification
        if (Notification.permission === 'granted') {
          new Notification("Test Notification", {
            body: "ChefGrocer notifications are working! 🍳",
            icon: '/icon-192.png',
          });
        }
      }
      
      toast({
        title: "Test Sent",
        description: "You should receive a test notification shortly",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test Failed",
        description: "Could not send test notification",
        variant: "destructive",
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Push notifications are not supported on this device or browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Enable Notifications</h3>
            <p className="text-sm text-gray-600">
              Get alerts for timers, meal reminders, and updates
            </p>
          </div>
          <div className="flex gap-2">
            {isEnabled ? (
              <>
                <Button variant="outline" size="sm" onClick={testNotification}>
                  Test
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={disableNotifications}
                  disabled={loading}
                >
                  Disable
                </Button>
              </>
            ) : (
              <Button onClick={requestPermissions} disabled={loading}>
                {loading ? 'Setting up...' : 'Enable'}
              </Button>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        {isEnabled && (
          <div className="space-y-4">
            <h3 className="font-medium">Notification Types</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="timer-alerts" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timer Alerts
                </Label>
                <Switch
                  id="timer-alerts"
                  checked={settings.timerAlerts}
                  onCheckedChange={(checked) => 
                    saveNotificationSettings({ ...settings, timerAlerts: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="meal-reminders" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Meal Reminders
                </Label>
                <Switch
                  id="meal-reminders"
                  checked={settings.mealReminders}
                  onCheckedChange={(checked) => 
                    saveNotificationSettings({ ...settings, mealReminders: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="subscription-reminders" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Subscription Reminders
                </Label>
                <Switch
                  id="subscription-reminders"
                  checked={settings.subscriptionReminders}
                  onCheckedChange={(checked) => 
                    saveNotificationSettings({ ...settings, subscriptionReminders: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="recipe-updates" className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Recipe Updates
                </Label>
                <Switch
                  id="recipe-updates"
                  checked={settings.recipeUpdates}
                  onCheckedChange={(checked) => 
                    saveNotificationSettings({ ...settings, recipeUpdates: checked })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PushNotificationSetup;