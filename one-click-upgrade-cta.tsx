import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, X } from "lucide-react";
import UpgradeModal from "./upgrade-modal";

interface OneClickUpgradeCTAProps {
  variant?: "floating" | "inline" | "banner";
  className?: string;
}

export default function OneClickUpgradeCTA({ variant = "floating", className = "" }: OneClickUpgradeCTAProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible && variant === "floating") return null;

  if (variant === "banner") {
    return (
      <div className={`bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 relative ${className}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Upgrade to ChefGrocer Pro</h3>
              <p className="text-sm opacity-90">Get unlimited meal plans, auto grocery lists & more for just $4.99/month</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <UpgradeModal
              trigger={
                <Button 
                  variant="secondary" 
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
                  onClick={() => {
                    console.log('Banner upgrade clicked');
                    window.location.href = '/subscribe?plan=premium';
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <div className="fixed bottom-24 right-2 z-40 max-w-[120px]">
        <div className="relative">
          <UpgradeModal
            trigger={
              <Button 
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-3 py-2 text-xs opacity-90 hover:opacity-100 w-full"
                onClick={() => {
                  console.log('Floating upgrade clicked');
                  window.location.href = '/subscribe?plan=premium';
                }}
              >
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gray-500 text-white hover:bg-gray-600 p-0 text-xs"
          >
            <X className="h-2 w-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`${className}`}>
      <UpgradeModal
        trigger={
          <Button 
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full"
            onClick={() => {
              console.log('Inline upgrade clicked');
              window.location.href = '/subscribe?plan=premium';
            }}
          >
            <Crown className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-bold">Upgrade to ChefGrocer Pro</div>
              <div className="text-sm opacity-90">$4.99/month or $49.99/year</div>
            </div>
          </Button>
        }
      />
    </div>
  );
}