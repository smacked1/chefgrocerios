mport { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaMicrophone, FaListUl, FaClock, FaCalculator, FaCalendarAlt, FaDollarSign, FaUtensils } from 'react-icons/fa';

export default function AppFeatures() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-primary text-white px-4 py-3 rounded-xl shadow-soft">
        <h1 className="text-xl font-semibold">ChefGrocer</h1>
        <div className="flex gap-2 items-center">
          <span className="bg-white text-primary px-2 py-1 rounded-full text-xs font-medium">Voice Ready</span>
          <Button variant="destructive" size="sm">Premium</Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 gap-1 bg-muted p-2 rounded-xl text-xs">
          <TabsTrigger value="voice"><FaMicrophone /></TabsTrigger>
          <TabsTrigger value="recipes"><FaUtensils /></TabsTrigger>
          <TabsTrigger value="grocery"><FaListUl /></TabsTrigger>
          <TabsTrigger value="timer"><FaClock /></TabsTrigger>
          <TabsTrigger value="calculator"><FaCalculator /></TabsTrigger>
          <TabsTrigger value="calendar"><FaCalendarAlt /></TabsTrigger>
          <TabsTrigger value="budget"><FaDollarSign /></TabsTrigger>
        </TabsList>

        {/* Voice */}
        <TabsContent value="voice">
          <Card className="mt-4 shadow-soft">
            <CardHeader><CardTitle>Voice Chef</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={() => alert('Voice activated')}>Start Voice Command</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recipes */}
        <TabsContent value="recipes">
          <Card className="mt-4 shadow-soft">
            <CardHeader><CardTitle>Recipes</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={() => alert('Search Recipes')}>Search Recipes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grocery List */}
        <TabsContent value="grocery">
          <Card className="mt-4 shadow-soft">
            <CardHeader><CardTitle>Grocery List</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={() => alert('Open Grocery List')}>View List</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timer */}
        <TabsContent value="timer">
          <Card className="mt-4 shadow-soft">
            <CardHeader><CardTitle>Cooking Timer</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={() => alert('Start Timer')}>Start Timer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator */}
        <TabsContent value="calculator">
          <Card className="mt-4 shadow-soft">
            <CardHeader><CardTitle>Nutrition Calculator</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={() => alert('Open Calculator')}>Open Calculator</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar">
          <Card className="mt-4 shadow-soft">
            <CardHeader><CardTitle>Meal Calendar</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={() => alert('Open Calendar')}>View Calendar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget */}
        <TabsContent value="budget">
          <Card className="mt-4 shadow-soft">
            <CardHeader><CardTitle>Budget Tracker</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={() => alert('Set Budget')}>Set Budget</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
