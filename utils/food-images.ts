// High-quality food image URLs from Unsplash with proper dimensions and food styling
export const getFoodImage = (recipeName: string, mealType?: string): string => {
  // Create a consistent hash for the recipe name to ensure same image for same recipe
  const hash = recipeName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  const seed = hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // High-quality food photography collections from Unsplash
  const foodCollections = [
    'food-drink', 'healthy', 'cooking', 'restaurant', 'meal-prep', 
    'fresh-ingredients', 'delicious', 'gourmet', 'homemade', 'cuisine'
  ];
  
  // Choose collection based on meal type or recipe name
  let collection = 'food-drink';
  if (mealType === 'breakfast') {
    collection = 'breakfast';
  } else if (mealType === 'lunch') {
    collection = 'healthy';
  } else if (mealType === 'dinner') {
    collection = 'gourmet';
  } else if (recipeName.toLowerCase().includes('salad')) {
    collection = 'healthy';
  } else if (recipeName.toLowerCase().includes('pasta')) {
    collection = 'gourmet';
  } else if (recipeName.toLowerCase().includes('chicken')) {
    collection = 'restaurant';
  }
  
  // Use modulo to select consistent image for same recipe
  const imageIndex = seed % 50 + 1;
  
  return `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop&crop=center&auto=format&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
};

// Recipe-specific high-quality images
export const getRecipeImage = (recipeName: string): string => {
  const recipeImages: { [key: string]: string } = {
    'grilled chicken caesar': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'chicken caesar': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'caesar salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'caesar': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'grilled chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'pasta': 'https://images.unsplash.com/photo-1551892374-ecf8df4e6090?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'green salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'hamburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'sandwich': 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'pancake': 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'pancakes': 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'blueberry pancakes': 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'steak': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'beef': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'fish': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'dessert': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'smoothie': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'eggs': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'scrambled eggs': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'omelet': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'avocado toast': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'french toast': 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3',
    'toast': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3'
  };
  
  const lowerName = recipeName.toLowerCase();
  
  // Check for exact matches first (longer phrases)
  const sortedKeys = Object.keys(recipeImages).sort((a, b) => b.length - a.length);
  
  for (const keyword of sortedKeys) {
    if (lowerName.includes(keyword)) {
      return recipeImages[keyword];
    }
  }
  
  // Default high-quality food image
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&crop=center&auto=format&q=85&ixlib=rb-4.0.3';
};

// Meal plan images by meal type
export const getMealPlanImage = (mealType: string): string => {
  const mealImages = {
    breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=250&fit=crop&crop=center&auto=format&q=80',
    lunch: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop&crop=center&auto=format&q=80',
    dinner: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=250&fit=crop&crop=center&auto=format&q=80',
    snack: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=250&fit=crop&crop=center&auto=format&q=80'
  };
  
  return mealImages[mealType as keyof typeof mealImages] || mealImages.dinner;
};