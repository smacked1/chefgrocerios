import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Mic, Clock, Users, ChefHat, ImageIcon } from "lucide-react";
import { useState } from "react";
import { MealPlan } from "@shared/schema";
import { getRecipeImage } from "@/utils/food-images";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useVoice } from "@/hooks/use-voice";
import { useToast } from "@/hooks/use-toast";

interface MealPlanCardProps {
  mealPlan: MealPlan;
  onRecipeClick?: (recipeName: string, mealType: string) => void;
}

export function MealPlanCard({ mealPlan, onRecipeClick }: MealPlanCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useVoice();
  const [imageError, setImageError] = useState(false);

  const updateMealPlanMutation = useMutation({
    mutationFn: async (updates: Partial<MealPlan>) => {
      const response = await apiRequest("PATCH", `/api/meal-plans/${mealPlan.id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans'] });
    }
  });

  const handleStartCooking = () => {
    updateMealPlanMutation.mutate({ 
      status: "cooking", 
      currentStep: 1 
    });
    
    speak(`Starting to cook ${mealPlan.recipeName}. Let me guide you through the recipe.`);
    
    toast({
      title: "Started Cooking",
      description: `Now cooking ${mealPlan.recipeName}`,
    });
  };

  const handleVoiceAssist = () => {
    const message = mealPlan.status === "cooking" 
      ? `You're currently on step ${mealPlan.currentStep} of ${mealPlan.recipeName}. Would you like me to read the next step?`
      : `Ready to start cooking ${mealPlan.recipeName}? This recipe takes about ${mealPlan.cookTime} minutes.`;
    
    speak(message);
  };

  const handleRecipeClick = () => {
    if (onRecipeClick) {
      onRecipeClick(mealPlan.recipeName, mealPlan.mealType);
    } else {
      // Default navigation to recipes tab with search
      console.log(`Recipe ${mealPlan.recipeName} clicked`);
      toast({
        title: "Recipe Selected",
        description: `Viewing ${mealPlan.recipeName} recipe`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cooking":
        return "bg-orange-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  const getMealTypeTime = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "8:00 AM";
      case "lunch":
        return "12:30 PM";
      case "dinner":
        return "7:00 PM";
      default:
        return "";
    }
  };



  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-orange-200 cursor-pointer ${
      mealPlan.status === "cooking" ? "border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100" : "hover:bg-orange-50/50"
    }`} onClick={handleRecipeClick}>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="flex flex-col sm:hidden space-y-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0 hover:scale-105 transition-transform">
              {!imageError ? (
                <img 
                  src={getRecipeImage(mealPlan.recipeName)}
                  alt={mealPlan.recipeName}
                  className="w-14 h-14 rounded-xl object-cover shadow-sm ring-2 ring-orange-200 hover:ring-orange-400 transition-all"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center shadow-sm ring-2 ring-orange-200">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-sm truncate">{mealPlan.recipeName}</h4>
              <p className="text-gray-600 text-xs capitalize">
                {mealPlan.mealType} • {getMealTypeTime(mealPlan.mealType)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-3 h-3 text-orange-500" />
                <span className="text-orange-600 text-xs font-medium">
                  {mealPlan.cookTime} min
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {mealPlan.status === "cooking" ? (
              <Badge className="bg-orange-500 text-white text-xs px-3 py-1">
                Step {mealPlan.currentStep} of 6
              </Badge>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartCooking();
                }}
                disabled={updateMealPlanMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2"
                size="sm"
              >
                <Play className="w-3 h-3 mr-1" />
                Start Cooking
              </Button>
            )}
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleVoiceAssist();
              }}
              className="text-orange-600 hover:bg-orange-100"
              variant="ghost"
              size="sm"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative flex-shrink-0 hover:scale-105 transition-transform">
              {!imageError ? (
                <img 
                  src={getRecipeImage(mealPlan.recipeName)}
                  alt={mealPlan.recipeName}
                  className="w-20 h-20 rounded-xl object-cover shadow-md hover:shadow-lg transition-all ring-2 ring-orange-200 hover:ring-orange-400"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center shadow-md ring-2 ring-orange-200">
                  <ChefHat className="w-8 h-8 text-orange-600" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-1">{mealPlan.recipeName}</h4>
              <p className="text-gray-600 text-sm capitalize mb-2">
                {mealPlan.mealType} • {getMealTypeTime(mealPlan.mealType)}
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600 text-sm font-medium">
                    {mealPlan.cookTime} min cook time
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 text-sm">
                    4 servings
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {mealPlan.status === "cooking" ? (
              <Badge className="bg-orange-500 text-white px-4 py-2 text-sm">
                Step {mealPlan.currentStep} of 6
              </Badge>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartCooking();
                }}
                disabled={updateMealPlanMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 shadow-md hover:shadow-lg transition-all"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Cooking
              </Button>
            )}
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleVoiceAssist();
              }}
              className="text-orange-600 hover:bg-orange-100 border border-orange-200 hover:border-orange-300 transition-all"
              variant="outline"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
