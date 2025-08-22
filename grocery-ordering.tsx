import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Truck, 
  Clock, 
  DollarSign,
  MapPin,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface GroceryItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  brand?: string;
  size?: string;
  unit?: string;
}

interface CartItem extends GroceryItem {
  quantity: number;
  notes?: string;
}

interface Store {
  id: string;
  name: string;
  logo?: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDelivery: string;
}

export function GroceryOrdering() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [userZipCode, setUserZipCode] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [orderStatus, setOrderStatus] = useState<'idle' | 'ordering' | 'completed' | 'error'>('idle');
  const { toast } = useToast();

  // Search grocery items
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/grocery/search', searchQuery],
    queryFn: () => apiRequest('GET', `/api/grocery/search?q=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.length > 2,
  });

  // Get available stores
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['/api/grocery/stores', userZipCode],
    queryFn: () => apiRequest('GET', `/api/grocery/stores?zipCode=${userZipCode}`),
    enabled: userZipCode.length === 5,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest('POST', '/api/grocery/order', orderData);
    },
    onSuccess: (response: any) => {
      setOrderStatus('completed');
      setCart([]);
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${response.orderId} - Estimated delivery: ${response.estimatedDelivery}`,
      });
    },
    onError: (error: any) => {
      setOrderStatus('error');
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place grocery order",
        variant: "destructive",
      });
    },
  });

  // Load saved address
  useEffect(() => {
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      const address = JSON.parse(savedAddress);
      setDeliveryAddress(address);
      setUserZipCode(address.zipCode);
    }
  }, []);

  const addToCart = (item: GroceryItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    toast({
      title: "Added to Cart",
      description: `${item.name} added to your grocery cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const item = prev.find(cartItem => cartItem.id === itemId);
      if (item && item.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getOrderTotal = () => {
    const subtotal = getCartTotal();
    const deliveryFee = selectedStore?.deliveryFee || 0;
    const tax = subtotal * 0.08; // 8% tax
    return subtotal + deliveryFee + tax;
  };

  const saveDeliveryAddress = () => {
    localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
    setUserZipCode(deliveryAddress.zipCode);
    toast({
      title: "Address Saved",
      description: "Your delivery address has been saved",
    });
  };

  const createOrderFromRecipe = async (recipeId: string) => {
    try {
      const response = await apiRequest('POST', `/api/grocery/recipe-to-cart`, { recipeId });
      const recipeItems = response.items || [];
      
      // Add recipe items to cart
      setCart(prev => {
        const newCart = [...prev];
        recipeItems.forEach((item: GroceryItem) => {
          const existing = newCart.find(cartItem => cartItem.id === item.id);
          if (existing) {
            existing.quantity += 1;
          } else {
            newCart.push({ ...item, quantity: 1 });
          }
        });
        return newCart;
      });

      toast({
        title: "Recipe Added to Cart",
        description: `${recipeItems.length} ingredients added to your grocery cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add recipe ingredients to cart",
        variant: "destructive",
      });
    }
  };

  const placeOrder = async () => {
    if (!selectedStore) {
      toast({
        title: "Select Store",
        description: "Please select a store for delivery",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart",
        variant: "destructive",
      });
      return;
    }

    const orderTotal = getOrderTotal();
    if (orderTotal < selectedStore.minimumOrder) {
      toast({
        title: "Minimum Order Not Met",
        description: `Minimum order for ${selectedStore.name} is $${selectedStore.minimumOrder}`,
        variant: "destructive",
      });
      return;
    }

    setOrderStatus('ordering');

    const orderData = {
      items: cart.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
      storeId: selectedStore.id,
      deliveryAddress,
      specialInstructions: '',
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange-600 mb-2">Grocery Ordering</h2>
        <p className="text-gray-600">Order ingredients directly from your recipes</p>
      </div>

      {/* Delivery Address Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Street Address"
              value={deliveryAddress.street}
              onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
            />
            <Input
              placeholder="City"
              value={deliveryAddress.city}
              onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
            />
            <Input
              placeholder="State"
              value={deliveryAddress.state}
              onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
            />
            <Input
              placeholder="ZIP Code"
              value={deliveryAddress.zipCode}
              onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
            />
          </div>
          <Button onClick={saveDeliveryAddress} className="w-full">
            Save Address & Find Stores
          </Button>
        </CardContent>
      </Card>

      {/* Store Selection */}
      {userZipCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Available Stores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storesLoading ? (
              <div className="text-center py-4">Finding stores in your area...</div>
            ) : stores.length > 0 ? (
              <div className="grid gap-3">
                {stores.map((store: Store) => (
                  <div
                    key={store.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedStore?.id === store.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => setSelectedStore(store)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{store.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${store.deliveryFee} delivery
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {store.estimatedDelivery}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum order: ${store.minimumOrder}
                        </p>
                      </div>
                      {selectedStore?.id === store.id && (
                        <CheckCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No stores available in your area
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Item Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Groceries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search for ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {searchLoading && (
            <div className="text-center py-4">Searching items...</div>
          )}

          {searchResults.length > 0 && (
            <div className="grid gap-3">
              {searchResults.map((item: GroceryItem) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      {item.brand && (
                        <p className="text-sm text-gray-600">{item.brand}</p>
                      )}
                      <p className="text-sm font-medium text-orange-600">
                        ${item.price.toFixed(2)}
                        {item.unit && ` / ${item.unit}`}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => addToCart(item)} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shopping Cart */}
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cart.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              {selectedStore && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>${selectedStore.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${(getCartTotal() * 0.08).toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${getOrderTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={placeOrder}
              disabled={!selectedStore || orderStatus === 'ordering'}
              className="w-full mt-4"
              size="lg"
            >
              {orderStatus === 'ordering' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Place Order - ${getOrderTotal().toFixed(2)}
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Status */}
      {orderStatus === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">Order Placed Successfully!</h3>
              <p className="text-sm text-green-600">
                You'll receive updates about your delivery via notifications
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {orderStatus === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Order Failed</h3>
              <p className="text-sm text-red-600">
                There was an issue placing your order. Please try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GroceryOrdering;