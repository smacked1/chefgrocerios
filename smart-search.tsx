import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { FadeIn, SlideIn } from "@/components/smooth-transitions";

interface SearchResult {
  id: string;
  title: string;
  type: 'recipe' | 'ingredient' | 'restaurant' | 'product';
  description: string;
  rating?: number;
  price?: number;
  category: string;
  trending?: boolean;
  image?: string;
}

interface SmartSearchProps {
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  types?: SearchResult['type'][];
}

export function SmartSearch({ 
  onSelect, 
  placeholder = "Search recipes, ingredients, restaurants...",
  types = ['recipe', 'ingredient', 'restaurant', 'product']
}: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Smart search with caching
  const { data: searchResults = [], isLoading } = useOptimizedQuery<SearchResult[]>({
    endpoint: '/api/search',
    params: { 
      q: debouncedQuery, 
      types: types.join(','),
      limit: 8 
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });

  // Trending searches
  const { data: trendingSearches = [] } = useOptimizedQuery<string[]>({
    endpoint: '/api/search/trending',
    staleTime: 30 * 60 * 1000, // 30 minutes for trending
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    // Update recent searches
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    setQuery(searchTerm);
    setShowResults(true);
  }, [recentSearches]);

  const handleResultSelect = useCallback((result: SearchResult) => {
    handleSearch(result.title);
    onSelect?.(result);
    setShowResults(false);
  }, [handleSearch, onSelect]);

  const getTypeIcon = (type: SearchResult['type']) => {
    const icons = {
      recipe: '🍳',
      ingredient: '🥬',
      restaurant: '🍽️',
      product: '🛒'
    };
    return icons[type] || '🔍';
  };

  const getTypeColor = (type: SearchResult['type']) => {
    const colors = {
      recipe: 'bg-orange-100 text-orange-700',
      ingredient: 'bg-green-100 text-green-700',
      restaurant: 'bg-purple-100 text-purple-700',
      product: 'bg-blue-100 text-blue-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const highlightedResults = useMemo(() => {
    if (!debouncedQuery) return searchResults;
    
    return searchResults.map(result => ({
      ...result,
      highlightedTitle: result.title.replace(
        new RegExp(`(${debouncedQuery})`, 'gi'),
        '<mark class="bg-yellow-200">$1</mark>'
      )
    }));
  }, [searchResults, debouncedQuery]);

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <FadeIn className="absolute top-full left-0 right-0 mt-2 z-50">
          <Card className="shadow-xl border-2 max-h-96 overflow-y-auto">
            <CardContent className="p-0">
              {/* Search Results */}
              {debouncedQuery.length >= 2 && (
                <>
                  {isLoading ? (
                    <div className="p-4">
                      <LoadingSkeleton type="list" count={3} />
                    </div>
                  ) : highlightedResults.length > 0 ? (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-2">
                        Search Results ({highlightedResults.length})
                      </div>
                      {highlightedResults.map((result, index) => (
                        <SlideIn
                          key={result.id}
                          delay={index * 0.05}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          onClick={() => handleResultSelect(result)}
                        >
                          <div className="text-2xl">{getTypeIcon(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div 
                                className="font-medium text-gray-900"
                                dangerouslySetInnerHTML={{ __html: result.highlightedTitle || result.title }}
                              />
                              {result.trending && (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                              {result.rating && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {result.rating}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {result.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)}`}>
                                {result.type}
                              </Badge>
                              {result.price && (
                                <span className="text-xs font-medium text-green-600">
                                  ${result.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </SlideIn>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{debouncedQuery}"
                    </div>
                  )}
                </>
              )}

              {/* Recent Searches */}
              {debouncedQuery.length < 2 && recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <div
                      key={search}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleSearch(search)}
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{search}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {debouncedQuery.length < 2 && trendingSearches.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Trending Now
                  </div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {trendingSearches.slice(0, 6).map((trend) => (
                      <Badge
                        key={trend}
                        variant="secondary"
                        className="cursor-pointer hover:bg-orange-100 hover:text-orange-700"
                        onClick={() => handleSearch(trend)}
                      >
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Backdrop to close results */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}