import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Utensils, Calendar, ShoppingCart, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GeminiAIPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  // Recipe generation
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [recipeCuisine, setRecipeCuisine] = useState("");

  // Meal planning
  const [mealPlanDays, setMealPlanDays] = useState(7);
  const [mealPlanBudget, setMealPlanBudget] = useState("");

  // Nutrition analysis
  const [nutritionFood, setNutritionFood] = useState("");
  const [nutritionQuantity, setNutritionQuantity] = useState("");

  // Voice command
  const [voiceCommand, setVoiceCommand] = useState("");

  // Shopping suggestions
  const [groceryItems, setGroceryItems] = useState("");

  const generateRecipe = async () => {
    if (!recipeIngredients.trim()) {
      toast({ title: "Please enter ingredients", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini/recipe/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: recipeIngredients.split(",").map(i => i.trim()),
          cuisine: recipeCuisine || undefined,
          servings: 4,
          difficulty: "medium"
        })
      });

      const data = await response.json();
      setResults({ type: "recipe", data });
      toast({ title: "Recipe generated successfully!" });
    } catch (error) {
      toast({ title: "Failed to generate recipe", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const generateMealPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini/meal-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: mealPlanDays,
          budget: mealPlanBudget ? parseFloat(mealPlanBudget) : undefined,
          preferences: ["healthy", "balanced"]
        })
      });

      const data = await response.json();
      setResults({ type: "mealPlan", data });
      toast({ title: "Meal plan generated successfully!" });
    } catch (error) {
      toast({ title: "Failed to generate meal plan", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const analyzeNutrition = async () => {
    if (!nutritionFood.trim()) {
      toast({ title: "Please enter a food item", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini/nutrition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItem: nutritionFood,
          quantity: nutritionQuantity || "1 serving"
        })
      });

      const data = await response.json();
      setResults({ type: "nutrition", data });
      toast({ title: "Nutrition analysis completed!" });
    } catch (error) {
      toast({ title: "Failed to analyze nutrition", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const processVoiceCommand = async () => {
    if (!voiceCommand.trim()) {
      toast({ title: "Please enter a voice command", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: voiceCommand })
      });

      const data = await response.json();
      setResults({ type: "voice", data });
      toast({ title: "Voice command processed!" });
    } catch (error) {
      toast({ title: "Failed to process voice command", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const getShoppingSuggestions = async () => {
    if (!groceryItems.trim()) {
      toast({ title: "Please enter grocery items", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini/shopping/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groceryList: groceryItems.split(",").map(i => i.trim())
        })
      });

      const data = await response.json();
      setResults({ type: "shopping", data });
      toast({ title: "Shopping suggestions generated!" });
    } catch (error) {
      toast({ title: "Failed to get shopping suggestions", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          Gemini AI Kitchen Assistant
        </h1>
        <p className="text-gray-600 mt-2">Free AI-powered cooking features using Google Gemini</p>
        <Badge variant="secondary" className="mt-2">100% Free • 1,500 requests/day</Badge>
      </div>

      <Tabs defaultValue="recipe" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recipe" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Recipe
          </TabsTrigger>
          <TabsTrigger value="meal-plan" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Meal Plan
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="shopping" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Shopping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipe">
          <Card>
            <CardHeader>
              <CardTitle>AI Recipe Generator</CardTitle>
              <CardDescription>Generate recipes from ingredients using Gemini AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter ingredients (comma separated): chicken, rice, vegetables"
                value={recipeIngredients}
                onChange={(e) => setRecipeIngredients(e.target.value)}
              />
              <Input
                placeholder="Cuisine style (optional): Italian, Chinese, Mexican"
                value={recipeCuisine}
                onChange={(e) => setRecipeCuisine(e.target.value)}
              />
              <Button onClick={generateRecipe} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate Recipe with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meal-plan">
          <Card>
            <CardHeader>
              <CardTitle>AI Meal Planner</CardTitle>
              <CardDescription>Create personalized meal plans with budget optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                placeholder="Number of days (1-14)"
                value={mealPlanDays}
                onChange={(e) => setMealPlanDays(parseInt(e.target.value) || 7)}
                min="1"
                max="14"
              />
              <Input
                placeholder="Daily budget (optional): 25"
                value={mealPlanBudget}
                onChange={(e) => setMealPlanBudget(e.target.value)}
              />
              <Button onClick={generateMealPlan} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate Meal Plan with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle>AI Nutrition Analyzer</CardTitle>
              <CardDescription>Get detailed nutritional information powered by AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Food item: grilled chicken breast"
                value={nutritionFood}
                onChange={(e) => setNutritionFood(e.target.value)}
              />
              <Input
                placeholder="Quantity (optional): 1 serving, 100g, 1 cup"
                value={nutritionQuantity}
                onChange={(e) => setNutritionQuantity(e.target.value)}
              />
              <Button onClick={analyzeNutrition} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Analyze Nutrition with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Command Processor</CardTitle>
              <CardDescription>Test natural language commands for cooking assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Try: 'Find me a quick dinner recipe with chicken' or 'Plan my meals for this week'"
                value={voiceCommand}
                onChange={(e) => setVoiceCommand(e.target.value)}
                rows={3}
              />
              <Button onClick={processVoiceCommand} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Process Command with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle>Smart Shopping Assistant</CardTitle>
              <CardDescription>Get AI-powered shopping tips and budget optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Grocery items (comma separated): milk, bread, eggs, chicken"
                value={groceryItems}
                onChange={(e) => setGroceryItems(e.target.value)}
              />
              <Button onClick={getShoppingSuggestions} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Get Shopping Suggestions with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Display */}
      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}