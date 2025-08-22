import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DevLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", {});
      
      toast({
        title: "Login Successful",
        description: "Welcome to ChefGrocer!",
      });
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-600">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to ChefGrocer</CardTitle>
          <CardDescription>
            Your AI-powered cooking assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <strong>Development Mode:</strong> This is a simplified login for testing. 
              In production, you'll use your Replit account to sign in securely.
            </div>
            
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
            >
              {isLoading ? "Signing In..." : "Sign In as Test User"}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              <p>Test account includes:</p>
              <ul className="mt-2 space-y-1">
                <li>✓ Premium subscription</li>
                <li>✓ Voice commands</li>
                <li>✓ AI meal planning</li>
                <li>✓ Smart shopping features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}