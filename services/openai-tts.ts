/**
 * OpenAI Text-to-Speech Service
 * Converts AI responses to natural-sounding speech for hands-free cooking experience
 */

export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
}

export class OpenAITTSService {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isAvailable: boolean | null = null;

  constructor() {
    // Check service availability on first use
    this.checkAvailability();
  }

  /**
   * Initialize audio context for better cross-platform compatibility
   */
  private async initAudioContext(): Promise<void> {
    if (!this.audioContext) {
      try {
        // Use webkitAudioContext for Safari compatibility
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        // Resume context on user interaction (required for autoplay policies)
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    }
  }

  /**
   * Convert text to speech using backend TTS proxy (secure)
   */
  async synthesizeText(
    text: string, 
    options: TTSOptions = {}
  ): Promise<Blob | null> {
    if (!text.trim()) {
      return null;
    }

    try {
      // Use secure backend proxy instead of direct API calls
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.slice(0, 4096), // OpenAI limit is 4096 characters
          voice: options.voice || 'nova', // Female voice good for cooking instructions
          speed: Math.max(0.25, Math.min(4.0, options.speed || 1.0)),
          format: options.format || 'mp3'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `TTS API error: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('TTS synthesis failed:', error);
      return null;
    }
  }

  /**
   * Play audio from blob with cross-platform compatibility
   */
  async playAudio(audioBlob: Blob): Promise<void> {
    try {
      await this.initAudioContext();

      // Stop any currently playing audio
      this.stopCurrentAudio();

      // Create audio URL
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      
      // Set up event listeners
      const playPromise = new Promise<void>((resolve, reject) => {
        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        });

        audio.addEventListener('error', (e) => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(new Error(`Audio playback failed: ${e}`));
        });
      });

      // Store reference and play
      this.currentAudio = audio;
      await audio.play();
      await playPromise;

    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  /**
   * Stop currently playing audio
   */
  stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Convert text to speech and play immediately
   */
  async speakText(
    text: string, 
    options: TTSOptions = {}
  ): Promise<boolean> {
    try {
      const audioBlob = await this.synthesizeText(text, options);
      if (!audioBlob) {
        return false;
      }

      await this.playAudio(audioBlob);
      return true;
    } catch (error) {
      console.error('Speak text failed:', error);
      return false;
    }
  }

  /**
   * Check if TTS service is available
   */
  private async checkAvailability(): Promise<void> {
    if (this.isAvailable !== null) return;
    
    try {
      const response = await fetch('/api/tts/status');
      const status = await response.json();
      this.isAvailable = status.available;
    } catch (error) {
      console.warn('Failed to check TTS availability:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Check if TTS is available
   */
  async isServiceAvailable(): Promise<boolean> {
    await this.checkAvailability();
    return this.isAvailable === true;
  }

  /**
   * Fallback to browser's built-in speech synthesis
   */
  async fallbackSpeak(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve(false);
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Try to use a natural-sounding voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('natural') || 
          voice.name.toLowerCase().includes('neural') ||
          (voice.lang.startsWith('en') && voice.localService)
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);

        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Fallback TTS failed:', error);
        resolve(false);
      }
    });
  }

  /**
   * Smart speak with automatic fallback
   */
  async smartSpeak(text: string, options: TTSOptions = {}): Promise<boolean> {
    // Try OpenAI TTS first
    if (await this.isServiceAvailable()) {
      const success = await this.speakText(text, options);
      if (success) {
        return true;
      }
    }

    // Fallback to browser TTS
    console.log('Falling back to browser TTS');
    return await this.fallbackSpeak(text);
  }
}

// Export singleton instance
export const ttsService = new OpenAITTSService();