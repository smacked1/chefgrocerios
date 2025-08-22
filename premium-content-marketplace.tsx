import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Star, 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Download,
  Play,
  Book,
  Award,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PremiumContent {
  id: string;
  title: string;
  description: string;
  type: 'meal_plan' | 'recipe_collection' | 'video_course' | 'chef_special';
  price: number;
  originalPrice?: number;
  chef: string;
  chefImage: string;
  rating: number;
  reviews: number;
  duration?: string;
  recipesCount?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail: string;
  isPopular?: boolean;
  isNew?: boolean;
  features: string[];
}

export function PremiumContentMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasedContent, setPurchasedContent] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const purchaseMutation = useMutation({
    mutationFn: async (contentId: string) => {
      return await apiRequest('/api/premium-content/purchase', {
        method: 'POST',
        body: JSON.stringify({ contentId }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (_, contentId) => {
      setPurchasedContent(prev => new Set([...prev, contentId]));
      toast({
        title: "Purchase Successful!",
        description: "Premium content has been added to your library.",
      });
    },
    onError: () => {
      toast({
        title: "Purchase Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const premiumContent: PremiumContent[] = [
    {
      id: "1",
      title: "30-Day Keto Transformation",
      description: "Complete ketogenic meal plan with grocery lists, prep guides, and macro tracking",
      type: "meal_plan",
      price: 29.99,
      originalPrice: 49.99,
      chef: "Dr. Sarah Wilson",
      chefImage: "/api/placeholder/40/40",
      rating: 4.9,
      reviews: 2847,
      recipesCount: 90,
      difficulty: "beginner",
      tags: ["keto", "weight-loss", "high-protein", "meal-prep"],
      thumbnail: "/api/placeholder/300/200",
      isPopular: true,
      features: [
        "90 unique keto recipes",
        "Weekly grocery lists",
        "Macro nutrient breakdowns",
        "Meal prep instructions",
        "Progress tracking tools"
      ]
    },
    {
      id: "2", 
      title: "Gordon Ramsay's Signature Dishes",
      description: "Master 25 restaurant-quality recipes from the world-renowned chef",
      type: "recipe_collection",
      price: 39.99,
      chef: "Gordon Ramsay",
      chefImage: "/api/placeholder/40/40",
      rating: 4.8,
      reviews: 5921,
      recipesCount: 25,
      difficulty: "advanced",
      tags: ["fine-dining", "techniques", "british", "celebrity-chef"],
      thumbnail: "/api/placeholder/300/200",
      isNew: true,
      features: [
        "25 signature recipes",
        "Video cooking demonstrations",
        "Professional techniques",
        "Plating presentations",
        "Chef's secret tips"
      ]
    },
    {
      id: "3",
      title: "Plant-Based Protein Mastery",
      description: "Complete guide to high-protein vegan cooking with 60+ recipes",
      type: "video_course",
      price: 49.99,
      originalPrice: 79.99,
      chef: "Chef Maria Gonzalez",
      chefImage: "/api/placeholder/40/40",
      rating: 4.7,
      reviews: 1523,
      duration: "4.5 hours",
      recipesCount: 60,
      difficulty: "intermediate",
      tags: ["vegan", "high-protein", "healthy", "sustainable"],
      thumbnail: "/api/placeholder/300/200",
      features: [
        "4.5 hours of video content",
        "60 protein-rich recipes",
        "Nutrition science breakdown",
        "Shopping guides",
        "Meal planning templates"
      ]
    },
    {
      id: "4",
      title: "Mediterranean Family Feast",
      description: "Traditional family recipes passed down through generations",
      type: "recipe_collection",
      price: 19.99,
      chef: "Nonna Isabella",
      chefImage: "/api/placeholder/40/40",
      rating: 4.9,
      reviews: 892,
      recipesCount: 40,
      difficulty: "beginner",
      tags: ["mediterranean", "family", "traditional", "healthy"],
      thumbnail: "/api/placeholder/300/200",
      isPopular: true,
      features: [
        "40 family recipes",
        "Traditional cooking methods",
        "Ingredient substitutions",
        "Cultural cooking stories",
        "Holiday menu planning"
      ]
    },
    {
      id: "5",
      title: "Asian Street Food Journey",
      description: "Authentic street food recipes from 8 Asian countries",
      type: "chef_special",
      price: 24.99,
      chef: "Chef David Chang",
      chefImage: "/api/placeholder/40/40",
      rating: 4.6,
      reviews: 674,
      recipesCount: 32,
      difficulty: "intermediate",
      tags: ["asian", "street-food", "authentic", "fusion"],
      thumbnail: "/api/placeholder/300/200",
      features: [
        "32 street food recipes",
        "Country-specific techniques",
        "Sauce and condiment guides",
        "Cultural context and stories",
        "Spice level customization"
      ]
    },
    {
      id: "6",
      title: "Baking Fundamentals Masterclass",
      description: "Learn professional baking techniques from pastry chef experts",
      type: "video_course",
      price: 59.99,
      chef: "Chef Pierre Dubois",
      chefImage: "/api/placeholder/40/40",
      rating: 4.8,
      reviews: 1245,
      duration: "6 hours",
      recipesCount: 45,
      difficulty: "advanced",
      tags: ["baking", "pastry", "techniques", "professional"],
      thumbnail: "/api/placeholder/300/200",
      isNew: true,
      features: [
        "6 hours of detailed tutorials",
        "45 baking recipes",
        "Professional techniques",
        "Troubleshooting guide",
        "Equipment recommendations"
      ]
    }
  ];

  const handlePurchase = (contentId: string) => {
    purchaseMutation.mutate(contentId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meal_plan': return <Book className="h-4 w-4" />;
      case 'recipe_collection': return <ChefHat className="h-4 w-4" />;
      case 'video_course': return <Play className="h-4 w-4" />;
      case 'chef_special': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredContent = selectedCategory === 'all' 
    ? premiumContent 
    : premiumContent.filter(content => content.type === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-yellow-600" />
          Premium Content Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Exclusive recipes, meal plans, and cooking courses from world-class chefs
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="meal_plan">Meal Plans</TabsTrigger>
          <TabsTrigger value="recipe_collection">Recipe Collections</TabsTrigger>
          <TabsTrigger value="video_course">Video Courses</TabsTrigger>
          <TabsTrigger value="chef_special">Chef Specials</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((content) => (
              <Card key={content.id} className="hover:shadow-lg transition-shadow relative">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  {content.isPopular && (
                    <Badge className="bg-orange-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {content.isNew && (
                    <Badge className="bg-green-500 text-white">
                      <Zap className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={content.thumbnail} 
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getTypeIcon(content.type)}
                      {content.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight line-clamp-2">
                        {content.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <img 
                          src={content.chefImage} 
                          alt={content.chef}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600">{content.chef}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {content.originalPrice && (
                        <div className="text-sm line-through text-gray-500">
                          ${content.originalPrice.toFixed(2)}
                        </div>
                      )}
                      <div className="text-xl font-bold text-green-600">
                        ${content.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <CardDescription className="line-clamp-2">
                    {content.description}
                  </CardDescription>

                  {/* Rating & Reviews */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{content.rating}</span>
                      <span className="text-sm text-gray-500">({content.reviews})</span>
                    </div>
                    <Badge className={getDifficultyColor(content.difficulty)}>
                      {content.difficulty}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {content.recipesCount && (
                      <div className="flex items-center gap-1">
                        <ChefHat className="h-3 w-3" />
                        {content.recipesCount} recipes
                      </div>
                    )}
                    {content.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {content.duration}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {content.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    <div className="text-sm font-medium">What's included:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {content.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(content.id)}
                    disabled={purchasedContent.has(content.id) || purchaseMutation.isPending}
                    className="w-full"
                  >
                    {purchasedContent.has(content.id) ? (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Purchased - Download
                      </>
                    ) : (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Get Premium Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Revenue Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Premium content sales: $9.99-$59.99 per purchase
            </span>
            <span className="font-medium text-green-600">
              {purchasedContent.size} items purchased
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}