import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ttsService } from "@/services/openai-tts";

interface WhisperTranscription {
  text: string;
  language?: string;
  duration?: number;
}

interface VoiceCommandResult {
  action: string;
  intent: string;
  parameters: Record<string, any>;
  response: string;
}

export function EnhancedWhisperVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<WhisperTranscription | null>(null);
  const [commandResult, setCommandResult] = useState<VoiceCommandResult | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  // Start audio recording with real-time level monitoring
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000 // Optimized for Whisper
        } 
      });

      // Set up audio level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorderRef.current.start(1000); // Capture in 1-second chunks
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone. Whisper AI is listening...",
      });

    } catch (error: any) {
      setError(`Microphone access denied: ${error.message}`);
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setAudioLevel(0);
      
      toast({
        title: "Processing Audio",
        description: "Whisper AI is transcribing your speech...",
      });
    }
  }, [isRecording, toast]);

  // Transcribe audio using Whisper API
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'en');

      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json() as any;

      if (result?.success && result?.data) {
        setTranscription(result.data);
        
        // Process the transcribed text as a voice command
        await processVoiceCommand(result.data.text);
        
        toast({
          title: "Speech Recognized",
          description: `Transcribed: "${result.data.text.substring(0, 50)}..."`,
        });
      } else {
        throw new Error(result?.error || 'Transcription failed');
      }
    } catch (error: any) {
      setError(`Transcription failed: ${error.message}`);
      toast({
        title: "Transcription Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  // Process voice command with AI
  const processVoiceCommand = useCallback(async (text: string) => {
    try {
      const result = await apiRequest('POST', '/api/whisper/process-command', { text }) as any;
      
      if (result?.success && result?.data) {
        setCommandResult(result.data.processed);
        
        // Use OpenAI TTS for high-quality audio response
        if (result.data.processed.response) {
          const success = await ttsService.smartSpeak(result.data.processed.response, {
            voice: 'nova', // Clear female voice good for cooking instructions
            speed: 0.9
          });
          
          if (!success) {
            console.warn('TTS failed, response shown in toast only');
          }
        }
        
        toast({
          title: "Command Processed",
          description: result.data.processed.response,
        });
      }
    } catch (error: any) {
      console.error('Voice command processing error:', error);
    }
  }, [toast]);

  return (
    <Card className="border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          Enhanced Whisper AI Voice
          <Badge className="bg-green-600 text-white">OpenAI Whisper</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-16 h-16 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
          
          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-8 rounded-full transition-all duration-100 ${
                    audioLevel > i * 20 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status Display */}
        <div className="text-center">
          {isRecording && (
            <div className="text-blue-800">
              <div className="font-semibold">🎤 Recording with Whisper AI...</div>
              <div className="text-sm text-blue-600">Speak clearly for best results</div>
            </div>
          )}
          {isProcessing && (
            <div className="text-purple-800">
              <div className="font-semibold">🤖 Processing with OpenAI...</div>
              <div className="text-sm text-purple-600">Transcribing and understanding...</div>
            </div>
          )}
          {!isRecording && !isProcessing && (
            <div className="text-gray-600">
              <div className="font-semibold">Ready for voice commands</div>
              <div className="text-sm">Click the microphone to start recording</div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-300 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Transcription Results */}
        {transcription && (
          <div className="bg-white border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-blue-900">Transcription:</span>
            </div>
            <p className="text-gray-800 italic">"{transcription.text}"</p>
            {transcription.duration && (
              <p className="text-sm text-gray-600 mt-1">
                Duration: {transcription.duration.toFixed(1)}s | Language: {transcription.language}
              </p>
            )}
          </div>
        )}

        {/* Command Results */}
        {commandResult && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-900">AI Response:</span>
              <Badge variant="secondary">{commandResult.action}</Badge>
            </div>
            <p className="text-gray-800 mb-2">{commandResult.response}</p>
            <div className="text-sm text-gray-600">
              <strong>Intent:</strong> {commandResult.intent}
              {Object.keys(commandResult.parameters).length > 0 && (
                <div className="mt-1">
                  <strong>Parameters:</strong> {JSON.stringify(commandResult.parameters, null, 2)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white p-3 rounded-lg border">
            <div className="font-semibold text-blue-900 mb-1">Try saying:</div>
            <ul className="text-gray-700 space-y-1">
              <li>"Find chicken recipes"</li>
              <li>"Set timer for 10 minutes"</li>
              <li>"Add milk to shopping list"</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="font-semibold text-blue-900 mb-1">Or ask:</div>
            <ul className="text-gray-700 space-y-1">
              <li>"How many calories in banana?"</li>
              <li>"Substitute butter with oil"</li>
              <li>"How long to cook pasta?"</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}