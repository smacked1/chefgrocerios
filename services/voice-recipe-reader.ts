// Fix AI Voice Recipe Reading Issues
class VoiceRecipeReader {
  private maxChunkLength = 200; // Max characters per TTS chunk
  private isReading = false;
  private currentRecipe: any = null;
  private currentStep = 0;

  // Fix: Read complete recipe in chunks
  async readFullRecipe(recipe: any, startFromStep = 0): Promise<void> {
    if (!recipe || !recipe.instructions) {
      await this.speak("I'm sorry, I couldn't find the complete recipe instructions.");
      return;
    }

    this.currentRecipe = recipe;
    this.currentStep = startFromStep;
    this.isReading = true;

    try {
      // Start with recipe title and overview
      if (startFromStep === 0) {
        await this.speak(`Here's how to make ${recipe.title || recipe.name}.`);

        if (recipe.readyInMinutes) {
          await this.speak(`This recipe takes ${recipe.readyInMinutes} minutes and serves ${recipe.servings || 4} people.`);
        }
        
        // Read ingredients first
        await this.readIngredients(recipe);
      }

      // Read instructions step by step
      await this.readInstructions(recipe, startFromStep);

      await this.speak("That's the complete recipe! Would you like me to repeat any steps or help with cooking times?");

    } catch (error) {
      console.error('Error reading recipe:', error);
      await this.speak("I had trouble reading the recipe. Would you like me to try again?");
    } finally {
      this.isReading = false;
    }
  }

  private async readIngredients(recipe: any): Promise<void> {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      await this.speak("Ingredients list is not available for this recipe.");
      return;
    }

    await this.speak("Here are the ingredients you'll need:");

    // Group ingredients into chunks to avoid TTS limits
    const ingredientChunks = this.chunkArray(recipe.ingredients, 3);

    for (const chunk of ingredientChunks) {
      const ingredientText = chunk
        .map((ing: any) => `${ing.amount || ''} ${ing.name}`.trim())
        .join(', ');

      await this.speak(ingredientText);
      await this.pause(500); // Small pause between chunks
    }
  }

  private async readInstructions(recipe: any, startStep = 0): Promise<void> {
    let instructions: string[] = [];

    // Handle different instruction formats
    if (typeof recipe.instructions === 'string') {
      // Split by common delimiters
      instructions = recipe.instructions
        .split(/\d+\.|\n\n|\. (?=[A-Z])/)
        .filter((step: string) => step.trim().length > 10)
        .map((step: string) => step.trim());
    } else if (Array.isArray(recipe.instructions)) {
      instructions = recipe.instructions
        .map((step: any) => typeof step === 'string' ? step : step.step || step.text || '')
        .filter((step: string) => step.length > 5);
    }

    if (instructions.length === 0) {
      await this.speak("Detailed cooking instructions are not available, but I can help you find a similar recipe with complete steps.");
      return;
    }

    await this.speak(`Now for the cooking instructions. There are ${instructions.length} main steps.`);

    // Read each instruction step with proper chunking
    for (let i = startStep; i < instructions.length; i++) {
      if (!this.isReading) break; // Allow interruption

      await this.speak(`Step ${i + 1}:`);

      const step = instructions[i];
      const chunks = this.splitIntoSpeechChunks(step);

      for (const chunk of chunks) {
        if (!this.isReading) break;
        await this.speak(chunk);
        await this.pause(300);
      }

      // Pause between major steps
      if (i < instructions.length - 1) {
        await this.pause(800);
      }
    }
  }

  // Split long text into TTS-friendly chunks
  private splitIntoSpeechChunks(text: string): string[] {
    if (text.length <= this.maxChunkLength) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim() + '.';

      if (currentChunk.length + trimmedSentence.length <= this.maxChunkLength) {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }

        // If single sentence is too long, split by commas
        if (trimmedSentence.length > this.maxChunkLength) {
          const subChunks = this.splitByCommas(trimmedSentence);
          chunks.push(...subChunks);
        } else {
          currentChunk = trimmedSentence;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  private splitByCommas(text: string): string[] {
    const parts = text.split(',');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const part of parts) {
      const trimmedPart = part.trim();

      if (currentChunk.length + trimmedPart.length + 1 <= this.maxChunkLength) {
        currentChunk += (currentChunk ? ', ' : '') + trimmedPart;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = trimmedPart;
      }
    }

    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }

  private async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => resolve();
        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          reject(error);
        };

        speechSynthesis.speak(utterance);
      } else {
        console.log('TTS not available, would speak:', text);
        resolve();
      }
    });
  }

  private async pause(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Voice control commands
  pauseReading(): void {
    this.isReading = false;
    speechSynthesis.cancel();
  }

  resumeReading(): void {
    if (this.currentRecipe && this.currentStep < this.currentRecipe.instructions.length) {
      this.readFullRecipe(this.currentRecipe, this.currentStep);
    }
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  isCurrentlyReading(): boolean {
    return this.isReading;
  }
}

export { VoiceRecipeReader };