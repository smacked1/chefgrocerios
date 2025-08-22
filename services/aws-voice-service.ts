// AWS Voice Service Client
export class AWSVoiceService {
  private baseUrl = '/api/aws';

  async readRecipeAloud(recipe: any): Promise<void> {
    if (!recipe) {
      throw new Error('No recipe provided');
    }

    // Prepare recipe text for AWS Polly
    const recipeText = this.formatRecipeForTTS(recipe);
    
    try {
      const response = await fetch(`${this.baseUrl}/polly/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: recipeText,
          voice: 'Joanna', // Natural American English voice
          outputFormat: 'mp3'
        }),
      });

      if (!response.ok) {
        throw new Error(`AWS Polly failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play();
      });

    } catch (error) {
      console.error('AWS recipe reading error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-command.webm');

    try {
      const response = await fetch(`${this.baseUrl}/transcribe/audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`AWS Transcribe failed: ${response.status}`);
      }

      const result = await response.json();
      return result.transcript || '';

    } catch (error) {
      console.error('AWS transcription error:', error);
      throw error;
    }
  }

  async isConfigured(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const status = await response.json();
      return status.configured === true;
    } catch (error) {
      return false;
    }
  }

  private formatRecipeForTTS(recipe: any): string {
    let text = `Recipe: ${recipe.name || 'Untitled Recipe'}. `;
    
    if (recipe.description) {
      text += `${recipe.description}. `;
    }

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      text += `Ingredients: `;
      recipe.ingredients.forEach((ingredient: string, index: number) => {
        text += `${ingredient}`;
        if (index < recipe.ingredients.length - 1) {
          text += ', ';
        }
      });
      text += '. ';
    }

    if (recipe.instructions && recipe.instructions.length > 0) {
      text += `Instructions: `;
      recipe.instructions.forEach((instruction: string, index: number) => {
        text += `Step ${index + 1}: ${instruction}. `;
      });
    }

    return text;
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/polly/voices`);
      const result = await response.json();
      return result.voices || [];
    } catch (error) {
      console.error('Failed to fetch AWS voices:', error);
      return [];
    }
  }
}

export const awsVoiceService = new AWSVoiceService();