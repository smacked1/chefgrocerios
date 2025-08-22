import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, RefreshCw, CreditCard, HelpCircle, ArrowLeft, AlertTriangle } from "lucide-react";

interface PaymentErrorProps {
  error?: string;
  errorCode?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  isRetrying?: boolean;
}

export default function PaymentError({ 
  error = "Your payment could not be processed",
  errorCode,
  onRetry,
  onGoBack,
  isRetrying = false
}: PaymentErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorMessage = (code?: string) => {
    switch (code) {
      case "card_declined":
        return {
          title: "Card Declined",
          message: "Your card was declined. Please try a different payment method or contact your bank.",
          icon: <CreditCard className="h-5 w-5 text-red-500" />
        };
      case "insufficient_funds":
        return {
          title: "Insufficient Funds",
          message: "Your card doesn't have enough funds for this purchase. Please try a different card.",
          icon: <CreditCard className="h-5 w-5 text-red-500" />
        };
      case "expired_card":
        return {
          title: "Card Expired",
          message: "Your card has expired. Please update your payment information with a valid card.",
          icon: <CreditCard className="h-5 w-5 text-red-500" />
        };
      case "incorrect_cvc":
        return {
          title: "Invalid Security Code",
          message: "The security code (CVC) you entered is incorrect. Please check and try again.",
          icon: <CreditCard className="h-5 w-5 text-red-500" />
        };
      case "processing_error":
        return {
          title: "Processing Error",
          message: "There was a temporary issue processing your payment. Please try again in a moment.",
          icon: <AlertTriangle className="h-5 w-5 text-orange-500" />
        };
      default:
        return {
          title: "Payment Failed",
          message: error,
          icon: <XCircle className="h-5 w-5 text-red-500" />
        };
    }
  };

  const errorInfo = getErrorMessage(errorCode);

  const commonSolutions = [
    "Check that your card information is entered correctly",
    "Ensure your card has sufficient funds",
    "Verify that your card is not expired",
    "Try using a different payment method",
    "Contact your bank if the issue persists"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {errorInfo.icon}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {errorInfo.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription className="text-center">
              {errorInfo.message}
            </AlertDescription>
          </Alert>

          {/* Quick Solutions */}
          <div className="space-y-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                Common Solutions
              </span>
              <span className="text-xs">
                {showDetails ? "Hide" : "Show"}
              </span>
            </button>
            
            {showDetails && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <ul className="text-sm text-gray-700 space-y-1">
                  {commonSolutions.map((solution, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onRetry && (
              <Button 
                onClick={onRetry}
                disabled={isRetrying}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            )}
            
            {onGoBack && (
              <Button 
                variant="outline" 
                onClick={onGoBack}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>

          {/* Support Information */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Still having trouble?
            </p>
            <div className="space-y-1">
              <Button 
                variant="link" 
                className="h-auto p-0 text-sm"
                onClick={() => {
                  console.log('Contact Support clicked');
                  window.open('mailto:dxmylesx22@gmail.com?subject=ChefGrocer Payment Issue&body=I encountered a payment error. Please help me resolve this issue.', '_blank');
                }}
              >
                Contact Support
              </Button>
              <p className="text-xs text-gray-500">
                dxmylesx22@gmail.com • Available 24/7
              </p>
            </div>
          </div>

          {/* Error Details for Debugging */}
          {errorCode && (
            <div className="text-xs text-gray-400 bg-gray-50 rounded p-2 text-center">
              Error Code: {errorCode}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}