import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Clock, Users, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  cookTime: number;
  servings: number;
  ingredients: Array<{
    name: string;
    amount: string | number;
    unit: string;
  }>;
  instructions: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  source: string;
  category: string;
}

interface FallbackRecipeDisplayProps {
  title: string;
  showSearch?: boolean;
}

export function FallbackRecipeDisplay({ title, showSearch = true }: FallbackRecipeDisplayProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchRecipes = async (query?: string) => {
    setLoading(true);
    try {
      let url = '/api/recipes?refresh=true';
      if (query) {
        url = `/api/recipes/search?query=${encodeURIComponent(query)}&number=8`;
      }

      const response = await apiRequest('GET', url);
      
      if (Array.isArray(response)) {
        setRecipes(response);
      } else if (response.recipes && Array.isArray(response.recipes)) {
        setRecipes(response.recipes);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes. Please try again.",
        variant: "destructive",
      });
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await fetchRecipes(searchQuery.trim());
    } else {
      await fetchRecipes();
    }
  };

  const fetchRandomRecipes = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/recipes/random?number=6');
      
      if (response.recipes && Array.isArray(response.recipes)) {
        setRecipes(response.recipes);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load random recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRandomRecipes}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Random
            </Button>
          </div>
        </CardTitle>
        
        {showSearch && (
          <div className="flex gap-2">
            <Input
              placeholder="Search for recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-2 w-3/4"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recipes found. Try searching for something specific!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={recipe.image || '/api/placeholder/400/250'}
                    alt={recipe.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/400/250';
                    }}
                  />
                  <Badge 
                    className="absolute top-2 right-2 bg-white/90 text-gray-800"
                  >
                    {recipe.source === 'spoonacular' ? 'Premium' : 'Free'}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {recipe.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cookTime || 30} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings || 4} servings</span>
                    </div>
                  </div>
                  
                  {recipe.nutrition && (
                    <div className="text-xs text-gray-500 mb-3">
                      <div className="flex justify-between">
                        <span>Calories: {Math.round(recipe.nutrition.calories || 0)}</span>
                        <span>Protein: {Math.round(recipe.nutrition.protein || 0)}g</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {recipe.category}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Recipe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {recipes.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-500">
            Showing {recipes.length} recipes from {recipes[0]?.source === 'spoonacular' ? 'Spoonacular (Premium)' : 'TheMealDB (Free)'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}