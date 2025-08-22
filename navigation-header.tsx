import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, ChefHat } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface NavigationHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  backHref?: string;
  onBackClick?: () => void;
  className?: string;
}

export function NavigationHeader({
  title,
  description,
  showBackButton = true,
  showHomeButton = true,
  backHref,
  onBackClick,
  className = ""
}: NavigationHeaderProps) {
  const [location] = useLocation();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backHref) {
      window.location.href = backHref;
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`bg-gradient-to-r from-orange-200/90 to-orange-300/90 backdrop-blur-md border-b border-orange-300/60 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12">
          {/* Left side - Navigation buttons */}
          <div className="flex items-center space-x-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-orange-800 hover:bg-orange-200/70 px-2 py-1 rounded-lg transition-all duration-200 text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            
            {showHomeButton && location !== '/' && (
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-800 hover:bg-orange-200/70 px-2 py-1 rounded-lg transition-all duration-200 text-xs"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </Link>
            )}
          </div>

          {/* Center - Title and description */}
          <div className="flex items-center space-x-2 flex-1 justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg flex items-center justify-center shadow-lg">
              <ChefHat className="text-white w-4 h-4" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-orange-800">{title}</h1>
              {description && (
                <p className="text-orange-700 text-xs font-medium hidden sm:block">{description}</p>
              )}
            </div>
          </div>

          {/* Right side - ChefGrocer branding */}
          <div className="flex items-center">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-800 hover:bg-orange-200/70 px-2 py-1 rounded-lg transition-all duration-200 font-bold text-xs"
              >
                ChefGrocer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}