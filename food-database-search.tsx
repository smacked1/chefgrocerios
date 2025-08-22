import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Apple, 
  Wheat, 
  Fish, 
  Coffee,
  Utensils,
  Zap,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  ExternalLink,
  Truck
} from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  brand?: string;
  servingSize: string;
  calories: number;
  nutritionInfo: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol?: number;
    potassium?: number;
    vitaminA?: number;
    vitaminC?: number;
    calcium?: number;
    iron?: number;
  };
  allergens: string[];
  dietaryTags: string[];
  averagePrice?: string;
  seasonality?: string;
  storageInstructions?: string;
  shelfLife?: string;
  preparationTips: string[];
  commonUses: string[];
  isOrganic: boolean;
}

export function FoodDatabaseSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [maxCalories, setMaxCalories] = useState<string>("");
  const [allergenFree, setAllergenFree] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Handle category selection properly
  const actualCategory = selectedCategory === 'all' ? '' : selectedCategory;

  const { data: foods = [], isLoading, refetch } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-database', { 
      q: searchQuery, 
      category: actualCategory,
      maxCalories: maxCalories ? parseInt(maxCalories) : undefined,
      dietaryTags: selectedDietaryTags.join(','),
      allergenFree: allergenFree.join(',')
    }],
    enabled: false // Only search when explicitly triggered
  });

  const deliveryMutation = useMutation({
    mutationFn: async ({ foodItems, location }: { foodItems: string[]; location: string }) => {
      const response = await apiRequest("POST", "/api/ai/delivery-options", { foodItems, location });
      return await response.json();
    }
  });

  const nutritionMutation = useMutation({
    mutationFn: async ({ foodName, quantity }: { foodName: string; quantity: string }) => {
      const response = await apiRequest("POST", "/api/ai/detailed-nutrition", { foodName, quantity });
      return await response.json();
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      refetch();
    }
  };

  const handleFindDelivery = (foodName: string) => {
    const location = "New York, NY"; // Default location - could be user's location
    deliveryMutation.mutate({ foodItems: [foodName], location });
  };

  const handleGetNutrition = (food: FoodItem) => {
    nutritionMutation.mutate({ foodName: food.name, quantity: food.servingSize });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fruits': return <Apple className="w-4 h-4 text-red-500" />;
      case 'vegetables': return <Apple className="w-4 h-4 text-green-500" />;
      case 'grains': return <Wheat className="w-4 h-4 text-yellow-600" />;
      case 'proteins': return <Fish className="w-4 h-4 text-blue-600" />;
      case 'dairy': return <Coffee className="w-4 h-4 text-blue-400" />;
      default: return <Utensils className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNutritionScore = (nutrition: FoodItem['nutritionInfo']) => {
    // Simple nutrition score calculation
    const proteinScore = Math.min(nutrition.protein / 25 * 100, 100);
    const fiberScore = Math.min(nutrition.fiber / 10 * 100, 100);
    const sugarPenalty = Math.max(0, 100 - (nutrition.sugar / 20 * 100));
    return Math.round((proteinScore + fiberScore + sugarPenalty) / 3);
  };

  const categories = [
    { value: "fruits", label: "Fruits" },
    { value: "vegetables", label: "Vegetables" },
    { value: "proteins", label: "Proteins" },
    { value: "grains", label: "Grains" },
    { value: "dairy", label: "Dairy" },
    { value: "nuts", label: "Nuts & Seeds" },
    { value: "oils", label: "Oils & Fats" },
    { value: "beverages", label: "Beverages" },
    { value: "snacks", label: "Snacks" },
    { value: "condiments", label: "Condiments" }
  ];

  const dietaryTags = [
    "vegan", "vegetarian", "gluten_free", "keto", "paleo", 
    "low_carb", "high_protein", "organic", "non_gmo"
  ];

  const commonAllergens = [
    "milk", "eggs", "fish", "shellfish", "nuts", 
    "peanuts", "wheat", "soy"
  ];

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-6 h-6 text-blue-600" />
            <span>Food Database Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Search for foods (e.g., 'avocado', 'salmon', 'quinoa')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.filter(category => category.value && category.value.trim()).map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Max Calories</label>
                <Input
                  type="number"
                  placeholder="e.g., 300"
                  value={maxCalories}
                  onChange={(e) => setMaxCalories(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Dietary Tags</label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {dietaryTags.map(tag => (
                    <label key={tag} className="flex items-center space-x-1 text-xs">
                      <Checkbox
                        checked={selectedDietaryTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDietaryTags([...selectedDietaryTags, tag]);
                          } else {
                            setSelectedDietaryTags(selectedDietaryTags.filter(t => t !== tag));
                          }
                        }}
                      />
                      <span>{tag.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Allergen-Free</label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {commonAllergens.map(allergen => (
                    <label key={allergen} className="flex items-center space-x-1 text-xs">
                      <Checkbox
                        checked={allergenFree.includes(allergen)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAllergenFree([...allergenFree, allergen]);
                          } else {
                            setAllergenFree(allergenFree.filter(a => a !== allergen));
                          }
                        }}
                      />
                      <span>{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {foods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => (
            <Card key={food.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedFood(food)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      {getCategoryIcon(food.category)}
                      <CardTitle className="text-lg">{food.name}</CardTitle>
                      {food.isOrganic && (
                        <Badge className="bg-green-100 text-green-700 text-xs">Organic</Badge>
                      )}
                    </div>
                    {food.brand && (
                      <p className="text-sm text-gray-600">{food.brand}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">{food.calories}</div>
                    <div className="text-xs text-gray-500">calories</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Serving Size & Price */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Serving: {food.servingSize}</span>
                    {food.averagePrice && (
                      <span className="font-medium text-green-600">{food.averagePrice}</span>
                    )}
                  </div>

                  {/* Nutrition Overview */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="font-bold text-red-600">{food.nutritionInfo.protein}g</div>
                      <div className="text-gray-500">Protein</div>
                    </div>
                    <div>
                      <div className="font-bold text-yellow-600">{food.nutritionInfo.carbs}g</div>
                      <div className="text-gray-500">Carbs</div>
                    </div>
                    <div>
                      <div className="font-bold text-blue-600">{food.nutritionInfo.fat}g</div>
                      <div className="text-gray-500">Fat</div>
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  {food.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {food.dietaryTags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag.replace('_', ' ')}
                        </Badge>
                      ))}
                      {food.dietaryTags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{food.dietaryTags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Allergens Warning */}
                  {food.allergens.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Contains: {food.allergens.join(', ')}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetNutrition(food);
                      }}
                      disabled={nutritionMutation.isPending}
                      className="flex-1 text-xs"
                    >
                      <Activity className="w-3 h-3 mr-1" />
                      Nutrition
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFindDelivery(food.name);
                      }}
                      disabled={deliveryMutation.isPending}
                      className="flex-1 text-xs"
                    >
                      <Truck className="w-3 h-3 mr-1" />
                      Delivery
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Nutrition Results */}
      {nutritionMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Detailed Nutrition Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Macronutrients</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Calories</span>
                    <span className="font-bold">{nutritionMutation.data.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein</span>
                    <span className="font-bold">{nutritionMutation.data.macros.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbohydrates</span>
                    <span className="font-bold">{nutritionMutation.data.macros.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat</span>
                    <span className="font-bold">{nutritionMutation.data.macros.fat}g</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Micronutrients</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Fiber</span>
                    <span>{nutritionMutation.data.micros.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sugar</span>
                    <span>{nutritionMutation.data.micros.sugar}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sodium</span>
                    <span>{nutritionMutation.data.micros.sodium}mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitamin C</span>
                    <span>{nutritionMutation.data.micros.vitaminC}mg ({nutritionMutation.data.dailyValues.vitaminC}% DV)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Iron</span>
                    <span>{nutritionMutation.data.micros.iron}mg ({nutritionMutation.data.dailyValues.iron}% DV)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Options */}
      {deliveryMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-green-600" />
              <span>Delivery Options</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {deliveryMutation.data.map((option: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{option.restaurantName}</h4>
                      <p className="text-gray-600">{option.itemName}</p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{option.price}</div>
                      <div className="text-sm text-gray-500">{option.deliveryTime}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-700">
                        {option.serviceName}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Delivery: {option.deliveryFee}
                      </span>
                      {option.calories && (
                        <span className="text-sm text-gray-600">
                          {option.calories} cal
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {option.doordashUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(option.doordashUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          DoorDash
                        </Button>
                      )}
                      {option.grubhubUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(option.grubhubUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Grubhub
                        </Button>
                      )}
                      {option.ubereatsUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(option.ubereatsUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Uber Eats
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Food Detail Modal */}
      {selectedFood && (
        <Card className="fixed inset-0 z-50 bg-white overflow-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center space-x-2">
                  {getCategoryIcon(selectedFood.category)}
                  <span>{selectedFood.name}</span>
                  {selectedFood.isOrganic && (
                    <Badge className="bg-green-100 text-green-700">Organic</Badge>
                  )}
                </CardTitle>
                {selectedFood.brand && (
                  <p className="text-gray-600 mt-1">{selectedFood.brand}</p>
                )}
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedFood(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{selectedFood.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Serving Size:</span>
                      <span className="font-medium">{selectedFood.servingSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span className="font-bold text-orange-600">{selectedFood.calories}</span>
                    </div>
                    {selectedFood.averagePrice && (
                      <div className="flex justify-between">
                        <span>Average Price:</span>
                        <span className="font-medium text-green-600">{selectedFood.averagePrice}</span>
                      </div>
                    )}
                    {selectedFood.seasonality && (
                      <div className="flex justify-between">
                        <span>Season:</span>
                        <span className="font-medium">{selectedFood.seasonality.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Storage & Shelf Life */}
                {(selectedFood.storageInstructions || selectedFood.shelfLife) && (
                  <div>
                    <h3 className="font-semibold mb-2">Storage Information</h3>
                    {selectedFood.storageInstructions && (
                      <p className="text-sm text-gray-600 mb-2">{selectedFood.storageInstructions}</p>
                    )}
                    {selectedFood.shelfLife && (
                      <p className="text-sm text-gray-600">Shelf life: {selectedFood.shelfLife}</p>
                    )}
                  </div>
                )}

                {/* Tips & Uses */}
                <div className="space-y-3">
                  {selectedFood.preparationTips.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Preparation Tips</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedFood.preparationTips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedFood.commonUses.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Common Uses</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedFood.commonUses.map((use, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Nutrition */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Complete Nutrition Facts</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Macronutrients</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Protein:</span>
                            <span className="font-medium">{selectedFood.nutritionInfo.protein}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carbs:</span>
                            <span className="font-medium">{selectedFood.nutritionInfo.carbs}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fat:</span>
                            <span className="font-medium">{selectedFood.nutritionInfo.fat}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fiber:</span>
                            <span className="font-medium">{selectedFood.nutritionInfo.fiber}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sugar:</span>
                            <span className="font-medium">{selectedFood.nutritionInfo.sugar}g</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-blue-600">Micronutrients</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Sodium:</span>
                            <span className="font-medium">{selectedFood.nutritionInfo.sodium}mg</span>
                          </div>
                          {selectedFood.nutritionInfo.potassium && (
                            <div className="flex justify-between">
                              <span>Potassium:</span>
                              <span className="font-medium">{selectedFood.nutritionInfo.potassium}mg</span>
                            </div>
                          )}
                          {selectedFood.nutritionInfo.vitaminC && (
                            <div className="flex justify-between">
                              <span>Vitamin C:</span>
                              <span className="font-medium">{selectedFood.nutritionInfo.vitaminC}mg</span>
                            </div>
                          )}
                          {selectedFood.nutritionInfo.calcium && (
                            <div className="flex justify-between">
                              <span>Calcium:</span>
                              <span className="font-medium">{selectedFood.nutritionInfo.calcium}mg</span>
                            </div>
                          )}
                          {selectedFood.nutritionInfo.iron && (
                            <div className="flex justify-between">
                              <span>Iron:</span>
                              <span className="font-medium">{selectedFood.nutritionInfo.iron}mg</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dietary Tags & Allergens */}
                <div className="space-y-3">
                  {selectedFood.dietaryTags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Dietary Information</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedFood.dietaryTags.map((tag, index) => (
                          <Badge key={index} className="bg-green-100 text-green-700 text-xs">
                            {tag.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedFood.allergens.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-600">Allergen Information</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Contains: {selectedFood.allergens.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => handleGetNutrition(selectedFood)}
                    disabled={nutritionMutation.isPending}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Get Detailed Analysis
                  </Button>
                  <Button
                    onClick={() => handleFindDelivery(selectedFood.name)}
                    disabled={deliveryMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Find Delivery Options
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}