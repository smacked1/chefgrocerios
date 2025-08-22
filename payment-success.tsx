import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Star, ArrowRight, Home, Receipt } from "lucide-react";

interface PaymentSuccessProps {
  paymentType?: "subscription" | "one-time";
  amount?: string;
  plan?: string;
  onContinue?: () => void;
}

export default function PaymentSuccess({ 
  paymentType = "subscription", 
  amount = "$4.99",
  plan = "ChefGrocer Pro",
  onContinue 
}: PaymentSuccessProps) {
  useEffect(() => {
    // Confetti or celebration effect could be added here
    const timer = setTimeout(() => {
      if (onContinue) onContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Successful! 🎉
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-gray-600">
              Welcome to <span className="font-semibold text-orange-600">{plan}</span>!
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Badge className="bg-green-100 text-green-700">
                {paymentType === "subscription" ? "Monthly Subscription" : "One-time Purchase"}
              </Badge>
              <Badge variant="outline">
                {amount}
              </Badge>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-orange-700">
              <Crown className="h-5 w-5" />
              <span className="font-medium">Your Premium Features</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Unlimited weekly meal plans</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Auto-generated grocery lists</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Pantry tracking & budgeting</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Custom AI meal plans</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {paymentType === "subscription" 
                ? "Your subscription is now active and will renew automatically."
                : "You now have lifetime access to premium features."
              }
            </p>
            
            <div className="space-y-2">
              <Link href="/">
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  onClick={() => {
                    console.log('Start Using Pro Features clicked');
                    if (onContinue) {
                      onContinue();
                    } else {
                      window.location.href = '/';
                    }
                  }}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Start Using Pro Features
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  console.log('View Receipt clicked');
                  // Generate and download receipt
                  window.open('/api/payment/receipt', '_blank');
                }}
              >
                <Receipt className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            <p>
              Need help? Contact our support team at dxmylesx22@gmail.com
              {paymentType === "subscription" && (
                <span className="block mt-1">
                  You can manage your subscription anytime in your account settings.
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}