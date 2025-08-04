import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { serviceAPI } from '@/api/services';
import { categoryAPI } from '@/api/categories';
import ServiceCard from '@/components/ServiceCard';
import { Service } from '@/types/service';

// Header/Index-specific imports
import servpeLogo from "@/images/img_servpe_logo_black_txt_1.png";
import profileImage from "@/images/img_profile_image_1.png";
import arrowDown from "@/images/img_arrowdown.svg";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth?.() || {};
  // Header/search-specific state like Index
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Services filter state
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

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Applied filters count
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  // For search debounce
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Sync search bar with filters.searchQuery
  useEffect(() => { setSearchQuery(filters.searchQuery); }, [filters.searchQuery]);
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      searchQuery
    }));
  }, [searchQuery]);

  // Show login popup for non-auth user
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) setShowLoginPopup(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [user]);
  const handleCloseLoginPopup = () => { setShowLoginPopup(false); };

  // Search bar handlers
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery !== filters.searchQuery) {
      setFilters(prev => ({ ...prev, searchQuery }));
    }
  };
  const handleMainSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Header / nav handlers
  const handleLogoClick = () => {
    if (user) {
      if (user.role === 'client') navigate('/client-dashboard');
      else if (user.role === 'freelancer') navigate('/freelancer-dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/role-selection');
    } else {
      navigate('/email-otp-login');
    }
  };
  const handleNavigation = (path) => navigate(path);
  const handleCategoryClick = (category) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };
  const handleUserProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/email-otp-login');
    }
  };
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(prev => !prev);
    if (!mobileMenuOpen) setMobileSearchOpen(false);
  };
  const handleMobileSearchToggle = () => {
    setMobileSearchOpen(prev => !prev);
    if (!mobileSearchOpen) setMobileMenuOpen(false);
  };

  // Category/Filter logic
  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filters.searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      searchQuery: debouncedSearchQuery
    }));
  }, [debouncedSearchQuery]);
  useEffect(() => { fetchServices(); }, [
    filters.category, filters.subcategory, filters.minPrice, filters.maxPrice,
    filters.deliveryTime, filters.rating, filters.talentLevel, filters.sortBy, debouncedSearchQuery
  ]);
  useEffect(() => {
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
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.subcategory && filters.subcategory !== 'all') params.subcategory = filters.subcategory;
      if (filters.minPrice > 0) params.minPrice = filters.minPrice;
      if (filters.maxPrice < 10000) params.maxPrice = filters.maxPrice;
      if (filters.deliveryTime && filters.deliveryTime !== 'all') params.deliveryTime = filters.deliveryTime;
      if (filters.rating && filters.rating !== 'all') params.rating = filters.rating;
      if (filters.searchQuery) params.search = filters.searchQuery;
      if (filters.talentLevel.length > 0) params.talentLevel = filters.talentLevel;
      switch (filters.sortBy) {
        case 'newest': params.sortBy = 'createdAt'; params.sortOrder = 'desc'; break;
        case 'oldest': params.sortBy = 'createdAt'; params.sortOrder = 'asc'; break;
        case 'price-low': params.sortBy = 'pricingPlans.basic.price'; params.sortOrder = 'asc'; break;
        case 'price-high': params.sortBy = 'pricingPlans.basic.price'; params.sortOrder = 'desc'; break;
        case 'rating': params.sortBy = 'averageRating'; params.sortOrder = 'desc'; break;
        default: params.sortBy = 'createdAt'; params.sortOrder = 'desc'; break;
      }
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
  }, [
    filters.category, filters.subcategory, filters.minPrice, filters.maxPrice,
    filters.deliveryTime, filters.rating, filters.talentLevel, filters.sortBy, debouncedSearchQuery
  ]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
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
  const getUniqueCategories = () => {
    const categorySet = new Set<string>();
    services.forEach(service => {
      if (service.category) {
        categorySet.add(service.category);
      }
    });
    return Array.from(categorySet);
  };

  // ====== Render ======
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <header className="bg-white w-full shadow-sm">
        <div className="w-full flex items-center h-[80px] px-4 md:px-6 lg:px-8 max-w-[1400px] mx-auto">
          {/* Logo and Search Container */}
          <div className="flex items-center flex-1 space-x-4 md:space-x-6 lg:space-x-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button onClick={handleLogoClick} className="focus:outline-none">
                <img
                  src={servpeLogo}
                  alt="Servpe Logo"
                  className="h-[28px] w-[140px] sm:h-[32px] sm:w-[160px] md:h-[36px] md:w-[180px] lg:h-[40px] lg:w-[200px] xl:h-[45px] xl:w-[260px] cursor-pointer hover:opacity-80 transition-opacity"
                />
              </button>
            </div>
            {/* Search Bar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex flex-1 max-w-[280px] lg:max-w-[320px] xl:max-w-[400px]">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search for services..."
                    className="w-full h-9 md:h-10 lg:h-11 bg-gray-50 rounded-full pl-0.5 pr-12 md:pl-1 md:pr-14 lg:pl-2 lg:pr-16 text-[14px] md:text-[15px] lg:text-[16px] xl:text-[18px] text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400 placeholder:text-[12px] md:placeholder:text-[13px] lg:placeholder:text-[14px]"
                    value={searchQuery}
                    onChange={handleMainSearch}
                    aria-label="Search for services"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button type="submit" className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-400" />
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Navigation Links & User */}
          <nav className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6" role="navigation">
            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-3">
              <button onClick={() => handleNavigation('/find-freelancers')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Find Talents</button>
              <button onClick={() => handleNavigation('/services')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Services</button>
              <button onClick={() => handleNavigation('/how-it-works')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">How it Works</button>
              <button onClick={() => handleNavigation('/ai-matching')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">AI Matching</button>
              <button onClick={() => handleNavigation('/book-call')} className="text-[14px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-2">Book a call</button>
            </div>
            {/* Tablet Navigation */}
            <div className="hidden lg:flex xl:hidden items-center space-x-2">
              <button onClick={() => handleNavigation('/find-freelancers')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">Find Talents</button>
              <button onClick={() => handleNavigation('/services')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">Services</button>
              <button onClick={() => handleNavigation('/ai-matching')} className="text-[13px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap px-1">AI Matching</button>
            </div>
            {/* Medium Screen Navigation */}
            <div className="hidden md:flex lg:hidden items-center space-x-2">
              <button onClick={() => handleNavigation('/find-freelancers')} className="text-[12px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap">Find</button>
              <button onClick={() => handleNavigation('/services')} className="text-[12px] text-[#696D75] font-medium hover:text-black transition-colors whitespace-nowrap">Services</button>
            </div>
            {/* Mobile Search Button */}
            <button className="md:hidden p-1.5 text-gray-600 hover:text-black transition-colors" onClick={handleMobileSearchToggle}>
              <Search className="h-5 w-5" />
            </button>
            {/* User Profile */}
            {user ? (
              <UserMenu />
            ) : (
              <button onClick={handleUserProfileClick} className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
                <div className="relative">
                  <img src={profileImage} alt="User Avatar" className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="hidden sm:block text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] text-[#696D75] font-medium">Login</span>
                <img src={arrowDown} alt="Dropdown" className="hidden sm:block w-2 h-1.5 md:w-2.5 md:h-2 lg:w-3 lg:h-2" />
              </button>
            )}
            {/* Mobile Menu Button (Hamburger) */}
            <button
              className="lg:hidden p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0"
              onClick={handleMobileMenuToggle}
              aria-label="Open menu"
            >
              <span className="relative w-5 h-5 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-4 bg-gray-700 rounded transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                <span className={`block h-0.5 w-4 bg-gray-700 rounded my-0.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-4 bg-gray-700 rounded transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
              </span>
            </button>
          </nav>
        </div>
        {/* Mobile Search Bar */}
        <div className={`md:hidden px-4 pb-3 border-b border-gray-100 ${mobileSearchOpen ? 'block' : 'hidden'}`}>
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="search"
                placeholder="Search for services..."
                className="w-full h-10 bg-gray-50 rounded-full px-6 text-[15px] text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400 placeholder:text-[13px]"
                value={searchQuery}
                onChange={handleMainSearch}
                aria-label="Search for services"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </form>
        </div>
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={handleMobileMenuToggle}>
            <div className="absolute top-0 right-0 w-72 sm:w-80 h-full bg-white shadow-lg transform transition-transform duration-300">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold">Menu</h2>
                  <button onClick={handleMobileMenuToggle} className="p-2 rounded-full hover:bg-gray-100">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="space-y-3 sm:space-y-4">
                  <button onClick={() => { handleNavigation('/find-freelancers'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">Find Talents</button>
                  <button onClick={() => { handleNavigation('/services'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">Services</button>
                  <button onClick={() => { handleNavigation('/how-it-works'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">How it Works</button>
                  <button onClick={() => { handleNavigation('/ai-matching'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">AI Matching</button>
                  <button onClick={() => { handleNavigation('/book-call'); handleMobileMenuToggle(); }} className="block w-full text-left text-base sm:text-lg text-gray-700 hover:text-black py-2 sm:py-3 border-b border-gray-100">Book a call</button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---------- FULL WIDTH CATEGORY CHIPS BAR -------------- */}
      <div className="max-w-center bg-[#FFF6F2] rounded-2xl mx-6 my-4 shadow-inner">
  <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
    <div className="flex gap-3 overflow-x-auto py-4 rounded-xl">
      {/* Category buttons */}
      <Button
        variant={filters.category === '' ? "default" : "outline"}
        className="rounded-[10px] px-6 py-2 font-medium whitespace-nowrap"
        onClick={() => handleCategoryClick('')}
      >
        All Categories  
      </Button>
      {getUniqueCategories().map((category) => (
        <Button
          key={category}
          variant={filters.category === category ? "default" : "outline"}
          className="rounded-[10px] px-6 py-2 font-medium whitespace-nowrap"
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  </div>
</div>

      {/* ------------------------------------------------------ */}

      {/* Main section with filters/sidebar and main content */}
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8 ">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 max-w-xs mb-8 md:mb-0">
          <div className="rounded-2xl shadow-lg p-6 sticky top-8 bg-[#f3fafe]">
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
            <div className="border-t border-gray-300 mb-4" />
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
