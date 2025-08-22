import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceRecipeReader } from "@/services/voice-recipe-reader";
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Volume2,
  BookOpen,
  Clock,
  ChefHat
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecipeReaderProps {
  recipe?: any;
}

export function VoiceRecipeReaderComponent({ recipe }: VoiceRecipeReaderProps) {
  const [isReading, setIsReading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [voiceReader] = useState(() => new VoiceRecipeReader());
  const { toast } = useToast();

  const handleStartReading = async () => {
    if (!recipe) {
      toast({
        title: "No Recipe Selected",
        description: "Please select a recipe to read aloud",
        variant: "destructive",
      });
      return;
    }

    setIsReading(true);
    try {
      await voiceReader.readFullRecipe(recipe, currentStep);
    } catch (error) {
      console.error('Voice reading error:', error);
      toast({
        title: "Voice Reading Error",
        description: "Unable to read recipe aloud",
        variant: "destructive",
      });
    } finally {
      setIsReading(false);
    }
  };

  const handlePauseReading = () => {
    voiceReader.pauseReading();
    setIsReading(false);
    setCurrentStep(voiceReader.getCurrentStep());
  };

  const handleStopReading = () => {
    voiceReader.pauseReading();
    setIsReading(false);
    setCurrentStep(0);
  };

  const handleResumeReading = () => {
    if (voiceReader.getCurrentStep() > 0) {
      setIsReading(true);
      voiceReader.resumeReading();
    } else {
      handleStartReading();
    }
  };

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-green-900">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          Voice Recipe Reader
          <Badge className="bg-green-500 text-white">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipe ? (
          <div className="space-y-4">
            {/* Recipe Info */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <img
                  src={recipe.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'}
                  alt={recipe.title || recipe.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 mb-1">
                    {recipe.title || recipe.name}
                  </h3>
                  <div className="flex gap-4 text-sm text-green-700">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.readyInMinutes || 30} min
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-4 h-4" />
                      {recipe.servings || 4} servings
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Controls */}
            <div className="flex gap-2 flex-wrap">
              {!isReading ? (
                <Button
                  onClick={currentStep > 0 ? handleResumeReading : handleStartReading}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {currentStep > 0 ? 'Resume Reading' : 'Start Reading'}
                </Button>
              ) : (
                <Button
                  onClick={handlePauseReading}
                  variant="outline"
                  className="border-orange-500 text-orange-600 flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}

              <Button
                onClick={handleStopReading}
                variant="outline"
                className="border-red-500 text-red-600 flex items-center gap-2"
                disabled={!isReading && currentStep === 0}
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>

              {currentStep > 0 && (
                <Badge className="bg-blue-500 text-white flex items-center gap-1">
                  <SkipForward className="w-3 h-3" />
                  Step {currentStep + 1}
                </Badge>
              )}
            </div>

            {/* Reading Status */}
            {isReading && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Reading recipe aloud...</span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="text-xs text-green-600 space-y-1">
              <p><strong>✅ Smart Chunking:</strong> Breaks instructions into easy-to-follow steps</p>
              <p><strong>✅ Ingredient Reading:</strong> Reads all ingredients before instructions</p>
              <p><strong>✅ Pause & Resume:</strong> Continue from where you left off</p>
              <p><strong>✅ Hands-Free:</strong> Perfect for cooking while listening</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-green-600">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <p className="text-lg font-medium mb-2">No Recipe Selected</p>
            <p className="text-sm">Choose a recipe from the Recipes tab to enable voice reading</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}