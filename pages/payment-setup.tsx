import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/navigation-header";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  Crown, 
  ChefHat, 
  ShoppingCart,
  Check,
  AlertCircle,
  Banknote
} from "lucide-react";

// Load Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

// Subscription plans
const subscriptionPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: [
      "Basic recipe search",
      "Simple meal planning",
      "Limited voice commands",
      "Basic nutrition info"
    ],
    current: true
  },
  {
    id: "premium",
    name: "Premium",
    price: 4.99,
    interval: "month",
    features: [
      "Unlimited AI recipe generation",
      "Advanced meal planning",
      "Full voice command suite",
      "Detailed nutrition analysis",
      "Price comparison & savings",
      "Custom grocery lists"
    ],
    popular: true
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    interval: "month",
    features: [
      "Everything in Premium",
      "Restaurant partnership access",
      "Bulk meal planning",
      "Advanced analytics",
      "Priority customer support",
      "Early feature access"
    ]
  },
  {
    id: "lifetime",
    name: "Lifetime Pass",
    price: 99.99,
    interval: "one-time",
    features: [
      "All Pro features forever",
      "No monthly fees",
      "Lifetime updates",
      "VIP support",
      "Exclusive content access"
    ],
    bestValue: true
  }
];

function PaymentForm({ planId, clientSecret }: { planId: string, clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed...",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : `Subscribe to ${planId}`}
      </Button>
    </form>
  );
}

