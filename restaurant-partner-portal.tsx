import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Star, TrendingUp, Users, DollarSign, Clock, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RestaurantPartnershipForm {
  restaurantName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  cuisineType: string;
  locationCity: string;
  locationState: string;
  partnershipTier: string;
  monthlyCommitment: number;
}

export function RestaurantPartnerPortal() {
  const [formData, setFormData] = useState<RestaurantPartnershipForm>({
    restaurantName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    cuisineType: "",
    locationCity: "",
    locationState: "",
    partnershipTier: "",
    monthlyCommitment: 0
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const partnershipMutation = useMutation({
    mutationFn: async (data: RestaurantPartnershipForm) => {
      return await apiRequest('/api/restaurant-partnerships', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Partnership Application Submitted!",
        description: "We'll review your application and contact you within 24 hours.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Error",
        description: "Please try again or contact our support team.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    partnershipMutation.mutate(formData);
  };

  const updateField = (field: keyof RestaurantPartnershipForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="pt-8 pb-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Application Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in partnering with ChefGrocer. Our partnership team will review your application and contact you within 24 hours.
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <p>✓ Your application is being reviewed</p>
              <p>✓ Partnership agreement will be sent via email</p>
              <p>✓ Setup and onboarding typically takes 2-3 business days</p>
            </div>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  restaurantName: "",
                  contactName: "",
                  email: "",
                  phone: "",
                  website: "",
                  description: "",
                  cuisineType: "",
                  locationCity: "",
                  locationState: "",
                  partnershipTier: "",
                  monthlyCommitment: 0
                });
              }}
              variant="outline" 
              className="mt-6"
            >
              Submit Another Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Restaurant Partnership Program</h1>
        <p className="text-xl text-gray-600 mb-6">
          Join 500+ restaurants driving sales through ChefGrocer's AI-powered recipe platform
        </p>
        
        {/* Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">127%</div>
              <div className="text-sm text-gray-600">Avg Order Increase</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">25K+</div>
              <div className="text-sm text-gray-600">Recipe Views/Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">$3,200</div>
              <div className="text-sm text-gray-600">Avg Monthly Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">24hr</div>
              <div className="text-sm text-gray-600">Setup Time</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Partnership Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-blue-600" />
              Featured Recipe
            </CardTitle>
            <div className="text-2xl font-bold">$299/month</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ 1 featured recipe slot</li>
              <li>✓ Recipe promotion in app</li>
              <li>✓ Basic analytics dashboard</li>
              <li>✓ 5% commission on orders</li>
              <li>✓ Monthly performance report</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-500 relative">
          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500">
            Most Popular
          </Badge>
          <CardHeader className="pt-6">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-600" />
              Premium Partner
            </CardTitle>
            <div className="text-2xl font-bold">$599/month</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Up to 3 featured recipes</li>
              <li>✓ Priority search placement</li>
              <li>✓ Advanced analytics + insights</li>
              <li>✓ 8% commission on orders</li>
              <li>✓ Weekly performance reports</li>
              <li>✓ Custom promotional campaigns</li>
              <li>✓ Social media cross-promotion</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Enterprise
            </CardTitle>
            <div className="text-2xl font-bold">$999/month</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Unlimited featured recipes</li>
              <li>✓ Dedicated account manager</li>
              <li>✓ Custom integrations</li>
              <li>✓ 12% commission on orders</li>
              <li>✓ Real-time analytics API</li>
              <li>✓ White-label solutions</li>
              <li>✓ Priority customer support</li>
              <li>✓ Marketing campaign management</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Partnership Application</CardTitle>
          <CardDescription>
            Complete this form to start your partnership with ChefGrocer. Our team will review and contact you within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Restaurant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name *</Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={(e) => updateField('restaurantName', e.target.value)}
                    placeholder="Amazing Italian Bistro"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cuisineType">Cuisine Type *</Label>
                  <Select value={formData.cuisineType} onValueChange={(value) => updateField('cuisineType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="thai">Thai</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Restaurant Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell us about your restaurant, specialties, and what makes you unique..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="locationCity">City *</Label>
                  <Input
                    id="locationCity"
                    value={formData.locationCity}
                    onChange={(e) => updateField('locationCity', e.target.value)}
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="locationState">State *</Label>
                  <Input
                    id="locationState"
                    value={formData.locationState}
                    onChange={(e) => updateField('locationState', e.target.value)}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://your-restaurant.com"
                />
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => updateField('contactName', e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john@restaurant.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <Separator />

            {/* Partnership Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Partnership Details</h3>
              <div>
                <Label htmlFor="partnershipTier">Preferred Partnership Tier *</Label>
                <Select value={formData.partnershipTier} onValueChange={(value) => updateField('partnershipTier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partnership tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured Recipe - $299/month</SelectItem>
                    <SelectItem value="premium">Premium Partner - $599/month</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $999/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={partnershipMutation.isPending}
            >
              {partnershipMutation.isPending ? "Submitting Application..." : "Submit Partnership Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}