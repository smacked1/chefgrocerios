import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Recipe } from "@shared/schema";
import { Clock, BarChart3, Users, Star, Mic } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";
import { useToast } from "@/hooks/use-toast";

export function RecipeSuggestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useVoice();

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes']
  });

  const addToMealPlanMutation = useMutation({
    mutationFn: async (recipe: Recipe) => {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiRequest("POST", "/api/meal-plans", {
        date: today,
        mealType: "dinner", // Default to dinner
        recipeId: recipe.id,
        recipeName: recipe.name,
        cookTime: recipe.cookTime,
        status: "planned"
      });
      return await response.json();
    },
    onSuccess: (_, recipe) => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans'] });
      toast({
        title: "Added to Meal Plan",
        description: `${recipe.name} has been added to your dinner plan.`,
      });
    }
  });

  const handleVoiceCook = (recipe: Recipe) => {
    const message = `Starting voice-guided cooking for ${recipe.name}. 
      This recipe serves ${recipe.servings} people and takes about ${recipe.cookTime} minutes. 
      The difficulty level is ${recipe.difficulty}. 
      Would you like me to read the ingredients first?`;
    
    speak(message);
    
    toast({
      title: "Voice Cooking Started",
      description: `Starting voice guidance for ${recipe.name}`,
    });
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    addToMealPlanMutation.mutate(recipe);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    console.log(`Opening recipe: ${recipe.name}`);
    
    // Create a detailed recipe instructions message
    const instructions = `
      Now showing ${recipe.name}:
      
      Cook Time: ${recipe.cookTime} minutes
      Servings: ${recipe.servings} people
      Difficulty: ${recipe.difficulty}
      
      ${recipe.description}
      
      Ingredients and cooking steps would be displayed here.
      This recipe has a ${recipe.rating || 4.5} star rating.
    `;
    
    speak(`Opening recipe for ${recipe.name}. This ${recipe.difficulty} recipe takes ${recipe.cookTime} minutes and serves ${recipe.servings} people.`);
    
    toast({
      title: `Recipe: ${recipe.name}`,
      description: `${recipe.difficulty} • ${recipe.cookTime} min • ${recipe.servings} servings`,
    });
    
    // Log the detailed instructions
    console.log(instructions);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="w-full h-48 bg-gray-200"></div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get top 3 recipes for suggestions
  const topRecipes = recipes.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topRecipes.map((recipe) => (
        <Card 
          key={recipe.id} 
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleRecipeClick(recipe)}
        >
          <img 
            src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"}
            alt={recipe.name}
            className="w-full h-48 object-cover"
          />
          
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
              {recipe.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{recipe.rating}</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {recipe.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.cookTime} min</span>
              </div>
              <div className={`flex items-center space-x-1 ${getDifficultyColor(recipe.difficulty)}`}>
                <BarChart3 className="w-4 h-4" />
                <span>{recipe.difficulty}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
            
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAddToMealPlan(recipe)}
                disabled={addToMealPlanMutation.isPending}
                className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
              >
                Add to Plan
              </Button>
              <Button
                onClick={() => handleVoiceCook(recipe)}
                className="p-2 text-blue-600 hover:bg-blue-50"
                variant="outline"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
