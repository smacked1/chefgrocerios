import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, DollarSign, Mic, Sparkles, Calculator } from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">ChefGrocer</h1>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI-Powered Cooking Assistant
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your kitchen into a smart cooking hub with voice commands, AI-powered meal planning, 
            and money-saving grocery management. Cook smarter, save more, and enjoy every meal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/login'}
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
            >
              Start Cooking Smart
            </Button>
            <Button 
              onClick={() => {
                // Navigate to a real cooking demo video
                window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
              }}
              variant="outline" 
              size="lg"
              className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg"
            >
              Watch Demo
            </Button>
          </div>
          <div className="mt-6 text-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/privacy-policy'}
              variant="ghost" 
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              Privacy Policy
            </Button>
            <Button 
              onClick={() => window.location.href = '/terms'}
              variant="ghost" 
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              Terms of Use
            </Button>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Mic className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Voice Commands</CardTitle>
              <CardDescription>
                Control your kitchen hands-free with natural voice commands. Perfect for busy cooking moments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>AI Meal Planning</CardTitle>
              <CardDescription>
                Get personalized recipe suggestions and meal plans based on your preferences and dietary needs.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Smart Savings</CardTitle>
              <CardDescription>
                Compare prices across stores, find deals, and get personalized money-saving tips for groceries.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Recipe Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Store, organize, and discover new recipes with detailed nutrition information and cooking instructions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-orange-600" />
                Nutrition Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Track calories, macros, and nutrients across 1000+ foods with comprehensive nutrition data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                Price Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Compare grocery prices across multiple stores and get alerts when items go on sale.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Preview */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Start Free, Upgrade When Ready
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {/* Free Plan */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Free</CardTitle>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $0<span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>✓ Basic voice commands</div>
                  <div>✓ Simple recipe management</div>
                  <div>✓ Price comparison</div>
                  <div>✓ Basic grocery lists</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Premium Plan - Most Popular */}
            <Card className="text-center border-2 border-orange-500 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-lg">Premium</CardTitle>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $4.99<span className="text-sm font-normal text-gray-500">/month</span>
                </div>
                <div className="text-sm text-green-600">7-day free trial</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>✓ Everything in Free</div>
                  <div>✓ Unlimited AI recipes</div>
                  <div>✓ Advanced meal planning</div>
                  <div>✓ Smart grocery lists</div>
                  <div>✓ Nutrition tracking</div>
                </div>
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
            
            {/* Lifetime Pass */}
            <Card className="text-center border-2 border-yellow-500">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black">
                Best Value
              </Badge>
              <CardHeader>
                <CardTitle className="text-lg">Lifetime Pass</CardTitle>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $99.99<span className="text-sm font-normal text-gray-500"> one-time</span>
                </div>
                <div className="text-sm text-red-600">Only 953 left!</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>✓ Everything in Pro</div>
                  <div>✓ Lifetime access</div>
                  <div>✓ No recurring payments</div>
                  <div>✓ All future features</div>
                  <div>✓ Priority support</div>
                </div>
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700"
                >
                  Get Lifetime Access
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => window.location.href = '/login'}
              variant="outline" 
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              View All Plans & Pricing
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-orange-600 to-amber-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Kitchen?</CardTitle>
              <CardDescription className="text-orange-100">
                Join thousands of home cooks who are saving time and money with ChefGrocer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/'}
                size="lg"
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}