function SubscriptionCard({ plan }: { plan: typeof subscriptionPlans[0] }) {
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (plan.id === "free") {
        return { success: true };
      }
      
      const response = await apiRequest("POST", "/api/create-subscription", {
        planId: plan.id,
        priceId: `price_${plan.id}` // In production, these would be real Stripe price IDs
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      } else {
        toast({
          title: "Success!",
          description: `You're now on the ${plan.name} plan`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    }
  });

  if (showPayment && clientSecret) {
    return (
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment - {plan.name}
          </CardTitle>
          <CardDescription>
            ${plan.price}{plan.interval === "month" ? "/month" : " one-time"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm planId={plan.name} clientSecret={clientSecret} />
          </Elements>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative ${plan.popular ? "border-2 border-blue-500" : ""} ${plan.bestValue ? "border-2 border-green-500" : ""}`}>
      {plan.popular && (
        <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500">
          Most Popular
        </Badge>
      )}
      {plan.bestValue && (
        <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500">
          Best Value
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">
            ${plan.price}
          </span>
          {plan.interval !== "one-time" && (
            <span className="text-gray-500">/{plan.interval}</span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          variant={plan.current ? "secondary" : "default"}
          disabled={plan.current || subscribeMutation.isPending}
          onClick={() => subscribeMutation.mutate()}
        >
          {plan.current ? "Current Plan" : subscribeMutation.isPending ? "Loading..." : "Choose Plan"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PaymentSetup() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: revenueStats } = useQuery({
    queryKey: ["/api/revenue/stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <NavigationHeader 
        title="Payment Setup" 
        description="Configure revenue collection and subscriptions"
        backHref="/"
      />
      
      <div className="container mx-auto py-8 space-y-8">

      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscriptions">
            <Crown className="h-4 w-4 mr-2" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="partnerships">
            <ChefHat className="h-4 w-4 mr-2" />
            Restaurant Fees
          </TabsTrigger>
          <TabsTrigger value="affiliates">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Affiliate Income
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <Banknote className="h-4 w-4 mr-2" />
            Your Payouts
          </TabsTrigger>
        </TabsList>

        {/* Subscription Plans */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Premium Subscription Plans
              </CardTitle>
              <CardDescription>
                Users pay monthly/yearly subscriptions for premium features
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
              <SubscriptionCard key={plan.id} plan={plan} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">100 users</div>
                  <div className="text-sm text-gray-600">Premium ($4.99/mo)</div>
                  <div className="text-lg font-semibold">$499/month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">50 users</div>
                  <div className="text-sm text-gray-600">Pro ($9.99/mo)</div>
                  <div className="text-lg font-semibold">$499/month</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">20 users</div>
                  <div className="text-sm text-gray-600">Lifetime ($99.99)</div>
                  <div className="text-lg font-semibold">$2,000/month</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">Total</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                  <div className="text-lg font-semibold">$2,998/month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurant Partnership Fees */}
        <TabsContent value="partnerships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Restaurant Partnership Revenue
              </CardTitle>
              <CardDescription>
                Restaurants pay monthly fees to be featured in your app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Basic Listing</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">$299/month</div>
                  <p className="text-gray-600 mb-4">Restaurant profile + menu integration</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Basic restaurant profile</li>
                    <li>• Menu item listings</li>
                    <li>• Customer reviews</li>
                    <li>• Basic analytics</li>
                  </ul>
                </div>
                
                <div className="p-6 border rounded-lg border-orange-300 bg-orange-50">
                  <h3 className="text-xl font-semibold mb-2">Featured Partner</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-2">$599/month</div>
                  <p className="text-gray-600 mb-4">Priority placement + promotions</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Everything in Basic</li>
                    <li>• Featured placement</li>
                    <li>• Promotional campaigns</li>
                    <li>• Advanced analytics</li>
                    <li>• Direct ordering integration</li>
                  </ul>
                </div>
                
                <div className="p-6 border rounded-lg border-purple-300 bg-purple-50">
                  <h3 className="text-xl font-semibold mb-2">Premium Partner</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-2">$999/month</div>
                  <p className="text-gray-600 mb-4">Exclusive features + marketing</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Everything in Featured</li>
                    <li>• Exclusive recipe partnerships</li>
                    <li>• Custom marketing campaigns</li>
                    <li>• Priority customer support</li>
                    <li>• Revenue sharing program</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Revenue Potential:</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">10 Basic</div>
                    <div className="text-sm">$2,990/month</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">5 Featured</div>
                    <div className="text-sm">$2,995/month</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">3 Premium</div>
                    <div className="text-sm">$2,997/month</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-800">Total</div>
                    <div className="text-sm">$8,982/month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Affiliate Commissions */}
        <TabsContent value="affiliates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Affiliate Commission Revenue
              </CardTitle>
              <CardDescription>
                Earn commissions from grocery delivery and kitchen equipment sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Grocery Delivery Partners</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Instacart</span>
                      <Badge variant="secondary">8-15% commission</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>DoorDash</span>
                      <Badge variant="secondary">5-12% commission</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Uber Eats</span>
                      <Badge variant="secondary">6-10% commission</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Amazon Fresh</span>
                      <Badge variant="secondary">4-8% commission</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Kitchen Equipment Partners</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Williams Sonoma</span>
                      <Badge variant="secondary">5-10% commission</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sur La Table</span>
                      <Badge variant="secondary">6-12% commission</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Amazon Kitchen</span>
                      <Badge variant="secondary">3-8% commission</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Target Kitchen</span>
                      <Badge variant="secondary">2-6% commission</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Monthly Commission Projections:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">$50,000</div>
                    <div className="text-sm">Grocery sales (10% avg)</div>
                    <div className="text-lg font-semibold">$5,000/month</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">$20,000</div>
                    <div className="text-sm">Equipment sales (7% avg)</div>
                    <div className="text-lg font-semibold">$1,400/month</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">Total</div>
                    <div className="text-sm">Monthly Commissions</div>
                    <div className="text-lg font-semibold">$6,400/month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Information */}
        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Where Your Money Goes
              </CardTitle>
              <CardDescription>
                All payments are processed through Stripe and deposited directly to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Payout Schedule */}
              <div className="p-6 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-5 w-5 text-green-600" />
                  <h3 className="text-xl font-semibold">Automatic Bank Deposits</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Subscription Payments</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Collected monthly/yearly automatically</li>
                      <li>• Deposited to your bank within 2-7 business days</li>
                      <li>• Stripe fee: 2.9% + $0.30 per transaction</li>
                      <li>• Failed payments automatically retried</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Restaurant Partnership Fees</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Collected monthly on the 1st</li>
                      <li>• Deposited within 2-7 business days</li>
                      <li>• Stripe fee: 2.9% + $0.30 per transaction</li>
                      <li>• Automatic invoice generation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Affiliate Payouts */}
              <div className="p-6 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-semibold">Affiliate Commission Payouts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Payment Schedule</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Instacart: Monthly, net 30 days</li>
                      <li>• DoorDash: Bi-weekly payments</li>
                      <li>• Amazon: Monthly, net 60 days</li>
                      <li>• Other partners: Various schedules</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Payment Methods</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Direct bank deposit (ACH)</li>
                      <li>• PayPal (some partners)</li>
                      <li>• Check (backup option)</li>
                      <li>• International wire transfers</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Revenue Summary */}
              <div className="p-6 border rounded-lg bg-yellow-50">
                <h3 className="text-xl font-semibold mb-4">Total Monthly Revenue Potential</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">$2,998</div>
                    <div className="text-sm text-gray-600">Subscriptions</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">$8,982</div>
                    <div className="text-sm text-gray-600">Restaurant Fees</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$6,400</div>
                    <div className="text-sm text-gray-600">Affiliate Income</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 text-white rounded-lg">
                    <div className="text-2xl font-bold">$18,380</div>
                    <div className="text-sm">Total Monthly</div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold text-green-600">$220,560</div>
                  <div className="text-gray-600">Projected Annual Revenue</div>
                </div>
              </div>

              {/* Bank Account Setup */}
              <Card>
                <CardHeader>
                  <CardTitle>Set Up Bank Account for Deposits</CardTitle>
                  <CardDescription>
                    Connect your bank account to receive automatic deposits from Stripe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="routing">Routing Number</Label>
                      <Input id="routing" placeholder="9-digit routing number" />
                    </div>
                    <div>
                      <Label htmlFor="account">Account Number</Label>
                      <Input id="account" placeholder="Your account number" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input id="bank-name" placeholder="e.g., Chase Bank" />
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => {
                      console.log('Connect Bank Account clicked');
                      // Integration with Stripe Connect would go here
                      alert('Bank account connection would be implemented with Stripe Connect');
                    }}
                  >
                    Connect Bank Account
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>Bank information is securely encrypted and stored by Stripe</span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}