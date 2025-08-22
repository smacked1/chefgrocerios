import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSEO, pageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentSuccess from "@/components/payment-success";
import PaymentError from "@/components/payment-error";

// Load Stripe - lazy load only when needed
let stripePromise: Promise<any> | null = null;

const getStripePromise = () => {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    console.warn('Stripe public key not configured - payment features disabled');
    return Promise.resolve(null);
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY).catch((error) => {
      console.warn('Failed to load Stripe.js:', error);
      return null;
    });
  }
  
  return stripePromise;
};

const CheckoutForm = ({ 
  amount, 
  description, 
  onSuccess, 
  onError 
}: { 
  amount: number; 
  description: string;
  onSuccess: () => void;
  onError: (error: string, code?: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        onError(error.message || "Payment failed", error.code);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError("An unexpected error occurred. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold">{description}</h3>
        <p className="text-2xl font-bold text-primary">${amount.toFixed(2)}</p>
      </div>
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
      >
        {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  // SEO optimization
  useSEO(pageSEO.checkout);
  
  const [clientSecret, setClientSecret] = useState("");
  const [amount] = useState(29.99);
  const [description] = useState("Premium AI Cooking Assistant Features");
  const [paymentStatus, setPaymentStatus] = useState<"form" | "success" | "error">("form");
  const [paymentError, setPaymentError] = useState<{message: string; code?: string}>({message: ""});
  const [isRetrying, setIsRetrying] = useState(false);

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
  };

  const handlePaymentError = (message: string, code?: string) => {
    setPaymentError({message, code});
    setPaymentStatus("error");
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setPaymentStatus("form");
    // Reset client secret to get a fresh payment intent
    setClientSecret("");
    
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        amount: amount,
        description: description,
        paymentType: "one-time",
        currency: "usd"
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      handlePaymentError("Failed to initialize payment retry. Please refresh and try again.");
    }
    
    setIsRetrying(false);
  };

  const handleGoBack = () => {
    setPaymentStatus("form");
    setPaymentError({message: ""});
  };

  const { toast } = useToast();

  useEffect(() => {
    // Create PaymentIntent when page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      amount,
      paymentType: "one_time",
      description 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            title: "Setup Required",
            description: data.message || "Payment processing is not configured yet.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  }, [amount, description, toast]);

  // Show payment success screen
  if (paymentStatus === "success") {
    return (
      <PaymentSuccess 
        paymentType="one-time"
        amount={`$${amount.toFixed(2)}`}
        plan="Premium Features"
      />
    );
  }

  // Show payment error screen
  if (paymentStatus === "error") {
    return (
      <PaymentError 
        error={paymentError.message}
        errorCode={paymentError.code}
        onRetry={handleRetry}
        onGoBack={handleGoBack}
        isRetrying={isRetrying}
      />
    );
  }

  // Check if Stripe is available
  const [stripeLoaded, setStripeLoaded] = useState<boolean | null>(null);
  
  useEffect(() => {
    getStripePromise().then((stripe) => {
      setStripeLoaded(stripe !== null);
    });
  }, []);

  if (stripeLoaded === false) {
    return (
      <PaymentError 
        error="Payment system is currently unavailable. Please try again later or contact support."
        onGoBack={() => window.history.back()}
      />
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
            <CardDescription>
              Secure payment powered by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={getStripePromise()} options={{ clientSecret }}>
              <CheckoutForm 
                amount={amount} 
                description={description}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}