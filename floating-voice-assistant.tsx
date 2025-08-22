import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, X, Volume2, Minimize2, Maximize2, Settings, MessageCircle } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";
import { VoiceCommand } from "@/lib/voice-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function FloatingVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    text: string;
    timestamp: Date;
  }>>([]);

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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Quick voice command processing
  const processQuickCommand = useMutation({
    mutationFn: async (command: VoiceCommand) => {
      return await handleQuickVoiceCommand(command);
    },
    onSuccess: (result) => {
      addToConversation('assistant', result.message);
      if (result.shouldSpeak) {
        speak(result.message, { interrupt: true });
      }
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
        queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
        queryClient.invalidateQueries({ queryKey: ['grocery-items'] });
      }
    }
  });

  useEffect(() => {
    if (lastCommand) {
      addToConversation('user', lastCommand.rawTranscript);
      processQuickCommand.mutate(lastCommand);
    }
  }, [lastCommand]);

  const addToConversation = (type: 'user' | 'assistant', text: string) => {
    setConversationHistory(prev => [
      { type, text, timestamp: new Date() },
      ...prev.slice(0, 9) // Keep last 10 messages
    ]);
  };

  const handleQuickVoiceCommand = async (command: VoiceCommand) => {
    const responses = {
      add_recipe: `I'll help you add ${command.parameters.recipe} to your recipes.`,
      plan_meal: `Planning ${command.parameters.meal} for ${command.parameters.mealType || 'dinner'}.`,
      add_grocery_item: `Added ${command.parameters.item} to your grocery list.`,
      search_recipes: `Searching for ${command.parameters.query} recipes.`,
      get_nutrition: `Getting nutrition facts for ${command.parameters.food}.`,
      set_timer: `Timer set for ${command.parameters.duration} minutes.`,
      find_stores: `Finding stores near ${command.parameters.location}.`,
      show_help: "I can help with recipes, meal planning, grocery lists, nutrition info, timers, and store finding."
    };

    const message = responses[command.action as keyof typeof responses] || 
      "I understand you want help with cooking. Let me assist you!";

    return {
      success: true,
      message,
      shouldSpeak: true
    };
  };

  const handleToggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      clearError();
      setIsOpen(true);
      startListening();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'bg-blue-500 animate-pulse';
      case 'processing':
        return 'bg-orange-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
          >
            <Volume2 className="h-6 w-6 text-white" />
          </Button>
          
          {/* Status Indicator */}
          {(isListening || isProcessing) && (
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor()}`} />
          )}
        </div>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80">
          <Card className="shadow-2xl border-2 border-blue-200">
            <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span className="font-medium">Voice Assistant</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-blue-600 h-6 w-6 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-blue-600 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <CardContent className="p-4 max-h-96 overflow-hidden">
                {/* Status Display */}
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant={status === 'listening' ? 'default' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                    <span className="capitalize">{status}</span>
                  </Badge>

                  <Button
                    onClick={handleToggleListening}
                    disabled={isProcessing}
                    size="sm"
                    className={isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                  >
                    <Mic className="h-3 w-3 mr-1" />
                    {isListening ? 'Stop' : 'Talk'}
                  </Button>
                </div>

                {/* Conversation History */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Click "Talk" to start a conversation</p>
                      <p className="text-xs mt-1">Try: "Add milk to grocery list"</p>
                    </div>
                  ) : (
                    conversationHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-sm ${
                          msg.type === 'user'
                            ? 'bg-blue-100 text-blue-800 ml-4'
                            : 'bg-gray-100 text-gray-800 mr-4'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p>{msg.text}</p>
                          <span className="text-xs opacity-60 ml-2">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-3 p-2 bg-red-100 rounded text-red-800 text-sm">
                    <p>{error}</p>
                    <Button 
                      onClick={clearError} 
                      variant="ghost" 
                      size="sm" 
                      className="mt-1 text-red-600 hover:text-red-800 h-6 px-2"
                    >
                      Clear
                    </Button>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Quick voice commands:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="text-gray-600">"Add recipe"</div>
                    <div className="text-gray-600">"Plan meal"</div>
                    <div className="text-gray-600">"Grocery list"</div>
                    <div className="text-gray-600">"Find recipes"</div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}