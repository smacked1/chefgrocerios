import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Store, Clock, Star, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "@/components/loading-skeleton";

interface Store {
  id: string;
  name: string;
  type: 'grocery' | 'restaurant' | 'farmer_market';
  address: string;
  distance: number;
  rating: number;
  hours: string;
  phone?: string;
  website?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  features: string[];
}

interface LocationSearchProps {
  onStoreSelect?: (store: Store) => void;
}

export function LocationSearch({ onStoreSelect }: LocationSearchProps) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [searchRadius, setSearchRadius] = useState(5); // miles
  const [storeType, setStoreType] = useState<'all' | 'grocery' | 'restaurant' | 'farmer_market'>('all');

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location access denied:", error);
          // Default to a major city if location is denied
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // NYC
        }
      );
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Search nearby stores
  const { data: nearbyStores = [], isLoading } = useQuery<Store[]>({
    queryKey: ['/api/stores/nearby', userLocation, searchRadius, storeType],
    queryFn: async () => {
      if (!userLocation) return [];
      
      const response = await fetch(`/api/stores/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${searchRadius}&type=${storeType}`);
      return response.json();
    },
    enabled: !!userLocation,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Search stores by address/zip code
  const { data: searchResults = [], isLoading: isSearching } = useQuery<Store[]>({
    queryKey: ['/api/stores/search', locationQuery, storeType],
    queryFn: async () => {
      if (!locationQuery || locationQuery.length < 3) return [];
      
      const response = await fetch(`/api/stores/search?q=${encodeURIComponent(locationQuery)}&type=${storeType}`);
      return response.json();
    },
    enabled: locationQuery.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const displayStores = locationQuery.length >= 3 ? searchResults : nearbyStores;

  const getStoreIcon = (type: Store['type']) => {
    switch (type) {
      case 'grocery': return '🛒';
      case 'restaurant': return '🍽️';
      case 'farmer_market': return '🌽';
      default: return '🏪';
    }
  };

  const getStoreTypeColor = (type: Store['type']) => {
    switch (type) {
      case 'grocery': return 'bg-blue-100 text-blue-700';
      case 'restaurant': return 'bg-purple-100 text-purple-700';
      case 'farmer_market': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`;
    }
    return `${distance.toFixed(1)} mi`;
  };

  return (
    <div className="space-y-6">
      {/* Location Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Find Stores & Restaurants Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter address, city, or zip code..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={userLocation ? "outline" : "default"}
                size="sm"
                onClick={getUserLocation}
                className="whitespace-nowrap"
              >
                <Navigation className="h-4 w-4 mr-1" />
                Use My Location
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select 
              value={storeType} 
              onChange={(e) => setStoreType(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="grocery">Grocery Stores</option>
              <option value="restaurant">Restaurants</option>
              <option value="farmer_market">Farmer's Markets</option>
            </select>
            
            <select 
              value={searchRadius} 
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value={1}>Within 1 mile</option>
              <option value={5}>Within 5 miles</option>
              <option value={10}>Within 10 miles</option>
              <option value={25}>Within 25 miles</option>
            </select>
          </div>

          {userLocation && (
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Searching near your location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Results */}
      {isLoading || isSearching ? (
        <LoadingSkeleton type="list" count={5} />
      ) : (
        <div className="grid gap-4">
          {displayStores.length > 0 ? (
            displayStores.map((store) => (
              <Card key={store.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onStoreSelect?.(store)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Store Header */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getStoreIcon(store.type)}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{store.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Badge variant="outline" className={getStoreTypeColor(store.type)}>
                              {store.type.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {store.rating}
                            </div>
                            <span>•</span>
                            <span>{formatDistance(store.distance)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Store Details */}
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {store.address}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          {store.hours}
                        </div>
                        {store.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            {store.phone}
                          </div>
                        )}
                      </div>

                      {/* Store Features */}
                      {store.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {store.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          console.log('Viewing menu for:', store.name);
                          onStoreSelect?.(store);
                        }}
                      >
                        <Store className="h-4 w-4 mr-1" />
                        View Menu
                      </Button>
                      {store.website && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={store.website} target="_blank" rel="noopener noreferrer">
                            Visit Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No stores found</h3>
                <p>Try adjusting your search location or expanding the search radius.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}