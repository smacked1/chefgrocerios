import Dexie, { Table } from 'dexie';
import { Preferences } from '@capacitor/preferences';

// Offline Recipe Database Schema
export interface OfflineRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime: number;
  servings: number;
  difficulty: string;
  rating: number;
  imageUrl?: string;
  tags: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  voiceInstructions?: string[];
  downloadedAt: Date;
  lastAccessed: Date;
}

export interface OfflineIngredient {
  id: string;
  name: string;
  nutritionPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  category: string;
  downloadedAt: Date;
}

export interface OfflineMealPlan {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  recipeName: string;
  downloadedAt: Date;
}

// IndexedDB Database
class OfflineRecipeDB extends Dexie {
  recipes!: Table<OfflineRecipe>;
  ingredients!: Table<OfflineIngredient>;
  mealPlans!: Table<OfflineMealPlan>;

  constructor() {
    super('ChefGrocerOfflineDB');
    
    this.version(1).stores({
      recipes: 'id, name, difficulty, cookTime, downloadedAt, lastAccessed',
      ingredients: 'id, name, category, downloadedAt',
      mealPlans: 'id, userId, date, mealType, recipeId, downloadedAt'
    });
  }
}

export class OfflineRecipeService {
  private db: OfflineRecipeDB;
  private readonly maxStorageSize = 100 * 1024 * 1024; // 100MB
  private readonly maxRecipes = 50;

  constructor() {
    this.db = new OfflineRecipeDB();
  }

  // Download recipe for offline use
  async downloadRecipe(recipeId: string): Promise<boolean> {
    try {
      // Check storage limits
      await this.checkStorageLimits();

      // Fetch recipe from server
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (!response.ok) throw new Error('Recipe not found');
      
      const recipe = await response.json();

      // Generate voice instructions
      const voiceInstructions = await this.generateVoiceInstructions(recipe.instructions);

      // Save to offline database
      const offlineRecipe: OfflineRecipe = {
        ...recipe,
        voiceInstructions,
        downloadedAt: new Date(),
        lastAccessed: new Date(),
      };

      await this.db.recipes.put(offlineRecipe);
      
      // Download ingredients data
      await this.downloadIngredientsData(recipe.ingredients);

      // Store in Capacitor preferences for quick access
      await this.updateOfflineRecipesList();

      console.log(`Recipe "${recipe.name}" downloaded for offline use`);
      return true;
    } catch (error) {
      console.error('Error downloading recipe:', error);
      return false;
    }
  }

  // Get offline recipe
  async getOfflineRecipe(recipeId: string): Promise<OfflineRecipe | null> {
    try {
      const recipe = await this.db.recipes.get(recipeId);
      if (recipe) {
        // Update last accessed time
        recipe.lastAccessed = new Date();
        await this.db.recipes.put(recipe);
        return recipe;
      }
      return null;
    } catch (error) {
      console.error('Error getting offline recipe:', error);
      return null;
    }
  }

  // Get all offline recipes
  async getAllOfflineRecipes(): Promise<OfflineRecipe[]> {
    try {
      return await this.db.recipes
        .orderBy('lastAccessed')
        .reverse()
        .toArray();
    } catch (error) {
      console.error('Error getting offline recipes:', error);
      return [];
    }
  }

