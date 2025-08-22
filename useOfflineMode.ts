import { useState, useEffect } from 'react';
import { offlineRecipeService } from '@/services/offline-recipes';

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [offlineDataInfo, setOfflineDataInfo] = useState({
    recipeCount: 0,
    ingredientCount: 0,
    estimatedSize: '0 KB',
    lastUpdated: null as Date | null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger background sync when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial offline data info
    loadOfflineInfo();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineInfo = async () => {
    try {
      const info = await offlineRecipeService.getStorageInfo();
      setOfflineDataInfo(info);
      setHasOfflineData(info.recipeCount > 0);
    } catch (error) {
      console.error('Error loading offline info:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;
    
    try {
      // Register for background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-recipes');
      }
    } catch (error) {
      console.error('Error registering background sync:', error);
    }
  };

  const downloadForOffline = async (recipeId: string): Promise<boolean> => {
    if (!isOnline) {
      throw new Error('Cannot download recipes while offline');
    }

    try {
      const success = await offlineRecipeService.downloadRecipe(recipeId);
      if (success) {
        await loadOfflineInfo();
      }
      return success;
    } catch (error) {
      console.error('Error downloading recipe for offline:', error);
      return false;
    }
  };

  const removeFromOffline = async (recipeId: string): Promise<boolean> => {
    try {
      const success = await offlineRecipeService.removeOfflineRecipe(recipeId);
      if (success) {
        await loadOfflineInfo();
      }
      return success;
    } catch (error) {
      console.error('Error removing offline recipe:', error);
      return false;
    }
  };

  const clearOfflineData = async (): Promise<boolean> => {
    try {
      const success = await offlineRecipeService.clearOfflineData();
      if (success) {
        await loadOfflineInfo();
      }
      return success;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  };

  const getOfflineRecipes = async () => {
    try {
      return await offlineRecipeService.getAllOfflineRecipes();
    } catch (error) {
      console.error('Error getting offline recipes:', error);
      return [];
    }
  };

  const searchOfflineRecipes = async (query: string) => {
    try {
      return await offlineRecipeService.searchOfflineRecipes(query);
    } catch (error) {
      console.error('Error searching offline recipes:', error);
      return [];
    }
  };

  return {
    isOnline,
    hasOfflineData,
    offlineDataInfo,
    downloadForOffline,
    removeFromOffline,
    clearOfflineData,
    getOfflineRecipes,
    searchOfflineRecipes,
    syncOfflineData,
    loadOfflineInfo
  };
}