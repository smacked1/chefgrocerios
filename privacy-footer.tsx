import { Link } from "wouter";
import { Shield, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function PrivacyFooter() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Privacy & Security */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Privacy & Security</h3>
            </div>
            <div className="space-y-2">
              <Link href="/privacy-policy">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start p-0 h-auto"
                  onClick={() => {
                    console.log('Privacy Policy footer clicked');
                    window.location.href = '/privacy-policy';
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your data is encrypted and never sold to third parties.
              </p>
            </div>
          </div>

          {/* Data Rights */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Data Rights</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Access your data anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Delete your account instantly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Export your recipes & data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Control voice data processing</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Privacy Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4" />
                <span>privacy@chefgrocer.app</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Response within 30 days
              </p>
              <div className="mt-3">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  GDPR & CCPA Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            © 2025 ChefGrocer. All rights reserved.
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <Link href="/privacy-policy" className="hover:text-orange-600 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <span>Secured by Stripe</span>
            <span>•</span>
            <span>AI by Google Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
}