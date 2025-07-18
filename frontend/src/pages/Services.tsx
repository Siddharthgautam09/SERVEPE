import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';
import { serviceAPI } from '@/api/services';
import { categoryAPI } from '@/api/categories';
import SidebarLayout from '@/components/SidebarLayout';
import { Service } from '@/types/service';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, priceRange, deliveryTime, sortBy, searchQuery]);

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

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (priceRange && priceRange !== 'all') {
        params.append('priceRange', priceRange);
      }
      if (deliveryTime && deliveryTime !== 'all') {
        params.append('deliveryTime', deliveryTime);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sort', sortBy);

      const response = await serviceAPI.getAllServices(Object.fromEntries(params));
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <SidebarLayout>
      {/* Header Section */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-16 shadow-md rounded-b-3xl mb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-white mr-2" />
            <h1 className="text-5xl font-extrabold text-white tracking-tight">Browse Services</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-2xl">Find the perfect service for your needs, delivered by top freelancers.</p>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <section className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/4 mb-8 lg:mb-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select onValueChange={setSelectedCategory} disabled={loadingCategories}>
                  <SelectTrigger className="w-full rounded-lg border-gray-300">
                    <SelectValue placeholder={loadingCategories ? 'Loading...' : 'All Categories'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <Select onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full rounded-lg border-gray-300">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-1000">₹0 - ₹1,000</SelectItem>
                    <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                    <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                    <SelectItem value="10000+">₹10,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                <Select onValueChange={setDeliveryTime}>
                  <SelectTrigger className="w-full rounded-lg border-gray-300">
                    <SelectValue placeholder="Delivery Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">Up to 3 Days</SelectItem>
                    <SelectItem value="7">Up to 1 Week</SelectItem>
                    <SelectItem value="14">Up to 2 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <Select onValueChange={setSortBy}>
                  <SelectTrigger className="w-full rounded-lg border-gray-300">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Services Content */}
        <main className="flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-lg">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </form>

          {/* Services Grid */}
          {loading ? (
            <div className="text-center text-gray-500 py-16">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-purple-600 mx-auto mb-6"></div>
              <p className="text-lg font-semibold">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-xl font-semibold">No services found</p>
              <p className="text-gray-400 text-base mt-2">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {services.map(service => (
                <Card 
                  key={service._id} 
                  className="bg-white hover:shadow-2xl transition-shadow duration-300 border-0 rounded-3xl cursor-pointer overflow-hidden group p-6 flex flex-col justify-between min-h-[420px]"
                  onClick={() => handleServiceClick(service._id)}
                >
                  <CardHeader className="pb-4">
                    {service.images && service.images.length > 0 && (
                      <div className="w-full h-52 bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                        <img 
                          src={service.images.find(img => img.isPrimary)?.url || service.images[0]?.url} 
                          alt={service.images.find(img => img.isPrimary)?.alt || service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full shadow">
                          {service.category}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {service.freelancer.profilePicture ? (
                          <img 
                            src={service.freelancer.profilePicture} 
                            alt={`${service.freelancer.firstName} ${service.freelancer.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          `${service.freelancer.firstName?.[0]}${service.freelancer.lastName?.[0]}`
                        )}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {service.freelancer.firstName} {service.freelancer.lastName}
                        </p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">
                            {service.averageRating?.toFixed(1) || '0.0'} ({service.totalReviews || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 mt-2">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                    <CardDescription className="text-gray-600 mb-4 line-clamp-3 text-base">
                      {service.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.subcategory && (
                        <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                          {service.subcategory}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-purple-400" />
                        {service.pricingPlans.basic.deliveryTime} day{service.pricingPlans.basic.deliveryTime !== 1 ? 's' : ''} delivery
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-2xl font-bold text-purple-700">
                        <DollarSign className="w-5 h-5 mr-1" />
                        {formatCurrency(service.pricingPlans.basic.price)}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-6 rounded-full shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(service._id);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </section>
    </SidebarLayout>
  );
};

export default Services;