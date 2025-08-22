import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square, Volume2, Lock } from 'lucide-react';

interface RecipeReaderProps {
  recipe: {
    id: string;
    name: string;
    description: string;
    instructions: string[];
    ingredients: string[];
    cookTime: number;
    servings: number;
  };
  isVisible: boolean;
  onClose: () => void;
}

interface TextChunk {
  text: string;
  type: 'instruction' | 'ingredient';
  index: number;
}

export default function RecipeReaderModal({ recipe, isVisible, onClose }: RecipeReaderProps) {
  const { toast } = useToast();
  
  // Voice playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [hasVoiceAccess] = useState(false); // Always false for demo, shows subscription gate
  
  // Audio management
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Create text chunks from recipe content
  const createTextChunks = useCallback(() => {
    const textChunks: TextChunk[] = [];
    
    // Add introduction
    textChunks.push({
      text: `Let's cook ${recipe.name}. This recipe serves ${recipe.servings} and takes about ${recipe.cookTime} minutes.`,
      type: 'instruction',
      index: -1
    });
    
    // Add ingredients
    if (recipe.ingredients?.length > 0) {
      textChunks.push({
        text: "Here are the ingredients you'll need:",
        type: 'instruction',
        index: -2
      });
      
      recipe.ingredients.forEach((ingredient, index) => {
        textChunks.push({
          text: ingredient,
          type: 'ingredient',
          index
        });
      });
    }
    
    // Add cooking instructions
    if (recipe.instructions?.length > 0) {
      textChunks.push({
        text: "Now let's start cooking:",
        type: 'instruction',
        index: -3
      });
      
      recipe.instructions.forEach((instruction, index) => {
        // Split long instructions into sentences for better pacing
        const sentences = instruction.match(/[^\.!?]+[\.!?]+/g) || [instruction];
        sentences.forEach((sentence, sentenceIndex) => {
          textChunks.push({
            text: `Step ${index + 1}${sentences.length > 1 ? `, part ${sentenceIndex + 1}` : ''}: ${sentence.trim()}`,
            type: 'instruction',
            index
          });
        });
      });
    }
    
    // Add completion message
    textChunks.push({
      text: `Great job! You've completed cooking ${recipe.name}. Enjoy your meal!`,
      type: 'instruction',
      index: -4
    });
    
    return textChunks;
  }, [recipe]);

  useEffect(() => {
    if (isVisible) {
      setChunks(createTextChunks());
    }
  }, [isVisible, createTextChunks]);

  // Web Speech API fallback (free tier)
  const speakWithBrowser = async (text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        
        // Select best available voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onend = () => {
          currentUtteranceRef.current = null;
          resolve(true);
        };
        
        utterance.onerror = () => {
          currentUtteranceRef.current = null;
          resolve(false);
        };
        
        currentUtteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
      } else {
        resolve(false);
      }
    });
  };

  // Play current chunk
  const playCurrentChunk = async () => {
    if (currentChunkIndex >= chunks.length) {
      setIsPlaying(false);
      setCurrentChunkIndex(0);
      return;
    }
    
    const chunk = chunks[currentChunkIndex];
    const success = await speakWithBrowser(chunk.text);
    
    if (success) {
      // Auto-advance to next chunk after current finishes
      setTimeout(() => {
        if (isPlaying && !isPaused) {
          setCurrentChunkIndex(prev => prev + 1);
        }
      }, 100);
    } else {
      toast({
        title: "Playback Error",
        description: "Could not play audio. Please try again.",
        variant: "destructive"
      });
      setIsPlaying(false);
    }
  };

  // Control functions
  const handlePlay = async () => {
    if (!hasVoiceAccess) {
      // Redirect to subscription page
      window.location.href = '/subscription?feature=voice_reading&upgrade=true';
      return;
    }
    
    setIsPlaying(true);
    setIsPaused(false);
    
    if (currentChunkIndex >= chunks.length) {
      setCurrentChunkIndex(0);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    
    if (currentUtteranceRef.current) {
      speechSynthesis.pause();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
    
    if (currentUtteranceRef.current) {
      speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }
  };

  // Play chunks sequentially
  useEffect(() => {
    if (isPlaying && !isPaused && chunks.length > 0) {
      playCurrentChunk();
    }
  }, [isPlaying, isPaused, currentChunkIndex, chunks]);

  // Auto-advance chunks
  useEffect(() => {
    if (currentChunkIndex >= chunks.length && isPlaying) {
      setIsPlaying(false);
      toast({
        title: "Recipe Complete",
        description: "Finished reading the entire recipe!",
      });
    }
  }, [currentChunkIndex, chunks.length, isPlaying, toast]);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {recipe.name}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{recipe.description}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">{recipe.cookTime} mins</Badge>
                  <Badge variant="outline">{recipe.servings} servings</Badge>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose} className="text-gray-500">
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Voice Controls */}
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Voice Reading</span>
                  {!hasVoiceAccess && (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {currentChunkIndex + 1} / {chunks.length} sections
                </div>
              </div>
              
              {!hasVoiceAccess ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Voice reading with professional AWS voices requires a premium subscription
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/subscription?feature=voice_reading&upgrade=true'}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Upgrade to Unlock Voice Reading
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handlePlay}
                    disabled={isPlaying && !isPaused}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                  
                  <Button
                    onClick={handlePause}
                    disabled={!isPlaying || isPaused}
                    size="sm"
                    variant="outline"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                  
                  <Button
                    onClick={handleStop}
                    disabled={!isPlaying}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                </div>
              )}
            </div>

            {/* Recipe Content with Progress Indicator */}
            <div className="space-y-4">
              {chunks.map((chunk, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg transition-colors ${
                    index === currentChunkIndex && isPlaying
                      ? 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-600'
                      : index < currentChunkIndex && isPlaying
                      ? 'bg-green-50 dark:bg-green-900/20 opacity-70'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Badge 
                      variant={chunk.type === 'instruction' ? 'default' : 'secondary'}
                      className="mt-0.5 text-xs"
                    >
                      {chunk.type === 'instruction' ? 'Step' : 'Ingredient'}
                    </Badge>
                    <p className="text-gray-800 dark:text-gray-200 flex-1">
                      {chunk.text}
                    </p>
                    {index === currentChunkIndex && isPlaying && (
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recipe Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Ingredients</h4>
                <ul className="space-y-2">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Instructions</h4>
                <ol className="space-y-3">
                  {recipe.instructions?.map((instruction, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className="text-orange-600 font-medium mr-3 mt-0.5 min-w-[1.5rem]">
                        {index + 1}.
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}