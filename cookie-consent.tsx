import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Cookie, Shield, Settings, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  personalization: boolean;
}

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    personalization: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("chefgrocer-cookie-consent");
    if (!consent) {
      // Show consent banner after a short delay
      const timer = setTimeout(() => setShowConsent(true), 2000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (error) {
        console.error("Error parsing cookie preferences:", error);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("chefgrocer-cookie-consent", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowConsent(false);
    setShowSettings(false);
    
    // Apply preferences
    if (prefs.analytics) {
      // Enable analytics tracking
      console.log("Analytics enabled");
    }
    if (prefs.personalization) {
      // Enable personalization features
      console.log("Personalization enabled");
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      personalization: true,
    });
  };

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      personalization: false,
    });
  };

  if (!showConsent) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-6 sm:right-6 md:left-auto md:right-6 md:max-w-sm">
        <Card className="shadow-lg border-2">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-sm">Cookie Preferences</h3>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Secure
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  We use cookies to enhance your experience, analyze usage, and personalize content. 
                  Your privacy is protected with industry-standard encryption.
                </p>
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button onClick={acceptAll} size="sm" className="flex-1">
                      Accept All
                    </Button>
                    <Button onClick={acceptEssential} variant="outline" size="sm" className="flex-1">
                      Essential Only
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Dialog open={showSettings} onOpenChange={setShowSettings}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto text-xs"
                          onClick={() => setShowSettings(true)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Customize
                        </Button>
                      </DialogTrigger>
                      <CookieSettingsDialog 
                        preferences={preferences}
                        onSave={savePreferences}
                      />
                    </Dialog>
                    
                    <Link href="/privacy-policy" className="text-xs text-orange-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={acceptEssential}
                className="p-1 h-auto text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function CookieSettingsDialog({ 
  preferences, 
  onSave 
}: { 
  preferences: CookiePreferences; 
  onSave: (prefs: CookiePreferences) => void; 
}) {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = () => {
    onSave(localPrefs);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Cookie Preferences
        </DialogTitle>
        <DialogDescription>
          Control which cookies ChefGrocer can use to improve your experience.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        {/* Essential Cookies */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Essential Cookies</Label>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Required for login, security, and core functionality
              </p>
            </div>
            <Switch checked={true} disabled />
          </div>
        </div>

        {/* Analytics Cookies */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Analytics</Label>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Help us understand app usage and performance
              </p>
            </div>
            <Switch 
              checked={localPrefs.analytics}
              onCheckedChange={(checked) => 
                setLocalPrefs(prev => ({ ...prev, analytics: checked }))
              }
            />
          </div>
        </div>

        {/* Personalization Cookies */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Personalization</Label>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Customize recipes and recommendations for you
              </p>
            </div>
            <Switch 
              checked={localPrefs.personalization}
              onCheckedChange={(checked) => 
                setLocalPrefs(prev => ({ ...prev, personalization: checked }))
              }
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Your data is always encrypted and never sold.</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          Save Preferences
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onSave({ essential: true, analytics: false, personalization: false })}
        >
          Essential Only
        </Button>
      </div>
    </DialogContent>
  );
}