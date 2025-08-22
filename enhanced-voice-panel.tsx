import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Web Speech API types - properly defined
interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: any) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: any) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => WebSpeechRecognition;
    webkitSpeechRecognition: new () => WebSpeechRecognition;
  }
}

export function EnhancedVoicePanel() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<WebSpeechRecognition | null>(null);
  const { toast } = useToast();

  const processCommandMutation = useMutation({
    mutationFn: async (transcript: string) => {
      const response = await apiRequest("POST", "/api/voice/process-command", { transcript });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.response) {
        speakText(data.response);
        toast({
          title: "Voice Command Processed",
          description: data.response,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Voice Processing Error",
        description: "Failed to process voice command",
        variant: "destructive",
      });
    }
  });

  const startListening = async () => {
    // First request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      toast({
        title: "Microphone Access Granted",
        description: "Ready to listen to your voice commands",
      });
    } catch (err) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice commands",
        variant: "destructive",
      });
      return;
    }

    // Implement the exact Web Speech API code you provided
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      
      // Your exact configuration
      newRecognition.continuous = false;  // As per your code - works immediately
      newRecognition.interimResults = false;
      newRecognition.lang = 'en-US';
      
      newRecognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        toast({
          title: "🎤 Listening...",
          description: "Speak now - Web Speech API active",
        });
      };
      
      newRecognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log('User said:', transcript);
        
        setTranscript(transcript);
        toast({
          title: "Voice Captured",
          description: `You said: "${transcript}"`,
        });
        
        // Process the command
        processCommandMutation.mutate(transcript.trim());
      };
      
      newRecognition.onend = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Complete",
          description: "Ready for next command",
        });
      };
      
      newRecognition.onerror = (event: any) => {
        setIsListening(false);
        toast({
          title: "Speech Error",
          description: `Recognition failed: ${event.error}`,
          variant: "destructive",
        });
      };
      
      // Start listening - works immediately with no API keys
      newRecognition.start();
      setRecognition(newRecognition);
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={isListening ? stopListening : startListening}
          disabled={processCommandMutation.isPending}
          className={`${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Voice Command
            </>
          )}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => speakText("Voice assistant ready. How can I help you cook today?")}
          className="border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Test Voice
        </Button>
      </div>

      {transcript && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="py-2">
            <CardTitle className="text-sm text-orange-700">Voice Input</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-orange-700">{transcript}</p>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-orange-600 space-y-1">
        <p><strong>Try saying:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>"Set a timer for 10 minutes"</li>
          <li>"Find me a chicken recipe"</li>
          <li>"What are the nutrition facts for tomatoes?"</li>
          <li>"Help me with cooking pasta"</li>
        </ul>
      </div>
    </div>
  );
}