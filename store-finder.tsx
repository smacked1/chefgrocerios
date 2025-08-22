import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Store } from "@shared/schema";
import { 
  MapPin, 
  ExternalLink, 
  Truck, 
  Car, 
  Star, 
  DollarSign,
  ShoppingBag,
  Clock,
  Tag
} from "lucide-react";
import { OpenStreetMapIntegration } from "./openstreetmap-integration";
import { MapboxStoreMap } from "./mapbox-store-map";

export function StoreFinder() {
  const [location, setLocation] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [mapboxStores, setMapboxStores] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'all' | 'kroger' | 'mapbox'>('all');

  const { data: stores = [], isLoading } = useQuery<Store[]>({
    queryKey: ['/api/stores']
  });

  const nearbyStoresMutation = useMutation({
    mutationFn: async ({ location, type }: { location: string, type: 'all' | 'kroger' | 'mapbox' }) => {
      if (type === 'kroger' && userLocation) {
        const response = await apiRequest("POST", "/api/kroger/stores", { 
          latitude: userLocation[1],
          longitude: userLocation[0],
          radius: 15
        });
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/mapbox/find-stores", { 
          location,
          query: "grocery store supermarket",
          radius: 10000 // 10km radius
        });
        return await response.json();
      }
    },
    onSuccess: (data) => {
      setSearchResults(data.stores || []);
      if (data.userLocation?.coordinates) {
        setUserLocation(data.userLocation.coordinates);
      }
      setMapboxStores(data.stores || []);
    }
  });

  const getCurrentLocationMutation = useMutation({
    mutationFn: async () => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });
    },
    onSuccess: async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation([longitude, latitude]);
      
      // Find stores near current location
      try {
        const response = await apiRequest("POST", "/api/mapbox/find-stores", {
          location: `${latitude},${longitude}`,
          query: "grocery store supermarket",
          radius: 10000
        });
        const data = await response.json();
        setSearchResults(data.stores || []);
        setMapboxStores(data.stores || []);
        setLocation(data.userLocation?.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      } catch (error) {
        console.error('Error finding nearby stores:', error);
      }
    },
    onError: (error) => {
      console.error('Geolocation error:', error);
    }
  });

  const handleFindStores = () => {
    if (location.trim()) {
      nearbyStoresMutation.mutate({ location, type: searchType });
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocationMutation.mutate();
  };

  const krogerStoresMutation = useMutation({
    mutationFn: async () => {
      if (!userLocation) throw new Error('Location required');
      const response = await apiRequest("POST", "/api/kroger/stores", { 
        latitude: userLocation[1],
        longitude: userLocation[0],
        radius: 15
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.stores || []);
      setMapboxStores(data.stores || []);
    }
  });

  const getStoreTypeIcon = (type: string) => {
    switch (type) {
      case 'grocery':
        return <ShoppingBag className="w-5 h-5 text-green-600" />;
      case 'supermarket':
        return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case 'warehouse':
        return <ShoppingBag className="w-5 h-5 text-purple-600" />;
      case 'farmers_market':
        return <ShoppingBag className="w-5 h-5 text-orange-600" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStoreTypeColor = (type: string) => {
    switch (type) {
      case 'grocery':
        return 'bg-green-100 text-green-700';
      case 'supermarket':
        return 'bg-blue-100 text-blue-700';
      case 'warehouse':
        return 'bg-purple-100 text-purple-700';
      case 'farmers_market':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriceRatingBadge = (rating: number) => {
    if (rating <= 2) return <Badge className="bg-green-100 text-green-700">Budget-Friendly</Badge>;
    if (rating <= 3) return <Badge className="bg-yellow-100 text-yellow-700">Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-700">Premium</Badge>;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Find Nearby Stores</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              placeholder="Enter city, state or 'Current location'"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFindStores()}
              className="flex-1 touch-manipulation text-base"
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
            />
            <Button
              onClick={handleFindStores}
              disabled={nearbyStoresMutation.isPending || !location.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700 touch-manipulation py-3 px-6 text-base min-h-[44px]"
            >
              {nearbyStoresMutation.isPending ? 'Searching...' : 'Find Stores'}
            </Button>
          </div>
          
          {/* Quick Location Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setUserLocation([position.coords.longitude, position.coords.latitude]);
                      setLocation(`${position.coords.latitude},${position.coords.longitude}`);
                      nearbyStoresMutation.mutate({ 
                        location: `${position.coords.latitude},${position.coords.longitude}`,
                        type: searchType
                      });
                    },
                    (error) => {
                      console.error('Geolocation error:', error);
                      setLocation('Current location');
                      nearbyStoresMutation.mutate({ location: 'Davenport, IA', type: searchType });
                    }
                  );
                } else {
                  setLocation('Davenport, IA');
                  nearbyStoresMutation.mutate({ location: 'Davenport, IA', type: searchType });
                }
              }}
              className="touch-manipulation min-h-[36px]"
            >
              <MapPin className="w-4 h-4 mr-1" />
              Use My Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocation('Davenport, IA');
                nearbyStoresMutation.mutate({ location: 'Davenport, IA', type: searchType });
              }}
              className="touch-manipulation min-h-[36px]"
            >
              Davenport, IA
            </Button>
            
            {/* Search Type Toggle */}
            <div className="flex gap-2 mt-2">
              <Button
                variant={searchType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('all')}
                className="touch-manipulation min-h-[36px]"
              >
                All Stores
              </Button>
              <Button
                variant={searchType === 'kroger' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSearchType('kroger');
                  if (userLocation) {
                    krogerStoresMutation.mutate();
                  }
                }}
                className="touch-manipulation min-h-[36px] bg-blue-600 hover:bg-blue-700 text-white"
              >
                🛒 Kroger Only
              </Button>
              <Button
                variant={searchType === 'mapbox' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('mapbox')}
                className="touch-manipulation min-h-[36px]"
              >
                📍 Map Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Mapbox Map */}
      {mapboxStores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Store Locations Map</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapboxStoreMap
              stores={mapboxStores}
              userLocation={userLocation || undefined}
              onStoreSelect={(store) => setSelectedStore(store)}
              className="h-96"
            />
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nearby Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {searchResults.map((store, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-3">
                      {getStoreTypeIcon(store.type)}
                      <div>
                        <h4 className="font-semibold text-lg">{store.name}</h4>
                        <p className="text-gray-600 text-sm">{store.address}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getStoreTypeColor(store.type)}>
                        {store.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-600">{store.distance}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Price Rating</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriceRatingBadge(store.priceRating)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium">Quality Rating</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(store.qualityRating)}
                        <span className="text-sm text-gray-600 ml-2">({store.qualityRating}/5)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-3 text-sm">
                    {store.deliveryAvailable && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Truck className="w-4 h-4" />
                        <span>Delivery</span>
                      </div>
                    )}
                    {store.curbsideAvailable && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Car className="w-4 h-4" />
                        <span>Curbside</span>
                      </div>
                    )}
                  </div>

                  {store.specialOffers && store.specialOffers.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Special Offers</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {store.specialOffers.map((offer: string, offerIndex: number) => (
                          <Badge key={offerIndex} className="bg-orange-100 text-orange-700 text-xs">
                            {offer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Saved Stores */}
      <Card>
        <CardHeader>
          <CardTitle>Your Favorite Stores</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No saved stores yet</p>
              <p className="text-sm text-gray-400">Search for stores to add them to your favorites</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stores.map((store) => (
                <div key={store.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-3">
                      {getStoreTypeIcon(store.type)}
                      <div>
                        <h4 className="font-semibold text-lg">{store.name}</h4>
                        <p className="text-gray-600 text-sm">{store.address}</p>
                        {store.distance && (
                          <p className="text-gray-500 text-xs mt-1">📍 {store.distance}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getStoreTypeColor(store.type)}>
                        {store.type.replace('_', ' ')}
                      </Badge>
                      {store.website && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => window.open(store.website || '', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Price Rating</span>
                      </div>
                      {getPriceRatingBadge(store.priceRating || 3)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium">Quality</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(store.qualityRating || 4)}
                        <span className="text-sm text-gray-600 ml-2">({store.qualityRating || 4}/5)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-3 text-sm">
                    {store.deliveryAvailable && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Truck className="w-4 h-4" />
                        <span>Delivery</span>
                      </div>
                    )}
                    {store.curbsideAvailable && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Car className="w-4 h-4" />
                        <span>Curbside</span>
                      </div>
                    )}
                  </div>

                  {store.specialOffers && store.specialOffers.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Current Offers</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {store.specialOffers.map((offer, offerIndex) => (
                          <Badge key={offerIndex} className="bg-orange-100 text-orange-700 text-xs">
                            {offer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Map for Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results Map</CardTitle>
          </CardHeader>
          <CardContent>
            <OpenStreetMapIntegration />
          </CardContent>
        </Card>
      )}
    </div>
  );
}