import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Truck, 
  ExternalLink, 
  Clock, 
  DollarSign,
  MapPin,
  Star,
  ShoppingBag,
  Utensils,
  Coffee,
  Package
} from "lucide-react";

interface DeliveryService {
  id: string;
  name: string;
  type: string;
  websiteUrl: string;
  supportedAreas: string[];
  averageDeliveryTime: string;
  deliveryFee: string;
  minimumOrder: string;
  features: string[];
  isActive: boolean;
}

interface RestaurantMenuItem {
  id: string;
  restaurantName: string;
  itemName: string;
  description: string;
  category: string;
  price: string;
  calories?: number;
  allergens: string[];
  dietaryTags: string[];
  doordashUrl?: string;
  grubhubUrl?: string;
  ubereatsUrl?: string;
  isAvailable: boolean;
}

export function DeliveryServices() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: deliveryServices = [] } = useQuery<DeliveryService[]>({
    queryKey: ['/api/delivery-services', { area: searchLocation }]
  });

  const { data: menuItems = [] } = useQuery<RestaurantMenuItem[]>({
    queryKey: ['/api/restaurant-menu', { category: selectedCategory === 'all' ? '' : selectedCategory }]
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'food_delivery': return <Utensils className="w-5 h-5 text-orange-500" />;
      case 'grocery_delivery': return <ShoppingBag className="w-5 h-5 text-green-500" />;
      case 'restaurant_delivery': return <Coffee className="w-5 h-5 text-blue-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getServiceColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'doordash': return 'bg-red-100 text-red-700';
      case 'grubhub': return 'bg-orange-100 text-orange-700';
      case 'uber eats': return 'bg-green-100 text-green-700';
      case 'instacart': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const categories = [
    { value: "mains", label: "Main Dishes" },
    { value: "appetizers", label: "Appetizers" },
    { value: "desserts", label: "Desserts" },
    { value: "beverages", label: "Beverages" },
    { value: "salads", label: "Salads" },
    { value: "pizza", label: "Pizza" },
    { value: "asian", label: "Asian Cuisine" },
    { value: "mexican", label: "Mexican Food" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Delivery Services</h1>
        <p className="text-gray-600">Find restaurants and groceries available for delivery in your area</p>
      </div>

      {/* Location Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Find Services in Your Area</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter your location (e.g., 'New York, NY' or 'Los Angeles, CA')"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1"
            />
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                console.log('Searching delivery services in:', searchLocation);
                // Search functionality would be implemented here
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Delivery Services */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Delivery Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getServiceIcon(service.type)}
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge className={getServiceColor(service.name)}>
                        {service.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(service.websiteUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Service Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{service.averageDeliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>{service.deliveryFee}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Minimum Order: </span>
                    <span className="text-green-600">{service.minimumOrder}</span>
                  </div>

                  {/* Features */}
                  {service.features.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                        {service.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{service.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Supported Areas */}
                  {service.supportedAreas.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Service Areas:</div>
                      <div className="text-xs text-gray-600">
                        {service.supportedAreas.slice(0, 2).map(area => 
                          area.replace('_', ' ')
                        ).join(', ')}
                        {service.supportedAreas.length > 2 && ' and more'}
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full"
                    onClick={() => window.open(service.websiteUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Restaurant Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Popular Restaurant Items</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.itemName}</CardTitle>
                    <p className="text-sm text-gray-600 font-medium">{item.restaurantName}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{item.price}</div>
                    {item.calories && (
                      <div className="text-xs text-gray-500">{item.calories} cal</div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Category Badge */}
                  <Badge className="bg-blue-100 text-blue-700">
                    {item.category}
                  </Badge>

                  {/* Dietary Tags */}
                  {item.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.dietaryTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Allergens */}
                  {item.allergens.length > 0 && (
                    <div className="text-xs text-red-600">
                      <span className="font-medium">Contains: </span>
                      {item.allergens.join(', ')}
                    </div>
                  )}

                  {/* Delivery Links */}
                  <div className="flex flex-wrap gap-2">
                    {item.doordashUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.doordashUrl, '_blank')}
                        className="flex-1 text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        DoorDash
                      </Button>
                    )}
                    {item.grubhubUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.grubhubUrl, '_blank')}
                        className="flex-1 text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Grubhub
                      </Button>
                    )}
                    {item.ubereatsUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.ubereatsUrl, '_blank')}
                        className="flex-1 text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Uber Eats
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Delivery Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.open('https://www.doordash.com', '_blank')}
            >
              <Truck className="w-6 h-6 text-red-500" />
              <span>DoorDash</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.open('https://www.grubhub.com', '_blank')}
            >
              <Utensils className="w-6 h-6 text-orange-500" />
              <span>Grubhub</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.open('https://www.ubereats.com', '_blank')}
            >
              <Coffee className="w-6 h-6 text-green-500" />
              <span>Uber Eats</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => window.open('https://www.instacart.com', '_blank')}
            >
              <ShoppingBag className="w-6 h-6 text-blue-500" />
              <span>Instacart</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}