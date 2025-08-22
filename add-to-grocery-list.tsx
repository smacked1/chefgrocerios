import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, DollarSign } from "lucide-react";

interface AddToGroceryListProps {
  productName?: string;
  productPrice?: number;
  category?: string;
  onAdded?: () => void;
}

export function AddToGroceryList({ productName = "", productPrice, category = "General", onAdded }: AddToGroceryListProps) {
  const [itemName, setItemName] = useState(productName);
  const [quantity, setQuantity] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState(productPrice || 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (newItem: {
      name: string;
      quantity: number;
      category: string;
      estimatedPrice?: number;
      completed: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/grocery-items", newItem);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
      toast({
        title: "Added to Grocery List",
        description: `${itemName} has been added to your shopping list`,
      });
      setItemName("");
      setQuantity(1);
      setEstimatedPrice(0);
      setIsExpanded(false);
      onAdded?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add item to grocery list. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddItem = () => {
    if (!itemName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }

    addItemMutation.mutate({
      name: itemName.trim(),
      quantity,
      category,
      estimatedPrice: estimatedPrice > 0 ? estimatedPrice : undefined,
      completed: false
    });
  };

  const handleQuickAdd = () => {
    if (!productName) {
      setIsExpanded(true);
      return;
    }
    handleAddItem();
  };

  if (!isExpanded && productName) {
    return (
      <Button 
        onClick={handleQuickAdd}
        disabled={addItemMutation.isPending}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {addItemMutation.isPending ? "Adding..." : "Add to Grocery List"}
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Grocery List
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Item Name</label>
          <Input
            placeholder="Enter item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Quantity</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Est. Price</label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(parseFloat(e.target.value) || 0)}
                className="pl-8"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleAddItem}
            disabled={addItemMutation.isPending || !itemName.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {addItemMutation.isPending ? "Adding..." : "Add Item"}
          </Button>
          {!productName && (
            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}