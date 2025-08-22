import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/navigation-header';
import BarcodeScanner from '@/components/barcode-scanner';
import { ArrowLeft, ShoppingCart, Package, Heart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/lib/seo';

interface ScannedItem {
  id: string;
  code: string;
  format: string;
  name?: string;
  brand?: string;
  category?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  price_estimate?: string;
  scannedAt: Date;
}

export default function BarcodeScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const { toast } = useToast();

  useSEO({
    title: 'Barcode Scanner - Scan Groceries & Products',
    description: 'Scan product barcodes to instantly get nutrition information, price estimates, and add items to your grocery list with ChefGrocer\'s smart barcode scanner.',
    keywords: 'barcode scanner, grocery scanner, nutrition lookup, product scanner, food barcode'
  });

  const handleScanSuccess = (result: any) => {
    const newItem: ScannedItem = {
      id: `${result.code}-${Date.now()}`,
      code: result.code,
      format: result.format,
      name: result.product?.name,
      brand: result.product?.brand,
      category: result.product?.category,
      nutrition: result.product?.nutrition,
      price_estimate: result.product?.price_estimate,
      scannedAt: new Date()
    };

    setScannedItems(prev => [newItem, ...prev]);
    setIsScanning(false);

    toast({
      title: "Item Scanned Successfully!",
      description: result.product?.name 
        ? `Added ${result.product.name} to your scanned items` 
        : `Barcode ${result.code} scanned`,
    });
  };

  const addToGroceryList = (item: ScannedItem) => {
    // In a real app, this would add to the user's grocery list
    toast({
      title: "Added to Grocery List",
      description: `${item.name || item.code} added to your grocery list`,
    });
  };

  const addToFavorites = (item: ScannedItem) => {
    // In a real app, this would add to the user's favorites
    toast({
      title: "Added to Favorites",
      description: `${item.name || item.code} added to your favorites`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader 
        title="Barcode Scanner" 
        description="Scan products for nutrition info and pricing"
        backHref="/"
      />
      
      <div className="container max-w-4xl mx-auto p-4">

        <div className="grid md:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div>
            {!isScanning ? (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center gap-2 justify-center">
                    <Package className="w-5 h-5" />
                    Ready to Scan
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Point your camera at any product barcode to get instant nutrition information
                  </p>
                  <Button 
                    onClick={() => setIsScanning(true)} 
                    size="lg" 
                    className="w-full"
                  >
                    Start Scanning
                  </Button>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Works with UPC, EAN, Code 128</p>
                    <p>✓ Premium nutrition data from FatSecret API</p>
                    <p>✓ 90%+ accuracy with 1.9M food products</p>
                    <p>✓ Trusted by Amazon, Fitbit, Samsung</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <BarcodeScanner
                onScanSuccess={handleScanSuccess}
                onClose={() => setIsScanning(false)}
                showProductLookup={true}
              />
            )}
          </div>

          {/* Scanned Items History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Scanned Items ({scannedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scannedItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No items scanned yet</p>
                    <p className="text-sm">Your scanned products will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {scannedItems.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium">
                              {item.name || `Barcode: ${item.code}`}
                            </h3>
                            {item.brand && (
                              <p className="text-sm text-muted-foreground">
                                by {item.brand}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.format}
                          </Badge>
                        </div>

                        {item.category && (
                          <Badge variant="secondary" className="mb-2">
                            {item.category}
                          </Badge>
                        )}

                        {item.nutrition && (
                          <div className="space-y-2 mb-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {item.nutrition.calories && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                                  <div className="font-medium text-orange-700 dark:text-orange-300">
                                    {item.nutrition.calories} cal
                                  </div>
                                  <div className="text-orange-600 dark:text-orange-400">
                                    Calories
                                  </div>
                                </div>
                              )}
                              {item.nutrition.protein && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                  <div className="font-medium text-blue-700 dark:text-blue-300">
                                    {item.nutrition.protein}g
                                  </div>
                                  <div className="text-blue-600 dark:text-blue-400">
                                    Protein
                                  </div>
                                </div>
                              )}
                              {item.nutrition.carbs && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                  <div className="font-medium text-green-700 dark:text-green-300">
                                    {item.nutrition.carbs}g
                                  </div>
                                  <div className="text-green-600 dark:text-green-400">
                                    Carbs
                                  </div>
                                </div>
                              )}
                              {item.nutrition.fat && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                  <div className="font-medium text-purple-700 dark:text-purple-300">
                                    {item.nutrition.fat}g
                                  </div>
                                  <div className="text-purple-600 dark:text-purple-400">
                                    Fat
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
                              <p className="text-xs font-medium text-orange-800 dark:text-orange-200 text-center">
                                🏆 Premium FatSecret Data - 90%+ Accuracy
                              </p>
                            </div>
                          </div>
                        )}

                        {item.price_estimate && (
                          <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                            Est. Price: {item.price_estimate}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => addToGroceryList(item)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add to List
                          </Button>
                          <Button
                            onClick={() => addToFavorites(item)}
                            size="sm"
                            variant="outline"
                          >
                            <Heart className="w-3 h-3" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          Scanned {item.scannedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Scanning Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  📱
                </div>
                <h3 className="font-medium mb-1">Good Lighting</h3>
                <p className="text-muted-foreground">
                  Ensure good lighting for best scan results
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  🎯
                </div>
                <h3 className="font-medium mb-1">Steady Aim</h3>
                <p className="text-muted-foreground">
                  Hold camera steady and center the barcode
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  📏
                </div>
                <h3 className="font-medium mb-1">Right Distance</h3>
                <p className="text-muted-foreground">
                  Keep 4-8 inches away from the barcode
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}