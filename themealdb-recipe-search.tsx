import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Clock, Users, ChefHat, Shuffle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RecipeAIInstructions } from './recipe-ai-instructions';
import { AddToGroceryList } from './add-to-grocery-list';

interface TheMealDBRecipe {
  id: string;
  title: string;
  name: string;
  description: string;
  instructions: string;
  image: string;
  category: string;
  cuisine: string;
  ingredients: { name: string; amount: string; unit: string; }[];
  readyInMinutes: number;
  servings: number;
  source: string;
}

export function TheMealDBRecipeSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [recipes, setRecipes] = useState<TheMealDBRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<TheMealDBRecipe | null>(null);

  const cuisines = [
    'American', 'British', 'Canadian', 'Chinese', 'Croatian', 'Dutch', 'Egyptian', 
    'Filipino', 'French', 'Greek', 'Indian', 'Irish', 'Italian', 'Jamaican', 
    'Japanese', 'Kenyan', 'Malaysian', 'Mexican', 'Moroccan', 'Polish', 
    'Portuguese', 'Russian', 'Spanish', 'Thai', 'Tunisian', 'Turkish', 'Vietnamese'
  ];

  const searchRecipes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCuisine) params.append('cuisine', selectedCuisine);
      
      const response = await fetch(`/api/themealdb/search?${params}`);
      const data = await response.json();
      setRecipes(data.results || []);
    } catch (error) {
      console.error('Recipe search error:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomRecipe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/themealdb/random');
      const recipe = await response.json();
      if (recipe) {
        setRecipes([recipe]);
        setSelectedRecipe(recipe);
      }
    } catch (error) {
      console.error('Random recipe error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchRecipes();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <ChefHat className="h-8 w-8 text-orange-500" />
          Free Recipe Search
        </h2>
        <p className="text-muted-foreground">
          Discover 306+ delicious recipes from around the world - completely free!
        </p>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          No API Key Required
        </Badge>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            placeholder="Search recipes (e.g., 'chicken curry', 'pasta', 'dessert')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12"
          />
        </div>
        <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
          <SelectTrigger className="w-48 h-12">
            <SelectValue placeholder="Any cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any cuisine</SelectItem>
            {cuisines.map(cuisine => (
              <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="h-12 px-6"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={getRandomRecipe}
          disabled={isLoading}
          className="h-12 px-6"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Random
        </Button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching for delicious recipes...</p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card 
              key={recipe.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/recipe-image";
                    e.currentTarget.alt = "Recipe placeholder";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-black/70 text-white">{recipe.category}</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {recipe.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {recipe.readyInMinutes} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {recipe.servings} servings
                  </div>
                </div>
                <Badge variant="outline" className="mt-2">
                  {recipe.cuisine} Cuisine
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && recipes.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recipes found. Try a different search term or cuisine.</p>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.title}
                className="w-full h-64 object-cover"
              />
              <Button 
                variant="outline" 
                size="icon"
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedRecipe(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedRecipe.title}</h3>
                  <div className="flex gap-2 mb-4">
                    <Badge>{selectedRecipe.category}</Badge>
                    <Badge variant="outline">{selectedRecipe.cuisine}</Badge>
                    <Badge variant="secondary">TheMealDB</Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold mb-3">Ingredients ({selectedRecipe.ingredients.length})</h4>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{ingredient.name}</span>
                        <span className="text-muted-foreground">{ingredient.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold mb-3">Basic Instructions</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line">{selectedRecipe.instructions}</p>
                  </div>
                </div>
              </div>

              {/* AI Recipe Instructions */}
              <div className="mt-6">
                <RecipeAIInstructions 
                  recipe={{
                    name: selectedRecipe.title,
                    ingredients: selectedRecipe.ingredients.map(ing => `${ing.amount} ${ing.name}`),
                    instructions: selectedRecipe.instructions.split('\n').filter(step => step.trim()),
                    prepTime: "15 mins",
                    cookTime: `${selectedRecipe.readyInMinutes} mins`,
                    servings: selectedRecipe.servings,
                    difficulty: "Medium"
                  }}
                />
              </div>

              {/* Add Ingredients to Grocery List */}
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Ingredients to Grocery List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <AddToGroceryList
                          key={index}
                          productName={ingredient.name}
                          category="Recipe Ingredients"
                          onAdded={() => {}}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}