import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_TIERS } from "@shared/subscription-tiers";
import { Crown, Zap, CheckCircle, ArrowLeft, Shield } from "lucide-react";

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');

  const handleSubscribe = (planId: string) => {
    // In a real implementation, this would integrate with Stripe
    console.log(`Subscribing to plan: ${planId}`);
    alert(`Subscription to ${SUBSCRIPTION_TIERS[planId].name} plan initiated! (Demo mode)`);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Button 
          variant="ghost" 
          className="mb-4 text-orange-600 hover:text-orange-700"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg">Unlock premium cooking features and AI assistance</p>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
          <Card
            key={tier.id}
            className={`relative border-2 transition-all cursor-pointer ${
              selectedPlan === tier.id
                ? 'border-orange-500 bg-orange-50 transform scale-105'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan(tier.id)}
          >
            {tier.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white px-4 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">{tier.name}</CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-orange-600">
                  ${tier.price}
                  {tier.id === 'lifetime' ? (
                    <span className="text-sm text-gray-500 font-normal"> one-time</span>
                  ) : (
                    <span className="text-sm text-gray-500 font-normal">/month</span>
                  )}
                </div>
                {tier.id === 'lifetime' && (
                  <Badge className="bg-purple-500 text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limits Display */}
              <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>Voice Commands:</span>
                  <span className="font-medium">
                    {tier.limits.voiceMinutesPerMonth === -1 ? 'Unlimited' : `${tier.limits.voiceMinutesPerMonth} min/month`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Recipes:</span>
                  <span className="font-medium">
                    {tier.limits.recipesPerDay === -1 ? 'Unlimited' : tier.limits.recipesPerDay}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nutrition Analysis:</span>
                  <span className="font-medium">
                    {tier.limits.nutritionAnalysisPerDay === -1 ? 'Unlimited' : `${tier.limits.nutritionAnalysisPerDay}/day`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Store Searches:</span>
                  <span className="font-medium">
                    {tier.limits.storeSearchesPerDay === -1 ? 'Unlimited' : `${tier.limits.storeSearchesPerDay}/day`}
                  </span>
                </div>
              </div>

              {/* Subscribe Button */}
              <Button
                className={`w-full py-3 text-lg font-semibold ${
                  tier.id === 'free'
                    ? 'bg-gray-500 hover:bg-gray-600'
                    : selectedPlan === tier.id
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-orange-400 hover:bg-orange-500'
                } text-white transition-all`}
                onClick={() => handleSubscribe(tier.id)}
                disabled={tier.id === 'free'}
              >
                {tier.id === 'free' ? (
                  'Current Plan'
                ) : selectedPlan === tier.id ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </>
                ) : (
                  'Select Plan'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What about the lifetime plan?</h3>
              <p className="text-sm text-gray-600">
                The lifetime plan gives you permanent access to all Pro features with no recurring payments. Limited availability.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-gray-600">
                We offer a 30-day money-back guarantee on all paid plans. Contact support for refund requests.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-sm text-gray-600">
                Yes, you can change your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Money Back Guarantee */}
      <div className="text-center bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">30-Day Money Back Guarantee</h3>
        </div>
        <p className="text-green-700">
          Try ChefGrocer risk-free. If you're not completely satisfied, we'll refund your money within 30 days.
        </p>
      </div>
    </div>
  );
}