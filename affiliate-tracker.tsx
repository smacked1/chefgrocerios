import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ExternalLink, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Truck,
  Star,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateLink {
  id: string;
  store: string;
  product: string;
  category: string;
  originalPrice: number;
  discountedPrice?: number;
  commission: number;
  rating: number;
  affiliateUrl: string;
  imageUrl: string;
  description: string;
  inStock: boolean;
  estimatedDelivery: string;
}

interface AffiliateTrackerProps {
  ingredients?: string[];
  recipeCategory?: string;
}

export function AffiliateTracker({ ingredients = [], recipeCategory }: AffiliateTrackerProps) {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());
  const [totalCommissions, setTotalCommissions] = useState(0);
  const { toast } = useToast();

  // Generate affiliate links based on ingredients
  useEffect(() => {
    const mockLinks: AffiliateLink[] = [
      {
        id: "1",
        store: "Amazon Fresh",
        product: "Organic Chicken Breast (2 lbs)",
        category: "Fresh Meat",
        originalPrice: 12.99,
        discountedPrice: 10.99,
        commission: 0.65,
        rating: 4.7,
        affiliateUrl: "https://amazon.com/ref=chefgrocer_aff_001",
        imageUrl: "/api/placeholder/150/150",
        description: "Premium organic chicken breast, perfect for healthy recipes",
        inStock: true,
        estimatedDelivery: "Today by 6 PM"
      }
    ];
    setAffiliateLinks(mockLinks);
  }, []); // Remove dependencies to prevent infinite loop

  const generateAffiliateLinks = useCallback(() => {
    // Mock affiliate data - in production, this would come from APIs
    const mockLinks: AffiliateLink[] = [
      {
        id: "1",
        store: "Amazon Fresh",
        product: "Organic Chicken Breast (2 lbs)",
        category: "Fresh Meat",
        originalPrice: 12.99,
        discountedPrice: 10.99,
        commission: 0.65, // 5% commission
        rating: 4.7,
        affiliateUrl: "https://amazon.com/ref=chefgrocer_aff_001",
        imageUrl: "/api/placeholder/150/150",
        description: "Premium organic chicken breast, perfect for healthy recipes",
        inStock: true,
        estimatedDelivery: "Today by 6 PM"
      },
      {
        id: "2",
        store: "Instacart",
        product: "Fresh Baby Spinach (5 oz)",
        category: "Vegetables", 
        originalPrice: 3.49,
        commission: 0.52, // 15% commission
        rating: 4.5,
        affiliateUrl: "https://instacart.com/ref=chefgrocer_aff_002",
        imageUrl: "/api/placeholder/150/150",
        description: "Fresh organic baby spinach leaves",
        inStock: true,
        estimatedDelivery: "Within 2 hours"
      },
      {
        id: "3",
        store: "Williams Sonoma",
        product: "All-Clad Stainless Steel Pan",
        category: "Cookware",
        originalPrice: 199.99,
        discountedPrice: 159.99,
        commission: 12.80, // 8% commission
        rating: 4.9,
        affiliateUrl: "https://williams-sonoma.com/ref=chefgrocer_aff_003",
        imageUrl: "/api/placeholder/150/150",
        description: "Professional-grade stainless steel frying pan",
        inStock: true,
        estimatedDelivery: "2-3 business days"
      },
      {
        id: "4",
        store: "Thrive Market",
        product: "Organic Extra Virgin Olive Oil",
        category: "Pantry",
        originalPrice: 24.99,
        discountedPrice: 19.99,
        commission: 4.00, // 20% commission
        rating: 4.8,
        affiliateUrl: "https://thrivemarket.com/ref=chefgrocer_aff_004",
        imageUrl: "/api/placeholder/150/150",
        description: "Cold-pressed organic olive oil from Italy",
        inStock: true,
        estimatedDelivery: "3-5 business days"
      },
      {
        id: "5",
        store: "HelloFresh",
        product: "Mediterranean Meal Kit (2 servings)",
        category: "Meal Kits",
        originalPrice: 23.98,
        discountedPrice: 17.98,
        commission: 4.50, // 25% commission  
        rating: 4.6,
        affiliateUrl: "https://hellofresh.com/ref=chefgrocer_aff_005",
        imageUrl: "/api/placeholder/150/150",
        description: "Complete meal kit with fresh ingredients and recipe card",
        inStock: true,
        estimatedDelivery: "Next delivery window"
      }
    ];

    // This function is now simplified and called directly in useEffect
  }, []);

  const handleAffiliateClick = (link: AffiliateLink) => {
    // Track the click
    setClickedLinks(prev => new Set([...prev, link.id]));
    setTotalCommissions(prev => prev + link.commission);
    
    // Show toast notification
    toast({
      title: "Redirecting to " + link.store,
      description: `Earn $${link.commission.toFixed(2)} commission on this purchase`,
    });

    // In production, this would send tracking data to analytics
    console.log("Affiliate click tracked:", {
      linkId: link.id,
      store: link.store,
      product: link.product,
      commission: link.commission,
      timestamp: new Date().toISOString()
    });

    // Open affiliate link in new tab
    window.open(link.affiliateUrl, '_blank');
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fresh meat':
      case 'vegetables':
      case 'pantry':
        return <ShoppingCart className="h-4 w-4" />;
      case 'cookware':
        return <Package className="h-4 w-4" />;
      case 'meal kits':
        return <Truck className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Tracking Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Affiliate Revenue Tracker
              </CardTitle>
              <CardDescription>
                Earn commission on recommended products and grocery orders
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${totalCommissions.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                Total Commissions Today
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Affiliate Product Links */}
      <div className="grid gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recommended Products</h3>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            5-25% Commission
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {affiliateLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Product Image & Store */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(link.category)}
                      <Badge variant="outline" className="text-xs">
                        {link.store}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-green-600 font-medium">
                        +${link.commission.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">commission</div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div>
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {link.product}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {link.description}
                    </p>
                  </div>

                  {/* Rating & Stock */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{link.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${link.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={link.inStock ? 'text-green-600' : 'text-red-600'}>
                        {link.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex justify-between items-center">
                    <div>
                      {link.discountedPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">
                            ${link.discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-xs line-through text-gray-500">
                            ${link.originalPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold">
                          ${link.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{link.estimatedDelivery}</span>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleAffiliateClick(link)}
                    disabled={!link.inStock}
                    className="w-full"
                    size="sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {clickedLinks.has(link.id) 
                      ? "Clicked - Shop Now" 
                      : "Shop Now"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Commission Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Revenue share: 5-25% commission on purchases through these links
            </span>
            <span className="font-medium">
              {clickedLinks.size} links clicked today
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}