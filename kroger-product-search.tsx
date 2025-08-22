import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  DollarSign, 
  MapPin, 
  Package,
  Star,
  AlertCircle
} from "lucide-react";

interface KrogerProduct {
  productId: string;
  upc: string;
  brand: string;
  description: string;
  size: string;
  images: Array<{
    url: string;
    perspective: string;
  }>;
  categories: string[];
  pricing: {
    regular: number;
    promo?: number;
    loyalty?: number;
    currency: string;
  } | null;
  store: {
    name: string;
    address: string;
    distance: string | null;
  } | null;
}

export function KrogerProductSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KrogerProduct[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const productSearchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/kroger/products/search", { 
        query,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.products || []);
    },
    onError: (error) => {
      console.error('Kroger search error:', error);
    }
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      productSearchMutation.mutate(searchQuery);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span>Kroger Product Search</span>
            <Badge className="bg-blue-100 text-blue-700">Real-Time Pricing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for products (e.g., milk, bread, apples)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={productSearchMutation.isPending || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {productSearchMutation.isPending ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {!userLocation && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Enable location for store-specific pricing
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Use Location
                </Button>
              </div>
            )}
            
            {userLocation && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <MapPin className="w-4 h-4" />
                <span>Location enabled - showing store prices</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results ({searchResults.length} products found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {searchResults.map((product) => (
                <div key={product.productId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.description}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">{product.description}</h4>
                          <p className="text-gray-600 text-sm">{product.brand}</p>
                          <p className="text-gray-500 text-xs">{product.size}</p>
                        </div>
                        
                        {/* Pricing */}
                        {product.pricing && (
                          <div className="text-right space-y-1">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-bold text-lg text-green-600">
                                {formatPrice(product.pricing.promo || product.pricing.regular)}
                              </span>
                            </div>
                            
                            {product.pricing.promo && product.pricing.promo < product.pricing.regular && (
                              <div className="space-y-1">
                                <span className="line-through text-sm text-gray-500">
                                  {formatPrice(product.pricing.regular)}
                                </span>
                                <Badge className="bg-red-100 text-red-700 text-xs">
                                  SALE
                                </Badge>
                              </div>
                            )}
                            
                            {product.pricing.loyalty && (
                              <div className="text-xs text-blue-600">
                                Plus Member: {formatPrice(product.pricing.loyalty)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Categories */}
                      {product.categories && product.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.categories.slice(0, 3).map((category, index) => (
                            <Badge key={index} className="bg-gray-100 text-gray-700 text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Store Information */}
                      {product.store && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{product.store.name}</span>
                          <span>•</span>
                          <span>{product.store.address}</span>
                        </div>
                      )}
                      
                      {/* UPC */}
                      <div className="text-xs text-gray-400">
                        UPC: {product.upc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* No Results */}
      {searchResults.length === 0 && productSearchMutation.isSuccess && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
            <p className="text-sm text-gray-400">Try searching for a different product</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}