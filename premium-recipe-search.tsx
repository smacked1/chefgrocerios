import React from 'react';
import { SubscriptionGate, FeatureUsageIndicator } from './subscription-gate';
import { FallbackRecipeDisplay } from './fallback-recipe-display';
import { SpoonacularRecipeSearch } from './spoonacular-recipe-search';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Crown } from "lucide-react";

export function PremiumRecipeSearch() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recipe Search</h3>
        <FeatureUsageIndicator feature="recipesPerDay" />
      </div>
      
      <SubscriptionGate
        feature="recipesPerDay"
        fallback={
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Premium Recipe Database
              </CardTitle>
              <p className="text-gray-600">
                Free users get limited recipe searches. Upgrade for unlimited access to thousands of recipes!
              </p>
            </CardHeader>
            <CardContent>
              <FallbackRecipeDisplay />
            </CardContent>
          </Card>
        }
      >
        <div className="space-y-4">
          <SpoonacularRecipeSearch />
          <FallbackRecipeDisplay />
        </div>
      </SubscriptionGate>
    </div>
  );
}