import { Purchases, LOG_LEVEL, type PurchasesOfferings } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export interface RevenueCatConfig {
  apiKey: string;
  appUserId?: string;
}

export class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;
  private currentOfferings: PurchasesOfferings | null = null;

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(config: RevenueCatConfig): Promise<boolean> {
    try {
      // Only initialize on mobile platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('RevenueCat: Running on web, skipping initialization');
        return false;
      }

      await Purchases.setLogLevel({ level: LOG_LEVEL.INFO });
      
      await Purchases.configure({
        apiKey: config.apiKey,
        appUserID: config.appUserId,
      });

      this.isInitialized = true;
      console.log('RevenueCat: Successfully initialized');

      // Load offerings
      await this.loadOfferings();
      
      return true;
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async loadOfferings(): Promise<PurchasesOfferings | null> {
    try {
      if (!this.isInitialized) {
        console.warn('RevenueCat: Not initialized');
        return null;
      }

      const offerings = await Purchases.getOfferings();
      this.currentOfferings = offerings;
      
      console.log('RevenueCat offerings loaded:', offerings);
      return offerings;
    } catch (error) {
      console.error('Error loading RevenueCat offerings:', error);
      return null;
    }
  }

  async purchasePremium(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.warn('RevenueCat: Not initialized');
        return false;
      }

      if (!this.currentOfferings) {
        await this.loadOfferings();
      }

      const premiumOffering = this.currentOfferings?.current;
      if (!premiumOffering) {
        console.error('No premium offering available');
        return false;
      }

      // Get available packages and find monthly/premium one
      const availablePackages = premiumOffering.availablePackages;
      const monthlyPackage = availablePackages.find(pkg => 
        pkg.offeringIdentifier.includes('monthly') || 
        pkg.product.identifier.includes('monthly') ||
        pkg.product.identifier.includes('premium')
      ) || availablePackages[0]; // fallback to first package
      
      if (!monthlyPackage) {
        console.error('No packages available');
        return false;
      }

      console.log('Attempting to purchase:', monthlyPackage.identifier);
      
      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: monthlyPackage
      });

      // Check if user has premium entitlement
      const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      if (hasPremium) {
        console.log('Purchase successful! User has premium access');
        // Sync with backend
        await this.syncPremiumStatus(customerInfo);
        return true;
      } else {
        console.log('Purchase completed but premium not active');
        return false;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      return false;
    }
  }

  async checkPremiumStatus(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      // Sync status with backend
      if (hasPremium) {
        await this.syncPremiumStatus(customerInfo);
      }
      
      return hasPremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      if (hasPremium) {
        await this.syncPremiumStatus(customerInfo);
        console.log('Purchases restored successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  private async syncPremiumStatus(customerInfo: any): Promise<void> {
    try {
      // Send premium status to backend
      const response = await fetch('/api/revenuecat/sync-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_user_id: customerInfo.originalAppUserId,
          entitlements: customerInfo.entitlements.active,
          premium_expires: customerInfo.entitlements.active['premium']?.expirationDate,
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync premium status with backend');
      }
    } catch (error) {
      console.error('Error syncing premium status:', error);
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        return;
      }

      await Purchases.logIn({ appUserID: userId });
      console.log('RevenueCat user ID set to:', userId);
    } catch (error) {
      console.error('Error setting RevenueCat user ID:', error);
    }
  }

  async logOut(): Promise<void> {
    try {
      if (!this.isInitialized) {
        return;
      }

      await Purchases.logOut();
      console.log('RevenueCat user logged out');
    } catch (error) {
      console.error('Error logging out from RevenueCat:', error);
    }
  }
}

// Export singleton instance
export const revenueCat = RevenueCatService.getInstance();