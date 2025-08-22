/*
 * ChefGrocer - AI-Powered Smart Cooking Assistant
 * Copyright (c) 2025 Myles Barber. All rights reserved.
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * 
 * For licensing inquiries: dxmylesx22@gmail.com
 */

import React from 'react';
import { useIAP } from '../hooks/useIAP';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown, Star, Sparkles, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionMobile() {
  const { products, purchased, buy, restore, loading, error, isAvailable } = useIAP();
  const { toast } = useToast();

  const handlePurchase = async (productId: string) => {
    try {
      await buy(productId);
      toast({
        title: "Purchase Successful!",
        description: "Your subscription has been activated.",
      });
    } catch (err) {
      toast({
        title: "Purchase Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      toast({
        title: "Purchases Restored",
        description: "Your previous purchases have been restored.",
      });
    } catch (err) {
      toast({
        title: "Restore Failed",
        description: "No purchases found to restore.",
        variant: "destructive",
      });
    }
  };

  const getProductIcon = (productId: string) => {
    switch (productId) {
      case 'premium_monthly':
        return <Star className="w-6 h-6 text-yellow-500" />;
      case 'pro_monthly':
        return <Crown className="w-6 h-6 text-purple-500" />;
      case 'lifetime_access':
        return <Sparkles className="w-6 h-6 text-orange-500" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getProductFeatures = (productId: string) => {
    const features = {
      premium_monthly: [
        "Unlimited AI voice commands",
        "Advanced meal planning",
        "Premium recipe access",
        "Price comparison alerts"
      ],
      pro_monthly: [
        "Everything in Premium",
        "Priority AI processing",
        "Advanced nutrition analysis",
        "Restaurant partnerships",
        "Premium customer support"
      ],
      lifetime_access: [
        "Everything in Pro",
        "Lifetime access to all features",
        "Future feature updates included",
        "One-time payment",
        "Priority support forever"
      ]
    };
    return features[productId as keyof typeof features] || [];
  };

  // Always show subscription options since we use Stripe for all platforms

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upgrade ChefGrocer
        </h1>
        <p className="text-gray-600">
          Unlock premium features and AI-powered cooking assistance
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && products.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      )}

      {products.map((product) => (
        <Card key={product.productId} className="relative">
          {purchased[product.productId] && (
            <Badge className="absolute -top-2 -right-2 bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Purchased
            </Badge>
          )}
          
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getProductIcon(product.productId)}
              <div>
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="text-2xl font-bold text-orange-600">{product.price}</p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="space-y-2 mb-4">
              {getProductFeatures(product.productId).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => handlePurchase(product.productId)}
              disabled={purchased[product.productId] || loading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {purchased[product.productId] ? "Purchased" : "Buy Now"}
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="text-center space-y-4">
        <Button 
          onClick={handleRestore}
          variant="outline"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Restore Purchases
        </Button>
        
        <p className="text-xs text-gray-500">
          Subscriptions auto-renew. Cancel anytime in App Store settings.
        </p>
      </div>
    </div>
  );
}