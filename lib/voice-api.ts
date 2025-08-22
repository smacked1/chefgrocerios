// Enhanced Voice API integration for ChefGrocer
// This module handles advanced speech recognition and synthesis using Web Speech API

export interface VoiceCommand {
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  rawTranscript: string;
  timestamp: Date;
}

export interface VoiceSettings {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
}

export interface VoiceResponse {
  success: boolean;
  message: string;
  data?: any;
  shouldSpeak?: boolean;
}

export class VoiceAPI {
  private recognition: any | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private isPaused = false;
  private isProcessing = false;
  private onResultCallback: ((result: VoiceCommand) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStatusChangeCallback: ((status: 'listening' | 'processing' | 'idle' | 'error') => void) | null = null;
  private settings: VoiceSettings;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor(customSettings?: Partial<VoiceSettings>) {
    this.synthesis = window.speechSynthesis;
    this.settings = {
      language: 'en-US',
      continuous: false,
      interimResults: true,
      maxAlternatives: 3,
      voiceRate: 1.0,
      voicePitch: 1.0,
      voiceVolume: 0.8,
      ...customSettings
    };
    
    this.initializeSpeechRecognition();
    this.loadAvailableVoices();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = this.settings.continuous;
      this.recognition.interimResults = this.settings.interimResults;
      this.recognition.lang = this.settings.language;
      this.recognition.maxAlternatives = this.settings.maxAlternatives;
      
      // Enhanced responsiveness settings - remove invalid grammars assignment
      // this.recognition.grammars = null; // This causes errors in some browsers
      // this.recognition.serviceURI = ''; // Not needed for basic recognition
      
      // Improve recognition accuracy for cooking terms
      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('listening');
        console.log('🎤 Voice listening started...');
      };

      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        
        if (result.isFinal) {
          this.isProcessing = true;
          this.updateStatus('processing');
          
          const transcript = result[0].transcript.trim();
          const confidence = result[0].confidence || 0.8;
          
          console.log(`🗣️ Voice command: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
          
          const command = this.parseCommand(transcript, confidence);
          if (this.onResultCallback) {
            this.onResultCallback(command);
          }
          
          this.isProcessing = false;
          this.updateStatus('idle');
        } else if (this.settings.interimResults) {
          // Provide interim feedback for better responsiveness
          const interimTranscript = result[0].transcript;
          console.log(`🎯 Interim: "${interimTranscript}"`);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.updateStatus('error');
        const errorMessage = this.getErrorMessage(event.error);
        if (this.onErrorCallback) {
          this.onErrorCallback(errorMessage);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateStatus('idle');
      };
    }
  }

  private loadAvailableVoices() {
    const loadVoices = () => {
      this.availableVoices = this.synthesis.getVoices();
    };

    loadVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }
  }

  private updateStatus(status: 'listening' | 'processing' | 'idle' | 'error') {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'no-speech': 'No speech was detected. Please try again.',
      'audio-capture': 'Audio capture failed. Please check your microphone.',
      'not-allowed': 'Microphone permission denied. Please allow microphone access.',
      'network': 'Network error occurred. Please check your connection.',
      'service-not-allowed': 'Speech recognition service not allowed.',
      'bad-grammar': 'Grammar error in speech recognition.',
      'language-not-supported': 'Language not supported.',
      'aborted': 'Speech recognition was aborted.'
    };
    
    return errorMessages[error] || `Speech recognition error: ${error}`;
  }

  async startListening(
    onResult: (result: VoiceCommand) => void, 
    onError?: (error: string) => void,
    onStatusChange?: (status: 'listening' | 'processing' | 'idle' | 'error') => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser');
      return false;
    }

    if (this.isListening) {
      if (onError) onError('Already listening');
      return false;
    }

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎤 Microphone access granted for voice API');
    } catch (err) {
      const errorMessage = 'Microphone access denied. Please allow microphone access to use voice commands.';
      console.error('🎤 Microphone access denied:', err);
      if (onError) onError(errorMessage);
      return false;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onStatusChangeCallback = onStatusChange || null;
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      if (onError) onError('Failed to start speech recognition');
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  pauseListening() {
    if (this.recognition && this.isListening) {
      this.isPaused = true;
      this.recognition.stop();
    }
  }

  resumeListening() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.recognition) {
        this.recognition.start();
      }
    }
  }

  async speak(
    text: string, 
    options?: { 
      rate?: number; 
      pitch?: number; 
      volume?: number; 
      voice?: string;
      interrupt?: boolean;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (options?.interrupt) {
        this.synthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      utterance.rate = options?.rate || this.settings.voiceRate;
      utterance.pitch = options?.pitch || this.settings.voicePitch;
      utterance.volume = options?.volume || this.settings.voiceVolume;

      // Select voice
      if (options?.voice) {
        const selectedVoice = this.availableVoices.find(voice => 
          voice.name.includes(options.voice!) || voice.lang.includes(options.voice!)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Default to a pleasant English voice
        const preferredVoice = this.availableVoices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || this.availableVoices.find(voice => voice.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  private parseCommand(transcript: string, confidence: number): VoiceCommand {
    const lowerTranscript = transcript.toLowerCase().trim();
    const command: VoiceCommand = {
      action: 'unknown',
      parameters: {},
      confidence,
      rawTranscript: transcript,
      timestamp: new Date()
    };

    // Recipe commands
    if (this.matchPattern(lowerTranscript, ['add recipe', 'create recipe', 'save recipe'])) {
      command.action = 'add_recipe';
      command.parameters = { recipe: this.extractAfterKeywords(lowerTranscript, ['add recipe', 'create recipe', 'save recipe']) };
    }
    
    // Meal planning commands
    else if (this.matchPattern(lowerTranscript, ['plan meal', 'schedule meal', 'add meal'])) {
      command.action = 'plan_meal';
      command.parameters = { 
        meal: this.extractAfterKeywords(lowerTranscript, ['plan meal', 'schedule meal', 'add meal']),
        mealType: this.extractMealType(lowerTranscript),
        date: this.extractDate(lowerTranscript)
      };
    }
    
    // Grocery list commands
    else if (this.matchPattern(lowerTranscript, ['add to grocery', 'add to shopping', 'buy', 'need to buy'])) {
      command.action = 'add_grocery_item';
      command.parameters = { 
        item: this.extractAfterKeywords(lowerTranscript, ['add to grocery', 'add to shopping', 'buy', 'need to buy']),
        quantity: this.extractQuantity(lowerTranscript)
      };
    }
    
    // Search commands
    else if (this.matchPattern(lowerTranscript, ['search for', 'find recipe', 'look for', 'show me'])) {
      command.action = 'search_recipes';
      command.parameters = { query: this.extractAfterKeywords(lowerTranscript, ['search for', 'find recipe', 'look for', 'show me']) };
    }
    
    // Recipe instruction commands
    else if (this.matchPattern(lowerTranscript, ['how to make', 'how do i make', 'how to cook', 'how do i cook', 'cook', 'make', 'instructions for', 'steps for', 'recipe for'])) {
      command.action = 'get_cooking_instructions';
      command.parameters = { recipe: this.extractAfterKeywords(lowerTranscript, ['how to make', 'how do i make', 'how to cook', 'how do i cook', 'cook', 'make', 'instructions for', 'steps for', 'recipe for']) };
    }
    
    // Step-by-step guidance commands
    else if (this.matchPattern(lowerTranscript, ['step by step', 'guide me through', 'walk me through', 'cooking guide', 'tell me how', 'explain how'])) {
      command.action = 'step_by_step_guide';
      command.parameters = { recipe: this.extractAfterKeywords(lowerTranscript, ['step by step', 'guide me through', 'walk me through', 'cooking guide', 'tell me how', 'explain how']) };
    }
    
    // Nutrition commands
    else if (this.matchPattern(lowerTranscript, ['nutrition facts', 'calories in', 'how many calories'])) {
      command.action = 'get_nutrition';
      command.parameters = { food: this.extractAfterKeywords(lowerTranscript, ['nutrition facts', 'calories in', 'how many calories']) };
    }
    
    // Timer commands
    else if (this.matchPattern(lowerTranscript, ['set timer', 'start timer', 'timer for'])) {
      command.action = 'set_timer';
      command.parameters = { 
        duration: this.extractDuration(lowerTranscript),
        label: this.extractTimerLabel(lowerTranscript)
      };
    }
    
    // Store finder commands
    else if (this.matchPattern(lowerTranscript, ['find store', 'nearest store', 'grocery store near'])) {
      command.action = 'find_stores';
      command.parameters = { location: this.extractLocation(lowerTranscript) };
    }
    
    // Restaurant finder commands
    else if (this.matchPattern(lowerTranscript, ['find restaurant', 'restaurants near', 'food near', 'places to eat', 'where to eat'])) {
      command.action = 'find_restaurants';
      command.parameters = { 
        location: this.extractLocation(lowerTranscript),
        cuisine: this.extractCuisine(lowerTranscript),
        query: lowerTranscript
      };
    }

    // Help commands
    else if (this.matchPattern(lowerTranscript, ['help', 'what can you do', 'commands'])) {
      command.action = 'show_help';
      command.parameters = {};
    }

    return command;
  }

  private matchPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private extractAfterKeywords(text: string, keywords: string[]): string {
    for (const keyword of keywords) {
      const index = text.indexOf(keyword);
      if (index !== -1) {
        return text.substring(index + keyword.length).trim();
      }
    }
    return '';
  }

  private extractMealType(text: string): string {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'brunch'];
    for (const mealType of mealTypes) {
      if (text.includes(mealType)) {
        return mealType;
      }
    }
    return 'dinner'; // default
  }

  private extractDate(text: string): string {
    const today = new Date();
    if (text.includes('today')) return today.toISOString().split('T')[0];
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    return today.toISOString().split('T')[0]; // default to today
  }

  private extractQuantity(text: string): string {
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:pounds?|lbs?|kilograms?|kg|grams?|g|ounces?|oz|cups?|tablespoons?|tbsp|teaspoons?|tsp|pieces?|items?)?/i);
    return match ? match[0] : '1';
  }

  private extractDuration(text: string): number {
    const match = text.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)?/i);
    if (match) {
      const value = parseInt(match[1]);
      if (text.includes('hour')) return value * 60;
      if (text.includes('second')) return Math.max(1, Math.floor(value / 60));
      return value; // assume minutes
    }
    return 5; // default 5 minutes
  }

  private extractTimerLabel(text: string): string {
    const match = text.match(/timer for (.+?)(?:\s+for\s+\d+|\s*$)/i);
    return match ? match[1].trim() : 'Cooking timer';
  }

  private extractLocation(text: string): string {
    const match = text.match(/(?:near|in|at)\s+(.+)/i);
    return match ? match[1].trim() : 'current location';
  }

  private extractCuisine(text: string): string {
    const cuisines = ['italian', 'chinese', 'mexican', 'indian', 'thai', 'japanese', 'american', 'french', 'mediterranean', 'pizza', 'burgers', 'seafood', 'vegetarian', 'vegan'];
    for (const cuisine of cuisines) {
      if (text.includes(cuisine)) {
        return cuisine;
      }
    }
    return '';
  }

  // Utility methods
  getListeningState(): boolean {
    return this.isListening;
  }

  getProcessingState(): boolean {
    return this.isProcessing;
  }

  isSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) && !!window.speechSynthesis;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.recognition) {
      this.recognition.lang = this.settings.language;
      this.recognition.continuous = this.settings.continuous;
      this.recognition.interimResults = this.settings.interimResults;
      this.recognition.maxAlternatives = this.settings.maxAlternatives;
    }
  }

  // Stop all speech synthesis
  stopSpeaking() {
    this.synthesis.cancel();
  }

  // Get current speech synthesis status
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }
}