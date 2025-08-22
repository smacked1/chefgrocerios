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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/navigation-header";
import { Save, Plus, Trash2, ShoppingCart, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GroceryList {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function GroceryNotepad() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [currentList, setCurrentList] = useState('');
  const [listName, setListName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = [
    { id: 'general', name: 'General', icon: ShoppingCart },
    { id: 'weekly', name: 'Weekly Shopping', icon: FileText },
    { id: 'quick', name: 'Quick Lists', icon: Clock },
  ];

  // Load saved lists from localStorage
  useEffect(() => {
    const savedLists = localStorage.getItem('grocery-lists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    }
  }, []);

  // Save lists to localStorage
  const saveLists = (newLists: GroceryList[]) => {
    setLists(newLists);
    localStorage.setItem('grocery-lists', JSON.stringify(newLists));
  };

  const saveCurrentList = () => {
    if (!currentList.trim()) {
      toast({
        title: "Empty List",
        description: "Please add some items to your grocery list.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const name = listName.trim() || `List ${new Date().toLocaleDateString()}`;

    if (activeListId) {
      // Update existing list
      const updatedLists = lists.map(list => 
        list.id === activeListId 
          ? { ...list, name, content: currentList, category: selectedCategory, updatedAt: now }
          : list
      );
      saveLists(updatedLists);
      toast({
        title: "List Updated",
        description: `"${name}" has been saved.`,
      });
    } else {
      // Create new list
      const newList: GroceryList = {
        id: Date.now().toString(),
        name,
        content: currentList,
        category: selectedCategory,
        createdAt: now,
        updatedAt: now,
      };
      saveLists([...lists, newList]);
      toast({
        title: "List Saved",
        description: `"${name}" has been saved.`,
      });
    }
  };

  const loadList = (list: GroceryList) => {
    setCurrentList(list.content);
    setListName(list.name);
    setSelectedCategory(list.category);
    setActiveListId(list.id);
  };

  const deleteList = (listId: string) => {
    const updatedLists = lists.filter(list => list.id !== listId);
    saveLists(updatedLists);
    
    if (activeListId === listId) {
      setCurrentList('');
      setListName('');
      setActiveListId(null);
    }
    
    toast({
      title: "List Deleted",
      description: "Grocery list has been removed.",
    });
  };

  const createNewList = () => {
    setCurrentList('');
    setListName('');
    setActiveListId(null);
    setSelectedCategory('general');
  };

  const getListsByCategory = (categoryId: string) => {
    return lists.filter(list => list.category === categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <NavigationHeader 
        title="Grocery Notepad" 
        description="Create and manage your grocery lists"
        backHref="/"
      />
      
      <div className="max-w-6xl mx-auto p-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {activeListId ? 'Edit List' : 'New Grocery List'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="List name (optional)"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <Textarea
                placeholder="Type your grocery list here...

Examples:
• Milk (2 gallons)
• Bread (whole wheat)
• Bananas (6)
• Chicken breast (2 lbs)
• Rice (brown, 1 bag)
• Yogurt (Greek, vanilla)

Just type naturally - one item per line!"
                value={currentList}
                onChange={(e) => setCurrentList(e.target.value)}
                className="min-h-[400px] text-base leading-relaxed"
              />

              <div className="flex gap-2">
                <Button onClick={saveCurrentList} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save List
                </Button>
                <Button onClick={createNewList} variant="outline" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  New List
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Lists Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Saved Lists ({lists.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-3">
                  {categories.map(category => {
                    const Icon = category.icon;
                    const count = getListsByCategory(category.id).length;
                    return (
                      <TabsTrigger key={category.id} value={category.id} className="text-xs">
                        <Icon className="w-3 h-3 mr-1" />
                        {category.name}
                        {count > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {count}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {categories.map(category => (
                  <TabsContent key={category.id} value={category.id} className="space-y-3 mt-4">
                    {getListsByCategory(category.id).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No lists in {category.name} yet</p>
                        <p className="text-sm">Create your first list above!</p>
                      </div>
                    ) : (
                      getListsByCategory(category.id).map(list => (
                        <Card key={list.id} className={`cursor-pointer transition-colors ${
                          activeListId === list.id ? 'ring-2 ring-orange-500' : 'hover:bg-gray-50'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 
                                className="font-medium text-gray-900 truncate"
                                onClick={() => loadList(list)}
                              >
                                {list.name}
                              </h3>
                              <Button
                                onClick={() => deleteList(list.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <p 
                              className="text-sm text-gray-600 line-clamp-2 cursor-pointer"
                              onClick={() => loadList(list)}
                            >
                              {list.content.split('\n').slice(0, 3).join(' • ')}
                              {list.content.split('\n').length > 3 && '...'}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(list.updatedAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}