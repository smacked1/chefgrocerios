import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Settings, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";
import { VoiceCommand } from "@/lib/voice-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ttsService } from "@/services/openai-tts";

export function VoiceCommandPanel() {
  const { 
    isListening, 
    isProcessing, 
    isSupported, 
    status, 
    lastCommand, 
    error, 
    startListening, 
    stopListening, 
    speak,
    clearError 
  } = useVoice();
  
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [lastResponse, setLastResponse] = useState<string>("");
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Process voice commands
  const processCommandMutation = useMutation({
    mutationFn: async (command: VoiceCommand) => {
      const result = await handleVoiceCommand(command);
      return result;
    },
    onSuccess: async (result) => {
      setLastResponse(result.message);
      if (result.shouldSpeak && result.message) {
        // Use OpenAI TTS for high-quality speech
        const success = await ttsService.smartSpeak(result.message, {
          voice: 'nova',
          speed: 0.9
        });
        if (!success) {
          // Fallback to built-in speak function
          speak(result.message);
        }
      }
      if (result.success) {
        toast({
          title: "Command Executed",
          description: result.message,
        });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
        queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        queryClient.invalidateQueries({ queryKey: ['grocery-items'] });
      }
    },
    onError: (error) => {
      const errorMessage = "Failed to process voice command";
      setLastResponse(errorMessage);
      toast({
        title: "Command Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Handle new voice commands
  useEffect(() => {
    if (lastCommand) {
      setCurrentTranscript(lastCommand.rawTranscript);
      setCommandHistory(prev => [lastCommand, ...prev.slice(0, 4)]); // Keep last 5 commands
      processCommandMutation.mutate(lastCommand);
    }
  }, [lastCommand]);

  // Handle voice command actions using Gemini AI
  const handleVoiceCommand = async (command: VoiceCommand) => {
    try {
      // First process the command with Gemini AI
      const response = await apiRequest('POST', '/api/gemini/voice/process', {
        command: command.rawTranscript
      });
      const aiResult = await response.json();
      
      // Execute the action based on Gemini's understanding
      switch (aiResult.intent) {
        case 'recipe_search':
          return await handleSearchRecipes(aiResult.parameters?.query || command.rawTranscript);
        case 'cooking_instructions':
          return await handleCookingInstructions(aiResult);
        case 'meal_plan':
          return await handlePlanMeal(aiResult.parameters || {});
        case 'grocery_list':
          return await handleAddGroceryItem(aiResult.parameters || {});
        case 'nutrition_info':
          return await handleNutritionQuery(aiResult.parameters || {});
        case 'cooking_help':
          return await handleCookingHelp(aiResult.parameters || {});
        case 'find_restaurants':
          return await handleFindRestaurants(aiResult.parameters || {});
        default:
          // Fallback to basic parsing if Gemini doesn't recognize intent
          return await handleBasicCommand(command);
      }
    } catch (error) {
      console.error('Gemini voice processing failed:', error);
      // Fallback to basic command handling
      return await handleBasicCommand(command);
    }
  };

  // Fallback basic command handling
  const handleBasicCommand = async (command: VoiceCommand) => {
    const transcript = command.rawTranscript.toLowerCase();
    
    if (transcript.includes('add') && transcript.includes('recipe')) {
      return await handleAddRecipe(transcript.replace(/add|recipe/g, '').trim());
    } else if (transcript.includes('plan') || transcript.includes('meal')) {
      return await handlePlanMeal({ meal: transcript.replace(/plan|meal/g, '').trim() });
    } else if (transcript.includes('grocery') || transcript.includes('shopping')) {
      return await handleAddGroceryItem({ item: transcript.replace(/grocery|shopping|list|add/g, '').trim() });
    } else if (transcript.includes('search') || transcript.includes('find')) {
      if (transcript.includes('restaurant') || transcript.includes('food near') || transcript.includes('places to eat')) {
        return await handleFindRestaurants({ query: transcript });
      } else {
        return await handleSearchRecipes(transcript.replace(/search|find|recipe/g, '').trim());
      }
    } else {
      return {
        success: false,
        message: "I didn't understand that command. Try saying 'help' to see what I can do.",
        shouldSpeak: true
      };
    }
  };

  // Handle nutrition queries using Gemini AI
  const handleNutritionQuery = async (params: any) => {
    try {
      const { foodItem, quantity } = params;
      const response = await apiRequest('POST', '/api/gemini/nutrition/analyze', {
        foodItem: foodItem || params.query,
        quantity: quantity || '1 serving'
      });
      const result = await response.json();
      
      const calories = result.calories || 0;
      const protein = result.macronutrients?.protein || 0;
      
      return {
        success: true,
        message: `${result.food} contains ${calories} calories and ${protein}g protein per ${result.quantity}`,
        shouldSpeak: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I couldn't get nutrition information right now",
        shouldSpeak: true
      };
    }
  };

  // Handle cooking instruction requests
  const handleCookingInstructions = async (aiResult: any) => {
    try {
      if (aiResult.cookingInstructions) {
        // We already have detailed instructions from the voice processing
        const instructions = aiResult.cookingInstructions;
        const recipeName = instructions.recipeName || aiResult.parameters?.recipe_name || "this dish";
        
        // Speak the overview first
        speak(instructions.overview);
        
        // Create a detailed spoken guide
        let spokenGuide = `Here's how to make ${recipeName}. `;
        spokenGuide += `You'll need: ${instructions.equipment?.slice(0, 3).join(', ')}.`;
        spokenGuide += ` Let me guide you through the steps. `;
        
        // Add first few steps with timing
        instructions.steps?.slice(0, 3).forEach((step: any, index: number) => {
          spokenGuide += `Step ${step.stepNumber}: ${step.instruction}`;
          if (step.timing) {
            spokenGuide += ` This should take about ${step.timing}.`;
          }
          if (step.tips) {
            spokenGuide += ` Pro tip: ${step.tips}`;
          }
          spokenGuide += ` `;
        });

        spokenGuide += `I've provided detailed instructions on screen for all steps. Happy cooking!`;
        
        return {
          success: true,
          message: `I'll guide you through making ${recipeName} step by step. Check the screen for detailed instructions.`,
          shouldSpeak: true,
          spokenMessage: spokenGuide,
          data: instructions
        };
      } else {
        // Fallback: Get instructions for the recipe name
        const recipeName = aiResult.parameters?.recipe_name || aiResult.parameters?.query;
        if (recipeName) {
          const response = await apiRequest('POST', '/api/gemini/cooking-instructions', {
            recipeName: recipeName
          });
          const instructions = await response.json();
          
          speak(`I'll guide you through making ${recipeName}. ${instructions.overview}`);
          
          return {
            success: true,
            message: `Here are step-by-step cooking instructions for ${recipeName}`,
            shouldSpeak: false, // Already spoken above
            data: instructions
          };
        } else {
          return {
            success: false,
            message: "I need to know what recipe you'd like instructions for. Try saying 'How to make chicken parmesan' or 'Step by step pasta carbonara'",
            shouldSpeak: true
          };
        }
      }
    } catch (error) {
      console.error('Cooking instructions error:', error);
      return {
        success: false,
        message: "Sorry, I couldn't get cooking instructions right now. Please try again.",
        shouldSpeak: true
      };
    }
  };

  // Handle cooking help using Gemini AI
  const handleCookingHelp = async (params: any) => {
    try {
      const ingredients = params.ingredients || [params.query];
      const result = await apiRequest('POST', '/api/gemini/recipe/generate', {
        ingredients,
        servings: 4,
        difficulty: 'medium'
      });
      
      const resultData = await result.json();
      return {
        success: true,
        message: `I can help you make ${resultData.name}. It takes about ${resultData.cookTime} minutes to cook.`,
        shouldSpeak: true,
        data: resultData
      };
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I couldn't find cooking help right now",
        shouldSpeak: true
      };
    }
  };

  // Handle restaurant search using Google navigation
  const handleFindRestaurants = async (params: any) => {
    try {
      const { location, cuisine, query } = params;
      const searchTerm = query || `${cuisine || 'restaurants'} near ${location || 'me'}`;
      
      // Use Google search and Maps for real restaurant navigation
      const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
      
      // Open Google Maps for navigation
      window.open(googleMapsUrl, '_blank');
      
      return {
        success: true,
        message: `Opening Google Maps to find ${searchTerm}. You can get directions and see reviews there.`,
        shouldSpeak: true,
        data: { googleMapsUrl, googleSearchUrl }
      };
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I couldn't open restaurant search right now",
        shouldSpeak: true
      };
    }
  };

  // Command handlers
  const handleAddRecipe = async (recipeName: string) => {
    if (!recipeName.trim()) {
      return { success: false, message: "Please specify a recipe name", shouldSpeak: true };
    }
    // Basic recipe creation - in real app, this would integrate with OpenAI
    const newRecipe = {
      name: recipeName,
      description: `Delicious ${recipeName} recipe`,
      ingredients: ["To be added"],
      instructions: ["Instructions to be added"],
      prepTime: 30,
      cookTime: 30,
      servings: 4
    };
    
    try {
      await apiRequest('POST', '/api/recipes', newRecipe);
      return { 
        success: true, 
        message: `Added ${recipeName} to your recipes`, 
        shouldSpeak: true 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to add ${recipeName}`, 
        shouldSpeak: true 
      };
    }
  };

  const handlePlanMeal = async (params: any) => {
    const { meal, mealType, date } = params;
    if (!meal.trim()) {
      return { success: false, message: "Please specify what meal to plan", shouldSpeak: true };
    }
    
    const newMealPlan = {
      date: date || new Date().toISOString().split('T')[0],
      mealType: mealType || 'dinner',
      recipeName: meal,
      status: 'planned' as const
    };
    
    try {
      await apiRequest('POST', '/api/meal-plans', newMealPlan);
      return { 
        success: true, 
        message: `Planned ${meal} for ${mealType} ${date === new Date().toISOString().split('T')[0] ? 'today' : 'tomorrow'}`, 
        shouldSpeak: true 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to plan ${meal}`, 
        shouldSpeak: true 
      };
    }
  };

  const handleAddGroceryItem = async (params: any) => {
    const { item, quantity } = params;
    if (!item.trim()) {
      return { success: false, message: "Please specify what to add to your grocery list", shouldSpeak: true };
    }
    
    const newGroceryItem = {
      name: item,
      quantity: quantity || "1",
      category: "Other",
      purchased: false
    };
    
    try {
      await apiRequest('POST', '/api/grocery-items', newGroceryItem);
      return { 
        success: true, 
        message: `Added ${item} to your grocery list`, 
        shouldSpeak: true 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to add ${item} to grocery list`, 
        shouldSpeak: true 
      };
    }
  };

  const handleSearchRecipes = async (query: string) => {
    if (!query.trim()) {
      return { success: false, message: "Please specify what recipes to search for", shouldSpeak: true };
    }
    
    return { 
      success: true, 
      message: `Searching for ${query} recipes. Check the Recipe Discovery section below.`, 
      shouldSpeak: true 
    };
  };

  const handleGetNutrition = async (food: string) => {
    if (!food.trim()) {
      return { success: false, message: "Please specify what food to get nutrition information for", shouldSpeak: true };
    }
    
    return { 
      success: true, 
      message: `Getting nutrition information for ${food}. Check the Food Database section below.`, 
      shouldSpeak: true 
    };
  };

  const handleSetTimer = async (params: any) => {
    const { duration, label } = params;
    return { 
      success: true, 
      message: `Setting ${duration} minute timer for ${label}`, 
      shouldSpeak: true 
    };
  };

  const handleFindStores = async (location: string) => {
    return { 
      success: true, 
      message: `Finding grocery stores near ${location}. Check the Store Finder section below.`, 
      shouldSpeak: true 
    };
  };

  const handleShowHelp = () => {
    const helpMessage = "I can help you with recipes, meal planning, grocery lists, nutrition information, timers, and finding stores. Try saying 'add recipe for pasta', 'plan dinner for today', or 'add milk to grocery list'.";
    return { 
      success: true, 
      message: helpMessage, 
      shouldSpeak: true 
    };
  };

  const handleStartListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }
    
    clearError();
    startListening();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'listening':
        return <Mic className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MicOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready to listen';
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6 text-center">
          <VolumeX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Voice Not Available</h3>
          <p className="text-gray-600">Your browser doesn't support voice recognition. Please use a modern browser like Chrome, Edge, or Safari.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Voice Assistant</h3>
              <p className="text-sm text-gray-600">Speak naturally to control ChefGrocer</p>
            </div>
          </div>
          
          <Badge variant={status === 'listening' ? 'default' : 'secondary'} className="flex items-center space-x-1">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </Badge>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center space-x-3 mb-4">
          <Button
            onClick={isListening ? stopListening : handleStartListening}
            disabled={isProcessing}
            className={`flex-1 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Voice Command
              </>
            )}
          </Button>
        </div>

        {/* Current Transcript */}
        {currentTranscript && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">You said:</p>
            <p className="text-gray-800 font-medium">"{currentTranscript}"</p>
          </div>
        )}

        {/* Last Response */}
        {lastResponse && (
          <div className="mb-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
            <p className="text-sm text-blue-600 mb-1">Assistant:</p>
            <p className="text-blue-800">{lastResponse}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 rounded-lg border border-red-300">
            <p className="text-sm text-red-600 mb-1">Error:</p>
            <p className="text-red-800">{error}</p>
            <Button 
              onClick={clearError} 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Clear Error
            </Button>
          </div>
        )}

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Recent Commands:</p>
            <div className="space-y-2">
              {commandHistory.slice(0, 3).map((cmd, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                  <span className="text-sm text-gray-700 truncate">"{cmd.rawTranscript}"</span>
                  <Badge variant="outline" className="text-xs">
                    {cmd.action.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Try saying:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
            <div>"How to make chicken parmesan"</div>
            <div>"Step by step pasta carbonara"</div>
            <div>"Cook me some pancakes"</div>
            <div>"Guide me through making pizza"</div>
            <div>"Add milk to grocery list"</div>
            <div>"Find restaurants near me"</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}