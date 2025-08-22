import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  Database, 
  Mic, 
  Settings,
  FileText,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface PrivacySettings {
  voiceProcessing: boolean;
  dataAnalytics: boolean;
  personalizedRecommendations: boolean;
  emailNotifications: boolean;
  dataRetention: 'minimal' | 'standard' | 'extended';
}

export default function PrivacyDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    voiceProcessing: true,
    dataAnalytics: false,
    personalizedRecommendations: true,
    emailNotifications: true,
    dataRetention: 'standard'
  });
  const [dataRequestPending, setDataRequestPending] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      // Load user privacy settings
      loadPrivacySettings();
    }
  }, [isAuthenticated]);

  const loadPrivacySettings = async () => {
    try {
      const response = await fetch('/api/user/privacy-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const updateSettings = async (newSettings: PrivacySettings) => {
    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        setSettings(newSettings);
        toast({
          title: "Settings Updated",
          description: "Your privacy preferences have been saved."
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to save privacy settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const requestDataExport = async () => {
    setDataRequestPending(true);
    try {
      const response = await fetch('/api/user/data-export', {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Data Export Requested",
          description: "We'll email you a download link within 48 hours."
        });
      } else {
        throw new Error('Export request failed');
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Unable to process data export request.",
        variant: "destructive"
      });
    }
    setDataRequestPending(false);
  };

  const requestAccountDeletion = async () => {
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deletionRequest })
      });

      if (response.ok) {
        toast({
          title: "Deletion Requested",
          description: "Your account will be deleted within 30 days. Check your email for confirmation."
        });
      } else {
        throw new Error('Deletion request failed');
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Unable to process account deletion.",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <CardTitle>Privacy Dashboard</CardTitle>
            <CardDescription>
              Please log in to access your privacy settings and data controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/api/login'} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Dashboard</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Control how ChefGrocer uses your data and manage your privacy preferences.
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Privacy Controls
              </CardTitle>
              <CardDescription>
                Customize how your data is processed and used by ChefGrocer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Voice Processing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Voice Command Processing
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Allow voice commands to be processed by Google Gemini AI for recipe search and meal planning.
                    </p>
                  </div>
                  <Switch 
                    checked={settings.voiceProcessing}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...settings, voiceProcessing: checked };
                      updateSettings(newSettings);
                    }}
                  />
                </div>
                {!settings.voiceProcessing && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>Voice commands will be disabled with this setting.</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Usage Analytics
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Help improve ChefGrocer by sharing anonymous usage data.
                  </p>
                </div>
                <Switch 
                  checked={settings.dataAnalytics}
                  onCheckedChange={(checked) => {
                    const newSettings = { ...settings, dataAnalytics: checked };
                    updateSettings(newSettings);
                  }}
                />
              </div>

              <Separator />

              {/* Personalization */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Personalized Recommendations
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get customized recipe and meal plan suggestions based on your preferences.
                  </p>
                </div>
                <Switch 
                  checked={settings.personalizedRecommendations}
                  onCheckedChange={(checked) => {
                    const newSettings = { ...settings, personalizedRecommendations: checked };
                    updateSettings(newSettings);
                  }}
                />
              </div>

              <Separator />

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive meal planning tips, promotions, and service updates via email.
                  </p>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => {
                    const newSettings = { ...settings, emailNotifications: checked };
                    updateSettings(newSettings);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Data Rights
              </CardTitle>
              <CardDescription>
                Access, export, or delete your personal data in accordance with GDPR and CCPA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Data Export */}
              <div className="space-y-3">
                <h4 className="font-medium">Export Your Data</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Download a complete copy of your recipes, meal plans, preferences, and account data.
                </p>
                <Button 
                  onClick={requestDataExport}
                  disabled={dataRequestPending}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {dataRequestPending ? 'Processing...' : 'Request Data Export'}
                </Button>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Export requests are processed within 48 hours and sent via email.</span>
                </div>
              </div>

              <Separator />

              {/* Account Deletion */}
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">Delete Your Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        console.log('Account deletion dialog opened');
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Request Account Deletion
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your ChefGrocer account, including all recipes, meal plans, and personal data. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-3">
                      <Label>Why are you deleting your account? (optional)</Label>
                      <Textarea
                        placeholder="Help us improve by sharing your reason..."
                        value={deletionRequest}
                        onChange={(e) => setDeletionRequest(e.target.value)}
                        className="h-20"
                      />
                    </div>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={requestAccountDeletion}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>Account deletion requests are processed within 30 days. You'll receive email confirmation.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Privacy Compliance
              </CardTitle>
              <CardDescription>
                ChefGrocer is compliant with major privacy regulations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">GDPR</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    European Union General Data Protection Regulation compliant
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">CCPA</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    California Consumer Privacy Act compliant
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">COPPA</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Children's Online Privacy Protection Act compliant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}