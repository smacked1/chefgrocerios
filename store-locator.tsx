import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  ExternalLink,
  Car,
  ShoppingCart,
  Truck,
  Star,
  DollarSign,
  Target,
  Zap
} from "lucide-react";

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface NearbyStore {
  id: string | number;
  name: string;
  type: string; // supermarket, convenience, grocery
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  distanceText: string;
  brand?: string | null;
  website?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  wheelchair?: string | null;
}



export function StoreLocator() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [storeFilter, setStoreFilter] = useState<string>("");
  const { toast } = useToast();

  // Get user's current location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        try {
          // Reverse geocode to get address
          const response = await apiRequest("POST", "/api/location/reverse-geocode", {
            latitude: location.latitude,
            longitude: location.longitude
          });
          const addressData = await response.json();
          
          setUserLocation({
            ...location,
            ...addressData
          });
          
          toast({
            title: "Location Found",
            description: `Found stores near ${addressData.city || 'your location'}`,
          });
        } catch (error) {
          setUserLocation(location);
          toast({
            title: "Location Found",
            description: "Location acquired, searching for nearby stores...",
          });
        }
      },
      (error) => {
        let errorMessage = "Unable to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  // Query nearby stores using OpenStreetMap
  const { data: allStores = [], isLoading: storesLoading, refetch: refetchStores } = useQuery<NearbyStore[]>({
    queryKey: ['/api/ai/nearby-stores', userLocation, searchRadius],
    queryFn: async () => {
      if (!userLocation) return [];
      
      const response = await apiRequest("POST", "/api/ai/nearby-stores", {
        lat: userLocation.latitude,
        lon: userLocation.longitude,
        radius: searchRadius * 1609.34 // Convert miles to meters
      });
      return await response.json();
    },
    enabled: !!userLocation
  });

  // Filter stores based on search filter
  const nearbyStores = allStores.filter(store => {
    if (!storeFilter) return true;
    const searchTerm = storeFilter.toLowerCase();
    return store.name.toLowerCase().includes(searchTerm) || 
           (store.brand && store.brand.toLowerCase().includes(searchTerm));
  });

  const openOpenStreetMap = (store: NearbyStore) => {
    const address = encodeURIComponent(store.address);
    window.open(`https://www.openstreetmap.org/search?query=${address}`, '_blank');
  };

  const getDirections = (store: NearbyStore) => {
    if (userLocation) {
      // Use OpenStreetMap-based routing
      const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.latitude}%2C${userLocation.longitude}%3B${store.latitude}%2C${store.longitude}`;
      window.open(osmUrl, '_blank');
    } else {
      // Fallback to location search
      const address = encodeURIComponent(store.address);
      window.open(`https://www.openstreetmap.org/search?query=${address}`, '_blank');
    }
  };

  const getStoreTypeIcon = (type: string) => {
    switch (type) {
      case 'supermarket': return ShoppingCart;
      case 'convenience': return Zap;
      case 'grocery': return Target;
      default: return ShoppingCart;
    }
  };

  const getStoreTypeBadge = (type: string) => {
    const config = {
      supermarket: { color: 'bg-blue-500', text: 'Supermarket' },
      convenience: { color: 'bg-green-500', text: 'Convenience' },
      grocery: { color: 'bg-purple-500', text: 'Grocery' }
    };
    return config[type as keyof typeof config] || { color: 'bg-gray-500', text: 'Store' };
  };

  useEffect(() => {
    // Auto-request location on component mount
    requestLocation();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Nearby Stores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={requestLocation} variant="outline" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Get My Location
            </Button>
            
            {userLocation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {userLocation.city}, {userLocation.state}
              </Badge>
            )}
          </div>

          {locationError && (
            <div className="text-red-600 text-sm">
              {locationError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Search Radius (miles)</label>
              <Input
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                min={1}
                max={50}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Filter by Store</label>
              <Input
                placeholder="e.g., Walmart, Target, ALDI"
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {userLocation && (
            <Button onClick={() => refetchStores()} disabled={storesLoading}>
              {storesLoading ? "Searching..." : "Refresh Stores"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Store Results */}
      {nearbyStores.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Found {nearbyStores.length} stores near you
          </h3>
          
          {nearbyStores.map((store) => (
            <Card key={store.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold">{store.name}</h4>
                      <Badge className={getStoreTypeBadge(store.type).color + " text-white"}>
                        {getStoreTypeBadge(store.type).text}
                      </Badge>
                    </div>
                    
                    {store.brand && (
                      <p className="text-gray-600 mb-1">{store.brand}</p>
                    )}
                    
                    <p className="text-sm text-gray-500 mb-2">
                      {store.address}
                    </p>
                    
                    {store.openingHours && (
                      <p className="text-sm text-green-600">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {store.openingHours}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right space-y-2">
                    <p className="text-sm font-medium text-blue-600">{store.distanceText}</p>
                    
                    {store.phone && (
                      <Button size="sm" variant="outline" onClick={() => window.open(`tel:${store.phone}`)}>
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  {store.wheelchair && (
                    <Badge variant="outline" className="mb-2">
                      ♿ Wheelchair Accessible: {store.wheelchair}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => getDirections(store)}
                    className="flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    Directions
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openOpenStreetMap(store)}
                    className="flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    View on Map
                  </Button>
                  
                  {store.website && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(store.website || '', '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Website
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Interactive Map - Coming Soon */}
      {userLocation && nearbyStores.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
            <p className="text-gray-500">
              Interactive map view coming soon! For now, use the "Directions" button to get turn-by-turn navigation.
            </p>
          </CardContent>
        </Card>
      )}

      {userLocation && nearbyStores.length === 0 && !storesLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              No stores found within {searchRadius} miles. Try increasing the search radius.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}