  // Search offline recipes
  async searchOfflineRecipes(query: string): Promise<OfflineRecipe[]> {
    try {
      const allRecipes = await this.db.recipes.toArray();
      const searchTerm = query.toLowerCase();
      
      return allRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        ) ||
        recipe.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        )
      );
    } catch (error) {
      console.error('Error searching offline recipes:', error);
      return [];
    }
  }

  // Remove recipe from offline storage
  async removeOfflineRecipe(recipeId: string): Promise<boolean> {
    try {
      await this.db.recipes.delete(recipeId);
      await this.updateOfflineRecipesList();
      return true;
    } catch (error) {
      console.error('Error removing offline recipe:', error);
      return false;
    }
  }

  // Download meal plan for offline use
  async downloadMealPlan(userId: string, date: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/meal-plans?userId=${userId}&date=${date}`);
      if (!response.ok) throw new Error('Meal plan not found');
      
      const mealPlans = await response.json();

      for (const mealPlan of mealPlans) {
        // Download the recipe for this meal
        await this.downloadRecipe(mealPlan.recipeId);

        // Save meal plan
        const offlineMealPlan: OfflineMealPlan = {
          id: `${userId}-${date}-${mealPlan.mealType}`,
          userId,
          date,
          mealType: mealPlan.mealType,
          recipeId: mealPlan.recipeId,
          recipeName: mealPlan.recipeName,
          downloadedAt: new Date(),
        };

        await this.db.mealPlans.put(offlineMealPlan);
      }

      return true;
    } catch (error) {
      console.error('Error downloading meal plan:', error);
      return false;
    }
  }

  // Get offline meal plans
  async getOfflineMealPlans(userId: string, date: string): Promise<OfflineMealPlan[]> {
    try {
      return await this.db.mealPlans
        .where('userId')
        .equals(userId)
        .and(plan => plan.date === date)
        .toArray();
    } catch (error) {
      console.error('Error getting offline meal plans:', error);
      return [];
    }
  }

  // Check if recipe is available offline
  async isRecipeOffline(recipeId: string): Promise<boolean> {
    try {
      const recipe = await this.db.recipes.get(recipeId);
      return !!recipe;
    } catch (error) {
      return false;
    }
  }

  // Get offline storage info
  async getStorageInfo(): Promise<{
    recipeCount: number;
    ingredientCount: number;
    estimatedSize: string;
    lastUpdated: Date | null;
  }> {
    try {
      const recipeCount = await this.db.recipes.count();
      const ingredientCount = await this.db.ingredients.count();
      
      // Estimate storage size (rough calculation)
      const estimatedSize = `${Math.round((recipeCount * 50 + ingredientCount * 5) / 1024)} KB`;
      
      const lastRecipe = await this.db.recipes
        .orderBy('downloadedAt')
        .reverse()
        .first();
      
      return {
        recipeCount,
        ingredientCount,
        estimatedSize,
        lastUpdated: lastRecipe?.downloadedAt || null,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        recipeCount: 0,
        ingredientCount: 0,
        estimatedSize: '0 KB',
        lastUpdated: null,
      };
    }
  }

  // Clear all offline data
  async clearOfflineData(): Promise<boolean> {
    try {
      await this.db.recipes.clear();
      await this.db.ingredients.clear();
      await this.db.mealPlans.clear();
      await Preferences.remove({ key: 'offlineRecipesList' });
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  }

  // Private helper methods
  private async checkStorageLimits(): Promise<void> {
    const recipeCount = await this.db.recipes.count();
    
    if (recipeCount >= this.maxRecipes) {
      // Remove oldest recipes
      const oldestRecipes = await this.db.recipes
        .orderBy('lastAccessed')
        .limit(10)
        .toArray();
      
      for (const recipe of oldestRecipes) {
        await this.db.recipes.delete(recipe.id);
      }
    }
  }

  private async downloadIngredientsData(ingredients: string[]): Promise<void> {
    for (const ingredient of ingredients) {
      try {
        const response = await fetch(`/api/nutrition/${encodeURIComponent(ingredient)}`);
        if (response.ok) {
          const nutritionData = await response.json();
          
          const offlineIngredient: OfflineIngredient = {
            id: ingredient.toLowerCase().replace(/\s+/g, '-'),
            name: ingredient,
            nutritionPer100g: nutritionData,
            category: this.categorizeIngredient(ingredient),
            downloadedAt: new Date(),
          };

          await this.db.ingredients.put(offlineIngredient);
        }
      } catch (error) {
        console.log(`Could not download nutrition data for ${ingredient}`);
      }
    }
  }

  private categorizeIngredient(ingredient: string): string {
    const categories: Record<string, string[]> = {
      'Protein': ['chicken', 'beef', 'pork', 'fish', 'egg', 'tofu', 'beans'],
      'Vegetables': ['tomato', 'onion', 'carrot', 'broccoli', 'spinach', 'pepper'],
      'Grains': ['rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa'],
      'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
      'Spices': ['salt', 'pepper', 'garlic', 'basil', 'oregano', 'thyme'],
    };

    const ingredientLower = ingredient.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => ingredientLower.includes(keyword))) {
        return category;
      }
    }
    return 'Other';
  }

  private async generateVoiceInstructions(instructions: string[]): Promise<string[]> {
    // Convert written instructions to voice-friendly format
    return instructions.map(instruction => {
      return instruction
        .replace(/(\d+)\s*°F/g, '$1 degrees Fahrenheit')
        .replace(/(\d+)\s*°C/g, '$1 degrees Celsius')
        .replace(/(\d+)\s*min/g, '$1 minutes')
        .replace(/(\d+)\s*hrs?/g, '$1 hours')
        .replace(/(\d+)\/(\d+)/g, '$1 over $2')
        .replace(/&/g, 'and');
    });
  }

  private async updateOfflineRecipesList(): Promise<void> {
    try {
      const recipes = await this.db.recipes.toArray();
      const recipeList = recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        downloadedAt: recipe.downloadedAt,
      }));

      await Preferences.set({
        key: 'offlineRecipesList',
        value: JSON.stringify(recipeList),
      });
    } catch (error) {
      console.error('Error updating offline recipes list:', error);
    }
  }
}

export const offlineRecipeService = new OfflineRecipeService();