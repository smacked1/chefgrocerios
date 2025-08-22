import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Star, CreditCard } from "lucide-react";
import UpgradeModal from "./upgrade-modal";
import OneClickUpgradeCTA from "./one-click-upgrade-cta";

export default function PaymentUpgrade() {
  return (
    <div className="space-y-6">
      {/* One-Click Upgrade CTA */}
      <OneClickUpgradeCTA variant="inline" />
      
      {/* Featured Upgrade Modal Trigger */}
      <div className="text-center">
        <UpgradeModal />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* One-time Purchase Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2">
          <Badge variant="secondary">
            <CreditCard className="h-3 w-3 mr-1" />
            One-time
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-500" />
            Premium Features
          </CardTitle>
          <CardDescription>
            Unlock advanced AI cooking features with a one-time payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-3xl font-bold">$29.99</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Advanced recipe generation</li>
              <li>• Nutritional analysis & tracking</li>
              <li>• Premium voice commands</li>
              <li>• Smart grocery optimization</li>
              <li>• Lifetime access</li>
            </ul>
            <Link href="/checkout">
              <Button 
                className="w-full"
                onClick={() => {
                  console.log('One-time upgrade clicked');
                  window.location.href = '/checkout?amount=29.99&type=lifetime';
                }}
              >
                Upgrade Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card className="relative overflow-hidden border-primary">
        <div className="absolute top-0 right-0 p-2">
          <Badge>
            <Crown className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Premium Subscription
          </CardTitle>
          <CardDescription>
            Get the full AI cooking experience with monthly updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-3xl font-bold">
              $4.99
              <span className="text-sm font-normal text-muted-foreground">/month</span>
              <div className="text-sm text-green-600 font-medium">
                or $49.99/year (save 17%)
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Everything in one-time purchase</li>
              <li>• Monthly premium meal plans</li>
              <li>• Priority customer support</li>
              <li>• New features as they release</li>
              <li>• Cancel anytime</li>
            </ul>
            <Link href="/subscribe">
              <Button 
                className="w-full"
                onClick={() => {
                  console.log('Subscription clicked');
                  window.location.href = '/subscribe?plan=premium';
                }}
              >
                Start Subscription
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}