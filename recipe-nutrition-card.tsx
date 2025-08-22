import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Zap, 
  Activity, 
  Scale, 
  DollarSign, 
  TrendingUp,
  Clock,
  Users,
  BarChart3,
  Beef,
  Wheat,
  Droplets
} from "lucide-react";

interface RecipeNutritionCardProps {
  recipe: Recipe;
}

export function RecipeNutritionCard({ recipe }: RecipeNutritionCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const nutritionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/recipe-nutrition", {
        recipe: {
          name: recipe.name,
          ingredients: recipe.ingredients,
          servings: recipe.servings
        }
      });
      return await response.json();
    }
  });

  const handleCalculateNutrition = () => {
    nutritionMutation.mutate();
  };

  const getNutritionColor = (value: number, type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    switch (type) {
      case 'calories':
        if (value > 500) return 'text-red-600';
        if (value > 300) return 'text-yellow-600';
        return 'text-green-600';
      case 'protein':
        if (value > 25) return 'text-green-600';
        if (value > 15) return 'text-yellow-600';
        return 'text-red-600';
      case 'carbs':
        if (value > 50) return 'text-yellow-600';
        return 'text-green-600';
      case 'fat':
        if (value > 20) return 'text-red-600';
        if (value > 10) return 'text-yellow-600';
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{recipe.name}</CardTitle>
            <p className="text-gray-600 text-sm mt-1">{recipe.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {recipe.calories && (
              <Badge className="bg-orange-100 text-orange-700">
                {recipe.caloriesPerServing || Math.round(recipe.calories / recipe.servings)} cal/serving
              </Badge>
            )}
            {recipe.estimatedCost && (
              <Badge className="bg-green-100 text-green-700">
                {recipe.costPerServing || `$${(parseFloat(recipe.estimatedCost.replace('$', '')) / recipe.servings).toFixed(2)}`}/serving
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Clock className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-sm text-gray-600">{recipe.cookTime} min</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-5 h-5 text-green-600 mb-1" />
              <span className="text-sm text-gray-600">{recipe.servings} servings</span>
            </div>
            <div className="flex flex-col items-center">
              <BarChart3 className={`w-5 h-5 mb-1 ${
                recipe.difficulty === 'Easy' ? 'text-green-600' :
                recipe.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <span className="text-sm text-gray-600">{recipe.difficulty}</span>
            </div>
          </div>

          {/* Nutrition Information */}
          {recipe.nutritionInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-600" />
                Nutrition per Serving
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Calories</span>
                  </div>
                  <span className={`font-medium ${getNutritionColor(recipe.caloriesPerServing || 0, 'calories')}`}>
                    {recipe.caloriesPerServing || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Beef className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Protein</span>
                  </div>
                  <span className={`font-medium ${getNutritionColor(recipe.nutritionInfo.protein || 0, 'protein')}`}>
                    {recipe.nutritionInfo.protein || 'N/A'}g
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wheat className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Carbs</span>
                  </div>
                  <span className={`font-medium ${getNutritionColor(recipe.nutritionInfo.carbs || 0, 'carbs')}`}>
                    {recipe.nutritionInfo.carbs || 'N/A'}g
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Fat</span>
                  </div>
                  <span className={`font-medium ${getNutritionColor(recipe.nutritionInfo.fat || 0, 'fat')}`}>
                    {recipe.nutritionInfo.fat || 'N/A'}g
                  </span>
                </div>

                {recipe.nutritionInfo.fiber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fiber</span>
                    <span className="font-medium text-green-600">{recipe.nutritionInfo.fiber}g</span>
                  </div>
                )}
                
                {recipe.nutritionInfo.sugar && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sugar</span>
                    <span className="font-medium text-red-600">{recipe.nutritionInfo.sugar}g</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estimated Cost Breakdown */}
          {recipe.estimatedCost && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold mb-2 flex items-center text-green-800">
                <DollarSign className="w-4 h-4 mr-2" />
                Cost Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Total Recipe Cost</span>
                  <span className="font-medium text-green-800">{recipe.estimatedCost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Cost per Serving</span>
                  <span className="font-medium text-green-800">
                    {recipe.costPerServing || `$${(parseFloat(recipe.estimatedCost.replace('$', '')) / recipe.servings).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {!recipe.nutritionInfo && (
              <Button
                onClick={handleCalculateNutrition}
                disabled={nutritionMutation.isPending}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Activity className="w-4 h-4 mr-2" />
                {nutritionMutation.isPending ? 'Calculating...' : 'Calculate Nutrition'}
              </Button>
            )}
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              className="flex-1"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {/* AI Nutrition Results */}
          {nutritionMutation.data && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold mb-3 text-blue-800">AI-Calculated Nutrition</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-blue-700">Total Calories:</span>
                  <span className="font-medium text-blue-800 ml-2">
                    {nutritionMutation.data.totalCalories}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-blue-700">Per Serving:</span>
                  <span className="font-medium text-blue-800 ml-2">
                    {nutritionMutation.data.caloriesPerServing} cal
                  </span>
                </div>
              </div>
              
              {nutritionMutation.data.nutritionInfo && (
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {nutritionMutation.data.nutritionInfo.protein}g
                    </div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">
                      {nutritionMutation.data.nutritionInfo.carbs}g
                    </div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {nutritionMutation.data.nutritionInfo.fat}g
                    </div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Information */}
          {showDetails && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <h5 className="font-medium mb-2">Ingredients ({recipe.ingredients.length})</h5>
                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {recipe.tags && recipe.tags.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((tag, index) => (
                      <Badge key={index} className="bg-orange-100 text-orange-700 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}