import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Clock, 
  Users, 
  Star,
  Heart,
  ChefHat,
  Utensils,
  Filter,
  ExternalLink,
  Sparkles
} from "lucide-react";

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  analyzedInstructions: any[];
  nutrition?: {
    calories: number;
    protein: string;
    fat: string;
    carbohydrates: string;
  };
  diets: string[];
  dishTypes: string[];
  cuisines: string[];
}

export function SpoonacularRecipeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [intolerances, setIntolerances] = useState("");
  const [searchResults, setSearchResults] = useState<SpoonacularRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<SpoonacularRecipe | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (params: {
      query: string;
      diet?: string;
      type?: string;
      intolerances?: string;
    }) => {
      const searchParams = new URLSearchParams({
        query: params.query,
        number: "12"
      });
      
      if (params.diet) searchParams.append('diet', params.diet);
      if (params.type) searchParams.append('type', params.type);
      if (params.intolerances) searchParams.append('intolerances', params.intolerances);
      
      const response = await apiRequest("GET", `/api/spoonacular/search?${searchParams.toString()}`);
      return await response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.results || []);
    }
  });

  const randomRecipesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/spoonacular/random?number=6");
      return await response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.recipes || []);
    }
  });

  const recipeDetailsMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("GET", `/api/spoonacular/recipe/${id}`);
      return await response.json();
    },
    onSuccess: (data) => {
      setSelectedRecipe(data);
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate({
        query: searchQuery,
        diet: selectedDiet,
        type: selectedType,
        intolerances: intolerances
      });
    }
  };

  const handleRandomRecipes = () => {
    randomRecipesMutation.mutate();
  };

  const handleRecipeClick = (recipe: SpoonacularRecipe) => {
    recipeDetailsMutation.mutate(recipe.id);
  };

  const getDietColor = (diet: string) => {
    const colors: { [key: string]: string } = {
      vegetarian: "bg-green-100 text-green-700",
      vegan: "bg-emerald-100 text-emerald-700",
      "gluten free": "bg-blue-100 text-blue-700",
      ketogenic: "bg-purple-100 text-purple-700",
      paleo: "bg-orange-100 text-orange-700",
      "dairy free": "bg-yellow-100 text-yellow-700"
    };
    return colors[diet.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              <span>Spoonacular Recipe Search</span>
            </div>
            <Badge className="bg-orange-100 text-orange-700">
              500,000+ Premium Recipes
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Search for recipes (e.g., 'chicken pasta', 'chocolate cake')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searchMutation.isPending}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <label className="text-sm font-medium mb-2 block">Diet</label>
                <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any diet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any diet</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="glutenFree">Gluten Free</SelectItem>
                    <SelectItem value="ketogenic">Ketogenic</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="dairyFree">Dairy Free</SelectItem>
                    <SelectItem value="lowCarb">Low Carb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Meal Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any type</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Intolerances</label>
                <Input
                  placeholder="e.g., peanut, shellfish"
                  value={intolerances}
                  onChange={(e) => setIntolerances(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleRandomRecipes}
              disabled={randomRecipesMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Random Recipes
            </Button>
            
            {searchResults.length > 0 && (
              <Badge variant="outline">
                {searchResults.length} recipes found
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((recipe) => (
            <Card 
              key={recipe.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleRecipeClick(recipe)}
            >
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-black">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    {recipe.spoonacularScore ? Math.round(recipe.spoonacularScore) : 'N/A'}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {recipe.title}
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.readyInMinutes} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  {recipe.healthScore && (
                    <div className="flex items-center space-x-1">
                      <Heart className={`w-4 h-4 ${getHealthScoreColor(recipe.healthScore)}`} />
                      <span className={getHealthScoreColor(recipe.healthScore)}>
                        {recipe.healthScore}
                      </span>
                    </div>
                  )}
                </div>

                {recipe.pricePerServing && (
                  <div className="text-sm text-green-600 mb-2">
                    ${(recipe.pricePerServing / 100).toFixed(2)} per serving
                  </div>
                )}

                {recipe.diets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.diets.slice(0, 3).map((diet) => (
                      <Badge key={diet} className={getDietColor(diet)}>
                        {diet}
                      </Badge>
                    ))}
                    {recipe.diets.length > 3 && (
                      <Badge variant="outline">
                        +{recipe.diets.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-600 line-clamp-2">
                  {recipe.summary?.replace(/<[^>]*>/g, '') || 'No description available'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white shadow-2xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {selectedRecipe.title}
              </CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setSelectedRecipe(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title}
                  className="w-full rounded-lg mb-4"
                />
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    <div className="text-sm font-medium">{selectedRecipe.readyInMinutes} min</div>
                  </div>
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-1 text-green-500" />
                    <div className="text-sm font-medium">{selectedRecipe.servings} servings</div>
                  </div>
                  <div className="text-center">
                    <Heart className="w-6 h-6 mx-auto mb-1 text-red-500" />
                    <div className="text-sm font-medium">Health: {selectedRecipe.healthScore}</div>
                  </div>
                </div>

                {selectedRecipe.nutrition && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Nutrition (per serving)</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Calories: {selectedRecipe.nutrition.calories}</div>
                      <div>Protein: {selectedRecipe.nutrition.protein}</div>
                      <div>Fat: {selectedRecipe.nutrition.fat}</div>
                      <div>Carbs: {selectedRecipe.nutrition.carbohydrates}</div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 mb-4"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedRecipe.summary 
                    }} 
                  />
                </div>

                {selectedRecipe.diets.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Dietary Information</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.diets.map((diet) => (
                        <Badge key={diet} className={getDietColor(diet)}>
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecipe.cuisines.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Cuisines</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.cuisines.map((cuisine) => (
                        <Badge key={cuisine} variant="outline">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full mt-4"
                  onClick={() => {
                    console.log('Opening Spoonacular recipe:', selectedRecipe.id);
                    window.open(`https://spoonacular.com/recipes/${selectedRecipe.title.replace(/\s+/g, '-').toLowerCase()}-${selectedRecipe.id}`, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Recipe on Spoonacular
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading States */}
      {(searchMutation.isPending || randomRecipesMutation.isPending) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}