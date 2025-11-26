import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import MedicineCard from "@/components/medicine-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List,
  MapPin,
  AlertCircle,
  Package
} from "lucide-react";
import type { MedicineWithInventory, Category } from "@shared/schema";

export default function SearchPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    const category = urlParams.get('category');
    
    if (q) setSearchQuery(q);
    if (category) setSelectedCategory(category);
  }, [location]);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch medicines with search and filters
  const { data: medicines, isLoading, error } = useQuery<MedicineWithInventory[]>({
    queryKey: ['/api/medicines', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/medicines?${params}`);
      if (!response.ok) throw new Error('Failed to fetch medicines');
      return response.json();
    },
  });

  // Filter and sort medicines
  const filteredMedicines = medicines
    ?.filter(medicine => {
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const price = parseFloat(medicine.price);
      return price >= minPrice && price <= maxPrice;
    })
    ?.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'discount':
          aValue = a.discount || 0;
          bValue = b.discount || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    }) || [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    
    window.history.pushState({}, '', `/search?${params}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("name");
    setSortOrder("asc");
    window.history.pushState({}, '', '/search');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8" data-testid="search-header">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-search-title">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Medicines'}
              </h1>
              <p className="text-muted-foreground" data-testid="text-results-count">
                {filteredMedicines.length} medicines found
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-grid-view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-list-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search medicines, brands, or health conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 py-3"
                data-testid="input-medicine-search"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </div>
            <Button 
              onClick={handleSearch}
              className="px-8 py-3"
              data-testid="button-search-medicines"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1" data-testid="filters-sidebar">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center" data-testid="text-filters-title">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </h3>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-primary p-0"
                  data-testid="button-clear-filters"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div data-testid="filter-category">
                  <label className="text-sm font-medium mb-3 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div data-testid="filter-price">
                  <label className="text-sm font-medium mb-3 block">Price Range (₹)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      data-testid="input-price-min"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      data-testid="input-price-max"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div data-testid="filter-sort">
                  <label className="text-sm font-medium mb-3 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-testid="select-sort-by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="discount">Discount</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant={sortOrder === "asc" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOrder("asc")}
                      className="flex-1"
                      data-testid="button-sort-asc"
                    >
                      <SortAsc className="w-4 h-4 mr-1" />
                      Asc
                    </Button>
                    <Button
                      variant={sortOrder === "desc" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOrder("desc")}
                      className="flex-1"
                      data-testid="button-sort-desc"
                    >
                      <SortDesc className="w-4 h-4 mr-1" />
                      Desc
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3" data-testid="search-results">
            {/* Active Filters */}
            {(searchQuery || selectedCategory || priceRange.min || priceRange.max) && (
              <div className="mb-6" data-testid="active-filters">
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="px-3 py-1" data-testid="badge-search-query">
                      Search: {searchQuery}
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="px-3 py-1" data-testid="badge-category">
                      Category: {categories?.find(c => c.id === selectedCategory)?.name}
                      <button 
                        onClick={() => setSelectedCategory("")}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <Badge variant="secondary" className="px-3 py-1" data-testid="badge-price-range">
                      Price: ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                      <button 
                        onClick={() => setPriceRange({ min: "", max: "" })}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`} data-testid="loading-medicines">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12" data-testid="error-state">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't load the medicines. Please try again.
                </p>
                <Button onClick={() => window.location.reload()} data-testid="button-retry">
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredMedicines.length === 0 && (
              <div className="text-center py-12" data-testid="empty-state">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No medicines found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button onClick={clearFilters} data-testid="button-clear-all-filters">
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && !error && filteredMedicines.length > 0 && (
              <div 
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}
                data-testid="medicines-results"
              >
                {filteredMedicines.map((medicine) => (
                  <div key={medicine.id} className={viewMode === 'list' ? 'max-w-none' : ''}>
                    <MedicineCard medicine={medicine} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-40" data-testid="mobile-nav">
        <div className="flex items-center justify-around py-2">
          <a href="/" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-home">
            <Package className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
          <div className="flex flex-col items-center py-2 px-3 text-primary" data-testid="mobile-nav-search">
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </div>
          <a href="/dashboard" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-dashboard">
            <MapPin className="w-5 h-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
          <a href="#" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-cart">
            <Badge className="relative">
              <Package className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </Badge>
            <span className="text-xs mt-1">Cart</span>
          </a>
          <a href="#" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-more">
            <Filter className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </a>
        </div>
      </div>
    </div>
  );
}
