import React, { useState } from 'react';
import { SubscriptionGate, FeatureUsageIndicator } from './subscription-gate';
import { OpenFoodFactsSearch } from './open-food-facts-search';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlaskConical, Crown, Search } from "lucide-react";

export function PremiumNutritionAnalysis() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Nutrition Analysis</h3>
        <FeatureUsageIndicator feature="nutritionAnalysisPerDay" />
      </div>
      
      <SubscriptionGate
        feature="nutritionAnalysisPerDay"
        fallback={
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Premium Nutrition Analysis
              </CardTitle>
              <p className="text-gray-600">
                Get detailed nutrition insights, allergen warnings, and health scores. Free users get 5 searches per day.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search foods for basic nutrition info..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center text-sm text-gray-500">
                  Basic nutrition data available in free tier
                </div>
              </div>
            </CardContent>
          </Card>
        }
      >
        <OpenFoodFactsSearch />
      </SubscriptionGate>
    </div>
  );
}