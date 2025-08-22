import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GroceryItem } from "@shared/schema";
import { 
  ShoppingCart, 
  Plus,
  X,
  Check,
  Edit3,
  Save,
  Trash2
} from "lucide-react";

export function TypeAndSaveGroceryList() {
  const [newItem, setNewItem] = useState("");
  const [bulkItems, setBulkItems] = useState("");
  const [isEditingBulk, setIsEditingBulk] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const queryClient = useQueryClient();

  const { data: groceryItems = [], isLoading } = useQuery<GroceryItem[]>({
    queryKey: ['/api/grocery-items']
  });

  const addItemMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/grocery-items", {
        name: name.trim(),
        quantity: 1,
        category: "General",
        estimatedPrice: 0,
        completed: false
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
      setNewItem("");
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GroceryItem> }) => {
      const response = await apiRequest("PATCH", `/api/grocery-items/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
      setEditingItemId(null);
      setEditingItemName("");
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/grocery-items/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
    }
  });

  // Handle single item add (Enter key or button click)
  const handleAddItem = () => {
    if (newItem.trim()) {
      addItemMutation.mutate(newItem.trim());
    }
  };

  // Handle bulk items add (multiple items at once)
  const handleAddBulkItems = () => {
    if (!bulkItems.trim()) return;
    
    const items = bulkItems
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Add each item sequentially
    items.forEach((itemName, index) => {
      setTimeout(() => {
        addItemMutation.mutate(itemName);
      }, index * 100); // Small delay to prevent overwhelming the server
    });
    
    setBulkItems("");
    setIsEditingBulk(false);
  };

  // Handle item editing
  const startEditing = (item: GroceryItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  const saveEdit = () => {
    if (editingItemId && editingItemName.trim()) {
      updateItemMutation.mutate({
        id: editingItemId,
        updates: { name: editingItemName.trim() }
      });
    }
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName("");
  };

  // Handle item completion toggle
  const toggleComplete = (id: string, completed: boolean) => {
    updateItemMutation.mutate({
      id,
      updates: { completed }
    });
  };

  // Handle item deletion
  const deleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  const completedCount = groceryItems.filter(item => item.completed).length;
  const totalCount = groceryItems.length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-blue-500" />
              <span>Type & Save Grocery List</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={totalCount > 0 ? "default" : "secondary"}>
                {totalCount} items
              </Badge>
              {totalCount > 0 && (
                <Badge variant="outline">
                  {completedCount}/{totalCount} done
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quick Add Single Item */}
          <div className="flex space-x-2">
            <Input
              placeholder="Type item and press Enter to add..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              className="flex-1"
              disabled={addItemMutation.isPending}
            />
            <Button
              onClick={handleAddItem}
              disabled={!newItem.trim() || addItemMutation.isPending}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Bulk Add Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Add multiple items at once
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingBulk(!isEditingBulk)}
            >
              {isEditingBulk ? "Single Mode" : "Bulk Mode"}
            </Button>
          </div>

          {/* Bulk Add Interface */}
          {isEditingBulk && (
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <Textarea
                placeholder="Enter multiple items (one per line):&#10;Apples&#10;Bananas&#10;Milk&#10;Bread"
                value={bulkItems}
                onChange={(e) => setBulkItems(e.target.value)}
                className="min-h-24 resize-none"
                disabled={addItemMutation.isPending}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {bulkItems.split('\n').filter(item => item.trim()).length} items to add
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBulkItems("");
                      setIsEditingBulk(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddBulkItems}
                    disabled={!bulkItems.trim() || addItemMutation.isPending}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add All
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Grocery Items List */}
          {totalCount === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Your grocery list is empty</p>
              <p className="text-sm text-gray-400">Start typing above to add items</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groceryItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                    item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={item.completed || false}
                    onCheckedChange={(checked) => toggleComplete(item.id, checked as boolean)}
                    className="flex-shrink-0"
                  />

                  {/* Item Name (Editable) */}
                  <div className="flex-1">
                    {editingItemId === item.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editingItemName}
                          onChange={(e) => setEditingItemName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              saveEdit();
                            } else if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={saveEdit} disabled={!editingItemName.trim()}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span
                        className={`${
                          item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {editingItemId !== item.id && (
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(item)}
                        disabled={updateItemMutation.isPending}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem(item.id)}
                        disabled={deleteItemMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress Summary */}
          {totalCount > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Progress: {completedCount} of {totalCount} items completed
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-green-600 font-medium">
                    {Math.round((completedCount / totalCount) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}