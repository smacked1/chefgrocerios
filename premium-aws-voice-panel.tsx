import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Mic, MicOff, Crown, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionGate } from './subscription-gate';

interface PremiumAWSVoicePanelProps {
  recipe?: any;
  userSubscription?: string;
}

interface Voice {
  id: string;
  name: string;
  gender: string;
  languageCode: string;
}

export function PremiumAWSVoicePanel({ recipe, userSubscription = 'free' }: PremiumAWSVoicePanelProps) {
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('Joanna');
  const [isReading, setIsReading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voiceUsageMinutes, setVoiceUsageMinutes] = useState(0);
  const { toast } = useToast();

  const isSubscribed = ['premium', 'pro', 'lifetime'].includes(userSubscription);
  const monthlyLimit = userSubscription === 'pro' ? 500 : userSubscription === 'premium' ? 200 : 60;

  useEffect(() => {
    loadAvailableVoices();
    loadUsageStats();
  }, []);

  const loadAvailableVoices = async () => {
    try {
      const response = await fetch('/api/aws/polly/voices');
      const data = await response.json();
      setAvailableVoices(data.voices || []);
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/user/voice-usage');
      if (response.ok) {
        const data = await response.json();
        setVoiceUsageMinutes(data.minutesUsed || 0);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const handleSpeakWithChef = async () => {
    if (!recipe) {
      toast({
        title: "No Recipe Selected",
        description: "Please select a recipe first to use voice reading.",
        variant: "destructive",
      });
      return;
    }

    if (voiceUsageMinutes >= monthlyLimit) {
      toast({
        title: "Voice Limit Reached",
        description: `You've reached your monthly limit of ${monthlyLimit} minutes.`,
        variant: "destructive",
      });
      return;
    }

    setIsReading(true);
    const startTime = Date.now();

    try {
      // Format recipe for professional reading
      const recipeText = formatRecipeForVoice(recipe);

      const response = await fetch('/api/aws/polly/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: recipeText,
          voiceId: selectedVoice,
          outputFormat: 'mp3'
        }),
      });

      if (!response.ok) {
        throw new Error(`Voice synthesis failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      await new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve(null);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play();
      });

      // Track usage
      const duration = Math.ceil((Date.now() - startTime) / 60000); // Convert to minutes
      await trackVoiceUsage(duration);
      
      toast({
        title: "Recipe Reading Complete",
        description: `Professional voice reading completed in ${duration} minute(s).`,
      });

    } catch (error) {
      console.error('Voice reading error:', error);
      toast({
        title: "Voice Reading Failed",
        description: "Failed to read recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReading(false);
    }
  };

  const handleTranscribeVoice = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'voice-command.webm');

          const response = await fetch('/api/aws/transcribe/audio', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status}`);
          }

          const result = await response.json();
          setTranscript(result.transcript || '');
          
          if (result.transcript) {
            toast({
              title: "Voice Command Transcribed",
              description: `"${result.transcript}"`,
            });
            
            // Process the command with AI
            await processVoiceCommand(result.transcript);
          }
        } catch (error) {
          console.error('Transcription failed:', error);
          toast({
            title: "Transcription Failed",
            description: "Failed to process voice command. Please try again.",
            variant: "destructive",
          });
        }
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Voice Command",
        description: "Speak your cooking question or command...",
      });
    } catch (error) {
      console.error('Recording start failed:', error);
      toast({
        title: "Recording Failed",
        description: "Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const formatRecipeForVoice = (recipe: any): string => {
    let text = `Here's your recipe for ${recipe.name || recipe.title}. `;
    
    if (recipe.description) {
      text += `${recipe.description}. `;
    }

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      text += `You'll need the following ingredients: `;
      recipe.ingredients.forEach((ingredient: string, index: number) => {
        text += `${ingredient}`;
        if (index < recipe.ingredients.length - 1) {
          text += ', ';
        }
      });
      text += '. ';
    }

    if (recipe.instructions && recipe.instructions.length > 0) {
      text += `Now for the cooking instructions: `;
      recipe.instructions.forEach((instruction: string, index: number) => {
        text += `Step ${index + 1}: ${instruction}. `;
      });
    }

    text += `Enjoy your cooking!`;
    return text;
  };

  const trackVoiceUsage = async (minutes: number) => {
    try {
      await fetch('/api/user/track-voice-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minutes }),
      });
      setVoiceUsageMinutes(prev => prev + minutes);
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  };

  const processVoiceCommand = async (command: string) => {
    try {
      const response = await fetch('/api/ai/process-voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.response) {
          // Speak the AI response
          await speakResponse(result.response);
        }
      }
    } catch (error) {
      console.error('AI processing error:', error);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      const response = await fetch('/api/aws/polly/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voiceId: selectedVoice,
          outputFormat: 'mp3'
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(audioUrl);
      }
    } catch (error) {
      console.error('Response speaking error:', error);
    }
  };

  const usagePercentage = (voiceUsageMinutes / monthlyLimit) * 100;

  return (
    <SubscriptionGate 
      feature="Premium AWS Voice"
      requiredTier="premium"
      userTier={userSubscription}
    >
      <Card className="border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Premium AWS Voice Chef</h3>
              <p className="text-purple-100 text-sm">Professional voice synthesis & transcription</p>
            </div>
            <Badge className="ml-auto bg-yellow-500 text-black">Premium</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Voice Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-purple-700">Select Voice</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="border-purple-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} ({voice.gender})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Usage Indicator */}
          <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Voice Usage This Month</span>
              <span className="text-sm text-purple-600">{voiceUsageMinutes}/{monthlyLimit} minutes</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Voice Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Speak with Chef */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Recipe Voice Reading</h4>
              <p className="text-sm text-blue-600 mb-4">
                Listen to your recipe with professional AWS Polly voices
              </p>
              <Button
                onClick={handleSpeakWithChef}
                disabled={!recipe || isReading || voiceUsageMinutes >= monthlyLimit}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isReading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reading Recipe...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Speak with Chef
                  </>
                )}
              </Button>
            </div>

            {/* Transcribe Voice */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Voice Commands</h4>
              <p className="text-sm text-green-600 mb-4">
                Use AWS Transcribe for hands-free cooking assistance
              </p>
              <Button
                onClick={handleTranscribeVoice}
                variant={isRecording ? "destructive" : "default"}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Transcribe My Voice
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Last Transcript */}
          {transcript && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Last Voice Command:
              </h4>
              <p className="text-sm italic text-gray-700">"{transcript}"</p>
            </div>
          )}

          {/* Feature Benefits */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Premium Features</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 8+ Professional AWS Polly voices</li>
              <li>• Real-time voice transcription</li>
              <li>• AI-powered cooking assistance</li>
              <li>• {monthlyLimit} minutes monthly usage</li>
              <li>• Enterprise-grade audio quality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </SubscriptionGate>
  );
}