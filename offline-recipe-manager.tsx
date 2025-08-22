import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { offlineRecipeService, type OfflineRecipe } from '@/services/offline-recipes';
import { 
  Download, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Clock, 
  HardDrive,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Search,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export function OfflineRecipeManager() {
  const [offlineRecipes, setOfflineRecipes] = useState<OfflineRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<OfflineRecipe[]>([]);
  const [storageInfo, setStorageInfo] = useState({
    recipeCount: 0,
    ingredientCount: 0,
    estimatedSize: '0 KB',
    lastUpdated: null as Date | null,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloading, setDownloading] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadOfflineRecipes();
    loadStorageInfo();
    
    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Filter recipes based on search
    if (searchQuery.trim() === '') {
      setFilteredRecipes(offlineRecipes);
    } else {
      const filtered = offlineRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, offlineRecipes]);

  const loadOfflineRecipes = async () => {
    try {
      const recipes = await offlineRecipeService.getAllOfflineRecipes();
      setOfflineRecipes(recipes);
    } catch (error) {
      console.error('Error loading offline recipes:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await offlineRecipeService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const downloadRecipe = async (recipeId: string, recipeName: string) => {
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to download recipes",
        variant: "destructive",
      });
      return;
    }

    setDownloading(prev => [...prev, recipeId]);
    
    try {
      const success = await offlineRecipeService.downloadRecipe(recipeId);
      
      if (success) {
        await loadOfflineRecipes();
        await loadStorageInfo();
        toast({
          title: "Recipe Downloaded",
          description: `${recipeName} is now available offline`,
        });
      } else {
        toast({
          title: "Download Failed",
          description: `Could not download ${recipeName}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download recipe for offline use",
        variant: "destructive",
      });
    } finally {
      setDownloading(prev => prev.filter(id => id !== recipeId));
    }
  };

  const removeOfflineRecipe = async (recipeId: string, recipeName: string) => {
    try {
      const success = await offlineRecipeService.removeOfflineRecipe(recipeId);
      
      if (success) {
        await loadOfflineRecipes();
        await loadStorageInfo();
        toast({
          title: "Recipe Removed",
          description: `${recipeName} removed from offline storage`,
        });
      }
    } catch (error) {
      toast({
        title: "Remove Error",
        description: "Failed to remove recipe from offline storage",
        variant: "destructive",
      });
    }
  };

  const clearAllOfflineData = async () => {
    try {
      const success = await offlineRecipeService.clearOfflineData();
      
      if (success) {
        await loadOfflineRecipes();
        await loadStorageInfo();
        toast({
          title: "Storage Cleared",
          description: "All offline recipe data has been removed",
        });
      }
    } catch (error) {
      toast({
        title: "Clear Error",
        description: "Failed to clear offline storage",
        variant: "destructive",
      });
    }
  };

  const downloadCurrentMealPlan = async () => {
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to download meal plans",
        variant: "destructive",
      });
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const success = await offlineRecipeService.downloadMealPlan('current-user', today);
      
      if (success) {
        await loadOfflineRecipes();
        await loadStorageInfo();
        toast({
          title: "Meal Plan Downloaded",
          description: "Today's meal plan is now available offline",
        });
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download meal plan",
        variant: "destructive",
      });
    }
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return 'Recently';
  };

  const getStorageUsagePercentage = () => {
    const maxStorage = 50; // Max 50 recipes
    return Math.min((storageInfo.recipeCount / maxStorage) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange-600 mb-2">Offline Recipes</h2>
        <p className="text-gray-600">Download recipes for cooking without internet</p>
      </div>

      {/* Connection Status */}
      <Card className={isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="flex items-center gap-3 p-4">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Online</h3>
                <p className="text-sm text-green-600">You can download new recipes</p>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Offline Mode</h3>
                <p className="text-sm text-red-600">Using stored recipes only</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{storageInfo.recipeCount}</div>
              <div className="text-sm text-gray-600">Recipes Stored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{storageInfo.ingredientCount}</div>
              <div className="text-sm text-gray-600">Ingredients Cached</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{storageInfo.estimatedSize}</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm text-gray-600">{storageInfo.recipeCount}/50 recipes</span>
            </div>
            <Progress value={getStorageUsagePercentage()} className="h-2" />
          </div>

          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Last Updated: {formatLastUpdated(storageInfo.lastUpdated)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllOfflineData}
              disabled={storageInfo.recipeCount === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {isOnline && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Download</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={downloadCurrentMealPlan} className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Download Today's Meal Plan
              </Button>
              <Button variant="outline" className="flex-1" disabled>
                <Smartphone className="w-4 h-4 mr-2" />
                Download Favorites
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Offline Recipes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Offline Recipes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search your offline recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Offline Recipes List */}
      <Card>
        <CardHeader>
          <CardTitle>Downloaded Recipes ({filteredRecipes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {offlineRecipes.length === 0 ? (
                <>
                  <WifiOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium mb-2">No Offline Recipes</h3>
                  <p>Download recipes when online to access them without internet</p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium mb-2">No Results Found</h3>
                  <p>Try searching with different keywords</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{recipe.name}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <WifiOff className="w-3 h-3 mr-1" />
                          Offline
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.cookTime} min
                        </span>
                        <span>Serves {recipe.servings}</span>
                        <span>Downloaded {formatLastUpdated(recipe.downloadedAt)}</span>
                      </div>

                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {recipe.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {recipe.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{recipe.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOfflineRecipe(recipe.id, recipe.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Offline Mode Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Downloaded recipes include voice instructions for hands-free cooking</li>
                <li>• Nutrition information is cached for all ingredients</li>
                <li>• Recipes automatically update when you reconnect to internet</li>
                <li>• Maximum 50 recipes can be stored offline</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OfflineRecipeManager;