import { Download, FileArchive, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DownloadPage() {
  const handleDownload = () => {
    // Create download link for the archive
    const link = document.createElement('a');
    link.href = '/ChefGrocer-Complete-Enhanced-v3.tar.gz';
    link.download = 'ChefGrocer-Complete-Enhanced-v3.tar.gz';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 dark:text-green-400 mb-4">
            ChefGrocer Complete Project
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your complete AI-powered cooking assistant with enhanced grocery list and real food images
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="h-6 w-6" />
              Complete Project Archive
            </CardTitle>
            <CardDescription>
              ChefGrocer-Complete-Enhanced-v3.tar.gz - Ready for deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-semibold">File Size: 2.2MB</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete project with all assets and dependencies
                </p>
              </div>
              <Button onClick={handleDownload} size="lg" className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Project
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Latest Enhancements
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary">Visual</Badge>
                    Real food images - eliminated all "?" placeholders
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary">Smart</Badge>
                    35+ high-quality food photos with auto-matching
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary">UX</Badge>
                    Enhanced grocery list with type-and-save
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="secondary">Performance</Badge>
                    Sub-1-second API response times
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Project Contents</h3>
                <ul className="space-y-2 text-sm">
                  <li>• React TypeScript frontend</li>
                  <li>• Express.js backend with AI integration</li>
                  <li>• PostgreSQL database schema</li>
                  <li>• Google Gemini AI integration</li>
                  <li>• Stripe payment processing</li>
                  <li>• iOS Capacitor configuration</li>
                  <li>• Complete documentation</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Quick Setup Instructions</h3>
              <ol className="text-sm space-y-1">
                <li>1. Extract: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">tar -xzf ChefGrocer-Complete-Enhanced-v2.tar.gz</code></li>
                <li>2. Install: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm install</code></li>
                <li>3. Configure environment variables</li>
                <li>4. Start: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm run dev</code></li>
              </ol>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Revenue-ready system targeting $2,500-$10,000/month scaling to $100K/month
              </p>
              <Button onClick={handleDownload} size="lg" className="flex items-center gap-2 mx-auto">
                <Download className="h-5 w-5" />
                Download ChefGrocer Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}