// Food Image Display Fixes & Additional Recipe Sources

class ImageDisplayManager {
  private imageCache = new Map<string, string | null>();
  private loadingImages = new Set<string>();
  private fallbackImages = [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', // food generic
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445', // food prep
    'https://images.unsplash.com/photo-1546548970-71785318a17b'  // cooking
  ];

  // Fix image loading with proper error handling
  async loadRecipeImage(recipe: any, preferredSize = '636x393'): Promise<string | null> {
    const cacheKey = `${recipe.id}_${preferredSize}`;
    
    // Return cached image if available
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey) || null;
    }

    // Prevent duplicate loading
    if (this.loadingImages.has(cacheKey)) {
      return null;
    }

    this.loadingImages.add(cacheKey);

    try {
      let imageUrl: string | null = null;

      // Try multiple image sources in order
      const imageSources = [
        () => this.getSpoonacularImage(recipe, preferredSize),
        () => this.getMealDBImage(recipe),
        () => this.getUnsplashFoodImage(recipe.title || recipe.name),
        () => this.getRandomFallback()
      ];

      for (const getImage of imageSources) {
        try {
          const url = await getImage();
          if (url && await this.validateImageUrl(url)) {
            imageUrl = url;
            break;
          }
        } catch (error) {
          console.warn('Image source failed:', error);
          continue;
        }
      }

      // Cache the result
      this.imageCache.set(cacheKey, imageUrl);
      this.loadingImages.delete(cacheKey);
      
      return imageUrl;

    } catch (error) {
      console.error('Failed to load recipe image:', error);
      this.loadingImages.delete(cacheKey);
      return this.getRandomFallback();
    }
  }

  // Get Spoonacular image with proper sizing
  private getSpoonacularImage(recipe: any, size: string): string | null {
    if (recipe.image && recipe.image.includes('spoonacular')) {
      // Fix Spoonacular URL format
      return recipe.image.replace(/\d+x\d+/, size);
    } else if (recipe.id && recipe.source === 'spoonacular') {
      return `https://spoonacular.com/recipeImages/${recipe.id}-${size}.jpg`;
    }
    return null;
  }

  // Get MealDB image (always high quality)
  private getMealDBImage(recipe: any): string | null {
    if (recipe.source === 'themealdb' && recipe.image) {
      return recipe.image;
    }
    return null;
  }

  // Unsplash fallback for food images
  private async getUnsplashFoodImage(recipeName: string): Promise<string | null> {
    const searchTerm = this.extractFoodKeywords(recipeName);
    try {
      // Using public Unsplash API (no key needed for basic usage)
      const response = await fetch(
        `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerm)},food`
      );
      if (response.ok) {
        return response.url;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Extract relevant food keywords from recipe name
  private extractFoodKeywords(recipeName: string): string {
    const foodKeywords = recipeName.toLowerCase()
      .replace(/recipe|easy|quick|homemade|best|delicious/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 2)
      .join(' ');
    return foodKeywords || 'food';
  }

  // Validate that image URL actually works
  private async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && (response.headers.get('content-type')?.startsWith('image/') || false);
    } catch {
      return false;
    }
  }

  // Random fallback for when all else fails
  private getRandomFallback(): string {
    return this.fallbackImages[Math.floor(Math.random() * this.fallbackImages.length)];
  }
}

export { ImageDisplayManager };