import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationHeader } from '@/components/navigation-header';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Utensils,
  Apple,
  FlaskConical
} from 'lucide-react';

interface NinjasNutrition {
  name: string;
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  protein_g: number;
  carbohydrates_total_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  dataType: string;
  foodNutrients: Array<{
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
}

export default function NutritionAnalysis() {
  const [ninjaQuery, setNinjaQuery] = useState('');
  const [usdaQuery, setUsdaQuery] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState('');
  const [ninjaResults, setNinjaResults] = useState<NinjasNutrition[]>([]);
  const [usdaResults, setUsdaResults] = useState<USDAFood[]>([]);
  const [recipeNutrition, setRecipeNutrition] = useState<any>(null);
  const { toast } = useToast();

  const ninjaMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('POST', '/api/ninjas/nutrition', { query });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setNinjaResults(data.data);
        toast({
          title: "Smart Nutrition Analysis Complete",
          description: `Found detailed nutrition data for "${ninjaQuery}"`,
        });
      } else {
        toast({
          title: "No Results",
          description: data.error || "No nutrition data found",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze nutrition data",
        variant: "destructive"
      });
    }
  });

  const usdaMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('POST', '/api/usda/search', { 
        query, 
        pageSize: 5 
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data?.foods) {
        setUsdaResults(data.data.foods);
        toast({
          title: "USDA Database Search Complete",
          description: `Found ${data.data.foods.length} official government records`,
        });
      } else {
        toast({
          title: "No USDA Results",
          description: data.error || "No official data found",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "USDA Search Failed",
        description: "Could not search government database",
        variant: "destructive"
      });
    }
  });

  const recipeMutation = useMutation({
    mutationFn: async (ingredients: string[]) => {
      const response = await apiRequest('POST', '/api/ninjas/recipe-nutrition', { 
        ingredients 
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setRecipeNutrition(data);
        toast({
          title: "Recipe Analysis Complete",
          description: "Comprehensive nutrition breakdown calculated",
        });
      } else {
        toast({
          title: "Recipe Analysis Failed",
          description: data.error || "Could not analyze recipe",
          variant: "destructive"
        });
      }
    }
  });

  const handleNinjaSearch = () => {
    if (!ninjaQuery.trim()) return;
    ninjaMutation.mutate(ninjaQuery);
  };

  const handleUsdaSearch = () => {
    if (!usdaQuery.trim()) return;
    usdaMutation.mutate(usdaQuery);
  };

  const handleRecipeAnalysis = () => {
    if (!recipeIngredients.trim()) return;
    const ingredients = recipeIngredients
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);
    recipeMutation.mutate(ingredients);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <NavigationHeader 
        title="Nutrition Analysis" 
        description="Professional-grade nutrition data"
        backHref="/"
      />
      
      <div className="container mx-auto px-4 py-8">

      <Tabs defaultValue="smart-parsing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smart-parsing" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Parsing
          </TabsTrigger>
          <TabsTrigger value="usda-official" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            USDA Official
          </TabsTrigger>
          <TabsTrigger value="recipe-analysis" className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Recipe Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smart-parsing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                API Ninjas Smart Parsing
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Natural language nutrition parsing - "1 cup cooked pasta", "2 slices bread"
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., '1 cup cooked rice' or '2 medium apples'"
                  value={ninjaQuery}
                  onChange={(e) => setNinjaQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNinjaSearch()}
                />
                <Button 
                  onClick={handleNinjaSearch}
                  disabled={ninjaMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {ninjaMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Natural language processing - type portions in plain English</p>
                <p>✓ 100K+ requests/month free tier - powered by API Ninjas</p>
                <p>✓ Instant nutrition facts for any food description</p>
              </div>

              {ninjaResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Smart Nutrition Results</h3>
                  {ninjaResults.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-lg">{item.name}</h4>
                        <Badge variant="secondary">{item.serving_size_g}g serving</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <div className="font-bold text-orange-600">{item.calories}</div>
                          <div className="text-muted-foreground">Calories</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <div className="font-bold text-blue-600">{item.protein_g}g</div>
                          <div className="text-muted-foreground">Protein</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <div className="font-bold text-green-600">{item.carbohydrates_total_g}g</div>
                          <div className="text-muted-foreground">Carbs</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          <div className="font-bold text-purple-600">{item.fat_total_g}g</div>
                          <div className="text-muted-foreground">Fat</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center mt-3">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          🧠 AI-Powered Smart Analysis
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usda-official">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-500" />
                USDA Official Database
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Official US government nutrition data - 1.9M+ verified food products
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 'apple', 'chicken breast', 'brown rice'"
                  value={usdaQuery}
                  onChange={(e) => setUsdaQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUsdaSearch()}
                />
                <Button 
                  onClick={handleUsdaSearch}
                  disabled={usdaMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {usdaMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Official US Department of Agriculture nutrition database</p>
                <p>✓ 3,600 requests/hour free tier - government-verified data</p>
                <p>✓ Foundation Foods, Survey data, and SR Legacy database</p>
              </div>

              {usdaResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">USDA Official Results</h3>
                  {usdaResults.map((food, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{food.description}</h4>
                          {food.brandOwner && (
                            <p className="text-sm text-muted-foreground">Brand: {food.brandOwner}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">FDC #{food.fdcId}</Badge>
                          <Badge variant="secondary" className="ml-1">{food.dataType}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {food.foodNutrients.slice(0, 6).map((nutrient, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                            <div className="font-bold text-blue-600">
                              {nutrient.value.toFixed(1)} {nutrient.unitName}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {nutrient.nutrientName}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-center mt-3">
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          🇺🇸 USDA Official Data
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipe-analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-green-500" />
                Complete Recipe Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyze entire recipes - get comprehensive nutrition totals
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter recipe ingredients (one per line)&#10;e.g.:&#10;2 cups flour&#10;1 cup milk&#10;2 eggs&#10;1 tsp salt"
                value={recipeIngredients}
                onChange={(e) => setRecipeIngredients(e.target.value)}
                rows={6}
              />
              
              <Button 
                onClick={handleRecipeAnalysis}
                disabled={recipeMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {recipeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing Recipe...</>
                ) : (
                  <><Utensils className="w-4 h-4 mr-2" /> Analyze Complete Recipe</>
                )}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Complete recipe nutrition analysis with total calculations</p>
                <p>✓ Ingredient-by-ingredient breakdown with smart parsing</p>
                <p>✓ Perfect for meal planning and dietary tracking</p>
              </div>

              {recipeNutrition?.success && recipeNutrition.totalNutrition && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Complete Recipe Nutrition</h3>
                  
                  <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <h4 className="font-medium text-lg mb-3">Total Recipe Nutrition</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                        <div className="font-bold text-2xl text-orange-600">
                          {Math.round(recipeNutrition.totalNutrition.calories)}
                        </div>
                        <div className="text-muted-foreground">Total Calories</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                        <div className="font-bold text-xl text-blue-600">
                          {Math.round(recipeNutrition.totalNutrition.protein)}g
                        </div>
                        <div className="text-muted-foreground">Protein</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                        <div className="font-bold text-xl text-green-600">
                          {Math.round(recipeNutrition.totalNutrition.carbs)}g
                        </div>
                        <div className="text-muted-foreground">Carbohydrates</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                        <div className="font-bold text-xl text-purple-600">
                          {Math.round(recipeNutrition.totalNutrition.fat)}g
                        </div>
                        <div className="text-muted-foreground">Fat</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        🍳 Complete Recipe Analysis
                      </Badge>
                    </div>
                  </div>

                  {recipeNutrition.ingredientDetails && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Individual Ingredients</h4>
                      {recipeNutrition.ingredientDetails.map((ingredient: NinjasNutrition, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-medium">{ingredient.name}</span>
                          <div className="text-sm text-muted-foreground">
                            {ingredient.calories} cal • {ingredient.protein_g}g protein
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}