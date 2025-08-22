import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GroceryItem } from "@shared/schema";
import { ShoppingCart } from "lucide-react";

export function GroceryListPreview() {
  const queryClient = useQueryClient();

  const { data: groceryItems = [], isLoading } = useQuery<GroceryItem[]>({
    queryKey: ['/api/grocery-items']
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/grocery-items/${id}`, { completed });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
    }
  });

  const handleItemToggle = (id: string, completed: boolean) => {
    updateItemMutation.mutate({ id, completed });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeItems = groceryItems.filter(item => !item.completed);
  const previewItems = activeItems.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Grocery List</CardTitle>
          <Badge className="bg-green-100 text-green-700">
            {activeItems.length} items
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {activeItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Your grocery list is empty</p>
            <p className="text-sm text-gray-400">Use voice commands to add items</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {previewItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => 
                      handleItemToggle(item.id, checked as boolean)
                    }
                    className="text-green-600"
                  />
                  <span className={`text-gray-900 flex-1 ${
                    item.completed ? 'line-through text-gray-500' : ''
                  }`}>
                    {item.name}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {item.quantity}
                  </span>
                </div>
              ))}
              
              {activeItems.length > 5 && (
                <div className="text-sm text-gray-500 text-center pt-2">
                  + {activeItems.length - 5} more items
                </div>
              )}
            </div>
            
            <Button 
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                console.log('Opening full grocery list');
                window.location.href = '/grocery-notepad';
              }}
            >
              View Full List
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
