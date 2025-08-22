/*
 * ChefGrocer - AI-Powered Smart Cooking Assistant
 * Copyright (c) 2025 Myles Barber. All rights reserved.
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * 
 * For licensing inquiries: dxmylesx22@gmail.com
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GoogleMapsStoreFinder } from "@/components/google-maps-store-finder";
import { NavigationHeader } from "@/components/navigation-header";
import { 
  MapPin, 
  ArrowLeft, 
  Home,
  Navigation,
  Star,
  Phone,
  Clock,
  ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NearbyStore {
  id: string;
  name: string;
  type: string;
  address: string;
  distance: number;
  rating: number;
  hours: string;
  phone: string;
  website?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  features: string[];
}

export default function StoreFinder() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError("Could not get your location. Using default location.");
          // Default to Davenport, IA area
          setUserLocation({ lat: 41.5236, lng: -90.5776 });
        }
      );
    } else {
      setLocationError("Geolocation is not supported. Using default location.");
      setUserLocation({ lat: 41.5236, lng: -90.5776 });
    }
  }, []);

  // Fetch nearby stores
  const { data: nearbyStores, isLoading, error } = useQuery({
    queryKey: ['/api/stores/nearby', userLocation?.lat, userLocation?.lng],
    enabled: !!userLocation,
    refetchOnWindowFocus: false,
  });

  const openGoogleMaps = (store: NearbyStore) => {
    const query = `${store.name} ${store.address}`;
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(mapsUrl, '_blank');
  };

  const openDirections = (store: NearbyStore) => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`;
    window.open(directionsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to ChefGrocer
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Store Finder</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/grocery-notepad">
                <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                  📝 Shopping Lists
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Status */}
        {locationError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{locationError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nearby Stores List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nearby Stores</h2>
              {userLocation && (
                <Badge variant="outline" className="text-gray-600">
                  📍 Current Location
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : nearbyStores && nearbyStores.length > 0 ? (
              <div className="space-y-4">
                {nearbyStores.map((store: NearbyStore) => (
                  <Card key={store.id} className="border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{store.name}</h3>
                          <p className="text-gray-600 text-sm">{store.address}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{store.rating}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {store.distance} mi
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{store.hours}</span>
                        </div>
                        {store.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>

                      {store.features && store.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {store.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => openDirections(store)}
                          className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Directions
                        </Button>
                        <Button 
                          onClick={() => openGoogleMaps(store)}
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View in Maps
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No stores found</h3>
                  <p className="text-gray-600 text-sm">
                    Try using the Google Maps search on the right to find stores near you.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Google Maps Store Finder */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Search with Google Maps</h2>
            <GoogleMapsStoreFinder />
          </div>
        </div>

        {/* Quick Navigation Back to App */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to plan your shopping?</h3>
            <p className="text-gray-600 mb-4">
              Now that you know where to shop, create your grocery lists and meal plans in ChefGrocer.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/grocery-notepad">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  📝 Create Shopping List
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}