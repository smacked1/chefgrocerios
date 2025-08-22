import { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceAPI, VoiceCommand, VoiceSettings } from '@/lib/voice-api';

export interface UseVoiceOptions {
  settings?: Partial<VoiceSettings>;
  autoStart?: boolean;
}

export function useVoice(options?: UseVoiceOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<'listening' | 'processing' | 'idle' | 'error'>('idle');
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const voiceAPIRef = useRef<VoiceAPI | null>(null);

  useEffect(() => {
    // Initialize Voice API
    voiceAPIRef.current = new VoiceAPI(options?.settings);
    setIsSupported(voiceAPIRef.current.isSupported());
    
    return () => {
      // Cleanup on unmount
      if (voiceAPIRef.current) {
        voiceAPIRef.current.stopListening();
        voiceAPIRef.current.stopSpeaking();
      }
    };
  }, []);

  const startListening = useCallback(async (
    onResult?: (command: VoiceCommand) => void, 
    onError?: (error: string) => void
  ) => {
    if (!voiceAPIRef.current || isListening) return false;

    const success = await voiceAPIRef.current.startListening(
      (command) => {
        setLastCommand(command);
        setError(null);
        if (onResult) onResult(command);
      },
      (errorMsg) => {
        setError(errorMsg);
        if (onError) onError(errorMsg);
      },
      (newStatus) => {
        setStatus(newStatus);
        setIsListening(newStatus === 'listening');
        setIsProcessing(newStatus === 'processing');
      }
    );

    return success;
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (voiceAPIRef.current && isListening) {
      voiceAPIRef.current.stopListening();
      setIsListening(false);
      setStatus('idle');
    }
  }, [isListening]);

  const pauseListening = useCallback(() => {
    if (voiceAPIRef.current) {
      voiceAPIRef.current.pauseListening();
      setIsListening(false);
      setStatus('idle');
    }
  }, []);

  const resumeListening = useCallback(() => {
    if (voiceAPIRef.current) {
      voiceAPIRef.current.resumeListening();
    }
  }, []);

  const speak = useCallback(async (
    text: string, 
    options?: { 
      rate?: number; 
      pitch?: number; 
      volume?: number; 
      voice?: string;
      interrupt?: boolean;
    }
  ) => {
    if (!voiceAPIRef.current) return;

    try {
      await voiceAPIRef.current.speak(text, options);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setError('Failed to speak text');
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (voiceAPIRef.current) {
      voiceAPIRef.current.stopSpeaking();
    }
  }, []);

  const isSpeaking = useCallback(() => {
    return voiceAPIRef.current?.isSpeaking() || false;
  }, []);

  const getAvailableVoices = useCallback(() => {
    return voiceAPIRef.current?.getAvailableVoices() || [];
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    if (voiceAPIRef.current) {
      voiceAPIRef.current.updateSettings(newSettings);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isProcessing,
    isSupported,
    status,
    lastCommand,
    error,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    speak,
    stopSpeaking,
    isSpeaking,
    getAvailableVoices,
    updateSettings,
    clearError
  };
}