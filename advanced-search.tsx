import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  ChefHat, 
  Apple, 
  ShoppingCart,
  MapPin,
  Utensils,
  Truck,
  DollarSign
} from "lucide-react";

interface AdvancedSearchProps {
  onResultsUpdate?: (results: any[]) => void;
}

interface SearchFilters {
  query: string;
  category: string;
  dietaryRestrictions: string[];
  allergens: string[];
  maxCalories: number;
  minProtein: number;
  maxCookTime: number;
  difficulty: string;
  budget: number[];
  cuisine: string;
  mealType: string;
  servings: number;
}

const dietaryOptions = [
  "vegetarian", "vegan", "gluten-free", "keto", "paleo", "low-carb", 
  "dairy-free", "nut-free", "low-sodium", "sugar-free"
];

const allergenOptions = [
  "milk", "eggs", "fish", "shellfish", "tree nuts", "peanuts", 
  "wheat", "soybeans", "sesame"
];

const cuisineOptions = [
  "american", "italian", "mexican", "chinese", "indian", "japanese", 
  "thai", "mediterranean", "french", "korean", "vietnamese", "greek"
];

const mealTypeOptions = ["breakfast", "lunch", "dinner", "snack", "dessert"];
const difficultyOptions = ["easy", "medium", "hard"];

