import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Database, AlertTriangle, Leaf, Zap, Heart, Shield, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface USDAFood {
  fdcId: number;
  description: string;
  dataType?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  calories: number;
  nutritionInfo: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol?: number;
    calcium?: number;
    iron?: number;
    vitaminC?: number;
    vitaminA?: number;
  };
  allergens: string[];
  dietaryTags: string[];
}

interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export default function USDAFoodSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [minProtein, setMinProtein] = useState("");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [selectedAllergenFree, setSelectedAllergenFree] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);

  const { data: searchResult, isLoading, error } = useQuery<USDASearchResult>({
    queryKey: ['/api/usda/search', searchQuery, maxCalories, minProtein, selectedDietaryTags, selectedAllergenFree],
    queryFn: () => apiRequest('GET', '/api/usda/search', {
      params: {
        query: searchQuery,
        maxCalories: maxCalories || undefined,
        minProtein: minProtein || undefined,
        dietaryTags: selectedDietaryTags.length > 0 ? selectedDietaryTags.join(',') : undefined,
        allergenFree: selectedAllergenFree.length > 0 ? selectedAllergenFree.join(',') : undefined,
        pageSize: 25
      }
    }).then(res => res.json()),
    enabled: !!searchQuery
  });

  const foods = searchResult?.foods || [];

  const handleDietaryTagChange = (tag: string, checked: boolean) => {
    setSelectedDietaryTags(prev => 
      checked ? [...prev, tag] : prev.filter(t => t !== tag)
    );
  };

  const handleAllergenFreeChange = (allergen: string, checked: boolean) => {
    setSelectedAllergenFree(prev => 
      checked ? [...prev, allergen] : prev.filter(a => a !== allergen)
    );
  };

  const dietaryTags = [
    "vegetarian", "vegan", "gluten-free", "high-protein", 
    "high-fiber", "low-sodium", "low-fat", "dairy-free"
  ];

  const allergens = [
    "milk", "eggs", "fish", "shellfish", "tree nuts", 
    "peanuts", "wheat", "soy"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is automatically triggered by the query
  };

  // Check if error is due to missing API key
  const isAPIKeyError = error && 
    ((error as any)?.message?.includes('USDA API key') || 
     (error as any)?.status === 401);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            USDA Food Database Search
          </CardTitle>
          <CardDescription>
            Search the official USDA FoodData Central database for authentic nutrition information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAPIKeyError && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                USDA API key required. Please contact your administrator to set up access to the USDA FoodData Central API.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2"
                  onClick={() => window.open('https://fdc.nal.usda.gov/api-key-signup/', '_blank')}
                >
                  Get API Key <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search foods (e.g., 'organic apple', 'ground beef', 'whole wheat bread')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={!searchQuery || isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxCalories">Max Calories per serving</Label>
                    <Input
                      id="maxCalories"
                      type="number"
                      placeholder="e.g., 200"
                      value={maxCalories}
                      onChange={(e) => setMaxCalories(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minProtein">Min Protein (g)</Label>
                    <Input
                      id="minProtein"
                      type="number"
                      placeholder="e.g., 10"
                      value={minProtein}
                      onChange={(e) => setMinProtein(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Dietary Preferences</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {dietaryTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dietary-${tag}`}
                          checked={selectedDietaryTags.includes(tag)}
                          onCheckedChange={(checked) => 
                            handleDietaryTagChange(tag, checked as boolean)
                          }
                        />
                        <Label htmlFor={`dietary-${tag}`} className="text-sm capitalize">
                          {tag.replace('-', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Allergen-Free</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {allergens.map((allergen) => (
                      <div key={allergen} className="flex items-center space-x-2">
                        <Checkbox
                          id={`allergen-${allergen}`}
                          checked={selectedAllergenFree.includes(allergen)}
                          onCheckedChange={(checked) => 
                            handleAllergenFreeChange(allergen, checked as boolean)
                          }
                        />
                        <Label htmlFor={`allergen-${allergen}`} className="text-sm capitalize">
                          {allergen.replace(' ', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </form>
        </CardContent>
      </Card>

      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {searchResult.totalHits} foods in USDA database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {foods.map((food) => (
                <Card key={food.fdcId} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedFood(food)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{food.description}</h3>
                        {food.brandOwner && (
                          <p className="text-sm text-muted-foreground mb-2">
                            by {food.brandOwner}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {food.dietaryTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Leaf className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {food.allergens.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Contains: {food.allergens.join(', ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{food.calories}</div>
                        <div className="text-sm text-muted-foreground">calories</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{food.nutritionInfo.protein}g</div>
                        <div className="text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{food.nutritionInfo.carbs}g</div>
                        <div className="text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600">{food.nutritionInfo.fat}g</div>
                        <div className="text-muted-foreground">Fat</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                      <span>FDC ID: {food.fdcId}</span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        USDA Verified
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFood && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Detailed Nutrition Information
              <Button variant="outline" size="sm" onClick={() => setSelectedFood(null)}>
                Close
              </Button>
            </CardTitle>
            <CardDescription>{selectedFood.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Macronutrients
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-semibold">{selectedFood.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-semibold">{selectedFood.nutritionInfo.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbohydrates:</span>
                    <span className="font-semibold">{selectedFood.nutritionInfo.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Fat:</span>
                    <span className="font-semibold">{selectedFood.nutritionInfo.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber:</span>
                    <span className="font-semibold">{selectedFood.nutritionInfo.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sugar:</span>
                    <span className="font-semibold">{selectedFood.nutritionInfo.sugar}g</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Micronutrients & Minerals
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sodium:</span>
                    <span className="font-semibold">{selectedFood.nutritionInfo.sodium}mg</span>
                  </div>
                  {selectedFood.nutritionInfo.cholesterol && (
                    <div className="flex justify-between">
                      <span>Cholesterol:</span>
                      <span className="font-semibold">{selectedFood.nutritionInfo.cholesterol}mg</span>
                    </div>
                  )}
                  {selectedFood.nutritionInfo.calcium && (
                    <div className="flex justify-between">
                      <span>Calcium:</span>
                      <span className="font-semibold">{selectedFood.nutritionInfo.calcium}mg</span>
                    </div>
                  )}
                  {selectedFood.nutritionInfo.iron && (
                    <div className="flex justify-between">
                      <span>Iron:</span>
                      <span className="font-semibold">{selectedFood.nutritionInfo.iron}mg</span>
                    </div>
                  )}
                  {selectedFood.nutritionInfo.vitaminC && (
                    <div className="flex justify-between">
                      <span>Vitamin C:</span>
                      <span className="font-semibold">{selectedFood.nutritionInfo.vitaminC}mg</span>
                    </div>
                  )}
                  {selectedFood.nutritionInfo.vitaminA && (
                    <div className="flex justify-between">
                      <span>Vitamin A:</span>
                      <span className="font-semibold">{selectedFood.nutritionInfo.vitaminA}µg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedFood.ingredients && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Ingredients</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedFood.ingredients}
                </p>
              </div>
            )}

            {selectedFood.brandOwner && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Brand: <span className="font-medium">{selectedFood.brandOwner}</span>
                  {selectedFood.brandName && (
                    <span> • Product: <span className="font-medium">{selectedFood.brandName}</span></span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searchQuery && !isLoading && foods.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No foods found</h3>
            <p className="text-muted-foreground">
              Try a different search term or adjust your filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}