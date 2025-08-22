import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Globe, 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Users,
  ChefHat,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface ScrapedRecipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  imageUrl?: string;
  sourceUrl: string;
  sourceSite: string;
}

interface ScrapeResult {
  success: boolean;
  recipe?: any;
  preview?: ScrapedRecipe;
  sourceUrl: string;
  sourceSite: string;
  error?: string;
}

interface BatchScrapeResult {
  success: boolean;
  totalRequested: number;
  totalScraped: number;
  totalSaved: number;
  recipes: Array<{
    recipe: any;
    sourceUrl: string;
    sourceSite: string;
  }>;
}

export default function RecipeScraper() {
  const [singleUrl, setSingleUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [scrapedRecipes, setScrapedRecipes] = useState<ScrapedRecipe[]>([]);
  const [previewRecipe, setPreviewRecipe] = useState<ScrapedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { toast } = useToast();

  const supportedSites = [
    {
      name: "AllRecipes",
      domain: "allrecipes.com",
      description: "Popular recipe sharing site with user reviews",
      example: "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/"
    },
    {
      name: "Food Network", 
      domain: "foodnetwork.com",
      description: "Professional chef recipes and cooking shows",
      example: "https://www.foodnetwork.com/recipes/alton-brown/baked-macaroni-and-cheese-recipe-1939524"
    },
    {
      name: "Taste of Home",
      domain: "tasteofhome.com", 
      description: "Home cooking recipes and family favorites",
      example: "https://www.tasteofhome.com/recipes/chocolate-chip-cookies/"
    }
  ];

  const handleSingleScrape = async () => {
    if (!singleUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a recipe URL to scrape",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest('POST', '/api/scrape/recipe', {
        url: singleUrl.trim()
      }) as ScrapeResult;

      if (result.success && result.recipe) {
        toast({
          title: "Recipe Scraped Successfully!",
          description: `Added "${result.recipe.name}" from ${result.sourceSite}`,
        });
        setSingleUrl('');
        // Refresh recipes or navigate to recipes page
        window.location.href = '/recipes';
      } else {
        throw new Error(result.error || 'Failed to scrape recipe');
      }
    } catch (error: any) {
      toast({
        title: "Scraping Failed",
        description: error.message || "Could not extract recipe from this URL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!singleUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a recipe URL to preview",
        variant: "destructive"
      });
      return;
    }

    setPreviewLoading(true);
    try {
      const result = await apiRequest('POST', '/api/scrape/recipe/preview', {
        url: singleUrl.trim()
      }) as { success: boolean; preview: ScrapedRecipe; error?: string };

      if (result.success && result.preview) {
        setPreviewRecipe(result.preview);
        toast({
          title: "Recipe Preview Generated",
          description: `Preview for "${result.preview.name}" is ready`,
        });
      } else {
        throw new Error(result.error || 'Failed to preview recipe');
      }
    } catch (error: any) {
      toast({
        title: "Preview Failed",
        description: error.message || "Could not extract recipe from this URL",
        variant: "destructive"
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleBatchScrape = async () => {
    const urls = batchUrls.split('\n').map(url => url.trim()).filter(url => url);
    
    if (urls.length === 0) {
      toast({
        title: "URLs Required",
        description: "Please enter recipe URLs (one per line) to scrape",
        variant: "destructive"
      });
      return;
    }

    if (urls.length > 10) {
      toast({
        title: "Too Many URLs",
        description: "Maximum 10 URLs allowed per batch",
        variant: "destructive"
      });
      return;
    }

    setBatchLoading(true);
    try {
      const result = await apiRequest('POST', '/api/scrape/recipes/batch', {
        urls,
        delay: 2000 // 2 second delay between requests
      }) as BatchScrapeResult;

      if (result.success) {
        toast({
          title: "Batch Scraping Complete!",
          description: `Successfully scraped ${result.totalSaved}/${result.totalRequested} recipes`,
        });
        setBatchUrls('');
        // Refresh recipes or navigate to recipes page
        window.location.href = '/recipes';
      } else {
        throw new Error('Batch scraping failed');
      }
    } catch (error: any) {
      toast({
        title: "Batch Scraping Failed",
        description: error.message || "Failed to scrape recipes",
        variant: "destructive"
      });
    } finally {
      setBatchLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
          <Globe className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipe Scraper</h1>
          <p className="text-gray-600">Extract recipes from your favorite cooking websites</p>
        </div>
      </div>

      {/* Supported Sites */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Supported Recipe Sites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportedSites.map((site, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-orange-500" />
                  <h3 className="font-medium">{site.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{site.description}</p>
                <p className="text-xs text-orange-600 font-mono">{site.domain}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Works with most recipe sites that use structured data (JSON-LD) or common HTML patterns.
              The scraper automatically detects ingredients, instructions, cooking time, and servings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Single Recipe Scraper */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-orange-500" />
            Scrape Single Recipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter recipe URL (e.g., https://www.allrecipes.com/recipe/...)"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handlePreview}
              variant="outline"
              disabled={previewLoading}
              className="px-4"
            >
              {previewLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
            <Button 
              onClick={handleSingleScrape}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Scrape & Save
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Recipe */}
      {previewRecipe && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              Recipe Preview - {previewRecipe.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {previewRecipe.imageUrl && (
                  <img 
                    src={previewRecipe.imageUrl} 
                    alt={previewRecipe.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {previewRecipe.cookingTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {previewRecipe.servings} servings
                  </div>
                  <Badge className={getDifficultyColor(previewRecipe.difficulty)}>
                    {previewRecipe.difficulty}
                  </Badge>
                </div>
                <p className="text-gray-700 mb-4">{previewRecipe.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ExternalLink className="w-4 h-4" />
                  Source: {previewRecipe.sourceSite}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Ingredients ({previewRecipe.ingredients.length})</h4>
                  <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                    {previewRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Instructions ({previewRecipe.instructions.length} steps)</h4>
                  <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                    {previewRecipe.instructions.slice(0, 3).map((step, index) => (
                      <p key={index} className="text-gray-600">
                        {index + 1}. {step.substring(0, 100)}...
                      </p>
                    ))}
                    {previewRecipe.instructions.length > 3 && (
                      <p className="text-gray-500 italic">
                        +{previewRecipe.instructions.length - 3} more steps...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={handleSingleScrape}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save This Recipe
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setPreviewRecipe(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Recipe Scraper */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" />
            Batch Scrape Multiple Recipes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={`Enter multiple recipe URLs (one per line):
https://www.allrecipes.com/recipe/example1/
https://www.foodnetwork.com/recipes/example2/
https://www.tasteofhome.com/recipes/example3/`}
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Maximum 10 URLs per batch • 2-second delay between requests
            </p>
            <Button 
              onClick={handleBatchScrape}
              disabled={batchLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {batchLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scraping Batch...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Scrape All Recipes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            Tips for Best Results
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              Use recipe URLs from supported sites for best accuracy
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              Preview recipes before saving to verify extraction quality
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              Batch scraping includes automatic rate limiting to respect websites
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
              Scraped recipes automatically include nutrition estimates and difficulty ratings
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}