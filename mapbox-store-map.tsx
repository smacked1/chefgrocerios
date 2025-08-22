import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  ExternalLink,
  Car
} from 'lucide-react';

// Set Mapbox access token from environment variable
if (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
}

interface Store {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
  type: string;
  distance?: string;
  phone?: string;
  hours?: string;
  website?: string;
}

interface MapboxStoreMapProps {
  stores: Store[];
  userLocation?: [number, number];
  onStoreSelect?: (store: Store) => void;
  className?: string;
}

export function MapboxStoreMap({ 
  stores, 
  userLocation, 
  onStoreSelect, 
  className = "h-96" 
}: MapboxStoreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation || [-90.5776, 41.5868], // Default to Davenport, IA
      zoom: 12,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({
        color: '#3b82f6',
        scale: 1.2
      })
        .setLngLat(userLocation)
        .addTo(map.current);
      
      markersRef.current.push(userMarker);
    }

    // Add store markers
    stores.forEach((store) => {
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'store-marker';
      markerEl.style.cssText = `
        background: #ff5500;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      
      // Add store icon
      const icon = document.createElement('div');
      icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/></svg>`;
      markerEl.appendChild(icon);

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(store.coordinates)
        .addTo(map.current!);

      // Add click handler
      markerEl.addEventListener('click', () => {
        setSelectedStore(store);
        onStoreSelect?.(store);
        
        // Center map on store
        map.current?.flyTo({
          center: store.coordinates,
          zoom: 15,
          duration: 1000
        });
      });

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${store.name}</h3>
          <p class="text-xs text-gray-600">${store.address}</p>
          ${store.distance ? `<p class="text-xs text-blue-600">${store.distance}</p>` : ''}
        </div>
      `);

      markerEl.addEventListener('mouseenter', () => {
        popup.setLngLat(store.coordinates).addTo(map.current!);
      });

      markerEl.addEventListener('mouseleave', () => {
        popup.remove();
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all stores and user location
    if (stores.length > 0) {
      const coordinates = stores.map(store => store.coordinates);
      if (userLocation) {
        coordinates.push(userLocation);
      }

      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [stores, userLocation, onStoreSelect]);

  const getDirections = (store: Store) => {
    if (userLocation) {
      const origin = `${userLocation[1]},${userLocation[0]}`;
      const destination = `${store.coordinates[1]},${store.coordinates[0]}`;
      window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(store.address)}`, '_blank');
    }
  };

  const getStoreTypeColor = (type: string) => {
    const colors = {
      'grocery': 'bg-green-100 text-green-700',
      'supermarket': 'bg-blue-100 text-blue-700',
      'warehouse': 'bg-purple-100 text-purple-700',
      'farmers_market': 'bg-orange-100 text-orange-700',
      'convenience': 'bg-yellow-100 text-yellow-700'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (!mapboxgl.accessToken) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Map integration not available</p>
            <p className="text-sm text-gray-500">Mapbox access token required</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`relative rounded-lg overflow-hidden border ${className}`}>
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Map overlay controls */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <p className="text-sm font-medium text-gray-700">
            {stores.length} stores found
          </p>
        </div>
      </div>

      {/* Selected store details */}
      {selectedStore && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-lg">{selectedStore.name}</h3>
                  <Badge className={getStoreTypeColor(selectedStore.type)}>
                    {selectedStore.type}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedStore.address}</span>
                  </div>
                  
                  {selectedStore.distance && (
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4" />
                      <span>{selectedStore.distance}</span>
                    </div>
                  )}
                  
                  {selectedStore.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{selectedStore.phone}</span>
                    </div>
                  )}
                  
                  {selectedStore.hours && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedStore.hours}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <Button 
                  size="sm" 
                  onClick={() => getDirections(selectedStore)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Directions
                </Button>
                
                {selectedStore.website && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(selectedStore.website, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}