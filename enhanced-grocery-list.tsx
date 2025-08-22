import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GroceryItem } from "@shared/schema";
import { 
  ShoppingCart, 
  DollarSign, 
  MapPin, 
  Tag, 
  TrendingDown, 
  Zap,
  ExternalLink,
  Calculator,
  Lightbulb,
  Navigation
} from "lucide-react";
import { StoreLocator } from "./store-locator";

export function EnhancedGroceryList() {
  const [budget, setBudget] = useState<number>(100);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newItemCategory, setNewItemCategory] = useState("General");
  const [showStoreLocator, setShowStoreLocator] = useState(false);
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const [multipleItems, setMultipleItems] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: groceryItems = [], isLoading } = useQuery<GroceryItem[]>({
    queryKey: ['/api/grocery-items']
  });

  const { data: shoppingTips = [] } = useQuery({
    queryKey: ['/api/shopping-tips'],
    queryFn: () => fetch('/api/shopping-tips').then(res => res.json())
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/grocery-items/${id}`, { completed });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
    }
  });

  const priceComparisonMutation = useMutation({
    mutationFn: async (items: string[]) => {
      const response = await apiRequest("POST", "/api/ai/price-comparison", { items });
      return await response.json();
    }
  });

  const aiShoppingTipsMutation = useMutation({
    mutationFn: async ({ groceryList, budget }: { groceryList: string[]; budget: number }) => {
      const response = await apiRequest("POST", "/api/ai/shopping-tips", { groceryList, budget });
      return await response.json();
    }
  });

  const addNewItemMutation = useMutation({
    mutationFn: async (newItem: {
      name: string;
      quantity: number;
      category: string;
      estimatedPrice?: number;
      completed: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/grocery-items", newItem);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
      setNewItemName("");
    }
  });

  const handleItemToggle = (id: string, completed: boolean) => {
    updateItemMutation.mutate({ id, completed });
  };

  const handlePriceComparison = () => {
    const itemNames = groceryItems.map(item => item.name);
    priceComparisonMutation.mutate(itemNames);
  };

  const handleGenerateTips = () => {
    const itemNames = groceryItems.map(item => item.name);
    aiShoppingTipsMutation.mutate({ groceryList: itemNames, budget });
  };

  // Helper function to get appropriate food image
  const getFoodImageUrl = (itemName: string): string => {
    const lowerName = itemName.toLowerCase();
    
    // High-quality food images from Unsplash
    const foodImageMap: { [key: string]: string } = {
      // Fruits
      'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop&auto=format',
      'banana': 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=150&h=150&fit=crop&auto=format',
      'orange': 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=150&h=150&fit=crop&auto=format',
      'strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=150&h=150&fit=crop&auto=format',
      'grape': 'https://images.unsplash.com/photo-1537640538966-79f369143019?w=150&h=150&fit=crop&auto=format',
      'lemon': 'https://images.unsplash.com/photo-1590502593747-42a4501a2ba1?w=150&h=150&fit=crop&auto=format',
      
      // Vegetables
      'carrot': 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=150&h=150&fit=crop&auto=format',
      'broccoli': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=150&h=150&fit=crop&auto=format',
      'tomato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150&h=150&fit=crop&auto=format',
      'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150&h=150&fit=crop&auto=format',
      'onion': 'https://images.unsplash.com/photo-1508313880080-c4baa5b8dabd?w=150&h=150&fit=crop&auto=format',
      'lettuce': 'https://images.unsplash.com/photo-1556909114-4f880bff4795?w=150&h=150&fit=crop&auto=format',
      'bell pepper': 'https://images.unsplash.com/photo-1525607551316-4a8e16ce5ade?w=150&h=150&fit=crop&auto=format',
      'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&h=150&fit=crop&auto=format',
      'cucumber': 'https://images.unsplash.com/photo-1520645902307-3b5ac0ae0f6a?w=150&h=150&fit=crop&auto=format',
      
      // Proteins
      'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=150&h=150&fit=crop&auto=format',
      'beef': 'https://images.unsplash.com/photo-1588347818125-3c1cb6420b4c?w=150&h=150&fit=crop&auto=format',
      'fish': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=150&h=150&fit=crop&auto=format',
      'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=150&h=150&fit=crop&auto=format',
      'egg': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=150&h=150&fit=crop&auto=format',
      'turkey': 'https://images.unsplash.com/photo-1574781330855-d0db292d96d6?w=150&h=150&fit=crop&auto=format',
      'pork': 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=150&h=150&fit=crop&auto=format',
      
      // Dairy
      'milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop&auto=format',
      'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=150&h=150&fit=crop&auto=format',
      'yogurt': 'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=150&h=150&fit=crop&auto=format',
      'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=150&h=150&fit=crop&auto=format',
      'cream': 'https://images.unsplash.com/photo-1524482326475-6c71706c2e87?w=150&h=150&fit=crop&auto=format',
      
      // Grains & Pantry
      'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&h=150&fit=crop&auto=format',
      'rice': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=150&h=150&fit=crop&auto=format',
      'pasta': 'https://images.unsplash.com/photo-1551892589-865f69869476?w=150&h=150&fit=crop&auto=format',
      'flour': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&h=150&fit=crop&auto=format',
      'sugar': 'https://images.unsplash.com/photo-1587431164373-8d2e943aee13?w=150&h=150&fit=crop&auto=format',
      'oats': 'https://images.unsplash.com/photo-1544997150-6f38b1eb4f11?w=150&h=150&fit=crop&auto=format',
      
      // Pantry staples
      'olive oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&h=150&fit=crop&auto=format',
      'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&h=150&fit=crop&auto=format',
      'salt': 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=150&h=150&fit=crop&auto=format',
      'black pepper': 'https://images.unsplash.com/photo-1599991991644-47e0cdd91e14?w=150&h=150&fit=crop&auto=format',
      'garlic': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&auto=format',
      
      // Beverages
      'water': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150&h=150&fit=crop&auto=format',
      'coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150&h=150&fit=crop&auto=format',
      'tea': 'https://images.unsplash.com/photo-1597318985515-91a3f24ff6f7?w=150&h=150&fit=crop&auto=format',
      'juice': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop&auto=format',
      
      // Default fallback for unmatched items
      'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop&auto=format'
    };
    
    // Find matching food item or use default
    for (const [key, url] of Object.entries(foodImageMap)) {
      if (lowerName.includes(key)) {
        return url;
      }
    }
    
    return foodImageMap.default;
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim()) return;
    
    addNewItemMutation.mutate({
      name: newItemName.trim(),
      quantity: newItemQuantity,
      category: newItemCategory,
      estimatedPrice: Math.round((Math.random() * 10 + 1) * 100) / 100, // Random price estimate
      completed: false
    });
  };

  // Handle typing in the input field (auto-save functionality)
  const handleQuickAdd = (inputValue: string) => {
    if (inputValue.trim() && inputValue.endsWith('\n')) {
      const itemName = inputValue.trim().replace('\n', '');
      addNewItemMutation.mutate({
        name: itemName,
        quantity: 1,
        category: "General",
        estimatedPrice: Math.round((Math.random() * 10 + 1) * 100) / 100,
        completed: false
      });
      setNewItemName("");
    }
  };

  // Handle multiple items input
  const handleMultipleItemsAdd = () => {
    if (!multipleItems.trim()) return;
    
    const items = multipleItems.split('\n').filter(item => item.trim());
    
    items.forEach(item => {
      const trimmedItem = item.trim();
      if (trimmedItem) {
        addNewItemMutation.mutate({
          name: trimmedItem,
          quantity: 1,
          category: "General", 
          estimatedPrice: Math.round((Math.random() * 10 + 1) * 100) / 100,
          completed: false
        });
      }
    });
    
    setMultipleItems("");
    setIsAddingMultiple(false);
  };

  const handleAddMultipleItems = () => {
    if (!multipleItems.trim()) return;
    
    // Split items by comma or new line and clean them up
    const items = multipleItems
      .split(/[,\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Add each item
    items.forEach(itemName => {
      addNewItemMutation.mutate({
        name: itemName,
        quantity: 1,
        category: "General",
        estimatedPrice: 0,
        completed: false
      });
    });
    
    // Reset form
    setMultipleItems("");
    setIsAddingMultiple(false);
  };

  const calculateTotalEstimated = () => {
    return groceryItems.reduce((total, item) => {
      if (item.estimatedPrice) {
        const price = parseFloat(item.estimatedPrice.replace('$', ''));
        return total + price;
      }
      return total;
    }, 0).toFixed(2);
  };

  const totalSavings = groceryItems.reduce((total, item) => {
    if (item.saleSavings) {
      const savings = parseFloat(item.saleSavings.replace(/[^0-9.]/g, ''));
      return total + (savings || 0);
    }
    return total;
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Grocery List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              <span>Smart Grocery List</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700">
                {groceryItems.filter(item => !item.completed).length} items
              </Badge>
              <Badge className="bg-blue-100 text-blue-700">
                Est. ${calculateTotalEstimated()}
              </Badge>
              {totalSavings > 0 && (
                <Badge className="bg-orange-100 text-orange-700">
                  Save ${totalSavings.toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {groceryItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your grocery list is empty</h3>
              <p className="text-gray-500 mb-4">Add items to start building your shopping list</p>
              <div className="flex space-x-2 max-w-md mx-auto">
                <Input
                  placeholder="Add your first item..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewItem()}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddNewItem}
                  disabled={addNewItemMutation.isPending || !newItemName.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Store Locator Toggle */}
              {/* Quick Add Section */}
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Add Items</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={!isAddingMultiple ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsAddingMultiple(false)}
                      className="text-xs"
                    >
                      Single Item
                    </Button>
                    <Button
                      variant={isAddingMultiple ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsAddingMultiple(true)}
                      className="text-xs"
                    >
                      Multiple Items
                    </Button>
                  </div>
                </div>

                {isAddingMultiple ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Enter multiple items (one per line or separated by commas)&#10;Example:&#10;Apples&#10;Bread&#10;Milk"
                      value={multipleItems}
                      onChange={(e) => setMultipleItems(e.target.value)}
                      className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {multipleItems.split(/[,\n]/).filter(item => item.trim().length > 0).length} items to add
                      </span>
                      <Button
                        onClick={handleAddMultipleItems}
                        disabled={addNewItemMutation.isPending || !multipleItems.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add All Items
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      placeholder="Item name..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNewItem()}
                      className="md:col-span-2"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                      min="1"
                      className="w-full"
                    />
                    <Button
                      onClick={handleAddNewItem}
                      disabled={addNewItemMutation.isPending || !newItemName.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Store Locator Toggle */}
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={() => setShowStoreLocator(!showStoreLocator)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  {showStoreLocator ? 'Hide Stores' : 'Find Stores'}
                </Button>
              </div>

              {/* Store Locator Component */}
              {showStoreLocator && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <StoreLocator />
                </div>
              )}

              <div className="grid gap-4">
                {groceryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={item.completed || false}
                        onCheckedChange={(checked) => 
                          handleItemToggle(item.id, checked as boolean)
                        }
                        className="text-green-600"
                      />
                      
                      {/* Food Item Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={getFoodImageUrl(item.name)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to a generic food icon if image fails to load
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop&auto=format';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {item.name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {item.quantity}
                          </span>
                          {item.onSale && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              ON SALE
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          {item.estimatedPrice && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{item.estimatedPrice}</span>
                            </div>
                          )}
                          {item.bestStore && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.bestStore}</span>
                            </div>
                          )}
                          {item.couponCode && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3 h-3 text-orange-600" />
                              <span className="text-orange-600">{item.couponCode}</span>
                            </div>
                          )}
                        </div>
                        
                        {item.saleSavings && (
                          <div className="flex items-center space-x-1 mt-1">
                            <TrendingDown className="w-3 h-3 text-green-600" />
                            <span className="text-green-600 text-sm font-medium">
                              {item.saleSavings}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {item.storeLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => window.open(item.storeLink || '', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  onClick={handlePriceComparison}
                  disabled={priceComparisonMutation.isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Compare Prices
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Budget"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-24"
                  />
                  <Button
                    onClick={handleGenerateTips}
                    disabled={aiShoppingTipsMutation.isPending}
                    variant="outline"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Tips
                  </Button>
                </div>
              </div>


            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Comparison Results */}
      {priceComparisonMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Price Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priceComparisonMutation.data.map((comparison: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">{comparison.item}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    {comparison.stores.map((store: any, storeIndex: number) => (
                      <div key={storeIndex} className="bg-gray-50 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{store.name}</span>
                          <span className="text-green-600 font-bold">{store.price}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {store.distance && <div>📍 {store.distance}</div>}
                          {store.delivery && <div>🚚 Delivery available</div>}
                          {store.curbside && <div>🚗 Curbside pickup</div>}
                          {store.savings && <div className="text-orange-600">💰 {store.savings}</div>}
                          {store.coupon && <div className="text-blue-600">🎫 {store.coupon}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Best Deal:</span>
                      <span className="text-green-700">
                        {comparison.bestDeal.store} - {comparison.bestDeal.price}
                      </span>
                      <span className="text-green-600 text-sm">
                        ({comparison.bestDeal.savings})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Generated Shopping Tips */}
      {aiShoppingTipsMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Money-Saving Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {aiShoppingTipsMutation.data.map((tip: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{tip.title}</h4>
                    <div className="flex space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {tip.category}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {tip.estimatedSavings}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                  <div className="mt-2">
                    <Badge 
                      variant={tip.difficulty === 'easy' ? 'default' : tip.difficulty === 'medium' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {tip.difficulty} to implement
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Shopping Tips */}
      {shoppingTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-orange-500" />
              <span>General Shopping Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {shoppingTips.slice(0, 3).map((tip: any) => (
                <div key={tip.id} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-orange-900">{tip.title}</h5>
                    <p className="text-orange-700 text-sm mt-1">{tip.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-orange-100 text-orange-700 text-xs">
                        Save {tip.estimatedSavings}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tip.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}