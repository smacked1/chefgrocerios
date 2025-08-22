import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Mic, MicOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { awsVoiceService } from '@/services/aws-voice-service';

interface AWSVoiceIntegrationProps {
  recipe?: any;
}

export function AWSVoiceIntegration({ recipe }: AWSVoiceIntegrationProps) {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isReading, setIsReading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkAWSConfiguration();
  }, []);

  const checkAWSConfiguration = async () => {
    try {
      const configured = await awsVoiceService.isConfigured();
      setIsConfigured(configured);
    } catch (error) {
      console.error('AWS configuration check failed:', error);
      setIsConfigured(false);
    }
  };

  const handleReadRecipe = async () => {
    if (!recipe) {
      toast({
        title: "No Recipe",
        description: "Please select a recipe to read aloud.",
        variant: "destructive",
      });
      return;
    }

    setIsReading(true);
    try {
      await awsVoiceService.readRecipeAloud(recipe);
      toast({
        title: "Recipe Reading Complete",
        description: "The recipe has been read aloud successfully.",
      });
    } catch (error) {
      console.error('Recipe reading failed:', error);
      toast({
        title: "Reading Failed",
        description: "Failed to read recipe aloud. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReading(false);
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
        setAudioChunks([]);
        
        try {
          const transcriptText = await awsVoiceService.transcribeAudio(audioBlob);
          setTranscript(transcriptText);
          
          if (transcriptText) {
            toast({
              title: "Voice Command Received",
              description: `Transcribed: "${transcriptText}"`,
            });
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
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your voice command now...",
      });
    } catch (error) {
      console.error('Recording start failed:', error);
      toast({
        title: "Recording Failed",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      toast({
        title: "Recording Stopped",
        description: "Processing your voice command...",
      });
    }
  };

  const handleVoiceCommand = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          AWS Voice Integration
          {isConfigured ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured ? (
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              AWS services are not properly configured. Please check your credentials.
            </p>
            <Button 
              onClick={checkAWSConfiguration} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Retry Connection
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipe Reading */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <h3 className="font-medium">Recipe Voice Reading</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Listen to your recipe with professional AWS Polly voices
                </p>
              </div>
              <Button
                onClick={handleReadRecipe}
                disabled={!recipe || isReading}
                className="min-w-[120px]"
              >
                {isReading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reading...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Read Recipe
                  </>
                )}
              </Button>
            </div>

            {/* Voice Commands */}
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <h3 className="font-medium">Voice Commands</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use AWS Transcribe for hands-free cooking assistance
                </p>
              </div>
              <Button
                onClick={handleVoiceCommand}
                variant={isRecording ? "destructive" : "default"}
                className="min-w-[120px]"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>

            {/* Last Transcript */}
            {transcript && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Last Voice Command:</h4>
                <p className="text-sm italic">"{transcript}"</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}