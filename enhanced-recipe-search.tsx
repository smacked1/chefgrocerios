import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ExpandedRecipeDatabase, Recipe } from "@/services/expanded-recipe-database";
import { 
  Search, 
  Clock, 
  Users, 
  Star,
  Heart,
  ChefHat,
  ExternalLink,
  Sparkles,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedRecipeSearchProps {
  onRecipeSelect?: (recipe: any) => void;
}

export function EnhancedRecipeSearch({ onRecipeSelect }: EnhancedRecipeSearchProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();
  const recipeDB = new ExpandedRecipeDatabase();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a recipe search term",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await recipeDB.getAllRecipes(searchQuery, 24);
      setSearchResults(results);
      
      toast({
        title: "Search Complete!",
        description: `Found ${results.length} recipes from multiple sources`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'themealdb':
        return <Globe className="w-4 h-4" />;
      case 'spoonacular':
        return <Star className="w-4 h-4" />;
      case 'forkify':
        return <ChefHat className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'themealdb':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'spoonacular':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'forkify':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-orange-900">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            Enhanced Recipe Search
            <Badge className="bg-green-500 text-white">Multi-Source</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for recipes (e.g., 'chicken pasta', 'chocolate cake')"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex gap-2 text-sm text-orange-700">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-600" />
              <span>TheMealDB (Free)</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-blue-600" />
              <span>Forkify (Free)</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-600" />
              <span>Spoonacular (Premium)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingSkeleton key={index} type="recipe" />
          ))}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !isSearching && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-orange-900">
              Search Results ({searchResults.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchResults([]);
                setSelectedRecipe(null);
              }}
              className="text-orange-600 border-orange-300"
            >
              Clear Results
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.map((recipe) => (
              <Card 
                key={recipe.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-orange-200 hover:border-orange-400"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={recipe.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getSourceColor(recipe.source)} flex items-center gap-1`}>
                      {getSourceIcon(recipe.source)}
                      {recipe.source}
                    </Badge>
                  </div>
                  {recipe.score && recipe.score > 15 && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 text-black flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        High Quality
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-2 line-clamp-2 text-orange-900">
                    {recipe.title}
                  </h3>
                  
                  <div className="flex justify-between items-center text-xs text-orange-700 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.readyInMinutes || 30}min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {recipe.servings || 4} servings
                    </div>
                  </div>

                  {recipe.category && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                      {recipe.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
            <CardHeader className="sticky top-0 bg-white border-b z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-orange-900">
                    {selectedRecipe.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getSourceColor(selectedRecipe.source)} flex items-center gap-1`}>
                      {getSourceIcon(selectedRecipe.source)}
                      {selectedRecipe.source}
                    </Badge>
                    {selectedRecipe.category && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        {selectedRecipe.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRecipe(null)}
                  className="text-orange-600"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <img
                src={selectedRecipe.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800'}
                alt={selectedRecipe.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock className="w-4 h-4" />
                  <span>Ready in {selectedRecipe.readyInMinutes || 30} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <Users className="w-4 h-4" />
                  <span>Serves {selectedRecipe.servings || 4} people</span>
                </div>
              </div>

              {selectedRecipe.instructions && (
                <div>
                  <h4 className="font-bold text-orange-900 mb-2">Instructions</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedRecipe.instructions}
                  </p>
                </div>
              )}

              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <div>
                  <h4 className="font-bold text-orange-900 mb-2">Ingredients</h4>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>{ingredient.original || ingredient.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    onRecipeSelect?.(selectedRecipe);
                    setSelectedRecipe(null);
                  }}
                >
                  🎤 Select for Voice Reading
                </Button>
                {selectedRecipe.sourceUrl && (
                  <Button 
                    asChild 
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <a href={selectedRecipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Recipe
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}