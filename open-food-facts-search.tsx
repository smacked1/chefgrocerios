import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search, Scan, Star, Leaf, AlertTriangle, CheckCircle, Clock, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface NormalizedProduct {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  ingredients?: string;
  allergens?: string[];
  nutritionGrade?: string;
  novaGroup?: number;
  ecoScore?: string;
  nutrition: {
    calories?: number;
    fat?: number;
    saturatedFat?: number;
    carbs?: number;
    sugars?: number;
    fiber?: number;
    protein?: number;
    salt?: number;
    sodium?: number;
    calcium?: number;
    iron?: number;
    vitaminC?: number;
  };
  images?: {
    front?: string;
    nutrition?: string;
    ingredients?: string;
  };
  servingSize?: string;
  packaging?: string;
  stores?: string[];
  origins?: string;
  completeness?: number;
  lastModified?: string;
}

interface SearchResult {
  count: number;
  page: number;
  pageCount: number;
  products: NormalizedProduct[];
}

interface ProductDetails {
  product: NormalizedProduct;
  nutritionInfo: { description: string; color: string };
  novaInfo: { description: string; recommendation: string };
  alternatives: NormalizedProduct[];
}

export function OpenFoodFactsSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { toast } = useToast();

  // Search products by text
  const { data: searchResults, isLoading: searchLoading, refetch: searchProducts } = useQuery({
    queryKey: ['/api/food-facts/search', searchQuery],
    enabled: false,
    queryFn: () => apiRequest('GET', `/api/food-facts/search?q=${encodeURIComponent(searchQuery)}&page=1&page_size=10`)
  });

  // Get product details by barcode
  const { data: productDetails, isLoading: productLoading } = useQuery({
    queryKey: ['/api/food-facts/barcode', selectedProduct],
    enabled: !!selectedProduct,
    queryFn: () => apiRequest('GET', `/api/food-facts/barcode/${selectedProduct}`)
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchProducts();
    }
  };

  const handleBarcodeSearch = () => {
    if (barcodeQuery.trim() && /^\d{8,14}$/.test(barcodeQuery)) {
      setSelectedProduct(barcodeQuery);
      setBarcodeQuery('');
    } else {
      toast({
        title: "Invalid Barcode",
        description: "Please enter a valid 8-14 digit barcode",
        variant: "destructive"
      });
    }
  };

  const getNutritionGradeColor = (grade?: string) => {
    switch (grade?.toUpperCase()) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-lime-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'E': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getNovaGroupColor = (group?: number) => {
    switch (group) {
      case 1: return 'text-green-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-orange-600';
      case 4: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Open Food Facts Database
            <Badge className="bg-blue-100 text-blue-800">2M+ Products</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Search products (e.g., 'coca cola', 'organic milk')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searchLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Barcode Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode (8-14 digits)"
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value.replace(/\D/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
            />
            <Button onClick={handleBarcodeSearch}>
              <Scan className="w-4 h-4 mr-2" />
              Lookup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle>Search Results ({(searchResults as SearchResult).count} found)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(searchResults as SearchResult).products.map((product) => (
                <Card 
                  key={product.barcode} 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                  onClick={() => setSelectedProduct(product.barcode)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {product.images?.front && (
                        <img 
                          src={product.images.front} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        {product.brand && (
                          <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                        )}
                        
                        <div className="flex items-center gap-2 mb-2">
                          {product.nutritionGrade && (
                            <Badge className={`text-white text-xs ${getNutritionGradeColor(product.nutritionGrade)}`}>
                              Nutri-Score {product.nutritionGrade}
                            </Badge>
                          )}
                          {product.novaGroup && (
                            <span className={`text-xs font-medium ${getNovaGroupColor(product.novaGroup)}`}>
                              NOVA {product.novaGroup}
                            </span>
                          )}
                        </div>

                        {product.nutrition.calories && (
                          <p className="text-xs text-gray-700">
                            {product.nutrition.calories} kcal/100g
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Details */}
      {productDetails && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const details = productDetails as ProductDetails;
              const product = details.product;

              return (
                <>
                  {/* Basic Info */}
                  <div className="flex items-start gap-4">
                    {product.images?.front && (
                      <img 
                        src={product.images.front} 
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                      {product.brand && (
                        <p className="text-gray-600 mb-2">Brand: {product.brand}</p>
                      )}
                      {product.category && (
                        <p className="text-gray-600 mb-2">Category: {product.category}</p>
                      )}
                      <p className="text-sm text-gray-500">Barcode: {product.barcode}</p>
                    </div>
                  </div>

                  {/* Nutrition & Quality Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-gray-200">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full ${getNutritionGradeColor(product.nutritionGrade)} text-white text-xl font-bold flex items-center justify-center mx-auto mb-2`}>
                          {product.nutritionGrade || '?'}
                        </div>
                        <h3 className="font-semibold text-sm">Nutri-Score</h3>
                        <p className="text-xs text-gray-600">{details.nutritionInfo.description}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full border-4 ${getNovaGroupColor(product.novaGroup).replace('text-', 'border-')} flex items-center justify-center mx-auto mb-2`}>
                          <span className={`text-xl font-bold ${getNovaGroupColor(product.novaGroup)}`}>
                            {product.novaGroup || '?'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm">NOVA Group</h3>
                        <p className="text-xs text-gray-600">{details.novaInfo.description}</p>
                      </CardContent>
                    </Card>

                    {product.ecoScore && (
                      <Card className="border-gray-200">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-green-500 text-white text-xl font-bold flex items-center justify-center mx-auto mb-2">
                            {product.ecoScore}
                          </div>
                          <h3 className="font-semibold text-sm">Eco-Score</h3>
                          <p className="text-xs text-gray-600">Environmental impact</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Nutrition Facts */}
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Nutrition Facts (per 100g)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(product.nutrition).map(([key, value]) => {
                          if (value === undefined || value === null) return null;
                          
                          const labels: Record<string, string> = {
                            calories: 'Calories',
                            fat: 'Fat (g)',
                            saturatedFat: 'Saturated Fat (g)',
                            carbs: 'Carbs (g)',
                            sugars: 'Sugars (g)',
                            fiber: 'Fiber (g)',
                            protein: 'Protein (g)',
                            salt: 'Salt (g)',
                            sodium: 'Sodium (mg)',
                            calcium: 'Calcium (mg)',
                            iron: 'Iron (mg)',
                            vitaminC: 'Vitamin C (mg)'
                          };

                          return (
                            <div key={key} className="text-center">
                              <div className="text-lg font-bold text-gray-900">{value}</div>
                              <div className="text-xs text-gray-600">{labels[key]}</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Allergens */}
                  {product.allergens && product.allergens.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-5 h-5" />
                          Allergens
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {product.allergens.map((allergen, index) => (
                            <Badge key={index} variant="destructive">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Ingredients */}
                  {product.ingredients && (
                    <Card className="border-gray-200">
                      <CardHeader>
                        <CardTitle>Ingredients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{product.ingredients}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Healthier Alternatives */}
                  {details.alternatives.length > 0 && (
                    <Card className="border-green-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          Healthier Alternatives
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {details.alternatives.map((alt) => (
                            <Card 
                              key={alt.barcode} 
                              className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500"
                              onClick={() => setSelectedProduct(alt.barcode)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                  {alt.images?.front && (
                                    <img 
                                      src={alt.images.front} 
                                      alt={alt.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{alt.name}</h4>
                                    <p className="text-xs text-gray-600">{alt.brand}</p>
                                    {alt.nutritionGrade && (
                                      <Badge className={`text-white text-xs mt-1 ${getNutritionGradeColor(alt.nutritionGrade)}`}>
                                        {alt.nutritionGrade}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}