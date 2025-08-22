import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ExternalLink, 
  Star, 
  ShoppingBag,
  Navigation,
  ArrowLeft,
  Home
} from "lucide-react";

export function GoogleMapsStoreFinder() {
  const [location, setLocation] = useState("");

  const openGoogleMaps = (query: string, searchType: string = "grocery stores") => {
    const searchQuery = `${searchType} near ${query || "me"}`;
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    window.open(mapsUrl, '_blank');
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude},${longitude}`);
        openGoogleMaps(`${latitude},${longitude}`);
      }, (error) => {
        console.error('Location error:', error);
        openGoogleMaps("grocery stores");
      });
    } else {
      openGoogleMaps("grocery stores");
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to ChefGrocer
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Direct Google Maps Search Interface */}
      <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Find Stores with Google Maps</h3>
        <p className="text-sm text-gray-600 mb-4">Search directly in Google Maps for the most accurate, real-time store information</p>
        
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter location (optional)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-white border-orange-300 focus:border-orange-500"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          <Button 
            onClick={() => openGoogleMaps(location, "grocery stores")}
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Grocery Stores
          </Button>
          
          <Button 
            onClick={() => openGoogleMaps(location, "supermarket")}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Supermarkets
          </Button>
          
          <Button 
            onClick={() => openGoogleMaps(location, "walmart target costco")}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Big Box Stores
          </Button>
          
          <Button 
            onClick={() => openGoogleMaps(location, "farmers market")}
            className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
          >
            🥕
            Farmers Markets
          </Button>
          
          <Button 
            onClick={() => openGoogleMaps(location, "organic health food store")}
            className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2"
          >
            🌿
            Health Stores
          </Button>
          
          <Button 
            onClick={handleGetCurrentLocation}
            className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Use My Location
          </Button>
        </div>
      </div>
      
      {/* Quick Store Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { name: "Walmart", query: "walmart", icon: "🛒", color: "bg-blue-100 text-blue-800" },
          { name: "Target", query: "target", icon: "🎯", color: "bg-red-100 text-red-800" },
          { name: "Costco", query: "costco", icon: "📦", color: "bg-purple-100 text-purple-800" },
          { name: "Whole Foods", query: "whole foods", icon: "🥗", color: "bg-green-100 text-green-800" },
          { name: "ALDI", query: "aldi", icon: "🏪", color: "bg-orange-100 text-orange-800" },
          { name: "Kroger", query: "kroger", icon: "🛍️", color: "bg-indigo-100 text-indigo-800" }
        ].map((store, index) => (
          <Card 
            key={index}
            className="border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer bg-white"
            onClick={() => openGoogleMaps(location, store.query)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">{store.icon}</div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{store.name}</h3>
              <Badge className={`text-xs ${store.color}`}>
                Find Nearby
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Store Finder Features */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Finder Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Real-time Locations</h4>
              <p className="text-xs text-gray-600">Current store hours and availability</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Navigation className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900">GPS Navigation</h4>
              <p className="text-xs text-gray-600">Direct Google Maps integration</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Star className="w-5 h-5 text-yellow-500" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Store Reviews</h4>
              <p className="text-xs text-gray-600">Customer ratings and reviews</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <ExternalLink className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Store Details</h4>
              <p className="text-xs text-gray-600">Phone, hours, and services</p>
            </div>
          </div>
        </div>

        {/* Easy Return Navigation */}
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Need to plan your meals first?</h4>
              <p className="text-sm text-gray-600">Go back to ChefGrocer to create recipes and meal plans</p>
            </div>
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Price Comparison Feature */}
      <Card className="border-orange-300 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Compare Prices Across Stores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700 mb-4">
            Use Google Maps to find stores, then compare prices for your shopping list items across different locations.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => openGoogleMaps(location, "walmart grocery prices")}
              size="sm" 
              variant="outline" 
              className="text-orange-700 border-orange-300"
            >
              Walmart Prices
            </Button>
            <Button 
              onClick={() => openGoogleMaps(location, "target grocery prices")}
              size="sm" 
              variant="outline" 
              className="text-orange-700 border-orange-300"
            >
              Target Prices
            </Button>
            <Button 
              onClick={() => openGoogleMaps(location, "costco bulk prices")}
              size="sm" 
              variant="outline" 
              className="text-orange-700 border-orange-300"
            >
              Costco Bulk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}