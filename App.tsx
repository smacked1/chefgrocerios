/*
 * ChefGrocer - AI-Powered Smart Cooking Assistant
 * Copyright (c) 2025 Myles Barber. All rights reserved.
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * 
 * For licensing inquiries: dxmylesx22@gmail.com
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/lib/error-boundary";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import OfflineIndicator from "@/components/offline-indicator";
import { PerformanceMonitor } from "@/components/performance-monitor";
import CookieConsent from "@/components/cookie-consent";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import { Landing } from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import Revenue from "@/pages/revenue";

import RevenueOptimization from "@/pages/revenue-optimization";
import NutritionAnalysis from "@/pages/nutrition-analysis";
import PaymentSetup from "@/pages/payment-setup";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import PrivacyDashboard from "@/pages/privacy-dashboard";
import TermsOfUse from "@/pages/terms";
import DevLogin from "@/pages/dev-login";
import BarcodeScannerPage from "@/pages/barcode-scanner";
import DownloadPage from "@/pages/download";
import { SubscriptionMobile } from "@/pages/subscription-mobile";
import GroceryNotepad from "@/pages/grocery-notepad";
import AppFeatures from "@/pages/app-features";
import RecipeScraper from "@/pages/recipe-scraper";
import StoreFinder from "@/pages/store-finder";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={DevLogin} />
      <Route path="/landing" component={Landing} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/download" component={DownloadPage} />
      
      {/* Show home page directly - authentication is optional */}
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/revenue" component={Revenue} />
      <Route path="/revenue-optimization" component={RevenueOptimization} />
      <Route path="/payment-setup" component={PaymentSetup} />
      <Route path="/privacy-dashboard" component={PrivacyDashboard} />
      <Route path="/barcode-scanner" component={BarcodeScannerPage} />
      <Route path="/subscription-mobile" component={SubscriptionMobile} />
      <Route path="/grocery-notepad" component={GroceryNotepad} />
      <Route path="/nutrition-analysis" component={NutritionAnalysis} />
      <Route path="/app-features" component={AppFeatures} />
      <Route path="/recipe-scraper" component={RecipeScraper} />
      <Route path="/store-finder" component={StoreFinder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <PWAInstallPrompt />
          <OfflineIndicator />
          <PerformanceMonitor />
          <CookieConsent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
