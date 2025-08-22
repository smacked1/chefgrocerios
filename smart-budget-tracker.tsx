import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DollarSign, TrendingUp, TrendingDown, Target, ShoppingCart, Calendar, PiggyBank, AlertCircle, Calculator, Plus, Minus, X, Divide, Equal, Delete } from 'lucide-react';

interface BudgetData {
  id?: string;
  userId: string;
  monthlyBudget: number;
  weeklyBudget: number;
  currentSpending: number;
  categories: {
    [key: string]: {
      budgeted: number;
      spent: number;
    };
  };
  savingsGoal: number;
  currentSavings: number;
  lastUpdated: string;
}

interface ExpenseEntry {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function SmartBudgetTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [monthlyBudget, setMonthlyBudget] = useState(500);
  const [savingsGoal, setSavingsGoal] = useState(100);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrevious, setCalcPrevious] = useState<number | null>(null);
  const [calcOperation, setCalcOperation] = useState<string | null>(null);
  const [calcWaitingForNumber, setCalcWaitingForNumber] = useState(false);
  const [newExpense, setNewExpense] = useState<ExpenseEntry>({
    amount: 0,
    category: 'groceries',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch budget data from database
  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['/api/budget'],
    retry: false,
  });

  // Save budget mutation
  const saveBudgetMutation = useMutation({
    mutationFn: async (budget: Partial<BudgetData>) => {
      return apiRequest('POST', '/api/budget', budget);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      toast({
        title: "Budget Saved",
        description: "Your budget has been saved successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save budget data",
        variant: "destructive",
      });
    },
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: ExpenseEntry) => {
      return apiRequest('POST', '/api/budget/expense', expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      setNewExpense({
        amount: 0,
        category: 'groceries',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      toast({
        title: "Expense Added",
        description: "Your expense has been recorded!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Expense",
        description: error.message || "Could not record expense",
        variant: "destructive",
      });
    },
  });

  // Load saved budget data
  useEffect(() => {
    if (budgetData) {
      setMonthlyBudget(budgetData.monthlyBudget || 500);
      setSavingsGoal(budgetData.savingsGoal || 100);
    }
  }, [budgetData]);

  const handleSaveBudget = () => {
    saveBudgetMutation.mutate({
      monthlyBudget,
      weeklyBudget: Math.round(monthlyBudget / 4.33),
      savingsGoal,
      currentSpending: budgetData?.currentSpending || 0,
      categories: budgetData?.categories || {
        groceries: { budgeted: monthlyBudget * 0.6, spent: 0 },
        dining: { budgeted: monthlyBudget * 0.25, spent: 0 },
        snacks: { budgeted: monthlyBudget * 0.15, spent: 0 }
      },
      currentSavings: budgetData?.currentSavings || 0,
      lastUpdated: new Date().toISOString()
    });
  };

  const handleAddExpense = () => {
    if (newExpense.amount <= 0 || !newExpense.description.trim()) {
      toast({
        title: "Invalid Expense",
        description: "Please enter a valid amount and description",
        variant: "destructive",
      });
      return;
    }
    addExpenseMutation.mutate(newExpense);
  };

  const currentSpending = budgetData?.currentSpending || 0;
  const spentPercentage = (currentSpending / monthlyBudget) * 100;
  const remainingBudget = monthlyBudget - currentSpending;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const dailyBudget = monthlyBudget / daysInMonth;
  const expectedSpending = dailyBudget * currentDay;
  const budgetStatus = currentSpending <= expectedSpending ? 'on-track' : 'over-budget';

  const categories = budgetData?.categories || {
    groceries: { budgeted: monthlyBudget * 0.6, spent: 0 },
    dining: { budgeted: monthlyBudget * 0.25, spent: 0 },
    snacks: { budgeted: monthlyBudget * 0.15, spent: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Setup */}
      <Card className="border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-emerald-800">
            <Target className="w-5 h-5" />
            Budget Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthly-budget" className="text-emerald-700 font-medium">
                Monthly Food Budget ($)
              </Label>
              <Input
                id="monthly-budget"
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                className="border-emerald-300 focus:border-emerald-500"
                placeholder="500"
              />
            </div>
            <div>
              <Label htmlFor="savings-goal" className="text-emerald-700 font-medium">
                Monthly Savings Goal ($)
              </Label>
              <Input
                id="savings-goal"
                type="number"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(parseFloat(e.target.value) || 0)}
                className="border-emerald-300 focus:border-emerald-500"
                placeholder="100"
              />
            </div>
          </div>
          <Button 
            onClick={handleSaveBudget}
            disabled={saveBudgetMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {saveBudgetMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <>
                <PiggyBank className="w-4 h-4 mr-2" />
                Save Budget
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Current Spending</p>
                <p className="text-2xl font-bold text-emerald-800">${currentSpending.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
            <Progress 
              value={spentPercentage} 
              className="mt-2 h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {spentPercentage.toFixed(1)}% of ${monthlyBudget}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Remaining Budget</p>
                <p className="text-2xl font-bold text-green-600">${remainingBudget.toFixed(2)}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ${(remainingBudget / (daysInMonth - currentDay)).toFixed(2)} per day
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Status</p>
                <Badge 
                  className={budgetStatus === 'on-track' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                >
                  {budgetStatus === 'on-track' ? (
                    <>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      On Track
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Over Budget
                    </>
                  )}
                </Badge>
              </div>
              {budgetStatus === 'on-track' ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
            <p className="text-xs text-orange-500 mt-1">
              Expected: ${expectedSpending.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-emerald-800">
            <Calendar className="w-5 h-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(categories).map(([category, data]) => {
            const categoryPercentage = (data.spent / data.budgeted) * 100;
            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize text-emerald-800">{category}</span>
                  <span className="text-sm text-orange-600">
                    ${data.spent.toFixed(2)} / ${data.budgeted.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={categoryPercentage} 
                  className="h-2"
                />
                <p className="text-xs text-orange-500">
                  {categoryPercentage.toFixed(1)}% used
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Add New Expense */}
      <Card className="border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-emerald-800">
            <DollarSign className="w-5 h-5" />
            Add Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="expense-amount" className="text-emerald-700 font-medium">
                Amount ($)
              </Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                className="border-emerald-300 focus:border-emerald-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="expense-category" className="text-emerald-700 font-medium">
                Category
              </Label>
              <select
                id="expense-category"
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full px-3 py-2 border border-emerald-300 rounded-md focus:outline-none focus:border-emerald-500"
              >
                <option value="groceries">Groceries</option>
                <option value="dining">Dining Out</option>
                <option value="snacks">Snacks & Drinks</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="expense-description" className="text-emerald-700 font-medium">
                Description
              </Label>
              <Input
                id="expense-description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="border-emerald-300 focus:border-emerald-500"
                placeholder="What did you buy?"
              />
            </div>
            <div>
              <Label htmlFor="expense-date" className="text-emerald-700 font-medium">
                Date
              </Label>
              <Input
                id="expense-date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                className="border-emerald-300 focus:border-emerald-500"
              />
            </div>
          </div>
          <Button 
            onClick={handleAddExpense}
            disabled={addExpenseMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {addExpenseMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add Expense
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Smart Insights */}
      <Card className="border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-emerald-800">
            <TrendingUp className="w-5 h-5" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {budgetStatus === 'over-budget' && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Budget Alert</p>
                <p className="text-sm text-red-600">
                  You're ${(currentSpending - expectedSpending).toFixed(2)} over your expected spending for this time of month.
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800">💡 Tip: Meal Planning</p>
              <p className="text-sm text-blue-600">
                Plan your meals weekly to save an average of 15% on grocery bills.
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800">🎯 Savings Goal</p>
              <p className="text-sm text-green-600">
                {remainingBudget >= savingsGoal 
                  ? `Great! You're on track to save $${savingsGoal} this month.`
                  : `You might fall short of your $${savingsGoal} savings goal. Consider reducing discretionary spending.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* iOS-Style Calculator Component */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-orange-800">
            <Calculator className="w-5 h-5" />
            Calculator
            <Button
              onClick={() => setShowCalculator(!showCalculator)}
              size="sm"
              className="ml-auto bg-orange-500 hover:bg-orange-600 text-white"
            >
              {showCalculator ? 'Hide' : 'Show'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showCalculator && (
          <CardContent className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              {/* iOS-style display */}
              <div className="text-right text-3xl font-light text-white bg-orange-800 p-4 rounded-lg mb-4 min-h-[60px] flex items-center justify-end">
                {calcDisplay}
              </div>
              
              {/* iOS-style button grid */}
              <div className="grid grid-cols-4 gap-3">
                {/* Top row */}
                <Button
                  onClick={() => handleCalcClear()}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-lg font-medium"
                >
                  C
                </Button>
                <Button
                  onClick={() => handleCalcOperation('/')}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-lg font-medium"
                >
                  ÷
                </Button>
                <Button
                  onClick={() => handleCalcOperation('*')}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-lg font-medium"
                >
                  ×
                </Button>
                <Button
                  onClick={() => handleCalcOperation('-')}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-lg font-medium"
                >
                  -
                </Button>
                
                {/* Number rows */}
                {[7, 8, 9].map(num => (
                  <Button
                    key={num}
                    onClick={() => handleCalcNumber(num.toString())}
                    className="bg-orange-200 hover:bg-orange-300 text-orange-800 h-12 rounded-lg font-medium text-lg"
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  onClick={() => handleCalcOperation('+')}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-lg font-medium row-span-2"
                >
                  +
                </Button>
                
                {[4, 5, 6].map(num => (
                  <Button
                    key={num}
                    onClick={() => handleCalcNumber(num.toString())}
                    className="bg-orange-200 hover:bg-orange-300 text-orange-800 h-12 rounded-lg font-medium text-lg"
                  >
                    {num}
                  </Button>
                ))}
                
                {[1, 2, 3].map(num => (
                  <Button
                    key={num}
                    onClick={() => handleCalcNumber(num.toString())}
                    className="bg-orange-200 hover:bg-orange-300 text-orange-800 h-12 rounded-lg font-medium text-lg"
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  onClick={() => handleCalcEquals()}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-lg font-medium row-span-2"
                >
                  =
                </Button>
                
                {/* Bottom row */}
                <Button
                  onClick={() => handleCalcNumber('.')}
                  className="bg-orange-200 hover:bg-orange-300 text-orange-800 h-12 rounded-lg font-medium text-lg"
                >
                  .
                </Button>
                <Button
                  onClick={() => handleCalcNumber('0')}
                  className="bg-orange-200 hover:bg-orange-300 text-orange-800 h-12 rounded-lg font-medium text-lg"
                >
                  0
                </Button>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button
                  onClick={() => handleUseInExpense()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
                  disabled={calcDisplay === '0' || calcDisplay === 'Error'}
                >
                  Use in Expense (${calcDisplay})
                </Button>
                <Button
                  onClick={() => handleUseInBudget()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                  disabled={calcDisplay === '0' || calcDisplay === 'Error'}
                >
                  Set as Budget (${calcDisplay})
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );

  // Calculator functions
  function handleCalcNumber(num: string) {
    if (calcWaitingForNumber) {
      setCalcDisplay(num);
      setCalcWaitingForNumber(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num);
    }
  }

  function handleCalcOperation(op: string) {
    const inputValue = parseFloat(calcDisplay);
    
    if (calcPrevious === null) {
      setCalcPrevious(inputValue);
    } else if (calcOperation) {
      const currentValue = calcPrevious || 0;
      const newValue = performCalculation(currentValue, inputValue, calcOperation);
      
      setCalcDisplay(String(newValue));
      setCalcPrevious(newValue);
    }
    
    setCalcWaitingForNumber(true);
    setCalcOperation(op);
  }

  function handleCalcEquals() {
    const inputValue = parseFloat(calcDisplay);
    
    if (calcPrevious !== null && calcOperation) {
      const newValue = performCalculation(calcPrevious, inputValue, calcOperation);
      setCalcDisplay(String(newValue));
      setCalcPrevious(null);
      setCalcOperation(null);
      setCalcWaitingForNumber(true);
    }
  }

  function handleCalcClear() {
    setCalcDisplay('0');
    setCalcPrevious(null);
    setCalcOperation(null);
    setCalcWaitingForNumber(false);
  }

  function performCalculation(prev: number, current: number, operation: string): number {
    switch (operation) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return current !== 0 ? prev / current : 0;
      default:
        return current;
    }
  }

  function handleUseInExpense() {
    const amount = parseFloat(calcDisplay);
    if (!isNaN(amount) && amount > 0) {
      setNewExpense({...newExpense, amount});
      toast({
        title: "Calculator Value Used",
        description: `$${amount.toFixed(2)} set as expense amount`,
        variant: "default",
      });
    }
  }

  function handleUseInBudget() {
    const amount = parseFloat(calcDisplay);
    if (!isNaN(amount) && amount > 0) {
      setMonthlyBudget(amount);
      toast({
        title: "Calculator Value Used", 
        description: `$${amount.toFixed(2)} set as monthly budget`,
        variant: "default",
      });
    }
  }
}