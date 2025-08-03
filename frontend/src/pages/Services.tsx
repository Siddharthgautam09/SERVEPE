import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Star, Clock, DollarSign, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';
import { serviceAPI } from '@/api/services';
import { categoryAPI } from '@/api/categories';
import ServiceCard from '@/components/ServiceCard';
import { Service } from '@/types/service';

interface FilterState {
  category: string;
  subcategory: string;
  minPrice: number;
  maxPrice: number;
  deliveryTime: string;
  rating: string;
  talentLevel: string[];
  searchQuery: string;
  sortBy: string;
}

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    subcategory: '',
    minPrice: 0,
    maxPrice: 10000,
    deliveryTime: '',
    rating: '',
    talentLevel: [],
    searchQuery: '',
    sortBy: 'newest'
  });

  // Applied filters count
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filters.searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      searchQuery: debouncedSearchQuery
    }));
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchServices();
  }, [filters.category, filters.subcategory, filters.minPrice, filters.maxPrice, filters.deliveryTime, filters.rating, filters.talentLevel, filters.sortBy, debouncedSearchQuery]);

  useEffect(() => {
    // Calculate applied filters count
    let count = 0;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 10000) count++;
    if (filters.deliveryTime) count++;
    if (filters.rating) count++;
    if (filters.talentLevel.length > 0) count++;
    if (filters.searchQuery) count++;
    if (filters.sortBy !== 'newest') count++;
    
    setAppliedFiltersCount(count);
  }, [filters]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryAPI.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setSearchLoading(true);
      const params: any = {};
      
      // Map filters to API parameters
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.subcategory && filters.subcategory !== 'all') {
        params.subcategory = filters.subcategory;
      }
      if (filters.minPrice > 0) {
        params.minPrice = filters.minPrice;
      }
      if (filters.maxPrice < 10000) {
        params.maxPrice = filters.maxPrice;
      }
      if (filters.deliveryTime && filters.deliveryTime !== 'all') {
        params.deliveryTime = filters.deliveryTime;
      }
      if (filters.rating && filters.rating !== 'all') {
        params.rating = filters.rating;
      }
      if (filters.searchQuery) {
        params.search = filters.searchQuery;
      }
      
      // Send talent level as array
      if (filters.talentLevel.length > 0) {
        params.talentLevel = filters.talentLevel;
      }
      
      // Map sort options
      switch (filters.sortBy) {
        case 'newest':
          params.sortBy = 'createdAt';
          params.sortOrder = 'desc';
          break;
        case 'oldest':
          params.sortBy = 'createdAt';
          params.sortOrder = 'asc';
          break;
        case 'price-low':
          params.sortBy = 'pricingPlans.basic.price';
          params.sortOrder = 'asc';
          break;
        case 'price-high':
          params.sortBy = 'pricingPlans.basic.price';
          params.sortOrder = 'desc';
          break;
        case 'rating':
          params.sortBy = 'averageRating';
          params.sortOrder = 'desc';
          break;
        default:
          params.sortBy = 'createdAt';
          params.sortOrder = 'desc';
      }

      console.log('Fetching services with params:', params);
      const response = await serviceAPI.getAllServices(params);
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [filters.category, filters.subcategory, filters.minPrice, filters.maxPrice, filters.deliveryTime, filters.rating, filters.talentLevel, filters.sortBy, debouncedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryClick = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const handleTalentLevelToggle = (level: string) => {
    setFilters(prev => ({
      ...prev,
      talentLevel: prev.talentLevel.includes(level)
        ? prev.talentLevel.filter(l => l !== level)
        : [...prev.talentLevel, level]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      minPrice: 0,
      maxPrice: 10000,
      deliveryTime: '',
      rating: '',
      talentLevel: [],
      searchQuery: '',
      sortBy: 'newest'
    });
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  // Get unique categories from services for category chips
  const getUniqueCategories = () => {
    const categorySet = new Set<string>();
    services.forEach(service => {
      if (service.category) {
        categorySet.add(service.category);
      }
    });
    return Array.from(categorySet);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <header className="bg-white py-4 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo-2.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl text-gray-800">SERVPE</span>
          </div>
          <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-lg mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for services..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500 w-full pr-10"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                </div>
              )}
            </div>
            <Button type="submit" className="ml-2">
              <Search className="w-4 h-4" />
            </Button>
          </form>
          <div className="flex items-center gap-2">
            {/* User avatar/menu if needed */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 max-w-xs mb-8 md:mb-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">All Filters</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600 font-semibold">
                  Applied ({appliedFiltersCount})
                </span>
                {appliedFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', Number(e.target.value) || 0)}
                    className="text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value) || 10000)}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">₹{filters.minPrice}</span>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={100}
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-xs text-gray-500">₹{filters.maxPrice}</span>
                </div>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
              <Select
                value={filters.deliveryTime}
                onValueChange={(value) => handleFilterChange('deliveryTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
              <Select
                value={filters.rating}
                onValueChange={(value) => handleFilterChange('rating', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any rating</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="4.0">4.0+ stars</SelectItem>
                  <SelectItem value="3.5">3.5+ stars</SelectItem>
                  <SelectItem value="3.0">3.0+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Talent Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Talent Level</label>
              <div className="flex flex-col gap-2">
                {[
                  'Fresher Freelancer',
                  'Verified Freelancer', 
                  'Top Rated Freelancer',
                  'Pro Talent'
                ].map((level) => (
                  <label key={level} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.talentLevel.includes(level)}
                      onChange={() => handleTalentLevelToggle(level)}
                      className="accent-blue-500"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Category Chips */}
          <div className="bg-[#FFF6F2] py-3 px-4 mb-6 overflow-x-auto rounded-xl">
            <div className="flex gap-3 w-max">
              <Button
                variant={filters.category === '' ? "default" : "outline"}
                className="rounded-full px-6 py-2 font-medium"
                onClick={() => handleCategoryClick('')}
              >
                All Categories
              </Button>
              {getUniqueCategories().map((category) => (
                <Button
                  key={category}
                  variant={filters.category === category ? "default" : "outline"}
                  className="rounded-full px-6 py-2 font-medium"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {filters.searchQuery ? `Search results for "${filters.searchQuery}"` : 'All Services'}
              </h2>
              {appliedFiltersCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {appliedFiltersCount} filter{appliedFiltersCount !== 1 ? 's' : ''} applied
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-600">
                {services.length} service{services.length !== 1 ? 's' : ''} found
              </p>
              {appliedFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-red-500 mt-1"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Services Grid */}
          {loading || searchLoading ? (
            <div className="text-center text-gray-500 py-16">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-purple-600 mx-auto mb-6"></div>
              <p className="text-lg font-semibold">
                {loading ? "Loading services..." : "Searching services..."}
              </p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-xl font-semibold">No services found</p>
              <p className="text-gray-400 text-base mt-2">
                {appliedFiltersCount > 0 
                  ? "Try adjusting your filters or search terms." 
                  : "No services are available at the moment."
                }
              </p>
              {appliedFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map(service => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onClick={handleServiceClick}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Services;