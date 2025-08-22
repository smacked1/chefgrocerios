import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Clock,
  Star,
  DollarSign
} from "lucide-react";

// Import Leaflet CSS and JS
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  type: string;
  rating?: number;
  priceRating?: number;
  distance?: number;
  hours?: string;
}

export function OpenStreetMapIntegration() {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Sample stores around Davenport, IA area
  const sampleStores: Store[] = [
    {
      id: "1",
      name: "Hy-Vee Food Store",
      address: "1823 E Kimberly Rd, Davenport, IA 52807",
      lat: 41.5868,
      lon: -90.5279,
      type: "grocery",
      rating: 4.2,
      priceRating: 3,
      hours: "6:00 AM - 11:00 PM"
    },
    {
      id: "2", 
      name: "Walmart Supercenter",
      address: "3101 W Kimberly Rd, Davenport, IA 52806",
      lat: 41.5851,
      lon: -90.6201,
      type: "supermarket",
      rating: 3.8,
      priceRating: 5,
      hours: "6:00 AM - 11:00 PM"
    },
    {
      id: "3",
      name: "ALDI",
      address: "4064 E 53rd St, Davenport, IA 52807",
      lat: 41.5642,
      lon: -90.5234,
      type: "grocery",
      rating: 4.4,
      priceRating: 5,
      hours: "9:00 AM - 8:00 PM"
    },
    {
      id: "4",
      name: "Fareway Stores",
      address: "2430 W Locust St, Davenport, IA 52804",
      lat: 41.5236,
      lon: -90.6123,
      type: "grocery",
      rating: 4.1,
      priceRating: 4,
      hours: "8:00 AM - 9:00 PM"
    }
  ];

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = LEAFLET_CSS;
        document.head.appendChild(cssLink);
      }

      // Load JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.onload = () => setIsMapLoaded(true);
        document.head.appendChild(script);
      } else {
        setIsMapLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          
          // Calculate distances to stores
          const storesWithDistance = sampleStores.map(store => ({
            ...store,
            distance: calculateDistance(latitude, longitude, store.lat, store.lon)
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          setNearbyStores(storesWithDistance);
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Fallback to Davenport, IA coordinates
          const defaultLocation = { lat: 41.5236, lon: -90.5776 };
          setUserLocation(defaultLocation);
          
          const storesWithDistance = sampleStores.map(store => ({
            ...store,
            distance: calculateDistance(defaultLocation.lat, defaultLocation.lon, store.lat, store.lon)
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          setNearbyStores(storesWithDistance);
        }
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (isMapLoaded && userLocation && mapContainerRef.current && !mapRef.current) {
      const L = window.L;
      
      // Create map
      const map = L.map(mapContainerRef.current).setView([userLocation.lat, userLocation.lon], 12);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add user location marker
      L.marker([userLocation.lat, userLocation.lon])
        .addTo(map)
        .bindPopup('Your Location')
        .openPopup();

      // Add store markers
      nearbyStores.forEach(store => {
        const marker = L.marker([store.lat, store.lon])
          .addTo(map)
          .bindPopup(`
            <div>
              <h3>${store.name}</h3>
              <p>${store.address}</p>
              <p>Distance: ${store.distance?.toFixed(1)} miles</p>
            </div>
          `);
        
        marker.on('click', () => setSelectedStore(store));
      });

      mapRef.current = map;
    }
  }, [isMapLoaded, userLocation, nearbyStores]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openDirections = (store: Store) => {
    if (userLocation) {
      const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lon}%3B${store.lat}%2C${store.lon}`;
      window.open(url, '_blank');
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getPriceRatingBadge = (priceRating: number) => {
    const labels = ['', 'Very Expensive', 'Expensive', 'Moderate', 'Affordable', 'Very Affordable'];
    const colors = ['', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 
                   'bg-yellow-100 text-yellow-700', 'bg-green-100 text-green-700', 'bg-emerald-100 text-emerald-700'];
    
    return (
      <Badge className={colors[priceRating] || 'bg-gray-100 text-gray-700'}>
        {labels[priceRating] || 'Unknown'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span>Store Locator - OpenStreetMap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Map Container */}
          <div className="mb-6">
            <div 
              ref={mapContainerRef}
              className="w-full h-64 md:h-80 rounded-lg border"
              style={{ minHeight: '300px' }}
            />
            {!isMapLoaded && (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Nearby Stores List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nearby Stores</h3>
            {nearbyStores.length > 0 ? (
              <div className="grid gap-4">
                {nearbyStores.slice(0, 6).map((store) => (
                  <Card 
                    key={store.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedStore?.id === store.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedStore(store)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{store.name}</h4>
                            <Badge className="bg-blue-100 text-blue-700">
                              {store.type}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            {store.distance && (
                              <div className="flex items-center space-x-1">
                                <Navigation className="w-4 h-4 text-blue-500" />
                                <span>{store.distance.toFixed(1)} miles</span>
                              </div>
                            )}
                            
                            {store.hours && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-green-500" />
                                <span>{store.hours}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          {store.rating && (
                            <div className="flex items-center space-x-1">
                              {getRatingStars(Math.floor(store.rating))}
                              <span className="text-sm text-gray-600">({store.rating})</span>
                            </div>
                          )}
                          
                          {store.priceRating && (
                            <div>
                              {getPriceRatingBadge(store.priceRating)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openDirections(store);
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Directions</span>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (mapRef.current) {
                              mapRef.current.setView([store.lat, store.lon], 15);
                            }
                          }}
                        >
                          View on Map
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No nearby stores found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Make Leaflet available globally for TypeScript
declare global {
  interface Window {
    L: any;
  }
}