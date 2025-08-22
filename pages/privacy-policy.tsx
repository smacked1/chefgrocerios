import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NavigationHeader } from "@/components/navigation-header";
import { Shield, Lock, Eye, Database, Users, FileText, Mail, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 8, 2025";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader 
        title="Privacy Policy" 
        description="Your privacy is our priority"
        backHref="/"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="text-sm">
            Last Updated: {lastUpdated}
          </Badge>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {/* Quick Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Privacy at a Glance
              </CardTitle>
              <CardDescription>
                Key points about how ChefGrocer handles your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="text-sm">We never sell your data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Voice recordings processed securely</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Encrypted data storage</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm">You control your data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-green-600" />
                    <span className="text-sm">GDPR & CCPA compliant</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Transparent practices</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Privacy Policy</CardTitle>
              <CardDescription>
                Detailed information about data collection, usage, and your rights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6 text-sm">
                  
                  {/* Information We Collect */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">Information We Collect</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Personal Information</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                          <li>Account details: name, email, profile image</li>
                          <li>Payment information (processed securely via Stripe)</li>
                          <li>Dietary preferences and cooking settings</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Usage Data</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                          <li>Voice commands for AI processing</li>
                          <li>Recipe interactions and meal plans</li>
                          <li>App usage patterns and preferences</li>
                          <li>Device and technical information</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* How We Use Information */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">How We Use Your Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Core Functionality</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                          <li>AI-powered recipe recommendations and meal planning</li>
                          <li>Voice command processing via Google Gemini AI</li>
                          <li>Smart grocery lists and price comparisons</li>
                          <li>Personalized nutrition tracking</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Service Improvement</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                          <li>App performance optimization</li>
                          <li>Feature development and personalization</li>
                          <li>Security monitoring and fraud prevention</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Data Sharing */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">Information Sharing</h3>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        We never sell your personal information to third parties.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Trusted Partners Only</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                        <li><strong>Google Gemini AI:</strong> Voice processing and recipe generation</li>
                        <li><strong>Stripe:</strong> Secure payment processing</li>
                        <li><strong>Database providers:</strong> Encrypted data storage</li>
                        <li><strong>Analytics:</strong> Anonymized usage data only</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  {/* Your Rights */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">Your Privacy Rights</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Account Control</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                          <li>Access your data</li>
                          <li>Correct information</li>
                          <li>Delete your account</li>
                          <li>Export your data</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Communication</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                          <li>Opt out of emails</li>
                          <li>Control notifications</li>
                          <li>Disable voice features</li>
                          <li>Manage preferences</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Security */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">Data Security</h3>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Industry-standard encryption</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Multi-factor authentication</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Secure data storage with backups</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Contact */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600">Contact Us</h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="mb-3">Have questions about your privacy? We're here to help.</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>privacy@chefgrocer.app</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          We respond to all privacy inquiries within 30 days.
                        </p>
                      </div>
                    </div>
                  </section>

                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  This policy was last updated on {lastUpdated}
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/terms'}
                  >
                    Terms of Use
                  </Button>
                  <Button variant="outline" onClick={() => window.history.back()}>
                    Go Back
                  </Button>
                  <Button onClick={() => window.print()}>
                    Print Policy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}