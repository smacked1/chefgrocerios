import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Shield, Mic, CreditCard, Scale } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                console.log('Back to App from Terms clicked');
                window.location.href = '/';
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
          </div>
        </div>

        {/* Last Updated */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Updated: August 10, 2025</p>
                <p className="text-sm text-gray-600">Effective Date: August 10, 2025</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="#ai-voice" className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Mic className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">AI Voice Commands</span>
              </a>
              <a href="#subscriptions" className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Subscriptions</span>
              </a>
              <a href="#liability" className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Scale className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Liability</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <Card>
          <CardContent className="pt-6 prose prose-gray max-w-none">
            <div className="space-y-8">
              
              {/* Acceptance of Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing or using ChefGrocer ("Service"), operated by Myles Barber ("Company," "we," "us," or "our"), 
                  you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, please do not use our Service.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Business Contact:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Owner: Myles Barber</li>
                    <li>Email: dxmylesx22@gmail.com</li>
                    <li>Address: 1619 Mound Street, Davenport, IA 52803</li>
                  </ul>
                </div>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
                <p className="text-gray-700 mb-4">
                  ChefGrocer is an AI-powered cooking and grocery management platform that provides:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Voice-activated cooking instructions and recipe guidance</li>
                  <li>Meal planning and nutrition analysis using AI technology</li>
                  <li>Grocery list management with price comparison</li>
                  <li>Store locator and shopping optimization</li>
                  <li>Barcode scanning for product identification</li>
                  <li>Premium subscription features and content</li>
                </ul>
              </section>

              {/* AI Voice Commands */}
              <section id="ai-voice">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mic className="w-6 h-6 text-blue-600" />
                  3. AI Voice Commands and Content
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Voice Recognition</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Our Service uses speech recognition technology to process voice commands</li>
                  <li>Voice data is processed to provide cooking instructions and recipe guidance</li>
                  <li>We use Google Gemini AI to interpret and respond to voice requests</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 AI-Generated Content</h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-800 font-medium">Important Disclaimer:</p>
                  <ul className="list-disc pl-6 text-yellow-700 space-y-1 mt-2">
                    <li>Cooking instructions, recipes, and nutrition advice are generated using artificial intelligence</li>
                    <li>AI-generated content is for informational purposes only</li>
                    <li>Always verify cooking temperatures, food safety guidelines, and nutritional information</li>
                    <li>We are not responsible for outcomes from following AI-generated cooking instructions</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Recipe and Nutrition Data</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Recipe data is sourced from Spoonacular API and USDA FoodData Central</li>
                  <li>Nutrition information is provided for educational purposes</li>
                  <li>Consult healthcare professionals for specific dietary needs or restrictions</li>
                </ul>
              </section>

              {/* Subscriptions */}
              <section id="subscriptions">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  4. User Accounts and Subscriptions
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Account Registration</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>You must provide accurate information when creating an account</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be 18+ years old or have parental consent</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Subscription Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">Free Plan</h4>
                    <p className="text-sm text-gray-600">Basic features with limited AI interactions</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">Premium Plan - $4.99/month</h4>
                    <p className="text-sm text-gray-600">Enhanced features and unlimited AI assistance</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">Pro Plan - $9.99/month</h4>
                    <p className="text-sm text-gray-600">Advanced features and priority support</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-orange-600 mb-2">Lifetime Pass - $99.99</h4>
                    <p className="text-sm text-gray-600">One-time payment for permanent access</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Payment Terms</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>Payment processing is handled securely through Stripe</li>
                  <li>Refunds are processed according to our refund policy</li>
                  <li>Promotional codes have specific terms and expiration dates</li>
                </ul>
              </section>

              {/* Liability */}
              <section id="liability">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-orange-600" />
                  10. Liability and Disclaimers
                </h2>
                
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <h3 className="text-xl font-semibold text-red-800 mb-3">10.1 Food Safety and Health Disclaimers</h3>
                  <ul className="list-disc pl-6 text-red-700 space-y-2">
                    <li>Always follow safe cooking practices and food handling guidelines</li>
                    <li>Verify cooking temperatures using reliable thermometers</li>
                    <li>Be aware of food allergies and dietary restrictions</li>
                    <li>Our AI suggestions are not substitutes for professional culinary training</li>
                    <li>Nutrition information is for educational purposes only</li>
                    <li>Consult healthcare professionals for specific dietary needs</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Limitation of Liability</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-medium text-gray-800 mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>We are not liable for damages arising from use of our Service</li>
                    <li>Our liability is limited to the amount paid for subscription services</li>
                    <li>We disclaim warranties regarding AI accuracy or service performance</li>
                  </ul>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
                <p className="text-gray-700 mb-4">For questions about these Terms of Use:</p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Business Contact</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>ChefGrocer</p>
                        <p>Myles Barber</p>
                        <p>1619 Mound Street</p>
                        <p>Davenport, IA 52803</p>
                        <p>Email: dxmylesx22@gmail.com</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Support</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>Technical support: Contact us through the app</p>
                        <p>Privacy concerns: Reference our Privacy Policy</p>
                        <p>Billing issues: Access account settings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Acceptance */}
              <section className="border-t pt-6">
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <p className="text-lg font-medium text-green-800 mb-2">
                    By using ChefGrocer, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
                  </p>
                  <p className="text-sm text-green-600">
                    Last updated: August 10, 2025
                  </p>
                </div>
              </section>

            </div>
          </CardContent>
        </Card>

        {/* Back to App */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
              onClick={() => {
                console.log('Return to ChefGrocer from Terms clicked');
                window.location.href = '/';
              }}
            >
              Return to ChefGrocer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}