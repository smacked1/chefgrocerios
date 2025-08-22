import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Clock, Users, Lightbulb, Play, Pause, SkipForward, Volume2 } from "lucide-react";

interface Recipe {
  id?: string;
  name: string;
  ingredients?: string[];
  instructions?: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: string;
}

interface RecipeAIInstructionsProps {
  recipe: Recipe;
  className?: string;
}

export function RecipeAIInstructions({ recipe, className }: RecipeAIInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const generateInstructionsMutation = useMutation({
    mutationFn: async (recipeData: Recipe) => {
      const response = await apiRequest("POST", "/api/ai/recipe-instructions", {
        recipe: recipeData,
        includeVoice: true,
        includeNutrition: true,
        includeTips: true
      });
      return await response.json();
    },
    onError: () => {
      toast({
        title: "AI Instructions Unavailable",
        description: "Unable to generate cooking instructions right now. Please try again.",
        variant: "destructive",
      });
    }
  });

  const voiceInstructionMutation = useMutation({
    mutationFn: async (instruction: string) => {
      const response = await apiRequest("POST", "/api/ai/voice-instruction", {
        text: instruction,
        voice: "cooking-assistant"
      });
      return await response.json();
    }
  });

  const handleGetAIInstructions = () => {
    generateInstructionsMutation.mutate(recipe);
    setIsExpanded(true);
  };

  const handlePlayStep = (stepIndex: number) => {
    const instruction = aiInstructions?.steps?.[stepIndex]?.text;
    if (instruction) {
      voiceInstructionMutation.mutate(instruction);
      setCurrentStep(stepIndex);
      setIsPlaying(true);
    }
  };

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    if (aiInstructions?.steps && nextStep < aiInstructions.steps.length) {
      setCurrentStep(nextStep);
      handlePlayStep(nextStep);
    }
  };

  const aiInstructions = generateInstructionsMutation.data;

  if (!isExpanded) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <ChefHat className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Get AI Cooking Instructions</h3>
            <p className="text-gray-600 mb-4">
              Get step-by-step voice guidance, cooking tips, and personalized instructions for this recipe
            </p>
            <Button 
              onClick={handleGetAIInstructions}
              disabled={generateInstructionsMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {generateInstructionsMutation.isPending ? "Generating Instructions..." : "Start AI Cooking Assistant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChefHat className="h-5 w-5 mr-2 text-orange-500" />
          AI Cooking Assistant: {recipe.name}
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {recipe.prepTime && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Prep: {recipe.prepTime}
            </div>
          )}
          {recipe.cookTime && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Cook: {recipe.cookTime}
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Serves {recipe.servings}
            </div>
          )}
          {recipe.difficulty && (
            <Badge variant="secondary">
              {recipe.difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {generateInstructionsMutation.isPending ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">AI is analyzing the recipe and creating personalized instructions...</p>
          </div>
        ) : aiInstructions ? (
          <>
            {/* AI Overview */}
            {aiInstructions.overview && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  AI Cooking Overview
                </h4>
                <p className="text-orange-700">{aiInstructions.overview}</p>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            {aiInstructions.steps && (
              <div>
                <h4 className="font-semibold mb-3">Step-by-Step Instructions</h4>
                <div className="space-y-3">
                  {aiInstructions.steps.map((step: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-4 border rounded-lg transition-all ${
                        currentStep === index 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm text-orange-600">
                          Step {index + 1}
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePlayStep(index)}
                            disabled={voiceInstructionMutation.isPending}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          {currentStep === index && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleNextStep}
                            >
                              <SkipForward className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700">{step.text}</p>
                      {step.timer && (
                        <div className="mt-2 text-sm text-blue-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Timer: {step.timer}
                        </div>
                      )}
                      {step.tip && (
                        <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                          💡 Tip: {step.tip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Controls */}
            <div className="flex justify-center space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous Step
              </Button>
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                variant="outline"
                onClick={handleNextStep}
                disabled={!aiInstructions?.steps || currentStep >= aiInstructions.steps.length - 1}
              >
                Next Step
              </Button>
            </div>

            {/* AI Tips */}
            {aiInstructions.tips && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">AI Cooking Tips</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  {aiInstructions.tips.map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">Unable to generate AI instructions. Please try again.</p>
            <Button 
              onClick={handleGetAIInstructions}
              variant="outline"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}