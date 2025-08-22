import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { VoiceCommandPanel } from "@/components/voice-command-panel";
import { SpoonacularRecipeSearch } from "@/components/spoonacular-recipe-search";
import { GoogleMapsStoreFinder } from "@/components/google-maps-store-finder";
import { DeliveryServices } from "@/components/delivery-services";
import { EnhancedGroceryList } from "@/components/enhanced-grocery-list";
import { FloatingVoiceAssistant } from "@/components/floating-voice-assistant";
import GeminiAIPanel from "@/components/gemini-ai-panel";
import { VoiceIngredientSearch } from "@/components/voice-ingredient-search";
import { EnhancedVoicePanel } from "@/components/enhanced-voice-panel";
import { CookingTimer } from "@/components/cooking-timer";
import { EnhancedWhisperVoice } from "@/components/enhanced-whisper-voice";
import { WebSpeechTest } from "@/components/web-speech-test";
import { EnhancedRecipeSearch } from "@/components/enhanced-recipe-search";
import { VoiceRecipeReaderComponent } from "@/components/voice-recipe-reader";
import { AWSVoiceIntegration } from "@/components/aws-voice-integration";
import { PremiumAWSVoicePanel } from "@/components/premium-aws-voice-panel";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecipeReaderModal from "@/components/recipe-reader-modal";
import { KitchenTimer } from "@/components/kitchen-timer";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { FadeIn } from "@/components/smooth-transitions";
import { MealPlan, PantryItem, Recipe } from "@shared/schema";
import { 
  ShoppingCart, 
  Search, 
  Bell, 
  Utensils,
  MapPin,
  ChefHat,
  Mic,
  BookOpen,
  Store,
  Settings,
  Clock,
  Star,
  DollarSign,
  Truck,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Grid3X3,
  LogOut,
  Menu,
  X,
  Calendar,
  ShoppingBag,
  Crown,
  FlaskConical,
  Smartphone,
  Users,
  Globe,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { MealPlanCard } from "@/components/meal-plan-card";
import { OpenFoodFactsSearch } from "@/components/open-food-facts-search";
import { KrogerProductSearch } from "@/components/kroger-product-search";
import { FallbackRecipeDisplay } from "@/components/fallback-recipe-display";
import { PremiumVoicePanel } from "@/components/premium-voice-panel";
import { PremiumRecipeSearch } from "@/components/premium-recipe-search";
import { PremiumNutritionAnalysis } from "@/components/premium-nutrition-analysis";
import { SubscriptionGate, FeatureUsageIndicator } from "@/components/subscription-gate";
import { getRecipeImage } from "@/utils/food-images";
import { NavigationHeader } from "@/components/navigation-header";
import { CalendarSave } from "@/components/calendar-save";
import SmartBudgetTracker from "@/components/smart-budget-tracker";

// Legacy Budget Tracker Component - replaced by SmartBudgetTracker
const LegacyBudgetTracker = () => {
  const [budget, setBudget] = useState(500);
  const [expenses, setExpenses] = useState([
    { id: 1, item: 'Grocery Shopping', amount: 87.50, date: '2025-08-13', category: 'Groceries' },
    { id: 2, item: 'Restaurant Dinner', amount: 45.00, date: '2025-08-12', category: 'Dining' },
    { id: 3, item: 'Coffee Shop', amount: 12.50, date: '2025-08-11', category: 'Beverages' },
  ]);
  const [newExpense, setNewExpense] = useState({ item: '', amount: '', category: 'Groceries' });
  const [calculator, setCalculator] = useState<{ display: string, operation: string | null, previousValue: number | null }>({ display: '0', operation: null, previousValue: null });

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalSpent;

  const addExpense = () => {
    if (newExpense.item && newExpense.amount) {
      const expense = {
        id: Date.now(),
        item: newExpense.item,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString().split('T')[0],
        category: newExpense.category
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ item: '', amount: '', category: 'Groceries' });
    }
  };

  const handleCalculator = (value: string) => {
    if (value === 'C') {
      setCalculator({ display: '0', operation: null, previousValue: null });
    } else if (value === '=') {
      if (calculator.operation && calculator.previousValue !== null) {
        const prev = calculator.previousValue;
        const current = parseFloat(calculator.display);
        let result = 0;
        
        switch (calculator.operation) {
          case '+': result = prev + current; break;
          case '-': result = prev - current; break;
          case '*': result = prev * current; break;
          case '/': result = prev / current; break;
        }
        
        setCalculator({ display: result.toString(), operation: null, previousValue: null });
      }
    } else if (['+', '-', '*', '/'].includes(value)) {
      setCalculator({
        ...calculator,
        operation: value,
        previousValue: parseFloat(calculator.display),
        display: '0'
      });
    } else {
      setCalculator({
        ...calculator,
        display: calculator.display === '0' ? value : calculator.display + value
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-300 bg-emerald-50">
          <CardContent className="p-4">
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full text-center bg-transparent border-none text-emerald-700 font-bold text-2xl"
                  min="0"
                />
              </div>
              <div className="text-sm text-emerald-600">Monthly Budget</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <div className="text-center">
              <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">${totalSpent.toFixed(2)}</div>
              <div className="text-sm text-orange-600">Total Spent</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={remaining >= 0 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
          <CardContent className="p-4">
            <div className="text-center">
              <DollarSign className={remaining >= 0 ? 'w-8 h-8 text-green-600 mx-auto mb-2' : 'w-8 h-8 text-red-600 mx-auto mb-2'} />
              <div className={remaining >= 0 ? 'text-2xl font-bold text-green-700' : 'text-2xl font-bold text-red-700'}>${remaining.toFixed(2)}</div>
              <div className={remaining >= 0 ? 'text-sm text-green-600' : 'text-sm text-red-600'}>Remaining</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Expense Form */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Add Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Expense description"
              value={newExpense.item}
              onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })}
              className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="Groceries">Groceries</option>
              <option value="Dining">Dining Out</option>
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
            </select>
            <Button onClick={addExpense} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Add Expense
            </Button>
          </CardContent>
        </Card>

        {/* Calculator */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-blue-600" />
              Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-orange-900 text-white p-4 rounded-lg text-right text-2xl font-mono">
                {calculator.display}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['C', '/', '*', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '.', '0'].map((btn, index) => (
                  <Button
                    key={index}
                    variant={['C', '/', '*', '-', '+', '='].includes(btn) ? 'default' : 'outline'}
                    className={`h-12 ${btn === '0' && index === 16 ? 'col-span-2' : ''} ${btn === '=' ? 'row-span-2' : ''}`}
                    onClick={() => handleCalculator(btn)}
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-orange-900">{expense.item}</div>
                  <div className="text-sm text-orange-700">{expense.category} • {expense.date}</div>
                </div>
                <div className="text-lg font-bold text-orange-900">${expense.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Daily Meal Calendar Component
const DailyMealCalendar = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState<{ [key: string]: { breakfast: string, lunch: string, dinner: string, snack: string } }>({
    '2025-08-13': {
      breakfast: 'Oatmeal with berries',
      lunch: 'Grilled chicken salad',
      dinner: 'Salmon with vegetables',
      snack: 'Greek yogurt'
    },
    '2025-08-14': {
      breakfast: 'Avocado toast',
      lunch: 'Quinoa bowl',
      dinner: 'Pasta primavera',
      snack: 'Apple slices'
    },
    '2025-08-15': {
      breakfast: 'Smoothie bowl',
      lunch: 'Turkey sandwich',
      dinner: 'Stir-fry chicken',
      snack: 'Nuts'
    }
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const updateMeal = (date: string, mealType: string, value: string) => {
    setMeals(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || { breakfast: '', lunch: '', dinner: '', snack: '' }),
        [mealType]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-indigo-700">Week of {currentDate.toLocaleDateString()}</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}>
            Previous Week
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}>
            Next Week
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {getWeekDates().map((date, index) => {
          const dateStr = formatDate(date);
          const dayMeals = meals[dateStr] || { breakfast: '', lunch: '', dinner: '', snack: '' };
          
          return (
            <Card key={index} className="border-indigo-200 bg-indigo-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-sm">
                  <div className="font-bold text-indigo-700">{weekDays[index]}</div>
                  <div className="text-xs text-indigo-600">{date.getDate()}</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {mealTypes.map((mealType) => (
                  <div key={mealType} className="space-y-1">
                    <label className="text-xs font-medium text-indigo-600 capitalize">{mealType}</label>
                    <textarea
                      value={dayMeals[mealType as keyof typeof dayMeals] || ''}
                      onChange={(e) => updateMeal(dateStr, mealType, e.target.value)}
                      placeholder={`${mealType} meal`}
                      className="w-full p-2 text-xs border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {
            setActiveTab('voice');
            console.log('Generate Meal Plan clicked');
          }}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Generate Meal Plan
        </Button>
        <Button 
          variant="outline" 
          className="border-indigo-300 text-indigo-600"
          onClick={() => {
            setActiveTab('shopping');
            console.log('Create Shopping List clicked');
          }}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Create Shopping List
        </Button>
        <Button 
          variant="outline" 
          className="border-indigo-300 text-indigo-600"
          onClick={() => {
            setActiveTab('recipes');
            console.log('Find Recipes clicked');
          }}
        >
          <Search className="w-4 h-4 mr-2" />
          Find Recipes
        </Button>
      </div>
    </div>
  );
};

// Legacy Timer Component (now replaced by CookingTimer from components)
const LegacyCookingTimer = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Optional: Play notification sound or show alert
      alert("Timer finished!");
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(inputMinutes * 60);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-orange-50/70 p-4 rounded-lg border border-orange-200">
      <h4 className="font-medium text-orange-700 mb-3">Cooking Timer</h4>
      <div className="space-y-3">
        <div className="text-2xl font-mono text-center text-orange-600">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(Number(e.target.value))}
            min="1"
            max="120"
            className="w-16 px-2 py-1 text-sm border border-orange-200 rounded"
            disabled={isRunning}
          />
          <span className="text-sm text-orange-600">minutes</span>
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            onClick={startTimer}
            disabled={isRunning}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Play className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            onClick={pauseTimer}
            disabled={!isRunning}
            variant="outline"
            className="border-orange-200 text-orange-600"
          >
            <Pause className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            onClick={resetTimer}
            variant="outline"
            className="border-orange-200 text-orange-600"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("voice");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeReader, setShowRecipeReader] = useState(false);
  const [location, setLocation] = useLocation();
  const [favoriteStores, setFavoriteStores] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data: todayMealPlans = [], isLoading: mealsLoading } = useQuery<MealPlan[]>({
    queryKey: ['/api/meal-plans', { date: today }],
    queryFn: () => fetch(`/api/meal-plans?date=${today}`).then(res => res.json()),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const { data: pantryItems = [] } = useQuery<PantryItem[]>({
    queryKey: ['/api/pantry-items']
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes']
  });

  // Filter recipes by category - memoized to prevent infinite re-renders
  useEffect(() => {
    if (selectedCategory && recipes.length > 0) {
      const filtered = recipes.filter(recipe => {
        const recipeName = recipe.name.toLowerCase();
        const recipeDesc = (recipe.description || '').toLowerCase();
        const category = selectedCategory.toLowerCase();
        
        // Define category keywords for better matching
        const categoryKeywords: Record<string, string[]> = {
          'breakfast': ['pancake', 'toast', 'egg', 'oatmeal', 'cereal', 'smoothie', 'breakfast'],
          'lunch': ['salad', 'sandwich', 'wrap', 'soup', 'lunch'],
          'dinner': ['steak', 'pasta', 'chicken', 'salmon', 'rice', 'dinner'],
          'desserts': ['cake', 'cookies', 'pie', 'pudding', 'chocolate', 'ice cream', 'dessert'],
          'snacks': ['chips', 'nuts', 'crackers', 'popcorn', 'snack'],
          'beverages': ['smoothie', 'juice', 'coffee', 'tea', 'drink', 'beverage'],
          'vegetarian': ['vegetarian', 'veggie', 'tofu', 'beans', 'lentil'],
          'vegan': ['vegan', 'plant', 'almond', 'coconut'],
          'gluten-free': ['gluten-free', 'rice', 'quinoa'],
          'keto': ['keto', 'low-carb', 'avocado'],
          'low-carb': ['low-carb', 'protein', 'meat'],
          'high-protein': ['protein', 'chicken', 'beef', 'fish', 'eggs'],
          'italian': ['pasta', 'pizza', 'italian', 'tomato'],
          'mexican': ['taco', 'burrito', 'mexican', 'beans', 'salsa'],
          'asian': ['asian', 'rice', 'noodles', 'soy'],
          'mediterranean': ['mediterranean', 'olive', 'feta'],
          'quick & easy': ['quick', 'easy', 'simple', '15', '20', '30'],
          'one-pot': ['one-pot', 'skillet', 'casserole'],
          'slow cooker': ['slow', 'crockpot'],
          'grilling': ['grill', 'bbq', 'barbecue'],
          'baking': ['bake', 'bread', 'muffin'],
          'healthy': ['healthy', 'fresh', 'green'],
          'comfort food': ['comfort', 'mac', 'cheese', 'burger'],
          'holiday': ['holiday', 'christmas', 'thanksgiving']
        };
        
        const keywords = categoryKeywords[category] || [category];
        return keywords.some((keyword: string) => 
          recipeName.includes(keyword) || recipeDesc.includes(keyword)
        );
      });
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes([]);
    }
  }, [selectedCategory, recipes.length]); // Only depend on recipes.length to prevent infinite re-renders

  if (mealsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton type="recipe" count={6} />
        </div>
      </div>
    );
  }

  // Menu items for sidebar navigation
  const menuItems = [
    { icon: Calendar, label: "Today's Meals", value: "meals", color: "text-orange-600" },
    { icon: Search, label: "Recipe Search", value: "recipes", color: "text-blue-600" },
    { icon: ShoppingBag, label: "Shopping List", value: "shopping", color: "text-green-600" },
    { icon: MapPin, label: "Store Finder", value: "stores", color: "text-purple-600" },

    { icon: Mic, label: "Voice Assistant", value: "voice", color: "text-red-600" },
    { icon: FlaskConical, label: "Food Database", value: "food-facts", color: "text-cyan-600" },
    { icon: ChefHat, label: "🔥 Enhanced Recipes", value: "enhanced-recipes", color: "text-green-600" },
    { icon: DollarSign, label: "Budget Tracker", value: "budget", color: "text-emerald-600" },
    { icon: Calendar, label: "Meal Calendar", value: "calendar", color: "text-indigo-600" },
    { icon: Grid3X3, label: "Categories", value: "categories", color: "text-blue-600" },
    { icon: Crown, label: "Subscribe", value: "subscribe", color: "text-purple-600" },
  ];

  return (
    <FadeIn className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300">
      {/* Enhanced Header with Glass Effect */}
      <header className="glass-effect sticky top-0 z-50 border-b border-orange-300/60 bg-gradient-to-r from-orange-200/90 to-orange-300/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost" 
                size="sm" 
                className="text-orange-800 hover:bg-orange-200/70 p-2 rounded-lg transition-all duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center shadow-lg hover-lift">
                  <ChefHat className="text-white w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-orange-800">ChefGrocer</h1>
                  <p className="text-orange-700 text-sm font-medium">AI-Powered Kitchen Assistant</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 border border-green-400 px-4 py-2 rounded-full shadow-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-semibold">Voice Ready</span>
              </div>
              <Button
                onClick={() => setActiveTab("subscribe")}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </Button>
              {isAuthenticated && (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-md hover-lift">
                  <span className="text-white font-bold">
                    {(user as any)?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30" 
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Optimized Sidebar - Narrower on mobile */}
          <div className="relative bg-orange-50 w-72 sm:w-80 shadow-2xl border-r border-orange-300 animate-slide-in-left max-h-screen overflow-y-auto">
            {/* Compact Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-orange-300 bg-gradient-to-r from-orange-100 to-orange-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center shadow-lg">
                  <ChefHat className="text-white w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-bold text-orange-700">ChefGrocer</span>
                  <p className="text-xs text-orange-600">Premium Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-orange-700 hover:text-orange-800 hover:bg-orange-200/50 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Compact Menu Items */}
            <div className="py-4 px-3 space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start px-3 py-3 text-left rounded-lg transition-all duration-200 h-auto ${
                      isActive 
                        ? 'bg-gradient-to-r from-orange-200/90 to-orange-300/90 text-orange-800 border border-orange-400/60 shadow-sm' 
                        : 'text-orange-700 hover:bg-orange-100/80 hover:text-orange-800'
                    }`}
                    onClick={() => {
                      if (item.value === 'subscribe') {
                        setActiveTab('subscribe');
                      } else if (item.value === 'budget') {
                        setActiveTab('budget');
                      } else if (item.value === 'calendar') {
                        setActiveTab('calendar');
                      } else {
                        setActiveTab(item.value);
                      }
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-orange-700' : item.color}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-orange-600 rounded-full"></div>}
                  </Button>
                );
              })}
            </div>

            {/* Compact Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-orange-300 bg-orange-50">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-3 py-2 text-orange-700 hover:text-orange-800 hover:bg-orange-100/80 rounded-lg"
                  onClick={() => {
                    console.log('Notifications clicked');
                    // TODO: Open notifications panel
                  }}
                >
                  <Bell className="w-4 h-4 mr-3" />
                  <span className="text-sm">Notifications</span>
                  <div className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</div>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-3 py-2 text-orange-700 hover:text-orange-800 hover:bg-orange-100/80 rounded-lg"
                  onClick={() => {
                    console.log('Settings clicked');
                    // Use proper routing instead of window.location
                    window.location.href = '/settings';
                    setSidebarOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  <span className="text-sm">Settings</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-3 py-2 text-red-700 hover:text-red-800 hover:bg-red-100/70 rounded-lg"
                  onClick={() => {
                    console.log('Sign out clicked');
                    window.location.href = '/api/logout';
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-sm">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Interactive Tab Navigation */}
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gradient-to-r from-orange-200 to-orange-300 p-1 rounded-2xl shadow-lg">
            <TabsTrigger 
              value="voice" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white font-medium rounded-xl transition-all duration-200 hover:bg-orange-300 text-orange-700 text-sm px-2 py-3"
            >
              <Mic className="w-4 h-4 mr-1" />
              Voice Chef
            </TabsTrigger>
            <TabsTrigger 
              value="recipes" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white font-medium rounded-xl transition-all duration-200 hover:bg-orange-300 text-orange-700 text-sm px-2 py-3"
            >
              <ChefHat className="w-4 h-4 mr-1" />
              Recipes
            </TabsTrigger>
            <TabsTrigger 
              value="scraper" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-medium rounded-xl transition-all duration-200 hover:bg-green-200 text-sm px-2 py-3"
            >
              <Globe className="w-4 h-4 mr-1" />
              Import
            </TabsTrigger>
            <TabsTrigger 
              value="timer" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-medium rounded-xl transition-all duration-200 hover:bg-orange-200 text-sm px-2 py-3"
            >
              <Clock className="w-4 h-4 mr-1" />
              Timer
            </TabsTrigger>
            <TabsTrigger 
              value="more" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium rounded-xl transition-all duration-200 hover:bg-purple-200 text-sm px-2 py-3"
            >
              <Menu className="w-4 h-4 mr-1" />
              More
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Voice Chef Tab */}
          <TabsContent value="voice" className="space-y-8 animate-fade-in">
            <Card className="border-orange-400 shadow-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">Voice AI Chef</h2>
                    <p className="text-base text-orange-100 font-medium">Advanced hands-free cooking guidance</p>
                  </div>
                  <Badge className="ml-auto bg-green-500 text-white px-3 py-1 shadow-md">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Enhanced Voice Command Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="border-orange-500 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-100 to-orange-200 hover-lift" onClick={() => setActiveTab('voice')}>
                    <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-lg">
                      <CardTitle className="text-xl text-white flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        Voice Commands
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <VoiceCommandPanel />
                    </CardContent>
                  </Card>

                  <Card className="border-green-500 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-100 to-green-200 hover-lift">
                    <CardHeader className="bg-gradient-to-r from-green-400 to-green-500 rounded-t-lg">
                      <CardTitle className="text-xl text-white flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        Web Speech Test
                        <Badge className="bg-yellow-500 text-black shadow-sm text-xs">INSTANT</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <WebSpeechTest />
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-500 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-100 to-orange-200 hover-lift" onClick={() => {
                    setActiveTab('voice');
                    // Focus on enhanced voice features
                    setTimeout(() => {
                      const whisperElement = document.querySelector('[data-testid="whisper-voice"]');
                      if (whisperElement) {
                        whisperElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}>
                    <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-lg">
                      <CardTitle className="text-xl text-white flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        Enhanced Voice AI
                        <Badge className="bg-blue-600 text-white shadow-sm">Premium</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <EnhancedVoicePanel />
                        <div className="text-sm text-orange-900 bg-gradient-to-r from-orange-300 to-yellow-300 p-3 rounded-xl border border-orange-500 shadow-sm">
                          <strong>🤖 Enhanced AI:</strong> OpenAI + Gemini for advanced voice understanding and natural conversations
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Premium Whisper AI Voice Assistant */}
                <EnhancedWhisperVoice />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                </div>

                {/* Cooking Timer */}
                <CookingTimer />

                {/* Voice Recipe Reader */}
                <VoiceRecipeReaderComponent recipe={selectedRecipe} />
                
                {/* Premium AWS Voice Integration */}
                <PremiumAWSVoicePanel recipe={selectedRecipe} userSubscription="premium" />
                
                {/* Basic AWS Voice Integration */}
                <AWSVoiceIntegration recipe={selectedRecipe} />

                {/* Enhanced Voice Ingredient Search */}
                <Card className="border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg hover-lift">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-lg">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      Voice Ingredient Search
                      <Badge className="bg-green-600 text-white shadow-sm">Live Search</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <VoiceIngredientSearch />
                  </CardContent>
                </Card>

                {/* Today's Meal Plan */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-900">Today's Meal Plan</h3>
                  {mealsLoading ? (
                    <LoadingSkeleton type="recipe" count={3} />
                  ) : (
                    todayMealPlans?.slice(0, 3).map((meal) => (
                      <MealPlanCard 
                        key={meal.id} 
                        mealPlan={meal} 
                        onRecipeClick={(recipeName, mealType) => {
                          setActiveTab('recipes');
                          // In a full implementation, this would filter recipes by the specific recipe or category
                          console.log(`Opening recipe details for ${recipeName} (${mealType})`);
                        }}
                      />
                    ))
                  )}
                </div>

                {/* Quick Voice Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: ChefHat, title: "Start Cooking", subtitle: "Voice guidance", color: "from-orange-500 to-red-500" },
                    { icon: Clock, title: "Set Timer", subtitle: "Voice control", color: "from-blue-500 to-cyan-500" },
                    { icon: Search, title: "Find Recipe", subtitle: "Ask anything", color: "from-green-500 to-emerald-500" },
                    { icon: Settings, title: "Settings", subtitle: "Voice preferences", color: "from-purple-500 to-pink-500" }
                  ].map((action, index) => (
                    <Card 
                      key={index}
                      className="border-orange-200 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-orange-50 hover-lift"
                      onClick={() => {
                        switch (action.title) {
                          case "Find Recipe":
                            setActiveTab("recipes");
                            break;
                          case "Start Cooking":
                            setActiveTab("voice");
                            break;
                          case "Set Timer":
                            setActiveTab("timer");
                            break;
                          case "Settings":
                            setActiveTab("subscribe");
                            break;
                          default:
                            console.log(`${action.title} clicked`);
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-sm text-orange-900 mb-1">{action.title}</h3>
                        <p className="text-xs text-orange-600">{action.subtitle}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interactive Recipe Search Tab */}
          <TabsContent value="recipes" className="space-y-6 animate-fade-in">
            <Card className="border-orange-500 shadow-2xl bg-gradient-to-br from-orange-100 to-orange-200 hover-lift">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Recipe Discovery</h2>
                    <p className="text-base text-orange-100 font-medium">500,000+ recipes at your fingertips</p>
                  </div>
                  <Badge className="ml-auto bg-blue-600 text-white px-3 py-1 shadow-md">Premium</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Enhanced Multi-Source Recipe Search */}
                <EnhancedRecipeSearch 
                  onRecipeSelect={(recipe) => {
                    setSelectedRecipe(recipe);
                    setActiveTab('voice');
                    toast({
                      title: "Recipe Selected!",
                      description: `${recipe.title} is ready for voice reading in the Voice tab`,
                    });
                  }}
                />
                
                {/* Original Spoonacular Search (Premium) */}
                <Card className="border-blue-400 hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 hover-lift">
                  <CardHeader className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-t-lg">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      Spoonacular Premium Search
                      <Badge className="bg-yellow-500 text-black">Pro Only</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <SpoonacularRecipeSearch />
                  </CardContent>
                </Card>

                {/* Category Filter Header */}
                {selectedCategory && (
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-orange-700">
                        {selectedCategory} Recipes
                      </h3>
                      <Badge className="bg-orange-500 text-white">
                        {filteredRecipes.length} found
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(null);
                        setFilteredRecipes([]);
                      }}
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear Filter
                    </Button>
                  </div>
                )}

                {/* Featured/Filtered Recipes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(selectedCategory ? filteredRecipes : recipes.slice(0, 6)).map((recipe: Recipe, index) => {

                    return (
                      <Card 
                        key={recipe.id} 
                        className="border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 hover-lift"
                        onClick={() => {
                          setSelectedRecipe(recipe);
                          setShowRecipeReader(true);
                          console.log(`Opening recipe: ${recipe.name}`);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="w-full h-40 rounded-lg mb-4 overflow-hidden">
                            <img 
                              src={getRecipeImage(recipe.name)}
                              alt={recipe.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                              loading="lazy"
                            />
                            <div className="w-full h-40 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center hidden">
                              <ChefHat className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <h3 className="font-bold text-lg mb-2 text-orange-900">{recipe.name}</h3>
                          <p className="text-sm text-orange-600 mb-3 line-clamp-2">{recipe.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-orange-700 font-medium">30 min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-orange-600">4.8</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Recipe Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: "Breakfast", count: "1,200+" },
                    { title: "Lunch", count: "2,500+" },
                    { title: "Dinner", count: "3,800+" },
                    { title: "Desserts", count: "800+" }
                  ].map((category, index) => (
                    <Card 
                      key={index}
                      className={`border-orange-500 hover:shadow-lg transition-all cursor-pointer ${
                        selectedCategory === category.title 
                          ? 'bg-orange-400 border-orange-600' 
                          : 'bg-orange-200/70 hover:bg-orange-300'
                      }`}
                      onClick={() => {
                        setSelectedCategory(category.title);
                        setActiveTab("recipes");
                        console.log(`Filtering recipes by ${category.title}`);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold text-lg text-orange-900">{category.title}</h3>
                        <p className="text-sm text-orange-700">{category.count} recipes</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Today's Meals Tab */}
          <TabsContent value="meals" className="space-y-6 animate-in zoom-in-95 duration-500">
            <Card className="border-orange-600 shadow-lg bg-orange-100/80">
              <CardHeader className="bg-gradient-to-r from-orange-200 to-orange-150">
                <CardTitle className="flex items-center gap-3 text-orange-800">
                  <Calendar className="w-6 h-6" />
                  Today's Meal Plan
                  <div className="ml-auto flex items-center gap-2">
                    <Badge className="bg-orange-500 text-white">
                      {todayMealPlans.length} Meals
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {todayMealPlans.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {todayMealPlans.map((meal, index) => (
                      <MealPlanCard key={index} mealPlan={meal} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">No meals planned for today</h3>
                    <p className="text-orange-600">Click "Voice Assistant" to plan your meals with AI!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Tracker Tab */}
          <TabsContent value="price" className="space-y-6 animate-in zoom-in-95 duration-500">
            <Card className="border-orange-600 shadow-lg bg-orange-100/80">
              <CardHeader className="bg-gradient-to-r from-orange-200 to-orange-150">
                <CardTitle className="flex items-center gap-3 text-orange-800">
                  <DollarSign className="w-6 h-6" />
                  Price Tracker
                  <div className="ml-auto flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">Save 25%</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { item: "Organic Bananas", currentPrice: "$2.99", oldPrice: "$3.49", savings: "14%", store: "Whole Foods" },
                    { item: "Chicken Breast", currentPrice: "$5.99", oldPrice: "$7.49", savings: "20%", store: "Kroger" },
                    { item: "Avocados (6-pack)", currentPrice: "$4.99", oldPrice: "$6.99", savings: "29%", store: "Walmart" },
                    { item: "Greek Yogurt", currentPrice: "$4.49", oldPrice: "$5.99", savings: "25%", store: "Target" },
                    { item: "Salmon Fillet", currentPrice: "$12.99", oldPrice: "$15.99", savings: "19%", store: "Costco" },
                    { item: "Olive Oil", currentPrice: "$8.99", oldPrice: "$11.99", savings: "25%", store: "Trader Joe's" }
                  ].map((item, index) => (
                    <Card key={index} className="border-green-400 bg-green-50">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-orange-900 mb-1">{item.item}</h3>
                        <p className="text-sm text-orange-600 mb-2">{item.store}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-green-600">{item.currentPrice}</span>
                            <span className="text-sm text-orange-500 line-through ml-2">{item.oldPrice}</span>
                          </div>
                          <Badge className="bg-green-500 text-white">{item.savings} off</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Categories Tab */}
          <TabsContent value="categories" className="space-y-6 animate-fade-in">
            <Card className="border-orange-500 shadow-2xl bg-gradient-to-br from-orange-100 to-orange-200 hover-lift">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Grid3X3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Food Categories</h2>
                    <p className="text-base text-orange-100 font-medium">Browse by category for better savings</p>
                  </div>
                  <Badge className="ml-auto bg-blue-600 text-white px-3 py-1 shadow-md">25+ Categories</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Breakfast", count: "1,200+", icon: "🍳" },
                    { title: "Lunch", count: "2,500+", icon: "🥗" },
                    { title: "Dinner", count: "3,800+", icon: "🍽️" },
                    { title: "Desserts", count: "800+", icon: "🍰" },
                    { title: "Snacks", count: "600+", icon: "🍿" },
                    { title: "Beverages", count: "400+", icon: "🥤" },
                    { title: "Vegetarian", count: "2,100+", icon: "🥕" },
                    { title: "Vegan", count: "1,500+", icon: "🌱" },
                    { title: "Gluten-Free", count: "900+", icon: "🌾" },
                    { title: "Keto", count: "700+", icon: "🥑" },
                    { title: "Low-Carb", count: "850+", icon: "🥒" },
                    { title: "High-Protein", count: "1,100+", icon: "🥩" },
                    { title: "Italian", count: "650+", icon: "🍝" },
                    { title: "Mexican", count: "550+", icon: "🌮" },
                    { title: "Asian", count: "800+", icon: "🍜" },
                    { title: "Mediterranean", count: "450+", icon: "🫒" },
                    { title: "Quick & Easy", count: "1,800+", icon: "⚡" },
                    { title: "One-Pot", count: "600+", icon: "🍲" },
                    { title: "Slow Cooker", count: "400+", icon: "🍖" },
                    { title: "Grilling", count: "500+", icon: "🔥" },
                    { title: "Baking", count: "750+", icon: "🧁" },
                    { title: "Healthy", count: "2,000+", icon: "💚" },
                    { title: "Comfort Food", count: "900+", icon: "🍕" },
                    { title: "Holiday", count: "300+", icon: "🎄" }
                  ].map((category, index) => (
                    <Card 
                      key={index}
                      className={`border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br group hover-lift ${
                        selectedCategory === category.title 
                          ? 'from-orange-300 to-orange-400 border-orange-600' 
                          : 'from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300'
                      }`}
                      onClick={() => {
                        setSelectedCategory(category.title);
                        setActiveTab("recipes");
                        console.log(`Filtering recipes by ${category.title}`);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {category.icon}
                        </div>
                        <h3 className="font-semibold text-sm text-orange-900">{category.title}</h3>
                        <p className="text-xs text-orange-700">{category.count} recipes</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recipe Scraper Tab */}
          <TabsContent value="scraper" className="space-y-6 animate-fade-in">
            <Card className="border-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-green-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Recipe Importer</h2>
                    <p className="text-base text-green-100 font-medium">Extract recipes from your favorite websites</p>
                  </div>
                  <Badge className="ml-auto bg-blue-600 text-white px-3 py-1 shadow-md">Web Scraper</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Quick Import Button */}
                  <Card className="border-green-300 bg-green-50 hover:shadow-lg transition-all cursor-pointer" 
                    onClick={() => window.location.href = '/recipe-scraper'}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Globe className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-green-800">Open Recipe Importer</h3>
                      <p className="text-green-700 mb-4">Import recipes from AllRecipes, Food Network, and more</p>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/recipe-scraper';
                        }}
                      >
                        Start Importing
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Supported Sites Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        name: "AllRecipes",
                        domain: "allrecipes.com",
                        icon: "🍳",
                        description: "User reviews & ratings"
                      },
                      {
                        name: "Food Network",
                        domain: "foodnetwork.com", 
                        icon: "👨‍🍳",
                        description: "Chef recipes & shows"
                      },
                      {
                        name: "More Sites",
                        domain: "tasteofhome.com +",
                        icon: "🌐",
                        description: "Auto-detect recipes"
                      }
                    ].map((site, index) => (
                      <Card key={index} className="border-green-200 hover:shadow-md transition-all">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{site.icon}</div>
                          <h4 className="font-medium text-green-800 mb-1">{site.name}</h4>
                          <p className="text-xs text-green-600 mb-2">{site.domain}</p>
                          <p className="text-xs text-gray-600">{site.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Features List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Import Features
                      </h4>
                      <ul className="space-y-2 text-sm text-green-700">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Extract ingredients automatically
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Capture cooking instructions
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Import recipe images
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-800 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        Smart Processing
                      </h4>
                      <ul className="space-y-2 text-sm text-green-700">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Auto-calculate nutrition
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Detect difficulty level
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Batch import multiple recipes
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Find Stores Tab */}
          <TabsContent value="stores" className="space-y-6 animate-fade-in">
            {/* Enhanced Favorite Stores Section */}
            <Card className="border-orange-500 shadow-2xl bg-gradient-to-br from-orange-100 to-orange-200 hover-lift">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Your Favorite Stores</h2>
                    <p className="text-base text-orange-100 font-medium">Saved locations with best deals</p>
                  </div>
                  <Badge className="ml-auto bg-blue-600 text-white px-3 py-1 shadow-md">{favoriteStores.length} Saved</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      id: "whole-foods-1",
                      name: "Whole Foods Market",
                      category: "grocery",
                      address: "123 Organic Way, Health City, HC 12345",
                      distance: "0.8 miles",
                      rating: 5,
                      priceRating: "Premium",
                      offers: ["10% off with Prime", "Weekly deals on organic produce"],
                      services: ["Delivery", "Curbside"],
                      color: "bg-green-100 text-green-800"
                    },
                    {
                      id: "costco-1", 
                      name: "Costco Wholesale",
                      category: "warehouse",
                      address: "456 Bulk Avenue, Savings Town, ST 67890",
                      distance: "2.3 miles",
                      rating: 4,
                      priceRating: "Wholesale",
                      offers: ["Bulk pricing", "Gas station discount"],
                      services: ["Delivery", "Pharmacy"],
                      color: "bg-purple-100 text-purple-800"
                    }
                  ].map((store) => (
                    <Card key={store.id} className={`border-2 ${favoriteStores.includes(store.id) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'} hover:shadow-lg transition-all`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{store.name}</h3>
                              <Badge className={`${store.color} text-xs`}>
                                {store.category}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFavoriteStores(prev => 
                                    prev.includes(store.id) 
                                      ? prev.filter(id => id !== store.id)
                                      : [...prev, store.id]
                                  );
                                }}
                                className="p-1 h-auto"
                              >
                                <Star 
                                  className={`w-4 h-4 ${favoriteStores.includes(store.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                                />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-700">{store.distance}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">Quality</span>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < store.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-xs text-gray-500">({store.rating}/5)</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {store.priceRating}
                          </Badge>
                        </div>

                        <div className="flex gap-2 mb-3">
                          {store.services.map((service, index) => (
                            <Badge key={index} className={`text-xs ${service === 'Delivery' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {service}
                            </Badge>
                          ))}
                        </div>

                        <div className="border-t pt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Current Offers:</p>
                          {store.offers.map((offer, index) => (
                            <p key={index} className="text-xs text-orange-600">• {offer}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500 shadow-2xl bg-gradient-to-br from-orange-100 to-orange-200 hover-lift">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Find Stores Near You</h2>
                    <p className="text-base text-orange-100 font-medium">Real locations with Google Maps integration</p>
                  </div>
                  <Badge className="ml-auto bg-green-600 text-white px-3 py-1 shadow-md">Live GPS</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Enhanced Store Finder Component */}
                <Card className="border-orange-400 hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 hover-lift">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-lg">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      Google Maps Store Locator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <GoogleMapsStoreFinder />
                  </CardContent>
                </Card>

                {/* Enhanced Delivery Services Section */}
                <Card className="border-orange-400 hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 hover-lift">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-lg">
                    <CardTitle className="text-xl text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      Delivery Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <DeliveryServices />
                  </CardContent>
                </Card>

                {/* Popular Store Types */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: "Grocery Stores", icon: "🛒", count: "25 nearby" },
                    { name: "Supermarkets", icon: "🏬", count: "12 nearby" },
                    { name: "Farmers Markets", icon: "🥕", count: "8 nearby" },
                    { name: "Health Stores", icon: "🌿", count: "15 nearby" },
                    { name: "Butcher Shops", icon: "🥩", count: "6 nearby" },
                    { name: "Bakeries", icon: "🍞", count: "18 nearby" }
                  ].map((storeType, index) => (
                    <Card 
                      key={index}
                      className="border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 hover-lift"
                      onClick={() => {
                        // Filter stores by type
                        setActiveTab("stores");
                        console.log(`Searching for ${storeType.name}`);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{storeType.icon}</div>
                        <h3 className="font-semibold text-sm text-gray-900">{storeType.name}</h3>
                        <p className="text-xs text-orange-600">{storeType.count}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Sample Store Listings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Nearby Stores</h3>
                  {[
                    { name: "Walmart Supercenter", distance: "0.8 miles", hours: "Open 24/7", price: "$" },
                    { name: "Hy-Vee Food Store", distance: "1.2 miles", hours: "6am - 11pm", price: "$$" },
                    { name: "ALDI", distance: "1.8 miles", hours: "9am - 8pm", price: "$" }
                  ].map((store, index) => (
                    <Card 
                      key={index}
                      className="border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 hover-lift"
                      onClick={() => {
                        // Open store details or navigate to store
                        console.log(`Opening ${store.name} details`);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{store.name}</h4>
                            <p className="text-sm text-gray-600">{store.hours}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-green-600 font-semibold">{store.distance}</div>
                            <div className="text-orange-600">{store.price}</div>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
                          onClick={() => {
                            console.log(`Getting directions to ${store.name}`);
                            // Open maps/directions
                          }}
                        >
                          Get Directions
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Food Database Tab */}
          <TabsContent value="food-facts" className="space-y-6 animate-in zoom-in-95 duration-500">
            <OpenFoodFactsSearch />
          </TabsContent>

          {/* Enhanced Recipe Discovery Tab */}
          <TabsContent value="enhanced-recipes" className="space-y-6 animate-fade-in">
            <Card className="border-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-green-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Enhanced Recipe Discovery</h2>
                    <p className="text-base text-green-100 font-medium">Powered by Spoonacular & TheMealDB</p>
                  </div>
                  <Badge className="ml-auto bg-blue-600 text-white px-3 py-1 shadow-md">With Images</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <FallbackRecipeDisplay 
                  title="Recipe Search & Discovery" 
                  showSearch={true}
                />
              </CardContent>
            </Card>
          </TabsContent>



          {/* Categories Tab with Food Categories */}
          <TabsContent value="categories" className="space-y-6 animate-in zoom-in-95 duration-500">
            <Card className="border-orange-600 shadow-lg bg-orange-100/80">
              <CardHeader className="bg-gradient-to-r from-orange-200 to-orange-150">
                <CardTitle className="flex items-center gap-3 text-orange-800">
                  <Grid3X3 className="w-6 h-6" />
                  Food Categories
                  <div className="ml-auto flex items-center gap-2">
                    <Badge className="bg-orange-500 text-white">25+ Categories</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { name: "Fresh Produce", icon: "🥕", items: "Fruits & Vegetables", color: "bg-green-100 text-green-800" },
                    { name: "Meat & Seafood", icon: "🥩", items: "Fresh & Frozen", color: "bg-red-100 text-red-800" },
                    { name: "Dairy & Eggs", icon: "🥛", items: "Milk, Cheese, Yogurt", color: "bg-blue-100 text-blue-800" },
                    { name: "Bakery", icon: "🍞", items: "Bread & Pastries", color: "bg-yellow-100 text-yellow-800" },
                    { name: "Pantry Staples", icon: "🏺", items: "Grains & Canned", color: "bg-amber-100 text-amber-800" },
                    { name: "Frozen Foods", icon: "🧊", items: "Meals & Desserts", color: "bg-cyan-100 text-cyan-800" },
                    { name: "Snacks", icon: "🍿", items: "Chips & Crackers", color: "bg-orange-100 text-orange-800" },
                    { name: "Beverages", icon: "🥤", items: "Drinks & Juices", color: "bg-purple-100 text-purple-800" },
                    { name: "Health & Beauty", icon: "💊", items: "Personal Care", color: "bg-pink-100 text-pink-800" },
                    { name: "Household", icon: "🧽", items: "Cleaning & Paper", color: "bg-gray-100 text-gray-800" },
                    { name: "Baby & Kids", icon: "🍼", items: "Food & Supplies", color: "bg-lime-100 text-lime-800" },
                    { name: "Pet Supplies", icon: "🐕", items: "Food & Toys", color: "bg-orange-100 text-orange-800" },
                    { name: "Organic", icon: "🌱", items: "Natural & Organic", color: "bg-emerald-100 text-emerald-800" },
                    { name: "International", icon: "🌍", items: "Global Cuisine", color: "bg-indigo-100 text-indigo-800" },
                    { name: "Gluten-Free", icon: "🚫", items: "Special Diet", color: "bg-rose-100 text-rose-800" },
                    { name: "Keto & Low-Carb", icon: "🥑", items: "Low Carb Options", color: "bg-teal-100 text-teal-800" }
                  ].map((category, index) => (
                    <Card 
                      key={index}
                      className="border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer bg-white group"
                      onClick={() => {
                        console.log(`${category.name} category clicked`);
                        // Here you could navigate to category-specific products or open a modal
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-1">{category.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{category.items}</p>
                        <Badge className={`text-xs ${category.color}`}>
                          Browse
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Price Comparison by Category */}
                <Card className="mt-6 border-orange-300 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Price Compare by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-orange-700 mb-4">
                      Compare prices for the same category across different stores to maximize your savings.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["Produce Prices", "Meat Deals", "Dairy Savings", "Bakery Specials"].map((comparison, index) => (
                        <Button 
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs border-orange-300 text-orange-600 hover:bg-orange-100"
                          onClick={() => {
                            // Open price comparison for this category
                            setActiveTab("shopping");
                            console.log(`Opening ${comparison} price comparison`);
                          }}
                        >
                          {comparison}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shopping Tab with Slide-up Effect */}
          <TabsContent value="shopping" className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
            <Card className="border-orange-600 shadow-lg bg-orange-100/80">
              <CardHeader className="bg-gradient-to-r from-orange-200 to-orange-150">
                <CardTitle className="flex items-center gap-3 text-orange-800">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl">Smart Shopping</h2>
                    <p className="text-sm text-orange-600 font-normal">Manage lists and save money</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Quick Shopping Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card 
                    className="border-orange-500 hover:shadow-lg transition-all cursor-pointer bg-orange-200/70 hover:bg-orange-300"
                    onClick={() => window.location.href = '/grocery-notepad'}
                  >
                    <CardContent className="p-6 text-center">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                      <h3 className="font-bold text-lg mb-2 text-orange-900">Grocery Notepad</h3>
                      <p className="text-orange-700 mb-4">Create and manage shopping lists</p>
                      <Button 
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => {
                          console.log('Open Notepad clicked');
                          window.location.href = '/grocery-notepad';
                        }}
                      >
                        Open Notepad
                      </Button>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-orange-500 hover:shadow-lg transition-all cursor-pointer bg-orange-200/70 hover:bg-orange-300"
                    onClick={() => window.location.href = '/barcode-scanner'}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <h3 className="font-bold text-lg mb-2 text-orange-900">Barcode Scanner</h3>
                      <p className="text-orange-700 mb-4">Scan products for nutrition info</p>
                      <Button 
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => {
                          console.log('Open Scanner clicked');
                          window.location.href = '/barcode-scanner';
                        }}
                      >
                        Open Scanner
                      </Button>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-green-500 hover:shadow-lg transition-all cursor-pointer bg-green-200/70 hover:bg-green-300"
                    onClick={() => window.location.href = '/app-features'}
                  >
                    <CardContent className="p-6 text-center">
                      <Smartphone className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="font-bold text-lg mb-2 text-green-900">App Store Features</h3>
                      <p className="text-green-700 mb-4">iOS-ready premium features</p>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('App Features clicked');
                          window.location.href = '/app-features';
                        }}
                      >
                        View Features
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Delivery Services for Shopping */}
                <Card className="border-orange-500 hover:shadow-md transition-shadow bg-orange-200/70">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Grocery Delivery Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DeliveryServices />
                  </CardContent>
                </Card>

                {/* Shopping Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: DollarSign, title: "Price Compare", subtitle: "Best deals" },
                    { icon: Clock, title: "Quick Lists", subtitle: "Save time" },
                    { icon: Truck, title: "Delivery", subtitle: "To your door" },
                    { icon: Star, title: "Favorites", subtitle: "Your go-tos" }
                  ].map((feature, index) => (
                    <Card 
                      key={index}
                      className="border-orange-500 hover:shadow-lg transition-all cursor-pointer bg-orange-200/70 hover:bg-orange-300"
                      onClick={() => {
                        switch (feature.title) {
                          case "Price Compare":
                            setActiveTab("stores");
                            break;
                          case "Quick Lists":
                            // Open quick list creation
                            break;
                          case "Delivery":
                            // Focus on delivery services
                            break;
                          case "Favorites":
                            // Show favorite items
                            break;
                          default:
                            console.log(`${feature.title} clicked`);
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <feature.icon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <h3 className="font-semibold text-sm text-orange-900">{feature.title}</h3>
                        <p className="text-xs text-orange-700">{feature.subtitle}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Smart Grocery List */}
                <EnhancedGroceryList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribe Tab */}
          <TabsContent value="subscribe" className="space-y-6 animate-fade-in">
            <Card className="border-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">ChefGrocer Premium</h2>
                    <p className="text-base text-purple-100 font-medium">Unlock advanced cooking features</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Free Plan */}
                  <Card className="border-gray-300 bg-white shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChefHat className="w-8 h-8 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Free</h3>
                      <div className="text-3xl font-bold text-gray-900">$0</div>
                      <p className="text-gray-600">Basic features</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Basic recipes
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Simple meal planning
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Store finder
                        </li>
                      </ul>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          console.log('Current Plan clicked');
                          // Already on free plan
                        }}
                      >
                        Current Plan
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Premium Plan */}
                  <Card className="border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                    </div>
                    <CardHeader className="text-center pb-4 pt-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-orange-900">Premium</h3>
                      <div className="text-3xl font-bold text-orange-900">$4.99</div>
                      <p className="text-orange-700">per month</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Everything in Free
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Voice AI assistant
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Advanced recipes
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Nutrition tracking
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => window.location.href = '/subscribe?plan=premium'}
                      >
                        Choose Premium
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pro Plan */}
                  <Card className="border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-900">Pro</h3>
                      <div className="text-3xl font-bold text-blue-900">$9.99</div>
                      <p className="text-blue-700">per month</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Everything in Premium
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Advanced AI features
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Custom meal plans
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Priority support
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => window.location.href = '/subscribe?plan=pro'}
                      >
                        Choose Pro
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Lifetime Plan */}
                  <Card className="border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Best Value</span>
                    </div>
                    <CardHeader className="text-center pb-4 pt-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-purple-900">Lifetime</h3>
                      <div className="text-3xl font-bold text-purple-900">$99.99</div>
                      <p className="text-purple-700">one-time payment</p>
                      <p className="text-sm text-purple-600 font-semibold">Save 72%!</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Everything in Pro
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Lifetime access
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          All future updates
                        </li>
                        <li className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          Premium support
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                        onClick={() => window.location.href = '/subscribe?plan=lifetime'}
                      >
                        Choose Lifetime
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Features Comparison */}
                <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What you get with Premium plans:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Voice Assistant</h4>
                      <p className="text-sm text-gray-600">Hands-free cooking with advanced voice commands</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Premium Recipes</h4>
                      <p className="text-sm text-gray-600">Access to 500K+ chef-curated recipes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Smart Meal Planning</h4>
                      <p className="text-sm text-gray-600">AI-powered personalized meal recommendations</p>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>🔒 Secure payment processing • 30-day money-back guarantee • Cancel anytime</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tracker Tab */}
          <TabsContent value="budget" className="space-y-6 animate-fade-in">
            <Card className="border-emerald-500 shadow-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Smart Budget Tracker</h2>
                    <p className="text-base text-emerald-100 font-medium">Track your food spending and save money</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <SmartBudgetTracker />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meal Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6 animate-fade-in">
            <Card className="border-indigo-500 shadow-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Daily Meal Calendar</h2>
                    <p className="text-base text-indigo-100 font-medium">Plan your meals for the week ahead</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <DailyMealCalendar setActiveTab={setActiveTab} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Premium Nutrition Analysis Tab */}
          {/* Calendar Save Tab */}
          <TabsContent value="calendar" className="space-y-6 animate-fade-in">
            <Card className="border-orange-500 shadow-2xl bg-gradient-to-br from-orange-100 to-orange-200 hover-lift">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Calendar Save</h2>
                    <p className="text-base text-orange-100 font-medium">Save cooking events to your calendar</p>
                  </div>
                  <Badge className="ml-auto bg-blue-600 text-white px-3 py-1 shadow-md">Schedule Events</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CalendarSave 
                  title="Cooking Session"
                  startDate={new Date().toISOString().split('T')[0]}
                  startTime="18:00"
                  endTime="19:30"
                  description="Prepare delicious meal with ChefGrocer recipes"
                  location="Kitchen"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Nutrition Analysis Tab */}
          <TabsContent value="nutrition" className="space-y-6 animate-fade-in">
            <Card className="border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <FlaskConical className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Premium Nutrition Analysis</h2>
                    <p className="text-base text-blue-100 font-medium">Enterprise-grade nutrition data powered by API Ninjas + USDA</p>
                  </div>
                  <Badge className="ml-auto bg-green-500 text-white px-3 py-1 shadow-md">Enterprise</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover-lift">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Search className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-orange-900">Smart Parsing</h3>
                      <p className="text-orange-700 text-sm">Natural language nutrition analysis</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-orange-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Type "1 cup pasta" → instant nutrition
                        </div>
                        <div className="flex items-center text-orange-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          AI-powered ingredient recognition
                        </div>
                        <div className="flex items-center text-orange-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          100K+ requests/month free tier
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => window.location.href = '/nutrition-analysis'}
                      >
                        Try Smart Analysis
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover-lift">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <FlaskConical className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-blue-900">USDA Official</h3>
                      <p className="text-blue-700 text-sm">Government-verified nutrition data</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-blue-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Official US Department of Agriculture
                        </div>
                        <div className="flex items-center text-blue-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          1.9M+ verified food products
                        </div>
                        <div className="flex items-center text-blue-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Laboratory-tested accuracy
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.location.href = '/nutrition-analysis'}
                      >
                        Search USDA Database
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover-lift">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <Utensils className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-green-900">Recipe Analysis</h3>
                      <p className="text-green-700 text-sm">Complete recipe nutrition totals</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Analyze entire recipes instantly
                        </div>
                        <div className="flex items-center text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Ingredient-by-ingredient breakdown
                        </div>
                        <div className="flex items-center text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Perfect for meal planning
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.location.href = '/nutrition-analysis'}
                      >
                        Analyze Recipe
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Premium Features Highlight */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Premium Nutrition Features</h3>
                      <p className="text-blue-100">Enterprise-grade analysis tools at zero cost</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">100K+</div>
                      <div className="text-blue-200">Smart requests/month</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">1.9M+</div>
                      <div className="text-blue-200">USDA verified foods</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">3,600</div>
                      <div className="text-blue-200">USDA requests/hour</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">$0</div>
                      <div className="text-blue-200">API costs for users</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="text-center">
                  <Link href="/nutrition-analysis">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 shadow-lg"
                      onClick={() => {
                        console.log('Access Premium Nutrition Analysis clicked');
                        window.location.href = '/nutrition-analysis';
                      }}
                    >
                      <FlaskConical className="w-5 h-5 mr-2" />
                      Access Premium Nutrition Analysis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kitchen Timer Tab */}
          <TabsContent value="timer" className="space-y-6 animate-fade-in">
            <Card className="border-orange-400 shadow-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Kitchen Timer</h2>
                    <p className="text-base text-orange-100 font-medium">Mood-based themes for perfect cooking timing</p>
                  </div>
                  <Badge className="ml-auto bg-green-500 text-white px-3 py-1 shadow-md">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CookingTimer />
              </CardContent>
            </Card>
          </TabsContent>

          {/* More Tab - All Additional Features */}
          <TabsContent value="more" className="space-y-6 animate-fade-in">
            <Card className="border-purple-400 shadow-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover-lift">
              <CardHeader className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-t-lg">
                <CardTitle className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Menu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">More Features</h2>
                    <p className="text-base text-purple-100 font-medium">Additional tools and premium features</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { 
                      id: 'stores', 
                      title: 'Find Stores', 
                      icon: MapPin, 
                      color: 'from-orange-500 to-red-500',
                      description: 'Find nearby grocery stores with real-time locations'
                    },
                    { 
                      id: 'shopping', 
                      title: 'Smart Shopping', 
                      icon: ShoppingBag, 
                      color: 'from-green-500 to-emerald-500',
                      description: 'Enhanced grocery lists with price comparison'
                    },
                    { 
                      id: 'nutrition', 
                      title: 'Nutrition Analysis', 
                      icon: FlaskConical, 
                      color: 'from-blue-500 to-cyan-500',
                      description: 'Enterprise-grade nutrition tracking'
                    },
                    { 
                      id: 'budget', 
                      title: 'Budget Tracker', 
                      icon: DollarSign, 
                      color: 'from-emerald-500 to-green-500',
                      description: 'Smart food budget management'
                    },
                    { 
                      id: 'calendar', 
                      title: 'Meal Planning', 
                      icon: Calendar, 
                      color: 'from-indigo-500 to-purple-500',
                      description: 'AI-assisted meal planning'
                    },
                    { 
                      id: 'categories', 
                      title: 'Food Categories', 
                      icon: Grid3X3, 
                      color: 'from-orange-500 to-red-500',
                      description: 'Browse recipes by category'
                    },
                    { 
                      id: 'subscribe', 
                      title: 'Premium Features', 
                      icon: Crown, 
                      color: 'from-yellow-500 to-orange-500',
                      description: 'Unlock all premium capabilities'
                    }
                  ].map((feature) => (
                    <Card 
                      key={feature.id}
                      className="border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-purple-50 hover-lift"
                      onClick={() => setActiveTab(feature.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-xl">{selectedRecipe.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecipe(null)}
                    className="text-white hover:bg-orange-700 -mt-2 -mr-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-lg overflow-hidden">
                    <img 
                      src={getRecipeImage(selectedRecipe.name)}
                      alt={selectedRecipe.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center hidden">
                      <ChefHat className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Description</h3>
                    <p className="text-gray-700">{selectedRecipe.description || 'Delicious recipe with fresh ingredients and step-by-step instructions.'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-700">30 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-700">4 servings</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                      onClick={() => {
                        setActiveTab('voice');
                        setSelectedRecipe(null);
                      }}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Start Cooking
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-orange-300 text-orange-600 flex-1"
                      onClick={() => {
                        setActiveTab('shopping');
                        setSelectedRecipe(null);
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Floating Voice Assistant */}
        <FloatingVoiceAssistant />
      </main>
      
      {/* Recipe Reader Modal */}
      {selectedRecipe && (
        <RecipeReaderModal 
          recipe={{
            id: selectedRecipe.id,
            name: selectedRecipe.name,
            description: selectedRecipe.description || 'Delicious recipe with fresh ingredients and step-by-step instructions.',
            instructions: selectedRecipe.instructions || [
              'Prepare all ingredients and gather cooking utensils.',
              'Follow the cooking steps carefully for best results.',
              'Season to taste and adjust as needed.',
              'Serve hot and enjoy your delicious meal!'
            ],
            ingredients: selectedRecipe.ingredients || [
              '2 cups all-purpose flour',
              '1 cup sugar',
              '1/2 cup butter',
              'Fresh herbs and spices',
              'Salt and pepper to taste'
            ],
            cookTime: selectedRecipe.cookTime || 30,
            servings: selectedRecipe.servings || 4
          }}
          isVisible={showRecipeReader}
          onClose={() => {
            setShowRecipeReader(false);
            setSelectedRecipe(null);
          }}
        />
      )}
    </FadeIn>
  );
}