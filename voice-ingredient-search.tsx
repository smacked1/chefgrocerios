import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Search, Volume2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface IngredientSearchResult {
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
  };
  allergens: string[];
  commonUses: string[];
  storageInstructions?: string;
  estimatedPrice?: string;
}

interface VoiceIngredientSearchProps {
  onIngredientSelect?: (ingredient: IngredientSearchResult) => void;
}

export function VoiceIngredientSearch({ onIngredientSelect }: VoiceIngredientSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<IngredientSearchResult[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setConfidence(0);
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
            setConfidence(event.results[i][0].confidence);
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          setSearchQuery(finalTranscript);
          handleSearch(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest(`/api/search/ingredients`, {
        method: 'POST',
        body: JSON.stringify({ query, useAI: true }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onSuccess: (data) => {
      setSearchResults(data.results || []);
      if (data.results?.length === 0) {
        toast({
          title: "No Results",
          description: "No ingredients found. Try searching for something else.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Search Error",
        description: "Failed to search ingredients. Please try again.",
        variant: "destructive",
      });
    }
  });

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Voice recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        toast({
          title: "Listening...",
          description: "Speak the name of an ingredient you want to search for.",
        });
      } catch (error) {
        toast({
          title: "Voice Error",
          description: "Could not start voice recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      searchMutation.mutate(query.trim());
    }
  };

  const handleManualSearch = () => {
    handleSearch(searchQuery);
  };

  const speakResult = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleIngredientClick = (ingredient: IngredientSearchResult) => {
    if (onIngredientSelect) {
      onIngredientSelect(ingredient);
    }
    
    // Speak ingredient information
    const info = `${ingredient.name}: ${ingredient.calories} calories per ${ingredient.servingSize}. ${ingredient.nutritionInfo.protein}g protein, ${ingredient.nutritionInfo.carbs}g carbs, ${ingredient.nutritionInfo.fat}g fat.`;
    speakResult(info);
    
    toast({
      title: "Ingredient Selected",
      description: `${ingredient.name} has been selected`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Voice Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-orange-600" />
            Voice-Activated Ingredient Search
          </CardTitle>
          <CardDescription>
            Speak or type to search for ingredients with detailed nutrition information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Type ingredient name or use voice search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSearch();
                  }
                }}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                disabled={!isSupported}
                className="min-w-[120px]"
              >
                {isListening ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <MicOff className="h-4 w-4" />
                    </div>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    {isSupported ? "Listen" : "Not Supported"}
                  </>
                )}
              </Button>
              <Button
                onClick={handleManualSearch}
                disabled={!searchQuery.trim() || searchMutation.isPending}
                variant="outline"
              >
                {searchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Real-time transcript */}
          {(isListening || transcript) && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  {isListening ? "Listening..." : "Heard:"}
                </span>
                {confidence > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
              <p className="text-orange-800 dark:text-orange-200 font-medium">
                {transcript || "Start speaking..."}
              </p>
            </div>
          )}

          {/* Search Status */}
          {searchMutation.isPending && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching ingredients...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Found {searchResults.length} ingredient{searchResults.length !== 1 ? 's' : ''}
          </h3>
          
          <div className="grid gap-4">
            {searchResults.map((ingredient, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-orange-500"
                onClick={() => handleIngredientClick(ingredient)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{ingredient.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{ingredient.category}</Badge>
                        {ingredient.subCategory && (
                          <Badge variant="outline">{ingredient.subCategory}</Badge>
                        )}
                        {ingredient.brand && (
                          <Badge variant="outline">{ingredient.brand}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {ingredient.calories}
                      </div>
                      <div className="text-sm text-gray-600">
                        cal/{ingredient.servingSize}
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Info */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-semibold text-sm">{ingredient.nutritionInfo.protein}g</div>
                      <div className="text-xs text-gray-600">Protein</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-semibold text-sm">{ingredient.nutritionInfo.carbs}g</div>
                      <div className="text-xs text-gray-600">Carbs</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-semibold text-sm">{ingredient.nutritionInfo.fat}g</div>
                      <div className="text-xs text-gray-600">Fat</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-semibold text-sm">{ingredient.nutritionInfo.fiber}g</div>
                      <div className="text-xs text-gray-600">Fiber</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-semibold text-sm">{ingredient.nutritionInfo.sugar}g</div>
                      <div className="text-xs text-gray-600">Sugar</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-semibold text-sm">{ingredient.nutritionInfo.sodium}mg</div>
                      <div className="text-xs text-gray-600">Sodium</div>
                    </div>
                  </div>

                  {/* Allergens */}
                  {ingredient.allergens.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">Allergens:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ingredient.allergens.map((allergen, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakResult(`${ingredient.name}: ${ingredient.calories} calories per ${ingredient.servingSize}`);
                        }}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Hear Info
                      </Button>
                    </div>
                    {ingredient.estimatedPrice && (
                      <div className="font-medium text-green-600">
                        ~{ingredient.estimatedPrice}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchQuery && searchResults.length === 0 && !searchMutation.isPending && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ingredients found</h3>
            <p className="text-gray-600 mb-4">
              Try searching for a different ingredient or use more specific terms.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}