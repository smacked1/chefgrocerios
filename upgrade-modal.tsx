import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X } from "lucide-react";
import { Link } from "wouter";

interface UpgradeModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UpgradeModal({ trigger, isOpen, onOpenChange }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  const defaultTrigger = (
    <Button 
      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
      onClick={() => {
        console.log('Default upgrade modal trigger clicked');
        window.location.href = '/subscribe?plan=premium';
      }}
    >
      <Crown className="h-4 w-4 mr-2" />
      Upgrade to ChefGrocer Pro
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Upgrade to ChefGrocer Pro 🍽
            </DialogTitle>
            <p className="text-gray-600">
              Unlock the full potential of your AI cooking assistant
            </p>
          </DialogHeader>

          {/* Feature List */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Unlimited weekly meal plans</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Grocery lists auto-generated</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Pantry tracking & budgeting tools</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Save meals and get custom AI plans</span>
            </div>
          </div>

          {/* Pricing Toggle */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPlan === "monthly"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("yearly")}
                className={`px-4 py-2 rounded-lg transition-colors relative ${
                  selectedPlan === "yearly"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Yearly
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0">
                  Save 29%
                </Badge>
              </button>
            </div>

            <div className="text-center">
              {selectedPlan === "monthly" ? (
                <div>
                  <span className="text-3xl font-bold text-gray-900">$4.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
              ) : (
                <div>
                  <span className="text-3xl font-bold text-gray-900">$49.99</span>
                  <span className="text-gray-600">/year</span>
                  <div className="text-sm text-green-600 font-medium">
                    Save $9.89 compared to monthly
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <Link href="/subscribe">
              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                size="lg"
              >
                Upgrade Now
              </Button>
            </Link>
            <p className="text-center text-xs text-gray-500">
              Cancel anytime • 7-day money back guarantee
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}