export default function AdvancedSearch({ onResultsUpdate }: AdvancedSearchProps) {
  const [searchType, setSearchType] = useState<"recipes" | "foods" | "stores" | "restaurants">("recipes");
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "any",
    dietaryRestrictions: [],
    allergens: [],
    maxCalories: 1000,
    minProtein: 0,
    maxCookTime: 60,
    difficulty: "any",
    budget: [0, 50],
    cuisine: "any",
    mealType: "any",
    servings: 4
  });

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Search recipes using TheMealDB (free alternative)
  const searchRecipes = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      
      const response = await fetch(`/api/recipes/search?${params}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Recipe search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Search foods (USDA)
  const searchFoods = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.maxCalories < 1000) params.append('maxCalories', filters.maxCalories.toString());
      if (filters.minProtein > 0) params.append('minProtein', filters.minProtein.toString());
      if (filters.allergens.length > 0) {
        params.append('allergenFree', filters.allergens.join(','));
      }
      if (filters.dietaryRestrictions.length > 0) {
        params.append('dietaryTags', filters.dietaryRestrictions.join(','));
      }
      
      const response = await fetch(`/api/usda/search?${params}`);
      const data = await response.json();
      return data.foods || [];
    } catch (error) {
      console.error('Food search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Search stores
  const searchStores = async () => {
    const response = await fetch('/api/stores');
    const stores = await response.json();
    
    if (!filters.query) return stores;
    
    return stores.filter((store: any) => 
      store.name.toLowerCase().includes(filters.query.toLowerCase()) ||
      store.address.toLowerCase().includes(filters.query.toLowerCase())
    );
  };

  // Search restaurants
  const searchRestaurants = async () => {
    const response = await fetch('/api/restaurant-menu');
    const items = await response.json();
    
    if (!filters.query) return items;
    
    return items.filter((item: any) => 
      item.name.toLowerCase().includes(filters.query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(filters.query.toLowerCase()))
    );
  };

  const handleSearch = async () => {
    let searchResults = [];
    
    switch (searchType) {
      case "recipes":
        searchResults = await searchRecipes();
        break;
      case "foods":
        searchResults = await searchFoods();
        break;
      case "stores":
        searchResults = await searchStores();
        break;
      case "restaurants":
        searchResults = await searchRestaurants();
        break;
    }
    
    setResults(searchResults);
    if (onResultsUpdate) {
      onResultsUpdate(searchResults);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    // Convert "any" back to empty string for proper filtering
    const actualValue = value === "any" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
  };

  const toggleArrayFilter = (key: 'dietaryRestrictions' | 'allergens', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "any",
      dietaryRestrictions: [],
      allergens: [],
      maxCalories: 1000,
      minProtein: 0,
      maxCookTime: 60,
      difficulty: "any",
      budget: [0, 50],
      cuisine: "any",
      mealType: "any",
      servings: 4
    });
    setResults([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Advanced Search</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Type Tabs */}
        <Tabs value={searchType} onValueChange={(value: any) => setSearchType(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recipes" className="flex items-center space-x-1">
              <ChefHat className="h-4 w-4" />
              <span>Recipes</span>
            </TabsTrigger>
            <TabsTrigger value="foods" className="flex items-center space-x-1">
              <Apple className="h-4 w-4" />
              <span>Foods</span>
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Stores</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center space-x-1">
              <Utensils className="h-4 w-4" />
              <span>Restaurants</span>
            </TabsTrigger>
          </TabsList>

          {/* Main Search Input */}
          <div className="flex space-x-2 mt-4">
            <Input
              placeholder={`Search ${searchType}...`}
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>

          {/* Recipe Filters */}
          <TabsContent value="recipes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Cuisine */}
              <div>
                <Label>Cuisine</Label>
                <Select value={filters.cuisine} onValueChange={(value) => updateFilter('cuisine', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any cuisine</SelectItem>
                    {cuisineOptions.map(cuisine => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meal Type */}
              <div>
                <Label>Meal Type</Label>
                <Select value={filters.mealType} onValueChange={(value) => updateFilter('mealType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any meal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any meal</SelectItem>
                    {mealTypeOptions.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div>
                <Label>Difficulty</Label>
                <Select value={filters.difficulty} onValueChange={(value) => updateFilter('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any difficulty</SelectItem>
                    {difficultyOptions.map(diff => (
                      <SelectItem key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cook Time Slider */}
            <div>
              <Label>Max Cook Time: {filters.maxCookTime} minutes</Label>
              <Slider
                value={[filters.maxCookTime]}
                onValueChange={([value]) => updateFilter('maxCookTime', value)}
                max={120}
                min={5}
                step={5}
                className="mt-2"
              />
            </div>

            {/* Servings */}
            <div>
              <Label>Servings: {filters.servings}</Label>
              <Slider
                value={[filters.servings]}
                onValueChange={([value]) => updateFilter('servings', value)}
                max={12}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </TabsContent>

          {/* Food Filters */}
          <TabsContent value="foods" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Calories */}
              <div>
                <Label>Max Calories: {filters.maxCalories}</Label>
                <Slider
                  value={[filters.maxCalories]}
                  onValueChange={([value]) => updateFilter('maxCalories', value)}
                  max={2000}
                  min={50}
                  step={50}
                  className="mt-2"
                />
              </div>

              {/* Protein */}
              <div>
                <Label>Min Protein: {filters.minProtein}g</Label>
                <Slider
                  value={[filters.minProtein]}
                  onValueChange={([value]) => updateFilter('minProtein', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          {/* Store Filters */}
          <TabsContent value="stores" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Budget Range */}
              <div>
                <Label>Budget Range: ${filters.budget[0]} - ${filters.budget[1]}</Label>
                <Slider
                  value={filters.budget}
                  onValueChange={(value) => updateFilter('budget', value)}
                  max={200}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          {/* Restaurant Filters */}
          <TabsContent value="restaurants" className="space-y-4">
            <div className="text-sm text-gray-600">
              Search restaurant menu items by name or description
            </div>
          </TabsContent>
        </Tabs>

        {/* Dietary Restrictions */}
        <div>
          <Label className="text-base font-medium">Dietary Restrictions</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {dietaryOptions.map(diet => (
              <div key={diet} className="flex items-center space-x-2">
                <Checkbox
                  id={diet}
                  checked={filters.dietaryRestrictions.includes(diet)}
                  onCheckedChange={() => toggleArrayFilter('dietaryRestrictions', diet)}
                />
                <Label htmlFor={diet} className="text-sm">
                  {diet.charAt(0).toUpperCase() + diet.slice(1)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Allergens to Avoid */}
        <div>
          <Label className="text-base font-medium">Allergens to Avoid</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {allergenOptions.map(allergen => (
              <div key={allergen} className="flex items-center space-x-2">
                <Checkbox
                  id={allergen}
                  checked={filters.allergens.includes(allergen)}
                  onCheckedChange={() => toggleArrayFilter('allergens', allergen)}
                />
                <Label htmlFor={allergen} className="text-sm">
                  {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(filters.dietaryRestrictions.length > 0 || filters.allergens.length > 0 || filters.cuisine || filters.mealType) && (
          <div>
            <Label className="text-base font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.dietaryRestrictions.map(diet => (
                <Badge key={diet} variant="secondary" className="cursor-pointer" 
                       onClick={() => toggleArrayFilter('dietaryRestrictions', diet)}>
                  {diet} ×
                </Badge>
              ))}
              {filters.allergens.map(allergen => (
                <Badge key={allergen} variant="destructive" className="cursor-pointer"
                       onClick={() => toggleArrayFilter('allergens', allergen)}>
                  No {allergen} ×
                </Badge>
              ))}
              {filters.cuisine && (
                <Badge variant="outline" className="cursor-pointer"
                       onClick={() => updateFilter('cuisine', 'any')}>
                  {filters.cuisine} ×
                </Badge>
              )}
              {filters.mealType && (
                <Badge variant="outline" className="cursor-pointer"
                       onClick={() => updateFilter('mealType', 'any')}>
                  {filters.mealType} ×
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        {results.length > 0 && (
          <div className="text-sm text-gray-600">
            Found {results.length} {searchType} matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
}