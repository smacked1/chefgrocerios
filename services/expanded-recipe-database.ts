// Enhanced Recipe Sources - Get MORE recipes
import { ImageDisplayManager } from './image-display-manager';

interface Recipe {
  id: string;
  title: string;
  name?: string;
  image?: string | null;
  category?: string;
  cuisine?: string;
  instructions?: string;
  ingredients?: any[];
  source: string;
  readyInMinutes?: number;
  servings?: number;
  href?: string;
  publisher?: string;
  sourceUrl?: string;
  normalizedTitle?: string;
  score?: number;
}

class ExpandedRecipeDatabase {
  private imageManager: ImageDisplayManager;
  private sources = {
    spoonacular: { limit: 100, cost: 'paid' },
    themealdb: { limit: 'unlimited', cost: 'free' },
    recipepuppy: { limit: 'unlimited', cost: 'free' },
    edamam: { limit: 100, cost: 'paid' },
    forkify: { limit: 'unlimited', cost: 'free' }
  };

  constructor() {
    this.imageManager = new ImageDisplayManager();
  }

  // Get recipes from ALL sources to maximize variety
  async getAllRecipes(query: string, maxResults = 50): Promise<Recipe[]> {
    const cacheKey = `${query}_${maxResults}`;
    
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey) || [];
    }

    console.log(`Searching for recipes: "${query}"`);
    
    const allRecipes: Recipe[] = [];
    const promises: Promise<Recipe[]>[] = [];

    // Search all sources simultaneously
    promises.push(this.getTheMealDBRecipes(query));
    promises.push(this.getRecipePuppyRecipes(query));
    promises.push(this.getForkifyRecipes(query));
    
    // Paid sources (use sparingly)
    if (this.shouldUsePaidAPIs()) {
      promises.push(this.getSpoonacularRecipes(query, 20));
    }

    try {
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          console.log(`Source ${index} returned ${result.value.length} recipes`);
          allRecipes.push(...result.value);
        } else {
          const errorReason = result.status === 'rejected' ? result.reason : 'Unknown error';
          console.warn(`Source ${index} failed:`, errorReason);
        }
      });

      console.log(`Total recipes found before deduplication: ${allRecipes.length}`);

      // Enhanced deduplication and sorting
      const uniqueRecipes = this.deduplicateRecipes(allRecipes);
      const sortedRecipes = this.sortRecipesByQuality(uniqueRecipes);
      const enhancedRecipes = await this.enhanceWithImages(sortedRecipes);
      
      console.log(`Final unique recipes: ${enhancedRecipes.length}`);
      
      const finalResults = enhancedRecipes.slice(0, maxResults);
      this.searchCache.set(cacheKey, finalResults);
      
      return finalResults;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  }

  private searchCache = new Map<string, Recipe[]>();
  private minRecipesPerSearch = 20;

  // Enhanced TheMealDB search (multiple endpoints)
  private async getTheMealDBRecipes(query: string): Promise<Recipe[]> {
    const recipes: Recipe[] = [];

    try {
      // Search by name
      const nameSearch = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
      const nameData = await nameSearch.json();

      if (nameData.meals) {
        recipes.push(...nameData.meals.map((meal: any) => this.formatMealDBRecipe(meal)));
      }

      // Search by ingredient
      const ingredientSearch = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`);
      const ingredientData = await ingredientSearch.json();

      if (ingredientData.meals) {
        // Get full details for each recipe
        const detailPromises = ingredientData.meals.slice(0, 10).map(async (meal: any) => {
          const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
          const detailData = await detailResponse.json();
          return detailData.meals ? this.formatMealDBRecipe(detailData.meals[0]) : null;
        });

        const detailedRecipes = await Promise.all(detailPromises);
        recipes.push(...detailedRecipes.filter(r => r !== null));
      }
    } catch (error) {
      console.error('TheMealDB error:', error);
    }

    return recipes;
  }

  private formatMealDBRecipe(meal: any): Recipe {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          amount: measure ? measure.trim() : '',
          original: `${measure || ''} ${ingredient}`.trim()
        });
      }
    }

    return {
      id: `mealdb_${meal.idMeal}`,
      title: meal.strMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      cuisine: meal.strArea,
      instructions: meal.strInstructions,
      ingredients: ingredients,
      source: 'themealdb',
      readyInMinutes: this.estimateCookingTime(meal.strInstructions),
      servings: 4
    };
  }

  // Add Recipe Puppy source
  private async getRecipePuppyRecipes(query: string): Promise<Recipe[]> {
    try {
      const response = await fetch(`http://www.recipepuppy.com/api/?q=${encodeURIComponent(query)}&p=1`);
      const data = await response.json();

      return data.results?.map((recipe: any, index: number) => ({
        id: `puppy_${Date.now()}_${index}`,
        title: recipe.title,
        name: recipe.title,
        image: recipe.thumbnail || null,
        ingredients: recipe.ingredients.split(',').map((ing: string) => ({ name: ing.trim() })),
        instructions: 'See full recipe at the source link.',
        source: 'recipepuppy',
        sourceUrl: recipe.href,
        readyInMinutes: 30,
        servings: 4
      })) || [];
    } catch (error) {
      console.error('Recipe Puppy error:', error);
      return [];
    }
  }

  // FREE: Forkify API (modern, good quality)
  private async getForkifyRecipes(query: string): Promise<Recipe[]> {
    try {
      const response = await fetch(
        `https://forkify-api.herokuapp.com/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      return data.recipes?.map((recipe: any) => ({
        id: `forkify_${recipe.recipe_id}`,
        title: recipe.title,
        name: recipe.title,
        image: recipe.image_url,
        ingredients: [], // Would need another API call for details
        source: 'forkify',
        readyInMinutes: 35,
        servings: 4,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url
      })) || [];
    } catch (error) {
      console.error('Forkify error:', error);
      return [];
    }
  }

  // Spoonacular integration (if available)
  private async getSpoonacularRecipes(query: string, limit: number): Promise<Recipe[]> {
    try {
      // This would use existing Spoonacular integration
      const response = await fetch(`/api/recipes/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.results?.map((recipe: any) => ({
        ...recipe,
        source: 'spoonacular',
        title: recipe.title || recipe.name
      })) || [];
    } catch (error) {
      console.error('Spoonacular error:', error);
      return [];
    }
  }

  // Enhanced recipe deduplication
  private deduplicateRecipes(recipes: Recipe[]): Recipe[] {
    const seen = new Map<string, Recipe>();
    const unique: Recipe[] = [];

    for (const recipe of recipes) {
      // Create normalized key for comparison
      const normalizedTitle = recipe.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const key = normalizedTitle;

      if (!seen.has(key)) {
        seen.set(key, recipe);
        unique.push(recipe);
      } else {
        // Keep the recipe with more complete information
        const existing = seen.get(key)!;
        if (this.calculateRecipeCompleteness(recipe) > this.calculateRecipeCompleteness(existing)) {
          seen.set(key, recipe);
          // Replace in unique array
          const index = unique.findIndex(r => r === existing);
          if (index !== -1) {
            unique[index] = recipe;
          }
        }
      }
    }

    return unique;
  }

  private calculateRecipeCompleteness(recipe: Recipe): number {
    let score = 0;

    if (recipe.image && recipe.image.length > 0) score += 3;
    if (recipe.instructions && recipe.instructions.length > 50) score += 5;
    if (recipe.ingredients && recipe.ingredients.length > 3) score += 4;
    if (recipe.readyInMinutes && recipe.readyInMinutes > 0) score += 2;
    if (recipe.servings && recipe.servings > 0) score += 1;
    if (recipe.category || recipe.cuisine) score += 1;

    return score;
  }

  private sortRecipesByQuality(recipes: Recipe[]): Recipe[] {
    return recipes.sort((a, b) => {
      const scoreA = this.calculateRecipeCompleteness(a);
      const scoreB = this.calculateRecipeCompleteness(b);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // Secondary sort by source preference
      const sourceScore: Record<string, number> = { 
        themealdb: 3, 
        spoonacular: 2, 
        forkify: 1, 
        recipepuppy: 0 
      };
      return (sourceScore[b.source] || 0) - (sourceScore[a.source] || 0);
    });
  }

  // Enhance with images after deduplication and sorting
  private async enhanceWithImages(recipes: Recipe[]): Promise<Recipe[]> {
    const enhanced: Recipe[] = [];

    for (const recipe of recipes) {
      const enhancedImage = await this.imageManager.loadRecipeImage(recipe);
      
      enhanced.push({
        ...recipe,
        image: enhancedImage,
        score: this.calculateRecipeCompleteness(recipe)
      });
    }

    return enhanced;
  }

  // Score recipes by quality indicators
  private calculateRecipeScore(recipe: Recipe): number {
    let score = 0;
    
    // Has image
    if (recipe.image) score += 10;
    
    // Has instructions
    if (recipe.instructions && recipe.instructions.length > 50) score += 8;
    
    // Has ingredients list
    if (recipe.ingredients && recipe.ingredients.length > 3) score += 6;
    
    // Source reliability
    const sourceScores: Record<string, number> = {
      themealdb: 8,
      spoonacular: 7,
      forkify: 6,
      edamam: 5,
      recipepuppy: 3
    };
    score += sourceScores[recipe.source] || 1;
    
    // Title quality (not too short/long)
    if (recipe.title.length > 10 && recipe.title.length < 80) score += 3;
    
    return score;
  }

  private parseMealDBIngredients(meal: any): any[] {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          amount: measure?.trim() || '',
          original: `${measure || ''} ${ingredient}`.trim()
        });
      }
    }
    return ingredients;
  }

  private estimateCookingTime(instructions?: string): number {
    if (!instructions) return 30;

    const timeRegex = /(\d+)\s*(minutes?|mins?|hours?|hrs?)/gi;
    const matches = instructions.match(timeRegex);

    if (matches && matches.length > 0) {
      const times = matches.map(match => {
        const num = parseInt(match);
        const isHour = /hours?|hrs?/i.test(match);
        return isHour ? num * 60 : num;
      });

      return Math.max(...times);
    }

    // Estimate based on instruction length
    const words = instructions.split(' ').length;
    return Math.min(Math.max(Math.floor(words / 10), 15), 120);
  }

  private shouldUsePaidAPIs(): boolean {
    // Only use paid APIs if free sources don't have enough results
    // You can implement quota checking here
    return false; // Start with false to save money
  }
}

export { ExpandedRecipeDatabase };
export type { Recipe };