import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  ShoppingCart, 
  MapPin, 
  Utensils,
  Bell,
  Settings,
  User,
  LogOut,
  ChefHat,
  Calendar,
  DollarSign
} from "lucide-react";

interface MobileNavigationProps {
  onNavigate?: (section: string) => void;
}

export function MobileNavigation({ onNavigate }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { id: 'meal-plans', label: 'Today\'s Meals', icon: Calendar, color: 'text-orange-500' },
    { id: 'recipes-discovery', label: 'Recipe Search', icon: ChefHat, color: 'text-blue-500' },
    { id: 'grocery', label: 'Shopping List', icon: ShoppingCart, color: 'text-green-500' },
    { id: 'stores', label: 'Store Finder', icon: MapPin, color: 'text-purple-500' },
    { id: 'voice-commands', label: 'Voice Assistant', icon: Utensils, color: 'text-red-500' },
    { id: 'savings', label: 'Price Tracker', icon: DollarSign, color: 'text-yellow-600' }
  ];

  const handleNavClick = (itemId: string) => {
    onNavigate?.(itemId);
    setIsOpen(false);
    
    // Smooth scroll to section
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden touch-manipulation p-2"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Utensils className="text-white text-sm" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">ChefGrocer</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => handleNavClick(item.id)}
                    className="w-full justify-start touch-manipulation h-12 text-left"
                  >
                    <Icon className={`w-5 h-5 mr-3 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start touch-manipulation h-12"
                  onClick={() => handleNavClick('notifications')}
                >
                  <Bell className="w-5 h-5 mr-3 text-gray-600" />
                  <span>Notifications</span>
                  <Badge className="ml-auto bg-red-500 text-white">3</Badge>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start touch-manipulation h-12"
                  onClick={() => handleNavClick('settings')}
                >
                  <Settings className="w-5 h-5 mr-3 text-gray-600" />
                  <span>Settings</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start touch-manipulation h-12 text-red-600"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation - Enhanced */}
      <nav className="hidden sm:flex space-x-4 lg:space-x-8 text-sm">
        {navigationItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className="text-gray-600 hover:text-gray-900 touch-manipulation py-2 px-1 font-medium transition-colors"
          >
            {item.label.replace('Today\'s ', '').replace(' Search', '').replace(' List', '').replace(' Finder', '')}
          </button>
        ))}
      </nav>
    </>
  );
}