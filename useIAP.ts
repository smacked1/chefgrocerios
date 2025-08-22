/*
 * ChefGrocer - AI-Powered Smart Cooking Assistant
 * Copyright (c) 2025 Myles Barber. All rights reserved.
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * 
 * For licensing inquiries: dxmylesx22@gmail.com
 */

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { apiRequest } from "@/lib/queryClient";

// iOS In-App Purchase product IDs
const productIds = ['premium_monthly', 'pro_monthly', 'lifetime_access'];

interface Product {
  productId: string;
  title: string;
  price: string;
  description: string;
}

interface Purchase {
  productId: string;
  transactionId: string;
  transactionDate: string;
}

export function useIAP() {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchased, setPurchased] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize IAP on iOS
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('IAP only available on iOS platform');
      return;
    }

    async function initIAP() {
      try {
        setLoading(true);
        
        // Simulate iOS IAP products using our existing Stripe subscriptions
        const mockProducts: Product[] = [
          {
            productId: 'premium_monthly',
            title: 'Premium Monthly',
            price: '$4.99',
            description: 'Unlimited AI voice commands and advanced meal planning'
          },
          {
            productId: 'pro_monthly', 
            title: 'Pro Monthly',
            price: '$9.99',
            description: 'Everything in Premium plus priority support and partnerships'
          },
          {
            productId: 'lifetime_access',
            title: 'Lifetime Access',
            price: '$99.99', 
            description: 'One-time payment for lifetime access to all features'
          }
        ];
        
        setProducts(mockProducts);

        // Check user's current subscription status
        try {
          const userResponse = await apiRequest('GET', '/api/auth/user');
          if (userResponse) {
            const user = await userResponse.json();
            // Mark as purchased based on user's subscription status
            const purchasedMap: Record<string, boolean> = {};
            if (user.subscriptionTier === 'premium') {
              purchasedMap['premium_monthly'] = true;
            } else if (user.subscriptionTier === 'pro') {
              purchasedMap['pro_monthly'] = true;
            } else if (user.subscriptionTier === 'lifetime') {
              purchasedMap['lifetime_access'] = true;
            }
            setPurchased(purchasedMap);
          }
        } catch (err) {
          console.log('User not authenticated or subscription check failed');
        }

      } catch (err) {
        console.error('IAP initialization error:', err);
        setError('Failed to initialize purchases');
      } finally {
        setLoading(false);
      }
    }

    initIAP();

    return () => {
      // Cleanup if needed
    };
  }, []);

  async function buy(productId: string) {
    try {
      setLoading(true);
      setError(null);
      
      // On mobile, redirect to subscription flow
      if (Capacitor.isNativePlatform()) {
        // For iOS app, we'll use Stripe's payment system
        window.location.href = '/subscribe';
        return;
      }
      
      // Web platform - direct to subscription
      window.location.href = '/subscribe';
      
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  }

  async function restore() {
    try {
      setLoading(true);
      setError(null);
      
      // Check current user subscription status
      const userResponse = await apiRequest('GET', '/api/auth/user');
      if (userResponse) {
        const user = await userResponse.json();
        const purchasedMap: Record<string, boolean> = {};
        
        if (user.subscriptionTier === 'premium') {
          purchasedMap['premium_monthly'] = true;
        } else if (user.subscriptionTier === 'pro') {
          purchasedMap['pro_monthly'] = true;
        } else if (user.subscriptionTier === 'lifetime') {
          purchasedMap['lifetime_access'] = true;
        }
        
        setPurchased(purchasedMap);
        console.log('Subscription status restored');
      }
      
    } catch (err: any) {
      console.error('Restore error:', err);
      setError(err.message || 'Restore failed');
    } finally {
      setLoading(false);
    }
  }

  return { 
    products, 
    purchased, 
    buy, 
    restore, 
    loading, 
    error,
    isAvailable: true // Available on all platforms via Stripe
  };
}